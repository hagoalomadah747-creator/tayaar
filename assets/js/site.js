/* Tayaar Simulator website: no dependencies. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var lang = doc.lang === "en" ? "en" : "ar";
  var root = (document.querySelector('meta[name="site-root"]') || {}).content || "./";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = {
    ar: {
      soon: "قريباً", perMonth: "/ شهرياً", perYear: "/ سنوياً", free: "مجاناً", copied: "تم النسخ ✓", copy: "نسخ",
      choose: "سجّل اهتمامك", freeCta: "متاح مع التطبيق", mb: "ميجابايت",
      dlOff: "رابط التنزيل غير متاح بعد. سيُفعَّل بعد اكتمال اختبار المثبّت ومراجعة التراخيص.",
      dlOn: "تحقق من بصمة الملف قبل التثبيت.", gh: "تنزيل من GitHub", gd: "رابط بديل: Google Drive",
      wa: "مرحباً، أريد الاستفسار عن اشتراكات تيّار."
    },
    en: {
      soon: "Coming soon", perMonth: "/ month", perYear: "/ year", free: "Free", copied: "Copied ✓", copy: "Copy",
      choose: "Register interest", freeCta: "Included with the app", mb: "MB",
      dlOff: "The download link is not available yet. It will be enabled after installer testing and the licensing review are complete.",
      dlOn: "Verify the file hash before installing.", gh: "Download from GitHub", gd: "Mirror: Google Drive",
      wa: "Hello, I'd like to ask about Tayaar subscriptions."
    }
  }[lang];

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function getJSON(path) {
    return fetch(root + path, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  var ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>';

  /* year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* reveal on scroll */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* pointer glow on bento cells */
  $$(".cell").forEach(function (cell) {
    cell.addEventListener("pointermove", function (e) {
      var r = cell.getBoundingClientRect();
      cell.style.setProperty("--mx", (e.clientX - r.left) + "px");
      cell.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* hero circuit */
  var circuit = $("#circuit");
  var toggle = $("#circuit-toggle");
  var readU = $("#rd-u"), readI = $("#rd-i"), readP = $("#rd-p"), readF = $("#rd-f");
  var timer = null;
  function fmt(n, d) { return n.toFixed(d); }
  function updateReadouts(on) {
    if (!readU) return;
    var u = on ? 230 + (Math.random() - 0.5) * 1.6 : 0;
    var i = on ? 2.46 + (Math.random() - 0.5) * 0.06 : 0;
    readU.textContent = "U  " + fmt(u, 1) + " V";
    readI.textContent = "I  " + fmt(i, 2) + " A";
    readP.textContent = "P  " + Math.round(u * i * 0.97) + " W";
    readF.textContent = "f  " + (on ? "50.0" : "0.0") + " Hz";
    [readU, readI, readP, readF].forEach(function (t) { t.classList.toggle("dimmed", !on); });
  }
  function setCircuit(on) {
    if (!circuit) return;
    circuit.classList.toggle("on", on);
    if (toggle) toggle.setAttribute("aria-pressed", on ? "true" : "false");
    var hit = $("#s1-hit");
    if (hit) hit.setAttribute("aria-pressed", on ? "true" : "false");
    clearInterval(timer);
    updateReadouts(on);
    if (on && !reduced) timer = setInterval(function () { updateReadouts(true); }, 700);
  }
  if (circuit) {
    var startOn = true;
    setCircuit(startOn);
    var flip = function () { setCircuit(!circuit.classList.contains("on")); };
    if (toggle) toggle.addEventListener("click", flip);
    var hit = $("#s1-hit");
    if (hit) {
      hit.addEventListener("click", flip);
      hit.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    }
    /* pause readout updates while the hero is off screen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var visible = en[0].isIntersecting;
        clearInterval(timer);
        if (visible && circuit.classList.contains("on") && !reduced) timer = setInterval(function () { updateReadouts(true); }, 700);
      }).observe(circuit);
    }
  }

  /* showcase tabs */
  var tabs = $$(".tab");
  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () { selectTab(idx); });
    tab.addEventListener("keydown", function (e) {
      var dir = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : (e.key === "ArrowUp" || e.key === "ArrowLeft") ? -1 : 0;
      if (doc.dir === "rtl" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) dir = -dir;
      if (dir) { e.preventDefault(); var n = (idx + dir + tabs.length) % tabs.length; selectTab(n); tabs[n].focus(); }
    });
  });
  function selectTab(i) {
    tabs.forEach(function (t, j) { t.setAttribute("aria-selected", j === i ? "true" : "false"); t.tabIndex = j === i ? 0 : -1; });
    $$(".screen img").forEach(function (img, j) { img.classList.toggle("active", j === i); });
    var cap = $("#shot-caption"); if (cap && tabs[i]) cap.textContent = tabs[i].getAttribute("data-caption") || "";
    var bar = $("#shot-title"); if (bar && tabs[i]) bar.textContent = tabs[i].getAttribute("data-title") || "";
  }
  if (tabs.length) selectTab(0);

  /* copy buttons */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = $(btn.getAttribute("data-copy"));
      if (!target) return;
      var text = target.textContent.trim();
      var done = function () { btn.textContent = T.copied; setTimeout(function () { btn.textContent = T.copy; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  /* release data */
  getJSON("data/release.json").then(function (rel) {
    $$("[data-rel]").forEach(function (el) {
      var k = el.getAttribute("data-rel");
      if (k === "size") el.textContent = (rel.sizeBytes / 1048576).toFixed(1) + " " + T.mb;
      else if (rel[k] != null) el.textContent = rel[k];
    });
    var on = rel.downloadEnabled === true;
    setDl($("#dl-github"), on && rel.downloads && rel.downloads.github, T.gh);
    setDl($("#dl-drive"), on && rel.downloads && rel.downloads.googleDrive, T.gd);
    var state = $("#dl-state-text"); if (state) state.textContent = on ? T.dlOn : T.dlOff;
    $$("[data-hero-download]").forEach(function (a) { if (on && rel.downloads && rel.downloads.github) a.href = rel.downloads.github; });
  }).catch(function () { /* keep the static text in the page */ });

  function setDl(a, url, label) {
    if (!a) return;
    if (url) {
      a.href = url; a.removeAttribute("aria-disabled"); a.removeAttribute("tabindex");
      a.classList.remove("btn-ghost"); a.classList.add(a.id === "dl-github" ? "btn-primary" : "btn-ghost");
      var lab = a.querySelector(".lbl"); if (lab) lab.textContent = label;
    } else {
      a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.setAttribute("tabindex", "-1");
    }
  }

  /* plans */
  var plansEl = $("#plan-cards");
  var billing = "monthly";
  var pricing = null;
  function waLink(number) { return "https://wa.me/" + number + "?text=" + encodeURIComponent(T.wa); }
  function renderPlans() {
    if (!plansEl || !pricing) return;
    var cur = pricing.currency[lang];
    plansEl.innerHTML = pricing.plans.map(function (p) {
      var price = p.price[billing];
      var priceHtml;
      if (p.id === "free") priceHtml = '<span class="amount">' + T.free + "</span>";
      else if (pricing.status === "soon" || price == null) priceHtml = '<span class="soon">' + T.soon + "</span>";
      else priceHtml = '<span class="amount">' + Number(price).toLocaleString(lang === "ar" ? "ar-SD" : "en-US") + '</span><span class="per">' + cur + " " + (billing === "monthly" ? T.perMonth : T.perYear) + "</span>";
      var feats = p.features.map(function (f) {
        return '<li class="' + (f.on ? "on" : "off") + '">' + (f.on ? ICON_ON : ICON_OFF) + "<span>" + f[lang] + "</span></li>";
      }).join("");
      var cta = p.id === "free"
        ? '<a class="btn btn-ghost" href="#download">' + T.freeCta + "</a>"
        : '<a class="btn ' + (p.featured ? "btn-primary" : "btn-ghost") + '" href="' + waLink(pricing.whatsapp) + '" target="_blank" rel="noopener">' + T.choose + "</a>";
      return '<article class="plan' + (p.featured ? " featured" : "") + ' reveal in">' +
        (p.featured ? '<span class="ribbon">' + (lang === "ar" ? "الأشمل" : "Most complete") + "</span>" : "") +
        "<h3>" + p.name[lang] + '</h3><p class="tag">' + p.tagline[lang] + '</p><div class="price">' + priceHtml + "</div><ul>" + feats + "</ul>" + cta + "</article>";
    }).join("");
  }
  $$(".billing button").forEach(function (b) {
    b.addEventListener("click", function () {
      billing = b.getAttribute("data-billing");
      $$(".billing button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      renderPlans();
    });
  });
  getJSON("data/pricing.json").then(function (p) {
    pricing = p;
    renderPlans();
    $$("[data-wa]").forEach(function (a) { a.href = waLink(p.whatsapp); });
  }).catch(function () { /* static fallback stays */ });
})();
