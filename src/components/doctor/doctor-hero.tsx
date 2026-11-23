import Image from "next/image";
import { Phone } from "lucide-react";
import { site } from "@/content/site";
import type { Doctor, DoctorProfile } from "@/content/doctors";
import { Button } from "@/components/ui/button";
import { Seal } from "@/components/ui/seal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ToothWatermark } from "@/components/ui/icons";
import { WordReveal } from "@/components/motion/split-words";
import { Reveal } from "@/components/motion/reveal";
import { ImageReveal } from "@/components/motion/image-reveal";

/** Rotating credential seal (SVG text on a circle). */
export function DoctorHero({ doctor, profile }: { doctor: Doctor; profile: DoctorProfile }) {
  const parts = doctor.name.split(" ");
  const surname = parts.pop();
  const given = parts.join(" ");

  return (
    <section className="relative bg-pearl pt-30 pb-10 lg:pt-36 lg:pb-14" aria-labelledby="doctor-name">
      <div className="container-site">
        <div className="relative isolate overflow-hidden rounded-5xl bg-ink text-white">
          {/* decor */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 -left-32 size-140 rounded-full glow-blob text-brand-500/25" />
            <div className="absolute right-0 -bottom-48 size-120 rounded-full glow-blob text-glow/15" />
            <ToothWatermark size={620} className="absolute -right-40 -bottom-40 text-white/3" />
          </div>

          {/* hero keeps only the essentials: name, credential, focus, lead and the two actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-end">
            {/* copy */}
            <div className="flex flex-col p-6 pt-10 sm:p-10 lg:col-span-7 lg:self-center lg:py-16 lg:pr-6 lg:pl-14 xl:pl-16">
              <Eyebrow tone="light">Meet the doctor</Eyebrow>
              <WordReveal
                as="h1"
                id="doctor-name"

                className="mt-6 text-display-lg font-bold wrap-anywhere text-white max-[375px]:text-[2.125rem]"
              >
                {given} <span className="text-gradient-brand">{surname}</span>
              </WordReveal>

              <Reveal delay={0.15} fade={false}>
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-brand-700 px-3.5 py-1.5 text-xs font-bold tracking-[0.14em] text-white">
                    {doctor.credential}
                  </span>
                  <span className="rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-medium text-white/85">
                    {doctor.focus}
                  </span>
                </div>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">{profile.lead}</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href={site.bookingHref} size="lg">
                    {profile.bookLabel}
                  </Button>
                  <Button href={site.phone.href} variant="outline-light" size="lg" icon={<Phone className="size-4" />}>
                    Call {site.phone.display}
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* portrait in an arch, standing on the bottom edge of the card */}
            <div className="relative px-6 sm:px-10 lg:col-span-5 lg:pt-12 lg:pr-12 lg:pl-0">
              <ImageReveal
                immediate
                delay={0.2}
                className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-t-full bg-linear-to-b from-brand-400 to-brand-700 ring-1 ring-white/10 lg:mr-0"
              >
                <Image
                  src={doctor.image}
                  alt={`${doctor.name}, ${doctor.credential}`}
                  fill
                  preload
                  data-reveal-media
                  sizes="(min-width:1024px) 40vw, 90vw"
                  className="object-cover"
                  style={{ objectPosition: doctor.position }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/60 to-transparent" />
              </ImageReveal>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 lg:top-1/2 lg:bottom-auto lg:left-[max(0rem,calc(100%-35rem))] lg:-translate-y-1/2">
                <Seal id="doctor-seal" text={`${site.name} • ${doctor.credential} • ${site.name} • `} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
