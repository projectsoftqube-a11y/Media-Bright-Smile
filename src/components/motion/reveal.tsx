"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { ease, inView } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** false = rise only, visible from first paint. Use above the fold: content that starts at
      opacity 0 cannot count as painted (LCP) until JavaScript has loaded and run. */
  fade?: boolean;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children">;

/** Fade + rise into view once. The workhorse entrance for blocks and cards. */
export function Reveal({ children, delay = 0, y = 40, fade = true, className, ...props }: RevealProps) {
  return (
    <motion.div
      initial={fade ? { opacity: 0, y } : { y }}
      whileInView={fade ? { opacity: 1, y: 0 } : { y: 0 }}
      viewport={inView}
      transition={{ duration: 1, ease: ease.out, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Parent that staggers direct <RevealItem> children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 36 }: { children: ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: ease.out } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
