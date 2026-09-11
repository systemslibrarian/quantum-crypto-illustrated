#!/usr/bin/env node
/*
 * Splits index.html — the single hand-edited source — into a hub page, eight
 * lesson pages and a full-page copy, under dist/.
 *
 * index.html stays the only file anyone edits. Every demo module no-ops when
 * its elements are absent, so the same <style> and <script> ship unchanged on
 * every page; the only rewriting needed is the navigation and the #anchors.
 *
 * No dependencies. Run: node build.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'dist');
const SITE = 'https://systemslibrarian.github.io/quantum-crypto-illustrated';

const src = fs.readFileSync(SRC, 'utf8');

/* ---------- carve the source into reusable pieces ---------- */
const headMatch = src.match(/^([\s\S]*?)<\/head>/);
const head = headMatch[1];                                  // <!DOCTYPE> … <style>…</style>
const bodyInner = src.slice(src.indexOf('<div class="wrap">'), src.lastIndexOf('</div>\n</body>'));
const scripts = src.slice(src.indexOf('<script>'), src.lastIndexOf('</script>') + '</script>'.length);

const defs = bodyInner.match(/<svg width="0"[\s\S]*?<\/svg>/)[0];      // shared arrowheads
const themer = bodyInner.match(/<div class="themer">[\s\S]*?<\/div>/)[0];
const hero = bodyInner.match(/<header class="hero">[\s\S]*?<\/header>/)[0];
const footerMatch = bodyInner.match(/<footer[\s\S]*?<\/footer>/);
const footer = footerMatch ? footerMatch[0] : '';

/* ---------- split the content at <h2 id=…> boundaries ---------- */
const afterHero = bodyInner.slice(bodyInner.indexOf(hero) + hero.length);
const contentEnd = footer ? afterHero.indexOf(footer) : afterHero.length;
const content = afterHero.slice(0, contentEnd);

const sections = [];
const h2re = /<h2 id="([^"]+)">\s*<span class="lesson">Lesson (\d+)<\/span>([\s\S]*?)<\/h2>/g;
let m, marks = [];
while ((m = h2re.exec(content)) !== null) {
  marks.push({ id: m[1], lesson: +m[2], title: m[3].replace(/<[^>]+>/g, '').trim(), start: m.index });
}
marks.forEach((mk, i) => {
  const end = i + 1 < marks.length ? marks[i + 1].start : content.length;
  let html = content.slice(mk.start, end);
  // the horizontal-rule comment that precedes the next section belongs to it
  html = html.replace(/<!-- =+ -->\s*$/, '');
  sections.push(Object.assign({}, mk, { html }));
});

/* ---------- group sections into lessons ---------- */
const lessons = [];
sections.forEach(sec => {
  let L = lessons.find(l => l.n === sec.lesson);
  if (!L) { L = { n: sec.lesson, sections: [] }; lessons.push(L); }
  L.sections.push(sec);
});
lessons.sort((a, b) => a.n - b.n);

const LESSON_TITLES = {
  1: 'The threat, and the math RSA runs on',
  2: 'Math for quantum cryptography',
  3: 'The standards',
  4: 'Lattices and learning with errors',
  5: 'NTRU',
  6: 'CRYSTALS: Kyber and Dilithium',
  7: 'FrodoKEM',
  8: 'The other families',
};
lessons.forEach(L => {
  L.title = LESSON_TITLES[L.n] || L.sections[0].title;
  L.slug = 'lesson-' + L.n;
  L.demos = L.sections.reduce((n, s) => n + (s.html.match(/class="play"/g) || []).length, 0);
  L.figures = L.sections.reduce((n, s) => n + (s.html.match(/<figure/g) || []).length, 0);
  const lede = L.sections[0].html.match(/<p class="lede">([\s\S]*?)<\/p>/);
  L.lede = lede ? lede[1].replace(/<[^>]+>/g, '').trim() : '';
  L.ids = [];
  L.sections.forEach(s => {
    L.ids.push(s.id);
    let idm, idre = /\sid="([^"]+)"/g;
    while ((idm = idre.exec(s.html)) !== null) L.ids.push(idm[1]);
  });
});

/* ---------- map every id to the page it now lives on ---------- */
const idPage = {};
lessons.forEach(L => L.ids.forEach(id => { idPage[id] = L.slug + '/'; }));

function rewriteAnchors(html, fromPage) {
  return html.replace(/href="#([^"]+)"/g, (whole, id) => {
    const target = idPage[id];
    if (!target) return whole;                       // unknown / same-page JS anchor
    if (target === fromPage) return whole;           // same page, keep the plain anchor
    const prefix = fromPage === '' ? '' : '../';
    return 'href="' + prefix + target + '#' + id + '"';
  });
}

/* ---------- shared chrome ---------- */
function lessonNav(current) {
  const up = current === '' ? '' : '../';
  const items = lessons.map(L =>
    '<li><a href="' + up + L.slug + '/"' + (L.slug === current.replace(/\/$/, '') ? ' aria-current="page" class="on"' : '') +
    '>' + L.n + '</a></li>').join('');
  return '<nav class="lessonbar" aria-label="Lessons">\n' +
    '  <a class="home" href="' + (up || './') + '">Contents</a>\n' +
    '  <ul>' + items + '</ul>\n' +
    '  <a class="all" href="' + up + 'all/">One long page</a>\n' +
    '</nav>\n';
}

function pageHead(title, desc, canonical) {
  return head
    .replace(/<title>[\s\S]*?<\/title>/, '<title>' + title + '</title>')
    .replace(/(<meta name="description" content=")[^"]*(">)/, '$1' + desc + '$2')
    .replace(/(<link rel="canonical" href=")[^"]*(">)/, '$1' + canonical + '$2')
    .replace(/(<meta property="og:title" content=")[^"]*(">)/, '$1' + title + '$2')
    .replace(/(<meta property="og:description" content=")[^"]*(">)/, '$1' + desc + '$2')
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, '$1' + canonical + '$2')
    .replace(/(<meta name="twitter:title" content=")[^"]*(">)/, '$1' + title + '$2')
    .replace(/(<meta name="twitter:description" content=")[^"]*(">)/, '$1' + desc + '$2');
}

const EXTRA_CSS = `
<style>
.lessonbar{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin:0 0 1.5rem;padding:.5rem .75rem;
  background:var(--paper);border:1px solid var(--rule);border-radius:10px;font-size:.86rem}
.lessonbar ul{display:flex;gap:.25rem;list-style:none;margin:0;padding:0}
.lessonbar li{margin:0}
.lessonbar ul a{display:inline-block;min-width:1.9rem;padding:.2rem .1rem;text-align:center;border-radius:6px;
  text-decoration:none;color:var(--ink-2);border:1px solid transparent}
.lessonbar ul a:hover{border-color:var(--violet);color:var(--violet)}
.lessonbar ul a.on{background:var(--violet);color:#fff;font-weight:600}
.lessonbar .home,.lessonbar .all{text-decoration:none;color:var(--ink-2);white-space:nowrap}
.lessonbar .home:hover,.lessonbar .all:hover{color:var(--violet)}
.lessonbar .all{margin-left:auto}
.pager{display:flex;justify-content:space-between;gap:1rem;margin:3rem 0 0;padding-top:1.5rem;border-top:1px solid var(--rule)}
.pager a{display:block;max-width:47%;text-decoration:none;color:var(--ink)}
.pager a span{display:block;font-size:.8rem;color:var(--ink-2)}
.pager a:hover{color:var(--violet)}
.pager .next{margin-left:auto;text-align:right}
.lessoncards{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:.9rem;margin:1.5rem 0}
.lessoncard{display:block;padding:.9rem 1rem;background:var(--paper);border:1px solid var(--rule);
  border-left:3px solid var(--violet);border-radius:10px;text-decoration:none;color:var(--ink)}
.lessoncard:hover{border-color:var(--violet)}
.lessoncard b{display:block;font-size:1rem;margin-bottom:.25rem}
.lessoncard .meta{font-size:.78rem;color:var(--ink-2);margin-top:.45rem}
.lessoncard p{margin:0;font-size:.86rem;color:var(--ink-2);line-height:1.5}
</style>`;

function page(opts) {
  return pageHead(opts.title, opts.desc, opts.canonical) + EXTRA_CSS + '\n</head>\n<body>\n<div class="wrap">\n' +
    defs + '\n' + themer + '\n' + opts.body + '\n' + (footer ? rewriteAnchors(footer, opts.page) : '') +
    '\n</div>\n' + scripts + '\n</body>\n</html>\n';
}

/* ---------- write ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

// hub
const heroForHub = rewriteAnchors(hero, '');
const cards = lessons.map(L =>
  '  <a class="lessoncard" href="' + L.slug + '/"><b>Lesson ' + L.n + ' — ' + L.title + '</b>' +
  '<p>' + L.lede.slice(0, 155) + (L.lede.length > 155 ? '…' : '') + '</p>' +
  '<span class="meta">' + L.figures + ' figure' + (L.figures === 1 ? '' : 's') +
  (L.demos ? ' · ' + L.demos + ' demo' + (L.demos === 1 ? '' : 's') : '') + '</span></a>').join('\n');

fs.writeFileSync(path.join(OUT, 'index.html'), page({
  title: 'Quantum Cryptography — illustrated notes',
  desc: "Illustrated study notes for Dr. Chuck Easttom's Quantum Cryptography course: eight lessons, 33 drawn figures and 12 live demos covering RSA, lattices, LWE, NTRU, Kyber and FrodoKEM.",
  canonical: SITE + '/',
  page: '',
  body: heroForHub + '\n<h2 style="border-top:0;margin-top:2rem">The eight lessons</h2>\n<div class="lessoncards">\n' + cards + '\n</div>\n' +
    '<p class="note" style="color:var(--ink-2);font-size:.9rem">Prefer everything at once? <a href="all/">Read it as one long page</a> — same content, one URL, searchable with ⌘F.</p>',
}));

// lesson pages
lessons.forEach((L, i) => {
  const prev = lessons[i - 1], next = lessons[i + 1];
  const body =
    lessonNav(L.slug) +
    '<h1 style="font-size:1.9rem;line-height:1.2;margin:.5rem 0 1.25rem">' +
      '<span style="display:block;font-size:.8rem;font-weight:500;color:var(--violet);letter-spacing:.02em">Lesson ' + L.n + ' of 8</span>' +
      L.title + '</h1>\n' +
    L.sections.map(s => rewriteAnchors(s.html, L.slug + '/')).join('\n') +
    '\n<div class="pager">' +
    (prev ? '<a class="prev" href="../' + prev.slug + '/"><span>← Lesson ' + prev.n + '</span>' + prev.title + '</a>' : '<a class="prev" href="../"><span>←</span>Contents</a>') +
    (next ? '<a class="next" href="../' + next.slug + '/"><span>Lesson ' + next.n + ' →</span>' + next.title + '</a>' : '<a class="next" href="../"><span>→</span>Back to contents</a>') +
    '</div>\n';
  const dir = path.join(OUT, L.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page({
    title: 'Lesson ' + L.n + ': ' + L.title + ' — Quantum Cryptography notes',
    desc: L.lede.slice(0, 180),
    canonical: SITE + '/' + L.slug + '/',
    page: L.slug + '/',
    body: body,
  }));
});

// the complete page, unchanged apart from the nav bar
fs.mkdirSync(path.join(OUT, 'all'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'all', 'index.html'), page({
  title: 'Quantum Cryptography — illustrated notes, lessons 1–8',
  desc: "All eight lessons on one page: RSA, Diffie-Hellman, lattices, LWE, NTRU, Kyber and FrodoKEM worked with real numbers, with 12 live demos.",
  canonical: SITE + '/all/',
  page: 'all/',
  body: lessonNav('all') + hero + '\n' + content,
}));

const count = (d) => fs.readdirSync(d, { withFileTypes: true })
  .reduce((n, e) => n + (e.isDirectory() ? count(path.join(d, e.name)) : (e.name.endsWith('.html') ? 1 : 0)), 0);
console.log('dist/: ' + count(OUT) + ' pages — hub, ' + lessons.length + ' lessons, full page');
lessons.forEach(L => console.log('  ' + L.slug + '/  ' + L.sections.length + ' sections, ' + L.figures + ' figures, ' + L.demos + ' demos — ' + L.title));
