import "server-only";
import { randomInt } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/content/site";
import type { AppointmentRequest } from "@/lib/appointment-request";
import { EMAIL_LOGO } from "@/lib/email/logo";
import { officeEmail, patientEmail, type EmailContent } from "@/lib/email/templates";

/**
 * SMTP email for the website forms. Settings come from environment variables (see .env.example);
 * nothing secret is in the code. While any required setting is missing, isMailConfigured() is false
 * and the form tells visitors to call instead, so the site never claims to have sent something it
 * did not.
 *
 * Each request sends two emails (designs in src/lib/email/templates.ts):
 *   1. to the practice (MAIL_TO), with Reply-To set to the patient. This one must succeed.
 *   2. a confirmation to the patient, unless MAIL_CONFIRMATION=false. Sent after the form has
 *      answered, and a failure there never turns a sent request into an error.
 *
 * HIPAA: an appointment request (a name with a reason for visit) is protected health information.
 * Send it only through an email provider that has signed a Business Associate Agreement with the
 * practice (for example Google Workspace or Microsoft 365 with a BAA, or a HIPAA email service).
 * The connection is always encrypted (TLS 1.2+), and subject lines carry no patient details.
 */

function settings() {
  const env = process.env;
  const port = Number(env.SMTP_PORT || 587);
  const from = env.MAIL_FROM?.trim();
  return {
    host: env.SMTP_HOST?.trim(),
    port,
    // port 465 uses TLS from the start; 587 upgrades with STARTTLS (required below)
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465,
    user: env.SMTP_USER?.trim(),
    // Google shows App Passwords in groups of four ("abcd efgh ..."); the spaces are not part of it
    pass: env.SMTP_PASS?.replace(/\s/g, ""),
    from,
    /** the bare address in MAIL_FROM ("Name <a@b.com>" -> "a@b.com") */
    fromAddress: from?.match(/<([^>]+)>/)?.[1] ?? from,
    to: (env.MAIL_TO ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    confirmation: !/^(false|off|no|0)$/i.test(env.MAIL_CONFIRMATION?.trim() ?? ""),
  };
}

export function isMailConfigured() {
  const s = settings();
  return Boolean(s.host && s.user && s.pass && s.from && s.to.length);
}

let transport: Transporter | null = null;
function getTransport() {
  if (transport) return transport;
  const s = settings();
  transport = nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.secure,
    requireTLS: !s.secure, // never fall back to an unencrypted connection
    auth: { user: s.user, pass: s.pass },
    tls: { minVersion: "TLSv1.2" },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

/** Short request reference, e.g. "MBS-7K2QXP" (no 0/O or 1/I/L, so it reads clearly over the phone). */
function newRef() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return `MBS-${Array.from({ length: 6 }, () => abc[randomInt(abc.length)]).join("")}`;
}

/** The logo travels inside the email (see src/lib/email/logo.ts). */
const logoAttachment = () => ({
  filename: "media-brite-smile.png",
  content: Buffer.from(EMAIL_LOGO.base64, "base64"),
  contentType: "image/png",
  cid: EMAIL_LOGO.cid,
  contentDisposition: "inline" as const,
});

const message = (m: EmailContent) => ({
  subject: m.subject,
  text: m.text,
  html: m.html,
  attachments: [logoAttachment()],
});

/** Sends the request to the practice. Returns what the patient confirmation needs. */
export async function sendAppointmentEmail(r: AppointmentRequest) {
  const s = settings();
  const ctx = { ref: newRef(), received: new Date(), logoSrc: `cid:${EMAIL_LOGO.cid}` };
  await getTransport().sendMail({
    from: s.from,
    to: s.to,
    // reply goes straight to the patient; nodemailer encodes the name safely
    replyTo: { name: r.name, address: r.email },
    ...message(officeEmail(r, ctx)),
    headers: { "X-Form-Id": r.formId, "X-Request-Ref": ctx.ref },
  });
  return ctx;
}

export const isConfirmationOn = () => settings().confirmation;

/** "We have your request" email to the patient. Replies go to the practice inbox. */
export async function sendPatientConfirmation(
  r: AppointmentRequest,
  ctx: Awaited<ReturnType<typeof sendAppointmentEmail>>,
) {
  const s = settings();
  await getTransport().sendMail({
    from: { name: site.name, address: s.fromAddress! },
    to: { name: r.name, address: r.email },
    replyTo: s.fromAddress,
    ...message(patientEmail(r, ctx)),
    headers: {
      // an automatic message: tells vacation responders not to answer it
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
      "X-Request-Ref": ctx.ref,
    },
  });
}
