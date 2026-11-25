import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Banknote,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck2,
  HandCoins,
  Percent,
  Phone,
  ScanLine,
} from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

/* Dental Savings Plan + payment options for /patient-information/insurance-payment-options,
   section 2 (client copy, Nov 2026). Prices match /about-us/dental-savings-plan. */

const includes: { figure: string | LucideIcon; label: string }[] = [
  { figure: "2", label: "Annual exams" },
  { figure: "1", label: "Emergency exam" },
  { figure: "2", label: "Oral cancer screenings" },
  { figure: "4", label: "Bitewing X-rays" },
  { figure: "All", label: "Individual X-rays for 1 year" },
  { figure: ScanLine, label: "Full mouth series X-rays or Panorex" },
];

const prices = [
  { who: "1st Member", amount: 300 },
  { who: "2nd Member", amount: 275 },
];

const payments: { icon: LucideIcon; title: string; text: ReactNode }[] = [
  { icon: Banknote, title: "Cash or Check", text: "Always accepted." },
  { icon: CreditCard, title: "Credit Card", text: "Visa, MasterCard, Discover, or American Express." },
  {
    icon: HandCoins,
    title: "CareCredit",
    text: (
      <>
        Apply online at{" "}
        <a
          href="https://www.carecredit.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-700"
        >
          carecredit.com
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>{" "}
        or in our office.{" "}
        <Link
          href="/patient-information/care-credit"
          className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-700"
        >
          How CareCredit works
        </Link>
      </>
    ),
  },
];

/** Keeps hyphenated words ("X-rays", "10%–15%") on one line instead of splitting at the dash. */
function keepTogether(text: string) {
  return text.split(/(\S*[-–]\S*)/).map((part, i) =>
    /[-–]/.test(part) ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function SavingsAndPayment() {
  return (
    <section id="savings-plan" className="scroll-mt-28 bg-mist section-y" aria-labelledby="savings-heading">
      <div className="container-site">
        {/* ---------- heading ---------- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <Eyebrow>Dental Savings Plan</Eyebrow>
            <SplitReveal as="h2" id="savings-heading" className="mt-6 text-display-md font-bold text-balance">
              No insurance? Join our <span className="text-brand-600">in-office membership</span>
            </SplitReveal>
          </div>
          <Reveal className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-pretty text-body">
              {keepTogether(
                "One yearly fee covers your routine exams, screenings and X-rays, and takes 10%–15% off additional procedures, including fillings, crowns, dentures, and more.",
              )}
            </p>
          </Reveal>
        </div>

        {/* ---------- membership: what is included + pricing ticket ---------- */}
        <div className="mt-12 grid grid-cols-1 gap-5 lg:mt-16 lg:grid-cols-12">
          <Reveal className="rounded-4xl bg-white p-6 ring-1 ring-line sm:p-8 lg:col-span-7 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-bold tracking-tight text-ink">Membership includes</h3>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-brand-200">
                12 months of care
              </span>
            </div>
            <ul className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-line ring-1 ring-line sm:grid-cols-2">
              {includes.map(({ figure: F, label }) => (
                <li key={label} className="flex items-center gap-4 bg-white p-4 sm:p-5">
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-lg font-bold text-brand-700 tabular-nums ring-1 ring-brand-100"
                  >
                    {typeof F === "string" ? F : <F className="size-5" />}
                  </span>
                  <span className="leading-snug font-semibold text-ink">
                    {/* the figure is decorative, so screen readers get the full phrase */}
                    <span className="sr-only">{typeof F === "string" ? `${F} ` : ""}</span>
                    {keepTogether(label)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-start gap-4 rounded-3xl bg-brand-700 p-5 text-white sm:items-center">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/20">
                <Percent className="size-5" aria-hidden="true" />
              </span>
              <span className="leading-snug">
                <strong className="block text-lg font-bold">
                  <span className="whitespace-nowrap">10%–15%</span> off additional procedures
                </strong>
                <span className="text-white/80">Including fillings, crowns, dentures, and more.</span>
              </span>
            </p>
          </Reveal>

          {/* pricing as a membership ticket: perforation with punched notches between the two prices */}
          <Reveal
            delay={0.1}
            className="relative flex flex-col overflow-hidden rounded-4xl bg-brand-950 p-6 text-white sm:p-8 lg:col-span-5 lg:p-10"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-[0.16em] text-glow uppercase">Pricing</h3>
              <span className="text-sm text-white/70">Per year</span>
            </div>
            <dl className="mt-6 flex flex-1 flex-col">
              {prices.map((p, i) => (
                <div key={p.who} className="contents">
                  {i > 0 && (
                    <div aria-hidden="true" className="-mx-6 my-6 flex items-center sm:-mx-8 lg:-mx-10">
                      <span className="-ml-3 size-6 shrink-0 rounded-full bg-mist" />
                      <span className="mx-3 flex-1 border-t-2 border-dashed border-white/20" />
                      <span className="-mr-3 size-6 shrink-0 rounded-full bg-mist" />
                    </div>
                  )}
                  <div className="flex items-end justify-between gap-4">
                    <dt className="pb-2 text-lg font-semibold text-white/85">{p.who}</dt>
                    <dd className="flex items-start font-bold tracking-tighter tabular-nums">
                      <span className="mt-2 text-2xl text-glow">$</span>
                      <span className="text-6xl leading-none sm:text-7xl">{p.amount}</span>
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6">
              <Button href={site.phone.href} variant="white" size="lg" icon={<Phone className="size-4" />}>
                Call to Join {site.phone.display}
              </Button>
              <Link
                href="/about-us/dental-savings-plan"
                className="group inline-flex min-h-11 items-center gap-2 self-start font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                See the full plan details
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ---------- how to pay + insurance billing ---------- */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="rounded-4xl bg-white p-6 ring-1 ring-line sm:p-8 lg:col-span-7 lg:p-10">
            <h3 className="text-2xl font-bold tracking-tight text-ink">Payment options</h3>
            <RevealGroup className="mt-6 divide-y divide-line" stagger={0.06}>
              {payments.map((p) => (
                <RevealItem key={p.title} y={16}>
                  <div className="flex items-start gap-4 py-5 first:pt-0">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-brand-700">
                      <p.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-lg font-bold text-ink">{p.title}</h4>
                      <p className="mt-1 leading-relaxed text-body">{p.text}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
            <p className="mt-2 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 text-ink ring-1 ring-amber-200">
              <Clock className="size-5 shrink-0 text-amber-700" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Please note:</strong> Payment is due at the time of service.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col rounded-4xl bg-white p-6 ring-1 ring-line sm:p-8 lg:col-span-5 lg:p-10">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
              <FileCheck2 className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-2xl font-bold tracking-tight text-ink">We bill your insurance for you</h3>
            <p className="mt-3 leading-relaxed text-body">
              As a courtesy to you, we will bill your insurance company and track claims. Please keep us informed of any
              changes to your insurance plan.
            </p>
            <p className="mt-3 leading-relaxed text-body">
              You are responsible for the fees charged by our office, no matter what your insurance coverage may be.
              Any remaining cost is your responsibility.
            </p>
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-4 border-t border-line pt-5">
                <span className="shrink-0 text-3xl font-bold tracking-tight whitespace-nowrap text-brand-700 tabular-nums">
                  4–6
                </span>
                <span className="text-sm leading-snug text-body">
                  weeks: how long most insurance companies take to respond to a claim
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ---------- help strip ---------- */}
        <Reveal className="mt-5 flex flex-col gap-5 rounded-4xl bg-white p-6 ring-1 ring-line sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <Check className="size-5" aria-hidden="true" />
            </span>
            <p className="leading-relaxed">
              <strong className="block text-lg font-bold text-ink">We are here to help!</strong>
              <span className="text-body">
                Please call for more information about financing your oral health needs in our office.
              </span>
            </p>
          </div>
          <Button href={site.phone.href} size="lg" icon={<Phone className="size-4" />} className="shrink-0">
            Call {site.phone.display}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
