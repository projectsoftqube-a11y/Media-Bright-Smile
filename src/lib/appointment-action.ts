"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { validateAppointment, type AppointmentErrors } from "@/lib/appointment-request";
import { isConfirmationOn, isMailConfigured, sendAppointmentEmail, sendPatientConfirmation } from "@/lib/mailer";

/** Logs a mail failure without the patient's details. */
function logMailError(where: string, err: unknown) {
  const e = err as { code?: string; responseCode?: number; message?: string };
  console.error(`[appointment-form] ${where} failed:`, e.code ?? "", e.responseCode ?? "", e.message ?? "");
}

export type AppointmentResult =
  | { status: "sent" }
  | { status: "invalid"; errors: AppointmentErrors }
  /** email is not set up yet: the visitor is asked to call */
  | { status: "unavailable" }
  /** too many requests from one address in a short time */
  | { status: "limited" }
  | { status: "failed" };

/* Best-effort limit per visitor IP: 5 requests per 15 minutes. It is kept in memory, so it counts
   per server instance; enough to stop a script hammering the form, not a substitute for a WAF. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  return false;
}

/**
 * Sends an appointment request. Called from the form after the browser's own checks pass, but
 * everything is checked again here: a Server Action is a public endpoint.
 * Returns only a status (and field errors), never the submitted data.
 */
export async function sendAppointmentRequest(data: FormData): Promise<AppointmentResult> {
  // Spam traps. Answer as if it worked, so a bot learns nothing.
  if (String(data.get("company") ?? "").trim()) return { status: "sent" };
  const elapsed = Number(data.get("elapsed_ms"));
  if (!Number.isFinite(elapsed) || elapsed < 2500) return { status: "sent" };

  const checked = validateAppointment(data);
  if (!checked.ok) return { status: "invalid", errors: checked.errors };

  if (!isMailConfigured()) return { status: "unavailable" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (limited(ip)) return { status: "limited" };

  let sent: Awaited<ReturnType<typeof sendAppointmentEmail>>;
  try {
    sent = await sendAppointmentEmail(checked.request);
  } catch (err) {
    logMailError("office email", err);
    return { status: "failed" };
  }

  // The practice has the request, so the visitor sees "sent" now; the confirmation to the patient
  // goes out after the response, and if it fails the request still stands.
  if (isConfirmationOn()) {
    const request = checked.request;
    after(() => sendPatientConfirmation(request, sent).catch((err) => logMailError("patient confirmation", err)));
  }
  return { status: "sent" };
}
