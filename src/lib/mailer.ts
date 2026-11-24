import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/content/site";
import { formatPhone, patientLabels, type AppointmentRequest } from "@/lib/appointment-request";

/**
 * SMTP email for the website forms. Settings come from environment variables (see .env.example);
 * nothing secret is in the code. While any required setting is missing, isMailConfigured() is false
 * and the form tells visitors to call instead, so the site never claims to have sent something it
 * did not.
 *
 * HIPAA: an appointment request (a name with a reason for visit) is protected health information.
 * Send it only through an email provider that has signed a Business Associate Agreement with the
 * practice (for example Google Workspace or Microsoft 365 with a BAA, or a HIPAA email service).
 * The connection is always encrypted (TLS 1.2+), and the subject line carries no patient details.
 */

function settings() {
  const env = process.env;
  const port = Number(env.SMTP_PORT || 587);
  return {
    host: env.SMTP_HOST?.trim(),
    port,
    // port 465 uses TLS from the start; 587 upgrades with STARTTLS (required below)
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465,
    user: env.SMTP_USER?.trim(),
    pass: env.SMTP_PASS,
    from: env.MAIL_FROM?.trim(),
    to: (env.MAIL_TO ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
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

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const pageNames: Record<AppointmentRequest["formId"], string> = {
  "appointment-form": "Scheduling page",
  "contact-form": "Contact page",
};

export async function sendAppointmentEmail(r: AppointmentRequest) {
  const s = settings();
  const received = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "full",
    timeStyle: "short",
  });
  const rows: [string, string][] = [
    ["Patient", patientLabels[r.patient]],
    ["Name", r.name],
    ["Phone", formatPhone(r.phone)],
    ["Email", r.email],
    ["Preferred day", r.preferredDay],
    ["Reason for visit", r.services.join(", ")],
    ["Message", r.message || "(none)"],
    ["Sent from", `${pageNames[r.formId]}, ${site.url}`],
    ["Received", `${received} (Eastern)`],
  ];

  const text = [
    "New appointment request from the website.",
    "Please call the patient back to confirm a time.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#10242b">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #dde7ea">
<tr><td style="padding:24px 28px 8px"><h1 style="margin:0;font-size:20px">New appointment request</h1>
<p style="margin:8px 0 0;font-size:15px;color:#3d5560">Please call the patient back to confirm a time.</p></td></tr>
<tr><td style="padding:16px 28px 28px"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:15px;border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><th align="left" valign="top" style="padding:10px 16px 10px 0;border-top:1px solid #eef3f5;width:150px;color:#3d5560;font-weight:600">${escapeHtml(k)}</th><td style="padding:10px 0;border-top:1px solid #eef3f5;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
</table></td></tr></table></body></html>`;

  await getTransport().sendMail({
    from: s.from,
    to: s.to,
    // reply goes straight to the patient; nodemailer encodes the name safely
    replyTo: { name: r.name, address: r.email },
    // no patient details in the subject: it shows in inbox lists and notifications
    subject: `New appointment request (${pageNames[r.formId]})`,
    text,
    html,
    headers: { "X-Form-Id": r.formId },
  });
}
