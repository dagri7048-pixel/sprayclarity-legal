/* SprayClarity · landing: apariciones, 3D, contadores, línea de fundador e idioma sugerido.
   Sin cookies ni analítica; localStorage solo recuerda que cerraste el aviso de idioma. */
(function () {
  'use strict';
  window.SCok = 1;
  var d = document, root = d.documentElement, SC = window.SC || {};
  var mm = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mm('(prefers-reduced-motion: reduce)'), fine = mm('(hover: hover) and (pointer: fine)');
  var hasIO = 'IntersectionObserver' in window, animOk = root.classList.contains('js') && !reduce && hasIO;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var ls = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} },
  };
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* plataforma: la insignia de tu teléfono va primero y el botón del encabezado abre tu tienda */
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  root.classList.add(ios ? 'is-ios' : android ? 'is-android' : 'is-desk');
  var storeUrl = function (k) { var a = $('.badges a[data-store="' + k + '"]'); return a ? a.href : null; };
  var mine = ios ? storeUrl('ios') : android ? storeUrl('android') : null;
  if (mine) $$('[data-cta]').forEach(function (a) { a.href = mine; a.rel = 'noopener'; });

  /* apariciones al hacer scroll */
  var show = function (el) { el.classList.add('in'); };
  var anim = $$('[data-anim]');
  if (!animOk) anim.forEach(show);
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    anim.forEach(function (el) { io.observe(el); });
  }

  /* portada: el teléfono sube cuando su captura ya cargó */
  var ready = function () { root.classList.add('ready'); };
  var heroImg = $('.device img');
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', ready, { once: true });
    heroImg.addEventListener('error', ready, { once: true });
    setTimeout(ready, 1200);
  } else raf(ready);

  /* aguja del medidor: entra al verse (la de la portada, sincronizada con su tarjeta) */
  var gauges = $$('.gauge');
  if (!animOk) gauges.forEach(function (g) { g.classList.add('go'); });
  else {
    var gio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var g = e.target; gio.unobserve(g);
        setTimeout(function () { g.classList.add('go'); }, g.closest('.hero') ? 1000 : 150);
      });
    }, { threshold: 0.5 });
    gauges.forEach(function (g) { gio.observe(g); });
  }

  /* cifras que cuentan hasta su valor (respeta el separador de miles de cada idioma) */
  var countUp = function (el) {
    var m = el.textContent.match(/^(\D*)(\d[\d.,\s  ]*\d|\d)(.*)$/);
    if (!m) return;
    var n = parseInt(m[2].replace(/\D/g, ''), 10), sep = (m[2].match(/\D/) || [''])[0];
    var fmt = function (v) { var s = String(v); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s; };
    var num = d.createElement('span');
    el.textContent = m[1]; el.appendChild(num);
    if (m[3]) { var suf = d.createElement('i'); suf.textContent = m[3]; if (m[3].indexOf('★') > -1) suf.className = 'st'; el.appendChild(suf); }
    if (!animOk) { num.textContent = fmt(n); return; }
    var t0 = 0, dur = n > 100 ? 1700 : 1000;
    num.textContent = fmt(0);
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      num.textContent = fmt(Math.round(n * e));
      if (p < 1) raf(step);
    };
    raf(step);
  };
  var counts = $$('[data-count]');
  if (!animOk) counts.forEach(countUp);
  else {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cio.unobserve(e.target); countUp(e.target); } });
    }, { threshold: 0.6 });
    counts.forEach(function (c) { cio.observe(c); });
  }

  /* encabezado: fondo al bajar; el botón de descarga aparece cuando las insignias de la portada salen de vista */
  var nav = $('[data-nav]'), heroB = $('.hero-b');
  if (nav && heroB && hasIO) {
    new IntersectionObserver(function (es) {
      var e = es[0]; nav.classList.toggle('past', !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(heroB);
  } else if (nav) nav.classList.add('past');

  /* menú: marca la sección que estás leyendo (las que no están en el menú lo dejan sin marca) */
  var links = $$('.links a'), heroSec = $('.hero');
  var secs = links.map(function (a) { return d.getElementById(a.hash.slice(1)); });
  if (hasIO && links.length) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = secs.indexOf(e.target);
        links.forEach(function (a, j) { a.classList.toggle('on', j === i); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section').forEach(function (s) { spy.observe(s); });
  }

  /* 3D: el teléfono de la portada sigue al puntero (solo mouse; en el teléfono se mece solo) */
  var rig = $('.rig');
  if (rig && heroSec && fine && !reduce) {
    var tx = 0, ty = 0, cx = 0, cy = 0, run = 0;
    var tick = function () {
      cx = lerp(cx, tx, 0.07); cy = lerp(cy, ty, 0.07);
      rig.style.setProperty('--ry', (-16 + cx).toFixed(2) + 'deg');
      rig.style.setProperty('--rx', (7 + cy).toFixed(2) + 'deg');
      run = (Math.abs(cx - tx) > 0.01 || Math.abs(cy - ty) > 0.01) ? raf(tick) : 0;
    };
    heroSec.addEventListener('pointermove', function (e) {
      var r = heroSec.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 20;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 12;
      if (!run) run = raf(tick);
    });
    heroSec.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!run) run = raf(tick); });
  }

  /* 3D: tarjetas que se inclinan bajo el puntero, con un brillo que lo sigue */
  if (fine && !reduce) $$('[data-tilt]').forEach(function (el) {
    var box = null, tx = 0, ty = 0, cx = 0, cy = 0, run = 0;
    var tick = function () {
      cx = lerp(cx, tx, 0.14); cy = lerp(cy, ty, 0.14);
      el.style.setProperty('--ty', cx.toFixed(2) + 'deg');
      el.style.setProperty('--tx', cy.toFixed(2) + 'deg');
      run = (Math.abs(cx - tx) > 0.02 || Math.abs(cy - ty) > 0.02) ? raf(tick) : 0;
    };
    el.addEventListener('pointerenter', function () { box = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', function (e) {
      if (!box) box = el.getBoundingClientRect();
      var px = (e.clientX - box.left) / box.width, py = (e.clientY - box.top) / box.height;
      tx = (px - 0.5) * 10; ty = -(py - 0.5) * 10;
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      if (!run) run = raf(tick);
    });
    el.addEventListener('pointerleave', function () { tx = 0; ty = 0; box = null; if (!run) run = raf(tick); });
  });

  /* scroll: el mapa se endereza al entrar y la foto se desplaza más lento que la página */
  var stage = $('[data-tiltscroll]'), par = $$('[data-parallax]'), pend = false;
  var onScroll = function () {
    pend = false;
    if (nav) nav.classList.toggle('scrolled', (window.pageYOffset || 0) > 8);
    if (reduce) return;
    var vh = window.innerHeight || 800;
    if (stage) {
      var r = stage.getBoundingClientRect();
      stage.style.setProperty('--p', Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.7))).toFixed(3));
    }
    par.forEach(function (el) {
      var b = el.getBoundingClientRect();
      if (b.top > vh || b.bottom < 0) return;
      var q = (b.top + b.height / 2 - vh / 2) / (vh / 2 + b.height / 2);
      el.style.setProperty('--py', (q * -7).toFixed(2) + '%');
    });
  };
  window.addEventListener('scroll', function () { if (!pend) { pend = true; raf(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { if (!pend) { pend = true; raf(onScroll); } });
  onScroll();

  /* línea de fundador: solo mientras dure, con la fecha de la configuración remota (sin precios) */
  var fe = $('[data-founder]');
  if (fe && SC.founder && window.fetch) {
    window.fetch('/app-config.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      var fu = c && c.founder_until;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fu || '')) return;
      var n = new Date(), pad = function (v) { return (v < 10 ? '0' : '') + v; };
      if (n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate()) > fu) return;
      var p = fu.split('-').map(Number), txt;
      try { txt = new Intl.DateTimeFormat(SC.locale || 'es', { day: 'numeric', month: 'long' }).format(new Date(p[0], p[1] - 1, p[2])); } catch (e) { txt = fu; }
      fe.textContent = SC.founder.replace('{d}', txt);
      fe.hidden = false;
    }).catch(function () {});
  }

  /* idioma: si tu navegador está en otro de los cuatro idiomas, te ofrece esa versión (una vez) */
  var sug = $('[data-sug]');
  if (sug && SC.sug && !ls.get('sc-lang-ok')) {
    var refHost = '';
    try { refHost = d.referrer ? new URL(d.referrer).host : ''; } catch (e) {}
    var pref = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase().slice(0, 2);
    if (refHost !== location.host && pref !== SC.lang && SC.sug[pref]) {
      var a = $('a', sug);
      a.textContent = SC.sug[pref].msg; a.href = SC.sug[pref].url; a.lang = pref; a.hreflang = pref;
      sug.hidden = false;
      var ok = function () { ls.set('sc-lang-ok', '1'); };
      a.addEventListener('click', ok);
      $('button', sug).addEventListener('click', function () { sug.hidden = true; ok(); });
    }
  }
  $$('a[hreflang]').forEach(function (a) { a.addEventListener('click', function () { ls.set('sc-lang-ok', '1'); }); });

  /* menú de idiomas: se cierra al tocar fuera o con Escape */
  var langs = $('details.langs');
  if (langs) {
    d.addEventListener('click', function (e) { if (langs.open && !langs.contains(e.target)) langs.open = false; });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && langs.open) { langs.open = false; $('summary', langs).focus(); } });
  }
})();
