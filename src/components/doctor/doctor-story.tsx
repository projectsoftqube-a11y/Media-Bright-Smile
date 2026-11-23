import Link from "next/link";
import type { ReactNode } from "react";
import type { Doctor, DoctorProfile } from "@/content/doctors";
import { isHidden } from "@/content/site";
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
    // a link to a hidden page (see hiddenPages in site.ts) is shown as plain text
    if (isHidden(m[2])) {
      parts.push(m[1]);
      last = m.index + m[0].length;
      continue;
    }
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
 * The doctor's bio, word for word from the practice's current website (client feedback, Nov 2026:
 * no quote heading, no subheadings or numbered chapters). The hero above already shows the photo,
 * name and credential, so this section is text only and does not repeat them (client feedback).
 */
export function DoctorStory({ doctor, profile }: { doctor: Doctor; profile: DoctorProfile }) {
  const [first, ...rest] = profile.bio;
  return (
    <section className="bg-white section-y" aria-labelledby="story-heading">
      <div className="container-site grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4 max-[1199px]:lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Eyebrow>About {doctor.short}</Eyebrow>
            <SplitReveal as="h2" id="story-heading" className="mt-6 text-display-md font-bold text-balance">
              Background, training and <span className="text-brand-600">life outside the office</span>
            </SplitReveal>
          </div>
        </div>
        <Reveal className="space-y-5 lg:col-span-8 lg:border-l lg:border-line lg:pl-16 max-[1199px]:lg:col-span-7 max-[1199px]:lg:pl-10">
          {first && (
            <p className="text-xl leading-relaxed font-medium text-ink lg:text-2xl lg:leading-normal">
              <BioText text={first} />
            </p>
          )}
          {rest.map((p) => (
            <p key={p.slice(0, 40)} className="max-w-3xl text-lg leading-relaxed">
              <BioText text={p} />
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
