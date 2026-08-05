/**
 * KRV premium pack: sticky subnav + FAQ accordion
 * (no lead forms)
 */
(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function initSubnav() {
    var nav = qs(".krv-subnav");
    if (!nav) return;
    var links = qsa('a[href^="#"]', nav);
    if (!links.length) return;

    var map = links
      .map(function (a) {
        var id = (a.getAttribute("href") || "").replace(/^#/, "");
        if (!id) return null;
        var el = document.getElementById(id);
        return el ? { a: a, el: el, id: id } : null;
      })
      .filter(Boolean);

    function setActive(id) {
      links.forEach(function (a) {
        var href = a.getAttribute("href") || "";
        a.classList.toggle("is-active", href === "#" + id);
      });
    }

    if ("IntersectionObserver" in window && map.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.target && entry.target.id) {
              setActive(entry.target.id);
            }
          });
        },
        { rootMargin: "-35% 0px -50% 0px", threshold: [0, 0.1, 0.25] }
      );
      map.forEach(function (m) {
        io.observe(m.el);
      });
    }

    links.forEach(function (a) {
      a.addEventListener("click", function () {
        var id = (a.getAttribute("href") || "").replace(/^#/, "");
        if (id) setActive(id);
      });
    });
  }

  function initFaq() {
    var root = qs(".krv-faq");
    if (!root) return;
    qsa("details", root).forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        qsa("details", root).forEach(function (other) {
          if (other !== d) other.open = false;
        });
      });
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    try { initSubnav(); } catch (e) { console.error("[krv] subnav", e); }
    try { initFaq(); } catch (e) { console.error("[krv] faq", e); }
  });
})();
