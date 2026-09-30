import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const brandDirectory = path.dirname(fileURLToPath(import.meta.url));

// Run via npm exec --package=potrace; the conversion dependency is not part of the app.
const bin = process.env.PATH.split(path.delimiter).find(item => fs.existsSync(path.resolve(item, "../potrace/package.json")));
if (!bin) throw new Error("Run with npm exec --yes --package=potrace -- node design/implementation/brand/vectorize-logo.mjs");
const packagePath = path.resolve(bin, "../potrace/package.json");
const fromPackage = createRequire(packagePath);
const Jimp = fromPackage("jimp");
const { trace } = fromPackage("./lib");
const input = path.join(brandDirectory, "extracted-001.png");

(async () => {
  const mask = await Jimp.read(input);
  const { width, height, data } = mask.bitmap;
  let left = width, top = height, right = 0, bottom = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4] >= 128) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  const bounds = [left - 2, top - 2, right - left + 5, bottom - top + 5];
  const svg = await new Promise((resolve, reject) => trace(input, {
    blackOnWhite: false, threshold: 127, color: "#111111",
    turdSize: 0, optTolerance: 0.05, alphaMax: 1,
  }, (error, output) => error ? reject(error) : resolve(output)));
  const output = svg
    .replace(/viewBox="[^"]+"/, `viewBox="${bounds.join(" ")}"`)
    .replace(/width="[^"]+"/, `width="${bounds[2]}"`)
    .replace(/height="[^"]+"/, `height="${bounds[3]}"`)
    .replace(/<svg([^>]*)>/, '<svg$1 role="img" aria-labelledby="title"><title id="title">Grupo X5</title>');
  if (/<image|data:image|<script/i.test(output)) throw new Error("Expected only vector paths");
  const destination = path.resolve(brandDirectory, "../../../public/brand");
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, "grupo-x5.svg"), output);
  fs.writeFileSync(path.join(destination, "grupo-x5-white.svg"), output.replace(/#111111/g, "#ffffff"));
  fs.writeFileSync(path.join(brandDirectory, "conversion.json"), JSON.stringify({
    source: "grupox5 (1) copiar.pdf", sourceType: "embedded raster plus opacity mask",
    rasterSize: { width, height }, bounds, threshold: 127, optTolerance: 0.05,
    vectorPaths: (output.match(/<path/g) || []).length,
    embeddedImages: 0,
  }, null, 2));
  console.log(JSON.stringify({ bounds, bytes: Buffer.byteLength(output), vectorPaths: (output.match(/<path/g) || []).length }));
})();
