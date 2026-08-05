/*! KRV motion - scroll reveal, reduced-motion safe */
(function () {
  'use strict';
  try {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nodes = document.querySelectorAll('.krv-reveal');
    if (!nodes.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    nodes.forEach(function (el) { io.observe(el); });
  } catch (e) {}
})();
