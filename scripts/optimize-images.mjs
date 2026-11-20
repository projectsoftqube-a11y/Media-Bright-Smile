#!/usr/bin/env node
/**
 * Pre-builds responsive WebP copies of every photo in public/images, so next/image can serve
 * the right size for each screen without Vercel's paid image optimiser (its allowance ran out).
 *
 *   public/images/office/office-41.jpg  ->  public/_img/office/office-41-{128..1920}.webp
 *
 * src/lib/image-loader.ts maps every <Image> request to one of these files. The WIDTHS list
 * here must stay identical to the one in that loader and to deviceSizes + imageSizes in
 * next.config.ts. Runs automatically before `dev` and `build`; only new or changed photos
 * are processed, so repeat runs take a second or two.
 */
import { readdir, stat, mkdir } from "node:fs/promises";
import { join, relative, dirname, extname } from "node:path";
import { availableParallelism } from "node:os";
import sharp from "sharp";

export const WIDTHS = [128, 256, 384, 640, 828, 1200, 1920];
const QUALITY = 78;
const SRC = "public/images";
const OUT = "public/_img";
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (RASTER.has(extname(entry.name).toLowerCase())) yield path;
  }
}

const mtime = (p) => stat(p).then((s) => s.mtimeMs, () => 0);

async function processImage(file) {
  const rel = relative(SRC, file).replace(/\\/g, "/");
  const base = join(OUT, rel.slice(0, -extname(rel).length));
  const srcTime = await mtime(file);
  const todo = [];
  for (const w of WIDTHS) {
    const out = `${base}-${w}.webp`;
    if ((await mtime(out)) < srcTime) todo.push([w, out]);
  }
  if (!todo.length) return 0;
  await mkdir(dirname(base), { recursive: true });
  const input = sharp(file, { failOn: "none" }).rotate(); // honour EXIF orientation
  // Widths above the original are written at the original size, so every URL the loader can ask for exists.
  await Promise.all(
    todo.map(([w, out]) =>
      input.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 4 }).toFile(out),
    ),
  );
  return todo.length;
}

const started = Date.now();
const files = [];
for await (const f of walk(SRC)) files.push(f);

let written = 0;
let next = 0;
const workers = Array.from({ length: Math.max(2, Math.min(6, availableParallelism() - 1)) }, async () => {
  while (next < files.length) {
    const file = files[next++];
    try {
      const n = await processImage(file); // read the total only after the await, or parallel workers lose counts
      written += n;
    } catch (err) {
      console.error(`optimize-images: failed on ${file}: ${err.message}`);
      process.exitCode = 1;
    }
  }
});
await Promise.all(workers);

console.log(
  `optimize-images: ${files.length} photos, ${written} new WebP files, ${((Date.now() - started) / 1000).toFixed(1)}s`,
);
