"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  Phone,
  Send,
  UserRound,
} from "lucide-react";
import { site } from "@/content/site";
import {
  checkField,
  formatPhone,
  limits,
  normalizePhone,
  preferredDays,
  validateAppointment,
  visitReasons,
  type AppointmentErrors,
  type AppointmentField,
  type FormId,
  type PatientType,
} from "@/lib/appointment-request";
import { sendAppointmentRequest } from "@/lib/appointment-action";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const patientCards: { id: PatientType; title: string; text: string; icon: typeof UserRound }[] = [
  {
    id: "existing",
    title: "Existing Patient",
    text: "Welcome back. Book your next check-up or treatment.",
    icon: CalendarCheck,
  },
  {
    id: "new",
    title: "New Patient",
    text: "Your first visit with us. Uninsured? The New Patient Special is $99.",
    icon: UserRound,
  },
];

const field =
  "mt-2 block w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-base text-ink transition-[border-color,box-shadow] outline-none placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15";
const invalid = "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15";

const Req = () => (
  <span className="text-rose-600" aria-hidden="true">
    *
  </span>
);

type Status = "idle" | "sending" | "sent" | "unavailable" | "failed" | "limited";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Appointment request form, two steps:
 * 1. existing or new patient, 2. name, phone, email, preferred day, reason for visit and a message.
 * Ids (Developer Q&A 19 Nov): "appointment-form" on /patient-information/scheduling/,
 * "contact-form" on /contact-us/.
 *
 * Validation: the rules live in lib/appointment-request.ts and run twice, here for instant feedback
 * (on leaving a field, and again on submit) and in the server action, which is the real check.
 * Sending: lib/appointment-action.ts emails the request through SMTP (lib/mailer.ts). Until SMTP is
 * configured the visitor is told nothing was sent and asked to call.
 * Tracking rules (kept): POST only, the thank-you state carries no form data, generate_lead fires
 * (with form_id only) on a confirmed send, and no names, contact details, reasons or message text go
 * to GA4, Google Ads or any other tag.
 * The hidden "company" field is a spam trap: real visitors never see or fill it.
 */
export function AppointmentForm({ id = "appointment-form" }: { id?: FormId }) {
  const reduce = useReducedMotion();
  const [patient, setPatient] = useState<PatientType | null>(null);
  const [errors, setErrors] = useState<AppointmentErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [firstName, setFirstName] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const [announce, setAnnounce] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const shownAt = useRef(0);

  // move focus to the confirmation once it replaces the form
  useEffect(() => {
    if (status === "sent") sentRef.current?.focus();
  }, [status]);

  const step = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12 },
    transition: { duration: 0.4, ease: ease.out },
  };

  const errorId = (f: AppointmentField) => `${id}-${f}-error`;
  /** props that tie a field to its error message for screen readers */
  const describe = (f: AppointmentField, hint?: string) => ({
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": [errors[f] && errorId(f), hint].filter(Boolean).join(" ") || undefined,
  });
  const errorText = (f: AppointmentField) =>
    errors[f] ? (
      <span id={errorId(f)} className="mt-1.5 flex items-start gap-1.5 text-sm text-rose-700">
        <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {errors[f]}
      </span>
    ) : null;

  /** `at` is the click's event timestamp: the spam check measures how long step 2 was on screen */
  function choose(type: PatientType, at: number) {
    setPatient(type);
    setErrors({});
    setStatus("idle");
    shownAt.current = at;
    /* move focus to the first field once step 2 has rendered */
    requestAnimationFrame(() =>
      setTimeout(() => formRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus(), 450),
    );
  }

  const setFieldError = (f: AppointmentField, message: string | undefined) =>
    setErrors((prev) => {
      if (prev[f] === message) return prev;
      const next = { ...prev };
      if (message) next[f] = message;
      else delete next[f];
      return next;
    });

  const serviceValues = () =>
    [...(formRef.current?.querySelectorAll<HTMLInputElement>("input[name=service]:checked") ?? [])].map((i) => i.value);

  /** check a field when the visitor leaves it (only once they have typed something) */
  function onBlur(e: FocusEvent<HTMLFormElement>) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
    const f = el.name as AppointmentField;
    if (!["name", "phone", "email", "message"].includes(f)) return;
    if (!el.value.trim() && !errors[f]) return; // do not scold an empty field just for tabbing past it
    const message = checkField(f, el.value);
    setFieldError(f, message);
    // tidy a valid phone number into (610) 555-0123
    if (f === "phone" && !message) el.value = formatPhone(normalizePhone(el.value)!);
  }

  /** once a field shows an error, re-check it as the visitor types so the message clears when fixed */
  function onChange(e: FormEvent<HTMLFormElement>) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) return;
    const f = el.name as AppointmentField;
    if (f === "message") setMessageLength(el.value.length);
    if (f === "service") {
      if (errors.service) setFieldError("service", checkField("service", serviceValues()));
      return;
    }
    if (errors[f]) setFieldError(f, checkField(f, el.value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("form_id", id);
    data.set("elapsed_ms", String(Math.round(e.timeStamp - shownAt.current)));

    const checked = validateAppointment(data);
    if (!checked.ok) {
      showErrors(checked.errors);
      return;
    }
    if (String(data.get("company") ?? "").trim()) return; // spam trap filled: ignore quietly

    setStatus("sending");
    setAnnounce("Sending your request.");
    try {
      const result = await sendAppointmentRequest(data);
      if (result.status === "invalid") {
        setStatus("idle");
        showErrors(result.errors);
        return;
      }
      setFirstName(checked.request.name.split(" ")[0]);
      setStatus(result.status);
      if (result.status === "sent") {
        window.dataLayer?.push({ event: "generate_lead", form_id: id });
        setAnnounce("Your request has been sent.");
      } else setAnnounce("");
    } catch {
      // network error, or a page left open across a new deployment
      setStatus("failed");
      setAnnounce("");
    }
  }

  function showErrors(next: AppointmentErrors) {
    setErrors(next);
    const fields = Object.keys(next) as AppointmentField[];
    setAnnounce(
      fields.length === 1 ? "Please correct 1 field." : `Please correct ${fields.length} fields.`,
    );
    const first = fields[0];
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  const chosen = patientCards.find((p) => p.id === patient);
  const sending = status === "sending";

  return (
    <div className="relative">
      {/* screen-reader announcements: error count, sending, sent */}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          /* ---------- sent ---------- */
          <motion.div
            key="sent"
            {...step}
            role="status"
            tabIndex={-1}
            ref={sentRef}
            className="flex flex-col items-start gap-4 rounded-3xl bg-brand-50 p-6 ring-1 ring-brand-200 outline-none sm:flex-row sm:p-8"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white">
              <CircleCheck className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-ink">Thank you, {firstName}. Your request has been sent.</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">
                Our front desk will call you to confirm a day and time. If it is urgent, please call{" "}
                <a href={site.phone.href} className="font-semibold text-brand-700 underline underline-offset-2">
                  {site.phone.display}
                </a>
                .
              </p>
            </div>
          </motion.div>
        ) : (
          /* method="post": if script ever fails, a native submit must never put form data in the URL */
          <motion.form
            key="form"
            {...step}
            id={id}
            method="post"
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            onBlur={onBlur}
            onChange={onChange}
            aria-busy={sending}
          >
            <input type="hidden" name="patient" value={patient ?? ""} />

            <AnimatePresence mode="wait" initial={false}>
              {!chosen ? (
                /* ---------- step 1: existing or new patient ---------- */
                <motion.fieldset key="who" {...step}>
                  <legend className="text-base font-semibold text-ink">Are you an existing or new patient?</legend>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                    {patientCards.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={(e) => choose(t.id, e.timeStamp)}
                        className="group relative flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl bg-linear-to-b from-brand-50 to-white px-3 pt-7 pb-14 text-center ring-1 ring-brand-100 transition-[box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift hover:ring-brand-300 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none sm:min-h-64 sm:px-6"
                      >
                        <span className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow transition-transform duration-500 group-hover:scale-105 sm:size-16">
                          <t.icon className="size-6 sm:size-7" />
                        </span>
                        <span className="mt-4 text-lg leading-tight font-bold text-ink sm:mt-5 sm:text-2xl">
                          {t.title}
                        </span>
                        <span className="mt-2 hidden max-w-60 text-[0.9375rem] leading-relaxed text-body sm:block">
                          {t.text}
                        </span>
                        <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-xl bg-white text-ink ring-1 ring-line transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white group-hover:ring-brand-500 sm:right-4 sm:bottom-4">
                          <ArrowRight className="size-4" />
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 text-[0.9375rem] leading-relaxed text-body">
                    Dental emergency? Call{" "}
                    <a href={site.phone.href} className="font-semibold text-brand-700 underline underline-offset-2">
                      {site.phone.display}
                    </a>{" "}
                    rather than using this form.
                  </p>
                </motion.fieldset>
              ) : (
                /* ---------- step 2: details ---------- */
                <motion.div key="details" {...step} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="col-span-full flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-3 rounded-2xl bg-brand-50 py-2 pr-4 pl-2 ring-1 ring-brand-200">
                      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
                        <chosen.icon className="size-4" />
                      </span>
                      <span className="font-semibold text-ink">{chosen.title}</span>
                      <button
                        type="button"
                        onClick={() => setPatient(null)}
                        disabled={sending}
                        className="-my-2 inline-flex min-h-11 cursor-pointer items-center font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-600"
                      >
                        Change
                      </button>
                    </span>
                    <span className="text-sm text-muted">
                      <Req /> Required
                    </span>
                  </div>

                  <label className="block sm:col-span-2 lg:col-span-1">
                    <span className="text-sm font-semibold text-ink">
                      Full Name <Req />
                    </span>
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={limits.name}
                      className={cn(field, errors.name && invalid)}
                      {...describe("name")}
                    />
                    {errorText("name")}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-ink">
                      Phone Number <Req />
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="tel"
                      required
                      maxLength={20}
                      placeholder="(610) 555-0123"
                      className={cn(field, errors.phone && invalid)}
                      {...describe("phone")}
                    />
                    {errorText("phone")}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-ink">
                      Email Address <Req />
                    </span>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      maxLength={limits.email}
                      placeholder="name@example.com"
                      className={cn(field, errors.email && invalid)}
                      {...describe("email")}
                    />
                    {errorText("email")}
                  </label>

                  <label className="block sm:col-span-2 lg:col-span-1">
                    <span className="text-sm font-semibold text-ink">Preferred Day</span>
                    <select
                      name="preferred_day"
                      defaultValue="Any day"
                      className={cn(field, "cursor-pointer", errors.preferred_day && invalid)}
                      {...describe("preferred_day")}
                    >
                      {preferredDays.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    {errorText("preferred_day")}
                  </label>

                  <fieldset className="col-span-full" {...describe("service")}>
                    <legend className="text-sm font-semibold text-ink">
                      Reason for Visit <Req /> <span className="ml-1 font-normal text-muted">Select all that apply</span>
                    </legend>
                    <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                      {visitReasons.map((s) => (
                        <label
                          key={s.title}
                          className={cn(
                            "group flex cursor-pointer items-start gap-3.5 rounded-2xl bg-white p-4 ring-1 ring-line transition-[box-shadow,background-color] duration-300 hover:ring-brand-300 has-checked:bg-brand-50 has-checked:ring-2 has-checked:ring-brand-500",
                            errors.service && "ring-rose-300",
                          )}
                        >
                          <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
                            <input
                              type="checkbox"
                              name="service"
                              value={s.title}
                              className="peer size-6 cursor-pointer appearance-none rounded-lg border-2 border-line bg-white transition-colors checked:border-brand-500 checked:bg-brand-500 focus-visible:ring-4 focus-visible:ring-brand-500/20 focus-visible:outline-none"
                            />
                            <Check
                              className="pointer-events-none absolute size-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                              strokeWidth={3}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block leading-snug font-semibold text-ink">{s.title}</span>
                            <span className="mt-0.5 block text-[0.9375rem] leading-snug text-body">{s.text}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {errorText("service")}
                  </fieldset>

                  <label className="col-span-full block">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">Message</span>
                      <span
                        id={`${id}-message-count`}
                        className={cn(
                          "text-sm tabular-nums",
                          messageLength > limits.message ? "text-rose-700" : "text-muted",
                        )}
                      >
                        {messageLength}/{limits.message}
                      </span>
                    </span>
                    <textarea
                      name="message"
                      rows={4}
                      maxLength={limits.message}
                      placeholder="Anything we should know, such as the time of day that suits you"
                      className={cn(field, "resize-y", errors.message && invalid)}
                      {...describe("message", `${id}-message-hint`)}
                    />
                    {errorText("message")}
                    <span id={`${id}-message-hint`} className="mt-1.5 block text-sm leading-relaxed text-muted">
                      Please do not include detailed medical information in this form.
                    </span>
                  </label>

                  {/* spam trap: off-screen, skipped by keyboard and autofill */}
                  <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
                    <label>
                      Company
                      <input name="company" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>

                  {status !== "idle" && status !== "sending" && (
                    <div
                      role="alert"
                      className={cn(
                        "col-span-full flex gap-4 rounded-3xl p-5 ring-1",
                        status === "unavailable" ? "bg-amber-50 ring-amber-200" : "bg-rose-50 ring-rose-200",
                      )}
                    >
                      <CircleAlert
                        className={cn(
                          "mt-0.5 size-5 shrink-0",
                          status === "unavailable" ? "text-amber-600" : "text-rose-600",
                        )}
                        aria-hidden="true"
                      />
                      <p className="text-[0.9375rem] leading-relaxed text-ink">
                        {status === "unavailable" &&
                          `Thanks, ${firstName}. Online requests are not switched on yet on this new website, so nothing has been sent. `}
                        {status === "failed" &&
                          "Sorry, your request could not be sent just now. Please try again in a moment, or "}
                        {status === "limited" &&
                          "We have already received several requests from you in the last few minutes. To add anything, "}
                        {status === "unavailable" ? "Please call " : "call "}
                        <a href={site.phone.href} className="font-semibold text-brand-700 underline">
                          {site.phone.display}
                        </a>
                        {status === "unavailable" ? " and we will find you a time." : "."}
                      </p>
                    </div>
                  )}

                  <div className="col-span-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-700 px-8 font-semibold text-white shadow-glow transition-colors hover:bg-brand-800 disabled:cursor-wait disabled:opacity-80 sm:w-auto"
                      >
                        {sending ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Sending…
                          </>
                        ) : (
                          <>
                            <Send className="size-4" aria-hidden="true" /> Request My Appointment
                          </>
                        )}
                      </button>
                      <p className="mt-3 text-sm text-muted">
                        See our{" "}
                        <Link
                          href="/patient-information/privacy"
                          className="font-semibold text-brand-700 underline underline-offset-2"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                    <a
                      href={site.phone.href}
                      className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-brand-600 sm:self-auto"
                    >
                      <Phone className="size-4" /> Or call {site.phone.display}
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
