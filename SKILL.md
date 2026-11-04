---
name: metrics-advisor
description: Picks the right metrics for a business and explains any metric. Builds a metric pyramid (business goals → unit economics → loyalty → value → quality → traffic sources) with one North Star Metric and its four inputs, industry benchmarks for 31 industries, the three metrics to start with this week and the vanity metrics to skip, and can render it as a page with a PDF for the team. Use whenever the user asks which metrics or KPIs to track, how to measure a business or product, wants a metrics system or dashboard plan, a North Star / NSM, unit economics, LTV, CAC, C1, retention, ARPU, churn, benchmarks or norms for an industry, or asks what a metric means or how to calculate it — e.g. «какие метрики считать», «пирамида метрик», «главная метрика продукта», «что такое C1», «как посчитать LTV», «бенчмарки для кофейни», «на что смотреть каждую неделю». Answers in Russian by default, money in tenge (₸).
---

# Metrics advisor

Two jobs: explain a metric, or build a metric system for a specific business. The knowledge base is in Russian; answer in the user's language (Russian by default) and keep all money in tenge (₸).

Skill dir: `~/.claude/skills/metrics-advisor` (below: `$S`).

| File | What is in it | When to read |
|---|---|---|
| `references/pyramid-rules.md` | layers, clarifying questions, 16 pyramid rules, chat output format | every pyramid |
| `references/north-star.md` | NSM, the three «games», checklist, inputs, traps | every pyramid, NSM questions |
| `references/glossary.md` | ~50 metrics by layer: meaning, formula, fast/slow | metric questions, naming metrics |
| `references/atlas.md` | the method in depth: pyramid, formulas, fast/slow, good vs vanity, building a system, cases, step-by-step algorithm | concept questions, «why», when a case helps |
| `references/finance-ratios.md` | cash cycle, liquidity, debt, ROA/ROE | business has inventory, payment terms, loans or big assets |
| `references/saas-kpis.md` | B2B subscription software metrics | B2B SaaS only |
| `references/benchmarks.json` | 31 industries × 5 metrics with benchmarks and sources | via `scripts/benchmarks.mjs`, never read whole |
| `assets/atlas.html` | the same atlas as a searchable page for people | when the user wants to read it themselves |

`atlas.md` and `assets/atlas.html` may be absent in some installs. Everything else works without them; fall back to `glossary.md` and `pyramid-rules.md`.

## Job 1: explain a metric or concept

1. Find it in `glossary.md` (search by English name, abbreviation or Russian name). For concepts — NSM, fast vs slow, vanity, pyramid vs funnel, hypothesis chain — use `atlas.md`.
2. Answer briefly: what it means, the formula, which layer of the pyramid it sits on, fast or slow, and a small worked example in tenge.
3. If an industry is named and the metric is in its table, add the benchmark (`node $S/scripts/benchmarks.mjs <industry>`), following the benchmark rules below.
4. Don't paste whole reference files; quote only what answers the question.

## Job 2: build a metric pyramid

Read `pyramid-rules.md` and `north-star.md` first.

1. **Understand the business.** Industry, stage (идея / первые клиенты / рост / масштаб), how it makes money, which «game» it plays (`attention`, `transaction` or `productivity`, see `north-star.md`). Map the industry: `node $S/scripts/benchmarks.mjs --list`, then `node $S/scripts/benchmarks.mjs <id or name>` for its five T-metrics (add `--json` for raw fields). No close match → industry «другая», no table benchmarks.
2. **Ask 2–3 clarifying questions** — only what the description lacks, in the priority order from `pyramid-rules.md`, each with an example answer. Propose the game with one-line reasoning and ask the user to finish the phrase «Я был бы уверен, что дело идёт в правильную сторону, если бы видел рост …». Then stop and wait. Skip this step only if the description already answers it or the user asks for no questions; then state your assumptions at the top.
3. **Build the pyramid** by the 16 rules: 9–15 metrics across six layers, all five T-metrics included and marked, one NSM with four inputs (охват, глубина, частота, эффективность), the 7-point NSM check, three metrics to start with this week, three vanity metrics to skip, a one- or two-sentence takeaway. Pull metric names from `glossary.md`, make them concrete for this business. Add finance ratios or SaaS metrics only under rules 15–16.
4. **Answer in chat** in the format from `pyramid-rules.md`.
5. **Offer the page.** If the user wants it (for the team, to print, as PDF): write the pyramid as JSON in the shape documented at the top of `scripts/render_pyramid.mjs` into the user's working folder, then run
   `node $S/scripts/render_pyramid.mjs pyramid.json --out "Пирамида метрик — <бизнес>.html"`
   and open the file (`open <file>` on macOS). The page has a «Скачать PDF» button. Fix any problems the script reports; its warnings about missing T-metrics mean rule 2 was broken. If the user wants a link to share rather than a file, and the environment can publish HTML pages, offer that instead.

## Benchmark rules

- Only cite benchmarks from the table. Never invent norms or «good values». Numbers about the business come only from the user.
- Always give the market (`period`, which includes the year when known — otherwise say «год не указан») and reliability (`rel`); mention the industry `caveat` if there is one. The source link is in the table — give it when asked.
- Percentages and ratios transfer between markets. Dollar amounts from foreign studies do not: say «денежный ориентир из зарубежного исследования не переносим — сравнивайте с собой в динамике». Don't convert currency.

## Style

- Plain Russian, short sentences. Abbreviations like LTV, NSM, C1 are fine; explain each on first use for a non-specialist.
- Concrete names: «Доля гостей, вернувшихся в течение 30 дней», not «Retention».
- Never use revenue, profit, DAU, MAU, registrations, followers or downloads as the NSM.
- When a metric drops, walk the pyramid: find the layer, don't treat loyalty with marketing, look for the cause in value and quality below, and keep the upper layers from falling.
