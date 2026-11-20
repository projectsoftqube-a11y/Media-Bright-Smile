import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Seamless CSS marquee: content is duplicated once; pauses on hover.
 * `stretch` makes every item the height of the tallest one (e.g. equal-height cards).
 */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  stretch = false,
  loop = true,
  className,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  stretch?: boolean;
  /** false leaves out the loop's second copy (a caller can add it after load to keep hydration light) */
  loop?: boolean;
  className?: string;
}) {
  const align = stretch ? "items-stretch" : "items-center";
  return (
    <div
      className={cn(
        "group/marquee flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
    >
      <div
        className="flex w-max shrink-0 animate-marquee group-hover/marquee:[animation-play-state:paused]"
        style={
          { animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties
        }
      >
        <div className={cn("flex shrink-0", align)}>{children}</div>
        {/* the loop's second copy: hidden from screen readers and inert, so its links and buttons can't take focus */}
        {loop && (
          <div className={cn("flex shrink-0", align)} aria-hidden="true" inert>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
