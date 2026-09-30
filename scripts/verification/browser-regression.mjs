import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// npm exec provides Playwright through PATH without changing app dependencies.
const bins = process.env.PATH.split(path.delimiter);
const packageRoot = bins.find((item) => fs.existsSync(path.resolve(item, "../playwright/package.json")));
const { chromium } = require(process.env.PLAYWRIGHT_PATH || path.resolve(packageRoot || "node_modules/.bin", "../playwright"));
const ts = require(path.join(root, "node_modules/typescript"));
const demoSource = ts.transpileModule(fs.readFileSync(path.join(root, "lib/demo.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const demo = { exports: {} };
new Function("exports", "module", demoSource)(demo.exports, demo);
const contextData = { organization: "Clínica Horizonte QA", sector: "Saúde", horizon: "Próximos 24 meses", challenge: "Ampliar capacidade com margem sustentável" };
const baseTime = "2026-09-30T12:00:00.000Z";
const seedAnswers = ["context", "current", "direction", "execution", "people"].map((phase, index) => ({ questionId: `seed-${index}`, phase, question: `Pergunta ${index + 1}`, answer: `Evidência verificada ${index + 1}`, answeredAt: baseTime }));
const plan = demo.exports.buildDemoPlan(contextData, seedAnswers);
plan.meta.generatedAt = "2026-09-30";
const nextQuestion = demo.exports.getDemoInterview("context", [], []).question;
const session = { id: "regression-session", ...contextData, phase: "context", question: nextQuestion, answers: seedAnswers, askedQuestionIds: [nextQuestion.id], readiness: 67, missingTopics: ["Baseline financeiro", "Fonte comercial"], provider: "demo", createdAt: baseTime, updatedAt: baseTime, plan: null };
const output = path.resolve(root, process.env.TEST_OUTPUT || "design/implementation/verification");
fs.mkdirSync(output, { recursive: true });
const results = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const baseURL = process.env.TEST_URL || "http://localhost:3000";
const storageKey = "x5-strategic-planner-session-v1";

async function check(name, run) {
  if (process.env.TEST_FILTER && !new RegExp(process.env.TEST_FILTER, "i").test(name)) return;
  try { const evidence = await run(); results.push({ name, pass: true, evidence }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, pass: false, error: String(error.stack || error) }); console.log(`FAIL ${name}: ${error.message}`); }
}
async function makePage({ width = 1440, height = 1000, saved = null, provider = "demo", reducedMotion = "no-preference" } = {}) {
  const browserContext = await browser.newContext({ viewport: { width, height }, acceptDownloads: true, reducedMotion });
  const page = await browserContext.newPage();
  page.setDefaultTimeout(7000);
  const requests = [], errors = [];
  page.on("pageerror", error => errors.push(error.message));
  if (saved) await page.addInitScript(({ key, saved }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, typeof saved === "string" ? saved : JSON.stringify(saved)); }, { key: storageKey, saved });
  await page.route("**/api/status", route => route.fulfill({ json: { configured: provider === "gemini", provider, model: provider === "gemini" ? "qa-model" : "demonstração local" } }));
  await page.route("**/api/interview", route => {
    const body = route.request().postDataJSON(); requests.push(body);
    return route.fulfill({ json: body.mode === "coach" ? demo.exports.getDemoCoach(nextQuestion) : demo.exports.getDemoInterview(body.phase, body.answers, body.askedQuestionIds) });
  });
  await page.route("**/api/plan", route => { requests.push(route.request().postDataJSON()); return route.fulfill({ json: { plan, provider: "demo" } }); });
  await page.goto(baseURL);
  await page.locator("main").waitFor();
  await page.evaluate(() => document.fonts.ready);
  return { page, browserContext, requests, errors };
}
async function savedSession(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey); }
async function visibleText(page, text) { const exact = page.getByText(text, { exact: true }).filter({ visible: true }); await (await exact.count() ? exact : page.getByText(text).filter({ visible: true })).first().waitFor({ state: "visible" }); }
async function switchTab(page, tab) { await page.getByRole("tab", { name: tab, exact: true }).first().click(); }
async function openExports(page) { if (!await page.getByRole("button", { name: "JSON", exact: true }).isVisible()) await page.locator("details.result-export:visible > summary").click(); }
async function overflow(page) {
  return page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll("main *")].filter(el => { const r = el.getBoundingClientRect(), c = getComputedStyle(el); return c.display !== "none" && c.visibility !== "hidden" && r.width > 0 && (r.left < -1 || r.right > innerWidth + 1) && !el.closest(".kr-table-wrap,.plan-tabs,.tabs-scroll"); }).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent?.slice(0, 50), rect: { x: el.getBoundingClientRect().x, width: el.getBoundingClientRect().width } })).slice(0, 15) }));
}
async function screenshot(page, name) { await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true, animations: "disabled" }); }
async function loadedImages(page) {
  const images = page.locator("main img").filter({ visible: true });
  for (let index = 0; index < await images.count(); index++) await images.nth(index).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("main img")].filter(image => image.getClientRects().length).every(image => image.complete));
  return images.evaluateAll(items => items.filter(image => !image.naturalWidth).map(image => image.getAttribute("src")));
}

await check("Backend and library SHA256 unchanged", async () => {
  const baseline = JSON.parse(fs.readFileSync(path.join(root, "scripts/verification/backend-baseline.json"), "utf8").replace(/^\uFEFF/, ""));
  for (const item of baseline) assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(root, item.path))).digest("hex").toUpperCase(), item.sha256, item.path);
  return `${baseline.length} files`;
});
await check("Session controller preserved exactly", async () => {
  const before = fs.readFileSync(path.join(root, "design/implementation/baseline/StrategicPlanner.tsx.txt"), "utf8");
  const after = fs.readFileSync(path.join(root, "components/StrategicPlanner.tsx"), "utf8");
  const marker = "export function StrategicPlanner()";
  const normalized = after.slice(after.indexOf(marker)).replace('src="/brand/grupo-x5.svg"', 'src="/grupo-x5.png"');
  assert.equal(normalized.replace(/\r\n/g, "\n"), before.slice(before.indexOf(marker)).replace(/\r\n/g, "\n"));
  return "Exact original controller after normalizing line endings and only the explicitly requested loading-logo SVG path";
});
await check("Provider live status, landing validation and complete start payload", async () => {
  const { page, browserContext, requests, errors } = await makePage({ provider: "gemini" });
  await page.getByText("Gemini conectado", { exact: true }).first().waitFor();
  assert.match(await page.locator(".ai-badge").first().getAttribute("title"), /qa-model/);
  await page.getByRole("button", { name: /Começar planejamento/ }).click();
  assert.equal(requests.length, 0, "Empty required fields must not submit");
  await page.getByRole("textbox", { name: /organização/i }).fill(contextData.organization);
  await page.getByRole("textbox", { name: /setor/i }).fill(contextData.sector);
  if (await page.getByRole("radio", { name: "24 meses", exact: true }).count()) await page.getByRole("radio", { name: "24 meses", exact: true }).check(); else await page.getByLabel("Horizonte", { exact: true }).selectOption(contextData.horizon);
  await page.getByRole("textbox", { name: /desafio central/i }).fill(contextData.challenge);
  await page.getByRole("button", { name: /Começar planejamento/ }).click();
  await visibleText(page, nextQuestion.prompt);
  assert.deepEqual(requests[0].context, contextData);
  assert.equal(requests[0].mode, "next"); assert.deepEqual(requests[0].answers, []);
  const saved = await savedSession(page); assert.equal(saved.phase, "context"); assert.deepEqual(saved.askedQuestionIds, [nextQuestion.id]);
  assert.equal(saved.plan, null); assert.equal(errors.length, 0); await browserContext.close();
});
await check("Answer success, history, readiness, coaching and persistent reload", async () => {
  const { page, browserContext, requests, errors } = await makePage({ saved: session });
  await visibleText(page, nextQuestion.prompt);
  await page.getByRole("button", { name: /Me ajude a responder/ }).click();
  await visibleText(page, demo.exports.getDemoCoach(nextQuestion).guidance);
  assert.equal(requests.at(-1).mode, "coach"); assert.deepEqual(requests.at(-1).answers, seedAnswers);
  await page.getByRole("button", { name: "Fechar ajuda" }).click();
  await page.locator(".question-card textarea").fill("  Receita cresceu 15%, fonte ERP setembro 2026.  ");
  await page.getByRole("button", { name: /Salvar e continuar/ }).click();
  await visibleText(page, "Quem aprova o plano e quem precisa participar da construção?");
  const saved = await savedSession(page); assert.equal(saved.answers.length, 6); assert.equal(saved.answers.at(-1).answer, "Receita cresceu 15%, fonte ERP setembro 2026.");
  assert.equal(saved.readiness, 40); assert.equal(new Set(saved.askedQuestionIds).size, saved.askedQuestionIds.length);
  await page.getByRole("button", { name: /Respostas anteriores/ }).click();
  await visibleText(page, saved.answers.at(-1).answer);
  await page.reload(); await visibleText(page, saved.question.prompt); assert.deepEqual((await savedSession(page)).answers, saved.answers);
  assert.equal(errors.length, 0); await browserContext.close();
});
await check("Failed next question preserves saved answer and shows error", async () => {
  const { page, browserContext } = await makePage({ saved: session });
  await page.route("**/api/interview", route => route.fulfill({ status: 502, json: { error: "Falha controlada de pergunta" } }));
  await page.locator(".question-card textarea").fill("Resposta que não pode se perder");
  await page.getByRole("button", { name: /Salvar e continuar/ }).click();
  await visibleText(page, "Falha controlada de pergunta");
  const saved = await savedSession(page); assert.equal(saved.answers.at(-1).answer, "Resposta que não pode se perder"); assert.equal(saved.question.id, nextQuestion.id);
  await page.getByRole("button", { name: /Respostas anteriores/ }).click(); await visibleText(page, "Resposta que não pode se perder");
  await browserContext.close(); return "Existing contract: saved answer retained; unsent textarea cleared.";
});
await check("Select question preserves chosen answer in request; coaching failure preserves draft", async () => {
  const selectQuestion = { ...nextQuestion, id: "qa-select", answerType: "select", prompt: "Qual prioridade devemos escolher?", options: ["Melhorar margem", "Expandir capacidade"] };
  const { page, browserContext, requests } = await makePage({ saved: { ...session, question: selectQuestion } });
  await page.getByRole("button", { name: "Expandir capacidade", exact: true }).click();
  await page.route("**/api/interview", route => {
    const body = route.request().postDataJSON(); requests.push(body);
    return body.mode === "coach" ? route.fulfill({ status: 502, json: { error: "Falha controlada de ajuda" } }) : route.fulfill({ json: demo.exports.getDemoInterview(body.phase, body.answers, body.askedQuestionIds) });
  });
  await page.getByRole("button", { name: /Me ajude a responder/ }).click(); await visibleText(page, "Falha controlada de ajuda");
  assert.equal(await page.getByRole("button", { name: /Salvar e continuar/ }).isDisabled(), false);
  await page.getByRole("button", { name: /Salvar e continuar/ }).click();
  await visibleText(page, "Quem aprova o plano e quem precisa participar da construção?");
  assert.equal(requests.at(-1).answers.at(-1).answer, "Expandir capacidade");
  assert.equal(requests.at(-1).answers.at(-1).questionId, "qa-select");
  await browserContext.close();
});
await check("Malformed stored JSON is discarded safely", async () => {
  const { page, browserContext, errors } = await makePage({ saved: "{invalid" });
  await page.getByRole("textbox", { name: /organização/i }).waitFor();
  assert.equal(await savedSession(page), null); assert.equal(errors.length, 0); await browserContext.close();
});
await check("Generation gate, failure state, successful plan payload", async () => {
  const { page, browserContext, requests } = await makePage({ saved: { ...session, answers: seedAnswers.slice(0, 4) } });
  assert.equal(await page.getByRole("button", { name: /Gerar plano agora/ }).isDisabled(), true);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: session });
  await page.reload();
  await page.route("**/api/plan", route => route.fulfill({ status: 502, json: { error: "Falha controlada de plano" } }));
  await page.getByRole("button", { name: /Gerar plano agora/ }).click(); await visibleText(page, "Falha controlada de plano");
  assert.equal((await savedSession(page)).plan, null); assert.deepEqual((await savedSession(page)).answers, seedAnswers);
  await page.route("**/api/plan", route => { requests.push(route.request().postDataJSON()); return route.fulfill({ json: { plan, provider: "demo" } }); });
  await page.getByRole("button", { name: /Gerar plano agora/ }).click(); await visibleText(page, plan.executiveSummary);
  assert.deepEqual(requests.at(-1), { context: contextData, answers: seedAnswers }); assert.deepEqual((await savedSession(page)).plan, plan);
  await browserContext.close();
});
const tabContent = {
  "Visão geral": [plan.strategicChoices.thesis, ...plan.strategicChoices.priorities, ...plan.strategicChoices.nonGoals, ...plan.first90Days.map(x => x.deliverable), ...plan.quality.improvements, ...plan.quality.strengths],
  "Diagnóstico": [...Object.values(plan.evidenceStatus).flatMap(xs => xs.flatMap(x => [x.label, x.detail])), ...["strengths", "weaknesses", "opportunities", "threats"].flatMap(key => plan.diagnosis[key]), ...plan.diagnosis.strategicIssues.map(x => x.issue)],
  "Escolhas": [...plan.growthAvenues.flatMap(x => [x.title, x.description, x.reason]), ...plan.strategicChoices.requiredCapabilities],
  "Execução": [...plan.objectives.flatMap(x => [x.title, x.rationale, ...x.keyResults.flatMap(k => [k.metric, k.frequency])]), ...plan.initiatives.flatMap(x => [x.title, x.why, x.how, ...x.dependencies]), ...plan.financialPlan.scenarios.flatMap(x => [x.description, x.expectedImpact]), ...plan.financialPlan.alerts, ...plan.financialPlan.assumptions],
  "Governança": [...plan.governance.roles.flatMap(x => [x.role, x.responsibility, x.decisionRights]), ...plan.governance.cadences.map(x => x.purpose), plan.governance.communication, ...plan.risks.map(x => x.risk)],
};
await check("Five dashboard tabs retain all baseline plan content; JSON and Markdown exports", async () => {
  const { page, browserContext, errors } = await makePage({ saved: { ...session, plan } });
  const duplicateIds = await page.evaluate(() => { const ids = [...document.querySelectorAll("[id]")].map(el => el.id); return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]; });
  assert.deepEqual(duplicateIds, [], "Duplicate IDs would break tab labeling");
  for (const [tab, content] of Object.entries(tabContent)) {
    await switchTab(page, tab);
    for (const text of content) await visibleText(page, text);
    await screenshot(page, `desktop-${tab.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "-")}`);
  }
  await switchTab(page, "Visão geral"); await openExports(page);
  const jsonWait = page.waitForEvent("download"); await page.getByRole("button", { name: "JSON", exact: true }).click(); const jsonDownload = await jsonWait;
  assert.equal(jsonDownload.suggestedFilename(), "plano-clinica-horizonte-qa.json"); assert.deepEqual(JSON.parse(fs.readFileSync(await jsonDownload.path(), "utf8")), plan);
  assert.equal(await page.locator("details.result-export[open]").count(), 0, "Export menu closes after download");
  await openExports(page); const mdWait = page.waitForEvent("download"); await page.getByRole("button", { name: "Markdown", exact: true }).click(); const mdDownload = await mdWait;
  assert.equal(mdDownload.suggestedFilename(), "plano-clinica-horizonte-qa.md"); const md = fs.readFileSync(await mdDownload.path(), "utf8");
  for (const value of [plan.meta.organization, plan.executiveSummary, plan.strategicChoices.thesis, plan.objectives[0].keyResults[0].metric, plan.risks[0].mitigation]) assert.ok(md.includes(value), value);
  assert.equal(errors.length, 0); await browserContext.close();
});
await check("Back to interview and reset confirmation preserve/cancel then erase session", async () => {
  const { page, browserContext } = await makePage({ saved: { ...session, plan } });
  await switchTab(page, "Diagnóstico"); await page.getByRole("button", { name: /Voltar à entrevista/ }).first().click(); await visibleText(page, nextQuestion.prompt);
  assert.equal((await savedSession(page)).plan, null); assert.deepEqual((await savedSession(page)).answers, seedAnswers);
  page.once("dialog", dialog => dialog.dismiss()); await page.getByRole("button", { name: "Novo plano", exact: true }).first().click();
  assert.equal((await savedSession(page)).id, session.id);
  page.once("dialog", dialog => dialog.accept()); await page.getByRole("button", { name: "Novo plano", exact: true }).first().click();
  await page.getByRole("textbox", { name: /organização/i }).waitFor(); assert.equal(await savedSession(page), null); await browserContext.close();
});
for (const width of [1440, 390, 320]) {
  await check(`Responsive overflow and font ${width}px landing/interview/five tabs`, async () => {
    for (const [name, saved] of [["landing", null], ["interview", session], ["overview", { ...session, plan }]]) {
      const { page, browserContext, errors } = await makePage({ width, saved });
      const names = name === "overview" ? Object.keys(tabContent) : [name];
      for (const screenName of names) {
        if (name === "overview") await switchTab(page, screenName);
        if (name === "overview" && width < 800) {
          if (screenName === "Visão geral") await page.locator(".result-mobile-insights > summary").click();
          for (const text of tabContent[screenName]) await visibleText(page, text);
        }
        const details = await overflow(page); assert.ok(details.document <= width + 1, JSON.stringify({ screenName, ...details }));
        const family = await page.locator("main").evaluate(el => getComputedStyle(el).fontFamily); assert.match(family, /Sora/i);
        if (width !== 1440 || name !== "overview") await screenshot(page, `${width}-${screenName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "-")}`);
      }
      assert.equal(errors.length, 0); await browserContext.close();
    }
  });
}
await check("Mobile drawer keyboard dismissal and focus restoration", async () => {
  const { page, browserContext } = await makePage({ width: 390, saved: session });
  const open = page.getByRole("button", { name: "Abrir etapas", exact: true }); await open.click();
  const close = page.locator(".phase-sidebar").getByRole("button", { name: "Fechar etapas", exact: true }); await close.waitFor({ state: "visible" });
  await page.keyboard.press("Escape"); await close.waitFor({ state: "hidden", timeout: 2000 });
  assert.equal(await open.evaluate(el => document.activeElement === el), true);
  await browserContext.close();
});
await check("Dashboard keyboard tabs, theme and mobile menu keep session data", async () => {
  const { page, browserContext } = await makePage({ saved: { ...session, plan } });
  const original = await savedSession(page);
  await page.getByRole("tab", { name: "Visão geral", exact: true }).focus(); await page.keyboard.press("ArrowDown");
  assert.equal(await page.getByRole("tab", { name: "Diagnóstico", exact: true }).getAttribute("aria-selected"), "true");
  await page.keyboard.press("End"); assert.equal(await page.getByRole("tab", { name: "Governança", exact: true }).getAttribute("aria-selected"), "true");
  await page.getByRole("button", { name: "Ativar tema escuro", exact: true }).click(); await page.getByRole("button", { name: "Ativar tema claro", exact: true }).waitFor();
  await screenshot(page, "desktop-dark-governanca");
  assert.deepEqual(await savedSession(page), original);
  await page.setViewportSize({ width: 390, height: 1000 });
  const menu = page.getByRole("button", { name: "Abrir menu do planejamento", exact: true }); await menu.click();
  await page.getByRole("dialog").waitFor({ state: "visible" }); await page.keyboard.press("Escape"); await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(await menu.evaluate(el => el === document.activeElement), true); assert.deepEqual(await savedSession(page), original);
  await browserContext.close();
});
await check("Reduced motion disables entrance and interactive transitions", async () => {
  const { page, browserContext } = await makePage({ width: 390, saved: { ...session, plan }, reducedMotion: "reduce" });
  const moving = await page.evaluate(() => [...document.querySelectorAll("main *")].filter(el => { const s = getComputedStyle(el); return s.animationName !== "none" && parseFloat(s.animationDuration) > 0.001 || parseFloat(s.transitionDuration) > 0.001; }).map(el => ({ class: el.className, animation: getComputedStyle(el).animationDuration, transition: getComputedStyle(el).transitionDuration })));
  assert.deepEqual(moving, []); await browserContext.close();
});
await check("Normal motion enters views and hover moves action icon", async () => {
  const { page, browserContext } = await makePage();
  const entrance = await page.locator("main").evaluate(el => ({ name: getComputedStyle(el).animationName, duration: parseFloat(getComputedStyle(el).animationDuration) }));
  assert.notEqual(entrance.name, "none"); assert.ok(entrance.duration > 0);
  const button = page.getByRole("button", { name: /Começar planejamento/ });
  const icon = button.locator("svg").last();
  const before = await icon.evaluate(el => getComputedStyle(el).transform);
  await button.hover();
  await page.waitForFunction(element => getComputedStyle(element).transform !== "none", await icon.elementHandle());
  const after = await icon.evaluate(el => getComputedStyle(el).transform);
  assert.notEqual(after, before); await browserContext.close();
  return entrance;
});
await check("All rendered image assets load in journey, five tabs and dark theme", async () => {
  for (const saved of [null, session, { ...session, plan }]) {
    const { page, browserContext, errors } = await makePage({ saved });
    const screens = saved?.plan ? Object.keys(tabContent) : [null];
    for (const screen of screens) {
      if (screen) await switchTab(page, screen);
      assert.match(await page.locator("main").evaluate(el => getComputedStyle(el).fontFamily), /Sora/i);
      const broken = await loadedImages(page);
      assert.deepEqual(broken, [], `Broken images on ${screen || (saved ? "interview" : "landing")}`);
    }
    if (saved?.plan) {
      await switchTab(page, "Visão geral");
      await page.getByRole("button", { name: "Ativar tema escuro", exact: true }).click();
      assert.deepEqual(await loadedImages(page), []);
      await screenshot(page, "final-overview-dark");
      await page.setViewportSize({ width: 390, height: 1144 });
      assert.deepEqual(await loadedImages(page), []);
      await screenshot(page, "final-mobile-dark");
    }
    assert.equal(errors.length, 0); await browserContext.close();
  }
});
await check("Final dark actions remain legible and mobile surface stays transparent", async () => {
  const { page, browserContext } = await makePage({ saved: { ...session, plan } });
  await page.getByRole("button", { name: "Ativar tema escuro", exact: true }).click();
  const newPlan = page.locator(".result-new").filter({ visible: true });
  const originalColor = await newPlan.evaluate(el => getComputedStyle(el).color);
  const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
  assert.ok(rgb(originalColor).every(value => value > 220), "Dark new plan action must have light text");
  await newPlan.hover();
  await page.waitForFunction(el => getComputedStyle(el).backgroundColor === "rgb(57, 67, 46)", await newPlan.elementHandle());
  const hover = await newPlan.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
  const luminance = color => rgb(color).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const contrast = (luminance(hover.color) + .05) / (luminance(hover.background) + .05);
  assert.ok(contrast >= 4.5, `Dark new plan hover contrast ${contrast}`);
  await openExports(page); const json = page.getByRole("button", { name: "JSON", exact: true }); await json.hover();
  await page.waitForFunction(el => getComputedStyle(el).color === "rgb(17, 17, 17)", await json.elementHandle());
  await page.locator("details.result-export:visible > summary").click(); await page.mouse.move(0, 0);
  assert.deepEqual(await loadedImages(page), []); await screenshot(page, "final-dark-actions-desktop");
  await page.setViewportSize({ width: 390, height: 1144 });
  assert.equal(await page.locator(".result-app").evaluate(el => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)");
  assert.deepEqual(await loadedImages(page), []); await screenshot(page, "final-dark-actions-mobile");
  await browserContext.close(); return { newPlanColor: originalColor, newPlanHoverContrast: contrast };
});
await check("SVG logo contains native paths and enlarged light/dark previews render", async () => {
  for (const [theme, file, background] of [["light", "grupo-x5.svg", "#f5f7f1"], ["dark", "grupo-x5-white.svg", "#242820"]]) {
    const source = fs.readFileSync(path.join(root, "public/brand", file), "utf8");
    assert.match(source, /<path\s/); assert.doesNotMatch(source, /<image\b|<foreignObject\b|data:image|base64/i);
    const browserContext = await browser.newContext({ viewport: { width: 1120, height: 700 } });
    const page = await browserContext.newPage();
    await page.setContent(`<html><body style="margin:0;display:grid;place-items:center;width:1120px;height:700px;background:${background}"><img src="${baseURL}/brand/${file}" width="890" height="507" alt="Grupo X5"></body></html>`);
    await page.waitForFunction(() => document.images[0].complete && document.images[0].naturalWidth > 0);
    await page.screenshot({ path: path.join(output, `logo-svg-enlarged-${theme}.png`) }); await browserContext.close();
  }
});
await check("Figma comparison viewports captured", async () => {
  for (const [name, width, height, saved] of [["figma-landing-desktop",1496,1235,null],["figma-interview-desktop",1496,1342,session],["figma-landing-mobile",390,1123,null],["figma-interview-mobile",390,1144,session],["figma-overview-desktop",1496,1462,{ ...session, plan }]]) {
    const { page, browserContext } = await makePage({ width, height, saved }); await screenshot(page, name); await browserContext.close();
  }
});
await browser.close();
const reportPath = path.join(output, "results.json");
const previous = process.env.TEST_FILTER && fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, "utf8")) : null;
const merged = previous ? previous.results.map(item => results.find(result => result.name === item.name) || item).concat(results.filter(item => !previous.results.some(result => result.name === item.name))) : results;
fs.writeFileSync(reportPath, JSON.stringify({ testedAt: new Date().toISOString(), baseURL, results: merged, fixture: { context: contextData, plan } }, null, 2));
console.log(JSON.stringify({ passed: results.filter(x => x.pass).length, failed: results.filter(x => !x.pass).length, output }));
if (results.some(x => !x.pass)) process.exitCode = 1;
