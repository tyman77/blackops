(() => {
  const D = window.BLACKOPS;
  const OPS = D.OPERATIONS;
  const AS_OF = new Date(D.asOf + "T12:00:00");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);

  const STATUS = {
    recon: "Scoping",
    active: "In progress",
    extraction: "Wrapping up",
    live: "Live",
    complete: "Done",
    hold: "On hold"
  };
  const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"];
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // ---------- helpers ----------
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const redact = (t) => esc(t).replace(/\[\[(.+?)\]\]/g, '<span class="redact" tabindex="0" title="Classified. Hover to reveal">$1</span>');
  const plain = (t) => String(t).replace(/\[\[(.+?)\]\]/g, "$1");
  const MEET = D.MEETINGS || {};
  const ALGO = D.ALGORITHM || { steps: [] };
  const STEP = Object.fromEntries(ALGO.steps.map((st, n) => [st.key, { ...st, n: n + 1 }]));
  const SHORT = { question: "Question", delete: "Delete", simplify: "Simplify", accelerate: "Accelerate", automate: "Automate" };
  const stepChip = (k) => (STEP[k] ? `<span class="step-chip">${String(STEP[k].n).padStart(2, "0")} ${SHORT[k] || STEP[k].name}</span>` : "");
  const CH = D.CHANNEL;
  const srcLink = (i) => {
    if (i.src && MEET[i.src]) return ` <a class="src" href="${esc(MEET[i.src].url)}" target="_blank" rel="noopener">Meeting notes ↗</a>`;
    const chan = i.ch === "apex" ? D.APEX_CHANNEL : CH;
    if (i.slack && chan) return ` <a class="src" href="${esc(`${chan.url}/${i.slack}`)}" target="_blank" rel="noopener">${i.ch === "apex" ? "#apex" : "Slack"} ↗</a>`;
    if (i.doc) return ` <span class="via">${esc(i.doc)}</span>`;
    return "";
  };
  const fmtMonth = (s) => { const d = date(s); return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; };
  const date = (s) => new Date(s + "T12:00:00");
  const fmt = (s) => { const d = date(s); return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; };
  const initials = (n) => n.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const roman = (i) => ROMAN[i] || String(i + 1);
  const idx = (op) => OPS.indexOf(op);

  // value noise, shared by the summit model and the contour texture
  const hash2 = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y, o = 4) => { let t = 0, amp = 0.5, f = 1; for (let i = 0; i < o; i++) { t += amp * vnoise(x * f, y * f); f *= 2; amp *= 0.5; } return t; };

  const windowText = (op) => op.ongoing
    ? `Live · since ${fmt(op.start)}`
    : `${fmt(op.start)} – ${op.estimatedEnd ? fmtMonth(op.end) : fmt(op.end)}`;
  const elapsed = (op) => clamp((AS_OF - date(op.start)) / (date(op.end) - date(op.start)));
  const outcomePct = (o) => (o.target === o.baseline ? 1 : clamp((o.current - o.baseline) / (o.target - o.baseline)));
  const STATE_LBL = { met: "Delivered", on: "On track", pending: "Pending", behind: "Behind" };
  const outcomeState = (o, op) => {
    if (o.state) return [o.state, STATE_LBL[o.state] || o.state];
    const p = outcomePct(o);
    if (p >= 1) return ["met", "Delivered"];
    const e = elapsed(op);
    if (op.status === "hold" || e < 0.25 || p >= e * 0.8) return ["on", "On track"];
    return ["behind", "Behind"];
  };
  const fmtVal = (v, unit) => `${Number.isInteger(v) ? v : v.toFixed(1)}${unit && !unit.startsWith("/") && unit !== "%" ? " " : ""}${unit || ""}`;

  // ---------- vision / now / done / next: what each project's data says ----------
  const DAY = 864e5;
  const phaseState = (op, p) => {
    if (p.ongoing) return "live";
    if (date(p.end) < AS_OF || op.status === "complete") return "done";
    return date(p.start) <= AS_OF ? "now" : "next";
  };
  const phasePct = (p) => clamp((AS_OF - date(p.start)) / (date(p.end) - date(p.start)));
  const inDays = (s) => {
    const n = Math.round((date(s) - AS_OF) / DAY);
    return n <= 0 ? "Today" : n === 1 ? "Tomorrow" : n < 14 ? `In ${n} days` : n < 60 ? `In ${Math.round(n / 7)} weeks` : `In ${Math.round(n / 30)} months`;
  };
  const nowPhase = (op) => (op.phases || []).find((p) => ["now", "live"].includes(phaseState(op, p)));
  const nowLine = (op) => {
    const p = nowPhase(op);
    if (!p) return null;
    if (p.ongoing) return { name: p.name, pct: null, note: `Live since ${fmt(p.start)}` };
    return { name: p.name, pct: phasePct(p), note: `${Math.round(phasePct(p) * 100)}% through · ends ${inDays(p.end).toLowerCase()}` };
  };
  const newest = (op, n = 1) => [...(op.intel || [])].sort((a, b) => date(b.date) - date(a.date)).slice(0, n);
  const metOutcomes = (op) => (op.outcomes || []).filter((o) => outcomeState(o, op)[0] === "met");
  const doneObjs = (op) => (op.objectives || []).filter((o) => o.done);
  const openObjs = (op) => (op.objectives || []).filter((o) => !o.done);
  const winCount = (op) => doneObjs(op).length + metOutcomes(op).length;
  const outVal = (o) => (o.value !== undefined ? String(o.value) : o.current !== undefined ? fmtVal(o.current, o.unit) : "");
  // dated milestones still ahead: a phase starting, the current phase wrapping up, an objective due
  const milestones = (op) => [
    ...(op.phases || []).flatMap((p) => {
      const st = phaseState(op, p);
      if (st === "next") return [{ op, when: p.start, what: `${p.name} begins`, kind: "start" }];
      if (st === "now") return [{ op, when: p.end, what: `${p.name} wraps up`, kind: "end" }];
      return [];
    }),
    ...openObjs(op).filter((o) => o.due && date(o.due) >= AS_OF).map((o) => ({ op, when: o.due, what: o.text, kind: "due", who: o.owner }))
  ].sort((a, b) => date(a.when) - date(b.when));
  const dateBlock = (s) => { const d = date(s); return `<span class="next-date"><b class="num">${String(d.getDate()).padStart(2, "0")}</b><span>${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}</span></span>`; };
  const nextRow = (m, button) => `<li class="next-row k-${m.kind}">${button ? `<button type="button" data-op="${m.op.id}" data-cursor="Open file">` : "<div>"}
      ${dateBlock(m.when)}<span class="next-dot" aria-hidden="true"></span>
      <span class="next-body">${button ? `<span class="next-code">${esc(m.op.codename)}</span>` : ""}<span class="next-what">${redact(m.what)}</span>${m.who ? `<span class="who-inline">${esc(m.who)}</span>` : ""}</span>
      <span class="next-in label">${inDays(m.when)}</span>${button ? "</button>" : "</div>"}</li>`;

  // ---------- header, briefing ----------
  $("#unitShort").textContent = D.unit.split(/\s+/).map((w) => w[0]).join("").toUpperCase();
  $("#mandate").textContent = D.mandate;
  $("#asof").innerHTML = `${esc(D.unit.toUpperCase())}<br>BRIEFING AS OF ${fmt(D.asOf)}<br>${OPS.length} FILES ON RECORD`;

  (function kpis() {
    const moving = OPS.filter((o) => !["complete", "hold"].includes(o.status)).length;
    const wins = OPS.reduce((n, op) => n + winCount(op), 0);
    const next = OPS.flatMap(milestones).filter((m) => m.kind !== "end").sort((a, b) => date(a.when) - date(b.when))[0];
    $("#kpis").innerHTML = `
      <div class="kpi"><span class="v num" data-count="${moving}">${moving}</span><span class="label">Projects in motion</span></div>
      <div class="kpi"><span class="v num" data-count="${wins}">${wins}</span><span class="label">Wins so far</span></div>
      <div class="kpi wide"><span class="v sm">${next ? esc(next.op.codename) : "Nothing scheduled"}</span><span class="label">${next ? `Up next: ${esc(next.what)} · ${fmt(next.when)}` : "Up next"}</span></div>`;
    const line = $("#algoLine");
    if (line) line.innerHTML = ALGO.steps.map((st) => `<li>${esc(SHORT[st.key] || st.name)}</li>`).join("");
  })();

  (function clock() {
    const el = $("#clock");
    const tick = () => {
      const n = new Date();
      el.textContent = `${n.toLocaleTimeString([], { hour12: false })} LOCAL`;
    };
    tick();
    setInterval(tick, 1000);
  })();

  // ---------- hero: one object, one light ----------
  (function stage() {
    // The summit is an image (D.HERO_IMAGE). A light background is removed by flood-filling in from
    // the edges, so a black-on-white illustration sits on the black page; a soft light glows behind
    // the peak and follows the pointer.
    const canvas = $("#stage");
    const lightEl = $("#summitLight");
    const src = D.HERO_IMAGE;
    const fail = () => { canvas.hidden = true; };
    if (!src || !canvas.getContext) return fail();
    const img = new Image();
    img.onerror = fail;
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.aspectRatio = `${w} / ${h}`;
      canvas.closest(".hero").classList.add(h > w ? "tall" : "wide");
      const g = canvas.getContext("2d");
      g.drawImage(img, 0, 0);
      let data;
      try { data = g.getImageData(0, 0, w, h); } catch (e) { return; }
      const px = data.data;
      const lum = (i) => 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      let edge = 0, n = 0;
      // judge the sky only: the top row and the upper third of each side (the base is usually dark rock)
      for (let x = 0; x < w; x += 4) { edge += lum(x * 4); n++; }
      for (let y = 0; y < h / 3; y += 4) { edge += lum(y * w * 4) + lum((y * w + w - 1) * 4); n += 2; }
      if (edge / n > 170) {
        // light background: flood fill from every edge pixel through light pixels, make them clear
        const bg = new Uint8Array(w * h), stack = [];
        const T = 200;
        const push = (x, y) => { const k = y * w + x; if (!bg[k] && lum(k * 4) > T) { bg[k] = 1; stack.push(k); } };
        for (let x = 0; x < w; x++) push(x, 0);
        for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
        while (stack.length) {
          const k = stack.pop(), x = k % w, y = (k / w) | 0;
          if (x > 0) push(x - 1, y);
          if (x < w - 1) push(x + 1, y);
          if (y > 0) push(x, y - 1);
          if (y < h - 1) push(x, y + 1);
        }
        for (let k = 0; k < w * h; k++) {
          if (bg[k]) { px[k * 4 + 3] = 0; continue; }
          // soften the silhouette edge where it meets cleared background
          const x = k % w, y = (k / w) | 0;
          if ((x > 0 && bg[k - 1]) || (x < w - 1 && bg[k + 1]) || (y > 0 && bg[k - w]) || (y < h - 1 && bg[k + w])) px[k * 4 + 3] = 150;
        }
        g.putImageData(data, 0, 0);
        canvas.classList.add("cutout");
      } else {
        canvas.classList.add("dark");
      }
    };
    img.src = src;

    const hero = canvas.closest(".hero");
    let want = 0.5, at = 0.5, raf = 0;
    const move = () => {
      raf = 0;
      at += (want - at) * (reduced ? 1 : 0.1);
      if (lightEl) lightEl.style.setProperty("--lx", `${(at * 100).toFixed(2)}%`);
      if (Math.abs(want - at) > 0.001) raf = requestAnimationFrame(move);
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      want = 0.35 + 0.3 * ((e.clientX - r.left) / r.width);
      if (!raf) raf = requestAnimationFrame(move);
    });
    hero.addEventListener("pointerleave", () => { want = 0.5; if (!raf) raf = requestAnimationFrame(move); });
  })();

  // ---------- topographic texture ----------
  (function topo() {
    try {
      const c = document.createElement("canvas");
      const Wd = 1400, Ht = 900, S = 10;
      c.width = Wd; c.height = Ht;
      const g = c.getContext("2d");
      g.strokeStyle = "rgba(255,255,255,0.07)";
      g.lineWidth = 1;
      const cols = Wd / S + 1, rowsN = Ht / S + 1;
      const f = [];
      for (let i = 0; i < rowsN; i++) { f.push([]); for (let j = 0; j < cols; j++) f[i].push(fbm(j * 0.03 + 11, i * 0.03 + 5, 5)); }
      g.beginPath();
      for (let L = 0.2; L < 0.8; L += 0.035) {
        for (let i = 0; i < rowsN - 1; i++) for (let j = 0; j < cols - 1; j++) {
          const cs = [[i, j], [i, j + 1], [i + 1, j + 1], [i + 1, j]];
          const v = cs.map(([a, b]) => f[a][b]);
          const hits = [];
          for (let e = 0; e < 4; e++) {
            const a = v[e], b = v[(e + 1) % 4];
            if ((a < L) === (b < L)) continue;
            const t = (L - a) / (b - a);
            const [ia, ja] = cs[e], [ib, jb] = cs[(e + 1) % 4];
            hits.push([(ja + (jb - ja) * t) * S, (ia + (ib - ia) * t) * S]);
          }
          for (let h = 0; h + 1 < hits.length; h += 2) { g.moveTo(...hits[h]); g.lineTo(...hits[h + 1]); }
        }
      }
      g.stroke();
      document.documentElement.style.setProperty("--topo", `url(${c.toDataURL("image/png")})`);
    } catch (e) { /* texture is decorative */ }
  })();

  // On phones the five steps become a swipeable row; these tabs jump between them and
  // show which step is in view. Hidden on wider screens by CSS.
  const stepCounts = (objs) => ALGO.steps.map((st) => {
    const list = objs.filter((o) => o.step === st.key);
    return [list.filter((o) => o.done).length, list.length];
  });
  function snapTabs(row, counts) {
    if (!row) return;
    const steps = [...row.querySelectorAll(".step")];
    const bar = document.createElement("div");
    bar.className = "snap-tabs";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Algorithm steps");
    bar.innerHTML = ALGO.steps.map((st, i) => `<button type="button" data-i="${i}" aria-label="${esc(st.name)}"><span>${SHORT[st.key] || st.name}</span><b class="num">${counts[i][0]}/${counts[i][1]}</b></button>`).join("");
    row.before(bar);
    const btns = [...bar.children];
    const mark = () => {
      const w = steps[0] ? steps[0].getBoundingClientRect().width + 10 : 1;
      const at = Math.min(steps.length - 1, Math.round(row.scrollLeft / w));
      btns.forEach((b, i) => b.classList.toggle("on", i === at));
    };
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-i]");
      if (b) row.scrollTo({ left: steps[+b.dataset.i].offsetLeft - steps[0].offsetLeft, behavior: reduced ? "auto" : "smooth" });
    });
    row.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true });
    mark();
  }

  // this project's objectives laid out along the five steps, shown in its file
  function algoHTML(op) {
    if (!ALGO.steps.length) return "";
    const objs = op.objectives || [];
    const loose = objs.filter((o) => !STEP[o.step]);
    const cols = ALGO.steps.map((st, n) => {
      const list = objs.filter((o) => o.step === st.key);
      const done = list.filter((o) => o.done).length;
      return `<div class="step ${list.length ? "" : "empty"}">
        <div class="step-no"><span>${String(n + 1).padStart(2, "0")}</span>${n < ALGO.steps.length - 1 ? '<span class="arrow" aria-hidden="true">→</span>' : ""}</div>
        <h3>${esc(st.name)}</h3>
        <div class="step-count"><strong>${done}</strong><span>of ${list.length} moves<br>done</span></div>
        <div class="step-bar" aria-hidden="true">${list.map((o, i) => `<i class="${i < done ? "on" : ""}"></i>`).join("")}</div>
        ${list.length ? `<ul>${[...list.filter((o) => !o.done), ...list.filter((o) => o.done)].map((o) => `<li class="${o.done ? "done" : ""}"><span class="box" aria-hidden="true"></span><span><span class="t">${redact(o.text)}</span>${o.owner || o.due ? `<span class="who">${esc(o.owner || "")}${o.due ? ` · due ${fmt(o.due)}` : ""}</span>` : ""}</span></li>`).join("")}</ul>` : '<span class="none">No moves at this step yet</span>'}
      </div>`;
    }).join("");
    const rest = loose.length ? `<ul class="checks">${loose.map((o) => `<li class="${o.done ? "done" : ""}"><span class="box" aria-hidden="true"></span><span>${redact(o.text)}</span></li>`).join("")}</ul>` : "";
    return `<div class="d-sec"><h3>The Algorithm · ${esc(op.codename)}</h3><div class="algo mine">${cols}</div>${rest}</div>`;
  }

  // ---------- operations reel ----------
  const reel = $("#reel");
  let filter = "all";

  function renderFilters() {
    const counts = OPS.reduce((m, o) => ((m[o.status] = (m[o.status] || 0) + 1), m), {});
    const keys = ["all", ...Object.keys(STATUS).filter((k) => counts[k])];
    $("#filters").innerHTML = keys.map((k) =>
      `<button class="filter" type="button" data-f="${k}" aria-pressed="${k === filter}">${k === "all" ? "All" : STATUS[k]}<sup class="num">${k === "all" ? OPS.length : counts[k]}</sup></button>`
    ).join("");
  }
  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]");
    if (!b) return;
    filter = b.dataset.f;
    renderFilters();
    renderReel();
    if (pinned()) scrollTo({ top: $("#vision").offsetTop });
    else reel.scrollTo({ left: 0 });
  });

  function renderReel() {
    const list = OPS.filter((o) => filter === "all" || o.status === filter);
    if (!list.length) { reel.innerHTML = `<div class="empty">No projects with this status.</div>`; updateScrub(); return; }
    reel.innerHTML = list.map((op) => {
      const now = nowLine(op);
      return `
      <button class="op" type="button" data-op="${op.id}" data-cursor="Open file">
        <div class="op-top"><span class="op-idx">${roman(idx(op))}.</span><span class="st st-${op.status}">${STATUS[op.status]}</span></div>
        <div class="op-mid">
          <h3 class="op-name" data-scramble>${esc(op.codename)}</h3>
          <p class="op-title">${esc(op.title)}</p>
          <p class="op-vision">${esc(op.vision)}</p>
          ${(op.targets || []).length ? `<div class="op-targets">${op.targets.slice(0, 2).map((t) => `<div><strong>${esc(t.value)}</strong><span>${esc(t.label)}</span></div>`).join("")}</div>` : ""}
        </div>
        <div class="op-foot">
          ${now ? `<div class="op-now">
            <div class="prog-row"><span class="label">Now · <b>${esc(now.name)}</b></span><span class="label num">${now.pct === null ? "Live" : `${Math.round(now.pct * 100)}%`}</span></div>
            <div class="bar ${now.pct === null ? "live" : ""}" aria-hidden="true"><i style="width:${now.pct === null ? 100 : Math.max(2, now.pct * 100)}%"></i></div>
          </div>` : ""}
          <div class="op-meta"><span class="label"><b>${winCount(op)}</b> done · <b>${openObjs(op).length}</b> to go · Lead <b>${esc(op.lead)}</b></span><span class="open-cue">Open</span></div>
        </div>
      </button>`;
    }).join("");
    updateScrub();
  }

  reel.addEventListener("click", (e) => { const c = e.target.closest("[data-op]"); if (c) openFile(c.dataset.op, c); });
  reel.addEventListener("pointermove", (e) => {
    const c = e.target.closest(".op");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${e.clientX - r.left}px`);
    c.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
  reel.addEventListener("pointerover", (e) => {
    const c = e.target.closest(".op");
    if (c && !c.contains(e.relatedTarget)) scramble($(".op-name", c));
  });
  // vertical wheel scrolls the reel sideways until it hits either end
  const pinned = () => document.documentElement.classList.contains("pin-ops");
  reel.addEventListener("wheel", (e) => {
    if (pinned() || Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.shiftKey) return;
    const max = reel.scrollWidth - reel.clientWidth;
    if (max <= 0) return;
    if ((reel.scrollLeft <= 0 && e.deltaY < 0) || (reel.scrollLeft >= max - 1 && e.deltaY > 0)) return;
    e.preventDefault();
    reel.scrollLeft += e.deltaY;
  }, { passive: false });
  reel.addEventListener("scroll", () => requestAnimationFrame(updateScrub));
  addEventListener("resize", updateScrub);

  const step = () => { const c = $(".op", reel); return c ? c.getBoundingClientRect().width + 20 : 400; };
  const nudge = (d) => pinned()
    ? scrollBy({ top: d * step(), behavior: reduced ? "auto" : "smooth" })
    : reel.scrollBy({ left: d * step(), behavior: reduced ? "auto" : "smooth" });
  $("#reelPrev").addEventListener("click", () => nudge(-1));
  $("#reelNext").addEventListener("click", () => nudge(1));

  function updateScrub() {
    const s = $("#scrub");
    const w = reel.scrollWidth || 1;
    s.style.width = `${Math.min(100, (reel.clientWidth / w) * 100)}%`;
    s.style.left = `${(reel.scrollLeft / w) * 100}%`;
    const cards = reel.querySelectorAll(".op");
    const first = Math.min(cards.length, Math.round(reel.scrollLeft / step()) + 1);
    $("#reelCount").textContent = cards.length ? `${String(first).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}` : "";
  }

  // ---------- text decrypt effect ----------
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#";
  function scramble(el) {
    if (!el || reduced) return;
    const final = el.dataset.final || el.textContent;
    el.dataset.final = final;
    const start = performance.now(), dur = 520;
    cancelAnimationFrame(el._raf);
    const run = (now) => {
      const k = clamp((now - start) / dur);
      const shown = Math.floor(k * final.length);
      el.textContent = final.split("").map((ch, i) =>
        i < shown || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
      if (k < 1) el._raf = requestAnimationFrame(run);
      else el.textContent = final;
    };
    el._raf = requestAnimationFrame(run);
  }

  // ---------- now: the current phase and the latest word from each project ----------
  (function nowSection() {
    $("#nowAsOf").textContent = `As of ${fmt(D.asOf)}`;
    const el = $("#nowGrid");
    el.innerHTML = OPS.map((op) => {
      const n = nowLine(op), last = newest(op)[0];
      return `<button class="now-card" type="button" data-op="${op.id}" data-cursor="Open file">
        <span class="now-top"><span class="now-code">${esc(op.codename)}</span><span class="st st-${op.status}">${STATUS[op.status]}</span></span>
        <span class="now-title">${esc(op.title)}</span>
        ${n ? `<span class="now-phase"><b>${esc(n.name)}</b><span class="label">${esc(n.note)}</span></span>
        <span class="bar ${n.pct === null ? "live" : ""}" aria-hidden="true"><i style="width:${n.pct === null ? 100 : Math.max(2, n.pct * 100)}%"></i></span>` : ""}
        ${last ? `<span class="now-latest"><span class="label">Latest · ${fmt(last.date)}</span><span>${redact(last.text)}</span></span>` : ""}
      </button>`;
    }).join("");
    el.addEventListener("click", (e) => { if (e.target.closest(".redact")) return; const c = e.target.closest("[data-op]"); if (c) openFile(c.dataset.op, c); });
  })();

  // ---------- done: every win so far ----------
  (function doneSection() {
    const moves = OPS.flatMap((op) => doneObjs(op).map((o) => ({ op, kind: "move", text: o.text, who: o.owner })));
    const outs = OPS.flatMap((op) => metOutcomes(op).map((o) => ({ op, kind: "outcome", label: o.label, value: outVal(o) })));
    const phases = OPS.reduce((n, op) => n + (op.phases || []).filter((p) => phaseState(op, p) === "done").length, 0);
    const releases = OPS.reduce((n, op) => n + ((op.feedback && op.feedback.shipped) || []).length, 0);
    $("#doneStats").innerHTML = [[moves.length, "Moves done"], [outs.length, "Outcomes delivered"], [phases, "Phases complete"], [releases, "Apex releases shipped"]]
      .filter(([n]) => n).map(([n, l]) => `<div class="done-stat"><strong class="num" data-count="${n}">${n}</strong><span class="label">${l}</span></div>`).join("");

    // outcomes first, then moves dealt round-robin so the wall mixes projects
    const perOp = OPS.map((op) => moves.filter((m) => m.op === op));
    const dealt = [];
    for (let i = 0; perOp.some((l) => l[i]); i++) perOp.forEach((l) => { if (l[i]) dealt.push(l[i]); });
    const all = [...outs, ...dealt];
    const tile = (w) => w.kind === "outcome"
      ? `<button class="win big" type="button" data-op="${w.op.id}" data-cursor="Open file"><span class="win-code">${esc(w.op.codename)}</span><strong>${esc(w.value || w.label)}</strong><span class="win-t">${esc(w.label)}</span></button>`
      : `<button class="win" type="button" data-op="${w.op.id}" data-cursor="Open file"><span class="win-code">${esc(w.op.codename)}</span><span class="win-t"><span class="win-check" aria-hidden="true">✓</span>${redact(w.text)}</span>${w.who ? `<span class="win-who">${esc(w.who)}</span>` : ""}</button>`;
    const el = $("#wins"), more = $("#winsMore"), FIRST = 12;
    el.innerHTML = all.slice(0, FIRST).map(tile).join("");
    if (all.length > FIRST) {
      more.hidden = false;
      more.textContent = `Show all ${all.length} wins`;
      more.addEventListener("click", () => { el.insertAdjacentHTML("beforeend", all.slice(FIRST).map(tile).join("")); more.hidden = true; }, { once: true });
    }
    el.addEventListener("click", (e) => { if (e.target.closest(".redact")) return; const c = e.target.closest("[data-op]"); if (c) openFile(c.dataset.op, c); });
  })();

  // ---------- next: dated milestones, then what's on deck ----------
  (function nextSection() {
    const items = OPS.flatMap(milestones).sort((a, b) => date(a.when) - date(b.when));
    const open = OPS.reduce((n, op) => n + openObjs(op).length, 0);
    const el = $("#nextList");
    el.innerHTML = items.map((m) => nextRow(m, true)).join("") +
      `<li class="next-row k-deck"><div><span class="next-date"><b class="num">+${open}</b><span>On deck</span></span><span class="next-dot" aria-hidden="true"></span>
        <span class="next-body"><span class="next-what">${open} more moves are lined up across the projects. Open any file to see who's on what.</span></span></div></li>`;
    el.addEventListener("click", (e) => { if (e.target.closest(".redact")) return; const c = e.target.closest("[data-op]"); if (c) openFile(c.dataset.op, c); });
  })();

  // ---------- footer: where to follow along ----------
  (function follow() {
    const last = Object.values(MEET).sort((a, b) => date(b.date) - date(a.date))[0];
    const links = [
      CH && `<a href="${esc(CH.url)}" target="_blank" rel="noopener">${esc(CH.name)} ↗</a>`,
      D.APEX_CHANNEL && `<a href="${esc(D.APEX_CHANNEL.url)}" target="_blank" rel="noopener">${esc(D.APEX_CHANNEL.name)} ↗</a>`,
      last && `<a href="${esc(last.url)}" target="_blank" rel="noopener">Latest meeting notes · ${fmt(last.date)} ↗</a>`
    ].filter(Boolean);
    $("#follow").innerHTML = `Follow along: ${links.join(" · ")}`;
  })();

  // ---------- dossier ----------
  const dossier = $("#dossier");
  let current = null, returnFocus = null;

  // release plan: headline stats plus done / left hours per workstream, all on one scale
  function planHTML(plan) {
    if (!plan) return "";
    const max = Math.max(...plan.streams.map((w) => w.total));
    const rows = plan.streams.map((w) => {
      const done = w.total - w.left;
      const pct = w.total ? Math.round((done / w.total) * 100) : 0;
      const tip = `${w.name}: ${done} h done, ${w.left} h left of ${w.total} h (${pct}%). ${w.note}`;
      return `<div class="ws" tabindex="0" title="${esc(tip)}" aria-label="${esc(tip)}">
        <span class="ws-name">${esc(w.name)}<small>${esc(w.note)}</small></span>
        <span class="ws-bar" style="width:${(w.total / max) * 100}%">
          ${done ? `<i class="ws-done" style="flex:${done}"></i>` : ""}${w.left ? `<i class="ws-left" style="flex:${w.left}"></i>` : ""}
        </span>
        <span class="ws-val num">${w.left ? `${w.left} h left` : "Done"}<small>of ${w.total} h · ${pct}%</small></span>
      </div>`;
    }).join("");
    return `<div class="d-sec plan"><h3>${esc(plan.title)}</h3>
      <div class="plan-stats">${plan.stats.map((t) => `<div><strong class="num">${esc(t.v)}</strong><span class="label">${esc(t.l)}</span></div>`).join("")}</div>
      <div class="plan-legend label"><span><i class="sw sw-done"></i>Done</span><span><i class="sw sw-left"></i>Left to v1</span><span>Bar length = planned hours</span></div>
      <div class="ws-list">${rows}</div>
      ${plan.parked ? `<p class="plan-note">${esc(plan.parked)}</p>` : ""}
      <p class="plan-note label">Source: ${esc(plan.source)}</p>
    </div>`;
  }

  // channel feedback: what shipped, what people asked for, by theme
  const KIND = { feature: "Feature", bug: "Bug", access: "Access & setup" };
  function feedbackHTML(fb) {
    if (!fb) return "";
    const ch = D.APEX_CHANNEL || CH;
    const link = (ts) => `${esc(ch.url)}/${ts}`;
    const asks = [...fb.asks].sort((a, b) => date(b.date) - date(a.date));
    const themes = {};
    asks.forEach((a) => { const t = (themes[a.theme] = themes[a.theme] || { name: a.theme, feature: 0, bug: 0, access: 0, n: 0 }); t[a.kind]++; t.n++; });
    const rows = Object.values(themes).sort((a, b) => b.n - a.n);
    const max = rows[0] ? rows[0].n : 1;
    const count = (k) => asks.filter((a) => a.kind === k).length;
    const answered = asks.filter((a) => a.answered).length;
    const bars = rows.map((t) => {
      const tip = `${t.name}: ${t.n} asks (${t.feature} feature, ${t.bug} bug, ${t.access} access & setup)`;
      return `<div class="ws fb-row" tabindex="0" title="${esc(tip)}" aria-label="${esc(tip)}">
        <span class="ws-name">${esc(t.name)}</span>
        <span class="ws-bar" style="width:${(t.n / max) * 100}%">
          ${["feature", "bug", "access"].filter((k) => t[k]).map((k) => `<i class="fb-${k}" style="flex:${t[k]}"></i>`).join("")}
        </span>
        <span class="ws-val num">${t.n}<small>${t.bug ? `${t.bug} bug${t.bug > 1 ? "s" : ""}` : "no bugs"}</small></span>
      </div>`;
    }).join("");
    return `<div class="d-sec plan fb"><h3>Field feedback · ${esc(ch.name)}</h3>
      <div class="plan-stats">
        <div><strong class="num">${fb.shipped.length}</strong><span class="label">Releases announced</span></div>
        <div><strong class="num">${asks.length}</strong><span class="label">Asks from the team</span></div>
        <div><strong class="num">${count("feature")}</strong><span class="label">Feature requests</span></div>
        <div><strong class="num">${count("bug")}</strong><span class="label">Bug reports</span></div>
        <div><strong class="num">${count("access")}</strong><span class="label">Access & setup</span></div>
        <div><strong class="num">${answered}</strong><span class="label">Answered by a release</span></div>
      </div>
      <div class="plan-legend label"><span><i class="sw fb-feature"></i>Feature</span><span><i class="sw fb-bug"></i>Bug</span><span><i class="sw fb-access"></i>Access & setup</span><span>${fmt(fb.since)} – ${fmt(fb.until)}</span></div>
      <div class="ws-list">${bars}</div>
      <div class="d-cols fb-cols">
        <div class="d-sec"><h3>Shipped</h3><div class="feed">${fb.shipped.map((x) => `<div><time datetime="${x.date}">${fmt(x.date)}</time><span>${esc(x.text)} <a class="src" href="${link(x.slack)}" target="_blank" rel="noopener">#apex ↗</a></span></div>`).join("")}</div></div>
        <div class="d-sec"><h3>Latest asks</h3><div class="feed">${asks.slice(0, 11).map((a) => `<div><time datetime="${a.date}">${fmt(a.date)}</time><span><span class="step-chip">${KIND[a.kind]}</span>${redact(a.text)} <span class="who-inline">${esc(a.who)}</span>${a.answered ? ` <span class="via">Shipped ${fmt(a.answered)}</span>` : ""} <a class="src" href="${link(a.slack)}" target="_blank" rel="noopener">↗</a></span></div>`).join("")}</div>
          <a class="src fb-all" href="${esc(ch.url)}" target="_blank" rel="noopener">All ${asks.length} asks in ${esc(ch.name)} ↗</a></div>
      </div>
    </div>`;
  }

  function openFile(id, from) {
    const op = OPS.find((o) => o.id === id);
    if (!op) return;
    if (!dossier.classList.contains("on")) returnFocus = from || document.activeElement;
    current = op;
    const phases = (op.phases || []).map((ph) => {
      const s = date(ph.start), e = date(ph.end);
      const past = e < AS_OF || op.status === "complete";
      const now = !past && s <= AS_OF;
      if (ph.ongoing) return `<div class="ph ongoing"><i></i><b>${esc(ph.name)}</b><span>Since ${fmt(ph.start)} · no end date</span></div>`;
      return `<div class="ph ${past ? "past" : now ? "now" : ""}" style="--p:${Math.round(clamp((AS_OF - s) / (e - s)) * 100)}%">
        <i></i><b>${esc(ph.name)}</b><span>${fmt(ph.start)} – ${fmt(ph.end)}</span></div>`;
    }).join("");
    const outcomes = (op.outcomes || []).map((o) => {
      const [k, lbl] = outcomeState(o, op);
      if (o.value !== undefined) {
        return `<div class="oc">
        <div class="oc-top"><b>${esc(o.label)}</b><span class="pill p-${k}">${lbl}</span></div>
        <div class="oc-nums"><strong>${esc(o.value)}</strong></div>
        ${o.detail ? `<p class="oc-detail">${redact(o.detail)}</p>` : ""}
      </div>`;
      }
      return `<div class="oc">
        <div class="oc-top"><b>${esc(o.label)}</b><span class="pill p-${k}">${lbl}</span></div>
        <div class="oc-nums"><strong>${fmtVal(o.current, o.unit)}</strong>
          <span>BASELINE ${fmtVal(o.baseline, o.unit)}<br>TARGET ${fmtVal(o.target, o.unit)}</span>
          <span>${o.better === "down" ? "↓ LOWER IS BETTER" : "↑ HIGHER IS BETTER"}<br>${Math.round(outcomePct(o) * 100)}% OF THE WAY</span></div>
        <div class="track"><i style="width:${outcomePct(o) * 100}%"></i><span class="tgt"></span></div>
      </div>`;
    }).join("");

    $("#dFile").textContent = `File ${op.id} · ${roman(idx(op))} of ${roman(OPS.length - 1)} · Clearance ${op.clearance}`;
    const now = nowLine(op), np = nowPhase(op);
    const met = metOutcomes(op), done = doneObjs(op), open = openObjs(op), ahead = milestones(op);
    const pastPhases = (op.phases || []).filter((ph) => phaseState(op, ph) === "done");
    const shipped = (op.feedback && op.feedback.shipped) || [];
    $("#dBody").innerHTML = `
      <div class="d-hero">
        <span class="label">Project file</span>
        <h2 class="op-name" id="dName">${esc(op.codename)}</h2>
        <div class="d-sub"><p class="op-title">${esc(op.title)}</p><span class="st st-${op.status}">${STATUS[op.status]}</span><span class="stamp">${esc(op.clearance)}</span></div>
        <div class="facts">
          <div class="fact"><span class="label">Lead</span><b>${esc(op.lead)}</b></div>
          <div class="fact"><span class="label">Team</span><b>${op.team.length} people · ${esc(op.pillar)}</b></div>
          <div class="fact"><span class="label">${op.ongoing ? "Status" : `Window${op.estimatedEnd ? " · end est." : ""}`}</span><b class="num">${windowText(op)}</b></div>
          <div class="fact"><span class="label">Scoreboard</span><b class="num">${winCount(op)} done · ${open.length} to go</b></div>
        </div>
      </div>

      <div class="d-sec vt"><h3><span class="d-step">01</span>Vision</h3><p class="vision">${redact(op.vision)}</p>
        ${op.shift ? `<div class="shift"><div><span class="label">From</span><p>${redact(op.shift.from)}</p></div><span class="shift-arrow" aria-hidden="true">→</span><div><span class="label">To</span><p>${redact(op.shift.to)}</p></div></div>` : ""}
        ${(op.targets || []).length ? `<div class="targets">${op.targets.map((t) => `<div class="target"><strong>${esc(t.value)}</strong><b>${esc(t.label)}</b>${t.detail ? `<span>${redact(t.detail)}</span>` : ""}</div>`).join("")}</div>` : ""}
        ${(op.promises || []).length ? `<div class="promises"><span class="label">What ${esc(op.codename.charAt(0) + op.codename.slice(1).toLowerCase())} changes</span><ol>${op.promises.map((pr, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><b>${esc(pr.title)}</b><p>${redact(pr.text)}</p></li>`).join("")}</ol></div>` : ""}
      </div>

      <div class="d-sec"><h3><span class="d-step">02</span>Now</h3>
        <div class="d-cols">
          <div class="now-phase-big">${now ? `
            <span class="label">Current phase</span>
            <b>${esc(now.name)}</b>
            <div class="bar ${now.pct === null ? "live" : ""}" aria-hidden="true"><i style="width:${now.pct === null ? 100 : Math.max(2, now.pct * 100)}%"></i></div>
            <span class="label">${esc(now.note)}${np && !np.ongoing ? ` · ${fmt(np.start)} – ${fmt(np.end)}` : ""}</span>` : `<span class="label">Between phases</span>`}
          </div>
          <div class="d-sec"><span class="label">Latest updates</span><div class="feed">${newest(op, 3).map((i) => `<div><time datetime="${i.date}">${fmt(i.date)}</time><span>${redact(i.text)}${srcLink(i)}</span></div>`).join("") || '<p class="label">No updates yet</p>'}</div></div>
        </div>
      </div>

      <div class="d-sec"><h3><span class="d-step">03</span>Done</h3>
        ${met.length ? `<div class="wins in-file">${met.map((o) => `<div class="win big"><strong>${esc(outVal(o) || o.label)}</strong><span class="win-t">${esc(o.label)}</span>${o.detail ? `<span class="win-who">${redact(o.detail)}</span>` : ""}</div>`).join("")}</div>` : ""}
        <ul class="done-list">${done.map((o) => `<li><span class="win-check" aria-hidden="true">✓</span><span>${redact(o.text)}</span>${o.owner ? `<span class="who">${esc(o.owner)}</span>` : ""}</li>`).join("")}
          ${pastPhases.map((ph) => `<li><span class="win-check" aria-hidden="true">✓</span><span>Phase complete: ${esc(ph.name)}</span><span class="who">${fmt(ph.start)} – ${fmt(ph.end)}</span></li>`).join("")}</ul>
        ${shipped.length ? `<div class="d-sec"><span class="label">Latest releases · ${shipped.length} shipped</span><div class="feed">${shipped.slice(0, 5).map((x) => `<div><time datetime="${x.date}">${fmt(x.date)}</time><span>${esc(x.text)}</span></div>`).join("")}</div></div>` : ""}
        ${!met.length && !done.length && !pastPhases.length ? '<p class="label">First wins are on the way</p>' : ""}
      </div>

      <div class="d-sec"><h3><span class="d-step">04</span>Next</h3>
        <div class="d-cols">
          <div class="d-sec"><span class="label">Coming up</span>${ahead.length ? `<ol class="next-list in-file">${ahead.map((m) => nextRow(m, false)).join("")}</ol>` : '<p class="label">No dated milestones ahead</p>'}</div>
          <div class="d-sec"><span class="label">On deck · ${open.length} moves</span><ul class="todo">${open.map((o) => `<li><span>${redact(o.text)}</span><span class="who">${esc(o.owner || "")}${o.due ? ` · due ${fmt(o.due)}` : ""}</span></li>`).join("")}</ul></div>
        </div>
      </div>

      <div class="d-sec"><h3>The team</h3><div class="roster">${op.team.map((n) => `<span class="person ${n === op.lead ? "lead" : ""}"><span class="av">${initials(n)}</span>${esc(n)}${n === op.lead ? " <em>Lead</em>" : ""}</span>`).join("")}</div></div>

      <div class="more-wrap">
      <details class="more">
        <summary><span>How we're running it</span><span class="label">The Algorithm, step by step</span></summary>
        ${algoHTML(op)}
      </details>
      <details class="more">
        <summary><span>The full record</span><span class="label">Mission, every outcome, risks${op.plan ? ", release plan" : ""}${op.feedback ? ", #apex feedback" : ""} and every update</span></summary>
        <div class="more-body">
          <div class="d-sec"><h3>The mission</h3><p>${redact(op.mission)}</p></div>
          <div class="d-sec"><h3>Phases</h3><div class="phases">${phases}</div></div>
          ${planHTML(op.plan)}
          <div class="d-cols">
            <div class="d-sec"><h3>Outcomes</h3><div class="outcomes">${outcomes || '<p class="label">No outcomes defined yet</p>'}</div></div>
            <div style="display:grid;gap:56px;align-content:start">
              <div class="d-sec"><h3>Risks</h3><div>${(op.risks || []).length ? op.risks.map((r) => `<div class="risk"><span class="sev sev-${r.sev}">${r.sev === "med" ? "Medium" : r.sev}</span><span>${redact(r.text)}</span></div>`).join("") : '<p class="label">No open risks</p>'}</div></div>
              <div class="d-sec"><h3>Every update</h3><div class="feed">${(op.intel || []).map((i) => `<div><time datetime="${i.date}">${fmt(i.date)}</time><span>${redact(i.text)}${srcLink(i)}</span></div>`).join("")}</div></div>
            </div>
          </div>
          ${feedbackHTML(op.feedback)}
        </div>
      </details>
      </div>`;

    snapTabs($(".algo.mine", dossier), stepCounts(op.objectives || []));
    $("#cursor").classList.remove("big");
    if (!dossier.classList.contains("on")) {
      dossier.classList.add("on");
      dossier.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      $("#dClose").focus({ preventScroll: true });
    }
    dossier.scrollTop = 0;
    scramble($("#dName"));
    history.replaceState(null, "", `#${op.id}`);
  }

  function closeFile() {
    if (!dossier.classList.contains("on")) return;
    dossier.classList.remove("on");
    dossier.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
    current = null;
    if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
  }
  const shift = (d) => { if (current) openFile(OPS[(idx(current) + d + OPS.length) % OPS.length].id); };
  $("#dClose").addEventListener("click", closeFile);
  $("#dPrev").addEventListener("click", () => shift(-1));
  $("#dNext").addEventListener("click", () => shift(1));
  dossier.addEventListener("click", (e) => {
    const r = e.target.closest(".redact");
    if (r) r.classList.toggle("show");
  });

  // ---------- search palette ----------
  const pal = $("#palScrim"), input = $("#palInput"), list = $("#palList");
  let sel = 0, results = [];
  const SECTIONS = [
    { kind: "Section", name: "Vision", sub: "Where each project is going", go: () => jump("#vision") },
    { kind: "Section", name: "Now", sub: "What's happening this week", go: () => jump("#now") },
    { kind: "Section", name: "Done", sub: "Every win so far", go: () => jump("#done") },
    { kind: "Section", name: "Next", sub: "What's coming up", go: () => jump("#next") }
  ];
  const jump = (h) => { closeFile(); document.querySelector(h).scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); };

  function search(q) {
    q = q.trim().toLowerCase();
    const ops = OPS.map((op) => ({
      kind: `${roman(idx(op))} · ${STATUS[op.status]}`, name: op.codename, sub: op.title,
      hay: [op.codename, op.title, op.pillar, op.lead, ...op.team, plain(op.vision), plain(op.mission), op.id,
        ...(op.objectives || []).map((o) => `${plain(o.text)} ${o.owner || ""}`),
        ...((op.feedback && op.feedback.asks) || []).map((a) => `${plain(a.text)} ${a.who}`)].join(" ").toLowerCase(),
      go: () => openFile(op.id)
    }));
    const secs = SECTIONS.map((s) => ({ ...s, hay: s.name.toLowerCase() }));
    // easter egg: only surfaces when someone searches for it
    if (q.length >= 4 && "summit integrated systems".includes(q)) secs.unshift({ kind: "You found it", name: "Summit Integrated Systems", sub: "Altitude clearance", hay: q, go: () => showSummit() });
    results = [...ops, ...secs].filter((r) => !q || q.split(/\s+/).every((w) => r.hay.includes(w))).slice(0, 12);
    sel = 0;
    draw();
  }
  function draw() {
    list.innerHTML = results.length
      ? results.map((r, i) => `<li role="option" data-i="${i}" aria-selected="${i === sel}"><div><b>${esc(r.name)}</b><span>${esc(r.sub)}</span></div><small class="label">${esc(r.kind)}</small></li>`).join("")
      : `<li class="label" aria-disabled="true">No matching files</li>`;
    const s = list.querySelector('[aria-selected="true"]');
    if (s) s.scrollIntoView({ block: "nearest" });
  }
  function openPal() { pal.hidden = false; input.value = ""; search(""); input.focus(); }
  function closePal() { pal.hidden = true; }
  function choose(i) { const r = results[i]; if (!r) return; closePal(); r.go(); }

  $("#openPalette").addEventListener("click", openPal);
  pal.addEventListener("click", (e) => {
    if (e.target === pal) return closePal();
    const li = e.target.closest("[data-i]");
    if (li) choose(+li.dataset.i);
  });
  input.addEventListener("input", () => search(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); draw(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); }
    else if (e.key === "Enter") { e.preventDefault(); choose(sel); }
  });

  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPal() : closePal(); return; }
    if (e.key === "Escape") { if (!pal.hidden) closePal(); else closeFile(); return; }
    if (typing) return;
    if (e.key === "/") { e.preventDefault(); openPal(); }
    else if (current && e.key === "ArrowRight") shift(1);
    else if (current && e.key === "ArrowLeft") shift(-1);
  });

  // ---------- cursor ----------
  (function cursor() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const c = $("#cursor"), lbl = $("#cursorLbl");
    document.body.classList.add("has-cursor");
    let x = -100, y = -100, cx = -100, cy = -100;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target.closest && e.target.closest("[data-cursor]");
      const text = t ? t.dataset.cursor : "";
      c.classList.toggle("big", !!text);
      if (text) lbl.textContent = text;
    });
    document.addEventListener("pointerleave", () => { x = y = -100; });
    const loop = () => {
      cx += (x - cx) * (reduced ? 1 : 0.2);
      cy += (y - cy) * (reduced ? 1 : 0.2);
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  })();

  // ---------- nav highlight ----------
  const links = [...document.querySelectorAll(".links a, .tabbar a")];
  const navObs = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["vision", "now", "done", "next"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) navObs.observe(el);
  });

  // ---------- easter eggs: Summit Integrated Systems ----------
  const egg = $("#summitEgg");
  let eggTimer = 0;
  function showSummit() {
    closeFile();
    if (!pal.hidden) closePal();
    egg.hidden = false;
    clearTimeout(eggTimer);
    eggTimer = setTimeout(hideSummit, 7000);
  }
  function hideSummit() { egg.hidden = true; clearTimeout(eggTimer); }
  egg.addEventListener("click", hideSummit);

  // the Konami code, or typing "summit" anywhere outside a text field
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let seq = [], typed = "";
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !egg.hidden) { hideSummit(); return; }
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
    if (seq.join() === KONAMI.join()) { seq = []; showSummit(); return; }
    if (e.key.length === 1) {
      typed = (typed + e.key.toLowerCase()).slice(-6);
      if (typed === "summit") { typed = ""; showSummit(); }
    }
  });

  // triple-click the peak to plant a flag on it
  (function peakFlag() {
    const hero = $(".hero"), flag = $("#peakFlag"), cv = $("#stage");
    if (!hero || !flag || !cv) return;
    hero.appendChild(flag);
    const PEAK = { x: 0.5, y: 0.178 }; // where the summit sits in the hero image
    const peakAt = () => {
      const h = hero.getBoundingClientRect(), c = cv.getBoundingClientRect();
      return { x: c.left - h.left + c.width * PEAK.x, y: c.top - h.top + c.height * PEAK.y, cx: c.left + c.width * PEAK.x, cy: c.top + c.height * PEAK.y };
    };
    const place = () => { const p = peakAt(); flag.style.left = `${p.x}px`; flag.style.top = `${p.y}px`; };
    let clicks = [];
    hero.addEventListener("click", (e) => {
      if (cv.hidden || !cv.width) return;
      const p = peakAt();
      if (Math.hypot(e.clientX - p.cx, e.clientY - p.cy) > Math.max(60, cv.getBoundingClientRect().width * 0.09)) return;
      const now = Date.now();
      clicks = [...clicks.filter((t) => now - t < 1200), now];
      if (clicks.length >= 3) { clicks = []; place(); flag.hidden = false; }
    });
    addEventListener("resize", () => { if (!flag.hidden) place(); });
  })();

  // the SBO mark spells itself out
  (function mark() {
    const sup = $("#unitShort");
    if (!sup) return;
    const short = sup.textContent;
    sup.title = "Summit Integrated Systems";
    sup.addEventListener("mouseenter", () => { sup.textContent = "SUMMIT INTEGRATED SYSTEMS"; sup.classList.add("open"); });
    sup.addEventListener("mouseleave", () => { sup.textContent = short; sup.classList.remove("open"); });
  })();

  // double-click the classification bar
  document.querySelectorAll(".classline").forEach((bar) => {
    const html = bar.innerHTML;
    bar.addEventListener("dblclick", () => {
      bar.innerHTML = "<i></i>SUMMIT INTEGRATED SYSTEMS // BLACK OPS // ALTITUDE CLEARANCE";
      setTimeout(() => { bar.innerHTML = html; }, 4000);
    });
  });

  // for anyone who opens the console
  try {
    console.log(
      "%c\n        /\\\n       /  \\    /\\\n      / /\\ \\  /  \\\n     / /  \\ \\/ /\\ \\\n    /_/    \\__/  \\_\\\n\n%cSUMMIT INTEGRATED SYSTEMS · BLACK OPS\n%cDelete steps. Simplify steps. Then accelerate and automate.\nTry the Konami code.",
      "color:#9c9c9c;font-family:monospace", "color:#fff;font-weight:bold;letter-spacing:2px", "color:#9c9c9c"
    );
  } catch (e) { /* console is optional */ }

  // sign-out only exists on the hosted site (blackops.summitintegrated.com)
  if (/summitintegrated\.com$|vercel\.app$/.test(location.hostname)) { const so = $("#signout"); if (so) so.hidden = false; }

  // ---------- boot ----------
  renderFilters();
  renderReel();
  const h = location.hash.slice(1);
  if (OPS.some((o) => o.id === h)) openFile(h);
})();
