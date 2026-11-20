/**
 * next/image loader for pre-built responsive WebP files (scripts/optimize-images.mjs).
 *
 * Vercel's image optimiser is a paid allowance that ran out, so photos are resized at build
 * time instead: /images/office/office-41.jpg at 640px wide -> /_img/office/office-41-640.webp.
 * WIDTHS must match the script and deviceSizes + imageSizes in next.config.ts.
 */
const WIDTHS = [128, 256, 384, 640, 828, 1200, 1920];
const RASTER = /\.(jpe?g|png|webp)$/i;

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/images/") || !RASTER.test(src)) {
    // SVGs and anything outside /images are served as they are
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `/_img${src.slice("/images".length).replace(RASTER, "")}-${w}.webp`;
}
