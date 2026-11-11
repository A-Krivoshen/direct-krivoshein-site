(function () {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* Metrika reach goals - fire only if ym exists */
  function goal(name, params) {
    try {
      if (typeof ym === "function") {
        var id = window.__KRV_METRIKA_ID;
        if (id) ym(id, "reachGoal", name, params || {});
      }
    } catch (e) {}
  }

  function bindGoals() {
    $$('a[href*="t.me/DrSlon"], a[href*="telegram"]').forEach(function (a) {
      a.addEventListener("click", function () { goal("cta_telegram"); }, { passive: true });
    });
    $$('a[href*="max.ru"]').forEach(function (a) {
      a.addEventListener("click", function () { goal("cta_max"); }, { passive: true });
    });
    $$('a[href*="#pricing"], a[href$="#pricing"]').forEach(function (a) {
      a.addEventListener("click", function () { goal("nav_pricing"); }, { passive: true });
    });
    $$('a[href*="yandex.ru/maps"], a[href*="sprav/widget"]').forEach(function (a) {
      a.addEventListener("click", function () { goal("open_yandex_reviews"); }, { passive: true });
    });
    var cookieOk = $("#krv-cookie-ok");
    if (cookieOk) {
      cookieOk.addEventListener("click", function () { goal("cookie_accept"); }, { passive: true });
    }
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest(".krv-lang-btn");
      if (t) goal("lang_switch", { lang: t.getAttribute("data-lang") || "" });
      var th = e.target && e.target.closest && e.target.closest(".krv-theme-btn");
      if (th) goal("theme_toggle");
      var faq = e.target && e.target.closest && e.target.closest("details, .krv-faq, [data-faq]");
      if (faq) goal("faq_interact");
    }, true);
  }

  /* Qualifier -> prefilled Telegram message */
  function bindQualifier() {
    var root = $("#krv-qual");
    if (!root) return;
    var sel = $("#krv-qual-need");
    var note = $("#krv-qual-note");
    var btn = $("#krv-qual-go");
    if (!btn) return;
    function build() {
      var need = sel ? sel.value : "";
      var extra = note ? String(note.value || "").trim() : "";
      var product = document.body.getAttribute("data-product") || "site";
      var lines = [
        "Здравствуйте! Заявка с " + product + ".krivoshein.site",
        need ? ("Задача: " + need) : "",
        extra ? ("Комментарий: " + extra) : ""
      ].filter(Boolean);
      var text = encodeURIComponent(lines.join("\n"));
      return "https://t.me/DrSlon?text=" + text;
    }
    function refresh() { btn.setAttribute("href", build()); }
    if (sel) sel.addEventListener("change", refresh);
    if (note) note.addEventListener("input", refresh);
    btn.addEventListener("click", function () {
      refresh();
      goal("qual_submit");
    });
    refresh();
  }

  /* Lazy matrix: keep script but hide canvas on mobile/reduce - CSS handles; pause if canvas hidden */
  
  function hideAssistantMobile() {
    try {
      var mq = window.matchMedia("(max-width: 767.98px)");
      function apply() {
        var nodes = document.querySelectorAll(".krv-assistant, .krv-a-launcher, .krv-a-fab, [class*='krv-a-']");
        nodes.forEach(function (el) {
          if (!mq.matches) {
            if (el.dataset.krvMobileHide === "1") {
              el.style.removeProperty("display");
              el.style.removeProperty("visibility");
              el.style.removeProperty("pointer-events");
              delete el.dataset.krvMobileHide;
            }
            return;
          }
          el.dataset.krvMobileHide = "1";
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("pointer-events", "none", "important");
        });
      }
      apply();
      if (mq.addEventListener) mq.addEventListener("change", apply);
      else if (mq.addListener) mq.addListener(apply);
      // widget injects late
      var obs = new MutationObserver(function () { apply(); });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 15000);
      setTimeout(apply, 500);
      setTimeout(apply, 2000);
    } catch (e) {}
  }

  function softMatrix() {
    try {
      var c = document.getElementById("krv-matrix-canvas");
      if (!c) return;
      var mq = window.matchMedia("(max-width: 767.98px), (prefers-reduced-motion: reduce)");
      function apply() {
        if (mq.matches) c.style.display = "none";
        else if (document.documentElement.getAttribute("data-theme") === "dark") c.style.display = "";
      }
      apply();
      if (mq.addEventListener) mq.addEventListener("change", apply);
      else if (mq.addListener) mq.addListener(apply);
    } catch (e) {}
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    bindGoals();
    bindQualifier();
    softMatrix();
    hideAssistantMobile();
  });
})();
