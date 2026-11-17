/* Jira Flight School — shared behaviour (no dependencies) */
(function () {
  "use strict";

  const DEFAULT_SITE = "https://varoonsahgaltraining.atlassian.net";
  const store = {
    get(k, d) { try { const v = localStorage.getItem("jfs:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("jfs:" + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const siteUrl = () => (store.get("site", DEFAULT_SITE) || DEFAULT_SITE).replace(/\/+$/, "");
  window.JFS = { store, siteUrl };

  /* ---------------- Header / footer ---------------- */
  const PAGES = [
    ["index.html", "Home"],
    ["syllabus.html", "Syllabus"],
    ["ground-school.html", "L1 Ground School"],
    ["first-officer.html", "L2 First Officer"],
    ["captain.html", "L3 Captain"],
    ["missions.html", "Missions"],
    ["jql-simulator.html", "JQL Simulator"],
    ["rovo.html", "Rovo"],
    ["mcp.html", "Claude + MCP"],
  ];
  const here = (location.pathname.split("/").pop() || "index.html");
  const planeSvg = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#0033a0"/><path fill="#ffb81c" d="M50 28.5 36 26 27 12h-4l4.5 14.5L17 25l-4-5h-3l2.5 9-2.5 9h3l4-5 10.5-1.5L23 46h4l9-14 14-2.5c2-.4 2-2.6 0-3z" transform="rotate(-8 32 32)"/></svg>';
  const header = $("#site-header");
  if (header) {
    header.className = "topbar";
    header.innerHTML =
      '<a class="skip" href="#main">Skip to content</a><div class="wrap">' +
      '<a class="brand" href="index.html">' + planeSvg + '<span>JIRA FLIGHT SCHOOL</span></a>' +
      '<button class="nav-toggle" aria-expanded="false" aria-controls="mainnav">Menu ☰</button>' +
      '<nav class="nav" id="mainnav">' +
      PAGES.map(([h, l]) => '<a href="' + h + '"' + (h === here ? ' aria-current="page"' : "") + ">" + l + "</a>").join("") +
      '</nav><span class="miles-pill" title="Your training miles (saved in this browser)" data-miles-pill>✈ 0 mi</span></div>';
    const t = $(".nav-toggle", header), n = $("#mainnav", header);
    t.addEventListener("click", () => { n.classList.toggle("open"); t.setAttribute("aria-expanded", n.classList.contains("open")); });
  }
  const footer = $("#site-footer");
  if (footer) {
    footer.outerHTML =
      '<div class="runway" aria-hidden="true"></div><footer class="site"><div class="wrap">' +
      '<div style="max-width:460px"><div class="brand" style="margin-bottom:10px">' + planeSvg + '<span>JIRA FLIGHT SCHOOL</span></div>' +
      '<p>Working with Jira, built for Digital Technology teams. Ground School, First Officer and Captain levels, with hands-on missions in a live sandbox.</p>' +
      '<p class="muted" style="color:#7286ab">Not an official Atlassian or airline publication. Product names belong to their owners.</p></div>' +
      '<div><h4 style="color:#cfe0ff">Sandbox site</h4><p style="margin-bottom:6px">“Run in Jira” buttons open this site:</p>' +
      '<form id="site-form" style="display:flex;gap:6px;flex-wrap:wrap"><input id="site-input" type="url" style="padding:8px 10px;border-radius:8px;border:1px solid #2a3f66;background:#0b1a36;color:#fff;min-width:240px;font:inherit" />' +
      '<button class="btn btn-sm btn-primary" type="submit">Save</button></form>' +
      '<p style="margin-top:14px"><a href="#" id="reset-progress">Reset my miles &amp; progress</a></p></div>' +
      "</div></footer>";
    const inp = $("#site-input"); if (inp) inp.value = siteUrl();
    $("#site-form") && $("#site-form").addEventListener("submit", e => { e.preventDefault(); store.set("site", inp.value.trim() || DEFAULT_SITE); toast("Sandbox site saved ✈"); refreshRunLinks(); });
    $("#reset-progress") && $("#reset-progress").addEventListener("click", e => { e.preventDefault(); if (window.confirm("Reset all miles and progress saved in this browser?")) { Object.keys(localStorage).filter(k => k.startsWith("jfs:") && k !== "jfs:site").forEach(k => localStorage.removeItem(k)); location.reload(); } });
  }

  /* ---------------- Toast + confetti ---------------- */
  let toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }
  function confetti(n) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glyphs = ["✈", "☁", "★", "✦", "🛫", "🎉"];
    for (let i = 0; i < (n || 28); i++) {
      const s = document.createElement("span"); s.className = "confetti";
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.color = ["#ffb81c", "#4a90e2", "#0033a0", "#8cbcf0"][i % 4];
      s.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
      document.body.appendChild(s); setTimeout(() => s.remove(), 4000);
    }
  }
  window.JFS.toast = toast; window.JFS.confetti = confetti;

  /* ---------------- Miles & status ---------------- */
  const TIERS = [[0, "Ground Crew"], [500, "Cadet"], [1500, "First Officer"], [3500, "Captain"], [6000, "Chief Pilot"]];
  const tierFor = m => TIERS.filter(t => m >= t[0]).pop()[1];
  function miles() { const done = store.get("done", {}); return Object.values(done).reduce((a, b) => a + (+b || 0), 0); }
  function renderMiles() {
    const m = miles();
    $$("[data-miles-pill]").forEach(el => el.textContent = "✈ " + m.toLocaleString() + " mi · " + tierFor(m));
    $$("[data-miles-total]").forEach(el => el.textContent = m.toLocaleString());
    $$("[data-miles-tier]").forEach(el => el.textContent = tierFor(m));
    const next = TIERS.find(t => t[0] > m);
    $$("[data-miles-next]").forEach(el => el.textContent = next ? (next[0] - m).toLocaleString() + " mi to " + next[1] : "Top tier reached. Blue skies!");
    $$("[data-miles-bar]").forEach(el => { const prev = TIERS.filter(t => m >= t[0]).pop()[0]; const nx = next ? next[0] : prev + 1; el.style.width = Math.min(100, ((m - prev) / (nx - prev)) * 100) + "%"; });
    $$("[data-count-done]").forEach(el => el.textContent = Object.keys(store.get("done", {})).length);
  }
  function award(id, amt, label) {
    const done = store.get("done", {});
    const before = tierFor(miles());
    if (done[id]) { delete done[id]; store.set("done", done); renderMiles(); return false; }
    done[id] = amt; store.set("done", done); renderMiles();
    const after = tierFor(miles());
    toast("+" + amt + " miles · " + (label || "Mission complete"));
    if (after !== before) { setTimeout(() => { toast("Status upgrade: " + after + " 🎖"); confetti(40); }, 900); } else confetti(14);
    return true;
  }
  window.JFS.award = award;
  $$("[data-miles-pill]").forEach(p => p.addEventListener("click", () => location.href = "index.html#logbook"));

  /* ---------------- Missions ---------------- */
  $$(".mission").forEach(m => {
    const id = m.id || m.dataset.id; const amt = +(m.dataset.miles || 250);
    const btn = $(".complete-btn", m); if (!btn || !id) return;
    const sync = () => { const d = !!store.get("done", {})[id]; btn.classList.toggle("done", d); btn.textContent = d ? "✓ Mission complete" : "Mark mission complete"; const t = $('.toc a[href="#' + id + '"]'); t && t.classList.toggle("done", d); };
    btn.addEventListener("click", () => { award(id, amt, $(".mission-head h3", m) ? $(".mission-head h3", m).textContent : ""); sync(); });
    sync();
  });

  /* ---------------- Checklists ---------------- */
  $$(".checklist[data-id]").forEach(list => {
    const key = "chk:" + list.dataset.id; const saved = store.get(key, {});
    $$("input[type=checkbox]", list).forEach((cb, i) => {
      cb.checked = !!saved[i]; cb.closest("li").classList.toggle("checked", cb.checked);
      cb.addEventListener("change", () => { const s = store.get(key, {}); s[i] = cb.checked; store.set(key, s); cb.closest("li").classList.toggle("checked", cb.checked);
        if ($$("input[type=checkbox]", list).every(c => c.checked)) { toast("Checklist complete ✓"); confetti(12); } });
    });
  });

  /* ---------------- JQL highlighting / copy / run ---------------- */
  const KW = /\b(AND|OR|NOT|IN|IS|EMPTY|NULL|ORDER BY|ASC|DESC|WAS|CHANGED|DURING|BEFORE|AFTER|ON|BY|FROM|TO)\b/g;
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function hlJql(src) {
    // protect strings + comments first
    const parts = []; let out = src.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(--[^\n]*)/g, (m, str, cm) => { parts.push(str ? '<span class="tok-str">' + esc(str) + "</span>" : '<span class="tok-cm">' + esc(cm) + "</span>"); return "\u0000" + (parts.length - 1) + "\u0000"; });
    out = esc(out)
      .replace(/\b([a-zA-Z]+)\(/g, '<span class="tok-fn">$1</span>(')
      .replace(KW, '<span class="tok-kw">$1</span>')
      .replace(/(!=|~|!~|&gt;=|&lt;=|(?<![a-z-])&gt;|(?<![a-z-])&lt;)/g, '<span class="tok-op">$1</span>');
    return out.replace(/\u0000(\d+)\u0000/g, (m, i) => parts[+i]);
  }
  function stripComments(q) { return q.split("\n").map(l => l.replace(/--.*$/, "")).join(" ").replace(/\s+/g, " ").trim(); }
  function refreshRunLinks() { $$("a[data-run-jql]").forEach(a => { a.href = siteUrl() + "/issues/?jql=" + encodeURIComponent(a.dataset.runJql); }); }
  $$("pre[data-jql], pre[data-code]").forEach(pre => {
    const isJql = pre.hasAttribute("data-jql");
    const raw = pre.textContent.replace(/^\n+|\s+$/g, "");
    const wrap = document.createElement("div"); wrap.className = "codeblock";
    const label = pre.dataset.label || (isJql ? "JQL" : (pre.dataset.code || "Code"));
    const head = document.createElement("div"); head.className = "cb-head";
    head.innerHTML = "<span>" + esc(label) + '</span><span class="cb-actions"></span>';
    const actions = $(".cb-actions", head);
    const copy = document.createElement("button"); copy.className = "cb-btn"; copy.type = "button"; copy.textContent = "Copy";
    copy.addEventListener("click", () => { const txt = isJql ? stripComments(raw) : raw; (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { copy.textContent = "Copied ✓"; setTimeout(() => copy.textContent = "Copy", 1400); }).catch(() => toast("Select the text and copy it manually")); });
    actions.appendChild(copy);
    if (isJql && pre.dataset.jql !== "norun") {
      const run = document.createElement("a"); run.className = "cb-btn run"; run.target = "_blank"; run.rel = "noopener"; run.textContent = "Run in Jira ↗";
      run.dataset.runJql = stripComments(raw); actions.appendChild(run);
    }
    pre.parentNode.insertBefore(wrap, pre); wrap.appendChild(head); wrap.appendChild(pre);
    pre.innerHTML = isJql ? hlJql(raw) : esc(raw);
  });
  refreshRunLinks();
  window.JFS.hlJql = hlJql; window.JFS.refreshRunLinks = refreshRunLinks;

  /* ---------------- Quizzes ---------------- */
  $$(".quiz[data-id]").forEach(quiz => {
    const qs = $$(".q", quiz); let answered = 0, right = 0;
    const scoreEl = $(".quiz-score", quiz);
    const pass = +(quiz.dataset.pass || 80);
    const update = () => {
      if (!scoreEl) return;
      const pct = Math.round((right / qs.length) * 100);
      $("b", scoreEl).textContent = right + " / " + qs.length;
      const msg = $(".msg", scoreEl);
      if (answered < qs.length) msg.textContent = (qs.length - answered) + " question(s) to go…";
      else if (pct >= pass) { msg.textContent = "Checkride passed (" + pct + "%). Cleared for the next level ✈"; const id = "quiz:" + quiz.dataset.id; if (!store.get("done", {})[id]) award(id, +(quiz.dataset.miles || 500), "Checkride passed"); confetti(50); }
      else msg.textContent = "Score " + pct + "%. You need " + pass + "% to pass. Review the lessons and try again.";
    };
    qs.forEach(q => {
      // shuffle answer order so the right answer isn't always in the same slot
      const box = $(".opts", q);
      if (box) { const kids = $$("button.opt", box); for (let i = kids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [kids[i], kids[j]] = [kids[j], kids[i]]; } kids.forEach(k => box.appendChild(k)); }
      const opts = $$("button.opt", q);
      opts.forEach(o => o.addEventListener("click", () => {
        if (q.classList.contains("answered")) return;
        q.classList.add("answered"); answered++;
        const ok = o.hasAttribute("data-right");
        if (ok) right++;
        o.classList.add(ok ? "right" : "wrong");
        opts.forEach(x => { x.disabled = true; if (x.hasAttribute("data-right")) x.classList.add("right"); });
        update();
      }));
    });
    const retry = $(".retry", quiz);
    retry && retry.addEventListener("click", () => { qs.forEach(q => { q.classList.remove("answered"); $$("button.opt", q).forEach(o => { o.disabled = false; o.classList.remove("right", "wrong"); }); }); answered = right = 0; update(); quiz.scrollIntoView({ behavior: "smooth" }); });
    update();
  });

  /* ---------------- Split-flap departure board ---------------- */
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-+→";
  function flap(el) {
    const target = (el.dataset.text || el.textContent).toUpperCase(); el.textContent = "";
    const spans = Array.from(target).map(() => { const s = document.createElement("span"); s.textContent = " "; el.appendChild(s); return s; });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { spans.forEach((s, i) => s.textContent = target[i]); return; }
    spans.forEach((s, i) => {
      let n = 0; const stop = 6 + Math.floor(Math.random() * 10) + i;
      const t = setInterval(() => {
        n++; s.classList.remove("flip"); void s.offsetWidth; s.classList.add("flip");
        if (n >= stop) { s.textContent = target[i]; clearInterval(t); }
        else s.textContent = CH[Math.floor(Math.random() * CH.length)];
      }, 55);
    });
  }
  window.JFS.flap = flap;
  const flapObs = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { flap(e.target); flapObs.unobserve(e.target); } }), { threshold: .3 }) : null;
  $$(".flap").forEach(f => { f.dataset.text = f.textContent; flapObs ? flapObs.observe(f) : flap(f); });
  $$(".board-clock").forEach(c => { const tick = () => c.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " LOCAL"; tick(); setInterval(tick, 15000); });

  /* ---------------- Lightbox for screenshots ---------------- */
  const lb = document.createElement("div"); lb.className = "lightbox"; lb.innerHTML = "<img alt=''>"; document.body.appendChild(lb);
  lb.addEventListener("click", () => lb.classList.remove("open"));
  document.addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("open"); });
  $$("figure.shot img").forEach(img => img.addEventListener("click", () => { $("img", lb).src = img.src; $("img", lb).alt = img.alt; lb.classList.add("open"); }));

  /* ---------------- TOC scroll spy ---------------- */
  const tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { tocLinks.forEach(a => a.classList.remove("active")); const a = map.get(e.target.id); a && a.classList.add("active"); } }), { rootMargin: "-20% 0px -70% 0px" });
    map.forEach((a, id) => { const t = document.getElementById(id); t && spy.observe(t); });
  }

  /* ---------------- Easter egg: barrel roll ---------------- */
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]; let pos = 0;
  document.addEventListener("keydown", e => {
    pos = e.key === code[pos] ? pos + 1 : (e.key === code[0] ? 1 : 0);
    if (pos === code.length) { pos = 0; document.body.classList.add("barrel"); setTimeout(() => document.body.classList.remove("barrel"), 1300); toast("Do a barrel roll! +100 bonus miles"); if (!store.get("done", {})["egg:barrel"]) award("egg:barrel", 100, "Secret maneuver"); }
  });

  renderMiles();
})();
