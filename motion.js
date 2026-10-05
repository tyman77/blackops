/*
 * Scroll motion: the climb. Everything here is decoration on top of app.js, and the page works
 * the same without it. Nothing runs when the viewer has Reduce Motion turned on.
 *
 * - smooth wheel scrolling on desktop (Lenis); phones keep native scrolling
 * - altimeter on the right edge (a climb line under the header on phones)
 * - hero: push into the mountain, the light dims, BLACK and OPS split apart
 * - vision: on desktop the section pins and vertical scroll moves the project cards sideways
 * - section titles rise out of a mask; cards, wins and milestones rise in; counters count up
 * - next: a fuse runs down the milestones and lights each one as it passes
 * - the footer wordmark fills with light at the bottom
 */
(() => {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  root.classList.add("motion");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wide = matchMedia("(min-width: 641px)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const SUMMIT_FT = 14000;

  // ---------- smooth scrolling ----------
  let lenis = null;
  if (fine && window.Lenis) {
    lenis = new window.Lenis({ autoRaf: true, lerp: 0.085, anchors: true });
    // the file and the search sheet scroll on their own; hold the page still under them
    const dossier = $("#dossier"), pal = $("#palScrim");
    const hold = () => {
      const busy = (dossier && dossier.classList.contains("on")) || (pal && !pal.hidden);
      busy ? lenis.stop() : lenis.start();
    };
    const mo = new MutationObserver(hold);
    if (dossier) mo.observe(dossier, { attributes: true, attributeFilter: ["class"] });
    if (pal) mo.observe(pal, { attributes: true, attributeFilter: ["hidden"] });
  }

  // ---------- elements ----------
  const hero = $(".hero");
  const alti = $("#alti"), altiRead = $("#altiRead"), climb = $("#climb");
  const ops = $("#vision"), pin = $(".ops-pin"), reel = $("#reel");
  const nextList = $("#nextList");
  const foot = $(".big-foot");

  // ---------- section titles: words rise out of a mask ----------
  $$(".sec-head h2").forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", words.join(" "));
    h.innerHTML = words.map((w, i) => `<span class="wm" aria-hidden="true"><span style="transition-delay:${i * 90}ms">${esc(w)}</span></span>`).join(" ");
    h.classList.add("rise");
  });

  // ---------- reveal on enter ----------
  const reveal = new IntersectionObserver((ents) => {
    let n = 0;
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      reveal.unobserve(el);
      if (el.classList.contains("rise")) { el.classList.add("in"); return; }
      $$("[data-count]", el).forEach(countUp);
      el.style.transitionDelay = `${Math.min(n++, 6) * 70}ms`;
      el.classList.add("in");
      // hand the element back to its own hover transitions once it has landed
      setTimeout(() => { el.classList.remove("rv", "in"); el.style.transitionDelay = ""; }, 1700);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  function watch(sel) {
    $$(sel).forEach((el) => { if (!el.classList.contains("rv")) { el.classList.add("rv"); reveal.observe(el); } });
  }
  $$(".sec-head h2.rise").forEach((h) => reveal.observe(h));
  watch(".reel .op, .now-card, .done-stat, .win, .next-row");
  if (reel) new MutationObserver(() => { watch(".reel .op"); measure(); }).observe(reel, { childList: true });
  const wins = $("#wins");
  if (wins) new MutationObserver(() => watch("#wins .win")).observe(wins, { childList: true });
  // hero numbers count up once the title has landed
  setTimeout(() => $$(".kpis [data-count]").forEach(countUp), 900);

  // ---------- counters ----------
  function countUp(el) {
    const end = parseInt(el.dataset.count || el.textContent, 10);
    if (!Number.isFinite(end) || end === 0) return;
    const t0 = performance.now();
    const tick = (t) => {
      const k = clamp((t - t0) / 900);
      el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = "0";
    requestAnimationFrame(tick);
  }

  // ---------- layout-dependent setup ----------
  let travel = 0, opsTop = 0, maxY = 1, heroH = 1;
  function measure() {
    heroH = hero ? hero.offsetHeight : 1;

    // pin the files on screens tall enough to show a whole card
    if (ops && pin && reel) {
      root.classList.add("pin-ops");
      const fits = wide.matches && pin.scrollHeight <= innerHeight;
      if (!fits) root.classList.remove("pin-ops");
      travel = fits ? Math.max(0, reel.scrollWidth - reel.clientWidth) : 0;
      const h = fits ? `${innerHeight + travel}px` : "";
      if (ops.style.height !== h) ops.style.height = h;
      opsTop = ops.getBoundingClientRect().top + scrollY;
    }

    maxY = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (lenis) lenis.resize();
    frame();
  }

  // ---------- per-frame ----------
  let lastY = scrollY, lastT = performance.now(), vel = 0, queued = false, lastH = -1;
  function frame() {
    queued = false;
    const y = scrollY, vh = innerHeight, now = performance.now();
    vel = vel * 0.8 + ((y - lastY) / Math.max(1, now - lastT)) * 0.2;
    lastY = y; lastT = now;

    // altimeter
    const p = clamp(y / maxY);
    if (alti) {
      alti.style.setProperty("--p", p.toFixed(4));
      alti.classList.toggle("top", p > 0.985);
      altiRead.textContent = p > 0.985 ? `${SUMMIT_FT.toLocaleString("en-US")} ft` : `${(Math.round((p * SUMMIT_FT) / 10) * 10).toLocaleString("en-US")} ft`;
    }
    if (climb) climb.style.transform = `scaleX(${p.toFixed(4)})`;

    // hero
    const h = clamp(y / heroH);
    if (hero && h !== lastH) { hero.style.setProperty("--h", h.toFixed(4)); lastH = h; }

    // pinned files: vertical scroll drives the reel; cards lean with the speed
    if (travel > 0 && root.classList.contains("pin-ops")) {
      const t = clamp((y - opsTop) / travel);
      reel.scrollLeft = t * travel;
      reel.style.setProperty("--skew", `${clamp(vel * -2.2, -6, 6).toFixed(2)}deg`);
    }

    // the fuse runs down the milestones as you read them
    if (nextList) {
      const r = nextList.getBoundingClientRect();
      const reach = vh * 0.62 - r.top;
      nextList.style.setProperty("--fuse", clamp(reach / r.height).toFixed(4));
      $$(".next-row", nextList).forEach((row) => row.classList.toggle("lit", row.offsetTop + row.offsetHeight / 2 <= reach));
    }

    // footer wordmark fills as you reach the top
    if (foot) {
      const r = foot.getBoundingClientRect();
      foot.style.setProperty("--fill", `${(clamp((vh - r.top) / (r.height + vh * 0.3)) * 100).toFixed(2)}%`);
    }

    // keep easing the lean back to zero after the scroll stops
    if (Math.abs(vel) > 0.01) queue();
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }

  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", measure);
  new ResizeObserver(() => measure()).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener("load", measure);
  measure();
})();
