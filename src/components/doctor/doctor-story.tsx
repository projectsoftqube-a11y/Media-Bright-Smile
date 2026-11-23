import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Doctor, DoctorProfile } from "@/content/doctors";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Reveal } from "@/components/motion/reveal";

/** "[text](/href)" in a bio paragraph becomes an inline link. */
function BioText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      <Link
        key={m.index}
        href={m[2]}
        className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-700"
      >
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

/**
 * The doctor's bio as one short section, word for word from the practice's current website
 * (client feedback, Nov 2026: no quote heading, no subheadings or numbered chapters).
 */
export function DoctorStory({ doctor, profile }: { doctor: Doctor; profile: DoctorProfile }) {
  return (
    <section className="bg-white section-y" aria-labelledby="story-heading">
      <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Eyebrow>About {doctor.short}</Eyebrow>
          <SplitReveal as="h2" id="story-heading" className="mt-6 text-display-md font-bold text-balance">
            Meet <span className="text-brand-600">{doctor.name}</span>, {doctor.credential}
          </SplitReveal>
          <Reveal className="mt-8 max-w-3xl space-y-5">
            {profile.bio.map((p) => (
              <p key={p.slice(0, 40)} className="text-lg leading-relaxed">
                <BioText text={p} />
              </p>
            ))}
          </Reveal>
        </div>
        <Reveal className="lg:col-span-5" y={30}>
          <div className="relative aspect-4/5 overflow-hidden rounded-t-full rounded-b-4xl bg-mist shadow-soft ring-1 ring-line lg:sticky lg:top-32">
            <Image
              src={doctor.image}
              alt={`${doctor.name}, ${doctor.credential}`}
              fill
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover"
              style={{ objectPosition: doctor.position }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
