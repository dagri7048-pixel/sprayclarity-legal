// Imágenes para compartir (Open Graph, 1200×630) de la landing, una por idioma → /assets/landing/og-<l>.jpg
// Usa el mismo texto de portada (textos.js) y la captura real de cada idioma. Chrome headless propio + ffmpeg.
// Requiere el servidor local del sitio en el puerto 4603 (preview_start sitio). Uso: node _src/landing/og.js
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const T = require('./textos.js');
const REPO = path.join(__dirname, '..', '..'), TMP = path.join(__dirname, 'og-tmp');
const LANGS = ['es', 'pt', 'en', 'fr'], PORT = 9391;
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#34C76A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const GAUGE = '<svg class="gauge" viewBox="0 0 120 86"><path d="M12 60A48 48 0 0 1 36 18.4" stroke="#34C76A"/><path d="M36 18.4A48 48 0 0 1 84 18.4" stroke="#4B4122"/><path d="M84 18.4A48 48 0 0 1 108 60" stroke="#4A2B22"/><line x1="60" y1="60" x2="30.5" y2="41.5" stroke="#F4F8F2" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="60" r="13" fill="#34C76A" stroke="none"/><path d="M53.5 60.2l4.4 4.4 8.6-9.2" stroke="#06140C" stroke-width="3.4" stroke-linejoin="round"/></svg>';
fs.mkdirSync(TMP, { recursive: true });
/* pm = la de la página de mapeo (titular de pm.hero, captura con Dron de mapeo, veredicto hoyM) */
const html = (l, pm) => {
  const t = T[l], h = pm ? t.pm.hero.h1 : t.hero.h1, largo = h.replace(/<[^>]+>/g, '').length > 50, V = pm ? t.data.hoyM : t.data.hoy;
  return `<!doctype html><html lang="${t.lang}"><head><meta charset="utf-8"><title>og ${pm ? 'mapeo-' : ''}${l}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@500&display=swap">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0B1510}
.og{position:relative;width:1200px;height:630px;overflow:hidden;color:#EAF1E8;font-family:Inter,sans-serif;background:radial-gradient(640px 560px at 84% 44%,rgba(52,199,106,.30),transparent 70%),radial-gradient(560px 420px at 4% 0%,rgba(52,199,106,.10),transparent 70%),#0B1510}
.field{position:absolute;left:50%;bottom:0;width:240%;height:62%;transform:translateX(-50%) perspective(520px) rotateX(60deg);transform-origin:50% 100%;overflow:hidden;opacity:.5;-webkit-mask-image:linear-gradient(to top,#000,transparent 82%)}
.field::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(52,199,106,.26) 0 2px,transparent 2px 44px)}
.brand{position:absolute;left:72px;top:62px;display:flex;align-items:center;gap:14px;font:800 32px/1 Archivo,sans-serif;letter-spacing:-.01em}
.brand img{width:58px;height:58px;border-radius:15px}
.brand b{color:#34C76A}
h1{position:absolute;left:72px;top:${largo ? 158 : 168}px;width:${largo ? 660 : 640}px;margin:0;font:800 ${largo ? 58 : 68}px/1.02 Archivo,sans-serif;letter-spacing:-.03em}
h1 em{font-style:normal;color:#34C76A}
.micro{position:absolute;left:72px;bottom:62px;display:flex;gap:26px;font:500 22px/1 Inter,sans-serif;color:#B7C6BC}
.micro span{display:flex;align-items:center;gap:9px}.micro svg{width:22px;height:22px}
.scene{position:absolute;right:70px;top:46px;width:330px;perspective:1400px}
.rig{transform-style:preserve-3d;transform:rotateX(8deg) rotateY(-18deg) rotateZ(1.5deg)}
.device{width:300px;padding:9px;border-radius:44px;background:linear-gradient(150deg,#2A3C31,#0C1510 55%,#18241D);box-shadow:0 0 0 1.5px #34503F,0 50px 90px -30px rgba(0,0,0,.85)}
.device img{display:block;width:100%;border-radius:36px}
.chip{position:absolute;left:calc(7% + 22px);top:calc(11% + 9px);width:86%;display:flex;align-items:center;gap:12px;padding:12px 14px;box-sizing:border-box;background:#17261D;border:1px solid rgba(52,199,106,.26);border-radius:15px;box-shadow:0 26px 50px -20px rgba(0,0,0,.9);transform:translateZ(80px)}
.chip .gauge{width:28%;flex:none;fill:none;stroke-width:10;stroke-linecap:round}
.chip b{display:block;font:800 ${V.verdict.length > 14 ? 17 : 21}px/1.05 Archivo,sans-serif;color:#34C76A}
.chip span{display:block;margin-top:5px;font:500 11px/1.3 'IBM Plex Mono',monospace;color:#B7C6BC}
</style></head><body><div class="og"><div class="field"></div>
<div class="brand"><img src="/assets/landing/img/icon-192.png" alt=""><span>Spray<b>Clarity</b></span></div>
<h1>${h}</h1>
<div class="micro">${t.hero.micro.map((m) => `<span>${CHECK}${m}</span>`).join('')}</div>
<div class="scene"><div class="rig"><div class="device"><img src="/assets/landing/img/hoy-${l}${pm ? '-mapeo' : ''}.webp" alt=""></div>
<div class="chip">${GAUGE}<div><b>${V.verdict}</b>${V.verdict.length > 14 ? '' : `<span>${V.all}</span>`}</div></div></div></div>
</div></body></html>`;
};
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const udd = path.join(os.tmpdir(), 'sc-og-chrome'); fs.rmSync(udd, { recursive: true, force: true });
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--remote-debugging-port=' + PORT, '--user-data-dir=' + udd, '--window-size=1200,630', 'about:blank'], { stdio: 'ignore' });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  let wsUrl = null;
  for (let i = 0; i < 75 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const pg = l.find((x) => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch (e) {} if (!wsUrl) await espera(200); }
  if (!wsUrl) throw new Error('Chrome no abrió el puerto de control');
  const ws = new WebSocket(wsUrl); await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
  let id = 0; const pend = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  for (const pm of [false, true]) for (const l of LANGS) {
    const k = (pm ? 'mapeo-' : '') + l;
    const f = path.join(TMP, `og-${k}.html`); fs.writeFileSync(f, html(l, pm), 'utf8');
    await send('Page.navigate', { url: `http://localhost:4603/_src/landing/og-tmp/og-${k}.html` });
    let ok = false;
    for (let i = 0; i < 150 && !ok; i++) { ok = await js(`(async()=>{if(document.title!=='og ${k}')return false;await document.fonts.ready;var im=[].slice.call(document.images);return im.length>0&&im.every(function(i){return i.complete&&i.naturalWidth>0})})()`); if (!ok) await espera(100); }
    if (!ok) throw new Error('no cargó og ' + k);
    await espera(300);
    const s = await send('Page.captureScreenshot', { format: 'png' });
    const png = path.join(TMP, `og-${k}.png`), jpg = path.join(REPO, 'assets', 'landing', `og-${k}.jpg`);
    fs.writeFileSync(png, Buffer.from(s.result.data, 'base64'));
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', png, '-q:v', '3', jpg]);
    console.log('✓', path.relative(REPO, jpg), (fs.statSync(jpg).size / 1024).toFixed(0), 'KB');
  }
  ws.close(); proc.kill(); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
