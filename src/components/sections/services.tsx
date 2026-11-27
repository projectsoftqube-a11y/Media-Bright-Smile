import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Award, FileCheck2, IdCard, MessagesSquare } from "lucide-react";
import { serviceGroups } from "@/content/site";
import { topicImages as T } from "@/content/topic-images";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/* Every service page on the site, by its menu label, so the cards below link to real URLs only. */
const pages = new Map(serviceGroups.flatMap((g) => g.sections.flatMap((s) => s.links)).map((l) => [l.label, l.href]));
const to = (label: string, page = label) => {
  const href = pages.get(page);
  if (!href) throw new Error(`Services section: no page called "${page}"`);
  return { label, href };
};

/* Three groups with every link on show (no tabs). Group and link names follow the practice's own
   service list; where a page's menu name differs, the second argument is that page. */
const groups = [
  {
    id: "general",
    title: "General Dentistry",
    blurb: "Check-ups, cleanings, gum care and children's dentistry for the whole family.",
    image: T.happyPatient1,
    position: "30% 35%",
    href: "/preventative-care",
    more: "All general dentistry",
    links: [
      to("Family Dentistry"),
      to("Exam and Cleaning", "Teeth Cleaning & Check-Ups"),
      to("Periodontal Maintenance"),
      to("Dental Sealants"),
      to("Deep Teeth Cleaning"),
      to("Arestin"),
      to("Child Dentistry"),
      to("Emergency Dentistry"),
      to("Night Guards"),
      to("Fluoride", "Fluoride Treatment"),
    ],
  },
  {
    id: "cosmetic",
    title: "Cosmetic Dentistry",
    blurb: "Whiter, straighter, natural-looking smiles, planned around your own teeth.",
    image: T.whiteningShade,
    position: "60% 45%",
    href: "/cosmetic-dentistry",
    more: "All cosmetic dentistry",
    links: [
      to("Teeth Whitening"),
      to("Inlays and Onlays", "Inlays & Onlays"),
      to("Invisalign"),
      to("Dental Bonding"),
      to("Porcelain Veneers"),
    ],
  },
  {
    id: "restorative",
    title: "Restorative & Implant Dentistry",
    blurb: "Implants, crowns, bridges, dentures and root canals, all handled in the same practice.",
    image: T.implant2,
    position: "50% 50%",
    href: "/restorative-dentistry",
    more: "All restorative dentistry",
    links: [
      to("Dental Implants"),
      to("Dental Fillings"),
      to("Dental Crowns"),
      to("Dental Bridges"),
      to("Dentures"),
      to("Non-Surgical Root Canal"),
      to("Wisdom Teeth Removal"),
      to("Rebase & Repairs", "Denture Rebase & Repairs"),
      to("Soft Liners"),
      to("Oral Cancer Screening"),
    ],
  },
];

const care = [
  { label: "Why Choose Us", href: "/patient-information/why-choose-us", Icon: Award },
  { label: "Scheduling", href: "/patient-information/scheduling", Icon: FileCheck2 },
  { label: "Patient Registration", href: "/patient-information/patient-registration", Icon: IdCard },
  { label: "Patient Reviews", href: "/about-us/patient-reviews", Icon: MessagesSquare },
];

type Group = (typeof groups)[number];

function GroupCard({ g, index, className }: { g: Group; index: number; className?: string }) {
  const wide = g.id === "restorative"; // full width on tablets, so its photo crop and list go wider there
  return (
    <article
      aria-labelledby={`svc-${g.id}`}
      className={cn("flex h-full flex-col rounded-4xl bg-white p-2.5 shadow-soft ring-1 ring-line", className)}
    >
      <Link
        href={g.href}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          "group relative block aspect-[16/10] overflow-hidden rounded-3xl bg-mist",
          wide && "md:aspect-[21/8] lg:aspect-[16/10]",
        )}
      >
        <Image
          src={g.image.src}
          alt=""
          fill
          sizes={
            wide
              ? "(min-width: 1024px) 33vw, (min-width: 768px) 100vw, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          }
          className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
          style={{ objectPosition: g.position }}
        />
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute right-4 bottom-4 rounded-full bg-ink/80 px-3 py-1 text-sm font-semibold text-white tabular-nums">
          {g.links.length} services
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-3 pt-6 pb-3 sm:px-5">
        <h3
          id={`svc-${g.id}`}
          className="text-[clamp(1.375rem,1.1rem+0.7vw,1.75rem)] leading-tight font-bold tracking-tight text-balance"
        >
          <Link href={g.href} className="hover:text-brand-700">
            {g.title}
          </Link>
        </h3>
        <p className="mt-2 text-base leading-relaxed">{g.blurb}</p>

        <ul
          className={cn("mt-5 grid grid-cols-1 gap-x-8 border-t border-line", wide && "md:grid-cols-2 lg:grid-cols-1")}
        >
          {g.links.map((l) => (
            <li key={l.href} className="border-b border-line">
              <Link
                href={l.href}
                className="group flex min-h-12 items-center justify-between gap-3 py-2.5 font-medium text-ink transition-colors hover:text-brand-700"
              >
                <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                  {l.label}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-brand-500 transition-transform duration-500 group-hover:rotate-45"
                />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={g.href}
          className="group mt-auto inline-flex min-h-12 items-center gap-2 self-start pt-5 font-semibold text-brand-700 hover:text-brand-800"
        >
          {g.more}
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function Services() {
  const [general, cosmetic, restorative] = groups;
  return (
    <section className="relative bg-pearl section-y" aria-labelledby="services-heading">
      <div className="container-site">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Eyebrow>Our Services</Eyebrow>
            <SplitReveal
              as="h2"
              id="services-heading"
              className="mt-6 max-w-4xl text-display-md font-bold text-balance"
            >
              Advanced dental services in <span className="accent-serif text-brand-600">Media, PA</span>
            </SplitReveal>
          </div>
          <Reveal className="lg:col-span-4 lg:justify-self-end">
            <p className="max-w-sm text-lg leading-relaxed">
              Your wellness guides all that we do. Our natural dental care philosophy focuses on safe, mercury-free and
              minimally invasive procedures, including:
            </p>
          </Reveal>
        </div>

        {/* Desktop: three columns, the shorter cosmetic list shares its column with the help card.
            Tablet: general + cosmetic side by side, restorative full width below. Phone: one column. */}
        <RevealGroup className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <RevealItem>
            <GroupCard g={general} index={0} />
          </RevealItem>
          <RevealItem className="flex flex-col gap-5">
            <GroupCard g={cosmetic} index={1} className="h-auto" />
            <div className="flex flex-1 flex-col justify-center rounded-4xl border border-dashed border-brand-300 bg-white/60 p-6 sm:p-8">
              <p className="text-lg font-semibold text-ink">Not sure what you need?</p>
              <p className="mt-1.5">
                Book an exam and we&apos;ll walk you through every option and cost before any treatment.
              </p>
              <Button href="/contact-us" variant="dark" className="mt-5 self-start">
                Book a consultation
              </Button>
            </div>
          </RevealItem>
          <RevealItem className="md:col-span-2 lg:col-span-1">
            <GroupCard g={restorative} index={2} />
          </RevealItem>
        </RevealGroup>

        {/* Personalized care: the four patient shortcuts from the practice's original home page */}
        <Reveal className="mt-5">
          <div className="relative isolate grid grid-cols-1 items-center gap-8 overflow-hidden rounded-4xl bg-brand-700 p-6 text-white sm:p-10 lg:grid-cols-12 lg:gap-10 lg:px-14 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 -z-10 size-96 rounded-full border-[3.5rem] border-white/5"
            />
            <h3
              id="care-heading"
              className="text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] leading-tight font-bold text-balance text-white lg:col-span-4"
            >
              We provide personalized care
            </h3>
            <ul
              aria-labelledby="care-heading"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:col-span-8"
            >
              {care.map(({ label, href, Icon }) => (
                <li key={href}>
                  <Link href={href} className="group flex flex-col items-center gap-4 text-center">
                    <span className="grid size-[clamp(5.5rem,4.5rem+3vw,8rem)] place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition-all duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:bg-white group-hover:text-brand-700">
                      <Icon aria-hidden="true" strokeWidth={1.4} className="size-[45%]" />
                    </span>
                    <span className="text-sm font-bold tracking-[0.12em] uppercase">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
