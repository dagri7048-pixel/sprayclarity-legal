// Guardias de la landing: mismos textos en los 4 idiomas, reglas de copy de la marca y páginas generadas sanas.
// Uso: node --test _src/landing/landing.test.mjs   (después de node _src/landing/build.js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const T = require('./textos.js');
const DIR = path.dirname(fileURLToPath(import.meta.url)), REPO = path.join(DIR, '..', '..');
const LANGS = ['es', 'pt', 'en', 'fr'];
const forma = (v) => Array.isArray(v) ? v.map(forma) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, forma(v[k])])) : typeof v;
const textos = (v) => Array.isArray(v) ? v.flatMap(textos) : v && typeof v === 'object' ? Object.values(v).flatMap(textos) : typeof v === 'string' ? [v] : [];
const pagina = (l) => fs.readFileSync(path.join(REPO, l === 'es' ? 'index.html' : path.join(l, 'index.html')), 'utf8');

test('los 4 idiomas tienen exactamente la misma estructura (salvo traducciones opcionales de reseñas)', () => {
  const sinTr = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'tr' ? undefined : v)));
  const base = JSON.stringify(forma(sinTr(T.es)));
  for (const l of LANGS) assert.equal(JSON.stringify(forma(sinTr(T[l]))), base, `estructura distinta en ${l}`);
});

test('copy: sin promesas de exactitud ni precios', () => {
  const prohibidas = /exact|exat|confiab|confiáv|fiable|garanti|guarante|accurat|precise\b|précis|reliab/i;
  const precio = /(\$|€|R\$|USD|BRL|EUR)\s?\d|\d\s?(USD|BRL|EUR|€)|\/\s?(año|ano|year|an)\b/i;
  for (const l of LANGS) for (const s of textos(T[l])) {
    assert.ok(!prohibidas.test(s), `${l}: palabra prohibida en «${s}»`);
    assert.ok(!precio.test(s), `${l}: parece un precio en «${s}»`);
  }
});

test('la marca habla de tú (sin voseo) en español', () => {
  const voseo = /\b(podés|tenés|querés|mirá|elegí|tocá|aceptás|verificá|descargá|probá|sabés|usá|activá|abrí)\b/i;
  for (const s of textos(T.es)) assert.ok(!voseo.test(s), `voseo en «${s}»`);
});

test('las demás páginas del sitio tampoco usan voseo (el portugués "usá-lo" no cuenta)', () => {
  const voseo = /(?<![\p{L}])(podés|tenés|querés|sabés|aceptás|comprás|usás|tocás|enviás|completás|canjeás|esperás|practicás|necesitás|elegís|decidís|decís|tocá|elegí|verificá|mirá|abrí|usá|activá|descargá|probá|escribí|buscá|permití|compartí|ajustá|conocé|dejá|planificá|explorá|aprendé|leé|refrescá|arrastrá|soltá|borrá|desinstalá|escribinos|contanos|avisame|probala|probalo|aceptalo|guardalo|hacela|quedate|fijate)(?![\p{L}]|-\p{L})/iu;
  for (const f of ['soporte/index.html', 'terminos/index.html', 'privacidad/index.html', 'app.html', 'demo.html', 'tutorial.html']) {
    const m = fs.readFileSync(path.join(REPO, f), 'utf8').match(voseo);
    assert.equal(m, null, `${f}: voseo «${m && m[0]}»`);
  }
});

test('la línea de fundador lleva el hueco de la fecha y ningún número', () => {
  for (const l of LANGS) { assert.match(T[l].planes.founder, /\{d\}/); assert.doesNotMatch(T[l].planes.founder.replace('{d}', ''), /\d/); }
});

test('páginas generadas: idioma, canónica, hreflang, OG y sin restos de plantilla', () => {
  for (const l of LANGS) {
    const h = pagina(l);
    assert.match(h, new RegExp(`<html lang="${T[l].lang}">`));
    assert.match(h, new RegExp(`<link rel="canonical" href="https://sprayclarity.com${T[l].path.replace(/\//g, '\\/')}">`));
    assert.equal((h.match(/rel="alternate" hreflang=/g) || []).length, 5, `${l}: hreflang`);
    assert.match(h, new RegExp(`og-${l}\\.jpg`));
    assert.doesNotMatch(h, /\$\{|undefined|NaN|\[object Object\]/, `${l}: resto de plantilla`);
    assert.match(h, /href="\/privacidad\/#/, `${l}: enlace a la política`);
    assert.ok(fs.existsSync(path.join(REPO, 'assets', 'landing', `og-${l}.jpg`)), `${l}: falta og-${l}.jpg`);
    for (const m of h.matchAll(/(?:src|href)="(\/assets\/landing\/[^"?#]+)/g)) assert.ok(fs.existsSync(path.join(REPO, m[1])), `${l}: falta ${m[1]}`);
    const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${l}: ids repetidos`);
  }
});

test('solo la portada en español redirige los enlaces viejos de la política', () => {
  assert.match(pagina('es'), /location\.replace\("\/privacidad\/"\+location\.hash\)/);
  for (const l of ['pt', 'en', 'fr']) assert.doesNotMatch(pagina(l), /location\.replace/);
  const priv = fs.readFileSync(path.join(REPO, 'privacidad', 'index.html'), 'utf8');
  for (const id of ['es', 'en', 'pt', 'fr']) assert.match(priv, new RegExp(`id="${id}"`), `política sin sección ${id}`);
});

test('la portada redirige TODAS las anclas de la política (las tiendas usan /#eliminar-datos) y ninguna de la landing', () => {
  const h = pagina('es'), m = h.match(/if\(\/\^#\(([^)]+)\)\$\/\.test\(location\.hash\)\)/);
  assert.ok(m, 'no encuentro la redirección');
  const rx = new RegExp(`^#(${m[1]})$`);
  const priv = fs.readFileSync(path.join(REPO, 'privacidad', 'index.html'), 'utf8');
  const ids = [...priv.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  for (const id of ['eliminar-datos', 'data-deletion', 'excluir-dados', 'suppression-donnees', 'es', 'en', 'pt', 'fr']) assert.ok(ids.includes(id), `la política perdió el ancla ${id}`);
  for (const id of ids) assert.ok(rx.test('#' + id), `#${id} no redirige a /privacidad/`);
  for (const [, id] of h.matchAll(/\sid="([^"]+)"/g)) assert.ok(!rx.test('#' + id), `#${id} de la landing se iría a la política`);
});
