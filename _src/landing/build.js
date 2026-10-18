// Genera la landing de sprayclarity.com en 4 idiomas: / (es) · /pt/ · /en/ · /fr/
// + la página para dron de mapeo: /mapeo/ · /pt/mapeamento/ · /en/mapping/ · /fr/cartographie/
// + imágenes optimizadas en /assets/landing/img (WebP) a partir de las capturas reales de la app y de las fotos.
// La carpeta _src no se publica (GitHub Pages con Jekyll ignora las carpetas que empiezan con "_").
// Uso: node _src/landing/build.js            → páginas (y las imágenes que falten)
//      node _src/landing/build.js --img      → además rehace todas las imágenes
// La política de privacidad vive en /privacidad/ (la antigua portada). La portada redirige sus anclas viejas.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const T = require('./textos.js');
const REPO = path.join(__dirname, '..', '..');
const DC = path.join(REPO, '..');
const RAW = path.join(DC, 'capturas-tienda-1.9', 'raw');         /* capturas de la app con dron (fichas 1.9) */
const RAW2 = path.join(DC, 'capturas-landing');                  /* terrestre y mapeo (campana-pro/src/capturar-metodo.js) */
const WWW = path.join(DC, 'ventana-fumigacion-app', 'www');
const INS = path.join(DC, 'campana-pro', 'assets', 'insignias');
const FOTOS = path.join(DC, 'campana-pro', 'carrusel-v2', 'fotos'); /* cuadros aprobados de los clips IA */
const FOTOS2 = path.join(DC, 'campana-pro', 'landing-fotos');       /* imágenes IA de la landing (nano-banana-pro 2K) */
const A = path.join(REPO, 'assets', 'landing'), IMG = path.join(A, 'img');
const SITE = 'https://sprayclarity.com', V = '6';
const LANGS = ['es', 'pt', 'en', 'fr'];
const REHACER = process.argv.includes('--img');
fs.mkdirSync(path.join(IMG, 'badges'), { recursive: true });

/* ── imágenes ── */
const ff = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args]);
const hacer = (out, fn) => { if (REHACER || !fs.existsSync(out)) { fn(out); } };
const webp = (src, vf, out, q) => ff(['-i', src, ...(vf ? ['-vf', vf] : []), '-c:v', 'libwebp', '-quality', String(q), out]);
for (const l of LANGS) {
  hacer(path.join(IMG, `hoy-${l}.webp`), (o) => webp(path.join(RAW, l, '01-hoy.png'), 'scale=720:-2:flags=lanczos', o, 82));
  for (const m of ['terrestre', 'mapeo']) hacer(path.join(IMG, `hoy-${l}-${m}.webp`), (o) => webp(path.join(RAW2, l, `01-hoy-${m}.png`), 'scale=720:-2:flags=lanczos', o, 82));
  hacer(path.join(IMG, `mapa-${l}.webp`), (o) => webp(path.join(RAW, l, '04-mapa.png'), 'crop=1320:1150:0:600,scale=1200:-2:flags=lanczos', o, 78));
}
for (const m of ['m-dron', 'm-terrestre', 'm-mochila', 'm-motor', 'm-mapeo']) hacer(path.join(IMG, `${m}.webp`), (o) => webp(path.join(WWW, 'icons', `${m}.png`), 'scale=192:-2:flags=lanczos', o, 90));
hacer(path.join(IMG, 'icon-96.webp'), (o) => webp(path.join(WWW, 'icons', 'app-icon.png'), 'scale=96:96:flags=lanczos', o, 92));
for (const s of [180, 192]) hacer(path.join(IMG, `icon-${s}.png`), (o) => ff(['-i', path.join(WWW, 'icons', 'app-icon.png'), '-vf', `scale=${s}:${s}:flags=lanczos`, o]));
hacer(path.join(IMG, 'dron.webp'), (o) => webp(path.join(FOTOS, 'dron.jpg'), null, o, 76));
hacer(path.join(IMG, 'fono.webp'), (o) => webp(path.join(FOTOS, 'fono-b52.jpg'), null, o, 76));
/* fotos de los métodos (16:9): el dron recortado del cuadro vertical; el terrestre y el mapeo, imágenes IA horizontales */
hacer(path.join(IMG, 'metodo-dron.webp'), (o) => webp(path.join(FOTOS, 'dron.jpg'), 'crop=1080:608:0:330', o, 78));
hacer(path.join(IMG, 'metodo-terrestre.webp'), (o) => webp(path.join(FOTOS2, 'terrestre-ia.png'), 'scale=1200:-2:flags=lanczos', o, 78));
hacer(path.join(IMG, 'mapeo-ancho.webp'), (o) => webp(path.join(FOTOS2, 'mapeo-ia.png'), 'scale=1800:-2:flags=lanczos', o, 74));
hacer(path.join(IMG, 'mapeo-vertical.webp'), (o) => webp(path.join(FOTOS2, 'mapeo-ia.png'), 'crop=1229:1536:180:0,scale=1080:-2:flags=lanczos', o, 76));
/* insignias oficiales de Apple y Google, sin modificar (campana-pro/assets/insignias) */
const BADGE = { es: ['app-store_es-mx.svg', 'google-play_es-419.png'], pt: ['app-store_pt-br.svg', 'google-play_pt-br.png'], en: ['app-store_en.svg', 'google-play_en.png'], fr: ['app-store_fr.svg', 'google-play_fr.png'] };
/* ancho de la insignia de Apple a 54 px de alto, según su viewBox (la francesa es más ancha) */
const asW = (f) => { const m = fs.readFileSync(path.join(INS, f), 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return m ? Math.round(54 * m[1] / m[2]) : 162; };
for (const l of LANGS) for (const f of BADGE[l]) { const o = path.join(IMG, 'badges', f); if (!fs.existsSync(o)) fs.copyFileSync(path.join(INS, f), o); }
/* política de privacidad: se movió a /privacidad/ (copia de la portada vieja; después solo cambió el voseo) */
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
  sol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 7V4"/><path d="M5.6 10.6 3.8 8.8"/><path d="M18.4 10.6l1.8-1.8"/></svg>',
  nubes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M8 2.5v1M2.5 8h1M4.1 4.1l.7.7M11.9 4.1l-.7.7"/><path d="M9 20a4 4 0 0 1 .3-8 5 5 0 0 1 9.4 1.4A3.3 3.3 0 0 1 18.5 20z"/></svg>',
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
const badges = (l, cls, origen) => {
  const [as, gp] = BADGE[l], alt = { es: ['Descárgalo en el App Store', 'Disponible en Google Play'], pt: ['Baixar na App Store', 'Disponível no Google Play'], en: ['Download on the App Store', 'Get it on Google Play'], fr: ['Télécharger dans l’App Store', 'Disponible sur Google Play'] }[l];
  const play = `https://play.google.com/store/apps/details?id=com.planoalto.sprayclarity&amp;referrer=utm_source%3D${origen || 'sitio'}-${l}`;
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
/* las piezas 3D se ubican sobre la captura con dron (fichas 1.9), que se tomó deslizada lo máximo: la cabecera de la app
   (73 px CSS, medido) quedó fuera. Las de terrestre/mapeo se deslizaron `desliz` px → su tarjeta está más abajo:
   --oy = (73 − desliz) / 956 de la pantalla, en % del teléfono (la pantalla ocupa 638,6 de sus 656,6 px de alto) */
const oyOf = (l, m) => { const j = JSON.parse(fs.readFileSync(path.join(RAW2, l, `hoy-${m}.json`), 'utf8')); return ((73 - j.desliz) / 956 * (638.6 / 656.6) * 100).toFixed(2) + '%'; };
/* el teléfono 3D: la captura real + las piezas de la tarjeta Hoy despegadas (vista explotada) */
const rig = (m, dd, img, altTxt, on, prio, oy) => `<div class="rig${on ? ' on play' : ''}" data-m="${m}" id="rig-${m}" role="tabpanel" aria-labelledby="tab-${m}"${on ? '' : ' aria-hidden="true"'}${oy ? ` style="--oy:${oy}"` : ''}>
        <figure class="device"><img src="/assets/landing/img/${img}.webp" width="720" height="1564" alt="${esc(altTxt)}"${prio ? ' fetchpriority="high"' : ' fetchpriority="low"'}></figure>
        <div class="chip c-verdict${dd.verdict.length > 14 ? ' long' : ''}">${gauge('mini')}<div><b>${dd.verdict}</b><span>${dd.all}</span></div></div>
        <div class="chip c-win"><span class="mono">${dd.winL}</span><p>${dd.win}</p></div>
        ${dd.f.map((f, i) => `<div class="chip c-f c-f${i + 1}"><span class="mono">${f[0]}</span><b>${f[1]}<small> ${f[2]}</small></b></div>`).join('')}
      </div>`;
const NOMBRE = { es: 'Español', pt: 'Português', en: 'English', fr: 'Français' };
/* selector de página Pulverización | Mapeo: marca SIEMPRE la página en la que estás (antes había un solo enlace verde
   con el nombre de la OTRA página y parecía la pestaña activa: pedido del usuario 2026-10-17) */
const modo = (l, pm, cls) => { const t = T[l]; return `<nav class="modo ${cls}" aria-label="${esc(t.nav.modoL)}"><a href="${t.path}"${pm ? '' : ' aria-current="page"'}>${t.pm.nav.spray}</a><a href="${t.pm.path}"${pm ? ' aria-current="page"' : ''}>${t.nav.mapeo}</a></nav>`; };

/* cabecera HTML común; `pag` = 'main' | 'mapeo' */
function head(l, pag) {
  const t = T[l], pm = pag === 'mapeo', M = pm ? t.pm.meta : t.meta, pathOf = (x) => (pm ? T[x].pm.path : T[x].path);
  const url = SITE + pathOf(l), og = `${SITE}/assets/landing/og-${pm ? 'mapeo-' : ''}${l}.jpg`;
  const alt = LANGS.map((x) => `<link rel="alternate" hreflang="${T[x].lang}" href="${SITE}${pathOf(x)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${SITE}${pathOf('es')}">`;
  const sug = {}; LANGS.forEach((x) => { sug[x] = { url: pathOf(x), msg: T[x].suggest }; });
  const ld = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SprayClarity', operatingSystem: 'Android, iOS', applicationCategory: 'UtilitiesApplication', description: M.desc, url, inLanguage: t.lang, image: og, publisher: { '@type': 'Organization', name: 'Plano Alto' }, downloadUrl: ['https://play.google.com/store/apps/details?id=com.planoalto.sprayclarity', 'https://apps.apple.com/app/id6804949973'] };
  const heroImg = pm ? `hoy-${l}-mapeo` : `hoy-${l}`;
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(M.title)}</title>
<meta name="description" content="${esc(M.desc)}">
<link rel="canonical" href="${url}">
${alt}
<meta property="og:type" content="website"><meta property="og:site_name" content="SprayClarity"><meta property="og:locale" content="${t.ogLocale}">
<meta property="og:title" content="${esc(M.ogTitle)}"><meta property="og:description" content="${esc(M.ogDesc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(M.ogTitle)}"><meta name="twitter:description" content="${esc(M.ogDesc)}"><meta name="twitter:image" content="${og}">
<meta name="theme-color" content="#0B1510"><meta name="color-scheme" content="dark">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/landing/img/icon-192.png"><link rel="apple-touch-icon" href="/assets/landing/img/icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600&display=swap">
<link rel="preload" as="image" href="/assets/landing/img/${heroImg}.webp" type="image/webp">
<link rel="stylesheet" href="/assets/landing/landing.css?v=${V}">
${l === 'es' && !pm ? `<script>/* enlaces viejos a la política (antes era la portada), también las URL de borrado de datos de las tiendas */if(/^#(${PRIV_IDS.join('|')})$/.test(location.hash))location.replace("/privacidad/"+location.hash);</script>` : ''}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script>window.SC=${JSON.stringify({ lang: l, founder: t.planes.founder, locale: t.lang, sug })};document.documentElement.classList.add('js');setTimeout(function(){if(!window.SCok)document.documentElement.classList.remove('js')},3500);</script>
</head>
<body>`;
}
function header(l, pag) {
  const t = T[l], pm = pag === 'mapeo', home = pm ? t.pm.path : t.path, N = pm ? t.pm.nav : t.nav;
  const langMenu = LANGS.map((x) => `<a href="${pm ? T[x].pm.path : T[x].path}" hreflang="${T[x].lang}" lang="${T[x].lang}"${x === l ? ' aria-current="page"' : ''}>${NOMBRE[x]}</a>`).join('');
  const links = pm
    ? `<a href="#como">${N.como}</a><a href="#factores">${N.factores}</a><a href="#pro">${N.pro}</a><a href="#preguntas">${N.faq}</a>`
    : `<a href="#como">${N.como}</a><a href="#mapa">${N.mapa}</a><a href="#alertas">${N.alertas}</a><a href="#pro">${N.pro}</a><a href="#preguntas">${N.faq}</a>`;
  return `
<a class="skip" href="#main">${t.nav.skip}</a>
<header class="nav" data-nav>
  <div class="wrap navin">
    <a class="brand" href="${home}" aria-label="SprayClarity"><img src="/assets/landing/img/icon-96.webp" width="36" height="36" alt=""><span>Spray<b>Clarity</b></span></a>
    ${modo(l, pm, 'm-nav')}
    <nav class="links">${links}</nav>
    <div class="navr">
      <details class="langs"><summary aria-label="${t.foot.lang}">${l.toUpperCase()}</summary><div class="langs-m">${langMenu}</div></details>
      <a class="btn sm" href="#descargar" data-cta>${t.nav.cta}</a>
    </div>
  </div>
</header>
<div class="sug" data-sug hidden><span></span><a href="#"></a><button type="button" aria-label="×">×</button></div>`;
}
function footer(l, pag) {
  const t = T[l], pm = pag === 'mapeo';
  const langMenu = LANGS.map((x) => `<a href="${pm ? T[x].pm.path : T[x].path}" hreflang="${T[x].lang}" lang="${T[x].lang}"${x === l ? ' aria-current="page"' : ''}>${NOMBRE[x]}</a>`).join('');
  const otra = pm ? `<a href="${t.path}">${t.pm.nav.spray}</a>` : `<a href="${t.pm.path}">${t.foot.mapeo}</a>`;
  return `
<footer class="foot">
  <div class="wrap foot-g">
    <div class="fb"><a class="brand" href="${pm ? t.pm.path : t.path}"><img src="/assets/landing/img/icon-96.webp" width="32" height="32" alt=""><span>Spray<b>Clarity</b></span></a><p>${t.foot.tag}</p></div>
    <nav class="fl">${otra}<a href="/privacidad/${{ es: '#es', pt: '#pt', en: '#en', fr: '#fr' }[l]}">${t.foot.priv}</a><a href="/terminos/">${t.foot.terms}</a><a href="/soporte/">${t.foot.support}</a><a href="mailto:sprayclarity@gmail.com">sprayclarity@gmail.com</a></nav>
    <nav class="fl" aria-label="${t.foot.lang}">${langMenu}</nav>
  </div>
  <div class="wrap"><div class="fine"><p>${t.foot.legal}</p><p>© 2026 ${t.foot.by}</p></div></div>
</footer>
<script src="/assets/landing/landing.js?v=${V}" defer></script>
</body>
</html>
`;
}
/* secciones que comparten las dos páginas */
const secProof = (t) => `
<section class="proof">
  <div class="wrap proof-g">${t.proof.map((p, i) => `<div class="pf" data-anim style="--i:${i}"><b data-count="${p[0]}">${p[0]}</b><span>${p[1]}</span></div>`).join('')}</div>
</section>`;
const secProb = (P) => `
<section class="sec prob" id="problema">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${P.eye}</p><h2>${P.h2}</h2><p class="lead">${P.sub}</p></div>
    <div class="kgrid">${P.items.map((k, i) => `<article class="kc k-${k[0]}" data-anim style="--i:${i}" data-tilt><span class="ki">${ICO[k[0]]}</span><h3>${k[1]}</h3><p>${k[2]}</p></article>`).join('')}</div>
  </div>
</section>`;
const secComo = (C, foto) => `
<section class="sec como" id="como">
  <div class="wrap como-g">
    <div class="como-t">
      <div class="sh left" data-anim><p class="eyebrow">${C.eye}</p><h2>${C.h2}</h2></div>
      <ol class="steps">${C.steps.map((s, i) => `<li data-anim style="--i:${i}"><span class="sn">${i + 1}</span><div><h3>${s[0]}</h3><p>${s[1]}</p></div></li>`).join('')}</ol>
    </div>
    <figure class="photo" data-anim data-parallax><img src="/assets/landing/img/${foto[0]}.webp" width="1080" height="${foto[1]}" alt="" loading="lazy"></figure>
  </div>
</section>`;
const secPorque = (P, data, id) => `
<section class="sec porque" id="${id}">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${P.eye}</p><h2>${P.h2}</h2><p class="lead">${P.sub}</p></div>
    ${factors(data)}
  </div>
</section>`;
const secAlertas = (Aa, points, lk) => `
<section class="sec alertas" id="alertas">
  <div class="wrap al-g">
    <div class="al-v">${lock(lk)}</div>
    <div class="al-t">
      <div class="sh left" data-anim><p class="eyebrow pro-eye">${Aa.eye}</p><h2>${Aa.h2}</h2><p class="lead">${Aa.sub}</p></div>
      <ul class="ticks" data-anim style="--i:1">${points.map((p) => `<li>${ICO.check}${p}</li>`).join('')}</ul>
    </div>
  </div>
</section>`;
const secPlanes = (l, t, origen) => `
<section class="sec planes" id="pro">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.planes.eye}</p><h2>${t.planes.h2}</h2></div>
    <div class="pgrid">
      <article class="plan" data-anim><h3>${t.planes.free.t}</h3><p class="ps">${t.planes.free.s}</p><ul>${t.planes.free.items.map((x) => `<li>${ICO.check}${x}</li>`).join('')}</ul></article>
      <article class="plan pro" data-anim style="--i:1"><h3><span class="star">★</span> ${t.planes.pro.t}</h3><p class="ps">${t.planes.pro.s}</p><ul>${t.planes.pro.items.map((x) => `<li>${ICO.plus}${x}</li>`).join('')}</ul><p class="how">${t.planes.pro.how}</p><p class="founder" data-founder hidden></p></article>
    </div>
    <div class="pcta" data-anim>${badges(l, '', origen)}</div>
  </div>
</section>`;
const secDatos = (t) => `
<section class="sec datos">
  <div class="wrap dgrid">${t.datos.map((x, i) => `<div class="dc" data-anim style="--i:${i}"><span class="di">${ICO[['modelos', 'offline', 'idioma'][i]]}</span><div><h3>${x[0]}</h3><p>${x[1]}</p></div></div>`).join('')}</div>
</section>`;
const secFaq = (F) => `
<section class="sec faq" id="preguntas">
  <div class="wrap faq-w">
    <div class="sh" data-anim><p class="eyebrow">${F.eye}</p><h2>${F.h2}</h2></div>
    <div class="qs">${F.items.map((q, i) => `<details class="q" name="faq" data-anim style="--i:${i % 4}"><summary><span>${q[0]}</span>${ICO.plus}</summary><div class="qa"><p>${q[1]}</p></div></details>`).join('')}</div>
  </div>
</section>`;
const secFinal = (l, t, F, bg, origen) => `
<section class="final" id="descargar">
  <div class="final-bg${bg[2] ? ' ' + bg[2] : ''}" aria-hidden="true"><img src="/assets/landing/img/${bg[0]}.webp" width="${bg[1][0]}" height="${bg[1][1]}" alt="" loading="lazy"></div>
  <div class="wrap final-in">
    <div data-anim>${gauge('end')}</div>
    <h2 data-anim style="--i:1">${F.h2}</h2>
    <p class="lead" data-anim style="--i:2">${F.sub}</p>
    <div data-anim style="--i:3">${badges(l, 'center', origen)}</div>
    <ul class="micro center" data-anim style="--i:4">${t.hero.micro.map((m) => `<li>${ICO.check}${m}</li>`).join('')}</ul>
  </div>
</section>`;

function pagina(l) {
  const t = T[l], d = t.data, Mt = t.metodos;
  const tabs = `<div class="mtabs" role="tablist" aria-label="${esc(t.hero.tabsL)}">` + ['dron', 'terrestre'].map((m, i) => `<button type="button" role="tab" id="tab-${m}" aria-controls="rig-${m}" aria-selected="${i === 0}" data-tab="${m}"><img src="/assets/landing/img/m-${m}.webp" width="22" height="22" alt="">${t.hero.tabs[i]}</button>`).join('') + '</div>';
  const lim = (m) => `<dl class="lims"><div><dt>${Mt.lim[0]}</dt><dd>${m[2]}</dd></div><div><dt>${Mt.lim[1]}</dt><dd>${m[3]}</dd></div></dl><p class="also"><span>${Mt.lim[2]}</span>${m[4]}</p>`;
  return head(l, 'main') + header(l, 'main') + `
<main id="main">

<section class="hero">
  <div class="aurora" aria-hidden="true"></div>
  <div class="field" aria-hidden="true"><i></i></div>
  <div class="wrap hero-g">
    <div class="hero-t">
      ${modo(l, false, 'm-hero')}
      <p class="eyebrow" data-anim>${t.hero.eye}</p>
      <h1 data-anim style="--i:1">${t.hero.h1}</h1>
      <p class="lead" data-anim style="--i:2">${t.hero.sub}</p>
      <div data-anim style="--i:3">${badges(l, 'hero-b')}</div>
      <ul class="micro" data-anim style="--i:4">${t.hero.micro.map((m) => `<li>${ICO.check}${m}</li>`).join('')}</ul>
    </div>
    <div class="scene" data-scene>
      ${tabs}
      <div class="rigs">
      ${rig('dron', d.hoy, `hoy-${l}`, t.hero.alt, true, true)}
      ${rig('terrestre', d.hoyT, `hoy-${l}-terrestre`, t.hero.altT, false, false, oyOf(l, 'terrestre'))}
      </div>
    </div>
  </div>
</section>
${secProof(t)}${secProb(t.prob)}${secComo(t.como, ['fono', 1890])}

<section class="sec ver" id="veredicto">
  <div class="wrap ver-g">
    <div class="ver-t">
      <div class="sh left" data-anim><p class="eyebrow">${t.ver.eye}</p><h2>${t.ver.h2}</h2><p class="lead">${t.ver.sub}</p></div>
      <ul class="ticks" data-anim style="--i:1">${t.ver.points.map((p) => `<li>${ICO.check}${p}</li>`).join('')}</ul>
    </div>
    <div class="ver-v">${vcard(d.hoy)}${strip(d.strip)}</div>
  </div>
</section>
${secPorque(t.porque, d.factors, 'porque')}

<section class="sec mapa" id="mapa">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.mapa.eye}</p><h2>${t.mapa.h2}</h2><p class="lead">${t.mapa.sub}</p></div>
    <div class="mapstage" data-tiltscroll>
      <figure class="mapwrap" data-anim><img src="/assets/landing/img/mapa-${l}.webp" width="1200" height="1046" alt="${esc(t.mapa.alt)}" loading="lazy">${pins(d.pins)}
        <figcaption class="maplegend"><span class="lg g">${t.mapa.legend[0]}</span><span class="lg a">${t.mapa.legend[1]}</span><span class="lg r">${t.mapa.legend[2]}</span></figcaption></figure>
    </div>
  </div>
</section>
${secAlertas(t.alertas, t.alertas.points, d.lock)}

<section class="sec metodos" id="metodos">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${Mt.eye}</p><h2>${Mt.h2}</h2><p class="lead">${Mt.sub}</p></div>
    <div class="mfeat">${Mt.items.slice(0, 2).map((m, i) => `<article class="mf" data-anim style="--i:${i}">
      <figure class="mf-img"><img src="/assets/landing/img/${['metodo-dron', 'metodo-terrestre'][i]}.webp" width="${[1080, 1200][i]}" height="${[608, 670][i]}" alt="${esc(Mt.fotoAlt[i])}" loading="lazy"></figure>
      <div class="mf-b"><div class="mf-h"><img src="/assets/landing/img/${m[0]}.webp" width="52" height="52" alt=""><h3>${m[1]}</h3></div>${lim(m)}</div></article>`).join('')}</div>
    <div class="mgrid3">${Mt.items.slice(2).map((m, i) => `<article class="mc" data-anim style="--i:${i + 2}" data-tilt><div class="mf-h"><img src="/assets/landing/img/${m[0]}.webp" width="52" height="52" alt="" loading="lazy"><h3>${m[1]}</h3></div>${lim(m)}</article>`).join('')}</div>
  </div>
</section>

<section class="sec vuelo" id="vuelo">
  <div class="wrap vuelo-g">
    <div class="vuelo-t">
      <div class="sh left" data-anim><p class="eyebrow">${t.vuelo.eye}</p><h2>${t.vuelo.h2}</h2><p class="lead">${t.vuelo.sub}</p></div>
      <ul class="ticks" data-anim style="--i:1">${t.vuelo.points.map((p) => `<li>${ICO.check}${p}</li>`).join('')}</ul>
      <p data-anim style="--i:2"><a class="btn ghost" href="${t.pm.path}">${t.vuelo.cta}${ICO.arrow}</a></p>
    </div>
    <figure class="vuelo-v" data-anim style="--i:1">
      <div class="vuelo-foto"><img src="/assets/landing/img/mapeo-ancho.webp" width="1800" height="1004" alt="${esc(t.vuelo.alt)}" loading="lazy"></div>
      <figcaption class="vuelo-card">${gauge('mini')}<div class="vc-t"><b>${d.hoyM.verdict}</b><span>${d.hoyM.win}</span></div>
        <div class="vc-f">${d.hoyM.f.map((f) => `<div><span class="mono">${f[0]}</span><b>${f[1]}<small> ${f[2]}</small></b></div>`).join('')}</div></figcaption>
    </figure>
  </div>
</section>

<section class="sec opiniones" id="opiniones">
  <div class="wrap">
    <div class="sh" data-anim><p class="eyebrow">${t.opiniones.eye}</p><h2>${t.opiniones.h2}</h2></div>
    <div class="rgrid">${t.opiniones.items.map((r, i) => `<figure class="rv" data-anim style="--i:${i}"><div class="stars" aria-label="5/5">${ICO.star.repeat(5)}</div><blockquote>${r.q}</blockquote><figcaption>${t.opiniones.src}${r.tr ? ` · <span>${r.tr}</span>` : ''}</figcaption></figure>`).join('')}</div>
  </div>
</section>
${secPlanes(l, t)}${secDatos(t)}${secFaq(t.faq)}${secFinal(l, t, t.final, ['dron', [1080, 1890]])}
</main>
` + footer(l, 'main');
}

function paginaMapeo(l) {
  const t = T[l], d = t.data, P = t.pm, ORI = 'sitio-mapeo';
  return head(l, 'mapeo') + header(l, 'mapeo') + `
<main id="main">

<section class="hero">
  <div class="aurora" aria-hidden="true"></div>
  <div class="field" aria-hidden="true"><i></i></div>
  <div class="wrap hero-g">
    <div class="hero-t">
      ${modo(l, true, 'm-hero')}
      <p class="eyebrow" data-anim>${P.hero.eye}</p>
      <h1 data-anim style="--i:1">${P.hero.h1}</h1>
      <p class="lead" data-anim style="--i:2">${P.hero.sub}</p>
      <div data-anim style="--i:3">${badges(l, 'hero-b', ORI)}</div>
      <ul class="micro" data-anim style="--i:4">${t.hero.micro.map((m) => `<li>${ICO.check}${m}</li>`).join('')}</ul>
    </div>
    <div class="scene" data-scene>
      <div class="rigs">
      ${rig('mapeo', d.hoyM, `hoy-${l}-mapeo`, P.hero.alt, true, true, oyOf(l, 'mapeo'))}
      </div>
    </div>
  </div>
</section>
${secProof(t)}${secProb(P.prob)}${secComo(P.como, ['mapeo-vertical', 1350])}${secPorque(P.porque, d.factM, 'factores')}${secAlertas(P.alertas, t.alertas.points, d.lockM)}${secPlanes(l, t, ORI)}${secDatos(t)}${secFaq(P.faq)}${secFinal(l, t, P.final, ['mapeo-ancho', [1800, 1004], 'wide'], ORI)}
</main>
` + footer(l, 'mapeo');
}

for (const l of LANGS) {
  const out = path.join(REPO, l === 'es' ? 'index.html' : path.join(l, 'index.html'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, pagina(l), 'utf8');
  const outM = path.join(REPO, ...T[l].pm.path.split('/').filter(Boolean), 'index.html');
  fs.mkdirSync(path.dirname(outM), { recursive: true });
  fs.writeFileSync(outM, paginaMapeo(l), 'utf8');
  console.log('✓', path.relative(REPO, out), '·', path.relative(REPO, outM));
}
/* mapa del sitio para buscadores (portadas y páginas de mapeo con sus alternas + páginas legales) */
const grupo = (pathOf) => LANGS.map((l) => `  <url><loc>${SITE}${pathOf(l)}</loc>${LANGS.map((x) => `<xhtml:link rel="alternate" hreflang="${T[x].lang}" href="${SITE}${pathOf(x)}"/>`).join('')}</url>`);
fs.writeFileSync(path.join(REPO, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  [...grupo((x) => T[x].path), ...grupo((x) => T[x].pm.path), ...['/privacidad/', '/terminos/', '/soporte/'].map((p) => `  <url><loc>${SITE}${p}</loc></url>`)].join('\n') + '\n</urlset>\n', 'utf8');
fs.writeFileSync(path.join(REPO, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');
console.log('✓ sitemap.xml, robots.txt');
const peso = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? peso(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log('assets/landing:', (peso(A) / 1024).toFixed(0), 'KB');
