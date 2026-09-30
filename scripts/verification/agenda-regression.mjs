import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url), root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packageRoot = process.env.PATH.split(path.delimiter).find(item => fs.existsSync(path.resolve(item, "../playwright/package.json")));
const { chromium } = require(process.env.PLAYWRIGHT_PATH || path.resolve(packageRoot || "node_modules/.bin", "../playwright"));
const ts = require(path.join(root, "node_modules/typescript"));
function loadLocalModule(file) {
  const local = { exports: {} }; const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function("exports", "module", "require", source)(local.exports, local, require); return local.exports;
}
const demo = loadLocalModule("lib/demo.ts");
const contextData = { organization: "Agenda QA", sector: "Saúde", horizon: "Próximos 24 meses", challenge: "Crescer com margem sustentável" };
const plan = demo.buildDemoPlan(contextData, []); plan.meta.generatedAt = "2026-09-30";
const kr = plan.objectives[0].keyResults[0], initiative = plan.initiatives[0];
plan.objectives = [{ ...plan.objectives[0], title: "Crescimento QA", keyResults: [
  { ...kr, id: "qa-kr-iso", metric: "Margem QA explícita", dueDate: "2026-10-12", owner: "Ana" },
  { ...kr, id: "qa-kr-br", metric: "Receita QA brasileira", dueDate: "12/11/2026", owner: "Bruno" },
  { ...kr, id: "qa-kr-invalid", metric: "KR QA inválido", dueDate: "31/02/2026", owner: "Ana" },
] }];
plan.initiatives = [
  { ...initiative, id: "qa-init-iso", title: "Iniciativa QA explícita", startDate: "2026-10-05", endDate: "2026-10-09", owner: "Ana" },
  { ...initiative, id: "qa-init-relative", title: "Iniciativa QA relativa", startDate: "Dia 15", endDate: "Dia 45", owner: "Bruno" },
  { ...initiative, id: "qa-init-unscheduled", title: "Iniciativa QA sem data", startDate: "A definir", endDate: "A definir", owner: "Ana" },
  { ...initiative, id: "qa-init-reversed", title: "Iniciativa QA intervalo inválido", startDate: "2026-10-12", endDate: "2026-10-01", owner: "Bruno" },
];
plan.first90Days = [
  { period: "Dias 1–30", deliverable: "Marco QA primeiro mês", owner: "Ana" },
  { period: "Dias 31–60", deliverable: "Marco QA segundo mês", owner: "Bruno" },
  { period: "", deliverable: "Marco QA sem período", owner: "Ana" },
];
plan.governance.cadences = [{ name: "Revisão QA semanal", frequency: "Semanal", purpose: "Remover bloqueios com evidências" }];
const session = { ...contextData, id: "agenda-regression", phase: "context", question: demo.getDemoInterview("context", [], []).question, answers: [], askedQuestionIds: [], readiness: 100, missingTopics: [], provider: "demo", createdAt: "2026-09-30T12:00:00Z", updatedAt: "2026-09-30T12:00:00Z", plan };
const output = path.resolve(root, process.env.TEST_OUTPUT || "design/implementation/verification/agenda"), baseURL = process.env.TEST_URL || "http://localhost:3000";
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const results = [];
async function check(name, run) {
  if (process.env.TEST_FILTER && !new RegExp(process.env.TEST_FILTER, "i").test(name)) return;
  try { results.push({ name, pass: true, evidence: await run() }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, pass: false, error: String(error.stack || error) }); console.log(`FAIL ${name}: ${error.message}`); }
  finally { for (const context of browser.contexts()) await context.close(); }
}
async function makePage({ width = 1440, data = session } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", acceptDownloads: true });
  const page = await context.newPage(); page.setDefaultTimeout(8000); const errors = [], posts = [];
  await page.addInitScript(data => localStorage.setItem("x5-strategic-planner-session-v1", JSON.stringify(data)), data);
  page.on("pageerror", error => errors.push(error.message)); page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) posts.push(request.url()); });
  await page.route("**/api/status", route => route.fulfill({ json: { configured: false, provider: "demo", model: "demonstração local" } }));
  await page.goto(`${baseURL}/inicio`); await page.locator(".x5-preloader").waitFor({ state: "hidden" });
  await page.getByRole("tab", { name: "Execução", exact: true }).first().click();
  return { page, errors, posts, original: JSON.stringify(data) };
}
async function unchanged({ page, errors, posts, original }) {
  assert.equal(await page.evaluate(() => localStorage.getItem("x5-strategic-planner-session-v1")), original);
  assert.deepEqual(errors, []); assert.deepEqual(posts, []);
}
async function openAgenda(page) { await page.getByRole("tab", { name: "Agenda", exact: true }).click(); }
async function capture(page, name) { await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true, animations: "disabled" }); }

// The six bounded checks below are finalized against the integrated public UI.
await check("Agenda date contracts: explicit/relative ranges, invalid dates, missing anchors and cadence immutability", async () => {
  const agenda = loadLocalModule("lib/agenda.ts"), before = JSON.stringify(plan), { events, anchor } = agenda.buildAgenda(plan);
  assert.equal(anchor, "2026-09-30"); assert.equal(agenda.parseDay("31/02/2026"), null); assert.equal(agenda.parseDay("2026-02-29"), null); assert.equal(agenda.parseDay("29/02/2024"), "2024-02-29"); assert.equal(agenda.parseDay("12/11/2026"), "2026-11-12");
  assert.equal(agenda.startOfWeek("2026-09-30"), "2026-09-28"); assert.equal(agenda.addDays("2026-09-30", 89), "2026-12-28"); assert.equal(agenda.daysBetween("2026-09-30", "2026-12-28"), 89);
  const find = title => events.find(event => event.title === title);
  assert.deepEqual([find("Iniciativa QA explícita").start, find("Iniciativa QA explícita").end], ["2026-10-05", "2026-10-09"]);
  assert.deepEqual([find("Iniciativa QA relativa").start, find("Iniciativa QA relativa").end], ["2026-10-14", "2026-11-13"]); assert.equal(find("Iniciativa QA relativa").relative, true);
  assert.deepEqual([find("Marco QA primeiro mês").start, find("Marco QA primeiro mês").end], ["2026-09-30", "2026-10-29"]);
  for (const title of ["Iniciativa QA sem data", "Iniciativa QA intervalo inválido", "Marco QA sem período", "Revisão QA semanal"]) { assert.equal(find(title).start, null, title); assert.equal(find(title).end, null, title); }
  assert.equal(events.length, 8); assert.equal(JSON.stringify(plan), before);
  const noAnchor = structuredClone(plan); noAnchor.meta.generatedAt = "Referência inválida"; const incomplete = agenda.buildAgenda(noAnchor);
  assert.equal(incomplete.anchor, null); assert.equal(incomplete.events.find(event => event.title === "Iniciativa QA relativa").start, null); assert.equal(incomplete.events.find(event => event.title === "Iniciativa QA explícita").start, "2026-10-05");
  return { eventCount: events.length, scheduled: events.filter(event => event.start && event.end).length, anchor };
});
await check("Month/week/90-day views, previous/next, Today and plan anchor show correct ranges", async () => {
  const data = await makePage(), { page } = data, agenda = loadLocalModule("lib/agenda.ts"); await openAgenda(page);
  const title = page.locator(".agenda-calendar__toolbar h3");
  assert.equal(await title.textContent(), agenda.formatDay("2026-09-01", { month: "long", year: "numeric" }));
  assert.ok((await page.locator(".agenda-calendar__footer").textContent()).includes(agenda.formatDay("2026-09-30"))); await capture(page, "desktop-month");
  await page.getByRole("button", { name: "Próximo período", exact: true }).click(); assert.equal(await title.textContent(), agenda.formatDay("2026-10-01", { month: "long", year: "numeric" }));
  await page.getByRole("button", { name: "Período anterior", exact: true }).click(); await page.getByRole("button", { name: "Início do plano", exact: true }).click(); await page.getByRole("button", { name: "Semana", exact: true }).click();
  assert.equal(await title.textContent(), `${agenda.formatDay("2026-09-28")} – ${agenda.formatDay("2026-10-04")}`); assert.equal(await page.locator(".agenda-week__day").count(), 7);
  await page.getByRole("button", { name: "Próximo período", exact: true }).click(); assert.equal(await title.textContent(), `${agenda.formatDay("2026-10-05")} – ${agenda.formatDay("2026-10-11")}`);
  await page.getByRole("button", { name: "Início do plano", exact: true }).click(); await page.getByRole("button", { name: "90 dias", exact: true }).click();
  assert.equal(await title.textContent(), `${agenda.formatDay("2026-09-30")} – ${agenda.formatDay("2026-12-28")}`); assert.equal(await page.locator(".agenda-quarter__period").count(), 3);
  assert.equal(await page.locator(".agenda-quarter__period h4").nth(0).textContent(), `${agenda.formatDay("2026-09-30")} – ${agenda.formatDay("2026-10-29")}`);
  await page.getByRole("button", { name: "Hoje", exact: true }).click(); const today = await page.evaluate(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
  assert.equal(await title.textContent(), `${agenda.formatDay(today)} – ${agenda.formatDay(agenda.addDays(today, 89))}`);
  await page.getByRole("button", { name: "Início do plano", exact: true }).click(); await capture(page, "desktop-90-days"); await unchanged(data);
});
await check("Type/owner filters, event details and source links preserve source data and keyboard focus", async () => {
  const data = await makePage(), { page } = data; await openAgenda(page); await page.getByRole("button", { name: "90 dias", exact: true }).click();
  await page.getByRole("combobox", { name: "Tipo", exact: true }).selectOption("initiative"); await page.getByRole("combobox", { name: "Responsável", exact: true }).selectOption("Ana");
  const titles = await page.locator(".agenda-event__title").allTextContents(); assert.ok(titles.length > 0); assert.ok(titles.every(title => title === "Iniciativa QA explícita")); assert.equal(await page.getByText("Iniciativa QA relativa", { exact: true }).count(), 0);
  const opener = page.getByRole("button", { name: /Iniciativa QA explícita.*Abrir detalhes/ }).first(); await opener.click(); const dialog = page.getByRole("dialog", { name: "Iniciativa QA explícita", exact: true }); await dialog.waitFor();
  await dialog.getByText(initiative.how, { exact: true }).waitFor(); await dialog.getByText(initiative.dependencies.join("; "), { exact: true }).waitFor();
  await page.keyboard.press("Escape"); await dialog.waitFor({ state: "hidden" }); assert.equal(await opener.evaluate(element => document.activeElement === element), true);
  await opener.click(); await page.getByRole("button", { name: "Ver iniciativa no plano", exact: true }).click(); await page.locator("#execution-initiative-0").waitFor(); await page.waitForFunction(() => document.activeElement?.id === "execution-initiative-0");
  await openAgenda(page); await page.getByRole("combobox", { name: "Tipo", exact: true }).selectOption("cadence");
  await page.getByRole("button", { name: /Revisão QA semanal/ }).click(); await page.getByRole("dialog", { name: "Revisão QA semanal", exact: true }).waitFor(); await page.getByRole("button", { name: "Ver governança", exact: true }).click(); await page.getByRole("tab", { name: "Governança", exact: true }).first().waitFor(); assert.equal(await page.getByRole("tab", { name: "Governança", exact: true }).first().getAttribute("aria-selected"), "true"); await unchanged(data);
});
await check("Original action plan and JSON/Markdown exports remain complete after Agenda navigation", async () => {
  const data = await makePage(), { page } = data; await openAgenda(page); await page.getByRole("button", { name: "90 dias", exact: true }).click(); await page.getByRole("tab", { name: "Plano de ação", exact: true }).click();
  for (const text of [...plan.objectives[0].keyResults.map(item => `${item.id} · ${item.metric}`), ...plan.objectives[0].keyResults.map(item => item.dueDate), ...plan.initiatives.map(item => item.title), ...plan.financialPlan.assumptions]) await page.getByText(text, { exact: true }).first().waitFor();
  await openAgenda(page); const summary = page.locator("details.result-export:visible > summary"); await summary.click();
  const jsonWait = page.waitForEvent("download"); await page.getByRole("button", { name: "JSON", exact: true }).click(); const json = await jsonWait; assert.deepEqual(JSON.parse(fs.readFileSync(await json.path(), "utf8")), plan);
  await summary.click(); const mdWait = page.waitForEvent("download"); await page.getByRole("button", { name: "Markdown", exact: true }).click(); const md = fs.readFileSync(await (await mdWait).path(), "utf8");
  assert.equal(md, loadLocalModule("lib/markdown.ts").planToMarkdown(plan), "Markdown export must retain the original formatter output byte for byte");
  for (const text of [...plan.initiatives.map(item => item.title), ...plan.first90Days.map(item => item.deliverable), ...plan.objectives[0].keyResults.map(item => item.metric)]) assert.ok(md.includes(text), text); await unchanged(data);
});
await check("Mobile 390/320px views and detail dialogs have no page overflow or lost items", async () => {
  for (const width of [390, 320]) {
    const data = await makePage({ width }), { page } = data; await openAgenda(page);
    for (const view of ["Mês", "Semana", "90 dias"]) { await page.getByRole("button", { name: view, exact: true }).click(); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px ${view}`); await capture(page, `mobile-${width}-${view === "90 dias" ? "90-days" : view === "Semana" ? "week" : "month"}`); }
    await page.getByRole("button", { name: /Iniciativa QA relativa.*Abrir detalhes/ }).first().click(); const dialog = page.getByRole("dialog", { name: "Iniciativa QA relativa", exact: true }); await dialog.waitFor(); const box = await dialog.boundingBox(); assert.ok(box.x >= -1 && box.x + box.width <= width + 1); await capture(page, `mobile-${width}-detail`); await page.getByRole("button", { name: "Fechar detalhes", exact: true }).click(); await unchanged(data);
  }
});
await check("Unscheduled cadences/invalid dates stay visible; empty agenda and invalid anchor do not invent dates", async () => {
  const data = await makePage(), { page } = data; await openAgenda(page); const unscheduled = page.getByRole("region", { name: "Itens a agendar", exact: true });
  for (const text of ["Iniciativa QA sem data", "Iniciativa QA intervalo inválido", "Marco QA sem período", "Revisão QA semanal"]) await unscheduled.getByText(text, { exact: true }).waitFor();
  await unscheduled.getByRole("button", { name: /Revisão QA semanal/ }).click(); const dialog = page.getByRole("dialog", { name: "Revisão QA semanal", exact: true }); await dialog.getByText("A agendar", { exact: true }).waitFor(); await dialog.getByText("Semanal", { exact: false }).first().waitFor(); await page.getByRole("button", { name: "Fechar detalhes", exact: true }).click(); await unchanged(data);
  const invalid = structuredClone(session); invalid.plan.meta.generatedAt = "Sem data de geração"; const invalidData = await makePage({ data: invalid }); await openAgenda(invalidData.page); await invalidData.page.getByText("Datas relativas aguardam uma referência válida no plano.", { exact: false }).waitFor(); await invalidData.page.getByRole("region", { name: "Itens a agendar", exact: true }).getByText("Iniciativa QA relativa", { exact: true }).waitFor(); await unchanged(invalidData);
  const empty = structuredClone(session); empty.plan.initiatives = []; empty.plan.first90Days = []; empty.plan.governance.cadences = []; const emptyData = await makePage({ data: empty }); await openAgenda(emptyData.page); await emptyData.page.getByText("Nenhum item com data neste período.", { exact: false }).waitFor(); assert.equal(await emptyData.page.locator(".agenda-event,.agenda-undated-item").count(), 0); await capture(emptyData.page, "empty-agenda"); await unchanged(emptyData);
});

await browser.close();
const resultFile = path.join(output, "results.json"), prior = process.env.TEST_FILTER && fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, "utf8")).results : [];
fs.writeFileSync(resultFile, JSON.stringify({ date: new Date().toISOString(), baseURL, results: [...prior.filter(item => !results.some(result => result.name === item.name)), ...results] }, null, 2));
console.log(JSON.stringify({ passed: results.filter(result => result.pass).length, failed: results.filter(result => !result.pass).length, output }));
if (results.some(result => !result.pass)) process.exitCode = 1;
