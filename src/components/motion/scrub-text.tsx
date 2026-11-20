"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, whenIdle } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Large statement text whose words light up as you scroll through it.
 * Wrap text runs in <span data-scrub>; inline media in <span data-pill>.
 */
export function ScrubText({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    (context) => {
      const el = ref.current;
      if (!el) return;
      return whenIdle(context, () => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          SplitText.create(el.querySelectorAll("[data-scrub]"), {
            type: "words",
            autoSplit: true,
            /* no aria-label on the wrapping <span> (not allowed on a plain span); the words stay readable */
            aria: "none",
            /* own compositor layer per word, so the scrubbed opacity never repaints the paragraph */
            wordsClass: "will-change-[opacity]",
            onSplit(self) {
              return gsap.fromTo(
                self.words,
                /* 0.55, not lower: the unlit words must still pass WCAG contrast for large text
                 (ink at 55% on white = 3.9:1, the minimum is 3:1); 0.14 was 1.3:1 */
                { opacity: 0.55 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
                },
              );
            },
          });
          gsap.from(el.querySelectorAll("[data-pill]"), {
            scale: 0.4,
            opacity: 0,
            rotate: -8,
            stagger: 0.15,
            ease: "back.out(1.6)",
            duration: 1,
            scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none none" },
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={cn(className)}>
      {children}
    </p>
  );
}
