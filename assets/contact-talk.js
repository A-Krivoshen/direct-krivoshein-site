/** Direct personal chats. No form, clipboard, storage or lead-success event. */
(function () {
  "use strict";
  if (window.__krvContactTalkLoaded) return;
  window.__krvContactTalkLoaded = true;

  var services = {
    site: ["Сайты, реклама и автоматизация", "Websites, ads and automation"],
    landing: ["Разработка сайта", "Website development"],
    wordpress: ["WordPress", "WordPress"],
    vps: ["VPS", "VPS"],
    direct: ["Яндекс Директ", "Yandex Direct"],
    bots: ["Боты и автоматизация", "Bots and automation"],
    flask: ["Flask / Python", "Flask / Python"],
    "ai-ready": ["AI-ready", "AI-ready"]
  };
  var needs = {
    site: {
      wordpress: ["Доработать WordPress", "Improve WordPress"],
      landing: ["Создать сайт", "Build a website"],
      direct: ["Настроить рекламу", "Set up advertising"],
      vps: ["Настроить сервер", "Set up a server"],
      bots: ["Автоматизировать процессы", "Automate processes"]
    },
    landing: {
      new: ["Нужен новый лендинг", "Build a landing page"],
      change: ["Доработать текущий", "Improve an existing page"],
      structure: ["Обсудить структуру сайта", "Discuss website structure"]
    },
    wordpress: {
      repair: ["Сайт перестал работать", "Fix a broken website"],
      change: ["Нужны доработки", "Make changes"],
      speed: ["Ускорить сайт", "Improve website speed"],
      support: ["Регулярная поддержка", "Ongoing maintenance"],
      move: ["Перенос или восстановление", "Migration or recovery"]
    },
    vps: {
      setup: ["Настроить новый VPS", "Set up a new VPS"],
      move: ["Перенести сайт", "Migrate a website"],
      docker: ["Настроить Docker", "Set up Docker"],
      repair: ["Исправить ошибку сервера", "Fix a server error"],
      security: ["Обеспечить безопасность", "Improve security"]
    },
    direct: {
      launch: ["Запустить рекламу", "Launch advertising"],
      audit: ["Проверить существующую рекламу", "Audit existing campaigns"],
      optimize: ["Оптимизировать расходы", "Optimize ad spend"],
      analytics: ["Настроить Метрику и цели", "Set up Metrika and goals"],
      consult: ["Техническая консультация", "Technical consultation"]
    },
    bots: {
      telegram: ["Telegram-бот", "Telegram bot"],
      max: ["MAX-бот", "MAX bot"],
      integration: ["Интеграция с CRM или таблицами", "CRM or spreadsheet integration"],
      automation: ["Автоматизация уведомлений и заявок", "Automate notifications and inquiries"]
    },
    flask: {
      site: ["Небольшой сайт на Flask", "Small Flask website"],
      logic: ["Форма заявок и своя логика", "Inquiry form and custom logic"],
      api: ["API или интеграция", "API or integration"],
      account: ["Кабинет или оплата", "Account or payments"]
    },
    "ai-ready": {
      audit: ["Аудит AI-ready", "AI-ready audit"],
      schema: ["Внедрение Schema.org и FAQ", "Implement Schema.org and FAQ"],
      structure: ["Доработка структуры и контента", "Improve structure and content"]
    }
  };
  var packages = {
    full: ["Лендинг с SEO и блоками", "Landing page with SEO"],
    integrations: ["Бот с интеграциями", "Bot with integrations"],
    start: ["Start", "Start"],
    pro: ["Pro", "Pro"],
    "bot-ready": ["Bot-ready", "Bot-ready"],
    rag: ["RAG: отдельная оценка", "RAG: separate estimate"]
  };
  var choice = { pack: "", need: "" };

  function en() { return /^en\b/i.test(document.documentElement.lang || ""); }
  function root() { return document.querySelector("[data-krv-talk]"); }
  function serviceId() {
    var node = root();
    var key = (node && node.getAttribute("data-service")) || document.body.getAttribute("data-product") || "site";
    return Object.prototype.hasOwnProperty.call(services, key) ? key : "site";
  }
  function label(table, key) {
    if (!key || !Object.prototype.hasOwnProperty.call(table, key)) return "";
    return table[key][en() ? 1 : 0];
  }
  function message() {
    var lines = [en() ? "Hello! I want to discuss a task." : "Здравствуйте! Хочу обсудить задачу."];
    lines.push((en() ? "Service: " : "Услуга: ") + label(services, serviceId()));
    var pack = label(packages, choice.pack);
    var need = label(needs[serviceId()] || {}, choice.need);
    if (pack) lines.push((en() ? "Package: " : "Пакет: ") + pack);
    else if (need) lines.push((en() ? "Package: " : "Пакет: ") + need);
    return lines.join("\n");
  }
  function telegramHref() {
    return "https://t.me/DrSlon?text=" + encodeURIComponent(message());
  }
  function apply() {
    var href = telegramHref();
    Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (link) {
      var value = link.getAttribute("href") || "";
      try {
        var url = new URL(value, location.href);
        if (url.hostname !== "t.me" || !/^\/drslon\/?$/i.test(url.pathname)) return;
      } catch (error) {
        return;
      }
      link.setAttribute("href", href);
    });
    var note = document.querySelector("[data-krv-talk-note]");
    if (!note) return;
    var pack = label(packages, choice.pack);
    var need = label(needs[serviceId()] || {}, choice.need);
    var picked = pack || need;
    if (!picked) {
      note.textContent = "";
      note.hidden = true;
      return;
    }
    note.hidden = false;
    note.textContent = en()
      ? "Telegram opens with this package: " + picked + "."
      : "В Telegram откроется текст с пакетом: " + picked + ".";
  }
  function page() {
    return location && location.pathname ? location.pathname : "/";
  }
  function goal(name) {
    if (window.krvConsent && window.krvConsent.analytics !== true) return;
    var node = root();
    var id = Number(window.__KRV_METRIKA_ID || (node && node.getAttribute("data-counter")));
    if (!id || typeof window.ym !== "function") return;
    var params = { service: serviceId(), page: page() };
    if (choice.pack && Object.prototype.hasOwnProperty.call(packages, choice.pack)) params.package = choice.pack;
    else if (choice.need && Object.prototype.hasOwnProperty.call(needs[serviceId()] || {}, choice.need)) params.package = choice.need;
    try { window.ym(id, "reachGoal", name, params); } catch (error) {}
  }
  function channel(href) {
    try {
      var url = new URL(href, location.href);
      if (url.hostname === "t.me" && /^\/drslon\/?$/i.test(url.pathname)) return "cta_telegram";
      if ((url.hostname === "krivoshein.site" && /^\/max\/?$/.test(url.pathname)) ||
          (url.hostname === "max.ru" && /^\/u\//.test(url.pathname))) return "cta_max";
      if (url.protocol === "mailto:" && url.pathname.toLowerCase() === "aleksey@krivoshein.site") return "contact_email_click";
      if (url.protocol === "tel:" && url.pathname.replace(/[\s()-]/g, "") === "+79636641615") return "contact_phone_click";
    } catch (error) {}
    return "";
  }
  function ready() {
    apply();
    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      var name = channel(link.getAttribute("href"));
      if (name) goal(name);
      if (link.getAttribute("href") !== "#brief") return;
      var pack = link.getAttribute("data-krv-package") || "";
      var need = link.getAttribute("data-krv-need") || "";
      var knownPack = Object.prototype.hasOwnProperty.call(packages, pack);
      var knownNeed = Object.prototype.hasOwnProperty.call(needs[serviceId()] || {}, need);
      if (knownPack) {
        choice.pack = pack;
        choice.need = "";
      } else if (knownNeed) {
        choice.need = need;
        choice.pack = "";
      }
      if (knownPack || knownNeed) apply();
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
      var target = document.getElementById("brief") || root();
      if (!target) return;
      event.preventDefault();
      if (location.hash !== "#brief") {
        try { history.pushState(null, "", "#brief"); } catch (error) {}
      }
      target.scrollIntoView({ block: "start", behavior: "auto" });
      var heading = target.querySelector("h2");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
    new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
