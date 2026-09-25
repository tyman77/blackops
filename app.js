(() => {
  const D = window.BLACKOPS;
  const OPS = D.OPERATIONS;
  const AS_OF = new Date(D.asOf + "T12:00:00");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);

  const STATUS = {
    recon: "Recon",
    active: "Active",
    extraction: "Extraction",
    live: "Live",
    complete: "Complete",
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
    if (i.slack && CH) return ` <a class="src" href="${esc(`${CH.url}/${i.slack}`)}" target="_blank" rel="noopener">Slack ↗</a>`;
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

  const progress = (op) => {
    if (op.status === "complete") return 1;
    const o = op.objectives || [];
    return o.length ? o.filter((x) => x.done).length / o.length : 0;
  };
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

  // ---------- header, briefing ----------
  $("#unitShort").textContent = D.unit.split(/\s+/).map((w) => w[0]).join("").toUpperCase();
  $("#mandate").textContent = D.mandate;
  $("#asof").innerHTML = `${esc(D.unit.toUpperCase())}<br>BRIEFING AS OF ${fmt(D.asOf)}<br>${OPS.length} FILES ON RECORD`;

  (function kpis() {
    const live = OPS.filter((o) => ["recon", "active", "extraction"].includes(o.status)).length;
    const objs = OPS.flatMap((o) => o.objectives || []);
    const outs = OPS.flatMap((op) => (op.outcomes || []).map((o) => outcomeState(o, op)[0]));
    const good = outs.filter((s) => s === "met").length;
    const next = OPS.flatMap((op) => (op.phases || []).map((p) => ({ op, p })))
      .filter(({ p }) => date(p.start) > AS_OF)
      .sort((a, b) => date(a.p.start) - date(b.p.start))[0];
    $("#kpis").innerHTML = `
      <div class="kpi"><span class="v num">${live}<small> / ${OPS.length}</small></span><span class="label">Live operations</span></div>
      <div class="kpi"><span class="v num">${objs.filter((o) => o.done).length}<small> / ${objs.length}</small></span><span class="label">Objectives cleared</span></div>
      <div class="kpi"><span class="v num">${good}<small> / ${outs.length}</small></span><span class="label">Outcomes delivered</span></div>
      <div class="kpi"><span class="v sm">${next ? `${esc(next.op.codename)}` : "None scheduled"}</span><span class="label">${next ? `Next: ${esc(next.p.name)} · ${fmt(next.p.start)}` : "Next milestone"}</span></div>`;
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

  // ---------- the algorithm ----------
  (function algorithm() {
    const el = $("#algo");
    if (!el || !ALGO.steps.length) { const sec = $("#algorithm"); if (sec) sec.hidden = true; return; }
    $("#algoRule").textContent = ALGO.rule || "";
    $("#algoSrc").textContent = ALGO.source ? `Framework: ${ALGO.source}` : "";
    const moves = OPS.flatMap((op) => (op.objectives || []).map((o) => ({ op, ...o })));
    el.innerHTML = ALGO.steps.map((st, n) => {
      const list = moves.filter((m) => m.step === st.key);
      const done = list.filter((m) => m.done).length;
      // open moves first, so the column shows what is left to do at this step
      const show = [...list.filter((m) => !m.done), ...list.filter((m) => m.done)];
      const top = show.slice(0, 4);
      return `<div class="step">
        <div class="step-no"><span>${String(n + 1).padStart(2, "0")}</span>${n < ALGO.steps.length - 1 ? '<span class="arrow" aria-hidden="true">→</span>' : ""}</div>
        <h3>${esc(st.name)}</h3>
        <p>${esc(st.line)}</p>
        <div class="step-count"><strong>${done}</strong><span>of ${list.length} moves<br>done</span></div>
        <div class="step-bar" aria-hidden="true">${list.map((m, i) => `<i class="${i < done ? "on" : ""}"></i>`).join("")}</div>
        <ul>${top.map((m) => `<li class="${m.done ? "done" : ""}"><button type="button" data-op="${m.op.id}" data-cursor="Open file"><b>${esc(m.op.codename)}</b><span>${redact(m.text)}</span></button></li>`).join("")}</ul>
        ${show.length > top.length ? `<span class="more">+${show.length - top.length} more in the files</span>` : ""}
      </div>`;
    }).join("");
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-op]"); if (b) openFile(b.dataset.op, b); });
  })();

  function algoStrip(op) {
    if (!ALGO.steps.length) return "";
    return `<div class="algo-strip" aria-label="Algorithm steps covered">${ALGO.steps.map((st) => {
      const list = (op.objectives || []).filter((o) => o.step === st.key);
      const cls = !list.length ? "" : list.every((o) => o.done) ? "done" : "open";
      const d = list.filter((o) => o.done).length;
      return `<span class="${cls}" title="${esc(st.name)}: ${d} of ${list.length} done">${SHORT[st.key] || st.key}</span>`;
    }).join("")}</div>`;
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
    reel.scrollTo({ left: 0 });
  });

  function ticks(p) {
    const on = Math.round(p * 20);
    return Array.from({ length: 20 }, (_, i) => `<i class="${i < on ? "on" : ""}"></i>`).join("");
  }

  function renderReel() {
    const list = OPS.filter((o) => filter === "all" || o.status === filter);
    if (!list.length) { reel.innerHTML = `<div class="empty">No operations with this status.</div>`; updateScrub(); return; }
    reel.innerHTML = list.map((op) => {
      const p = progress(op);
      const objs = op.objectives || [];
      return `
      <button class="op" type="button" data-op="${op.id}" data-cursor="Open file">
        <div class="op-top"><span class="op-idx">${roman(idx(op))}.</span><span class="st st-${op.status}">${STATUS[op.status]}</span></div>
        <div class="op-mid">
          <h3 class="op-name" data-scramble>${esc(op.codename)}</h3>
          <p class="op-title">${esc(op.title)}</p>
          <p class="op-vision">${esc(op.vision)}</p>
        </div>
        <div class="op-foot">
          <div class="prog">
            <div class="prog-row"><span class="label">Objectives ${objs.filter((o) => o.done).length}/${objs.length}</span><span class="label num">${Math.round(p * 100)}%</span></div>
            <div class="ticks" aria-hidden="true">${ticks(p)}</div>
          </div>
          ${algoStrip(op)}
          <div class="op-meta"><span class="label">Lead <b>${esc(op.lead)}</b> · ${esc(op.pillar)}</span><span class="open-cue">File ${esc(op.id)}</span></div>
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
  reel.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.shiftKey) return;
    const max = reel.scrollWidth - reel.clientWidth;
    if (max <= 0) return;
    if ((reel.scrollLeft <= 0 && e.deltaY < 0) || (reel.scrollLeft >= max - 1 && e.deltaY > 0)) return;
    e.preventDefault();
    reel.scrollLeft += e.deltaY;
  }, { passive: false });
  reel.addEventListener("scroll", () => requestAnimationFrame(updateScrub));
  addEventListener("resize", updateScrub);

  const step = () => { const c = $(".op", reel); return c ? c.getBoundingClientRect().width + 20 : 400; };
  $("#prev").addEventListener("click", () => reel.scrollBy({ left: -step(), behavior: reduced ? "auto" : "smooth" }));
  $("#next").addEventListener("click", () => reel.scrollBy({ left: step(), behavior: reduced ? "auto" : "smooth" }));

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

  // ---------- radar ----------
  (function radar() {
    const svg = $("#scope");
    const S = 600, P = 64;
    const x = (e) => P + ((e - 0.5) / 10) * (S - 2 * P);
    const y = (i) => S - P - ((i - 0.5) / 10) * (S - 2 * P);
    const G = "rgba(255,255,255,.09)", T = "#9C9C9C";
    let out = "";
    [70, 140, 210, 280].forEach((r) => (out += `<circle cx="300" cy="300" r="${r}" fill="none" stroke="${G}"/>`));
    out += `<line x1="${P}" y1="300" x2="${S - P}" y2="300" stroke="rgba(255,255,255,.18)" stroke-dasharray="2 5"/>`;
    out += `<line x1="300" y1="${P}" x2="300" y2="${S - P}" stroke="rgba(255,255,255,.18)" stroke-dasharray="2 5"/>`;
    for (let v = 1; v <= 10; v++) {
      out += `<line x1="${x(v)}" y1="${S - P}" x2="${x(v)}" y2="${S - P + 6}" stroke="${T}"/>`;
      out += `<line x1="${P - 6}" y1="${y(v)}" x2="${P}" y2="${y(v)}" stroke="${T}"/>`;
    }
    out += `<line x1="${P}" y1="${S - P}" x2="${S - P}" y2="${S - P}" stroke="${T}"/><line x1="${P}" y1="${P}" x2="${P}" y2="${S - P}" stroke="${T}"/>`;
    out += `<text x="${S - P}" y="${S - P + 24}" text-anchor="end" font-size="11" letter-spacing="2" fill="${T}">EFFORT →</text>`;
    out += `<text x="${P}" y="${S - P + 24}" font-size="11" letter-spacing="2" fill="${T}">1</text>`;
    out += `<text x="${P - 16}" y="${P}" font-size="11" letter-spacing="2" fill="${T}" transform="rotate(-90 ${P - 16} ${P})" text-anchor="end">IMPACT →</text>`;
    const q = [["QUICK STRIKES", P + 10, P + 18, "start"], ["MAJOR CAMPAIGNS", S - P - 10, P + 18, "end"], ["SIDE MISSIONS", P + 10, S - P - 12, "start"], ["RETHINK", S - P - 10, S - P - 12, "end"]];
    q.forEach(([t, qx, qy, a]) => (out += `<text x="${qx}" y="${qy}" text-anchor="${a}" font-size="10" letter-spacing="2.5" fill="rgba(255,255,255,.35)">${t}</text>`));

    // place each label beside its blip, trying spots until it clears the others
    const boxes = OPS.map((op) => ({ x: x(op.effort) - 9, y: y(op.impact) - 9, w: 18, h: 18 }));
    const hit = (b) => boxes.some((o) => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
    OPS.forEach((op) => {
      const cx = x(op.effort), cy = y(op.impact);
      const w = op.codename.length * 8.6, h = 14;
      const spots = [
        [cx + 14, cy + 4, "start", { x: cx + 12, y: cy - 8, w, h }],
        [cx - 14, cy + 4, "end", { x: cx - 12 - w, y: cy - 8, w, h }],
        [cx, cy - 16, "middle", { x: cx - w / 2, y: cy - 28, w, h }],
        [cx, cy + 26, "middle", { x: cx - w / 2, y: cy + 14, w, h }],
        [cx, cy - 34, "middle", { x: cx - w / 2, y: cy - 46, w, h }],
        [cx, cy + 44, "middle", { x: cx - w / 2, y: cy + 32, w, h }]
      ];
      const [lx, ly, anchor, box] = spots.find((s) => !hit(s[3]) && s[3].x > P - 4 && s[3].x + s[3].w < S - 4) || spots[0];
      boxes.push(box);
      const hollow = op.status === "recon" || op.status === "hold";
      const fill = op.status === "complete" ? "#9C9C9C" : hollow ? "#000000" : "#FFFFFF";
      const dash = op.status === "hold" ? ' stroke-dasharray="2 2"' : "";
      out += `<g class="blip" tabindex="0" role="button" data-op="${op.id}" data-cursor="Open file" aria-label="${esc(op.codename)}: impact ${op.impact}, effort ${op.effort}">
        ${op.status === "active" ? `<circle class="ring" cx="${cx}" cy="${cy}" r="7" fill="none" stroke="#FFFFFF"/>` : ""}
        ${op.status === "live" ? `<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="#FFFFFF" stroke-width="1"/>` : ""}
        <circle class="dot" cx="${cx}" cy="${cy}" r="7" fill="${fill}" stroke="#FFFFFF" stroke-width="1.5"${dash}/>
        <text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="12" letter-spacing="1.5" fill="#FFFFFF">${esc(op.codename)}</text>
      </g>`;
    });
    svg.innerHTML = out;
    const go = (e) => { const g = e.target.closest("[data-op]"); if (g) openFile(g.dataset.op, g); };
    svg.addEventListener("click", go);
    svg.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(e); } });

    const quad = (hiI, hiE) => OPS.filter((o) => (o.impact > 5.5) === hiI && (o.effort > 5.5) === hiE);
    const Q = [
      ["Quick strikes", "High impact, low effort. Protect these and ship them fast.", quad(true, false)],
      ["Major campaigns", "High impact, high effort. Staff them properly and phase them.", quad(true, true)],
      ["Side missions", "Low effort, modest impact. Fill gaps between big pushes.", quad(false, false)],
      ["Rethink", "High effort for modest impact. Rescope or retire.", quad(false, true)]
    ];
    $("#quads").innerHTML = Q.map(([t, d, list]) => `
      <div class="quad"><h3>${t}</h3><p>${d}</p>
        <ul>${list.length ? list.map((o) => `<li><button type="button" data-op="${o.id}" data-cursor="Open">${roman(idx(o))}. ${esc(o.codename)}</button></li>`).join("") : `<li class="none">NO FILES</li>`}</ul>
      </div>`).join("");
    $("#quads").addEventListener("click", go);
  })();

  // ---------- timeline ----------
  (function timeline() {
    const starts = OPS.map((o) => date(o.start)), ends = OPS.map((o) => date(o.end));
    const a = new Date(Math.min(...starts)); a.setDate(1);
    const b = new Date(Math.max(...ends)); b.setMonth(b.getMonth() + 1, 1);
    const months = [];
    for (const d = new Date(a); d < b; d.setMonth(d.getMonth() + 1)) months.push(new Date(d));
    const span = b - a;
    const pos = (d) => clamp((d - a) / span) * 100;
    const cols = `repeat(${months.length}, 1fr)`;

    let html = `<div class="tl-head"><div class="tl-label label">Operation</div><div class="tl-months" style="grid-template-columns:${cols}">${months.map((m) => `<span>${MONTHS[m.getMonth()]} ${String(m.getFullYear()).slice(2)}</span>`).join("")}</div></div>`;
    OPS.forEach((op) => {
      const segs = (op.phases || []).map((p) => {
        const s = date(p.start), e = date(p.end);
        const l = pos(s), w = Math.max(pos(e) - l, 0.6);
        let cls = "", style = `left:${l}%;width:calc(${w}% - 2px)`;
        if (p.ongoing) { cls = "ongoing"; style = `left:${l}%;right:0`; }
        else if (e < AS_OF || op.status === "complete") cls = "done";
        else if (s <= AS_OF) { cls = "now"; style += `;--p:${Math.round(clamp((AS_OF - s) / (e - s)) * 100)}%`; }
        return `<div class="seg ${cls}" style="${style}" title="${esc(p.name)}: ${p.ongoing ? `since ${fmt(p.start)}, no end date` : `${fmt(p.start)} to ${fmt(p.end)}`}"><span class="seg-t">${esc(p.name)}${p.ongoing ? " →" : ""}</span></div>`;
      }).join("");
      html += `<button class="tl-row" type="button" data-op="${op.id}" data-cursor="Open file">
        <span class="tl-label"><span class="c">${esc(op.codename)}</span><span class="t">${esc(op.title)}</span></span>
        <span class="tl-track"><span class="tl-grid" style="grid-template-columns:${cols}">${months.map(() => "<i></i>").join("")}</span>${segs}</span>
      </button>`;
    });
    html += `<div class="today" style="left:calc(200px + (100% - 200px) * ${pos(AS_OF) / 100})"><span>TODAY ${fmt(D.asOf)}</span></div>`;
    const tl = $("#tl");
    tl.innerHTML = html;
    tl.addEventListener("click", (e) => { const r = e.target.closest("[data-op]"); if (r) openFile(r.dataset.op, r); });
    // start scrolled so today sits near the left third
    const sc = tl.parentElement;
    requestAnimationFrame(() => { sc.scrollLeft = Math.max(0, (tl.scrollWidth - 200) * (pos(AS_OF) / 100) - sc.clientWidth * 0.35); });
  })();

  // ---------- intel log ----------
  (function briefings() {
    const el = $("#briefings");
    const list = Object.values(MEET).sort((a, b) => date(b.date) - date(a.date));
    if (!el || !list.length) { if (el) el.hidden = true; return; }
    const latest = OPS.flatMap((op) => (op.intel || []).filter((i) => i.slack)).sort((a, b) => date(b.date) - date(a.date))[0];
    const chan = CH ? `
      <a class="brief-card chan" href="${esc(CH.url)}" target="_blank" rel="noopener" data-cursor="Open Slack">
        <span class="label num">Slack${latest ? ` · last post ${fmt(latest.date)}` : ""}</span>
        <b>${esc(CH.name)}</b>
        <span class="brief-sum">${esc(CH.summary)}</span>
        <span class="open-cue">Open channel</span>
      </a>` : "";
    el.innerHTML = chan + list.map((m) => `
      <a class="brief-card" href="${esc(m.url)}" target="_blank" rel="noopener" data-cursor="Open notes">
        <span class="label num">${fmt(m.date)} · ${m.attendees.length} attendees</span>
        <b>${esc(m.title)}</b>
        <span class="brief-sum">${esc(m.summary)}</span>
        <span class="brief-who">${m.attendees.map((n) => `<span class="av" title="${esc(n)}">${initials(n)}</span>`).join("")}</span>
        <span class="open-cue">Meeting notes</span>
      </a>`).join("");
  })();

  (function log() {
    const rows = OPS.flatMap((op) => (op.intel || []).map((i) => ({ op, ...i })))
      .sort((a, b) => date(b.date) - date(a.date)).slice(0, 10);
    const el = $("#log");
    el.innerHTML = rows.map((r) => `
      <button class="log-row" type="button" data-op="${r.op.id}" data-cursor="Open file">
        <span class="label num">${fmt(r.date)}</span><span class="c">${esc(r.op.codename)}</span><span>${redact(r.text)}${r.slack ? ' <span class="via">Slack</span>' : r.doc ? ` <span class="via">${esc(r.doc)}</span>` : ""}</span><span class="arrow">→</span>
      </button>`).join("");
    el.addEventListener("click", (e) => { const r = e.target.closest("[data-op]"); if (r) openFile(r.dataset.op, r); });
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

  function openFile(id, from) {
    const op = OPS.find((o) => o.id === id);
    if (!op) return;
    if (!dossier.classList.contains("on")) returnFocus = from || document.activeElement;
    current = op;
    const p = progress(op);
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
    $("#dBody").innerHTML = `
      <div class="d-hero">
        <span class="label">Operation</span>
        <h2 class="op-name" id="dName">${esc(op.codename)}</h2>
        <div class="d-sub"><p class="op-title">${esc(op.title)}</p><span class="st st-${op.status}">${STATUS[op.status]}</span><span class="stamp">${esc(op.clearance)}</span></div>
        <div class="facts">
          <div class="fact"><span class="label">Lead</span><b>${esc(op.lead)}</b></div>
          <div class="fact"><span class="label">Pillar</span><b>${esc(op.pillar)}</b></div>
          <div class="fact"><span class="label">${op.ongoing ? "Status" : `Window${op.estimatedEnd ? " · end est." : ""}`}</span><b class="num">${windowText(op)}</b></div>
          <div class="fact"><span class="label">Objectives</span><b class="num">${Math.round(p * 100)}% cleared</b></div>
        </div>
      </div>
      <div class="d-sec"><h3>Vision</h3><p class="vision">${redact(op.vision)}</p></div>
      ${planHTML(op.plan)}
      <div class="d-cols">
        <div style="display:grid;gap:56px;align-content:start">
          <div class="d-sec"><h3>The mission</h3><p>${redact(op.mission)}</p></div>
          <div class="d-sec"><h3>Objectives</h3><ul class="checks">${(op.objectives || []).map((o) => `<li class="${o.done ? "done" : ""}"><span class="box" aria-hidden="true"></span><span>${stepChip(o.step)}${redact(o.text)}</span>${o.owner || o.due ? `<span class="who">${esc(o.owner || "")}${o.due ? ` · due ${fmt(o.due)}` : ""}</span>` : ""}</li>`).join("")}</ul></div>
          <div class="d-sec"><h3>Phases</h3><div class="phases">${phases}</div></div>
          <div class="d-sec"><h3>Team</h3><div class="roster">${op.team.map((n) => `<span class="person ${n === op.lead ? "lead" : ""}"><span class="av">${initials(n)}</span>${esc(n)}${n === op.lead ? " <em>Lead</em>" : ""}</span>`).join("")}</div></div>
        </div>
        <div style="display:grid;gap:56px;align-content:start">
          <div class="d-sec"><h3>Outcomes</h3><div class="outcomes">${outcomes || '<p class="label">No outcomes defined yet</p>'}</div></div>
          <div class="d-sec"><h3>Risks</h3><div>${(op.risks || []).length ? op.risks.map((r) => `<div class="risk"><span class="sev sev-${r.sev}">${r.sev === "med" ? "Medium" : r.sev}</span><span>${redact(r.text)}</span></div>`).join("") : '<p class="label">No open risks</p>'}</div></div>
          <div class="d-sec"><h3>Intel log</h3><div class="feed">${(op.intel || []).map((i) => `<div><time datetime="${i.date}">${fmt(i.date)}</time><span>${redact(i.text)}${srcLink(i)}</span></div>`).join("")}</div></div>
        </div>
      </div>`;

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
    { kind: "Section", name: "The Algorithm", sub: "Question, delete, simplify, accelerate, automate", go: () => jump("#algorithm") },
    { kind: "Section", name: "Operations", sub: "Horizontal index of every file", go: () => jump("#operations") },
    { kind: "Section", name: "Radar", sub: "Impact vs effort", go: () => jump("#radar") },
    { kind: "Section", name: "Timeline", sub: "Phases and today", go: () => jump("#timeline") },
    { kind: "Section", name: "Intel", sub: "Latest field reports", go: () => jump("#intel") }
  ];
  const jump = (h) => { closeFile(); document.querySelector(h).scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); };

  function search(q) {
    q = q.trim().toLowerCase();
    const ops = OPS.map((op) => ({
      kind: `${roman(idx(op))} · ${STATUS[op.status]}`, name: op.codename, sub: op.title,
      hay: [op.codename, op.title, op.pillar, op.lead, ...op.team, plain(op.vision), plain(op.mission), op.id,
        ...(op.objectives || []).map((o) => `${plain(o.text)} ${o.owner || ""}`)].join(" ").toLowerCase(),
      go: () => openFile(op.id)
    }));
    const secs = SECTIONS.map((s) => ({ ...s, hay: s.name.toLowerCase() }));
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
  const links = [...document.querySelectorAll(".links a")];
  const navObs = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["algorithm", "operations", "radar", "timeline", "intel"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) navObs.observe(el);
  });

  // ---------- boot ----------
  renderFilters();
  renderReel();
  const h = location.hash.slice(1);
  if (OPS.some((o) => o.id === h)) openFile(h);
})();
