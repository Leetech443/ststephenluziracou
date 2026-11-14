(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll reveal ----
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (e) { io.observe(e); });
  } else {
    rv.forEach(function (e) { e.classList.add('in'); });
  }
  setTimeout(function () { rv.forEach(function (e) { e.classList.add('in'); }); }, 2500);

  // ---- Hero slideshow + rotating headline ----
  var sl = $$('.slide'), h = $('#rot'), i = 0, w = 0,
      words = ['Passion for God', 'Establishing the Kingdom', 'Empowering Lives'];
  if (!calm && sl.length) {
    setInterval(function () {
      sl[i].classList.remove('on');
      i = (i + 1) % sl.length;
      sl[i].classList.add('on');
    }, 5500);
  }
  if (!calm && h) {
    setInterval(function () {
      h.classList.add('out');
      setTimeout(function () { w = (w + 1) % words.length; h.textContent = words[w]; h.classList.remove('out'); }, 500);
    }, 3600);
  }

  // ---- Plan-your-visit bubble ----
  var bub = $('#bub'), pan = $('#pan');
  if (bub && pan) {
    bub.onclick = function () {
      var o = pan.classList.toggle('open');
      bub.setAttribute('aria-expanded', o);
    };
  }

  // ---- Placeholder forms ----
  $$('form[data-ok]').forEach(function (f) {
    f.onsubmit = function (e) {
      e.preventDefault();
      f.innerHTML = '<strong>' + f.dataset.ok + '</strong>';
    };
  });

  // ---- Back-to-top + header scroll class (one listener, header may arrive later) ----
  var topBtn = $('#top');
  var hdrEl = null;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (topBtn) topBtn.classList.toggle('show', y > 600);
    if (hdrEl) hdrEl.classList.toggle('solid', y > 60);
  }, { passive: true });
  if (topBtn) topBtn.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ---- Carousels ----
  function autoCarousel(id) {
    var tr = document.getElementById(id); if (!tr) return;
    var items = tr.children, dots = document.createElement('div'), pages = 1, cur = 0, timer, raf;
    dots.className = 'dots'; tr.parentNode.insertBefore(dots, tr.nextSibling);
    function m() {
      var max = tr.scrollWidth - tr.clientWidth;
      return { max: max, step: items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : tr.clientWidth };
    }
    function go(k) { var x = m(); tr.scrollTo({ left: Math.min(k * x.step, x.max), behavior: 'smooth' }); }
    function mark() {
      var x = m();
      cur = tr.scrollLeft >= x.max - 4 ? pages - 1 : Math.round(tr.scrollLeft / x.step);
      cur = Math.max(0, Math.min(cur, pages - 1));
      for (var k = 0; k < dots.children.length; k++) dots.children[k].classList.toggle('on', k === cur);
    }
    function build() {
      var x = m(); pages = x.max > 4 ? Math.round(x.max / x.step) + 1 : 1;
      dots.innerHTML = ''; dots.style.display = pages < 2 ? 'none' : 'flex';
      for (var k = 0; k < pages; k++) (function (n) {
        var b = document.createElement('button'); b.type = 'button';
        b.setAttribute('aria-label', 'Go to slide ' + (n + 1));
        b.onclick = function () { go(n); restart(); };
        dots.appendChild(b);
      })(k);
      mark();
    }
    function stop() { clearInterval(timer); }
    function start() { stop(); if (pages < 2 || calm) return; timer = setInterval(function () { go((cur + 1) % pages); }, 4000); }
    function restart() { stop(); start(); }
    tr.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark); }, { passive: true });
    ['mouseenter', 'touchstart', 'focusin'].forEach(function (e) { tr.addEventListener(e, stop, { passive: true }); });
    ['mouseleave', 'touchend', 'focusout'].forEach(function (e) { tr.addEventListener(e, start, { passive: true }); });
    window.addEventListener('resize', function () { build(); restart(); });
    window.addEventListener('load', function () { build(); restart(); });
    build(); start();
  }

  function loopCarousel(id) {
    var tr = document.getElementById(id); if (!tr) return;
    var real = Array.prototype.slice.call(tr.children), n = real.length; if (n < 2) return;
    var clone = real[0].cloneNode(true), cs = getComputedStyle(real[0]), cur = 0, timer, raf;
    clone.setAttribute('aria-hidden', 'true'); clone.tabIndex = -1;
    ['backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat'].forEach(function (p) { clone.style[p] = cs[p]; });
    tr.appendChild(clone);
    var dots = document.createElement('div'); dots.className = 'dots'; tr.parentNode.insertBefore(dots, tr.nextSibling);
    function step() { return real[1].offsetLeft - real[0].offsetLeft; }
    function go(k) { tr.scrollTo({ left: k * step(), behavior: 'smooth' }); }
    for (var k = 0; k < n; k++) (function (j) {
      var b = document.createElement('button'); b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (j + 1));
      b.onclick = function () { go(j); restart(); };
      dots.appendChild(b);
    })(k);
    function mark() {
      var s = step();
      if (tr.scrollLeft >= n * s - 2) tr.scrollLeft = 0;
      cur = Math.round(tr.scrollLeft / s) % n;
      for (var k = 0; k < n; k++) dots.children[k].classList.toggle('on', k === cur);
    }
    function stop() { clearInterval(timer); }
    function start() { stop(); if (calm) return; timer = setInterval(function () { go(cur + 1); }, 4000); }
    function restart() { stop(); start(); }
    tr.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark); }, { passive: true });
    ['mouseenter', 'touchstart', 'focusin'].forEach(function (e) { tr.addEventListener(e, stop, { passive: true }); });
    ['mouseleave', 'touchend', 'focusout'].forEach(function (e) { tr.addEventListener(e, start, { passive: true }); });
    window.addEventListener('resize', mark); mark(); start();
  }

  autoCarousel('evCar');
  loopCarousel('minCar');

  // ---- Header-dependent bindings (run after layout.js injects the header) ----
  var SITE = 'yourchurch.org';

  function bindHeader() {
    hdrEl = $('.hdr');
    if (hdrEl) hdrEl.classList.toggle('solid', window.scrollY > 60);

    var nav = $('#nav'), mb = $('#mb');
    if (mb && nav) {
      mb.onclick = function () {
        var o = nav.classList.toggle('open');
        mb.setAttribute('aria-expanded', o);
      };
      nav.onclick = function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); };
    }

    var sr = $('#sr'), sq = $('#sq'), sb = $('#sb'), sx = $('#sx'), sf = $('#sf');
    if (sr && sb) {
      sb.onclick = function () { sr.hidden = false; if (sq) sq.focus(); };
      if (sx) sx.onclick = function () { sr.hidden = true; };
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') sr.hidden = true; });
      if (sf) sf.onsubmit = function (e) {
        e.preventDefault();
        var q = sq.value.trim();
        if (q) window.open('https://www.google.com/search?q=site:' + SITE + '+' + encodeURIComponent(q), '_blank');
      };
    }
  }

  if (document.documentElement.hasAttribute('data-layout-ready')) bindHeader();
  else document.addEventListener('layout:ready', bindHeader, { once: true });
})();