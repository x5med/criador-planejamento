import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
// The SVG loading screenshot intentionally keeps a font request pending.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = "1";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageRoot = process.env.PATH.split(path.delimiter).find(item => fs.existsSync(path.resolve(item, "../playwright/package.json")));
const { chromium } = require(process.env.PLAYWRIGHT_PATH || path.resolve(packageRoot || "node_modules/.bin", "../playwright"));
const ts = require(path.join(root, "node_modules/typescript"));
const demo = { exports: {} };
new Function("exports", "module", ts.transpileModule(fs.readFileSync(path.join(root, "lib/demo.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(demo.exports, demo);
const output = path.join(root, "design/implementation/verification/light-theme"); fs.mkdirSync(output, { recursive: true });
const baseURL = process.env.TEST_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const results = [];
async function check(name, run) {
  try { results.push({ name, pass: true, evidence: await run() }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, pass: false, error: String(error.stack || error) }); console.log(`FAIL ${name}: ${error.message}`); }
  finally { for (const context of browser.contexts()) await context.close(); }
}
async function makePage({ width = 1440, motion = "reduce", session = null, holdFont = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: "dark", reducedMotion: motion });
  const page = await context.newPage(); page.setDefaultTimeout(8500);
  let releaseFont; const fontGate = new Promise(resolve => { releaseFont = resolve; });
  if (holdFont) await page.route(/\.woff2(?:\?|$)/, async route => { await fontGate; await route.continue(); });
  const errors = [], posts = []; page.on("pageerror", error => errors.push(error.message)); page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) posts.push(request.url()); });
  await page.route("**/api/status", route => route.fulfill({ json: { configured: false, provider: "demo", model: "demonstração local" } }));
  if (session) await page.addInitScript(session => localStorage.setItem("x5-strategic-planner-session-v1", JSON.stringify(session)), session);
  await page.goto(`${baseURL}${session ? "/inicio" : "/login"}`, { waitUntil: "domcontentloaded" });
  return { page, context, errors, posts, releaseFont };
}

for (const width of [1440, 390]) await check(`Login ${width}px remains X5 light under dark OS preference; modules and CTA work`, async () => {
  const { page, errors, posts } = await makePage({ width });
  const login = page.locator(".x5-access"); await login.waitFor(); await page.evaluate(() => document.fonts.ready);
  assert.equal(await login.evaluate(element => getComputedStyle(element).backgroundColor), "rgb(231, 235, 228)");
  assert.match(await page.locator("html").evaluate(element => getComputedStyle(element).colorScheme), /^light(?: only)?$/);
  const demoLink = page.getByRole("link", { name: "Explorar demonstração", exact: true });
  assert.equal(await demoLink.evaluate(element => getComputedStyle(element).backgroundColor), "rgb(216, 243, 106)");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: path.join(output, `login-${width}-dark-os.png`), fullPage: true });
  if (width < 600) await page.getByRole("button", { name: "Conheça os módulos", exact: true }).click();
  const module = page.getByRole("button", { name: "Diagnóstico", exact: true }); await module.focus(); await page.keyboard.press("Enter");
  const panel = page.getByRole("region", { name: "Diagnóstico", exact: true }); await panel.waitFor();
  await panel.screenshot({ path: path.join(output, `module-${width}.png`) });
  await page.getByRole("button", { name: "Fechar detalhes de Diagnóstico", exact: true }).focus(); await page.keyboard.press("Escape"); await panel.waitFor({ state: "hidden" });
  assert.equal(await module.evaluate(element => document.activeElement === element), true);
  await demoLink.click(); await page.getByRole("button", { name: "Gerar planejamento", exact: true }).first().click();
  await page.getByRole("textbox", { name: /organização/i }).waitFor(); await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  assert.equal(await page.evaluate(() => localStorage.length), 0); assert.deepEqual(errors, []); assert.deepEqual(posts, []);
});

await check("Official Grupo X5 SVG final frame has visible black logo and no rectangular background", async () => {
  const { page, errors, releaseFont } = await makePage({ motion: "no-preference", holdFont: true });
  const logo = page.locator('.x5-preloader__logo[data-brand="grupo-x5"]'); await logo.waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll(".x5-logo-fill")].every(path => parseFloat(getComputedStyle(path).opacity) > 0.999));
  assert.equal(await page.locator(".x5-preloader").evaluate(element => getComputedStyle(element).backgroundColor), "rgb(231, 235, 228)");
  assert.equal(await page.locator("video,video source").count(), 0);
  assert.equal(await logo.locator("image,foreignObject").count(), 0);
  const box = await logo.boundingBox();
  const image = await page.screenshot({ path: path.join(output, "svg-final-light.png") });
  const pixels = await page.evaluate(async ({ data, box }) => {
    const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const painter = canvas.getContext("2d"); painter.drawImage(image, 0, 0);
    const corners = [[box.x + 2, box.y + 2], [box.x + box.width - 3, box.y + 2], [box.x + 2, box.y + box.height - 3], [box.x + box.width - 3, box.y + box.height - 3]].map(([x, y]) => [...painter.getImageData(Math.round(x), Math.round(y), 1, 1).data]);
    const dataBox = painter.getImageData(Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)).data;
    let darkPixels = 0; for (let index = 0; index < dataBox.length; index += 4) if (dataBox[index] < 80 && dataBox[index + 1] < 80 && dataBox[index + 2] < 80) darkPixels++;
    return { corners, darkPixels };
  }, { data: image.toString("base64"), box });
  for (const corner of pixels.corners) for (let channel = 0; channel < 3; channel++) assert.ok(Math.abs(corner[channel] - [231, 235, 228][channel]) <= 2, JSON.stringify(pixels));
  assert.ok(pixels.darkPixels > 1000, "Official vector logo must be visible");
  releaseFont(); await page.locator(".x5-preloader").waitFor({ state: "hidden" });
  assert.deepEqual(errors, []); return { brand: "grupo-x5", ...pixels };
});

await check("Saved plan remains light under dark OS preference and has no theme switch", async () => {
  const context = { organization: "Verificação X5", sector: "Saúde", horizon: "Próximos 24 meses", challenge: "Crescer com margem sustentável" };
  const answers = [];
  const plan = demo.exports.buildDemoPlan(context, answers);
  const session = { ...context, id: "light-qa", answers, plan, phase: "context", askedQuestionIds: [], readiness: 100, missingTopics: [], provider: "demo", createdAt: "2026-09-30", updatedAt: "2026-09-30" };
  const { page, errors, posts } = await makePage({ session });
  await page.locator(".result-stage").waitFor(); await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator(".result-dark").count(), 0); assert.equal(await page.getByRole("button", { name: /Ativar tema/i }).count(), 0);
  assert.match(await page.locator("html").evaluate(element => getComputedStyle(element).colorScheme), /^light(?: only)?$/);
  await page.getByRole("tab", { name: "Diagnóstico", exact: true }).first().click(); await page.getByRole("tab", { name: "Visão geral", exact: true }).first().click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: path.join(output, "results-light-dark-os.png"), fullPage: true }); assert.deepEqual(errors, []); assert.deepEqual(posts, []);
});

await browser.close(); fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ date: new Date().toISOString(), baseURL, results }, null, 2));
console.log(JSON.stringify({ passed: results.filter(result => result.pass).length, failed: results.filter(result => !result.pass).length, output }));
if (results.some(result => !result.pass)) process.exitCode = 1;
