/** Shared, browser-only brief. No POST, storage, message deep-links or lead-success events. */
(function () {
  "use strict";
  if (window.__krvContactBriefLoaded) return;
  window.__krvContactBriefLoaded = true;

  var services = {
    site: ["Сайты, реклама и автоматизация", "Websites, ads and automation", [
      ["wordpress", "Доработать WordPress", "Improve WordPress"],
      ["landing", "Создать сайт", "Build a website"],
      ["direct", "Настроить рекламу", "Set up advertising"],
      ["vps", "Настроить сервер", "Set up a server"],
      ["bots", "Автоматизировать процессы", "Automate processes"]]],
    landing: ["Разработка сайта", "Website development", [
      ["new", "Нужен новый лендинг", "Build a landing page"],
      ["change", "Доработать текущий", "Improve an existing page"],
      ["structure", "Обсудить структуру сайта", "Discuss website structure"]]],
    wordpress: ["WordPress", "WordPress", [
      ["repair", "Сайт перестал работать", "Fix a broken website"],
      ["change", "Нужны доработки", "Make changes"],
      ["speed", "Ускорить сайт", "Improve website speed"],
      ["support", "Регулярная поддержка", "Ongoing maintenance"],
      ["move", "Перенос или восстановление", "Migration or recovery"]]],
    vps: ["VPS", "VPS", [
      ["setup", "Настроить новый VPS", "Set up a new VPS"],
      ["move", "Перенести сайт", "Migrate a website"],
      ["docker", "Настроить Docker", "Set up Docker"],
      ["repair", "Исправить ошибку сервера", "Fix a server error"],
      ["security", "Обеспечить безопасность", "Improve security"]]],
    direct: ["Яндекс Директ", "Yandex Direct", [
      ["launch", "Запустить рекламу", "Launch advertising"],
      ["audit", "Проверить существующую рекламу", "Audit existing campaigns"],
      ["optimize", "Оптимизировать расходы", "Optimize ad spend"],
      ["analytics", "Настроить Метрику и цели", "Set up Metrika and goals"],
      ["consult", "Техническая консультация", "Technical consultation"]]],
    bots: ["Боты и автоматизация", "Bots and automation", [
      ["telegram", "Telegram-бот", "Telegram bot"],
      ["max", "MAX-бот", "MAX bot"],
      ["integration", "Интеграция с CRM или таблицами", "CRM or spreadsheet integration"],
      ["automation", "Автоматизация уведомлений и заявок", "Automate notifications and inquiries"]]],
    flask: ["Flask / Python", "Flask / Python", [
      ["site", "Небольшой сайт на Flask", "Small Flask website"],
      ["logic", "Форма заявок и своя логика", "Inquiry form and custom logic"],
      ["api", "API или интеграция", "API or integration"],
      ["account", "Кабинет или оплата (отдельная смета)", "Account or payments (separate estimate)"]]],
    "ai-ready": ["AI-ready", "AI-ready", [
      ["audit", "Аудит AI-ready", "AI-ready audit"],
      ["schema", "Внедрение Schema.org и FAQ", "Implement Schema.org and FAQ"],
      ["structure", "Доработка структуры и контента", "Improve structure and content"]]]
  };
  var packages = {
    full: ["Лендинг с SEO и блоками", "Landing page with SEO"],
    integrations: ["Бот с интеграциями", "Bot with integrations"],
    start: ["Start", "Start"], pro: ["Pro", "Pro"],
    "bot-ready": ["Bot-ready", "Bot-ready"], rag: ["RAG: отдельная оценка", "RAG: separate estimate"]
  };
  var words = {
    experience: ["Опыт сотрудничества и отзывы", "Work experience and reviews"],
    experienceLead: ["Компании, с которыми я работал в разные годы. Отзывы обо мне доступны на Яндекс Картах.", "Companies I have worked with over the years. Reviews are available on Yandex Maps."],
    title: ["Коротко расскажите о задаче", "Tell me about your task"],
    lead: ["Можно без технических терминов. Напишите сразу или подготовьте текст ниже.", "No technical terms needed. Contact me directly or prepare a message below."],
    need: ["Что требуется?", "What do you need?"],
    note: ["Краткое описание (необязательно)", "Short description (optional)"],
    url: ["Ссылка на сайт или проект (необязательно)", "Website or project URL (optional)"],
    channel: ["Предпочтительный способ связи (необязательно)", "Preferred contact method (optional)"],
    any: ["Без предпочтений", "No preference"], phone: ["Телефон", "Phone"],
    prepare: ["Подготовить текст", "Prepare message"],
    copy: ["Скопировать текст", "Copy message"],
    preview: ["Текст запроса. Отправьте его самостоятельно удобным способом.", "Message draft. Send it yourself using your preferred contact method."],
    privacy: ["Текст остаётся в браузере до копирования. Ничего не отправляется автоматически. Не указывайте пароли и секреты.", "The draft stays in your browser until copied. Nothing is sent automatically. Do not enter passwords or secrets."],
    ready: ["Текст готов, но ещё не отправлен. Скопируйте и отправьте в Telegram, MAX или по email.", "Draft ready, not sent. Copy it and send via Telegram, MAX or email."],
    copied: ["Текст скопирован, но ещё не отправлен. Откройте выбранный канал и отправьте сообщение сами.", "Copied, not sent. Open your preferred contact method and send the message yourself."],
    failed: ["Копирование недоступно. Текст выделен: скопируйте его вручную и отправьте сами.", "Clipboard unavailable. The draft is selected: copy it manually and send it yourself."],
    invalid: ["Укажите публичную ссылку с https:// или http://, без логина и пароля.", "Enter a public https:// or http:// URL without a username or password."]
  };
  function en() { return /^en\b/i.test(document.documentElement.lang); }
  function word(key) { return words[key][en() ? 1 : 0]; }
  function element(tag, text, className) {
    var node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function service(root) {
    var key = (root && root.getAttribute("data-service")) || document.body.getAttribute("data-product") || "site";
    return Object.prototype.hasOwnProperty.call(services, key) ? key : "site";
  }
  function source() {
    try {
      var canonical = document.querySelector('link[rel="canonical"]');
      var url = new URL(canonical ? canonical.href : location.href);
      if (url.protocol === "https:" && /^(?:[a-z0-9-]+\.)?krivoshein\.site$/.test(url.hostname)) {
        return url.origin + url.pathname;
      }
    } catch (error) {}
    return "https://krivoshein.site/";
  }
  function goal(name, root) {
    // Respect explicit consent, including revocation after ym has been loaded.
    // Legacy landings without krvConsent retain their existing tracking policy.
    if (window.krvConsent && window.krvConsent.analytics !== true) return;
    var id = Number(window.__KRV_METRIKA_ID || (root && root.getAttribute("data-counter")));
    if (!id || typeof window.ym !== "function") return;
    try { window.ym(id, "reachGoal", name, { service: service(root), page: source() }); } catch (error) {}
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
  function bind(root) {
    if (root.dataset.krvBound) return;
    root.dataset.krvBound = "1";
    var need = root.querySelector("select");
    var note = root.querySelector("textarea, input[type='text']");
    var actions = root.querySelector(".krv-qual__actions");
    if (!need || !note || !actions) return;
    var product = service(root);
    var config = services[product];
    var options = config[2].concat([["other", "Другое", "Other"]]);
    need.replaceChildren();
    options.forEach(function (item) {
      var option = element("option");
      option.value = item[0];
      need.appendChild(option);
    });
    note.maxLength = 2000;
    note.classList.add("ym-disable-keys");
    var prefix = need.id || "krv-brief";
    var urlLabel = element("label");
    var url = element("input", "", "ym-disable-keys");
    url.id = prefix + "-url";
    url.type = "url"; url.maxLength = 500; url.autocomplete = "off";
    url.placeholder = "https://";
    urlLabel.htmlFor = url.id;
    var channelLabel = element("label");
    var preferred = element("select");
    preferred.id = prefix + "-channel";
    channelLabel.htmlFor = preferred.id;
    ["", "Telegram", "MAX", "Email", "phone"].forEach(function (value) {
      var option = element("option"); option.value = value; preferred.appendChild(option);
    });
    var noteLabel = root.querySelector('label[for="' + note.id + '"]');
    root.insertBefore(urlLabel, noteLabel);
    root.insertBefore(url, noteLabel);
    root.insertBefore(channelLabel, actions);
    root.insertBefore(preferred, actions);
    var prepare = element("button"); prepare.type = "button";
    prepare.className = "krv-qual__btn";
    actions.appendChild(prepare);
    var preview = element("div", "", "krv-brief-preview ym-hide-content"); preview.hidden = true;
    var previewLabel = element("label");
    var output = element("textarea", "", "ym-disable-keys");
    output.id = prefix + "-draft"; output.readOnly = true; output.rows = 7;
    previewLabel.htmlFor = output.id;
    var copy = element("button", "", "krv-qual__btn"); copy.type = "button";
    preview.appendChild(previewLabel); preview.appendChild(output); preview.appendChild(copy);
    root.appendChild(preview);
    var status = element("p", "", "krv-brief-status ym-hide-content");
    status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    root.appendChild(status);
    var statusKey = "";
    function tell(key) { statusKey = key; status.textContent = key ? word(key) : ""; }
    function localize() {
      document.querySelectorAll("[data-krv-text]").forEach(function (node) {
        var key = node.getAttribute("data-krv-text");
        if (words[key]) node.textContent = word(key);
      });
      options.forEach(function (item, i) { need.options[i].textContent = item[en() ? 2 : 1]; });
      urlLabel.textContent = word("url"); channelLabel.textContent = word("channel");
      preferred.options[0].textContent = word("any");
      for (var i = 1; i < preferred.options.length; i++) {
        preferred.options[i].textContent = preferred.options[i].value === "phone" ? word("phone") : preferred.options[i].value;
      }
      prepare.textContent = word("prepare"); copy.textContent = word("copy"); previewLabel.textContent = word("preview");
      tell(statusKey);
    }
    var started = false;
    function invalidate(event) {
      if (!started) { started = true; goal("brief_start", root); }
      preview.hidden = true; output.value = ""; tell("");
      if (event && event.target === need) delete root.dataset.krvPackage;
    }
    [need, note, url, preferred].forEach(function (field) {
      field.addEventListener("input", invalidate);
      field.addEventListener("change", invalidate);
    });
    function build() {
      var project = "";
      if (url.value.trim()) {
        try {
          var parsed = new URL(url.value.trim().slice(0, 500));
          if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) throw new Error("url");
          project = parsed.origin + parsed.pathname; // No secrets or tracking in query/hash.
        } catch (error) {
          url.setAttribute("aria-invalid", "true"); tell("invalid"); url.focus(); return false;
        }
      }
      url.removeAttribute("aria-invalid");
      var item = options.filter(function (o) { return o[0] === need.value; })[0] || options[0];
      var pack = packages[root.dataset.krvPackage];
      var lines = [en() ? "Hello! I'd like to discuss a task." : "Здравствуйте! Хочу обсудить задачу.",
        (en() ? "Service: " : "Направление: ") + config[en() ? 1 : 0],
        (en() ? "Source page: " : "Страница источника: ") + source(),
        (en() ? "Task: " : "Задача: ") + item[en() ? 2 : 1]];
      if (pack) lines.push((en() ? "Package: " : "Пакет: ") + pack[en() ? 1 : 0]);
      if (project) lines.push((en() ? "Project: " : "Проект: ") + project);
      if (note.value.trim()) lines.push((en() ? "Description: " : "Описание: ") + note.value.trim().slice(0, 2000));
      if (preferred.value) lines.push((en() ? "Preferred contact: " : "Предпочтительная связь: ") + preferred.selectedOptions[0].textContent);
      output.value = lines.join("\n");
      preview.hidden = false; tell("ready"); return true;
    }
    prepare.addEventListener("click", function () {
      if (build()) { goal("brief_prepare", root); output.focus(); }
    });
    copy.addEventListener("click", function () {
      // Regenerate so a draft is never stale after a language or package change.
      if (!build()) return;
      var value = output.value;
      function fallback() { output.focus(); output.select(); tell("failed"); }
      if (!navigator.clipboard || !navigator.clipboard.writeText) { fallback(); return; }
      navigator.clipboard.writeText(value).then(function () {
        tell("copied"); goal("brief_copy", root);
      }, fallback);
    });
    root.__krvSetPackage = function (key, intent) {
      if (Object.prototype.hasOwnProperty.call(packages, key)) root.dataset.krvPackage = key;
      else delete root.dataset.krvPackage;
      if (options.some(function (item) { return item[0] === intent; })) need.value = intent;
      preview.hidden = true; output.value = ""; tell("");
    };
    localize();
    new MutationObserver(localize).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  function ready() {
    var roots = document.querySelectorAll("[data-krv-brief]");
    roots.forEach(bind);
    var defaultRoot = roots[0];
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      var root = link.closest("[data-krv-brief]") || defaultRoot;
      var name = channel(link.getAttribute("href"));
      if (name) goal(name, root);
      if (link.getAttribute("href") === "#brief" && defaultRoot) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
        if (defaultRoot.__krvSetPackage) defaultRoot.__krvSetPackage(link.getAttribute("data-krv-package"), link.getAttribute("data-krv-need"));
        goal("contact_open", defaultRoot);
        // Keep an ordinary hash URL (no virtual pageview), but own this local
        // jump so Firefox cannot reset keyboard focus after scrolling.
        event.preventDefault();
        if (location.hash !== "#brief") {
          try { history.pushState(null, "", "#brief"); } catch (error) {}
        }
        var target = document.getElementById("brief") || defaultRoot;
        target.scrollIntoView({ block: "start", behavior: "auto" });
        var heading = defaultRoot.querySelector("h2");
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        }
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
