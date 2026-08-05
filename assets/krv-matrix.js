/**
 * Blue matrix rain for dark theme only (KRV landings).
 * Respects prefers-reduced-motion. Auto start/stop on theme change.
 */
(function () {
  'use strict';

  var canvas, ctx, raf = 0, cols = [], fontSize = 14, w = 0, h = 0;
  var chars = '01アイウエオカキクケコサシスセソﾀﾞﾀﾞ01<>/[]{}#%&*+-=$@';
  var running = false;

  function isDark() {
    try {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    } catch (e) {
      return false;
    }
  }

  function reducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function ensureCanvas() {
    if (canvas) return canvas;
    canvas = document.createElement('canvas');
    canvas.id = 'krv-matrix-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = [
      'position:fixed',
      'inset:0',
      'width:100%',
      'height:100%',
      'z-index:0',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity .45s ease',
      'mix-blend-mode:screen'
    ].join(';');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    return canvas;
  }

  function resize() {
    if (!canvas) return;
    w = window.innerWidth;
    h = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.ceil(w / fontSize) + 1;
    cols = new Array(n);
    for (var i = 0; i < n; i++) {
      cols[i] = Math.random() * -40;
    }
  }

  function tick() {
    if (!running || !ctx) return;
    // translucent trail
    ctx.fillStyle = 'rgba(11, 18, 32, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px "JetBrains Mono", ui-monospace, monospace';
    for (var i = 0; i < cols.length; i++) {
      var ch = chars.charAt((Math.random() * chars.length) | 0);
      var x = i * fontSize;
      var y = cols[i] * fontSize;
      // blue cascade — head brighter
      ctx.fillStyle = 'rgba(107, 168, 255, 0.55)';
      ctx.fillText(ch, x, y);
      ctx.fillStyle = 'rgba(49, 95, 232, 0.35)';
      ctx.fillText(ch, x, y - fontSize);
      if (y > h && Math.random() > 0.975) {
        cols[i] = 0;
      } else {
        cols[i] += 0.85 + Math.random() * 0.35;
      }
    }
    raf = window.requestAnimationFrame(tick);
  }

  function start() {
    if (running || reducedMotion() || !isDark()) return;
    ensureCanvas();
    resize();
    canvas.style.opacity = '0.22';
    // seed dark base once
    ctx.fillStyle = 'rgba(11, 18, 32, 0.15)';
    ctx.fillRect(0, 0, w, h);
    running = true;
    raf = window.requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
    if (canvas) {
      canvas.style.opacity = '0';
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
      }
    }
  }

  function sync() {
    if (isDark() && !reducedMotion()) start();
    else stop();
  }

  function boot() {
    // keep content above matrix
    try {
      var b = document.body;
      if (b && getComputedStyle(b).position === 'static') {
        b.style.position = 'relative';
      }
      if (b) b.style.zIndex = '1';
    } catch (e) {}

    sync();
    window.addEventListener('resize', function () {
      if (running) resize();
    }, { passive: true });

    // observe theme attribute changes
    try {
      var mo = new MutationObserver(sync);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) {}

    // theme toggle buttons may set localStorage then attribute
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.closest && (t.closest('.krv-theme-btn') || t.closest('[data-theme-toggle]'))) {
        setTimeout(sync, 30);
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
