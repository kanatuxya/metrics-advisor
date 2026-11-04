#!/usr/bin/env node
// Отраслевые метрики T1–T5 с ориентирами из references/benchmarks.json.
//   node benchmarks.mjs --list          список 31 отрасли
//   node benchmarks.mjs кофейни         метрики отрасли (по номеру или части названия)
//   node benchmarks.mjs 2 --json        то же в JSON
import { readFileSync } from "node:fs";

const DATA = JSON.parse(readFileSync(new URL("../references/benchmarks.json", import.meta.url), "utf8"));
const args = process.argv.slice(2);
const json = args.includes("--json");
const query = args.filter((a) => !a.startsWith("--")).join(" ").trim();

function norm(s) {
  return s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

// Сначала точный номер, потом подстрока, потом совпадение по основам слов
function find(q) {
  const byId = DATA.industries.find((i) => String(i.id) === q);
  if (byId) return [byId];
  const nq = norm(q);
  const sub = DATA.industries.filter((i) => norm(i.name).includes(nq));
  if (sub.length) return sub;
  const stems = nq.split(" ").filter((w) => w.length > 2).map((w) => w.slice(0, Math.max(4, w.length - 2)));
  return DATA.industries.filter((i) => stems.some((s) => norm(i.name).includes(s)));
}

function render(ind) {
  const out = [`## ${ind.name} (отрасль ${ind.id})`];
  if (ind.caveat) out.push(`Оговорка: ${ind.caveat}`);
  ind.metrics.forEach((m, n) => {
    const dollar = /\$/.test(m.bench);
    out.push(
      "",
      `T${n + 1}. ${m.name} (${m.en})`,
      `  Что значит: ${m.what}`,
      `  Как считать: ${m.how}`,
      `  Ориентир: ${m.bench} · ${m.period} · надёжность: ${m.rel.toLowerCase()}` +
        (dollar ? " · денежный ориентир из зарубежного исследования: в тенге не переносить" : ""),
      `  Как читать: ${m.read}`,
      `  Источник: ${m.source} — ${m.url}`
    );
  });
  return out.join("\n");
}

if (args.includes("--help") || args.includes("-h")) {
  console.log("node benchmarks.mjs --list | <номер или часть названия отрасли> [--json]");
  process.exit(0);
}
if (!query || args.includes("--list")) {
  console.log(DATA.industries.map((i) => `${i.id}. ${i.name}`).join("\n"));
  process.exit(0);
}

const hits = find(query);
if (!hits.length) {
  console.error(`Отрасль «${query}» не найдена. Список: node benchmarks.mjs --list`);
  process.exit(1);
}
if (hits.length > 3 && !json) {
  console.log(`Под «${query}» подходят несколько отраслей, уточните:\n` + hits.map((i) => `${i.id}. ${i.name}`).join("\n"));
  process.exit(0);
}
console.log(json ? JSON.stringify(hits, null, 2) : hits.map(render).join("\n\n"));
