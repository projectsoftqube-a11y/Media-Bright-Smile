import type { NextRequest } from "next/server";
import type { AppointmentRequest } from "@/lib/appointment-request";
import { EMAIL_LOGO } from "@/lib/email/logo";
import { officeEmail, patientEmail } from "@/lib/email/templates";

/**
 * Email design preview, development only (`npm run dev`, then open /dev/emails).
 * Renders the real templates with sample data; nothing is sent. Answers 404 in production.
 */

const samples: Record<string, { title: string; request: AppointmentRequest; to: "office" | "patient" }> = {
  "office-new": {
    title: "To the practice: new patient, Scheduling page",
    to: "office",
    request: {
      formId: "appointment-form",
      patient: "new",
      name: "Jane Sample",
      phone: "6105550123",
      email: "jane.sample@example.com",
      preferredDay: "Tuesday",
      services: ["New Patient Exam & Cleaning", "Consultation / Second Opinion"],
      message: "I'm interested in Invisalign.\nMornings work best for me.",
    },
  },
  "office-emergency": {
    title: "To the practice: emergency, Contact page, no message",
    to: "office",
    request: {
      formId: "contact-form",
      patient: "existing",
      name: "Robert Example-Smith",
      phone: "4845550199",
      email: "robert.example-smith.longaddress@example-mail-provider.com",
      preferredDay: "Any day",
      services: ["Emergency Visit"],
      message: "",
    },
  },
  "patient-new": {
    title: "To the patient: new patient",
    to: "patient",
    request: {
      formId: "appointment-form",
      patient: "new",
      name: "Jane Sample",
      phone: "6105550123",
      email: "jane.sample@example.com",
      preferredDay: "Tuesday",
      services: ["New Patient Exam & Cleaning"],
      message: "",
    },
  },
  "patient-existing": {
    title: "To the patient: existing patient",
    to: "patient",
    request: {
      formId: "contact-form",
      patient: "existing",
      name: "Robert Example-Smith",
      phone: "4845550199",
      email: "robert@example.com",
      preferredDay: "Friday",
      services: ["Routine Cleaning & Check-up"],
      message: "",
    },
  },
};

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });

  const params = req.nextUrl.searchParams;
  const sample = samples[params.get("view") ?? ""];
  const ctx = {
    ref: "MBS-7K2QXP",
    received: new Date(),
    logoSrc: `data:image/png;base64,${EMAIL_LOGO.base64}`,
  };

  if (sample) {
    const mail = (sample.to === "office" ? officeEmail : patientEmail)(sample.request, ctx);
    if (params.get("format") === "text")
      return new Response(`Subject: ${mail.subject}\n\n${mail.text}`, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    return new Response(mail.html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const list = Object.entries(samples)
    .map(([key, s]) => {
      const subject = (s.to === "office" ? officeEmail : patientEmail)(s.request, ctx).subject;
      return `<li><a href="?view=${key}">${s.title}</a> &middot; <a href="?view=${key}&format=text">plain text</a><br><small>Subject: ${subject.replace(/</g, "&lt;")}</small></li>`;
    })
    .join("");
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email previews</title>
<body style="font:16px/1.6 system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;color:#0c1b22">
<h1 style="font-size:24px">Appointment form emails</h1><p>Sample data only. Nothing is sent from this page.</p><ul style="padding-left:20px">${list}</ul></body>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
