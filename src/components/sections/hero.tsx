"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Phone } from "lucide-react";
import { serviceGroups, site, type NavLink } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BrandTooth } from "@/components/ui/icons";
import { Marquee } from "@/components/ui/marquee";
import { gsap, useGSAP, whenIdle } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* Hero photos: a crossfading slideshow, like the slider on the practice's previous site. The client
   asked (feedback doc, Nov 2026) for four pictures: inside the office, outside the office, a treatment
   room and a family. It opens on the reception photo. WebP sizes come from scripts/optimize-images.mjs
   (office) or were exported at three widths (family). The first photo is the LCP element: plain img,
   loaded first at high priority; the others are added after the page has loaded, so they never
   compete with it. */
const officeSlide = (file: string, alt: string, position: string) => ({
  src: `/_img/office/${file}-1920.webp`,
  srcSet: [828, 1200, 1920].map((w) => `/_img/office/${file}-${w}.webp ${w}w`).join(", "),
  alt,
  position,
});
const slides = [
  officeSlide("office-5", "The Media Brite Smile reception desk and logo wall", "object-[70%_50%]"),
  officeSlide(
    "office-sign",
    "The Media Brite Smile building and roadside sign at 6-8 North Pennell Road, Media, PA",
    "object-[78%_45%]",
  ),
  officeSlide("operatory-1", "A bright treatment room at Media Brite Smile", "object-[60%_50%]"),
  {
    // AI-generated for this site (see docs/image-licenses.md): never to be captioned as a patient
    src: "/images/hero/family-hero-1920.webp",
    srcSet: [828, 1280, 1920].map((w) => `/images/hero/family-hero-${w}.webp ${w}w`).join(", "),
    alt: "A smiling family: mom, dad and their daughter",
    position: "object-[100%_25%] lg:object-[100%_0%]",
  },
];
// Desktop: the photo covers the right 62-66% of the screen. Below 1024px: full width.
const SIZES = "(min-width: 1024px) 66vw, 100vw";
const INTERVAL = 6000;

/** Rotates the hero photos. Waits for idle time before adding the other slides, pauses while the hero is
    off screen or the tab is hidden, and stays on the first photo for reduced-motion users. */
function useSlideshow(count: number, root: RefObject<HTMLElement | null>) {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const ready = () => setLoaded(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(ready, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(ready, 1500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  useEffect(() => {
    if (!loaded || !visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % count);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [loaded, visible, count, active]);

  return { loaded, active, setActive };
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { loaded, active, setActive } = useSlideshow(slides.length, root);

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
        {/* The layer spans the photo too, so it lets clicks through to the slide picker; the copy itself stays clickable */}
        <div className="pointer-events-none relative z-10 container-site grid grid-cols-1 items-center lg:flex-1 lg:grid-cols-12">
          <div data-hero-copy className="pointer-events-auto py-6 lg:col-span-6">
            <div className="hero-rise">
              <Eyebrow>
                Family · Cosmetic · Implant<span className="hidden sm:inline">&nbsp;Dentistry</span>
              </Eyebrow>
            </div>
            {/* Three lines ("Family, Implant," / "and Cosmetic Dentist" / "in Media"), each its own mask so the
                lines slide up one after another. The size follows the column width, so the longest line fits. */}
            <h1
              id="hero-title"
              className="mt-7 flex flex-col items-start text-[clamp(1.75rem,0.9rem+4.4vw,3.5rem)] leading-[1.04] font-bold tracking-[-0.035em] text-ink lg:text-[clamp(2.75rem,4.6vw,4.75rem)]"
            >
              <span className="line-mask">
                <span>Family, Implant,</span>
              </span>{" "}
              <span className="line-mask">
                <span style={delay(0.08)}>and Cosmetic Dentist</span>
              </span>{" "}
              <span className="line-mask">
                <span style={delay(0.16)}>
                  in <span className="text-gradient-brand pr-1">Media</span>
                </span>
              </span>
            </h1>
            <p className="hero-rise mt-7 max-w-2xl text-lg leading-relaxed text-body lg:text-xl" style={delay(0.3)}>
              {site.name} is a family, cosmetic, and implant dental practice conveniently located in Media,
              Pennsylvania. Our practice is committed to delivering high-quality, personalized care in a professional
              and comfortable environment. We welcome new patients.
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

        {/* ---------------- Photo slideshow ----------------
            Desktop: pinned to the right edge, its left side melting into the page through a
            gradient mask (no hard edge, so it never reads as a boxed or full-screen image).
            Below 1024px: full width under the copy, fading in from the top.
            Slides crossfade (opacity only) with a slow zoom on the photo on show (transform only). */}
        <div className="relative min-h-[clamp(20rem,70vw,34rem)] flex-1 mask-[linear-gradient(to_bottom,transparent,rgb(0_0_0/0.6)_16%,#000_34%)] lg:absolute lg:top-(--header-h) lg:right-0 lg:bottom-0 lg:h-auto lg:min-h-0 lg:w-[66%] lg:mask-[linear-gradient(to_right,transparent_6%,rgb(0_0_0/0.45)_24%,#000_42%),linear-gradient(to_bottom,transparent,#000_6%)] lg:mask-intersect max-[1199px]:lg:w-[62%]">
          {slides.map((slide, i) =>
            i === 0 || loaded ? (
              /* eslint-disable-next-line @next/next/no-img-element -- pre-built WebP sizes, picked by the browser through srcSet */
              <img
                key={slide.src}
                src={slide.src}
                srcSet={slide.srcSet}
                sizes={SIZES}
                alt={i === active ? slide.alt : ""}
                aria-hidden={i === active ? undefined : true}
                width={1920}
                height={1280}
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
                decoding={i === 0 ? undefined : "async"}
                className={cn("absolute inset-0 size-full object-cover", slide.position)}
                /* showing: fade in, then drift from 106% to 100% over the slide's time on screen.
                   hidden: fade out first, and only then reset the zoom, so it never jumps while visible. */
                style={
                  i === active
                    ? {
                        opacity: 1,
                        transform: "scale(1)",
                        transition: "opacity 1.4s ease-in-out, transform 7.5s ease-out",
                      }
                    : {
                        opacity: 0,
                        transform: "scale(1.06)",
                        transition: "opacity 1.4s ease-in-out, transform 0s linear 1.4s",
                      }
                }
              />
            ) : null,
          )}

          {/* Slide picker */}
          {loaded && (
            <div className="absolute right-4 bottom-4 z-10 flex gap-1 rounded-full bg-ink/45 p-1 sm:right-6 sm:bottom-6">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1} of ${slides.length}`}
                  aria-current={i === active ? "true" : undefined}
                  className="group grid h-6 min-w-6 place-items-center px-1"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-500",
                      i === active ? "w-6 bg-white" : "w-1.5 bg-white/60 group-hover:bg-white",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
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
