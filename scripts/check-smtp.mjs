/**
 * Checks the appointment-form email settings (SMTP_* and MAIL_* in .env.local).
 *
 *   npm run check:smtp           log in to the mail server and report; sends nothing
 *   npm run check:smtp -- --send also send one test email to MAIL_TO
 *
 * Never prints the password.
 */
import nextEnv from "@next/env";
import nodemailer from "nodemailer";

nextEnv.loadEnvConfig(process.cwd());
const env = process.env;
const port = Number(env.SMTP_PORT || 587);
const secure = env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465;
const to = (env.MAIL_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "MAIL_TO"].filter((k) => !env[k]?.trim());
console.log(`server : ${env.SMTP_HOST || "-"}:${port} (${secure ? "TLS" : "STARTTLS required"})`);
console.log(`login  : ${env.SMTP_USER || "-"}  password: ${env.SMTP_PASS ? "set" : "MISSING"}`);
console.log(`from   : ${env.MAIL_FROM || "-"}`);
console.log(`to     : ${to.join(", ") || "-"}`);
if (missing.length) {
  console.error(`\nNot ready: fill in ${missing.join(", ")} in .env.local.`);
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port,
  secure,
  requireTLS: !secure,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS?.replace(/\s/g, "") },
  tls: { minVersion: "TLSv1.2" },
  connectionTimeout: 10_000,
});

try {
  await transport.verify();
  console.log("\nOK: connected and logged in.");
} catch (err) {
  console.error(`\nLogin failed: ${err.code ?? ""} ${err.responseCode ?? ""} ${err.message}`);
  if (err.responseCode === 535)
    console.error("Google rejected the login. Use an App Password for this mailbox (2-Step Verification must be on).");
  process.exit(1);
}

if (process.argv.includes("--send")) {
  await transport.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: "Website email test (no patient data)",
    text: "This is a test from the Media Brite Smile website. Appointment requests will arrive at this address.",
  });
  console.log(`Test email sent to ${to.join(", ")}.`);
}
