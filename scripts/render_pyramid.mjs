#!/usr/bin/env node
// Собирает страницу с пирамидой метрик и кнопкой «Скачать PDF».
//   node render_pyramid.mjs pyramid.json [--out пирамида.html]
// pyramid.json:
// {
//   "business": {"title": "Кофейни у бизнес-центров", "desc": "…", "industry": "Кофейни" | 2 | "", "stage": "Рост",
//                "game": "attention" | "transaction" | "productivity"},
//   "result": {
//     "summary": "…",
//     "metrics": [{"layer": "business|margin|loyalty|value|quality|sources", "name": "…", "speed": "fast|slow", "table_id": "T1" | "", "note": "…", "how": "…"}],
//     "nsm": {"name": "…", "how": "…", "why": "…", "inputs": {"breadth": {"name": "…", "how": "…"}, "depth": {…}, "frequency": {…}, "efficiency": {…}}},
//     "nsm_check": {"value": {"ok": true, "comment": "…"}, "leading": {…}, "actionable": {…}, "sensitive": {…}, "clear": {…}, "comparable": {…}, "real": {…}},
//     "start_with": ["…", "…", "…"],
//     "vanity": [{"name": "…", "why": "…"}]
//   }
// }
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const input = args.find((a, i) => !a.startsWith("--") && (outAt < 0 || i !== outAt + 1));
if (!input) {
  console.error("Использование: node render_pyramid.mjs pyramid.json [--out пирамида.html]");
  process.exit(1);
}
const out = resolve(outAt >= 0 ? args[outAt + 1] : join(dirname(resolve(input)), "pyramid.html"));

const BENCH = JSON.parse(readFileSync(new URL("../references/benchmarks.json", import.meta.url), "utf8"));
const TEMPLATE = readFileSync(new URL("../assets/pyramid-template.html", import.meta.url), "utf8");
const data = JSON.parse(readFileSync(input, "utf8"));

const LAYERS = ["business", "margin", "loyalty", "value", "quality", "sources"];
const problems = [];
const warnings = [];
const b = data.business || {};
const r = data.result || {};

function findIndustry(q) {
  if (q === undefined || q === null || String(q).trim() === "") return null;
  const s = String(q).trim().toLowerCase();
  return BENCH.industries.find((i) => String(i.id) === s || i.name.toLowerCase() === s) ||
    BENCH.industries.find((i) => i.name.toLowerCase().includes(s)) || null;
}
const industry = findIndustry(b.industry);
if (b.industry && !industry) warnings.push(`отрасль «${b.industry}» не найдена в таблице: страница будет без ориентиров`);

if (!Array.isArray(r.metrics) || !r.metrics.length) problems.push("result.metrics: нужен непустой массив");
if (!r.nsm || !r.nsm.name) problems.push("result.nsm.name: нужна главная метрика");
(r.metrics || []).forEach((m, i) => {
  if (!m.name) problems.push(`metrics[${i}].name пустое`);
  if (!LAYERS.includes(m.layer)) problems.push(`metrics[${i}].layer «${m.layer}» — нужен один из: ${LAYERS.join(", ")}`);
});
if (industry) {
  const used = new Set((r.metrics || []).map((m) => String(m.table_id || "").toUpperCase()).filter(Boolean));
  industry.metrics.forEach((m, i) => {
    if (!used.has(`T${i + 1}`)) warnings.push(`T${i + 1} «${m.name}» не включена — страница добавит её в слой экономики`);
  });
}
if (problems.length) {
  console.error("Пирамида не собрана:\n- " + problems.join("\n- "));
  process.exit(1);
}

// «<» экранируем, чтобы текст вроде «</script>» не закрыл блок данных
const json = JSON.stringify({ business: b, industry, result: r }).replace(/</g, "\\u003c");
writeFileSync(out, TEMPLATE.replace("__DATA__", () => json));
if (warnings.length) console.log("Замечания:\n- " + warnings.join("\n- "));
console.log(out);
