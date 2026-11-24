/**
 * The appointment request form's fields and rules, shared by the browser (instant feedback) and the
 * server action (the real check: anyone can POST to it, so it validates everything again).
 * No framework imports, so it runs in both places.
 */

export const patientTypes = ["existing", "new"] as const;
export type PatientType = (typeof patientTypes)[number];
export const patientLabels: Record<PatientType, string> = {
  existing: "Existing Patient",
  new: "New Patient",
};

export const visitReasons = [
  { title: "New Patient Exam & Cleaning", text: "For first-time patients: exam, X-rays and a cleaning if needed" },
  { title: "Routine Cleaning & Check-up", text: "For existing patients due for their regular visit" },
  { title: "Emergency Visit", text: "Pain, swelling, a broken tooth, infection and similar" },
  { title: "Treatment Visit", text: "Fillings, crowns, root canals, extractions or a planned procedure" },
  { title: "Consultation / Second Opinion", text: "Dental implants, veneers, Invisalign or whitening" },
  { title: "Other / Not Sure", text: "Tell us a little in the message and we will help" },
] as const;

export const preferredDays = ["Any day", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

export const limits = { name: 80, email: 254, message: 1000 } as const;

/** Which page the form sits on. Also the element id (Developer Q&A 19 Nov). */
export const formIds = ["appointment-form", "contact-form"] as const;
export type FormId = (typeof formIds)[number];

export type AppointmentField = "patient" | "name" | "phone" | "email" | "preferred_day" | "service" | "message";
export type AppointmentErrors = Partial<Record<AppointmentField, string>>;

export type AppointmentRequest = {
  formId: FormId;
  patient: PatientType;
  name: string;
  /** 10 digits, US number without the country code */
  phone: string;
  email: string;
  preferredDay: (typeof preferredDays)[number];
  services: string[];
  message: string;
};

const clean = (v: unknown) =>
  String(v ?? "")
    // strip control characters (keeps line breaks in the message)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

/** Letters (any language), spaces, apostrophes, hyphens and dots; at least two letters. */
const NAME = /^[\p{L}][\p{L}\p{M}'’ .-]*$/u;
/** A practical email check: one @, a dotted domain, no spaces, a 2+ letter ending. */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

/** 10 digits, or 11 starting with the US country code 1. Returns the 10-digit number or null. */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  // North American numbers: area code and exchange never start with 0 or 1
  if (/^[01]/.test(digits) || /^[01]/.test(digits.slice(3))) return null;
  return digits;
}

export const formatPhone = (digits: string) => `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;

/** Checks one field; returns the message to show, or undefined when it is fine. */
export function checkField(field: AppointmentField, value: string | string[]): string | undefined {
  const v = Array.isArray(value) ? value : clean(value);
  switch (field) {
    case "patient":
      return patientTypes.includes(v as PatientType) ? undefined : "Please choose existing or new patient.";
    case "name": {
      const s = v as string;
      if (!s) return "Please tell us your name.";
      if (s.replace(/[^\p{L}]/gu, "").length < 2) return "Please enter your full name.";
      if (s.length > limits.name) return `Please keep your name under ${limits.name} characters.`;
      if (!NAME.test(s)) return "Please use letters only in your name.";
      return undefined;
    }
    case "phone":
      if (!v) return "Please enter a phone number we can call back.";
      return normalizePhone(v as string) ? undefined : "Please enter a 10-digit US phone number, like (610) 555-0123.";
    case "email": {
      const s = v as string;
      if (!s) return "Please enter an email address we can reply to.";
      if (s.length > limits.email || !EMAIL.test(s)) return "Please enter a valid email address, like name@example.com.";
      return undefined;
    }
    case "preferred_day":
      return !v || preferredDays.includes(v as (typeof preferredDays)[number]) ? undefined : "Please choose a day from the list.";
    case "service": {
      const list = (Array.isArray(v) ? v : [v]).filter(Boolean);
      if (list.length === 0) return "Please choose at least one reason for your visit.";
      const allowed = visitReasons.map((r) => r.title as string);
      return list.every((s) => allowed.includes(s)) ? undefined : "Please choose a reason from the list.";
    }
    case "message":
      return (v as string).length > limits.message
        ? `Please keep the message under ${limits.message} characters.`
        : undefined;
  }
}

/** Validates a whole submission. Returns the cleaned request, or the errors to show. */
export function validateAppointment(
  data: FormData,
): { ok: true; request: AppointmentRequest } | { ok: false; errors: AppointmentErrors } {
  const get = (k: string) => clean(data.get(k));
  const services = [...new Set(data.getAll("service").map(clean).filter(Boolean))];
  const values: Record<AppointmentField, string | string[]> = {
    patient: get("patient"),
    name: get("name").replace(/\s+/g, " "),
    phone: get("phone"),
    email: get("email").toLowerCase(),
    preferred_day: get("preferred_day") || "Any day",
    service: services,
    message: get("message"),
  };
  const errors: AppointmentErrors = {};
  for (const field of Object.keys(values) as AppointmentField[]) {
    const error = checkField(field, values[field]);
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const formId = get("form_id");
  return {
    ok: true,
    request: {
      formId: formIds.includes(formId as FormId) ? (formId as FormId) : "appointment-form",
      patient: values.patient as PatientType,
      name: values.name as string,
      phone: normalizePhone(values.phone as string)!,
      email: values.email as string,
      preferredDay: values.preferred_day as AppointmentRequest["preferredDay"],
      services,
      message: values.message as string,
    },
  };
}
