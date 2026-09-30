import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Pure verification: no server, browser, credentials, storage or network.
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ts = require(path.join(root, "node_modules/typescript"));
function loadLibrary(relativePath) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, relativePath), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  const library = { exports: {} };
  new Function("exports", "module", compiled)(library.exports, library);
  return library.exports;
}
const { parseDay, addDays, startOfWeek, daysBetween, formatDay, buildAgenda } = loadLibrary("lib/agenda.ts");
const { buildDemoPlan } = loadLibrary("lib/demo.ts");
let passed = 0;
function check(name, run) {
  run();
  passed += 1;
  console.log(`PASS ${name}`);
}
function fixture(generatedAt = "2026-09-30T23:50:00-03:00") {
  const plan = buildDemoPlan({ organization: "Agenda QA", sector: "Serviços", horizon: "12 meses", challenge: "Planejar com evidências" }, []);
  plan.meta.generatedAt = generatedAt;
  return plan;
}
function eventDates(startDate, endDate, generatedAt = "2026-09-30") {
  const plan = fixture(generatedAt);
  plan.initiatives = [{ ...plan.initiatives[0], startDate, endDate }];
  const { start, end, relative } = buildAgenda(plan).events[0];
  return { start, end, relative };
}
const dated = (start, end = start, relative = false) => ({ start, end, relative });
const unscheduled = (relative = false) => dated(null, null, relative);

check("Strict ISO/Brazilian dates validate leap years without rollover", () => {
  for (const [input, expected] of [["2024-02-29", "2024-02-29"], ["29/02/2024", "2024-02-29"], [" 30/09/2026 ", "2026-09-30"], ["2000-02-29", "2000-02-29"], ["0001-01-01", "0001-01-01"], ["0099-12-31", "0099-12-31"]]) assert.equal(parseDay(input), expected);
  for (const input of ["2026-02-29", "1900-02-29", "31/02/2026", "2026-04-31", "2026-13-01", "2026-00-10", "2026-01-00", "0000-01-01", "2026-9-1", "1/9/2026", "2026-09-30T12:00:00Z", "09-30-2026", "2026-09-30 e 2026-10-01", "", "A definir"]) assert.equal(parseDay(input), null, input);
});
check("Civil arithmetic crosses months/leap days/years and preserves early years", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2024-02-29", 1), "2024-03-01");
  assert.equal(addDays("2026-09-30", 1), "2026-10-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2027-01-01", -1), "2026-12-31");
  assert.equal(addDays("0099-12-31", 1), "0100-01-01");
  assert.equal(daysBetween("2024-02-28", "2024-03-01"), 2);
  assert.equal(daysBetween("2026-10-01", "2026-09-30"), -1);
  assert.equal(daysBetween("2026-09-30", "2026-09-30"), 0);
  assert.equal(startOfWeek("2026-09-30"), "2026-09-28");
  assert.equal(startOfWeek("2026-10-04"), "2026-09-28");
  assert.equal(startOfWeek("2026-10-05"), "2026-10-05");
});
check("Invalid helper arguments throw instead of normalizing or inventing dates", () => {
  for (const day of ["31/02/2026", "2026-02-30", "30/09/2026", ""]) {
    assert.throws(() => addDays(day, 1), RangeError);
    assert.throws(() => startOfWeek(day), RangeError);
    assert.throws(() => daysBetween(day, "2026-09-30"), RangeError);
    assert.throws(() => formatDay(day), RangeError);
  }
  for (const offset of [0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => addDays("2026-09-30", offset), RangeError);
  assert.throws(() => addDays("0001-01-01", -1), RangeError);
  assert.throws(() => addDays("9999-12-31", 1), RangeError);
});
check("Generated timestamp preserves its civil ISO prefix, no UTC conversion", () => {
  assert.equal(buildAgenda(fixture()).anchor, "2026-09-30");
  assert.equal(buildAgenda(fixture("2026-09-30T00:10:00+14:00")).anchor, "2026-09-30");
  for (const invalid of ["", "2026-02-30T12:00:00Z", "30/09/2026", "A definir", "2026-9-30"]) assert.equal(buildAgenda(fixture(invalid)).anchor, null, invalid);
});
check("Relative dates count anchor as day 1 and resolve across month boundaries", () => {
  assert.deepEqual(eventDates("Dia 1", "Dia 30"), dated("2026-09-30", "2026-10-29", true));
  assert.deepEqual(eventDates("Dia 15", "Dia 45"), dated("2026-10-14", "2026-11-13", true));
  assert.deepEqual(eventDates("Primeiros 30 dias", "Até o dia 30"), dated("2026-09-30", "2026-10-29", true));
  assert.deepEqual(eventDates("Dias 1–30", ""), dated("2026-09-30", "2026-10-29", true));
  assert.deepEqual(eventDates("", "Até o dia 30"), dated("2026-09-30", "2026-10-29", true));
  assert.deepEqual(eventDates("Dia 2", "Dia 3", "2024-02-28"), dated("2024-02-29", "2024-03-01", true));
});
check("Unknown anchor leaves relative events unscheduled while absolute dates work", () => {
  assert.deepEqual(eventDates("Dia 15", "Dia 45", ""), unscheduled(true));
  assert.deepEqual(eventDates("Dia 15", "2026-12-01", "2026-02-30"), unscheduled(true));
  assert.deepEqual(eventDates("2026-10-01", "30/10/2026", ""), dated("2026-10-01", "2026-10-30"));
});
check("Single absolute date is a point only when the other field is empty", () => {
  assert.deepEqual(eventDates("2026-10-14", ""), dated("2026-10-14"));
  assert.deepEqual(eventDates("", "14/10/2026"), dated("2026-10-14"));
  assert.deepEqual(eventDates("2026-10-14", "A definir"), unscheduled());
  assert.deepEqual(eventDates("", ""), unscheduled());
});
check("Ambiguous, invalid, contradictory and reversed periods stay unscheduled", () => {
  for (const [from, to, relative] of [["2026-10-20", "2026-10-01", false], ["2026-02-30", "2026-03-01", false], ["Dia 0", "Dia 30", true], ["Dia 45", "Dia 15", true], ["Dias 30–1", "", true], ["Dias 1–30", "Dia 45", true], ["Dia 15", "Dias 1–30", true], ["2026-10-14T12:00:00Z", "", false], ["Próximo mês", "", false], ["Dia 15 ou 16", "", false], ["Dias 1–999999999999999999999", "", true]]) assert.deepEqual(eventDates(from, to), unscheduled(relative), `${from} → ${to}`);
});
check("Milestones support relative/absolute ranges and preserve unknown periods", () => {
  const plan = fixture();
  plan.initiatives = [];
  const periods = ["Dias 1–30", "Dias 31-60", "Dias 61 — 90", "Primeiros 30 dias", "Até o dia 30", "2026-10-01 a 2026-10-30", "01/10/2026 – 30/10/2026", "2026-10-30 → 2026-10-01", "Dias 0–30", "Depois da validação"];
  plan.first90Days = periods.map((period, index) => ({ period, deliverable: `Entrega ${index}`, owner: `Dono ${index}` }));
  const events = buildAgenda(plan).events.filter(event => event.kind === "milestone");
  assert.deepEqual(events.slice(0, 3).map(({ start, end }) => [start, end]), [["2026-09-30", "2026-10-29"], ["2026-10-30", "2026-11-28"], ["2026-11-29", "2026-12-28"]]);
  assert.equal(events[3].end, "2026-10-29");
  assert.equal(events[4].end, "2026-10-29");
  for (const event of events.slice(5, 7)) assert.deepEqual([event.start, event.end], ["2026-10-01", "2026-10-30"]);
  for (const event of events.slice(7)) assert.deepEqual([event.start, event.end], [null, null]);
  events.forEach((event, index) => { assert.equal(event.originalPeriod, periods[index]); assert.equal(event.sourceIndex, index); assert.equal(event.owner, `Dono ${index}`); });
});
check("Cadence frequency never invents a scheduled meeting or owner", () => {
  const plan = fixture();
  plan.governance.cadences = [{ name: "Revisão", frequency: "Semanal", purpose: "Revisar KRs" }, { name: "Comitê", frequency: "2026-10-15", purpose: "Tomar decisões" }];
  const events = buildAgenda(plan).events.filter(event => event.kind === "cadence");
  events.forEach(event => { assert.equal(event.start, null); assert.equal(event.end, null); assert.equal(event.relative, false); assert.equal(event.owner, "A definir"); assert.equal(event.linkedKr, undefined); });
  assert.equal(events[0].originalPeriod, "Semanal");
  assert.equal(events[0].description, "Revisar KRs");
});
check("Projection is immutable, IDs unique even when source initiative IDs repeat", () => {
  const plan = fixture();
  plan.initiatives[1].id = plan.initiatives[0].id;
  const before = JSON.stringify(plan);
  const freeze = object => { Object.values(object).forEach(value => { if (value && typeof value === "object") freeze(value); }); return Object.freeze(object); };
  freeze(plan);
  const result = buildAgenda(plan);
  assert.equal(JSON.stringify(plan), before);
  assert.equal(result.events.length, plan.initiatives.length + plan.first90Days.length + plan.governance.cadences.length);
  assert.equal(new Set(result.events.map(event => event.id)).size, result.events.length);
  assert.equal(result.events[0].linkedKr, plan.initiatives[0].linkedKr);
  assert.equal(result.events[0].title, plan.initiatives[0].title);
  assert.equal(result.events[0].owner, plan.initiatives[0].owner);
  assert.deepEqual(buildAgenda(plan), result);
});
check("Civil helpers and agenda are identical in widely separated host timezones", () => {
  const previousTZ = process.env.TZ;
  const snapshot = () => ({ date: parseDay("30/09/2026"), shifted: addDays("2026-09-30", 29), week: startOfWeek("2026-09-30"), days: daysBetween("2026-09-30", "2026-10-29"), formatted: formatDay("2026-09-30"), explicitZone: formatDay("2026-09-30", { dateStyle: "full", timeZone: "America/Los_Angeles" }), month: formatDay("2026-09-30", { month: "long", year: "numeric" }), agenda: buildAgenda(fixture()) });
  try {
    process.env.TZ = "Pacific/Kiritimati";
    const east = snapshot();
    for (const zone of ["America/Los_Angeles", "America/Fortaleza", "UTC", "Asia/Tokyo"]) { process.env.TZ = zone; assert.deepEqual(snapshot(), east, zone); }
    assert.equal(east.formatted, "30/09/2026");
    assert.equal(east.month, "setembro de 2026");
    assert.match(east.explicitZone, /30 de setembro de 2026/);
  } finally {
    if (previousTZ === undefined) delete process.env.TZ;
    else process.env.TZ = previousTZ;
  }
});
console.log(`Agenda date verification: ${passed} gates passed.`);
