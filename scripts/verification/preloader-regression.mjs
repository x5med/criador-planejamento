import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
// Capture a deliberately font-pending browser without changing its readiness state.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = "1";
const require = createRequire(import.meta.url), root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageRoot = process.env.PATH.split(path.delimiter).find(item => fs.existsSync(path.resolve(item, "../playwright/package.json")));
const { chromium } = require(process.env.PLAYWRIGHT_PATH || path.resolve(packageRoot || "node_modules/.bin", "../playwright"));
const ts = require(path.join(root, "node_modules/typescript")), demo = { exports: {} };
new Function("exports", "module", ts.transpileModule(fs.readFileSync(path.join(root, "lib/demo.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(demo.exports, demo);
const output = path.resolve(root, process.env.TEST_OUTPUT || "design/implementation/verification/loading-real"), baseURL = process.env.TEST_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const results = [], logoSelector = 'svg[data-brand="grupo-x5"]'; fs.mkdirSync(output, { recursive: true });
const officialSVG = fs.readFileSync(path.join(root, "public/brand/grupo-x5.svg"), "utf8");
const contours = paths => paths.flatMap(d => d.split(/(?=M)/).filter(Boolean)).map(part => part.replace(/[Z\s,]/gi, "")).sort();
const officialPaths = [...officialSVG.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(match => match[1]);
async function check(name, run) {
  if (process.env.TEST_FILTER && !new RegExp(process.env.TEST_FILTER, "i").test(name)) return;
  try { results.push({ name, pass: true, evidence: await run() }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, pass: false, error: String(error.stack || error) }); console.log(`FAIL ${name}: ${error.message}`); }
  finally { for (const context of browser.contexts()) await context.close(); }
}
async function makePage({ width = 1440, reducedMotion = "no-preference", holdFont = false, route = "/login" } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion, colorScheme: "dark" }); const page = await context.newPage(); page.setDefaultTimeout(8500);
  const media = [], errors = [], posts = [], heldFonts = []; let releaseFont; const fontGate = new Promise(resolve => { releaseFont = resolve; });
  if (holdFont) await page.route(/\.woff2(?:\?|$)/, async request => { heldFonts.push(request.request().url()); await fontGate; await request.continue(); });
  page.on("pageerror", error => errors.push(error.message)); page.on("request", request => { if (request.resourceType() === "media" || /\.(webm|mp4|mov)(\?|$)/i.test(request.url())) media.push(request.url()); if (!["GET", "HEAD"].includes(request.method())) posts.push(request.url()); });
  await page.route("**/api/status", request => request.fulfill({ json: { configured: false, provider: "demo", model: "demonstração local" } }));
  await page.addInitScript(() => {
    window.__loadingQA = { samples: [], loadedAt: null };
    window.addEventListener("load", () => { window.__loadingQA.loadedAt = performance.now(); });
    function frame() { const svg = document.querySelector('.x5-preloader svg[data-brand="grupo-x5"]'); if (svg) window.__loadingQA.samples.push({ time: performance.now(), dash: [...svg.querySelectorAll(".x5-logo-outline")].map(p => parseFloat(getComputedStyle(p).strokeDashoffset)), fill: [...svg.querySelectorAll(".x5-logo-fill")].map(p => parseFloat(getComputedStyle(p).opacity)) }); requestAnimationFrame(frame); } requestAnimationFrame(frame);
  });
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" }); return { page, context, media, errors, posts, heldFonts, releaseFont };
}
async function released(page) { await page.locator(".x5-preloader").waitFor({ state: "hidden" }); assert.equal(await page.locator(".preloader-content").getAttribute("inert"), null); assert.equal(await page.getByRole("button", { name: "Pular animação", exact: true }).count(), 0); }
async function official(logo) { assert.equal(await logo.getAttribute("viewBox"), officialSVG.match(/viewBox="([^"]+)"/)[1]); assert.deepEqual(contours(await logo.locator(".x5-logo-fill").evaluateAll(paths => paths.map(p => p.getAttribute("d")))), contours(officialPaths)); }
async function waitLoad(page) { await page.waitForFunction(() => document.readyState === "complete" && document.fonts.status === "loaded"); await released(page); }

await check("Real font loading keeps official SVG looping beyond 3s; completion releases immediately", async () => {
  const { page, heldFonts, releaseFont, media, errors, posts } = await makePage({ holdFont: true }); const logo = page.locator(`.x5-preloader ${logoSelector}`); await logo.waitFor(); await official(logo);
  await page.waitForFunction(() => { const s = window.__loadingQA.samples; return s.length && s.at(-1).time - s[0].time > 3100; });
  assert.ok(heldFonts.length > 0); assert.equal(await page.locator(".x5-preloader").isVisible(), true); assert.equal(await page.getByRole("button", { name: "Pular animação", exact: true }).count(), 0);
  const samples = await page.evaluate(() => window.__loadingQA.samples);
  assert.ok(samples.some((sample, index) => index && sample.dash[0] - samples[index - 1].dash[0] > 0.2), "Contour must restart while loading remains pending");
  await page.screenshot({ path: path.join(output, "font-pending-loop.png") }); const started = Date.now(); releaseFont(); await waitLoad(page); const releasedAfterMs = Date.now() - started; assert.ok(releasedAfterMs < 1500, `${releasedAfterMs}ms after resource resolved`);
  assert.equal(await page.locator("video,video source").count(), 0); assert.deepEqual(media, []); assert.deepEqual(errors, []); assert.deepEqual(posts, []); return { heldFontCount: heldFonts.length, pendingMs: samples.at(-1).time - samples[0].time, releasedAfterMs };
});
await check("Ready cached resources do not wait for a 2.4s brand cycle", async () => {
  const { page, media, errors, posts } = await makePage(); await waitLoad(page); await page.reload({ waitUntil: "load" }); const loaded = Date.now(); await released(page); const releasedAfterLoadMs = Date.now() - loaded; assert.ok(releasedAfterLoadMs < 1000);
  await page.getByRole("link", { name: "Explorar demonstração", exact: true }).click(); await page.getByRole("button", { name: "Gerar planejamento", exact: true }).first().waitFor(); assert.equal(await page.locator(".x5-preloader").count(), 0); assert.equal(await page.evaluate(() => localStorage.length), 0); assert.deepEqual(media, []); assert.deepEqual(errors, []); assert.deepEqual(posts, []); return { releasedAfterLoadMs };
});
await check("Reduced motion displays a static official SVG during real mobile loading", async () => {
  const { page, heldFonts, releaseFont, media, errors } = await makePage({ width: 390, reducedMotion: "reduce", holdFont: true }); const logo = page.locator(`.x5-preloader ${logoSelector}`); await logo.waitFor(); await official(logo);
  await page.waitForFunction(() => { const paths = [...document.querySelectorAll(".x5-preloader .x5-logo-fill")]; return paths.length === 4 && paths.every(path => parseFloat(getComputedStyle(path).opacity) === 1); });
  await page.waitForFunction(() => { const s = window.__loadingQA.samples; return s.length && s.at(-1).time - s[0].time > 3100; });
  const samples = await page.evaluate(() => window.__loadingQA.samples.slice(-60)); assert.ok(samples.every(sample => sample.fill.every(value => value === 1))); assert.ok(heldFonts.length > 0);
  const box = await logo.boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 390); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: path.join(output, "reduced-motion-mobile-pending.png") }); releaseFont(); await waitLoad(page); assert.deepEqual(media, []); assert.deepEqual(errors, []); return box;
});
await check("Pending interview API uses same SVG until response resolves", async () => {
  const { page, media, errors } = await makePage({ route: "/inicio" }); await waitLoad(page); let resolveAPI; const apiGate = new Promise(resolve => { resolveAPI = resolve; });
  const response = demo.exports.getDemoInterview("context", [], []); await page.route("**/api/interview", async request => { await apiGate; await request.fulfill({ json: response }); });
  await page.getByRole("button", { name: "Gerar planejamento", exact: true }).first().click(); await page.getByRole("textbox", { name: /organização/i }).fill("Grupo QA"); await page.getByRole("textbox", { name: /setor/i }).fill("Saúde"); await page.getByRole("textbox", { name: /desafio central/i }).fill("Crescer com margem"); await page.getByRole("button", { name: "Começar planejamento", exact: true }).click();
  const logo = page.locator(`.question-loading ${logoSelector}`); await logo.waitFor(); await official(logo);
  await page.waitForFunction(() => [...document.querySelectorAll(".question-loading .x5-logo-fill")].every(path => parseFloat(getComputedStyle(path).opacity) > 0.99));
  await page.screenshot({ path: path.join(output, "interview-api-pending.png") }); assert.equal(await page.locator(".question-loading").isVisible(), true);
  resolveAPI(); await page.getByText(response.question.prompt, { exact: true }).waitFor(); assert.equal(await page.locator(`.question-loading ${logoSelector}`).count(), 0); assert.deepEqual(media, []); assert.deepEqual(errors, []);
});
await browser.close(); const resultFile = path.join(output, "results.json"), prior = process.env.TEST_FILTER && fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, "utf8")).results : [];
fs.writeFileSync(resultFile, JSON.stringify({ date: new Date().toISOString(), baseURL, results: [...prior.filter(item => !results.some(result => result.name === item.name)), ...results] }, null, 2)); console.log(JSON.stringify({ passed: results.filter(item => item.pass).length, failed: results.filter(item => !item.pass).length, output })); if (results.some(item => !item.pass)) process.exitCode = 1;
