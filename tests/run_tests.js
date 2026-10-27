/**
 * ScamShield India — test runner (Node.js, no dependencies)
 * Usage: node tests/run_tests.js
 */
const path = require("path");
const { analyze } = require(path.join(__dirname, "..", "js", "detector.js"));
const samples = require(path.join(__dirname, "sample_messages.json"));

const accept = {
  HIGH: ["HIGH"],
  MEDIUM_OR_HIGH: ["MEDIUM", "HIGH"],
  LOW_OR_MEDIUM: ["LOW", "MEDIUM"],
  SAFE: ["SAFE"],
};

let pass = 0;
for (const s of samples) {
  const r = analyze(s.text);
  const ok = accept[s.expected].includes(r.level);
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${s.id}  ${s.title.padEnd(34)} score=${String(r.score).padStart(3)}  level=${r.level.padEnd(6)} expected=${s.expected}`);
  console.log(`      signs: ${r.indicators.map((i) => i.category).join(", ") || "none"}`);
}

// Edge cases
const empty = analyze("");
const emptyOk = empty.level === "EMPTY";
console.log(`${emptyOk ? "PASS" : "FAIL"}  E01  Empty input handled`);
if (emptyOk) pass++;

const total = samples.length + 1;
console.log(`\n${pass}/${total} tests passed`);
process.exit(pass === total ? 0 : 1);
