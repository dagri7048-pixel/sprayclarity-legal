// Genera la landing de sprayclarity.com en 4 idiomas: / (es) · /pt/ · /en/ · /fr/
// + imágenes optimizadas en /assets/landing/img (WebP) a partir de las capturas reales de la app.
// La carpeta _src no se publica (GitHub Pages con Jekyll ignora las carpetas que empiezan con "_").
// Uso: node _src/landing/build.js            → páginas (y las imágenes que falten)
//      node _src/landing/build.js --img      → además rehace todas las imágenes
// La política de privacidad vive en /privacidad/ (copia exacta de la antigua portada). La portada nueva
// redirige los enlaces viejos /#es /#en /#pt /#fr a /privacidad/#…
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const T = require('./textos.js');
const REPO = path.join(__dirname, '..', '..');
const DC = path.join(REPO, '..');
const RAW = path.join(DC, 'capturas-tienda-1.9', 'raw');
const WWW = path.join(DC, 'ventana-fumigacion-app', 'www');
const INS = path.join(DC, 'campana-pro', 'assets', 'insignias');
const FOTOS = path.join(DC, 'campana-pro', 'carrusel-v2', 'fotos');
const A = path.join(REPO, 'assets', 'landing'), IMG = path.join(A, 'img');
const SITE = 'https://sprayclarity.com', V = '3';
const LANGS = ['es', 'pt', 'en', 'fr'];
const REHACER = process.argv.includes('--img');
fs.mkdirSync(path.join(IMG, 'badges'), { recursive: true });

/* ── imágenes ── */
const ff = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args]);
const hacer = (out, fn) => { if (REHACER || !fs.existsSync(out)) { fn(out); } };
for (const l of LANGS) {
  hacer(path.join(IMG, `hoy-${l}.webp`), (o) => ff(['-i', path.join(RAW, l, '01-hoy.png'), '-vf', 'scale=720:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '82', o]));
  hacer(path.join(IMG, `mapa-${l}.webp`), (o) => ff(['-i', path.join(RAW, l, '04-mapa.png'), '-vf', 'crop=1320:1150:0:600,scale=1200:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '78', o]));
}
for (const m of ['m-dron', 'm-terrestre', 'm-mochila', 'm-motor', 'm-mapeo']) hacer(path.join(IMG, `${m}.webp`), (o) => ff(['-i', path.join(WWW, 'icons', `${m}.png`), '-vf', 'scale=192:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '90', o]));
hacer(path.join(IMG, 'icon-96.webp'), (o) => ff(['-i', path.join(WWW, 'icons', 'app-icon.png'), '-vf', 'scale=96:96:flags=lanczos', '-c:v', 'libwebp', '-quality', '92', o]));
for (const s of [180, 192]) hacer(path.join(IMG, `icon-${s}.png`), (o) => ff(['-i', path.join(WWW, 'icons', 'app-icon.png'), '-vf', `scale=${s}:${s}:flags=lanczos`, o]));
hacer(path.join(IMG, 'dron.webp'), (o) => ff(['-i', path.join(FOTOS, 'dron.jpg'), '-c:v', 'libwebp', '-quality', '76', o]));
hacer(path.join(IMG, 'fono.webp'), (o) => ff(['-i', path.join(FOTOS, 'fono-b52.jpg'), '-c:v', 'libwebp', '-quality', '76', o]));
/* insignias oficiales de Apple y Google, sin modificar (campana-pro/assets/insignias) */
const BADGE = { es: ['app-store_es-mx.svg', 'google-play_es-419.png'], pt: ['app-store_pt-br.svg', 'google-play_pt-br.png'], en: ['app-store_en.svg', 'google-play_en.png'], fr: ['app-store_fr.svg', 'google-play_fr.png'] };
/* ancho de la insignia de Apple a 54 px de alto, según su viewBox (la francesa es más ancha) */
const asW = (f) => { const m = fs.readFileSync(path.join(INS, f), 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return m ? Math.round(54 * m[1] / m[2]) : 162; };
for (const l of LANGS) for (const f of BADGE[l]) { const o = path.join(IMG, 'badges', f); if (!fs.existsSync(o)) fs.copyFileSync(path.join(INS, f), o); }
/* política de privacidad: se mueve a /privacidad/ una sola vez (copia exacta de la portada vieja) */
const PRIV = path.join(REPO, 'privacidad', 'index.html');
if (!fs.existsSync(PRIV)) {
  const viejo = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
  if (!/Política de Privacidad/.test(viejo)) throw new Error('la portada actual no es la política: no se copia nada');
  fs.mkdirSync(path.dirname(PRIV), { recursive: true }); fs.writeFileSync(PRIV, viejo, 'utf8');
  console.log('privacidad/index.html creado (copia de la portada vieja)');
}
/* anclas de la política: la portada vieja ERA la política y las tiendas tienen registradas /#es…/#fr y /#eliminar-datos
   (Play: URL de borrado de datos; App Store Connect: URL de opciones de privacidad) → la portada nueva las redirige todas */
const PRIV_IDS = [...fs.readFileSync(PRIV, 'utf8').matchAll(/\sid="([a-z][a-z0-9-]*)"/g)].map((m) => m[1]);

/* ── piezas ── */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ICO = {
  rafaga: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h7"/></svg>',
  inversion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 18h18"/><path d="M8 9.5c1.5 1 2.5 1 4 0s2.5-1 4 0"/><path d="M8 13.5c1.5 1 2.5 1 4 0s2.5-1 4 0"/></svg>',
  deltat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/></svg>',
  lluvia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15a4 4 0 0 1 .4-8A5 5 0 0 1 17 8.6 3.4 3.4 0 0 1 17 15z"/><path d="M9 18l-1 3"/><path d="M13 18l-1 3"/><path d="M17 18l-1 3"/></svg>',
  kp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/><path d="M19.5 3.5a5 5 0 0 1 1.5 3.5"/><path d="M4.5 3.5A5 5 0 0 0 3 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.5 5.8 21.1l1.6-7L2 9.3l7.1-.7z"/></svg>',
  modelos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>',
  offline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5.5 12.4a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1"/></svg>',
  idioma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h9"/><path d="M8.5 3v2"/><path d="M11 5c-1 4-3.5 7-7 9"/><path d="M6 9c1.5 2 3.5 3.5 6 4.5"/><path d="M13 21l4-9 4 9"/><path d="M14.5 18h5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
};
/* el medidor de la app (mismas medidas que ring() de la app), con aguja animable */
const gauge = (cls) => `<svg class="gauge ${cls || ''}" viewBox="0 0 120 86" aria-hidden="true"><path class="arc g" d="M12 60A48 48 0 0 1 36 18.4"/><path class="arc a" d="M36 18.4A48 48 0 0 1 84 18.4"/><path class="arc r" d="M84 18.4A48 48 0 0 1 108 60"/><g class="needle"><line x1="60" y1="60" x2="30.5" y2="41.5"/></g><circle class="hub" cx="60" cy="60" r="13"/><path class="tick" d="M53.5 60.2l4.4 4.4 8.6-9.2"/></svg>`;
const badges = (l, cls) => {
  const [as, gp] = BADGE[l], alt = { es: ['Descárgalo en el App Store', 'Disponible en Google Play'], pt: ['Baixar na App Store', 'Disponível no Google Play'], en: ['Download on the App Store', 'Get it on Google Play'], fr: ['Télécharger dans l’App Store', 'Disponible sur Google Play'] }[l];
  const play = `https://play.google.com/store/apps/details?id=com.planoalto.sprayclarity&amp;referrer=utm_source%3Dsitio-${l}`;
  return `<div class="badges ${cls || ''}"><a href="https://apps.apple.com/app/id6804949973" rel="noopener" data-store="ios"><img src="/assets/landing/img/badges/${as}" alt="${alt[0]}" width="${asW(as)}" height="54"></a><a href="${play}" rel="noopener" data-store="android"><img src="/assets/landing/img/badges/${gp}" alt="${alt[1]}" width="140" height="54"></a></div>`;
};
const strip = (s) => `<div class="strip" data-anim><div class="strip-h"><b>${s.title}</b><span>${s.local} · ${s.clock}</span></div><div class="strip-cols">` +
  s.hours.map((h, i) => `<div class="col ${h[1]}${i === 0 ? ' now' : ''}" style="--i:${i}"><span class="hr">${h[0]}</span><div class="bars"><i class="sus" style="--h:${Math.min(1, h[2] / s.max).toFixed(3)}"><em>${h[2]}</em></i><i class="gus" style="--h:${Math.min(1, h[3] / s.max).toFixed(3)}"><em>${h[3]}</em></i></div><span class="tmp">${h[4]}</span></div>`).join('') +
  `</div><div class="strip-leg"><span class="lg g">${s.legend[0]}</span><span class="lg a">${s.legend[1]}</span><span class="lg r">${s.legend[2]}</span><span class="note">${s.note}</span></div></div>`;
const vcard = (d) => `<div class="vcard" data-anim><div class="vtop">${gauge('big')}<div><b class="vbig">${d.verdict}</b><span class="vall">${d.all}</span></div></div><div class="vwin"><span class="mono">${d.winL}</span><p>${d.win}</p></div><div class="vf">` +
  d.f.map((f) => `<div><span class="mono">${f[0]}</span><b>${f[1]} <small>${f[2]}</small></b><span class="rg">${f[3]}</span></div>`).join('') + '</div></div>';
const factors = (fs_) => '<div class="fgrid">' + fs_.map((f, i) => `<div class="fc ${f[4]}" data-anim style="--i:${i}" data-tilt><span class="fk mono">${f[0]}</span><i class="dot"></i><b class="fv">${f[1]}${f[2] ? ` <small>${f[2]}</small>` : ''}</b><span class="fr">${f[3]}</span></div>`).join('') + '</div>';
const lock = (k) => `<div class="lockphone" data-anim><div class="lk"><div class="lk-clock">${k.clock}</div><div class="lk-date">${k.date}</div><div class="lk-list">` +
  k.n.map((n, i) => `<div class="ntf" style="--i:${k.n.length - 1 - i}"><div class="nh"><img src="/assets/landing/img/icon-96.webp" width="24" height="24" alt=""><span>${k.app}</span><time>${n[0]}</time></div><b>${n[1]}</b><p>${n[2]}</p></div>`).join('') + '</div></div></div>';
const pins = (ps) => ps.map((p, i) => `<span class="pin ${p[2]}" style="left:${(p[0] / 1320 * 100).toFixed(2)}%;top:${((p[1] - 600) / 1150 * 100).toFixed(2)}%;--i:${i}"></span>`).join('');

function pagina(l) {
  const t = T[l], d = t.data, root = l === 'es';
  const url = SITE + t.path, og = `${SITE}/assets/landing/og-${l}.jpg`;
  const alt = LANGS.map((x) => `<link rel="alternate" hreflang="${T[x].lang}" href="${SITE}${T[x].path}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${SITE}/">`;
  const langMenu = LANGS.map((x) => `<a href="${T[x].path}" hreflang="${T[x].lang}" lang="${T[x].lang}"${x === l ? ' aria-current="page"' : ''}>${{ es: 'Español', pt: 'Português', en: 'English', fr: 'Français' }[x]}</a>`).join('');
  const sug = {}; LANGS.forEach((x) => { sug[x] = { url: T[x].path, msg: T[x].suggest }; });
  const ld = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SprayClarity', operatingSystem: 'Android, iOS', applicationCategory: 'UtilitiesApplication', description: t.meta.desc, url, inLanguage: t.lang, image: og, publisher: { '@type': 'Organization', name: 'Plano Alto' }, downloadUrl: ['https://play.google.com/store/apps/details?id=com.planoalto.sprayclarity', 'https://apps.apple.com/app/id6804949973'] };
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.desc)}">
<link rel="canonical" href="${url}">
${alt}
<meta property="og:type" content="website"><meta property="og:site_name" content="SprayClarity"><meta property="og:locale" content="${t.ogLocale}">
<meta property="og:title" content="${esc(t.meta.ogTitle)}"><meta property="og:description" content="${esc(t.meta.ogDesc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(t.meta.ogTitle)}"><meta name="twitter:description" content="${esc(t.meta.ogDesc)}"><meta name="twitter:image" content="${og}">
<meta name="theme-color" content="#0B1510"><meta name="color-scheme" content="dark">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/landing/img/icon-192.png"><link rel="apple-touch-icon" href="/assets/landing/img/icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600&display=swap">
<link rel="preload" as="image" href="/assets/landing/img/hoy-${l}.webp" type="image/webp">
<link rel="stylesheet" href="/assets/landing/landing.css?v=${V}">
${root ? `<script>/* enlaces viejos a la política (antes era la portada), también las URL de borrado de datos de las tiendas */if(/^#(${PRIV_IDS.join('|')})$/.test(location.hash))location.replace("/privacidad/"+location.hash);</script>` : ''}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script>window.SC=${JSON.stringify({ lang: l, founder: t.planes.founder, locale: t.lang, sug })};document.documentElement.classList.add('js');setTimeout(function(){if(!window.SCok)document.documentElement.classList.remove('js')},3500);</script>
</head>
<body>
<a class="skip" href="#main">${t.nav.skip}</a>
<header class="nav" data-nav>
  <div class="wrap navin">
    <a class="brand" href="${t.path}" aria-label="SprayClarity"><img src="/assets/landing/img/icon-96.webp" width="36" height="36" alt=""><span>Spray<b>Clarity</b></span></a>
    <nav class="links"><a href="#como">${t.nav.como}</a><a href="#mapa">${t.nav.mapa}</a><a href="#alertas">${t.nav.alertas}</a><a href="#pro">${t.nav.pro}</a><a href="#preguntas">${t.nav.faq}</a></nav>
    <div class="navr">
      <details class="langs"><summary aria-label="${t.foot.lang}">${l.toUpperCase()}</summary><div class="langs-m">${langMenu}</div></details>
      <a class="btn sm" href="#descargar" data-cta>${t.nav.cta}</a>
    </div>
  </div>
</header>
<div class="sug" data-sug hidden><span></span><a href="#"></a><button type="button" aria-label="×">×</button></div>
<main id="main">

<section class="hero">
  <div class="aurora" aria-hidden="true"></div>
  <div class="field" aria-hidden="true"><i></i></div>
  <div class="wrap hero-g">
    <div class="hero-t">
      <p class="eyebrow" data-anim>${t.hero.eye}</p>
      <h1 data-anim style="--i:1">${t.hero.h1}</h1>
      <p class="lead" data-anim style="--i:2">${t.hero.sub}</p>
      <div data-anim style="--i:3">${badges(l, 'hero-b')}</div>
      <ul class="micro" data-anim style="--i:4">${t.hero.micro.map((m) => `<li>${ICO.check}${m}</li>`).join('')}</ul>
    </div>
    <div class="scene" data-scene>
      <div class="rig">
        <figure class="device"><img src="/assets/landing/img/hoy-${l}.webp" width="720" height="1564" alt="${esc(t.hero.alt)}" fetchpriority="high"></figure>
        <div class="chip c-verdict${d.hoy.verdict.length > 14 ? ' long' : ''}">${gauge('mini')}<div><b>${d.hoy.verdict}</b><span>${d.hoy.all}</span></div></div>
        <div class="chip c-win"><span class="mono">${d.hoy.winL}</span><p>${d.hoy.win}</p></div>
        ${d.hoy.f.map((f, i) => `<div class="chip c-f c-f${i + 1}"><span class="mono">${f[0]}</span><b>${f[1]}<small> ${f[2]}</small></b></div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="proof">
  <div class="wrap proof-g">${t.proof.map((p, i) => `<div class="pf" data-anim style="--i:${i}"><b data-count="${p[0]}">${p[0]}</b><span>${p[1]}</span></div>`).join('')}</div>
</section>

<section class="sec prob" id="problema">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.prob.eye}</p><h2>${t.prob.h2}</h2><p class="lead">${t.prob.sub}</p></div>
    <div class="kgrid">${t.prob.items.map((k, i) => `<article class="kc k-${k[0]}" data-anim style="--i:${i}" data-tilt><span class="ki">${ICO[k[0]]}</span><h3>${k[1]}</h3><p>${k[2]}</p></article>`).join('')}</div>
  </div>
</section>

<section class="sec como" id="como">
  <div class="wrap como-g">
    <div class="como-t">
      <div class="sh left" data-anim><p class="eyebrow">${t.como.eye}</p><h2>${t.como.h2}</h2></div>
      <ol class="steps">${t.como.steps.map((s, i) => `<li data-anim style="--i:${i}"><span class="sn">${i + 1}</span><div><h3>${s[0]}</h3><p>${s[1]}</p></div></li>`).join('')}</ol>
    </div>
    <figure class="photo" data-anim data-parallax><img src="/assets/landing/img/fono.webp" width="1080" height="1890" alt="" loading="lazy"></figure>
  </div>
</section>

<section class="sec ver" id="veredicto">
  <div class="wrap ver-g">
    <div class="ver-t">
      <div class="sh left" data-anim><p class="eyebrow">${t.ver.eye}</p><h2>${t.ver.h2}</h2><p class="lead">${t.ver.sub}</p></div>
      <ul class="ticks" data-anim style="--i:1">${t.ver.points.map((p) => `<li>${ICO.check}${p}</li>`).join('')}</ul>
    </div>
    <div class="ver-v">${vcard(d.hoy)}${strip(d.strip)}</div>
  </div>
</section>

<section class="sec porque" id="porque">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.porque.eye}</p><h2>${t.porque.h2}</h2><p class="lead">${t.porque.sub}</p></div>
    ${factors(d.factors)}
  </div>
</section>

<section class="sec mapa" id="mapa">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.mapa.eye}</p><h2>${t.mapa.h2}</h2><p class="lead">${t.mapa.sub}</p></div>
    <div class="mapstage" data-tiltscroll>
      <figure class="mapwrap" data-anim><img src="/assets/landing/img/mapa-${l}.webp" width="1200" height="1046" alt="${esc(t.mapa.alt)}" loading="lazy">${pins(d.pins)}
        <figcaption class="maplegend"><span class="lg g">${t.mapa.legend[0]}</span><span class="lg a">${t.mapa.legend[1]}</span><span class="lg r">${t.mapa.legend[2]}</span></figcaption></figure>
    </div>
  </div>
</section>

<section class="sec alertas" id="alertas">
  <div class="wrap al-g">
    <div class="al-v">${lock(d.lock)}</div>
    <div class="al-t">
      <div class="sh left" data-anim><p class="eyebrow pro-eye">${t.alertas.eye}</p><h2>${t.alertas.h2}</h2><p class="lead">${t.alertas.sub}</p></div>
      <ul class="ticks" data-anim style="--i:1">${t.alertas.points.map((p) => `<li>${ICO.check}${p}</li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="sec metodos" id="metodos">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.metodos.eye}</p><h2>${t.metodos.h2}</h2><p class="lead">${t.metodos.sub}</p></div>
    <div class="mgrid">${t.metodos.items.map((m, i) => `<div class="mc" data-anim style="--i:${i}" data-tilt><img src="/assets/landing/img/${m[0]}.webp" width="192" height="192" alt="" loading="lazy"><span>${m[1]}</span></div>`).join('')}</div>
  </div>
</section>

<section class="sec opiniones" id="opiniones">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.opiniones.eye}</p><h2>${t.opiniones.h2}</h2></div>
    <div class="rgrid">${t.opiniones.items.map((r, i) => `<figure class="rv" data-anim style="--i:${i}"><div class="stars" aria-label="5/5">${ICO.star.repeat(5)}</div><blockquote>${r.q}</blockquote><figcaption>${t.opiniones.src}${r.tr ? ` · <span>${r.tr}</span>` : ''}</figcaption></figure>`).join('')}</div>
  </div>
</section>

<section class="sec planes" id="pro">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.planes.eye}</p><h2>${t.planes.h2}</h2></div>
    <div class="pgrid">
      <article class="plan" data-anim><h3>${t.planes.free.t}</h3><p class="ps">${t.planes.free.s}</p><ul>${t.planes.free.items.map((x) => `<li>${ICO.check}${x}</li>`).join('')}</ul></article>
      <article class="plan pro" data-anim style="--i:1"><h3><span class="star">★</span> ${t.planes.pro.t}</h3><p class="ps">${t.planes.pro.s}</p><ul>${t.planes.pro.items.map((x) => `<li>${ICO.plus}${x}</li>`).join('')}</ul><p class="how">${t.planes.pro.how}</p><p class="founder" data-founder hidden></p></article>
    </div>
    <div class="pcta" data-anim>${badges(l)}</div>
  </div>
</section>

<section class="sec datos">
  <div class="wrap dgrid">${t.datos.map((x, i) => `<div class="dc" data-anim style="--i:${i}"><span class="di">${ICO[['modelos', 'offline', 'idioma'][i]]}</span><div><h3>${x[0]}</h3><p>${x[1]}</p></div></div>`).join('')}</div>
</section>

<section class="sec faq" id="preguntas">
  <div class="wrap faq-w">
    <div class="sh" data-anim><p class="eyebrow">${t.faq.eye}</p><h2>${t.faq.h2}</h2></div>
    <div class="qs">${t.faq.items.map((q, i) => `<details class="q" name="faq" data-anim style="--i:${i % 4}"><summary><span>${q[0]}</span>${ICO.plus}</summary><div class="qa"><p>${q[1]}</p></div></details>`).join('')}</div>
  </div>
</section>

<section class="final" id="descargar">
  <div class="final-bg" aria-hidden="true"><img src="/assets/landing/img/dron.webp" width="1080" height="1890" alt="" loading="lazy"></div>
  <div class="wrap final-in">
    <div data-anim>${gauge('end')}</div>
    <h2 data-anim style="--i:1">${t.final.h2}</h2>
    <p class="lead" data-anim style="--i:2">${t.final.sub}</p>
    <div data-anim style="--i:3">${badges(l, 'center')}</div>
    <ul class="micro center" data-anim style="--i:4">${t.hero.micro.map((m) => `<li>${ICO.check}${m}</li>`).join('')}</ul>
  </div>
</section>
</main>

<footer class="foot">
  <div class="wrap foot-g">
    <div class="fb"><a class="brand" href="${t.path}"><img src="/assets/landing/img/icon-96.webp" width="32" height="32" alt=""><span>Spray<b>Clarity</b></span></a><p>${t.foot.tag}</p></div>
    <nav class="fl"><a href="/privacidad/${{ es: '#es', pt: '#pt', en: '#en', fr: '#fr' }[l]}">${t.foot.priv}</a><a href="/terminos/">${t.foot.terms}</a><a href="/soporte/">${t.foot.support}</a><a href="mailto:sprayclarity@gmail.com">sprayclarity@gmail.com</a></nav>
    <nav class="fl" aria-label="${t.foot.lang}">${langMenu}</nav>
  </div>
  <div class="wrap"><div class="fine"><p>${t.foot.legal}</p><p>© 2026 ${t.foot.by}</p></div></div>
</footer>
<script src="/assets/landing/landing.js?v=${V}" defer></script>
</body>
</html>
`;
}

for (const l of LANGS) {
  const out = path.join(REPO, l === 'es' ? 'index.html' : path.join(l, 'index.html'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, pagina(l), 'utf8');
  console.log('✓', path.relative(REPO, out));
}
/* mapa del sitio para buscadores (las 4 portadas + páginas legales) */
const URLS = LANGS.map((l) => ({ loc: SITE + T[l].path, alt: true })).concat(['/privacidad/', '/terminos/', '/soporte/'].map((p) => ({ loc: SITE + p })));
fs.writeFileSync(path.join(REPO, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  URLS.map((u) => `  <url><loc>${u.loc}</loc>${u.alt ? LANGS.map((x) => `<xhtml:link rel="alternate" hreflang="${T[x].lang}" href="${SITE}${T[x].path}"/>`).join('') : ''}</url>`).join('\n') + '\n</urlset>\n', 'utf8');
fs.writeFileSync(path.join(REPO, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');
console.log('✓ sitemap.xml, robots.txt');
const peso = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? peso(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
console.log('assets/landing:', (peso(A) / 1024).toFixed(0), 'KB');
