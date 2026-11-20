import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Treatment = {
  title: string;
  kicker: string;
  offer: string | null;
  image: string;
  position: string;
  href: string;
  /** "lg" = top-row feature card (7 + 5 columns), "sm" = bottom-row card (4 columns) */
  size: "lg" | "sm";
  span: string;
};

/* Bento: two feature cards on top (7 + 5 columns), three below (4 + 4 + 4).
   Tablet: Implants runs full width, then two rows of two. Phone: one column. */
const treatments: Treatment[] = [
  {
    title: "Dental Implants",
    kicker: "Feel and function like natural teeth",
    offer: "$500 off",
    image: "/images/services/implant-consult.jpg",
    position: "50% 40%",
    href: "/restorative-dentistry/dental-implants",
    size: "lg",
    span: "md:col-span-6 lg:col-span-7",
  },
  {
    title: "Invisalign®",
    kicker: "Straighter teeth, nearly invisible",
    offer: "$1,000 off",
    image: "/images/topics/aligner-smile.jpg",
    position: "35% 40%",
    href: "/cosmetic-dentistry/invisalign",
    size: "lg",
    span: "md:col-span-3 lg:col-span-5",
  },
  {
    title: "Teeth Whitening",
    kicker: "Take-home kit with lifetime refills",
    offer: "$100 off",
    image: "/images/services/whitening-result.jpg",
    position: "60% 40%",
    href: "/cosmetic-dentistry/teeth-whitening",
    size: "sm",
    span: "md:col-span-3 lg:col-span-4",
  },
  {
    title: "Porcelain Veneers",
    kicker: "Natural-looking, metal-free smile design",
    offer: null,
    image: "/images/services/natural-smile.jpg",
    position: "50% 50%",
    href: "/cosmetic-dentistry/porcelain-veneers",
    size: "sm",
    span: "md:col-span-3 lg:col-span-4",
  },
  {
    title: "Family & Kids",
    kicker: "Every generation, one office",
    offer: null,
    image: "/images/hero/young-patient-smile.jpg",
    position: "62% 40%",
    href: "/preventative-care/child-dentistry",
    size: "sm",
    span: "md:col-span-3 lg:col-span-4",
  },
];

function TreatmentCard({ t, index }: { t: Treatment; index: number }) {
  const lg = t.size === "lg";
  return (
    <Link
      href={t.href}
      className="group flex h-full flex-col rounded-4xl bg-white/[0.04] p-2.5 ring-1 ring-white/10 transition-colors duration-500 hover:bg-white/[0.07] hover:ring-white/20 focus-visible:ring-2 focus-visible:ring-glow focus-visible:outline-none"
    >
      {/* Photo */}
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-3xl bg-brand-950",
          // the full-width tablet card (Implants) gets a wider crop so it doesn't tower over the rest
          index === 0 && "md:aspect-[2/1]",
          lg ? "lg:aspect-auto lg:h-[clamp(16rem,19vw,22rem)]" : "lg:aspect-auto lg:h-[clamp(12rem,13vw,15rem)]",
        )}
      >
        <Image
          src={t.image}
          alt=""
          fill
          sizes={lg ? "(min-width: 1024px) 50vw, (min-width: 768px) 100vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
          className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
          style={{ objectPosition: t.position }}
        />
        {t.offer && (
          <span className="absolute top-4 left-4 rounded-full bg-glow px-3 py-1 text-sm font-bold text-ink tabular-nums">
            {t.offer}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-1 items-start gap-4 px-3 pt-5 pb-3 sm:px-4">
        <span className="pt-1.5 text-sm font-semibold text-white/40 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-bold tracking-tight text-balance text-white",
              lg ? "text-[clamp(1.5rem,1.1rem+1vw,2.25rem)] leading-tight" : "text-[clamp(1.375rem,1.1rem+0.6vw,1.75rem)] leading-snug",
            )}
          >
            {t.title}
          </h3>
          <p className="mt-1.5 text-base leading-relaxed text-white/65">{t.kicker}</p>
        </div>
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 text-white/80 transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-transparent group-hover:bg-brand-500 group-hover:text-white"
        >
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </Link>
  );
}

export function Signature() {
  return (
    <section className="relative bg-ink section-y text-white" aria-labelledby="signature-heading">
      <div className="container-site">
        {/* ---------------- Header: title left, intro + CTA right ---------------- */}
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Eyebrow tone="light">Signature Treatments</Eyebrow>
            <SplitReveal as="h2" id="signature-heading" className="mt-6 text-display-md font-bold text-white">
              Treatments our patients <span className="text-gradient-brand">love</span>
            </SplitReveal>
          </div>
          <Reveal className="lg:col-span-5">
            <p className="max-w-md text-lg leading-relaxed text-white/70">
              Life-changing implants, invisible aligners and natural-looking cosmetic work, planned with 3D imaging and
              placed with precision.
            </p>
            <Button href="/special-offers" variant="white" className="mt-6">
              See all special offers
            </Button>
          </Reveal>
        </div>

        {/* ---------------- Cards ---------------- */}
        <RevealGroup stagger={0.08} className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 lg:mt-16 lg:grid-cols-12 lg:gap-5">
          {treatments.map((t, i) => (
            <RevealItem key={t.title} className={t.span}>
              <TreatmentCard t={t} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
