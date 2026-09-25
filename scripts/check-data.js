// Sanity-checks data.js before anything is published. Run: node scripts/check-data.js
// Exits non-zero with a list of problems if the data would break the page.
global.window = {};
require("../data.js");
const D = window.BLACKOPS;
const problems = [];
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s));
const STATUS = ["recon", "active", "extraction", "live", "complete", "hold"];
const STEPS = (D.ALGORITHM && D.ALGORITHM.steps || []).map((s) => s.key);
const KINDS = ["feature", "bug", "access"];

if (!Array.isArray(D.OPERATIONS) || !D.OPERATIONS.length) problems.push("OPERATIONS is empty");
if (!isDate(D.asOf)) problems.push(`asOf is not a date: ${D.asOf}`);
const ids = new Set();
(D.OPERATIONS || []).forEach((op) => {
  const at = op.codename || op.id;
  if (ids.has(op.id)) problems.push(`duplicate id ${op.id}`);
  ids.add(op.id);
  ["id", "codename", "title", "status", "lead", "start", "end", "vision", "mission"].forEach((k) => { if (!op[k]) problems.push(`${at}: missing ${k}`); });
  if (!STATUS.includes(op.status)) problems.push(`${at}: unknown status ${op.status}`);
  if (!isDate(op.start) || !isDate(op.end)) problems.push(`${at}: bad start/end`);
  (op.objectives || []).forEach((o, i) => {
    if (!o.text) problems.push(`${at}: objective ${i} has no text`);
    if (STEPS.length && !STEPS.includes(o.step)) problems.push(`${at}: objective "${o.text}" has step ${o.step}`);
  });
  (op.phases || []).forEach((p) => { if (!isDate(p.start) || !isDate(p.end)) problems.push(`${at}: phase ${p.name} has bad dates`); });
  (op.intel || []).forEach((i) => {
    if (!isDate(i.date)) problems.push(`${at}: intel with bad date ${i.date}`);
    if (i.src && !(D.MEETINGS || {})[i.src]) problems.push(`${at}: intel src ${i.src} not in MEETINGS`);
  });
  if (op.feedback) {
    (op.feedback.asks || []).forEach((a) => {
      if (!isDate(a.date) || !a.text || !a.theme || !KINDS.includes(a.kind)) problems.push(`${at}: bad ask ${JSON.stringify(a).slice(0, 80)}`);
    });
    (op.feedback.shipped || []).forEach((x) => { if (!isDate(x.date) || !x.text) problems.push(`${at}: bad shipped item`); });
  }
  if (op.plan) (op.plan.streams || []).forEach((w) => {
    if (!(w.total >= w.left && w.left >= 0)) problems.push(`${at}: plan stream ${w.name} has left ${w.left} of ${w.total}`);
  });
});
Object.entries(D.MEETINGS || {}).forEach(([k, m]) => { if (!isDate(m.date) || !m.url) problems.push(`meeting ${k} missing date or url`); });

if (problems.length) {
  console.error(`data.js has ${problems.length} problem(s):\n- ` + problems.join("\n- "));
  process.exit(1);
}
const asks = D.OPERATIONS.reduce((n, o) => n + ((o.feedback && o.feedback.asks.length) || 0), 0);
console.log(`data.js OK: ${D.OPERATIONS.length} operations, ${Object.keys(D.MEETINGS || {}).length} meetings, ${asks} asks, as of ${D.asOf}`);
