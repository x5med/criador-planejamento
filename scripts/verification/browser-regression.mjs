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
const output = path.resolve(root, process.env.TEST_OUTPUT || "design/implementation/verification/entry-login");
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
async function makePage({ width = 1440, height = 1000, saved = null, provider = "demo", reducedMotion = "no-preference", routePath = "/inicio" } = {}) {
  const browserContext = await browser.newContext({ viewport: { width, height }, acceptDownloads: true, reducedMotion });
  const page = await browserContext.newPage();
  page.setDefaultTimeout(7000);
  const requests = [], errors = [], mutations = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) mutations.push({ url: request.url(), method: request.method() }); });
  page.on("pageerror", error => errors.push(error.message));
  if (saved) await page.addInitScript(({ key, saved }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, typeof saved === "string" ? saved : JSON.stringify(saved)); }, { key: storageKey, saved });
  await page.route("**/api/status", route => route.fulfill({ json: { configured: provider === "gemini", provider, model: provider === "gemini" ? "qa-model" : "demonstração local" } }));
  await page.route("**/api/interview", route => {
    const body = route.request().postDataJSON(); requests.push(body);
    return route.fulfill({ json: body.mode === "coach" ? demo.exports.getDemoCoach(nextQuestion) : demo.exports.getDemoInterview(body.phase, body.answers, body.askedQuestionIds) });
  });
  await page.route("**/api/plan", route => { requests.push(route.request().postDataJSON()); return route.fulfill({ json: { plan, provider: "demo" } }); });
  await page.goto(`${baseURL}${routePath}`);
  await page.locator("main").waitFor();
  await page.evaluate(() => document.fonts.ready);
  return { page, browserContext, requests, errors, mutations };
}
async function savedSession(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey); }
async function visibleText(page, text) { const exact = page.getByText(text, { exact: true }).filter({ visible: true }); await (await exact.count() ? exact : page.getByText(text).filter({ visible: true })).first().waitFor({ state: "visible" }); }
async function switchTab(page, tab) { await page.getByRole("tab", { name: tab, exact: true }).first().click(); }
async function openExports(page) { if (!await page.getByRole("button", { name: "JSON", exact: true }).isVisible()) await page.locator("details.result-export:visible > summary").click(); }
async function openStartForm(page) {
  const cta = page.getByRole("button", { name: "Criar meu planejamento", exact: true }).first();
  const opener = await cta.elementHandle();
  await cta.click(); await page.getByRole("textbox", { name: /organização/i }).waitFor(); return opener;
}
async function fillStartForm(page, data = contextData) {
  await page.getByRole("textbox", { name: /organização/i }).fill(data.organization);
  await page.getByRole("textbox", { name: /setor/i }).fill(data.sector);
  await page.getByRole("radio", { name: "24 meses", exact: true }).check();
  await page.getByRole("textbox", { name: /desafio central/i }).fill(data.challenge);
}
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
await check("Session persistence and request logic preserved", async () => {
  const before = fs.readFileSync(path.join(root, "design/implementation/baseline/StrategicPlanner.tsx.txt"), "utf8");
  const after = fs.readFileSync(path.join(root, "components/StrategicPlanner.tsx"), "utf8");
  const marker = "export function StrategicPlanner()";
  const logic = source => source.slice(source.indexOf(marker), source.indexOf("  if (!hydrated)")).replace(/\r\n/g, "\n");
  assert.equal(logic(after), logic(before));
  return "Original session, persistence and request logic unchanged; loading presentation follows the approved UI";
});
await check("Product home access, screenshot previews and demonstration preserve session", async () => {
  const { page, browserContext, mutations, errors } = await makePage({ routePath: "/", reducedMotion: "reduce" });
  assert.equal(new URL(page.url()).pathname, "/");
  await page.getByRole("heading", { name: "Crie seu planejamento estratégico." }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Login", exact: true }).getAttribute("href"), "/login");
  await page.getByRole("button", { name: "Ampliar tela de diagnóstico", exact: true }).click();
  await page.getByRole("dialog").waitFor(); await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("button", { name: "Ampliar tela de diagnóstico", exact: true }).evaluate(el => document.activeElement === el), true);
  await page.getByRole("link", { name: "Criar conta", exact: true }).click();
  await page.getByRole("heading", { name: "Crie sua conta" }).waitFor();
  assert.equal(await page.getByLabel("Nome completo").isDisabled(), true);
  assert.equal(await page.getByRole("button", { name: "Criar conta", exact: true }).isDisabled(), true);
  await page.getByRole("link", { name: "Já tem uma conta? Fazer login", exact: true }).click();
  await page.getByRole("heading", { name: "Entre na sua conta" }).waitFor();
  await page.getByRole("link", { name: "Explorar demonstração", exact: true }).click();
  await page.getByRole("button", { name: "Criar meu planejamento", exact: true }).first().waitFor();
  assert.equal(await savedSession(page), null); assert.deepEqual(mutations, []); assert.deepEqual(errors, []);
  await browserContext.close();
});
for (const width of [1440, 390, 320]) {
  await check(`Product home responsive ${width}px images and preview`, async () => {
    const { page, browserContext, errors } = await makePage({ width, routePath: "/", reducedMotion: "reduce" });
    for (const image of await page.locator(".product-screen-button img").all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(img => img.decode()); }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await screenshot(page, `product-home-${width}`);
    await page.getByRole("button", { name: "Ampliar tela de visão geral do planejamento" }).click();
    const box = await page.getByRole("dialog").boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
    await page.getByRole("button", { name: "Fechar imagem" }).click(); assert.deepEqual(errors, []);
    await browserContext.close();
  });
}
for (const width of [1440, 390, 320]) {
  await check(`Visual login responsive ${width}px has disabled credentials and no overflow`, async () => {
    const { page, browserContext, mutations, errors } = await makePage({ width, routePath: "/login" });
    assert.equal(await page.getByRole("textbox", { name: /e-?mail/i }).isDisabled(), true); assert.equal(await page.getByLabel(/senha/i).isDisabled(), true);
    assert.equal(await page.getByRole("button", { name: "Entrar", exact: true }).isDisabled(), true);
    assert.ok((await overflow(page)).document <= width + 1); assert.match(await page.locator("main").evaluate(el => getComputedStyle(el).fontFamily), /Sora/i);
    assert.deepEqual(await loadedImages(page), []); await screenshot(page, `login-${width}`);
    if (width < 600) {
      const explore = page.getByRole("button", { name: "Conheça os módulos", exact: true });
      await explore.click(); assert.equal(await explore.getAttribute("aria-expanded"), "true");
      const moduleButton = page.getByRole("button", { name: "Diagnóstico", exact: true });
      await moduleButton.click(); await page.getByRole("region", { name: "Diagnóstico", exact: true }).waitFor();
      assert.ok((await overflow(page)).document <= width + 1);
      // Full-page screenshots temporarily resize Chrome and intentionally dismiss
      // the popover. Capture its element without modifying viewport dimensions.
      await page.getByRole("region", { name: "Diagnóstico", exact: true }).screenshot({ path: path.join(output, `login-${width}-module.png`), animations: "disabled" });
      await page.getByRole("button", { name: "Fechar detalhes de Diagnóstico", exact: true }).click();
      await page.getByRole("region", { name: "Diagnóstico", exact: true }).waitFor({ state: "hidden" });
      assert.equal(await moduleButton.evaluate(element => document.activeElement === element), true);
      await explore.click(); assert.equal(await explore.getAttribute("aria-expanded"), "false");
    }
    assert.equal(await page.evaluate(() => localStorage.length), 0); assert.deepEqual(mutations, []); assert.equal(errors.length, 0); await browserContext.close();
  });
}
await check("Login module popovers fit desktop transition widths", async () => {
  for (const width of [1051, 1100, 1200]) {
    const { page, browserContext, mutations, errors } = await makePage({ width, routePath: "/login" });
    assert.ok((await overflow(page)).document <= width + 1);
    const card = await page.locator(".x5-access__card").boundingBox();
    for (const label of ["Entrevista guiada", "Cenários financeiros"]) {
      const moduleButton = page.getByRole("button", { name: label, exact: true });
      await moduleButton.focus(); await page.keyboard.press("Enter");
      const panel = page.getByRole("region", { name: label, exact: true }); await panel.waitFor();
      const box = await panel.boundingBox();
      assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
      assert.ok(box.x + box.width <= card.x + 1 || box.x >= card.x + card.width - 1, "Desktop popover must not overlap the login card");
      await page.getByRole("button", { name: `Fechar detalhes de ${label}`, exact: true }).focus(); await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
    }
    assert.deepEqual(mutations, []); assert.equal(await page.evaluate(() => localStorage.length), 0); assert.equal(errors.length, 0); await browserContext.close();
  }
});
await check("Homepage explains product before CTA; modal cancellation/focus and all horizons remain local", async () => {
  for (const width of [1440, 390, 320]) {
    const { page, browserContext, requests, errors } = await makePage({ width });
    assert.equal(await page.getByRole("textbox", { name: /organização/i }).count(), 0);
    assert.equal(await savedSession(page), null); assert.equal(requests.length, 0);
    const opener = await openStartForm(page);
    for (const horizon of ["12 meses", "24 meses", "36 meses", "Ano de 2027"]) {
      const radio = page.getByRole("radio", { name: horizon, exact: true }); await radio.check(); assert.equal(await radio.isChecked(), true);
    }
    await page.getByRole("textbox", { name: /organização/i }).fill("Rascunho temporário");
    await page.keyboard.press("Escape"); await page.getByRole("textbox", { name: /organização/i }).waitFor({ state: "hidden" });
    await page.waitForFunction(element => document.activeElement === element, opener);
    await openStartForm(page); await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    await page.getByRole("textbox", { name: /organização/i }).waitFor({ state: "hidden" }); await page.waitForFunction(element => document.activeElement === element, opener);
    assert.equal(await savedSession(page), null); assert.equal(requests.length, 0); assert.equal(errors.length, 0); await browserContext.close();
  }
});
await check("Provider live status, modal validation and complete start payload", async () => {
  const { page, browserContext, requests, errors } = await makePage({ provider: "gemini" });
  await openStartForm(page);
  await page.getByText("Gemini conectado", { exact: true }).first().waitFor();
  assert.match(await page.locator(".ai-badge").filter({ visible: true }).first().getAttribute("title"), /qa-model/);
  await page.getByRole("button", { name: /Começar planejamento/ }).click();
  assert.equal(requests.length, 0, "Empty required fields must not submit");
  await fillStartForm(page);
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
  await page.getByRole("button", { name: "Criar meu planejamento", exact: true }).first().waitFor();
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
  await page.getByRole("button", { name: "Criar meu planejamento", exact: true }).first().waitFor(); assert.equal(await savedSession(page), null); await browserContext.close();
});
for (const width of [1440, 390, 320]) {
  await check(`Responsive overflow and font ${width}px homepage/modal/interview/five tabs`, async () => {
    for (const [name, saved] of [["homepage", null], ["interview", session], ["overview", { ...session, plan }]]) {
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
      if (!saved) {
        await openStartForm(page);
        const bounds = await page.getByRole("dialog").boundingBox(); assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= width + 1);
        await screenshot(page, `${width}-planning-modal`);
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
await check("Dashboard keyboard tabs and mobile menu keep session data in light theme", async () => {
  const { page, browserContext } = await makePage({ saved: { ...session, plan } });
  const original = await savedSession(page);
  await page.getByRole("tab", { name: "Visão geral", exact: true }).focus(); await page.keyboard.press("ArrowDown");
  assert.equal(await page.getByRole("tab", { name: "Diagnóstico", exact: true }).getAttribute("aria-selected"), "true");
  await page.keyboard.press("End"); assert.equal(await page.getByRole("tab", { name: "Governança", exact: true }).getAttribute("aria-selected"), "true");
  assert.equal(await page.getByRole("button", { name: /Ativar tema (escuro|claro)/ }).count(), 0);
  assert.equal(await page.locator(".result-dark,.result-theme").count(), 0);
  assert.equal(await page.locator(".result-stage").evaluate(el => getComputedStyle(el).color), "rgb(17, 17, 17)");
  await screenshot(page, "desktop-light-governanca");
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
  await openStartForm(page);
  const button = page.getByRole("button", { name: /Começar planejamento/ });
  const icon = button.locator("svg").last();
  const before = await icon.evaluate(el => getComputedStyle(el).transform);
  await button.hover();
  await page.waitForFunction(element => getComputedStyle(element).transform !== "none", await icon.elementHandle());
  const after = await icon.evaluate(el => getComputedStyle(el).transform);
  assert.notEqual(after, before); await browserContext.close();
  return entrance;
});
await check("All rendered image assets load in journey and five light theme tabs", async () => {
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
      assert.equal(await page.getByRole("button", { name: /Ativar tema (escuro|claro)/ }).count(), 0);
      assert.equal(await page.locator(".result-dark,.result-theme").count(), 0);
      assert.deepEqual(await loadedImages(page), []);
      await screenshot(page, "final-overview-light");
      await page.setViewportSize({ width: 390, height: 1144 });
      assert.deepEqual(await loadedImages(page), []);
      await screenshot(page, "final-mobile-light");
    }
    assert.equal(errors.length, 0); await browserContext.close();
  }
});
await check("Final light actions remain legible without a dark mode option", async () => {
  const { page, browserContext } = await makePage({ saved: { ...session, plan } });
  assert.equal(await page.getByRole("button", { name: /Ativar tema (escuro|claro)/ }).count(), 0);
  assert.equal(await page.locator(".result-dark,.result-theme").count(), 0);
  const newPlan = page.locator(".result-new").filter({ visible: true });
  const originalColor = await newPlan.evaluate(el => getComputedStyle(el).color);
  const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
  assert.equal(originalColor, "rgb(17, 17, 17)", "Light new plan action must have dark text");
  await newPlan.hover();
  await page.waitForFunction(el => getComputedStyle(el).backgroundColor === "rgb(237, 248, 192)", await newPlan.elementHandle());
  const hover = await newPlan.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
  const luminance = color => rgb(color).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const contrast = (Math.max(luminance(hover.color), luminance(hover.background)) + .05) / (Math.min(luminance(hover.color), luminance(hover.background)) + .05);
  assert.ok(contrast >= 4.5, `Light new plan hover contrast ${contrast}`);
  await openExports(page); const json = page.getByRole("button", { name: "JSON", exact: true }); await json.hover();
  await page.waitForFunction(el => getComputedStyle(el).color === "rgb(17, 17, 17)", await json.elementHandle());
  await page.locator("details.result-export:visible > summary").click(); await page.mouse.move(0, 0);
  assert.deepEqual(await loadedImages(page), []); await screenshot(page, "final-light-actions-desktop");
  await page.setViewportSize({ width: 390, height: 1144 });
  assert.equal(await page.locator(".result-app").evaluate(el => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)");
  assert.deepEqual(await loadedImages(page), []); await screenshot(page, "final-light-actions-mobile");
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
await check("Homepage and Figma workspace comparison viewports captured", async () => {
  for (const [name, width, height, saved] of [["homepage-desktop",1496,1235,null],["figma-interview-desktop",1496,1342,session],["homepage-mobile",390,1123,null],["figma-interview-mobile",390,1144,session],["figma-overview-desktop",1496,1462,{ ...session, plan }]]) {
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
