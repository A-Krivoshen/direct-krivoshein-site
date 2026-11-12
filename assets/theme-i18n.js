(function () {
  "use strict";
  var THEME_KEY = "krv_theme";
  var LANG_KEY = "krv_lang";
  var LANG_MANUAL_KEY = "krv_lang_manual"; // "1" only after user clicks RU/EN
  var DAY_START = 7;
  var DAY_END = 20;
  var dict = null;
  var orig = new WeakMap();
  var currentLang = null;

  /* CIS / near-RU markets → Russian */
  var GEO_RU = {
    RU: 1, BY: 1, KZ: 1, KG: 1, AM: 1, AZ: 1,
    UZ: 1, TJ: 1, TM: 1, MD: 1, UA: 1
  };

  /* Timezones typical for RU/CIS audiences */
  var TZ_RU = {
    "Europe/Moscow": 1, "Europe/Kaliningrad": 1, "Europe/Samara": 1,
    "Europe/Volgograd": 1, "Europe/Saratov": 1, "Europe/Ulyanovsk": 1,
    "Europe/Astrakhan": 1, "Europe/Kirov": 1,
    "Asia/Yekaterinburg": 1, "Asia/Omsk": 1, "Asia/Novosibirsk": 1,
    "Asia/Barnaul": 1, "Asia/Tomsk": 1, "Asia/Novokuznetsk": 1,
    "Asia/Krasnoyarsk": 1, "Asia/Irkutsk": 1, "Asia/Chita": 1,
    "Asia/Yakutsk": 1, "Asia/Vladivostok": 1, "Asia/Magadan": 1,
    "Asia/Sakhalin": 1, "Asia/Kamchatka": 1, "Asia/Anadyr": 1,
    "Asia/Srednekolymsk": 1, "Asia/Ust-Nera": 1, "Asia/Khandyga": 1,
    "Europe/Minsk": 1, "Europe/Kyiv": 1, "Europe/Kiev": 1,
    "Europe/Simferopol": 1, "Europe/Zaporozhye": 1, "Europe/Uzhgorod": 1,
    "Asia/Almaty": 1, "Asia/Qyzylorda": 1, "Asia/Aqtobe": 1,
    "Asia/Aqtau": 1, "Asia/Atyrau": 1, "Asia/Oral": 1,
    "Asia/Qostanay": 1, "Asia/Bishkek": 1, "Asia/Tashkent": 1,
    "Asia/Samarkand": 1, "Asia/Dushanbe": 1, "Asia/Ashgabat": 1,
    "Asia/Yerevan": 1, "Asia/Baku": 1, "Europe/Chisinau": 1,
    "Asia/Tbilisi": 1
  };

  /* Language tags that prefer Russian UI */
  var LANG_RU_RE = /^(ru|be|uk|kk|ky|uz|tg|tk|mo|ro-md|ba|tt|cv|udm|sah|os|ce|av|kv|mhr|mrj)([-_]|$)/i;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

  /** Exact dict lookup with dash/nbsp variants (HTML often mixes — / -). */
  function tr(key) {
    if (!dict || key == null) return null;
    var k = norm(key);
    if (!k) return null;
    if (dict[k]) return dict[k];
    if (dict[key]) return dict[key];
    var alts = [
      k.replace(/\u2014/g, "-").replace(/\u2013/g, "-"),
      k.replace(/-/g, "\u2014"),
      k.replace(/\u00a0/g, " ")
    ];
    for (var i = 0; i < alts.length; i++) {
      if (dict[alts[i]]) return dict[alts[i]];
    }
    return null;
  }

  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  var META_SEL = [
    'meta[name="description"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]'
  ];

  function autoTheme() {
    var h = new Date().getHours();
    return h >= DAY_START && h < DAY_END ? "light" : "dark";
  }

  function readThemeCookie() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)krv_theme=(light|dark)/);
      return m ? m[1] : null;
    } catch (e) { return null; }
  }

  function writeThemeCookie(t) {
    try {
      var secure = location.protocol === "https:" ? "; Secure" : "";
      document.cookie = THEME_KEY + "=" + t + "; path=/; max-age=31536000; domain=.krivoshein.site; SameSite=Lax" + secure;
    } catch (e) {}
  }

  function themeFromQuery() {
    try {
      var q = new URLSearchParams(window.location.search).get("theme");
      if (q === "light" || q === "dark") return q;
    } catch (e) {}
    return null;
  }

  function getTheme() {
    /* URL ?theme= always wins (shareable QA / deep links) */
    var q = themeFromQuery();
    if (q) return q;
    var c = readThemeCookie();
    if (c === "light" || c === "dark") return c;
    try {
      var s = localStorage.getItem(THEME_KEY);
      if (s === "light" || s === "dark") return s;
    } catch (e) {}
    return autoTheme();
  }

  function setThemeColorMeta(theme) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", theme === "dark" ? "#0b1220" : "#315fe8");
  }

  function applyTheme(theme, anim, persist) {
    var html = document.documentElement;
    var t = theme === "dark" ? "dark" : "light";
    if (anim) html.classList.add("theme-anim");
    html.setAttribute("data-theme", t);
    setThemeColorMeta(t);
    var btn = $(".krv-theme-btn");
    if (btn) {
      btn.textContent = t === "dark" ? "\u2600" : "\u263E";
      btn.title = t === "dark" ? "Светлая тема / Light" : "Тёмная тема / Dark";
      btn.setAttribute("aria-label", btn.title);
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
      writeThemeCookie(t);
    }
    if (anim) setTimeout(function () { html.classList.remove("theme-anim"); }, 280);
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(cur === "dark" ? "light" : "dark", true, true);
  }

  /** ?lang=en|ru in URL (one-shot, does not force manual lock) */
  function langFromQuery() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q) {
        q = String(q).toLowerCase().slice(0, 2);
        if (q === "ru" || q === "en") return q;
      }
    } catch (e) {}
    return null;
  }

  function langFromBrowser() {
    var list = [];
    try {
      if (navigator.languages && navigator.languages.length) {
        list = Array.prototype.slice.call(navigator.languages);
      }
    } catch (e) {}
    if (!list.length && navigator.language) list = [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i] || "").toLowerCase();
      if (LANG_RU_RE.test(tag)) return "ru";
    }
    if (list.length) return "en";
    return null;
  }

  function langFromTimezone() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (TZ_RU[tz]) return "ru";
      // loose: Europe/* Russia-adjacent often not listed — only strict map
    } catch (e) {}
    return null;
  }

  function getManualLang() {
    try {
      if (localStorage.getItem(LANG_MANUAL_KEY) === "1") {
        var s = localStorage.getItem(LANG_KEY);
        if (s === "ru" || s === "en") return s;
      }
    } catch (e) {}
    return null;
  }

  /**
   * Sync best-effort (no network): query → browser → timezone → ru default for this product
   * (default ru: site is RU business; geo/network may upgrade to en for foreign IPs)
   */
  function detectLangSync() {
    var manual = getManualLang();
    if (manual) return manual;
    var q = langFromQuery();
    if (q) return q;
    var b = langFromBrowser();
    if (b) return b;
    var tz = langFromTimezone();
    if (tz) return tz;
    return "ru";
  }

  /**
   * Async: geo IP from nginx /api/krv-lang (where the visitor came from)
   * Priority: manual → ?lang= → geo country → browser → timezone → ru
   */
  function resolveLang(cb) {
    var manual = getManualLang();
    if (manual) { cb(manual, "manual"); return; }

    var q = langFromQuery();
    if (q) { cb(q, "query"); return; }

    var settled = false;
    function done(lang, source) {
      if (settled) return;
      settled = true;
      cb(lang === "en" ? "en" : "ru", source || "fallback");
    }

    var timer = setTimeout(function () {
      var b = langFromBrowser();
      if (b) { done(b, "browser-timeout"); return; }
      var tz = langFromTimezone();
      if (tz) { done(tz, "timezone-timeout"); return; }
      done("ru", "default-timeout");
    }, 900);

    fetch("/api/krv-lang", { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("geo"); return r.json(); })
      .then(function (data) {
        clearTimeout(timer);
        var cc = String((data && data.country) || "").toUpperCase();
        var hint = data && data.lang;
        if (cc && GEO_RU[cc]) { done("ru", "geo:" + cc); return; }
        if (cc && !GEO_RU[cc]) { done("en", "geo:" + cc); return; }
        if (hint === "ru" || hint === "en") { done(hint, "geo-hint"); return; }
        // empty country — use browser/timezone
        var b = langFromBrowser();
        if (b) { done(b, "browser"); return; }
        var tz = langFromTimezone();
        if (tz) { done(tz, "timezone"); return; }
        done("ru", "default");
      })
      .catch(function () {
        clearTimeout(timer);
        var b = langFromBrowser();
        if (b) { done(b, "browser"); return; }
        var tz = langFromTimezone();
        if (tz) { done(tz, "timezone"); return; }
        done("ru", "default");
      });
  }

  function setLangButtons(lang) {
    $$(".krv-lang-btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.documentElement.setAttribute("lang", lang);
  }

  /**
   * @param {string} lang
   * @param {boolean} [persist] — true only on RU/EN button click
   */
  function applyLang(lang, persist) {
    if (!document.body) return;
    lang = lang === "en" ? "en" : "ru";
    currentLang = lang;
    setLangButtons(lang);
    if (persist) {
      try {
        localStorage.setItem(LANG_KEY, lang);
        localStorage.setItem(LANG_MANUAL_KEY, "1");
      } catch (e) {}
    }
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        var t = node.parentElement.tagName;
        if (t === "SCRIPT" || t === "STYLE" || t === "NOSCRIPT" || t === "CODE") return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest(".krv-controls")) return NodeFilter.FILTER_REJECT;
        if (!norm(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      if (!orig.has(node)) orig.set(node, node.nodeValue);
      var raw = orig.get(node);
      var trimmed = norm(raw);
      var lead = (raw.match(/^\s*/) || [""])[0];
      var trail = (raw.match(/\s*$/) || [""])[0];
      if (lang === "ru") { node.nodeValue = raw; return; }
      var en = tr(trimmed);
      if (en) node.nodeValue = lead + en + trail;
    });
    /* Attributes: alt, title, aria-label, placeholder */
    ATTRS.forEach(function (attr) {
      $$("[" + attr + "]").forEach(function (el) {
        if (el.closest && el.closest(".krv-controls")) return;
        var ds = "i18n" + attr.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
        // data-i18n-alt / data-i18n-title / data-i18n-ariaLabel / data-i18n-placeholder
        if (ds === "i18naria-label" || attr === "aria-label") ds = "i18nAriaLabel";
        if (!el.dataset[ds]) el.dataset[ds] = el.getAttribute(attr) || "";
        var raw = el.dataset[ds];
        if (lang === "ru") {
          el.setAttribute(attr, raw);
          return;
        }
        var en = tr(raw);
        if (en) el.setAttribute(attr, en);
      });
    });
    /* document title */
    if (!document.documentElement.dataset.titleRu) document.documentElement.dataset.titleRu = document.title;
    if (lang === "ru") document.title = document.documentElement.dataset.titleRu;
    else {
      var tRu = document.documentElement.dataset.titleRu;
      var full = tr(tRu) || tr(norm(tRu));
      if (full) document.title = full;
      else {
        var left = norm(tRu.split("|")[0]);
        var leftEn = tr(left);
        if (leftEn) {
          var rest = tRu.indexOf("|") >= 0 ? " " + tRu.slice(tRu.indexOf("|")) : "";
          document.title = leftEn + rest;
        }
      }
    }
    /* meta description + og/twitter */
    META_SEL.forEach(function (sel) {
      var meta = document.querySelector(sel);
      if (!meta) return;
      if (!meta.dataset.ru) meta.dataset.ru = meta.getAttribute("content") || "";
      if (lang === "ru") meta.setAttribute("content", meta.dataset.ru);
      else {
        var en = tr(meta.dataset.ru);
        if (en) meta.setAttribute("content", en);
      }
    });
  }

  function loadDict(cb) {
    fetch((window.krvUrl ? krvUrl("assets/i18n-en.json?v=20261112clean") : "/assets/i18n-en.json?v=20261112clean"), { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error("dict"); return r.json(); })
      .then(function (d) { dict = d || {}; cb(); })
      .catch(function () { dict = {}; cb(); });
  }

  function injectControls() {
    if ($(".krv-controls")) return;
    var host = document.querySelector("nav .krv-nav-right") ||
      document.querySelector("nav .max-w-screen-xl .flex.items-center.justify-between") ||
      document.querySelector("nav .flex.items-center.justify-between") ||
      document.querySelector("header .wrap") ||
      document.querySelector("header");
    if (!host) return;
    var box = document.createElement("div");
    box.className = "krv-controls";
    box.innerHTML =
      '<div class="krv-switch" role="group" aria-label="Language">' +
      '<button type="button" class="krv-lang-btn" data-lang="ru">RU</button>' +
      '<button type="button" class="krv-lang-btn" data-lang="en">EN</button></div>' +
      '<button type="button" class="krv-theme-btn" aria-label="Theme">\u263E</button>';
    var cta = host.querySelector(".krv-nav-cta, a.inline-flex");
    if (cta && cta.parentElement === host) host.insertBefore(box, cta);
    else if (cta && cta.parentElement) cta.parentElement.insertBefore(box, cta);
    else host.appendChild(box);
    $$(".krv-lang-btn", box).forEach(function (b) {
      b.addEventListener("click", function () {
        applyLang(b.getAttribute("data-lang"), true);
      });
    });
    var tb = $(".krv-theme-btn", box);
    if (tb) tb.addEventListener("click", toggleTheme);
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  applyTheme(getTheme(), false, false);
  ready(function () {
    try {
      injectControls();
      applyTheme(getTheme(), false, false);
      // Fast paint with sync guess, then refine from geo IP
      loadDict(function () {
        applyLang(detectLangSync(), false);
        resolveLang(function (lang, source) {
          if (lang !== currentLang) applyLang(lang, false);
          try {
            document.documentElement.dataset.krvLangSource = source || "";
          } catch (e) {}
        });
      });
    } catch (e) { console.error("[krv theme-i18n]", e); }
  });
})();
