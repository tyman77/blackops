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
  const fmtMonth = (s) => { const d = date(s); return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; };
  const date = (s) => new Date(s + "T12:00:00");
  const fmt = (s) => { const d = date(s); return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; };
  const initials = (n) => n.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const roman = (i) => ROMAN[i] || String(i + 1);
  const idx = (op) => OPS.indexOf(op);

  const progress = (op) => {
    if (op.status === "complete") return 1;
    const o = op.objectives || [];
    return o.length ? o.filter((x) => x.done).length / o.length : 0;
  };
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
    const canvas = $("#stage");
    const fallback = $("#fallback");
    if (!window.THREE) { canvas.hidden = true; return; }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch (e) { canvas.hidden = true; return; }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 9, 20);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    const obj = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.34, 260, 40, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.92, roughness: 0.26 })
    );
    obj.castShadow = true;
    obj.position.y = 1.55;
    scene.add(obj);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.95, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const light = new THREE.SpotLight(0xffffff, 3.2, 30, 0.42, 0.85, 1.4);
    light.position.set(1.5, 9, 2.5);
    light.target = obj;
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.bias = -0.0004;
    light.shadow.radius = 6;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.035));

    const size = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const narrow = w < 700;
      camera.position.set(0, narrow ? 3.2 : 2.6, narrow ? 13 : 10);
      camera.lookAt(0, narrow ? 2.1 : 1.3, 0);
      camera.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size);

    // drag to spin, with inertia; the light drifts toward the pointer
    let vx = reduced ? 0 : 0.004, vy = 0, drag = null, px = 0.5, lx = 1.5;
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width;
      if (!drag) return;
      vx = (e.clientX - drag.x) * 0.0022;
      vy = (e.clientY - drag.y) * 0.0016;
      drag = { x: e.clientX, y: e.clientY };
      if (reduced) frame();
    });
    const end = () => { drag = null; };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    let visible = true, t = 0;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);

    function frame() {
      obj.rotation.y += vx;
      obj.rotation.x += vy;
      if (!drag) {
        vx += ((reduced ? 0 : 0.004) - vx) * 0.03;
        vy *= 0.94;
      }
      if (!reduced) {
        t += 0.01;
        obj.position.y = 1.55 + Math.sin(t) * 0.12;
      }
      lx += ((px - 0.5) * 7 - lx) * 0.04;
      light.position.x = lx;
      renderer.render(scene, camera);
    }
    function loop() {
      if (visible && !document.hidden) frame();
      requestAnimationFrame(loop);
    }
    frame();
    fallback.hidden = true;
    if (!reduced) requestAnimationFrame(loop);
  })();

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
        if (e < AS_OF || op.status === "complete") cls = "done";
        else if (s <= AS_OF) { cls = "now"; style += `;--p:${Math.round(clamp((AS_OF - s) / (e - s)) * 100)}%`; }
        return `<div class="seg ${cls}" style="${style}" title="${esc(p.name)}: ${fmt(p.start)} to ${fmt(p.end)}">${esc(p.name)}</div>`;
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
    el.innerHTML = list.map((m) => `
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
        <span class="label num">${fmt(r.date)}</span><span class="c">${esc(r.op.codename)}</span><span>${redact(r.text)}</span><span class="arrow">→</span>
      </button>`).join("");
    el.addEventListener("click", (e) => { const r = e.target.closest("[data-op]"); if (r) openFile(r.dataset.op, r); });
  })();

  // ---------- dossier ----------
  const dossier = $("#dossier");
  let current = null, returnFocus = null;

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
          <div class="fact"><span class="label">Window${op.estimatedEnd ? " · end est." : ""}</span><b class="num">${fmt(op.start)} – ${op.estimatedEnd ? fmtMonth(op.end) : fmt(op.end)}</b></div>
          <div class="fact"><span class="label">Objectives</span><b class="num">${Math.round(p * 100)}% cleared</b></div>
        </div>
      </div>
      <div class="d-sec"><h3>Vision</h3><p class="vision">${redact(op.vision)}</p></div>
      <div class="d-cols">
        <div style="display:grid;gap:56px;align-content:start">
          <div class="d-sec"><h3>The mission</h3><p>${redact(op.mission)}</p></div>
          <div class="d-sec"><h3>Objectives</h3><ul class="checks">${(op.objectives || []).map((o) => `<li class="${o.done ? "done" : ""}"><span class="box" aria-hidden="true"></span><span>${redact(o.text)}</span>${o.owner || o.due ? `<span class="who">${esc(o.owner || "")}${o.due ? ` · due ${fmt(o.due)}` : ""}</span>` : ""}</li>`).join("")}</ul></div>
          <div class="d-sec"><h3>Phases</h3><div class="phases">${phases}</div></div>
          <div class="d-sec"><h3>Team</h3><div class="roster">${op.team.map((n) => `<span class="person ${n === op.lead ? "lead" : ""}"><span class="av">${initials(n)}</span>${esc(n)}${n === op.lead ? " <em>Lead</em>" : ""}</span>`).join("")}</div></div>
        </div>
        <div style="display:grid;gap:56px;align-content:start">
          <div class="d-sec"><h3>Outcomes</h3><div class="outcomes">${outcomes || '<p class="label">No outcomes defined yet</p>'}</div></div>
          <div class="d-sec"><h3>Risks</h3><div>${(op.risks || []).length ? op.risks.map((r) => `<div class="risk"><span class="sev sev-${r.sev}">${r.sev === "med" ? "Medium" : r.sev}</span><span>${redact(r.text)}</span></div>`).join("") : '<p class="label">No open risks</p>'}</div></div>
          <div class="d-sec"><h3>Intel log</h3><div class="feed">${(op.intel || []).map((i) => `<div><time datetime="${i.date}">${fmt(i.date)}</time><span>${redact(i.text)}${i.src && MEET[i.src] ? ` <a class="src" href="${esc(MEET[i.src].url)}" target="_blank" rel="noopener">Meeting notes ↗</a>` : ""}</span></div>`).join("")}</div></div>
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
      const t = e.target.closest && e.target.closest("[data-cursor], canvas");
      const text = t ? (t.tagName === "CANVAS" ? "Drag" : t.dataset.cursor) : "";
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
  ["operations", "radar", "timeline", "intel"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) navObs.observe(el);
  });

  // ---------- boot ----------
  renderFilters();
  renderReel();
  const h = location.hash.slice(1);
  if (OPS.some((o) => o.id === h)) openFile(h);
})();
