"use client";

import { useRef, type CSSProperties } from "react";
import { Phone } from "lucide-react";
import { serviceGroups, site, type NavLink } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BrandTooth } from "@/components/ui/icons";
import { Marquee } from "@/components/ui/marquee";
import { gsap, useGSAP, whenIdle } from "@/lib/gsap";

/* Hero photo: an original AI-generated image made for this site (see docs/image-licenses.md).
   It is composed for this layout: the family on the right, bright empty window light on the
   left that melts into the page. Images are served unoptimised (next.config.ts), so the sizes
   are pre-built WebP files and the browser picks one through srcSet. */
const heroPhoto = {
  src: "/images/hero/family-hero-1920.webp",
  srcSet: [828, 1280, 1920].map((w) => `/images/hero/family-hero-${w}.webp ${w}w`).join(", "),
  // Desktop: the photo covers the right 62-66% of the screen. Below 1024px: full width.
  sizes: "(min-width: 1024px) 66vw, 100vw",
  alt: "A smiling family: mom, dad and their daughter",
};

export function Hero() {
  const root = useRef<HTMLElement>(null);

  /* The entrance (headline lines sliding up out of a mask, then the eyebrow, paragraph and buttons
     rising into place) is plain CSS, see .line-mask / .hero-rise in globals.css. It starts with the
     first paint instead of waiting for JavaScript, which on a phone arrives seconds later: the copy
     is readable at once (LCP) and the screen settles early (Speed Index). Reduced motion: the global
     rule in globals.css cuts the animations to ~0ms. */
  const delay = (d: number) => ({ "--d": `${d}s` }) as CSSProperties;

  // Scroll: the copy lifts away gently while the photo stays put (set up off the hydration path)
  useGSAP(
    (context) => {
      const el = root.current!;
      return whenIdle(context, () => {
        gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
          gsap.to("[data-hero-copy]", {
            y: -60,
            opacity: 0.4,
            ease: "none",
            scrollTrigger: { trigger: el, start: "25% top", end: "bottom top", scrub: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    /* One screen tall: 100svh (the mobile-safe 100vh) holds the fixed header (120px at every width:
       40px announcement bar + 80px nav, mirrored in --header-h), the hero and the service ribbon.
       min-h rather than h, so on a short screen the section grows instead of clipping the copy. */
    <section
      ref={root}
      className="relative flex min-h-svh flex-col overflow-hidden bg-pearl [--header-h:7.5rem]"
      aria-labelledby="hero-title"
    >
      <div className="relative flex flex-1 flex-col pt-(--header-h)">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 size-160 rounded-full glow-blob text-brand-200/45" />
        </div>

        {/* ---------------- Content ---------------- */}
        <div className="relative z-10 container-site grid grid-cols-1 items-center lg:flex-1 lg:grid-cols-12">
          <div data-hero-copy className="py-6 lg:col-span-6">
            <div className="hero-rise">
              <Eyebrow>
                Family · Cosmetic · Implant<span className="hidden sm:inline">&nbsp;Dentistry</span>
              </Eyebrow>
            </div>
            <h1 id="hero-title" className="mt-7 text-display-xl font-bold text-ink">
              <span className="line-mask">
                <span>Dentist in</span>
              </span>{" "}
              <span className="line-mask">
                <span className="text-gradient-brand pr-1" style={delay(0.1)}>
                  Media, PA
                </span>
              </span>
            </h1>
            <p className="hero-rise mt-7 max-w-xl text-lg leading-relaxed text-body lg:text-xl" style={delay(0.3)}>
              {site.name} is a family, cosmetic and implant dental practice at 8 N Pennell Rd in Media, Pennsylvania,
              serving Delaware County. Check-ups through to implants, handled by three dentists in one place. New
              patients welcome.
            </p>
            <div className="hero-rise mt-9 flex flex-wrap items-center gap-3" style={delay(0.45)}>
              <Button href={site.bookingHref} size="lg">
                Request an Appointment
              </Button>
              <Button href={site.phone.href} variant="outline" size="lg" icon={<Phone className="size-4" />}>
                Call {site.phone.display}
              </Button>
            </div>
          </div>
        </div>

        {/* ---------------- Family photo ----------------
            Desktop: pinned to the right edge, its left side melting into the page through a
            gradient mask (no hard edge, so it never reads as a boxed or full-screen image).
            Below 1024px: full width under the copy, fading in from the top.
            The photo is the LCP element: visible from first paint, never animated in. */}
        <div className="relative min-h-[clamp(20rem,70vw,34rem)] flex-1 mask-[linear-gradient(to_bottom,transparent,rgb(0_0_0/0.6)_16%,#000_34%)] lg:absolute lg:top-(--header-h) lg:right-0 lg:bottom-0 lg:h-auto lg:min-h-0 lg:w-[66%] lg:mask-[linear-gradient(to_right,transparent,rgb(0_0_0/0.55)_16%,#000_34%),linear-gradient(to_bottom,transparent,#000_6%)] lg:mask-intersect max-[1199px]:lg:w-[62%]">
          {/* eslint-disable-next-line @next/next/no-img-element -- images are unoptimised site-wide, so a plain img with a pre-built srcSet is what lets phones get the small file */}
          <img
            src={heroPhoto.src}
            srcSet={heroPhoto.srcSet}
            sizes={heroPhoto.sizes}
            alt={heroPhoto.alt}
            width={1920}
            height={1280}
            fetchPriority="high"
            loading="eager"
            /* Crop: anchored right, so any trimming eats the empty window light on the left
               and never the family. */
            className="absolute inset-0 size-full object-cover object-[100%_25%] lg:object-[100%_0%]"
          />
        </div>
      </div>

      {/* Service ribbon */}
      <div className="relative shrink-0 border-y border-line bg-white py-6">
        <Marquee duration={45}>
          {serviceGroups
            .flatMap<NavLink>((g) => g.links.slice(0, 5))
            .map((l) => (
              <span key={l.href} className="flex items-center">
                <span className="px-8 text-2xl font-semibold tracking-tight text-ink/80 md:text-3xl">{l.label}</span>
                <BrandTooth size={22} className="opacity-70" />
              </span>
            ))}
        </Marquee>
      </div>
    </section>
  );
}
