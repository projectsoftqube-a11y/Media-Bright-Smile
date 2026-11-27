import { site } from "@/content/site";
import { formatPhone, patientLabels, type AppointmentRequest, type FormId } from "@/lib/appointment-request";

/* ---------------------------------------------------------------------------
   Email templates for the appointment request form (Scheduling page and Contact page).

   1. officeEmail:   the request, sent to the practice inbox (MAIL_TO). Reply goes to the patient.
   2. patientEmail:  a short "we have your request" note, sent to the patient.

   Email HTML is not web HTML: tables for layout, inline styles, no CSS variables, flex, grid or SVG.
   Every layout works without the <style> block (some apps drop it); the media query only
   tightens padding and stacks the buttons and detail rows on phones. The Outlook-only comments
   (<!--[if mso]>) give old Outlook a fixed 600 px column, since it ignores max-width.

   Privacy: subject lines and the inbox preview text carry no names, contact details or reasons.
   The patient email repeats only what the patient needs to spot a typo (their phone number); it
   never repeats the reason for the visit or the message.
--------------------------------------------------------------------------- */

export type EmailContent = { subject: string; html: string; text: string };

export type EmailContext = {
  /** Short reference shared by both emails, e.g. "MBS-7K2QXP". Also keeps Gmail from threading
      every request into one conversation (it groups identical subject lines). */
  ref: string;
  received: Date;
  /** "cid:..." when sending; a data: URL in the preview */
  logoSrc: string;
};

/* Brand tokens from src/app/globals.css, as plain hex (email apps do not read CSS variables). */
const C = {
  brand50: "#ebf8fc",
  brand100: "#cfeff8",
  brand300: "#67cbe8",
  brand500: "#009ecb",
  brand600: "#00769b",
  brand700: "#046a8a",
  brand800: "#0b5670",
  ink: "#0c1b22",
  body: "#4a5458",
  muted: "#5f6b70",
  pearl: "#f6fafb",
  mist: "#eaf4f7",
  line: "#dde7eb",
  white: "#ffffff",
  warn50: "#fff7e8",
  warn300: "#f1c46f",
  warn800: "#6f3f00",
} as const;

const FONT = "'Plus Jakarta Sans',Arial,Helvetica,sans-serif";
const font = (weight: number, size: number, line: number) =>
  `font-family:${FONT};font-weight:${weight};font-size:${size}px;line-height:${line}px`;

/** Where each form sits on the site. */
const sources: Record<FormId, { label: string; path: string }> = {
  "appointment-form": { label: "Scheduling page", path: site.bookingHref },
  "contact-form": { label: "Contact page", path: "/contact-us" },
};

const EMERGENCY = "Emergency Visit";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Escapes text and keeps the line breaks (old Outlook ignores white-space: pre-wrap). */
const escLines = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

const firstName = (name: string) => name.split(" ")[0];
/** "New Patient" -> "New patient" for use inside a sentence or badge. */
const patientKind = (r: AppointmentRequest) => patientLabels[r.patient].replace(/ P/, " p");
const telHref = (digits: string) => `tel:+1${digits}`;
const url = (path = "") => `${site.url}${path}`;

const receivedAt = (d: Date) =>
  d.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" });

/** Office hours as grouped rows: consecutive days with the same hours share a row
    ("Monday – Thursday" in the text version, "Mon – Thu" in the narrow HTML column). */
function hourRows() {
  const rows: { days: string; short: string; time: string }[] = [];
  let start = 0;
  const label = (h: (typeof site.hours)[number]) => (h.closed ? "Closed" : `${h.open} – ${h.close}`);
  site.hours.forEach((h, i) => {
    const next = site.hours[i + 1];
    if (next && label(next) === label(h)) return;
    const first = site.hours[start];
    const single = i === start;
    rows.push({
      days: single ? h.day : `${first.day} – ${h.day}`,
      short: single ? h.short : `${first.short} – ${h.short}`,
      time: label(h),
    });
    start = i + 1;
  });
  return rows;
}

/* ---------- building blocks ---------- */

/** A link styled as a button. Padding on the <a> makes the whole button clickable; old Outlook
    ignores it but still shows the cell colour, so the button stays visible there. */
function button(href: string, label: string, kind: "solid" | "outline" = "solid") {
  const solid = kind === "solid";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td bgcolor="${solid ? C.brand600 : C.white}" style="border-radius:10px;${solid ? "" : `border:2px solid ${C.brand600};`}">
<a href="${esc(href)}" style="display:inline-block;padding:${solid ? "14px 24px" : "12px 22px"};${font(700, 16, 20)};color:${solid ? C.white : C.brand700};text-decoration:none;border-radius:10px">${esc(label)}</a>
</td></tr></table>`;
}

const eyebrow = (text: string) =>
  `<div style="${font(700, 13, 18)};letter-spacing:0.08em;text-transform:uppercase;color:${C.muted}">${esc(text)}</div>`;

const chip = (text: string, tone: "soft" | "solid" = "soft") =>
  `<span style="display:inline-block;padding:6px 12px;border-radius:999px;${font(700, 13, 18)};${
    tone === "solid"
      ? `background:${C.brand600};color:${C.white}`
      : `background:${C.brand50};color:${C.brand800};border:1px solid ${C.brand100}`
  }">${esc(text)}</span>`;

/** One padded row inside the card. */
const row = (inner: string, pad = "24px 40px 0") => `<tr><td class="px" style="padding:${pad}">${inner}</td></tr>`;

function header(logoSrc: string, note: string) {
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="stack" valign="middle"><a href="${url()}"><img src="${logoSrc}" width="200" height="68" alt="${esc(site.name)}" style="display:block;width:200px;max-width:100%;height:auto;border:0"></a></td>
<td class="stack stack-gap" align="right" valign="middle" style="${font(600, 14, 20)};color:${C.muted}">${note}</td>
</tr></table>`,
    "28px 40px 4px",
  );
}

function shell({ title, preheader, rows, after }: { title: string; preheader: string; rows: string; after: string }) {
  // filler after the preheader stops apps pulling body text into the inbox preview
  const filler = "&#847;&zwnj;&nbsp;".repeat(60);
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{color-scheme:light only;supported-color-schemes:light only}
body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
@media (max-width:620px){
  .outer{padding:16px 8px!important}
  .px{padding-left:20px!important;padding-right:20px!important}
  .h1{font-size:25px!important;line-height:32px!important}
  .stack{display:block!important;width:100%!important;text-align:left!important}
  .stack-gap{padding-top:12px!important}
  .btn{display:block!important;width:100%!important;padding:0 0 10px!important}
  .btns,.btn table{width:100%!important}
  .btn a{display:block!important;text-align:center!important}
  .k{display:block!important;width:auto!important;padding:14px 0 2px!important}
  .v{display:block!important;padding:0 0 14px!important;border-top:0!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${C.mist}">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;mso-hide:all;opacity:0;color:${C.mist};font-size:1px;line-height:1px">${esc(preheader)}${filler}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.mist}" style="background:${C.mist}">
<tr><td class="outer" align="center" style="padding:32px 12px">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.white}" style="max-width:600px;background:${C.white};border:1px solid ${C.line};border-radius:16px;border-collapse:separate;overflow:hidden">
<tr><td style="height:6px;line-height:6px;font-size:0;background:${C.brand500};border-radius:16px 16px 0 0">&nbsp;</td></tr>
${rows}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
<tr><td align="center" style="padding:20px 16px 8px;${font(400, 13, 20)};color:${C.muted}">${after}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body>
</html>`;
}

const practiceLine = () =>
  [
    `<strong style="color:${C.body}">${esc(site.name)}</strong>`,
    esc(site.address.street),
    esc(`${site.address.city}, ${site.address.region} ${site.address.zip}`),
    `<a href="${site.phone.href}" style="color:${C.muted};text-decoration:underline">${esc(site.phone.display)}</a>`,
  ]
    .map((part) => `<span style="white-space:nowrap">${part}</span>`)
    .join(" &middot; ");

/* ---------- 1. To the practice ---------- */

export function officeEmail(r: AppointmentRequest, ctx: EmailContext): EmailContent {
  const source = sources[r.formId];
  const urgent = r.services.includes(EMERGENCY);
  const phone = formatPhone(r.phone);
  const title = urgent ? "Emergency appointment request" : "New appointment request";
  const when = receivedAt(ctx.received);
  const replyHref = `mailto:${r.email}?subject=${encodeURIComponent(`Your appointment request at ${site.name}`)}`;

  const details: [string, string][] = [
    ["Phone", `<a href="${telHref(r.phone)}" style="color:${C.brand700};text-decoration:none">${esc(phone)}</a>`],
    [
      "Email",
      // a long address may wrap on a phone: after the @ or before a dot, never mid-word
      `<a href="mailto:${esc(r.email)}" style="color:${C.brand700};text-decoration:none">${esc(r.email).replace(/@/, "@<wbr>").replace(/\./g, "<wbr>.")}</a>`,
    ],
    ["Preferred day", esc(r.preferredDay)],
    [
      "Reason for visit",
      r.services.map((s) => `<span style="display:inline-block;margin:0 6px 6px 0">${chip(s)}</span>`).join(""),
    ],
    ["Reference", `<span style="font-family:Consolas,Menlo,monospace;letter-spacing:0.04em">${esc(ctx.ref)}</span>`],
  ];

  const rows = [
    header(ctx.logoSrc, `Website request<br><span style="color:${C.ink};font-weight:700">${esc(ctx.ref)}</span>`),
    row(
      `${chip(source.label)}
<h1 class="h1" style="margin:16px 0 8px;${font(800, 28, 36)};letter-spacing:-0.01em;color:${C.ink}">${title}</h1>
<p style="margin:0;${font(400, 16, 26)};color:${C.body}">Received ${esc(when)} (Eastern). Please call the patient back to confirm a day and time.</p>`,
      "20px 40px 0",
    ),
    urgent
      ? row(
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr>
<td bgcolor="${C.warn50}" style="padding:14px 18px;background:${C.warn50};border:1px solid ${C.warn300};border-radius:12px;${font(600, 16, 24)};color:${C.warn800}">
<strong>Emergency visit requested.</strong> The patient may be in pain. Please call back as soon as you can.
</td></tr></table>`,
          "20px 40px 0",
        )
      : "",
    row(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr>
<td bgcolor="${C.pearl}" style="padding:22px 24px;background:${C.pearl};border:1px solid ${C.line};border-radius:14px">
${eyebrow("Patient")}
<div style="margin-top:6px;${font(800, 22, 30)};color:${C.ink}">${esc(r.name)}</div>
<div style="margin-top:10px">${chip(patientKind(r), r.patient === "new" ? "solid" : "soft")}</div>
<table class="btns" role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px"><tr>
<td class="btn" style="padding-right:10px">${button(telHref(r.phone), `Call ${phone}`)}</td>
<td class="btn">${button(replyHref, `Email ${firstName(r.name)}`, "outline")}</td>
</tr></table>
</td></tr></table>`,
    ),
    row(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${details
  .map(
    ([k, v], i) =>
      `<tr><td class="k" width="150" valign="top" style="width:150px;padding:14px 16px 14px 0;${i ? `border-top:1px solid ${C.line};` : ""}${font(600, 14, 24)};color:${C.muted}">${k}</td>
<td class="v" valign="top" style="padding:14px 0;${i ? `border-top:1px solid ${C.line};` : ""}${font(600, 16, 24)};color:${C.ink}">${v}</td></tr>`,
  )
  .join("\n")}
</table>`,
      "16px 40px 0",
    ),
    row(
      `${eyebrow("Message")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;border-collapse:separate"><tr>
<td bgcolor="${C.pearl}" style="padding:16px 18px;background:${C.pearl};border-left:4px solid ${C.brand300};border-radius:0 10px 10px 0;${font(400, 16, 26)};color:${C.ink};word-break:break-word">
${r.message ? escLines(r.message) : `<span style="color:${C.muted}">No message.</span>`}
</td></tr></table>`,
      "20px 40px 0",
    ),
    row(
      `<div style="border-top:1px solid ${C.line};padding-top:20px">
<p style="margin:0;${font(400, 14, 22)};color:${C.body}">Reply to this email to write to ${esc(firstName(r.name))} directly. Sent from the appointment form on the <a href="${url(source.path)}" style="color:${C.brand700}">${source.label.toLowerCase()}</a>.</p>
<p style="margin:10px 0 0;${font(600, 13, 20)};color:${C.muted}">Confidential: this email contains patient information. Keep it within the practice.</p>
</div>`,
      "28px 40px 32px",
    ),
  ].join("\n");

  const text = [
    `${title.toUpperCase()} (${ctx.ref})`,
    `Received ${when} (Eastern), from the ${source.label.toLowerCase()}.`,
    urgent ? "\nEMERGENCY VISIT REQUESTED: the patient may be in pain. Please call back as soon as you can.\n" : "",
    "Please call the patient back to confirm a day and time.",
    "",
    `Patient:          ${r.name} (${patientKind(r)})`,
    `Phone:            ${phone}`,
    `Email:            ${r.email}`,
    `Preferred day:    ${r.preferredDay}`,
    `Reason for visit: ${r.services.join(", ")}`,
    "",
    "Message:",
    r.message || "(none)",
    "",
    "--",
    `Reply to this email to write to the patient directly. Sent from ${url(source.path)}`,
    "Confidential: this email contains patient information. Keep it within the practice.",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  return {
    // no names, contact details or reasons in the subject: it shows in inbox lists and phone notifications
    subject: `${title} · ${patientKind(r)} · ${ctx.ref}`,
    html: shell({
      title,
      preheader: `${urgent ? "Emergency visit. " : ""}A patient asked for an appointment on the ${source.label.toLowerCase()}. Please call back to confirm a time.`,
      rows,
      after: practiceLine(),
    }),
    text,
  };
}

/* ---------- 2. To the patient ---------- */

export function patientEmail(r: AppointmentRequest, ctx: EmailContext): EmailContent {
  const name = firstName(r.name);
  const phone = formatPhone(r.phone);
  const isNew = r.patient === "new";
  const subject = "We received your appointment request";

  const step = (n: number, heading: string, body: string, last = false) =>
    `<tr>
<td width="44" valign="top" style="width:44px;padding:0 0 ${last ? 0 : 18}px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" width="32" height="32" bgcolor="${C.brand600}" style="width:32px;height:32px;border-radius:16px;background:${C.brand600};${font(800, 15, 32)};color:${C.white}">${n}</td></tr></table>
</td>
<td valign="top" style="padding:4px 0 ${last ? 0 : 18}px">
<div style="${font(700, 16, 24)};color:${C.ink}">${heading}</div>
<div style="margin-top:2px;${font(400, 16, 26)};color:${C.body}">${body}</div>
</td></tr>`;

  const link = (path: string, label: string) =>
    `<a href="${url(path)}" style="color:${C.brand700};font-weight:700;text-decoration:underline">${label}</a>`;

  const steps = [
    step(1, "Your request is with our front desk", "We have your details and preferred day."),
    step(
      2,
      "We call you to confirm a time",
      `We will call you at <strong style="color:${C.ink};white-space:nowrap">${esc(phone)}</strong>. If that number is wrong, just reply to this email.`,
    ),
    isNew
      ? step(
          3,
          "Before your first visit",
          `See ${link("/patient-information/new-patients", "what new patients need to know")}, and fill out your ${link("/patient-information/patient-registration", "patient forms")} at home to save time when you arrive.`,
          true,
        )
      : step(
          3,
          "Your visit is booked after our call",
          "A request is not a booking yet. Your time is set once we have spoken with you.",
          true,
        ),
  ].join("\n");

  const hours = hourRows()
    .map(
      (h, i) => `<tr>
<td style="padding:8px 12px 8px 0;${i ? `border-top:1px solid ${C.line};` : ""}${font(600, 15, 22)};color:${C.ink};white-space:nowrap">${h.short}</td>
<td align="right" style="padding:8px 0;${i ? `border-top:1px solid ${C.line};` : ""}${font(400, 15, 22)};color:${h.time === "Closed" ? C.muted : C.body};white-space:nowrap">${h.time}</td>
</tr>`,
    )
    .join("\n");

  /* Two columns that sit side by side at 600 px and stack on phones, without a media query.
     font-size:0 on the wrapper removes the gaps between the inline blocks (each block sets its own
     type), so 246 + 16 + 246 fits the 518 px inside the card. */
  const column = (inner: string) =>
    `<div style="display:inline-block;width:100%;max-width:246px;vertical-align:top;margin:0 0 20px">${inner}</div>`;
  const infoColumns = `<div style="font-size:0;line-height:0">
<!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="248" valign="top"><![endif]-->
${column(`${eyebrow("Office hours")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px">${hours}</table>`)}
<!--[if mso]></td><td width="16"></td><td width="248" valign="top"><![endif]-->
<div style="display:inline-block;width:16px;font-size:0;line-height:0">&nbsp;</div>
${column(`${eyebrow("Visit us")}
<p style="margin:10px 0 0;${font(400, 15, 24)};color:${C.body}">${esc(site.address.street)}<br>${esc(`${site.address.city}, ${site.address.region} ${site.address.zip}`)}</p>
<p style="margin:8px 0 0;${font(700, 15, 24)}"><a href="${esc(site.address.directions)}" style="color:${C.brand700};text-decoration:underline">Get directions</a></p>
<p style="margin:12px 0 0;${font(400, 15, 24)};color:${C.body}"><a href="${site.phone.href}" style="color:${C.ink};font-weight:700;text-decoration:none">${esc(site.phone.display)}</a><br><a href="${site.email.href}" style="color:${C.brand700};text-decoration:none">${esc(site.email.display)}</a></p>`)}
<!--[if mso]></td></tr></table><![endif]-->
</div>`;

  const rows = [
    header(ctx.logoSrc, `Appointment request<br><span style="color:${C.ink};font-weight:700">${esc(ctx.ref)}</span>`),
    row(
      `${chip("Request received")}
<h1 class="h1" style="margin:16px 0 8px;${font(800, 28, 36)};letter-spacing:-0.01em;color:${C.ink}">Thank you, ${esc(name)}. We have your request.</h1>
<p style="margin:0;${font(400, 17, 28)};color:${C.body}">Our front desk will call you to confirm a day and time for your visit${isNew ? ". We look forward to meeting you" : ""}.</p>`,
      "20px 40px 0",
    ),
    row(
      `${eyebrow("What happens next")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px">${steps}</table>`,
      "28px 40px 0",
    ),
    row(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr>
<td bgcolor="${C.warn50}" style="padding:16px 18px;background:${C.warn50};border:1px solid ${C.warn300};border-radius:12px;${font(400, 15, 24)};color:${C.warn800}">
<strong style="font-weight:700">In pain or have swelling?</strong> Do not wait for our call: phone us at <a href="${site.phone.href}" style="color:${C.warn800};font-weight:700;white-space:nowrap">${esc(site.phone.display)}</a>. For severe facial swelling, trouble breathing or trouble swallowing, go to an emergency room or call 911.
</td></tr></table>`,
      "28px 40px 0",
    ),
    row(infoColumns, "28px 40px 0"),
    row(
      `<table class="btns" role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="btn" style="padding-right:10px">${button(site.phone.href, `Call ${site.phone.display}`)}</td>
<td class="btn">${button(url(), "Visit our website", "outline")}</td>
</tr></table>`,
      "4px 40px 0",
    ),
    row(
      `<div style="border-top:1px solid ${C.line};padding-top:20px">
<p style="margin:0;${font(400, 14, 22)};color:${C.body}">You are getting this email because an appointment request was sent from <a href="${url()}" style="color:${C.brand700}">mediabritesmile.com</a> with this address. If that was not you, you can ignore it.</p>
<p style="margin:10px 0 0;${font(400, 14, 22)};color:${C.muted}">For your privacy, please do not email us detailed medical information. We will go through your health history with you at your visit.</p>
</div>`,
      "28px 40px 32px",
    ),
  ].join("\n");

  const text = [
    `Thank you, ${name}. We have your request.`,
    "",
    "Our front desk will call you to confirm a day and time for your visit.",
    "",
    "WHAT HAPPENS NEXT",
    "1. Your request is with our front desk.",
    `2. We call you at ${phone} to confirm a time. If that number is wrong, just reply to this email.`,
    isNew
      ? `3. Before your first visit: see ${url("/patient-information/new-patients")} and fill out your patient forms at ${url("/patient-information/patient-registration")}.`
      : "3. Your visit is booked after our call. A request is not a booking yet.",
    "",
    `In pain or have swelling? Do not wait for our call: phone us at ${site.phone.display}. For severe facial swelling, trouble breathing or trouble swallowing, go to an emergency room or call 911.`,
    "",
    "OFFICE HOURS",
    ...hourRows().map((h) => `${h.days}: ${h.time}`),
    "",
    site.name,
    site.address.full,
    `${site.phone.display} · ${site.email.display}`,
    `Directions: ${site.address.directions}`,
    "",
    `Reference: ${ctx.ref}`,
    "--",
    `You are getting this email because an appointment request was sent from ${url()} with this address. If that was not you, you can ignore it. Please do not email us detailed medical information.`,
  ].join("\n");

  return {
    subject,
    html: shell({
      title: subject,
      preheader: `Thank you, ${name}. Our front desk will call you to confirm a day and time.`,
      rows,
      after: `${practiceLine()}<br>&copy; ${ctx.received.getFullYear()} ${esc(site.name)}`,
    }),
    text,
  };
}
