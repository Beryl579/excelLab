"use strict";

/* ================= UTIL & STATE ================= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const STORE = 'excellab_v1';
let prog = { modules: {}, quiz: {} };

try {
  const raw = localStorage.getItem(STORE);
  if (raw) {
    const p = JSON.parse(raw);
    if (p && p.modules && p.quiz) prog = p;
  }
} catch (e) {}

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(prog));
  } catch (e) {}
}

/* ================= THEME (gelap / terang) ================= */
const themeBtn = $('#themeBtn');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  if (themeBtn) themeBtn.textContent = (t === 'dark') ? '☀️ Mode Terang' : '🌙 Mode Gelap';
  try {
    localStorage.setItem('excellab_theme', t);
  } catch (e) {}
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem('excellab_theme');
} catch (e) {}

applyTheme(savedTheme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
if (themeBtn) {
  themeBtn.addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function resetProgres() {
  if (!confirm('Reset semua progres? Tanda selesai modul dan skor kuis akan dihapus.')) return;
  prog = { modules: {}, quiz: {} };
  save();
  $$('.tick').forEach(t => t.textContent = '');
  $$('.done-banner').forEach(b => b.style.display = 'none');
  refreshDashboard();
  alert('Progres berhasil direset. Semangat belajar lagi! 💪');
}

function go(id) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + id);
  if (el) el.classList.add('active');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === id));
  const sb = $('#sidebar');
  if (sb) sb.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (id === 'home') refreshDashboard();
  if (id === 'm8') initPivot();
  if (id === 'sim' && typeof chartBuilt !== 'undefined' && chartBuilt) setTimeout(() => refreshChart(true), 50);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-page]');
  if (t) { go(t.dataset.page); return; }
  const g = e.target.closest('[data-gosim]');
  if (g) { go('sim'); loadScenario(g.dataset.gosim); }
});

/* ================= REVEAL ON SCROLL ================= */
let io = null;
try {
  io = new IntersectionObserver(es => {
    es.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.06 });
  $$('.rv').forEach(el => io.observe(el));
} catch (e) {
  $$('.rv').forEach(el => el.classList.add('in'));
}

/* ================= HERO DEMO ================= */
(function() {
  const fx = $('#demoFx'), res = $('#demoRes');
  if (!fx) return;
  const F = '=SUM(B2:B5)';
  let i = 0, step = 0;
  function loop() {
    if (step === 0) {
      i++;
      fx.textContent = F.slice(0, i);
      res.innerHTML = '&nbsp;';
      res.classList.remove('flash');
      if (i >= F.length) {
        step = 1;
        setTimeout(loop, 650);
        return;
      }
      setTimeout(loop, 80);
    } else if (step === 1) {
      res.textContent = '315';
      res.classList.add('flash');
      step = 2;
      setTimeout(loop, 2300);
    } else {
      fx.textContent = '';
      res.innerHTML = '&nbsp;';
      i = 0;
      step = 0;
      setTimeout(loop, 450);
    }
  }
  loop();
})();

/* ================= QUIZ ENGINE ================= */
function renderQuiz(key) {
  const c = document.getElementById('quiz-' + key);
  if (!c || !QUIZZES[key]) return;
  const qz = QUIZZES[key];
  /* Shuffle soal per sesi (Fisher-Yates) */
  const qs = [...qz.qs];
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  let idx = 0, score = 0;
  c.innerHTML = '<div class="quiz-head"><b class="display">' + qz.title + '</b><span class="tag tag-green" id="qprog-' + key + '">Soal 1/' + qs.length + '</span></div><div id="qbody-' + key + '"></div>';
  const body = document.getElementById('qbody-' + key), progTag = document.getElementById('qprog-' + key);
  
  function show() {
    const q = qs[idx];
    let h = '<div class="quiz-q">' + (idx + 1) + '. ' + escapeHtml(q.q) + '</div>';
    q.o.forEach((opt, i) => {
      h += '<button class="qopt" data-i="' + i + '">' + String.fromCharCode(65 + i) + '. ' + escapeHtml(opt) + '</button>';
    });
    h += '<div class="quiz-x" id="qx-' + key + '"></div><button class="btn btn-primary" id="qnext-' + key + '" style="display:none">Lanjut →</button>';
    body.innerHTML = h;
    progTag.textContent = 'Soal ' + (idx + 1) + '/' + qs.length;
    
    body.querySelectorAll('.qopt').forEach(b => b.addEventListener('click', () => {
      const pick = +b.dataset.i;
      body.querySelectorAll('.qopt').forEach((bb, i) => {
        bb.disabled = true;
        if (i === q.a) bb.classList.add('correct');
        if (i === pick && pick !== q.a) bb.classList.add('wrong');
      });
      if (pick === q.a) score++;
      const x = document.getElementById('qx-' + key);
      x.style.display = 'block';
      x.innerHTML = (pick === q.a ? '✅ <b>Benar!</b> ' : '❌ <b>Kurang tepat.</b> ') + escapeHtml(q.x);
      document.getElementById('qnext-' + key).style.display = 'inline-flex';
    }));

    document.getElementById('qnext-' + key).addEventListener('click', () => {
      idx++;
      if (idx < qs.length) {
        show();
      } else {
        const pct = Math.round(score / qs.length * 100);
        const pass = pct >= 70;
        const prev = prog.quiz[key] || 0;
        if (pct > prev) prog.quiz[key] = pct;
        if (key === 'exam' && pass) prog.modules['exam'] = true;
        save();
        refreshTicks();
        let h = '<div style="text-align:center;padding:14px 0">';
        h += '<div class="score-ring">' + score + '/' + qs.length + ' <span style="font-size:1.4rem;color:' + (pass ? 'var(--green)' : 'var(--red)') + '">(' + pct + '%)</span></div>';
        h += '<p style="margin:10px 0 18px">' + (pass ? '🎉 <b>Lulus!</b> Nilai terbaikmu untuk bagian ini: <b>' + (prog.quiz[key]) + '%</b>' : '💪 Belum lulus (batas 70%). Baca ulang materinya, lalu coba lagi.') + '</p>';
        h += '<button class="btn btn-primary" id="qretry-' + key + '">🔁 Ulangi Kuis</button></div>';
        body.innerHTML = h;
        progTag.textContent = 'Selesai';
        document.getElementById('qretry-' + key).addEventListener('click', () => {
          idx = 0; score = 0; show();
        });
      }
    });
  }
  show();
}

/* ================= SIMULATOR ================= */
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'], ROWS = 12;
let grid = {}, selRef = 'A1';
const E = {};
['DIV0', 'NAME', 'REF', 'VALUE', 'NA', 'CYCLE', 'NUM'].forEach(k => E[k] = { code: '#' + ({ DIV0: 'DIV/0!', NAME: 'NAME?', REF: 'REF!', VALUE: 'VALUE!', NA: 'N/A', CYCLE: 'CYCLE!', NUM: 'NUM!' })[k] });

function colName(n) {
  let s = ''; n++;
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function parseRef(ref) {
  const clean = String(ref).replace(/\$/g, '');
  const m = /^([A-Z]+)([0-9]+)$/.exec(clean);
  if (!m) return null;
  let c = 0;
  for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
  return { col: c, row: parseInt(m[2], 10) };
}

function inGrid(p) { return p && p.col >= 1 && p.col <= COLS.length && p.row >= 1 && p.row <= ROWS; }

function expandRange(a, b) {
  const ca = String(a).replace(/\$/g, ''), cb = String(b).replace(/\$/g, '');
  const pa = parseRef(ca), pb = parseRef(cb);
  if (!pa || !pb) throw E.REF;
  const c1 = Math.min(pa.col, pb.col), c2 = Math.max(pa.col, pb.col);
  const r1 = Math.min(pa.row, pb.row), r2 = Math.max(pa.row, pb.row);
  if ((c2 - c1 + 1) * (r2 - r1 + 1) > 2000) throw E.REF;
  const out = [];
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      out.push(colName(c - 1) + r);
    }
  }
  return out;
}

function getCellValue(ref, cells, seen) {
  const clean = String(ref).replace(/\$/g, '');
  if (!inGrid(parseRef(clean))) throw E.REF;
  if (seen && seen.has(clean)) throw E.CYCLE;
  const raw = cells[clean];
  if (raw === undefined || raw === '') return '';
  if (raw.charAt(0) === '=') {
    const ns = seen ? new Set(seen) : new Set();
    ns.add(clean);
    return evalFormula(raw.slice(1), cells, ns);
  }
  if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(raw.trim())) return parseFloat(raw);
  return raw;
}

function isErrObj(v) { return !!(v && typeof v === 'object' && v.__err && v.__err.code); }
function throwIfErr(v) { if (isErrObj(v)) throw v.__err; return v; }

function toNum(v) {
  throwIfErr(v);
  if (v === '') return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (!isNaN(n) && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(v.trim())) return n;
  }
  throw E.VALUE;
}

function numEq(a, b) {
  throwIfErr(a); throwIfErr(b);
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na === nb;
  }
  return String(a).toLowerCase() === String(b).toLowerCase();
}

function txt(v) {
  throwIfErr(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return formatNum(v);
  return String(v);
}

function formatNum(n) {
  if (!isFinite(n)) throw E.NUM;
  let v = Math.round(n * 1e9) / 1e9;
  if (Object.is(v, -0)) v = 0;
  return String(v);
}

function flattenArgs(args) {
  const out = [];
  for (const a of args) {
    if (a && a.__range) expandRange(a.a, a.b).forEach(r => out.push({ ref: r }));
    else out.push({ val: a });
  }
  return out;
}

const FNS = {
  SUM: { f: a => { const cs = a.cells || grid, sn = a.seen; let s = 0; flattenArgs(a).forEach(x => { const v = x.ref !== undefined ? getCellValue(x.ref, cs, sn) : throwIfErr(x.val); if (typeof v === 'number') s += v; }); return s; } },
  AVERAGE: { f: a => { const cs = a.cells || grid, sn = a.seen; let s = 0, n = 0; flattenArgs(a).forEach(x => { const v = x.ref !== undefined ? getCellValue(x.ref, cs, sn) : throwIfErr(x.val); if (typeof v === 'number') { s += v; n++; } }); if (!n) throw E.DIV0; return s / n; } },
  COUNT: { f: a => { const cs = a.cells || grid, sn = a.seen; let n = 0; flattenArgs(a).forEach(x => { const v = x.ref !== undefined ? getCellValue(x.ref, cs, sn) : throwIfErr(x.val); if (typeof v === 'number') n++; }); return n; } },
  COUNTA: { f: a => { const cs = a.cells || grid, sn = a.seen; let n = 0; flattenArgs(a).forEach(x => { const v = x.ref !== undefined ? getCellValue(x.ref, cs, sn) : throwIfErr(x.val); if (v !== '' && v !== undefined && v !== null) n++; }); return n; } },
  MIN: { f: a => { const cs = a.cells || grid, sn = a.seen; let m = Infinity; flattenArgs(a).forEach(x => { const v = x.ref !== undefined ? getCellValue(x.ref, cs, sn) : throwIfErr(x.val); if (typeof v === 'number' && v < m) m = v; }); return m === Infinity ? 0 : m; } },
  MAX: { f: a => { const cs = a.cells || grid, sn = a.seen; let m = -Infinity; flattenArgs(a).forEach(x => { const v = x.ref !== undefined ? getCellValue(x.ref, cs, sn) : throwIfErr(x.val); if (typeof v === 'number' && v > m) m = v; }); return m === -Infinity ? 0 : m; } },
  ABS: { f: a => Math.abs(toNum(a[0])) },
  ROUND: { f: a => { const p = a.length > 1 ? toNum(a[1]) : 0; const m = Math.pow(10, p); return Math.round(toNum(a[0]) * m) / m; } },
  IF: { f: a => { const c = throwIfErr(a[0]); const truthy = (typeof c === 'string') ? c !== '' : !!c; const bv = truthy ? (a.length > 1 ? a[1] : true) : (a.length > 2 ? a[2] : false); return throwIfErr(bv); } },
  AND: { f: a => { throwIfErr(a); return a.map(v => { throwIfErr(v); if (v && v.__range) return true; return typeof v === 'string' ? v !== '' : !!v; }).every(Boolean); } },
  OR: { f: a => a.map(v => { throwIfErr(v); return v; }).some(v => typeof v === 'string' ? v !== '' : !!v) },
  NOT: { f: a => { const v = throwIfErr(a[0]); return !(typeof v === 'string' ? v !== '' : !!v); } },
  LEFT: { f: a => { const s = txt(a[0]); const n = a.length > 1 ? toNum(a[1]) : 1; return s.slice(0, Math.max(0, n)); } },
  RIGHT: { f: a => { const s = txt(a[0]); const n = a.length > 1 ? toNum(a[1]) : 1; if (n <= 0) return ''; return s.slice(Math.max(0, s.length - n)); } },
  MID: { f: a => { const s = txt(a[0]); const st = toNum(a[1]), n = toNum(a[2]); if (st < 1) throw E.VALUE; return s.slice(st - 1, st - 1 + Math.max(0, n)); } },
  LEN: { f: a => txt(a[0]).length },
  UPPER: { f: a => txt(a[0]).toUpperCase() },
  LOWER: { f: a => txt(a[0]).toLowerCase() },
  PROPER: { f: a => txt(a[0]).replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) },
  TRIM: { f: a => txt(a[0]).replace(/\s+/g, ' ').trim() },
  CONCATENATE: { f: a => a.map(v => txt(throwIfErr(v))).join('') },
  CONCAT: { f: a => a.map(v => txt(throwIfErr(v))).join('') },
  IFERROR: { f: a => { if (isErrObj(a[0])) return a.length > 1 ? a[1] : ''; return a[0]; } },
  VLOOKUP: { f: a => { const needle = throwIfErr(a[0]); const rng = a[1]; const col = toNum(a[2]); const cs = a.cells || grid, sn = a.seen; if (!rng || !rng.__range) throw E.VALUE; const pa = parseRef(rng.a), pb = parseRef(rng.b); if (!pa || !pb) throw E.REF; const c1 = Math.min(pa.col, pb.col), c2 = Math.max(pa.col, pb.col), r1 = Math.min(pa.row, pb.row), r2 = Math.max(pa.row, pb.row); if (col < 1 || col > c2 - c1 + 1) throw E.REF; for (let r = r1; r <= r2; r++) { const v = getCellValue(colName(c1 - 1) + r, cs, sn); if (numEq(v, needle)) return getCellValue(colName(c1 + col - 2) + r, cs, sn); } throw E.NA; } },
  HLOOKUP: { f: a => { const needle = throwIfErr(a[0]); const rng = a[1]; const rowN = toNum(a[2]); const cs = a.cells || grid, sn = a.seen; if (!rng || !rng.__range) throw E.VALUE; const pa = parseRef(rng.a), pb = parseRef(rng.b); if (!pa || !pb) throw E.REF; const c1 = Math.min(pa.col, pb.col), c2 = Math.max(pa.col, pb.col), r1 = Math.min(pa.row, pb.row), r2 = Math.max(pa.row, pb.row); if (rowN < 1 || rowN > r2 - r1 + 1) throw E.REF; for (let c = c1; c <= c2; c++) { const v = getCellValue(colName(c - 1) + r1, cs, sn); if (numEq(v, needle)) return getCellValue(colName(c - 1) + (r1 + rowN - 1), cs, sn); } throw E.NA; } },
  COUNTIF: { f: a => { const rng = a[0]; if (!rng || !rng.__range) throw E.VALUE; const crit = txt(a[1]); const cs = a.cells || grid, sn = a.seen; const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(crit); const op = m[1] || '='; let cv = m[2]; const n = parseFloat(cv); const isNum = cv.trim() !== '' && !isNaN(n) && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(cv.trim()); let count = 0; expandRange(rng.a, rng.b).forEach(ref => { const v = getCellValue(ref, cs, sn); let hit = false; if (op === '=') hit = numEq(v, isNum ? n : cv); else if (op === '<>') hit = !numEq(v, isNum ? n : cv); else { if (typeof v !== 'number') return; const nv = isNum ? n : NaN; if (isNaN(nv)) return; if (op === '>') hit = v > nv; if (op === '<') hit = v < nv; if (op === '>=') hit = v >= nv; if (op === '<=') hit = v <= nv; } if (hit) count++; }); return count; } },
  SUMIF: { f: a => { const rng = a[0]; if (!rng || !rng.__range) throw E.VALUE; const crit = txt(a[1]); const cs = a.cells || grid, sn = a.seen; const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(crit); const op = m[1] || '='; let cv = m[2]; const n = parseFloat(cv); const isNum = cv.trim() !== '' && !isNaN(n) && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(cv.trim()); let sum = 0; const refs = expandRange(rng.a, rng.b); const sumRefs = a.length > 2 && a[2].__range ? expandRange(a[2].a, a[2].b) : refs; refs.forEach((ref, i) => { const v = getCellValue(ref, cs, sn); let hit = false; if (op === '=') hit = numEq(v, isNum ? n : cv); else if (op === '<>') hit = !numEq(v, isNum ? n : cv); else if (typeof v === 'number' && !isNaN(isNum ? n : NaN)) { const nv = isNum ? n : 0; if (op === '>') hit = v > nv; if (op === '<') hit = v < nv; if (op === '>=') hit = v >= nv; if (op === '<=') hit = v <= nv; } if (hit) { const sv = sumRefs[i] !== undefined ? getCellValue(sumRefs[i], cs, sn) : ''; if (typeof sv === 'number') sum += sv; else if (sv !== '') { const ps = parseFloat(sv); if (!isNaN(ps)) sum += ps; } } }); return sum; } },
  SUBSTITUTE: { f: a => { const s = txt(a[0]); const old = txt(a[1]); const nw = txt(a[2]); if (a.length > 3) { const n = Math.round(toNum(a[3])); if (n < 1) throw E.VALUE; let idx = -1, cnt = 0, pos = 0; while ((idx = s.indexOf(old, pos)) !== -1) { cnt++; if (cnt === n) return s.slice(0, idx) + nw + s.slice(idx + old.length); pos = idx + 1; } return s; } return s.split(old).join(nw); } },
  TEXT: { f: a => { const v = toNum(a[0]); const fmt = txt(a[1]); if (fmt.includes('%')) { const dm = /0\.(0+)/.exec(fmt); const dec = dm ? dm[1].length : 0; return (v * 100).toFixed(dec) + '%'; } if (fmt.includes('0.')) return v.toFixed(fmt.split('.')[1].replace(/[^0#]/g, '').length); if (fmt === '0') return String(Math.round(v)); return String(v); } },
  TODAY: { f: () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); } },
  NOW: { f: () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); } },
  YEAR: { f: a => { const s = txt(a[0]); const d = new Date(s); if (isNaN(d)) throw E.VALUE; return d.getFullYear(); } },
  MONTH: { f: a => { const s = txt(a[0]); const d = new Date(s); if (isNaN(d)) throw E.VALUE; return d.getMonth() + 1; } },
  DAY: { f: a => { const s = txt(a[0]); const d = new Date(s); if (isNaN(d)) throw E.VALUE; return d.getDate(); } },
  DATEDIF: { f: a => { const d1 = new Date(txt(a[0])), d2 = new Date(txt(a[1])), u = txt(a[2]).toUpperCase(); if (isNaN(d1) || isNaN(d2)) throw E.VALUE; if (d2 < d1) throw E.NUM; const ms = d2 - d1; if (u === 'D') return Math.floor(ms / 86400000); if (u === 'M') { let m = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()); if (d2.getDate() < d1.getDate()) m--; return m; } if (u === 'Y') { let y = d2.getFullYear() - d1.getFullYear(); if (d2.getMonth() < d1.getMonth() || (d2.getMonth() === d1.getMonth() && d2.getDate() < d1.getDate())) y--; return y; } throw E.VALUE; } },
  INDEX: { f: a => { const rng = a[0]; if (!rng || !rng.__range) throw E.VALUE; const rowN = Math.round(toNum(a[1])); const colN = a.length > 2 ? Math.round(toNum(a[2])) : 1; const cs = a.cells || grid, sn = a.seen; const pa = parseRef(rng.a), pb = parseRef(rng.b); if (!pa || !pb) throw E.REF; const r1 = Math.min(pa.row, pb.row), c1 = Math.min(pa.col, pb.col); return getCellValue(colName(c1 + colN - 2) + (r1 + rowN - 1), cs, sn); } },
  MATCH: { f: a => { const needle = throwIfErr(a[0]); const rng = a[1]; if (!rng || !rng.__range) throw E.VALUE; const matchType = a.length > 2 ? toNum(a[2]) : 1; const cs = a.cells || grid, sn = a.seen; const refs = expandRange(rng.a, rng.b); for (let i = 0; i < refs.length; i++) { const v = getCellValue(refs[i], cs, sn); if (matchType === 0 && numEq(v, needle)) return i + 1; if (matchType === 1 && typeof v === 'number' && typeof needle === 'number' && v <= needle) { if (i === refs.length - 1 || getCellValue(refs[i + 1], cs, sn) > needle) return i + 1; } if (matchType === -1 && typeof v === 'number' && typeof needle === 'number' && v >= needle) { if (i === refs.length - 1 || getCellValue(refs[i + 1], cs, sn) < needle) return i + 1; } } throw E.NA; } },
  IFS: { f: a => { for (let i = 0; i + 1 < a.length; i += 2) { const cond = throwIfErr(a[i]); const truthy = (typeof cond === 'string') ? cond !== '' : !!cond; if (truthy) return throwIfErr(a[i + 1]); } throw E.NA; } },
  XLOOKUP: { f: a => { const needle = throwIfErr(a[0]); const lookupRng = a[1]; const returnRng = a[2]; if (!lookupRng || !lookupRng.__range || !returnRng || !returnRng.__range) throw E.VALUE; const cs = a.cells || grid, sn = a.seen; const notFound = a.length > 3 ? throwIfErr(a[3]) : null; const lookupRefs = expandRange(lookupRng.a, lookupRng.b); const returnRefs = expandRange(returnRng.a, returnRng.b); for (let i = 0; i < lookupRefs.length; i++) { const v = getCellValue(lookupRefs[i], cs, sn); if (numEq(v, needle)) return getCellValue(returnRefs[i] || returnRefs[returnRefs.length - 1], cs, sn); } if (notFound !== null) return notFound; throw E.NA; } },
  ISNUMBER: { f: a => { if (isErrObj(a[0])) return false; return typeof a[0] === 'number'; } },
  ISBLANK: { f: a => { if (isErrObj(a[0])) return false; return a[0] === '' || a[0] === null || a[0] === undefined; } },
  ISERROR: { f: a => isErrObj(a[0]) },
  AVERAGEIF: { f: a => { const rng = a[0]; if (!rng || !rng.__range) throw E.VALUE; const crit = txt(a[1]); const cs = a.cells || grid, sn = a.seen; const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(crit); const op = m[1] || '='; let cv = m[2]; const n = parseFloat(cv); const isNum = cv.trim() !== '' && !isNaN(n); let sum = 0, cnt = 0; const refs = expandRange(rng.a, rng.b); const avgRefs = a.length > 2 && a[2].__range ? expandRange(a[2].a, a[2].b) : refs; refs.forEach((ref, i) => { const v = getCellValue(ref, cs, sn); let hit = false; if (op === '=') hit = numEq(v, isNum ? n : cv); else if (op === '<>') hit = !numEq(v, isNum ? n : cv); else if (typeof v === 'number') { const nv = isNum ? n : 0; if (op === '>') hit = v > nv; if (op === '<') hit = v < nv; if (op === '>=') hit = v >= nv; if (op === '<=') hit = v <= nv; } if (hit) { const sv = getCellValue(avgRefs[i] || ref, cs, sn); if (typeof sv === 'number') { sum += sv; cnt++; } } }); if (!cnt) throw E.DIV0; return sum / cnt; } },
  COUNTIFS: { f: a => { const cs = a.cells || grid, sn = a.seen; if (a.length < 2 || a.length % 2 !== 0) throw E.VALUE; const pairs = []; for (let i = 0; i < a.length; i += 2) { if (!a[i] || !a[i].__range) throw E.VALUE; pairs.push([expandRange(a[i].a, a[i].b), txt(a[i + 1])]); } const n0 = pairs[0][0].length; let cnt = 0; for (let i = 0; i < n0; i++) { let ok = true; for (const [refs, crit] of pairs) { const mm = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(crit); const op = mm[1] || '='; const cv = mm[2]; const nn = parseFloat(cv); const isN = cv.trim() !== '' && !isNaN(nn) && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(cv.trim()); const v = getCellValue(refs[i] !== undefined ? refs[i] : refs[refs.length - 1], cs, sn); if (op === '=') { if (!numEq(v, isN ? nn : cv)) { ok = false; break; } } else if (op === '<>') { if (numEq(v, isN ? nn : cv)) { ok = false; break; } } else { if (typeof v !== 'number' || !isN) { ok = false; break; } if (op === '>' && !(v > nn)) { ok = false; break; } if (op === '<' && !(v < nn)) { ok = false; break; } if (op === '>=' && !(v >= nn)) { ok = false; break; } if (op === '<=' && !(v <= nn)) { ok = false; break; } } } if (ok) cnt++; } return cnt; } },
  SUMIFS: { f: a => { const cs = a.cells || grid, sn = a.seen; if (a.length < 3 || a.length % 2 === 0) throw E.VALUE; if (!a[0] || !a[0].__range) throw E.VALUE; const sumRefs = expandRange(a[0].a, a[0].b); const pairs = []; for (let i = 1; i < a.length; i += 2) { if (!a[i] || !a[i].__range) throw E.VALUE; pairs.push([expandRange(a[i].a, a[i].b), txt(a[i + 1])]); } let sum = 0; for (let i = 0; i < sumRefs.length; i++) { let ok = true; for (const [refs, crit] of pairs) { const mm = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(crit); const op = mm[1] || '='; const cv = mm[2]; const nn = parseFloat(cv); const isN = cv.trim() !== '' && !isNaN(nn) && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(cv.trim()); const v = getCellValue(refs[i] !== undefined ? refs[i] : refs[refs.length - 1], cs, sn); if (op === '=') { if (!numEq(v, isN ? nn : cv)) { ok = false; break; } } else if (op === '<>') { if (numEq(v, isN ? nn : cv)) { ok = false; break; } } else { if (typeof v !== 'number' || !isN) { ok = false; break; } if (op === '>' && !(v > nn)) { ok = false; break; } if (op === '<' && !(v < nn)) { ok = false; break; } if (op === '>=' && !(v >= nn)) { ok = false; break; } if (op === '<=' && !(v <= nn)) { ok = false; break; } } } if (ok) { const sv = getCellValue(sumRefs[i], cs, sn); if (typeof sv === 'number') sum += sv; } } return sum; } }
};

function tokenize(str) {
  str = String(str).replace(/\$/g, '');
  const toks = []; let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === ' ' || ch === '\t') { i++; continue; }
    if (ch === '%') { toks.push({ t: '%' }); i++; continue; }
    if (/[0-9.]/.test(ch)) { let num = '', dotSeen = false; while (i < str.length && /[0-9.]/.test(str[i])) { if (str[i] === '.') { if (dotSeen) break; dotSeen = true; } num += str[i]; i++; } if (num === '.' || num === '') { i++; continue; } toks.push({ t: 'num', v: parseFloat(num) }); continue; }
    if (ch === '"') { let s = ''; i++; while (i < str.length && str[i] !== '"') { s += str[i]; i++; } i++; toks.push({ t: 'str', v: s }); continue; }
    if (/[A-Za-z_]/.test(ch)) { let id = ''; while (i < str.length && /[A-Za-z0-9_.]/.test(str[i])) { id += str[i]; i++; } toks.push({ t: 'id', v: id.toUpperCase() }); continue; }
    if (ch === ';' || ch === ',') { toks.push({ t: ',' }); i++; continue; }
    if (ch === '(' || ch === ')' || ch === ':' || ch === '&') { toks.push({ t: ch }); i++; continue; }
    if (ch === '<' || ch === '>') { if (str[i + 1] === '=') { toks.push({ t: 'op', v: ch + '=' }); i += 2; continue; } if (ch === '<' && str[i + 1] === '>') { toks.push({ t: 'op', v: '<>' }); i += 2; continue; } toks.push({ t: 'op', v: ch }); i++; continue; }
    if (ch === '=') { toks.push({ t: 'op', v: '=' }); i++; continue; }
    if ('+-*/^'.includes(ch)) { toks.push({ t: 'op', v: ch }); i++; continue; }
    i++;
  }
  return toks;
}

function Parser(toks, cells, seen) {
  this.toks = toks; this.pos = 0; this.cells = cells; this.seen = seen;
}
Parser.prototype.peek = function() { return this.toks[this.pos]; };
Parser.prototype.next = function() { return this.toks[this.pos++]; };
Parser.prototype.isOp = function(v) { const t = this.peek(); return t && t.t === 'op' && t.v === v; };
Parser.prototype.parseComparison = function() {
  let left = this.parseConcat();
  while (true) {
    const t = this.peek();
    if (t && t.t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(t.v)) {
      this.next();
      const right = this.parseConcat();
      left = compare(left, t.v, right);
    } else break;
  }
  return left;
};

function compare(a, op, b) {
  throwIfErr(a); throwIfErr(b);
  const bothNum = typeof a === 'number' && typeof b === 'number';
  let r;
  if (op === '=') r = bothNum ? a === b : String(a).toLowerCase() === String(b).toLowerCase();
  else if (op === '<>') r = !(bothNum ? a === b : String(a).toLowerCase() === String(b).toLowerCase());
  else {
    const na = bothNum ? a : NaN, nb = bothNum ? b : NaN;
    const as = String(a).toLowerCase(), bs = String(b).toLowerCase();
    if (op === '<') r = bothNum ? na < nb : as < bs;
    else if (op === '>') r = bothNum ? na > nb : as > bs;
    else if (op === '<=') r = bothNum ? na <= nb : as <= bs;
    else r = bothNum ? na >= nb : as >= bs;
  }
  return r;
}

Parser.prototype.parseConcat = function() {
  let left = this.parseExpr();
  throwIfErr(left);
  while (this.peek() && this.peek().t === '&') {
    this.next();
    const right = this.parseExpr();
    left = txt(left) + txt(right);
  }
  return left;
};
Parser.prototype.parseExpr = function() {
  let left = this.parseTerm();
  throwIfErr(left);
  while (true) {
    const t = this.peek();
    if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
      this.next();
      const right = this.parseTerm();
      throwIfErr(right);
      const a = toNum(left), b = toNum(right);
      left = t.v === '+' ? a + b : a - b;
    } else break;
  }
  return left;
};
Parser.prototype.parseTerm = function() {
  let left = this.parseUnary();
  throwIfErr(left);
  while (true) {
    const t = this.peek();
    if (t && t.t === 'op' && (t.v === '*' || t.v === '/')) {
      this.next();
      const right = this.parseUnary();
      throwIfErr(right);
      const a = toNum(left), b = toNum(right);
      if (t.v === '/') {
        if (b === 0) throw E.DIV0;
        left = a / b;
      } else left = a * b;
    } else break;
  }
  return left;
};
Parser.prototype.parseUnary = function() {
  const t = this.peek();
  if (t && t.t === 'op' && (t.v === '-' || t.v === '+')) {
    this.next();
    const v = this.parseUnary();
    throwIfErr(v);
    return t.v === '-' ? -toNum(v) : toNum(v);
  }
  return this.parsePower();
};
Parser.prototype.parsePower = function() {
  let base = this.parsePostfix();
  throwIfErr(base);
  if (this.isOp('^')) {
    this.next();
    const exp = this.parseUnary();
    throwIfErr(exp);
    return Math.pow(toNum(base), toNum(exp));
  }
  return base;
};
Parser.prototype.parsePostfix = function() {
  let v = this.parsePrimary();
  throwIfErr(v);
  while (this.peek() && this.peek().t === '%') {
    this.next();
    v = toNum(v) / 100;
  }
  return v;
};
Parser.prototype.parsePrimary = function() {
  const t = this.peek();
  if (!t) throw E.NAME;
  if (t.t === 'num') { this.next(); return t.v; }
  if (t.t === 'str') { this.next(); return t.v; }
  if (t.t === '(') {
    this.next();
    const v = this.parseComparison();
    const c = this.peek();
    if (!c || c.t !== ')') throw E.VALUE;
    this.next();
    return v;
  }
  if (t.t === 'id') {
    this.next();
    const name = t.v;
    const nx = this.peek();
    if (nx && nx.t === '(') {
      this.next();
      const args = [];
      if (!(this.peek() && this.peek().t === ')')) {
        args.push(this.parseArg());
        while (this.peek() && this.peek().t === ',') {
          this.next();
          args.push(this.parseArg());
        }
      }
      const c = this.peek();
      if (!c || c.t !== ')') throw E.NAME;
      this.next();
      return callFn(name, args, this.cells, this.seen);
    }
    if (parseRef(name)) {
      const nx2 = this.peek();
      if (nx2 && nx2.t === ':') {
        this.next();
        const t2 = this.peek();
        if (!t2 || t2.t !== 'id' || !parseRef(t2.v)) throw E.REF;
        this.next();
        return { __range: true, a: name, b: t2.v };
      }
      return getCellValue(name, this.cells, this.seen);
    }
    if (name === 'TRUE') return true;
    if (name === 'FALSE') return false;
    if (name === 'PI') return Math.PI;
    throw E.NAME;
  }
  throw E.NAME;
};
Parser.prototype.parseArg = function() {
  try {
    const v = this.parseComparison();
    return v;
  } catch (e) {
    if (e && e.code) return { __err: e };
    throw e;
  }
};

function callFn(name, args, cells, seen) {
  const spec = FNS[name];
  if (!spec) throw E.NAME;
  args.seen = seen; args.cells = cells;
  const passThrough = (name === 'IFERROR' || name === 'ISERROR' || name === 'ISNUMBER' || name === 'ISBLANK');
  if (!passThrough) {
    for (const a of args) throwIfErr(a);
  }
  try { return spec.f(args); }
  catch (e) { if (e && e.code) throw e; throw E.VALUE; }
}

function evalFormula(str, cells, seen) {
  const toks = tokenize(str);
  if (!toks.length) throw E.NAME;
  const p = new Parser(toks, cells, seen);
  const v = p.parseComparison();
  if (p.pos < toks.length) throw E.NAME;
  return v;
}

function displayValue(ref) {
  const clean = String(ref).replace(/\$/g, '');
  const raw = grid[clean];
  if (raw === undefined || raw === '') return { text: '', isNum: false, isErr: false };
  if (raw.charAt(0) === '=') {
    try {
      const v = evalFormula(raw.slice(1), grid, new Set([clean]));
      if (isErrObj(v)) throw v.__err;
      if (typeof v === 'number') return { text: formatNum(v), isNum: true, isErr: false };
      if (typeof v === 'boolean') return { text: v ? 'TRUE' : 'FALSE', isNum: false, isErr: false };
      return { text: String(v), isNum: false, isErr: false };
    } catch (e) {
      return { text: (e && e.code) ? e.code : '#ERROR!', isNum: false, isErr: true };
    }
  }
  if (raw.trim() !== '' && isFinite(raw)) return { text: raw.trim(), isNum: true, isErr: false };
  return { text: raw, isNum: false, isErr: false };
}

function renderGrid() {
  const wrap = $('#simGrid');
  if (!wrap) return;
  let html = '<div class="gh"></div>';
  COLS.forEach(c => html += '<div class="gh">' + c + '</div>');
  for (let r = 1; r <= ROWS; r++) {
    html += '<div class="gh">' + r + '</div>';
    COLS.forEach(c => {
      const ref = c + r;
      const d = displayValue(ref);
      const t = String(d.text).toUpperCase();
      const cf = (!d.isErr && !d.isNum && (t === 'RESTOCK' || t === 'BINA')) ? ' cf-bad' : ((!d.isErr && !d.isNum && (t === 'AMAN' || t === 'BAIK' || t === 'LULUS')) ? ' cf-good' : '');
      const cls = 'cell' + (ref === selRef ? ' sel' : '') + (d.isErr ? ' err' : (d.isNum ? ' num' : '')) + cf;
      html += '<div class="' + cls + '" data-ref="' + ref + '" title="' + escapeHtml(d.text) + '">' + escapeHtml(d.text) + '</div>';
    });
  }
  wrap.innerHTML = html;
}

function commit(ref, value) {
  if (value === '') delete grid[ref];
  else grid[ref] = value;
  renderGrid();
  if (typeof chartBuilt !== 'undefined' && chartBuilt) refreshChart(true);
}

function syncFx() {
  const fx = $('#fxInput');
  if (fx && document.activeElement !== fx) fx.value = grid[selRef] || '';
  const fn = $('#fxName');
  if (fn) fn.textContent = selRef;
}

const simGridEl = $('#simGrid');
if (simGridEl) {
  simGridEl.addEventListener('click', e => {
    const cell = e.target.closest('.cell');
    if (!cell || cell.querySelector('input')) return;
    selRef = cell.dataset.ref;
    renderGrid();
    syncFx();
    const fxi = $('#fxInput');
    if (fxi) fxi.focus();
  });

  simGridEl.addEventListener('dblclick', e => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    selRef = cell.dataset.ref;
    const raw = grid[selRef] || '';
    cell.innerHTML = '<input value="' + escapeHtml(raw) + '" spellcheck="false">';
    const inp = cell.querySelector('input');
    inp.focus();
    function fin() { commit(selRef, inp.value); syncFx(); }
    inp.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') fin();
      if (ev.key === 'Escape') { renderGrid(); syncFx(); }
    });
    inp.addEventListener('blur', fin);
  });
}

document.addEventListener('keydown', e => {
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  if (document.activeElement && document.activeElement.id === 'fxInput') return;
  const activePage = $('.page.active');
  if (!activePage || activePage.id !== 'page-sim') return;
  const p = parseRef(selRef);
  if (!p) return;
  if (e.key === 'ArrowDown' && p.row < ROWS) selRef = colName(p.col - 1) + (p.row + 1);
  else if (e.key === 'ArrowUp' && p.row > 1) selRef = colName(p.col - 1) + (p.row - 1);
  else if (e.key === 'ArrowRight' && p.col < COLS.length) selRef = colName(p.col) + p.row;
  else if (e.key === 'ArrowLeft' && p.col > 1) selRef = colName(p.col - 2) + p.row;
  else return;
  e.preventDefault();
  renderGrid();
  syncFx();
});

const fxInputEl = $('#fxInput');
if (fxInputEl) {
  fxInputEl.addEventListener('keydown', e => {
    const p = parseRef(selRef);
    if (e.key === 'Enter') {
      commit(selRef, e.target.value);
      if (p && p.row < ROWS) { selRef = colName(p.col - 1) + (p.row + 1); }
      renderGrid(); syncFx(); e.preventDefault(); return;
    }
    if (e.key === 'Tab') {
      commit(selRef, e.target.value);
      if (p) { const nc = p.col < COLS.length ? p.col : 1, nr = p.col < COLS.length ? p.row : p.row + 1; selRef = colName(nc - 1) + Math.min(nr, ROWS); }
      renderGrid(); syncFx(); e.preventDefault(); return;
    }
    if (e.key === 'ArrowDown' && !e.target.value) {
      if (p && p.row < ROWS) { selRef = colName(p.col - 1) + (p.row + 1); renderGrid(); syncFx(); e.preventDefault(); } return;
    }
    if (e.key === 'ArrowUp' && !e.target.value) {
      if (p && p.row > 1) { selRef = colName(p.col - 1) + (p.row - 1); renderGrid(); syncFx(); e.preventDefault(); } return;
    }
    if (e.key === 'ArrowRight' && !e.target.value) {
      if (p && p.col < COLS.length) { selRef = colName(p.col) + p.row; renderGrid(); syncFx(); e.preventDefault(); } return;
    }
    if (e.key === 'ArrowLeft' && !e.target.value) {
      if (p && p.col > 1) { selRef = colName(p.col - 2) + p.row; renderGrid(); syncFx(); e.preventDefault(); } return;
    }
  });

  fxInputEl.addEventListener('blur', e => {
    if (grid[selRef] !== undefined || e.target.value !== '') commit(selRef, e.target.value);
  });
}

function loadScenario(name) {
  grid = {};
  const sc = SCENARIOS[name] || {};
  for (const k in sc) grid[k] = sc[k];
  selRef = 'A1';
  renderGrid();
  syncFx();
  const sh = $('#simHint');
  if (sh) sh.textContent = SCEN_HINT[name] || '';
  $$('.sc-btn').forEach(b => b.classList.toggle('on', b.dataset.sc === name));
  applyChartDefaults(name);
  refreshChart(true);
}
$$('.sc-btn').forEach(b => b.addEventListener('click', () => loadScenario(b.dataset.sc)));

/* ================= CSV EXPORT / IMPORT ================= */
const btnExport = $('#btnExport');
if (btnExport) {
  btnExport.addEventListener('click', () => {
    let csv = '';
    for (let r = 1; r <= ROWS; r++) {
      const row = [];
      COLS.forEach(c => {
        const v = grid[c + r];
        let s = v === undefined ? '' : String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) s = '"' + s.replace(/"/g, '""') + '"';
        row.push(s);
      });
      csv += row.join(',') + '\r\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'excellab-data.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function parseCSVLine(line) {
  const out = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const fileImport = $('#fileImport');
if (fileImport) {
  fileImport.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      grid = {};
      String(reader.result).split(/\r?\n/).forEach((line, ri) => {
        if (!line.trim()) return;
        const row = parseCSVLine(line);
        const r = ri + 1;
        COLS.forEach((c, ci) => {
          const val = row[ci];
          if (val !== undefined && String(val).trim() !== '') grid[c + r] = String(val).trim();
        });
      });
      selRef = 'A1';
      renderGrid();
      syncFx();
      const sh = $('#simHint');
      if (sh) sh.textContent = '📂 Data CSV berhasil dimuat ke grid. Rumus dalam CSV ikut dievaluasi otomatis.';
      refreshChart(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

/* ================= SIM CHART ================= */
const CHART_DEFAULTS = {
  siswa: ['A2:A5', 'B2:B5'],
  kasir: ['A2:A4', 'C2:C4'],
  kode: ['A2:A4', 'B2:B4'],
  logika: ['A2:A5', 'B2:B5'],
  analisis: ['A2:A9', 'C2:C9'],
  gudang: ['A2:A6', 'E2:E6'],
  absensi: ['A2:A6', 'E2:E6'],
  warung: ['A2:A6', 'F2:F6'],
  bersih: ['B2:B4', 'B2:B4'],
  kosong: ['A2:A6', 'B2:B6']
};
let chartBuilt = false;

function applyChartDefaults(name) {
  const d = CHART_DEFAULTS[name];
  if (!d) return;
  const li = $('#chartLabels'), vi = $('#chartValues');
  if (li) li.value = d[0];
  if (vi) vi.value = d[1];
}

function parseChartRange(s) {
  s = String(s || '').replace(/\$/g, '').trim().toUpperCase();
  if (!s) throw E.REF;
  if (s.indexOf(':') === -1) {
    if (!parseRef(s)) throw E.REF;
    return [s];
  }
  const parts = s.split(':');
  if (parts.length !== 2 || !parseRef(parts[0]) || !parseRef(parts[1])) throw E.REF;
  return expandRange(parts[0], parts[1]);
}

function getChartData() {
  const li = $('#chartLabels'), vi = $('#chartValues');
  const lr = parseChartRange(li ? li.value : 'A2:A6');
  const vr = parseChartRange(vi ? vi.value : 'E2:E6');
  const n = Math.min(lr.length, vr.length);
  if (!n) throw E.VALUE;
  const labels = [], values = [];
  let skipped = 0;
  for (let i = 0; i < n; i++) {
    let lab = '';
    try {
      const v = getCellValue(lr[i], grid, new Set());
      lab = (typeof v === 'number') ? formatNum(v) : String(v);
      if (!lab) lab = lr[i];
    } catch (e) { lab = lr[i]; }
    let num = NaN;
    try {
      const v = getCellValue(vr[i], grid, new Set());
      if (typeof v === 'number') num = v;
      else if (typeof v === 'string' && v.trim() !== '' && isFinite(v)) num = parseFloat(v);
      else throw E.VALUE;
    } catch (e) { skipped++; continue; }
    if (!isFinite(num)) { skipped++; continue; }
    labels.push(lab);
    values.push(num);
  }
  return { labels, values, skipped };
}

function drawChart(labels, values, type) {
  const cv = $('#simChart');
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || cv.parentElement.clientWidth || 600;
  const h = 280;
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const ink = dark ? '#E6F2E9' : '#0D2318';
  const mut = dark ? '#93A89B' : '#5C7264';
  const gridLine = dark ? '#24402F' : '#DCE6DA';
  const pal = ['#107C41', '#3FBF7F', '#0B5CAD', '#C77700', '#7C5CFF', '#E5486B', '#0EA5B7', '#B7E96D'];
  ctx.font = '11px IBM Plex Sans, sans-serif';
  if (!values.length) {
    ctx.fillStyle = mut;
    ctx.fillText('Tidak ada angka valid pada range Nilai.', 16, 40);
    return;
  }
  const max = Math.max.apply(null, values.concat([0]));
  const min = Math.min.apply(null, values.concat([0]));
  const padL = 52, padR = 14, padT = 16, padB = 44;
  const cw = w - padL - padR, ch = h - padT - padB;
  function yOf(v) {
    const span = (max - min) || 1;
    return padT + ch - ((v - min) / span) * ch;
  }
  if (type === 'pie') {
    const total = values.reduce((a, b) => a + b, 0);
    const cx = w / 2, cy = h / 2 - 6, R = Math.min(cw, ch) / 2 - 6;
    if (!(total > 0)) {
      ctx.fillStyle = mut;
      ctx.fillText('Pie butuh total > 0.', 16, 40);
      return;
    }
    let ang = -Math.PI / 2;
    labels.forEach((lb, i) => {
      const frac = values[i] / total;
      const a2 = ang + frac * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, ang, a2);
      ctx.closePath();
      ctx.fillStyle = pal[i % pal.length];
      ctx.fill();
      const mid = (ang + a2) / 2;
      const pct = (frac * 100).toFixed(1) + '%';
      ctx.fillStyle = ink;
      ctx.fillText(String(lb).slice(0, 12) + ' ' + pct, cx + Math.cos(mid) * (R + 8) - 18, cy + Math.sin(mid) * (R + 8));
      ang = a2;
    });
    return;
  }
  ctx.strokeStyle = gridLine;
  ctx.fillStyle = mut;
  for (let g = 0; g <= 4; g++) {
    const v = min + (max - min) * g / 4;
    const y = yOf(v);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    ctx.fillText(Number(v.toFixed(1)).toLocaleString('id-ID'), 6, y + 4);
  }
  const n = values.length;
  const slot = cw / n;
  if (type === 'bar') {
    const bw = Math.min(46, slot * 0.55);
    labels.forEach((lb, i) => {
      const x = padL + slot * i + (slot - bw) / 2;
      const y = yOf(values[i]);
      const y0 = yOf(0);
      ctx.fillStyle = pal[i % pal.length];
      ctx.fillRect(x, Math.min(y, y0), bw, Math.abs(y0 - y) || 2);
      ctx.fillStyle = ink;
      ctx.fillText(values[i].toLocaleString('id-ID'), x - 4, Math.min(y, y0) - 6);
      ctx.fillStyle = mut;
      ctx.fillText(String(lb).slice(0, 10), x - 6, h - 12);
    });
  } else {
    ctx.strokeStyle = '#107C41';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    labels.forEach((lb, i) => {
      const x = padL + slot * i + slot / 2;
      const y = yOf(values[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineWidth = 1;
    labels.forEach((lb, i) => {
      const x = padL + slot * i + slot / 2;
      const y = yOf(values[i]);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = pal[i % pal.length];
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.fillText(values[i].toLocaleString('id-ID'), x - 10, y - 10);
      ctx.fillStyle = mut;
      ctx.fillText(String(lb).slice(0, 10), x - 14, h - 12);
    });
  }
}

function refreshChart(silent) {
  const msg = $('#chartMsg');
  try {
    const d = getChartData();
    const tp = ($('#chartType') || {}).value || 'bar';
    drawChart(d.labels, d.values, tp);
    chartBuilt = true;
    if (msg) {
      msg.style.display = d.skipped ? 'block' : 'none';
      if (d.skipped) msg.textContent = d.skipped + ' baris dilewati (bukan angka / error). Grafik update otomatis saat grid berubah.';
    }
    return true;
  } catch (e) {
    if (!silent && msg) {
      msg.style.display = 'block';
      msg.textContent = 'Grafik belum bisa dibuat: periksa range Label/Nilai (contoh A2:A6 dan E2:E6).';
    }
    if (!silent) chartBuilt = false;
    return false;
  }
}

const chartBtn = $('#chartBtn');
if (chartBtn) chartBtn.addEventListener('click', () => refreshChart(false));
const chartTypeSel = $('#chartType');
if (chartTypeSel) chartTypeSel.addEventListener('change', () => { if (chartBuilt) refreshChart(true); });
window.addEventListener('resize', () => { if (chartBuilt) refreshChart(true); });

/* ================= VIDEO BELAJAR ================= */
const videoGrid = $('#videoGrid');
if (videoGrid && typeof VIDEOS !== 'undefined') {
  videoGrid.innerHTML = VIDEOS.map(v =>
    '<div class="card rv" style="padding:14px"><div style="position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden;background:var(--deep)"><iframe style="position:absolute;inset:0;width:100%;height:100%;border:0" src="https://www.youtube.com/embed/' + v.id + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" title="' + escapeHtml(v.t) + '"></iframe></div><h3 style="margin:12px 0 4px;font-size:1rem">' + escapeHtml(v.t) + '</h3><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:.83rem;color:var(--mut)">' + escapeHtml(v.ch) + ' · ' + v.lang + '</span><span class="tag tag-green">' + escapeHtml(v.mod) + '</span></div></div>'
  ).join('');
  try { $$('#videoGrid .rv').forEach(el => io.observe(el)); } catch (e) { $$('#videoGrid .rv').forEach(el => el.classList.add('in')); }
}

/* ================= TUTOR AI (GROQ) ================= */
function mdTable(rows) {
  const cells = r => r.trim().replace(/^\|/, '').replace(/\|\s*$/, '').split(/\s*\|\s*/);
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  let t = '<table class="chat-tbl"><thead><tr>' + head.map(x => '<th>' + escapeHtml(x) + '</th>').join('') + '</tr></thead><tbody>';
  t += body.map(r => '<tr>' + r.map(x => '<td>' + escapeHtml(x) + '</td>').join('') + '</tr>').join('');
  t += '</tbody></table>';
  return '<div class="tbl-box"><button class="tbl-copy" onclick="copyTbl(this)" title="Salin tabel">📋</button>' + t + '</div>';
}

function copyTbl(btn) {
  const rows = btn.parentElement.querySelectorAll('table tr');
  const txt = Array.from(rows).map(r => Array.from(r.querySelectorAll('th,td')).map(c => c.textContent.trim()).join('\t')).join('\n');
  const done = () => { btn.textContent = '✅'; setTimeout(() => btn.textContent = '📋', 1400); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done).catch(() => {});
  }
}

function md(s) {
  s = String(s);
  const lines = s.split(/\r?\n/), out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*\|/.test(l) && i + 1 < lines.length && /^\s*\|?[\s:]*-{2,}(?:\|[\s:]*-{2,})*\|?\s*$/.test(lines[i + 1])) {
      const rows = [l, lines[i + 1]]; let j = i + 2;
      while (j < lines.length && /^\s*\|/.test(lines[j])) { rows.push(lines[j]); j++; }
      out.push(mdTable(rows)); i = j - 1; continue;
    }
    out.push(escapeHtml(l));
  }
  let h = out.join('\n');
  h = h.replace(/`([^`]+)`/g, '<span class="f">$1</span>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  h = h.replace(/^\s*[-*]\s+/gm, '• ');
  h = h.replace(/^\s*\d+\.\s+/gm, '• ');
  h = h.replace(/^#{1,3}\s*(.+)$/gm, '<b>$1</b>');
  return h.replace(/\n/g, '<br>');
}

/* ===== PREFERENSI TUTOR (nama panggilan + mode) ===== */
const PREFS_KEY = 'excellab_prefs';
let prefs = { nick: '', mode: 'jelas' };
try {
  const r = localStorage.getItem(PREFS_KEY);
  if (r) {
    const p = JSON.parse(r);
    if (p && typeof p.nick === 'string') prefs.nick = p.nick;
    if (p && (p.mode === 'praktik' || p.mode === 'jelas')) prefs.mode = p.mode;
  }
} catch (e) {}

function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {}
}

function applyPrefsUI() {
  $$('[data-pref="nick"]').forEach(i => { i.value = prefs.nick; });
  $$('[data-pref="mode"]').forEach(b => { b.classList.toggle('on', b.dataset.v === prefs.mode); });
  const note = prefs.mode === 'praktik'
    ? '⚡ <b>Praktik:</b> jawaban singkat, langsung rumus siap pakai. Cocok saat mau cepat selesai.'
    : '📚 <b>Jelasan:</b> penjelasan langkah demi langkah. Cocok saat mau paham konsepnya.';
  $$('[data-pref-note]').forEach(n => { n.innerHTML = note; });
}

document.addEventListener('input', e => {
  if (e.target.matches && e.target.matches('[data-pref="nick"]')) {
    prefs.nick = e.target.value.trim();
    savePrefs();
  }
});

document.addEventListener('click', e => {
  const g = e.target.closest && e.target.closest('.chat-gear');
  if (g) {
    const p = g.closest('.chat-wrap, .chat-pop').querySelector('.chat-settings');
    if (p) p.hidden = !p.hidden;
    return;
  }
  const mb = e.target.closest && e.target.closest('[data-pref="mode"]');
  if (mb) {
    prefs.mode = mb.dataset.v;
    savePrefs();
    applyPrefsUI();
  }
});

const tutorSystem = () => {
  // System prompt sekarang dibangun sepenuhnya di server.
  // Client hanya kirim nick + mode sebagai flag terpisah.
  return null;
};

/* ================= FILE UPLOAD CONSTANTS ================= */
const FILE_MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const FILE_ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls'
};
const FILE_ALLOWED_EXTS = ['.pdf', '.xlsx', '.xls'];

function validateFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const typeOk = FILE_ALLOWED_TYPES[file.type] !== undefined;
  const extOk = FILE_ALLOWED_EXTS.includes(ext);
  if (!typeOk && !extOk) return 'Hanya file PDF atau Excel (.xlsx/.xls) yang diizinkan.';
  if (file.size > FILE_MAX_BYTES) return 'Ukuran file maksimal 4 MB.';
  return null;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { resolve(reader.result.split(',')[1]); };
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

// ── Fitur #4: Baca sheet names dari .xlsx (ZIP-based) ──────────────────────
function readXlsxSheetNames(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // .xlsx adalah ZIP — cari "workbook.xml" untuk daftar sheet
        const arr = new Uint8Array(reader.result);
        // Cari string "sheetName" dalam bytes
        let text = '';
        for (let i = 0; i < Math.min(arr.length, 200000); i++) {
          text += String.fromCharCode(arr[i]);
        }
        // Ekstrak nama sheet dari workbook.xml (<sheet name="..." .../>)
        const matches = [...text.matchAll(/name="([^"]{1,64})"/g)];
        const names = matches.map(m => m[1]).filter(n =>
          !n.startsWith('xl/') && !n.includes('http') && n.length > 0
        ).slice(0, 10);
        resolve(names.length ? names : null);
      } catch (e) { resolve(null); }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}

// ── Fitur #3: Tambah tombol copy ke bubble bot ─────────────────────────────
function addCopyBtn(msgEl) {
  const bubble = msgEl.querySelector('.chat-bubble');
  if (!bubble) return;
  const btn = document.createElement('button');
  btn.className = 'chat-copy-btn';
  btn.title = 'Salin jawaban';
  btn.textContent = '📋';
  btn.addEventListener('click', () => {
    const text = bubble.innerText || bubble.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = '📋'; }, 1500);
      }).catch(() => {});
    }
  });
  msgEl.appendChild(btn);
}

// ── Fitur #2: fetch dengan retry ───────────────────────────────────────────
async function fetchWithRetry(url, options, maxRetries = 2, delayMs = 1500) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      // 5xx = retry, 4xx = langsung throw
      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson.error || ('HTTP ' + res.status);
      if (res.status >= 500 && attempt < maxRetries) {
        lastErr = new Error(errMsg);
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw new Error(errMsg);
    } catch (e) {
      lastErr = e;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

function initChat(cfg) {
  const body = $(cfg.body), input = $(cfg.input), send = $(cfg.send), status = $(cfg.status);
  const suggest = cfg.suggest ? $(cfg.suggest) : null;
  const fileInput = cfg.fileInput ? $(cfg.fileInput) : null;
  const filePreview = cfg.filePreview ? $(cfg.filePreview) : null;
  const wrap = body ? body.closest('.chat-wrap, .chat-pop') : null;
  const KEY = cfg.storeKey;
  let history = [];
  let pendingFile = null; // { name, mimeType, base64 }

  // ── Fitur #1: Rate limiting — max 10 pesan per menit ──────────────────────
  const RATE_MAX = 10;
  const RATE_WINDOW_MS = 60000;
  let msgTimestamps = []; // simpan timestamp tiap pesan terkirim

  function isRateLimited() {
    const now = Date.now();
    msgTimestamps = msgTimestamps.filter(t => now - t < RATE_WINDOW_MS);
    return msgTimestamps.length >= RATE_MAX;
  }

  function recordMsg() {
    msgTimestamps.push(Date.now());
  }

  function getRateLimitSecondsLeft() {
    if (!msgTimestamps.length) return 0;
    const oldest = msgTimestamps[0];
    return Math.ceil((RATE_WINDOW_MS - (Date.now() - oldest)) / 1000);
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const h = JSON.parse(raw);
      if (Array.isArray(h)) {
        history = h
          .map(m => ({ role: (m && m.role === 'bot' ? 'assistant' : m ? m.role : ''), content: (m && typeof m.content === 'string' ? m.content : '') }))
          .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content.trim() && m.content !== '⋯');
      }
    }
  } catch (e) {}

  const saveHist = () => {
    try { localStorage.setItem(KEY, JSON.stringify(history.slice(-40))); } catch (e) {}
  };

  function clearPendingFile() {
    pendingFile = null;
    if (fileInput) fileInput.value = '';
    if (filePreview) { filePreview.innerHTML = ''; filePreview.style.display = 'none'; }
  }

  function renderMsg(role, text) {
    if (!body) return null;
    const d = document.createElement('div');
    const isUser = (role === 'user');
    d.className = 'chat-msg ' + (isUser ? 'u' : 'b');
    d.innerHTML = (isUser ? '' : '<div class="chat-avatar">📘</div>') + '<div class="chat-bubble">' + md(text) + '</div>';
    body.appendChild(d);
    // Fitur #3: tambah tombol copy hanya untuk bubble bot
    if (!isUser) addCopyBtn(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }

  // File input handler — fitur #4: preview sheet names untuk .xlsx
  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const err = validateFile(file);
      if (err) {
        alert('⚠️ ' + err);
        fileInput.value = '';
        return;
      }
      try {
        const b64 = await readFileAsBase64(file);
        pendingFile = { name: file.name, mimeType: file.type || 'application/octet-stream', base64: b64 };
        if (filePreview) {
          const ext = file.name.split('.').pop().toLowerCase();
          const sizeKB = (file.size / 1024).toFixed(0);
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const sizeStr = file.size >= 1024 * 1024 ? sizeMB + ' MB' : sizeKB + ' KB';
          let metaStr = ext.toUpperCase() + ' · ' + sizeStr;

          // Untuk .xlsx: coba baca sheet names
          if (ext === 'xlsx') {
            const sheets = await readXlsxSheetNames(file);
            if (sheets && sheets.length) {
              metaStr += ' · ' + sheets.length + ' sheet' + (sheets.length > 1 ? 's' : '');
              if (sheets.length <= 3) metaStr += ': ' + sheets.join(', ');
            }
          }

          filePreview.style.display = 'flex';
          filePreview.innerHTML =
            '<span class="file-chip">📄 ' + escapeHtml(file.name) +
            ' <span class="file-meta">(' + escapeHtml(metaStr) + ')</span></span>' +
            '<button class="file-remove" title="Hapus lampiran">✕</button>';
          filePreview.querySelector('.file-remove').addEventListener('click', clearPendingFile);
        }
        if (input) input.focus();
      } catch (e) {
        alert('⚠️ Gagal membaca file. Coba lagi.');
        fileInput.value = '';
      }
    });
  }

  // Handle Clear Chat
  if (wrap) {
    const clearBtn = wrap.querySelector('[data-action="clear-chat"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Hapus seluruh riwayat percakapan dengan ExcelMate?')) {
          history = [];
          clearPendingFile();
          msgTimestamps = [];
          try { localStorage.removeItem(KEY); } catch (e) {}
          if (body) body.innerHTML = '';
          renderMsg('bot', 'Halo! 👋 Riwayat percakapan telah dibersihkan. Tanya apa saja soal Excel — dari `SUM` sampai **Pivot Table**.');
          const settings = wrap.querySelector('.chat-settings');
          if (settings) settings.hidden = true;
        }
      });
    }
  }

  let busy = false;
  let cooldown = false;

  async function sendMsg() {
    if (!input || !send) return;
    const v = input.value.trim();
    if ((!v && !pendingFile) || busy || cooldown) return;

    // Fitur #1: cek rate limit
    if (isRateLimited()) {
      const secs = getRateLimitSecondsLeft();
      if (status) { status.textContent = 'batas tercapai'; status.style.color = '#FFB4A0'; }
      const warn = renderMsg('bot',
        '⏱️ **Terlalu cepat!** Kamu sudah kirim ' + RATE_MAX + ' pesan dalam 1 menit. ' +
        'Tunggu sekitar **' + secs + ' detik** lagi ya, Kak. 😊'
      );
      setTimeout(() => {
        if (warn) warn.remove();
        if (status) { status.textContent = 'online'; status.style.color = ''; }
      }, secs * 1000);
      return;
    }

    const textToSend = v || (pendingFile ? 'Tolong analisis file yang saya lampirkan.' : '');
    const fileToSend = pendingFile;

    input.value = '';
    clearPendingFile();

    const displayText = fileToSend ? textToSend + '\n\n📎 *' + fileToSend.name + '*' : textToSend;
    renderMsg('user', displayText);

    history.push({ role: 'user', content: textToSend });
    saveHist();
    recordMsg(); // Fitur #1: catat timestamp

    busy = true;
    send.disabled = true;
    input.disabled = true;
    if (status) { status.textContent = 'mengetik…'; status.style.color = '#FFD9A0'; }
    const typing = renderMsg('bot', '⋯');

    try {
      const apiMessages = history
        .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content && m.content !== '⋯')
        .slice(-20);

      const payload = {
        nick: prefs.nick || 'Kak',
        mode: prefs.mode || 'jelas',
        messages: apiMessages
      };

      if (fileToSend) {
        payload.file = {
          name: fileToSend.name,
          mimeType: fileToSend.mimeType,
          base64: fileToSend.base64
        };
      }

      // Fitur #2: fetch dengan retry otomatis (max 2x, delay 1.5s & 3s)
      const res = await fetchWithRetry('/.netlify/functions/excellab-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : '(tidak ada jawaban)';

      history.push({ role: 'assistant', content: reply });
      saveHist();

      if (typing) typing.querySelector('.chat-bubble').innerHTML = md(reply);
      if (status) { status.textContent = 'online'; status.style.color = ''; }
    } catch (err) {
      console.error('ExcelMate Chat Error:', err);
      if (typing) {
        typing.querySelector('.chat-bubble').innerHTML =
          '⚠️ <b>Sistem sedang sibuk.</b><br>Maaf, koneksi ke tutor AI sedang terganggu. Silakan coba kirim ulang pesanmu sebentar lagi ya! ⏳📊';
      }
      if (status) { status.textContent = 'sibuk'; status.style.color = '#FFB4A0'; }
    } finally {
      busy = false;
      cooldown = true;
      setTimeout(() => {
        cooldown = false;
        send.disabled = false;
        input.disabled = false;
        input.focus();
      }, 1200);
    }
  }

  if (send) send.addEventListener('click', sendMsg);
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });
  if (suggest) {
    suggest.addEventListener('click', e => {
      const b = e.target.closest('.sug');
      if (!b) return;
      if (input) input.value = b.dataset.q;
      sendMsg();
    });
  }

  if (history.length) {
    history.forEach(m => {
      renderMsg(m.role === 'user' ? 'user' : 'bot', m.content);
    });
  } else {
    renderMsg('bot', 'Halo! 👋 Saya **ExcelMate**, tutor AI-mu. Tanya apa saja soal Excel — dari `SUM` sampai **Pivot Table**. Kamu juga bisa lampirkan file **PDF atau Excel** (📎) untuk dianalisis langsung!');
  }
}

applyPrefsUI();
initChat({ body: '#chatBody', input: '#chatInput', send: '#chatSend', status: '#chatStatus', suggest: '#chatSuggest', fileInput: '#chatFileInput', filePreview: '#chatFilePreview', storeKey: 'excellab_chat_main' });
initChat({ body: '#fabBody', input: '#fabInput', send: '#fabSend', status: '#fabStatus', suggest: null, fileInput: '#fabFileInput', filePreview: '#fabFilePreview', storeKey: 'excellab_chat_fab' });

/* ===== BUBBLE TOGGLE ===== */
const chatFab = $('#chatFab'), chatPop = $('#chatPop');
if (chatFab && chatPop) {
  chatFab.addEventListener('click', () => {
    chatPop.classList.toggle('open');
    chatFab.classList.toggle('hidden');
    if (chatPop.classList.contains('open')) {
      const cb = chatPop.querySelector('.chat-body');
      if (cb) cb.scrollTop = cb.scrollHeight;
    }
  });
}

const fabClose = $('#fabClose');
if (fabClose && chatPop && chatFab) {
  fabClose.addEventListener('click', () => {
    chatPop.classList.remove('open');
    chatFab.classList.remove('hidden');
  });
}

/* ================= SHORTCUTS & TRAINER ================= */
const kbdGrid = $('#kbdGrid');
if (kbdGrid && typeof SHORTCUTS !== 'undefined') {
  kbdGrid.innerHTML = SHORTCUTS.map(s => '<div class="kbd-card"><span>' + escapeHtml(s.d) + '</span><kbd>' + escapeHtml(s.k) + '</kbd></div>').join('');
}

let streak = 0, trScore = 0, trLocked = false;
function nextTrainer() {
  if (typeof SHORTCUTS === 'undefined' || !SHORTCUTS.length) return;
  trLocked = false;
  const i = Math.floor(Math.random() * SHORTCUTS.length);
  const correct = SHORTCUTS[i];
  const opts = [correct];
  while (opts.length < 4) {
    const r = SHORTCUTS[Math.floor(Math.random() * SHORTCUTS.length)];
    if (!opts.includes(r)) opts.push(r);
  }
  opts.sort(() => Math.random() - .5);
  const trKey = $('#trKey'), trOpts = $('#trOpts');
  if (trKey) trKey.textContent = correct.k;
  if (trOpts) {
    trOpts.innerHTML = opts.map(o => '<button class="tr-opt" data-c="' + (o === correct ? 1 : 0) + '">' + escapeHtml(o.d) + '</button>').join('');
    $$('#trOpts .tr-opt').forEach(b => b.addEventListener('click', () => {
      if (trLocked) return;
      trLocked = true;
      const ok = b.dataset.c === '1';
      if (ok) {
        streak++; trScore++; b.classList.add('correct');
      } else {
        streak = 0; b.classList.add('wrong');
        $$('#trOpts .tr-opt').forEach(x => { if (x.dataset.c === '1') x.classList.add('correct'); });
      }
      const stEl = $('#trStreak'), scEl = $('#trScore');
      if (stEl) stEl.textContent = streak;
      if (scEl) scEl.textContent = trScore;
      setTimeout(nextTrainer, ok ? 700 : 1400);
    }));
  }
}
nextTrainer();

/* ================= REFERENCE ================= */
let curCat = 'Semua';
const refCats = $('#refCats');
if (refCats && typeof CATS !== 'undefined') {
  refCats.innerHTML = CATS.map(c => '<button class="cat-btn' + (c === 'Semua' ? ' on' : '') + '" data-cat="' + c + '">' + c + '</button>').join('');
  refCats.addEventListener('click', e => {
    const b = e.target.closest('.cat-btn');
    if (!b) return;
    curCat = b.dataset.cat;
    $$('#refCats .cat-btn').forEach(x => x.classList.toggle('on', x === b));
    renderRefs();
  });
}

function renderRefs() {
  const refList = $('#refList'), refSearch = $('#refSearch');
  if (!refList || typeof REFS === 'undefined') return;
  const kw = (refSearch && refSearch.value ? refSearch.value : '').toLowerCase();
  const list = REFS.filter(r => (curCat === 'Semua' || r[4] === curCat) && (r[0].toLowerCase().includes(kw) || r[2].toLowerCase().includes(kw) || r[1].toLowerCase().includes(kw)));
  refList.innerHTML = list.length
    ? list.map(r => '<div class="ref-item"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><h4>' + r[0] + '</h4><span class="tag tag-blue">' + r[4] + '</span></div><span class="syn">' + escapeHtml(r[1]) + '</span><p>' + escapeHtml(r[2]) + ' <code style="color:var(--green2)">' + escapeHtml(r[3]) + '</code></p></div>').join('')
    : '<p style="color:var(--mut)">Tidak ada hasil 🔍</p>';
}

const refSearchEl = $('#refSearch');
if (refSearchEl) refSearchEl.addEventListener('input', renderRefs);
renderRefs();

/* ================= DASHBOARD & PROGRESS ================= */
const modGrid = $('#modGrid');
if (modGrid && typeof MODULES !== 'undefined') {
  modGrid.innerHTML = MODULES.map((m, i) => '<div class="card mod-card rv"><div class="num">0' + (i + 1) + '</div><span class="tag" id="tag-' + m[0] + '">Belum mulai</span><h3>' + m[1] + '</h3><p>' + m[2] + '</p><div class="row"><button class="btn btn-primary" data-page="' + m[0] + '" style="padding:8px 16px;font-size:.85rem">Buka Modul →</button></div></div>').join('');
  try { $$('#modGrid .rv').forEach(el => io.observe(el)); } catch (e) { $$('#modGrid .rv').forEach(el => el.classList.add('in')); }
}

function refreshTicks() {
  if (typeof MODULES === 'undefined') return;
  MODULES.forEach(m => {
    const t = document.getElementById('tick-' + m[0]);
    if (t) t.textContent = prog.modules[m[0]] ? '✔' : '';
    const tag = document.getElementById('tag-' + m[0]);
    if (tag) {
      if (prog.modules[m[0]]) { tag.textContent = '✔ Selesai'; tag.className = 'tag tag-green'; }
      else if (prog.quiz[m[0]] !== undefined) { tag.textContent = '🔄 In Progress'; tag.className = 'tag tag-amber'; }
      else { tag.textContent = 'Belum mulai'; tag.className = 'tag'; }
    }
    const d = document.getElementById('done-' + m[0]);
    if (d) d.style.display = prog.modules[m[0]] ? 'block' : 'none';
  });
  const te = document.getElementById('tick-exam');
  if (te) te.textContent = prog.modules['exam'] ? '✔' : '';
  const de = document.getElementById('done-exam');
  if (de) de.style.display = prog.modules['exam'] ? 'block' : 'none';
}

function refreshDashboard() {
  if (typeof MODULES === 'undefined') return;
  const done = MODULES.filter(m => prog.modules[m[0]]).length;
  const stModul = $('#stModul'), pbModul = $('#pbModul');
  if (stModul) stModul.textContent = done + '/' + MODULES.length;
  if (pbModul) pbModul.style.width = (done / MODULES.length * 100) + '%';
  const keys = [...MODULES.map(m => m[0]), 'exam'];
  const passed = keys.filter(k => (prog.quiz[k] || 0) >= 70).length;
  const stQuiz = $('#stQuiz');
  if (stQuiz) stQuiz.textContent = passed + '/' + keys.length;
  const vals = keys.map(k => prog.quiz[k]).filter(v => v !== undefined);
  const stRata = $('#stRata');
  if (stRata) stRata.textContent = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) + '%' : '–';
  refreshTicks();
}

$$('.done-btn').forEach(b => b.addEventListener('click', () => {
  prog.modules[b.dataset.mod] = true;
  save();
  refreshTicks();
  refreshDashboard();
  const d = document.getElementById('done-' + b.dataset.mod);
  if (d) d.style.display = 'block';
}));

/* ================= PIVOT TABLE INTERAKTIF ================= */
const PIVOT_DATA = [
  { Kota: 'Medan',    Produk: 'Laptop',  Penjualan: 4500000, Qty: 3 },
  { Kota: 'Jakarta',  Produk: 'Printer', Penjualan: 1800000, Qty: 2 },
  { Kota: 'Medan',    Produk: 'Printer', Penjualan: 2100000, Qty: 3 },
  { Kota: 'Surabaya', Produk: 'Laptop',  Penjualan: 3900000, Qty: 2 },
  { Kota: 'Jakarta',  Produk: 'Laptop',  Penjualan: 5200000, Qty: 4 },
  { Kota: 'Medan',    Produk: 'Monitor', Penjualan: 3200000, Qty: 2 },
  { Kota: 'Surabaya', Produk: 'Printer', Penjualan: 1600000, Qty: 2 },
  { Kota: 'Jakarta',  Produk: 'Monitor', Penjualan: 2800000, Qty: 1 },
];
const PIVOT_FIELDS = ['Kota', 'Produk', 'Penjualan', 'Qty'];
const pivotState = { rows: [], cols: [], vals: [] };
let pivotEventsBound = false;

function renderFieldList() {
  const fl = document.getElementById('pivotFieldList');
  if (!fl) return;
  const placed = [...pivotState.rows, ...pivotState.cols, ...pivotState.vals];
  fl.innerHTML = PIVOT_FIELDS.map(f => {
    const isPlaced = placed.includes(f);
    return `<button type="button" class="pivot-chip${isPlaced ? ' placed' : ''}" data-field="${f}" ${isPlaced ? 'disabled' : ''} onclick="addToZone('${f}')">${f}${isPlaced ? ' ✓' : ' +'}</button>`;
  }).join('');
}

function addToZone(field) {
  if (!field) return;
  const placed = [...pivotState.rows, ...pivotState.cols, ...pivotState.vals];
  if (placed.includes(field)) return;
  // Numeric fields default to vals, text to rows
  const numeric = ['Penjualan', 'Qty'];
  if (numeric.includes(field)) {
    if (pivotState.vals.length === 0) pivotState.vals.push(field);
    else pivotState.rows.push(field);
  } else {
    if (pivotState.rows.length === 0) pivotState.rows.push(field);
    else if (pivotState.cols.length === 0) pivotState.cols.push(field);
    else pivotState.vals.push(field);
  }
  renderFieldList();
  renderZones();
}
window.addToZone = addToZone;

function removeFromZone(zoneName, field) {
  if (zoneName && pivotState[zoneName]) {
    pivotState[zoneName] = pivotState[zoneName].filter(f => f !== field);
    renderFieldList();
    renderZones();
  }
}
window.removeFromZone = removeFromZone;

function renderZones() {
  const hints = {
    rows: 'Klik field di atas',
    cols: 'Opsional',
    vals: 'Wajib (angka)'
  };
  ['rows', 'cols', 'vals'].forEach(z => {
    const zoneId = z === 'rows' ? 'zone-rows' : z === 'cols' ? 'zone-cols' : 'zone-vals';
    const body = document.querySelector('#' + zoneId + ' .pivot-zone-body');
    if (!body) return;
    if (pivotState[z].length === 0) {
      body.innerHTML = `<span class="zone-hint" style="color:var(--mut);font-size:.73rem;line-height:1.3;font-style:italic">${hints[z]}</span>`;
    } else {
      body.innerHTML = pivotState[z].map(f =>
        `<span class="pivot-placed-chip" data-field="${f}" onclick="removeFromZone('${z}','${f}')" title="Klik untuk hapus">${f} ×</span>`
      ).join('');
    }
  });
}

function initPivot() {
  const srcTbl = document.getElementById('pivotSourceTbl');
  const fieldList = document.getElementById('pivotFieldList');
  if (!srcTbl || !fieldList) return;

  // Render source table
  const headers = Object.keys(PIVOT_DATA[0]);
  srcTbl.innerHTML = '<tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>' +
    PIVOT_DATA.map(r => '<tr>' + headers.map(h => '<td>' + (typeof r[h] === 'number' ? r[h].toLocaleString('id-ID') : r[h]) + '</td>').join('') + '</tr>').join('');

  // Render field chips & zones
  renderFieldList();
  renderZones();

  if (!pivotEventsBound) {
    pivotEventsBound = true;

    // Field list click delegation
    fieldList.addEventListener('click', e => {
      const chip = e.target.closest('.pivot-chip');
      if (chip && !chip.disabled) {
        addToZone(chip.dataset.field);
      }
    });

    // Zone click handlers — click chip in zone to remove
    $$('.pivot-zone').forEach(zone => {
      const body = zone.querySelector('.pivot-zone-body');
      if (body) {
        body.addEventListener('click', e => {
          const chip = e.target.closest('.pivot-placed-chip');
          if (!chip) return;
          const field = chip.dataset.field;
          const z = zone.dataset.zone;
          removeFromZone(z, field);
        });
      }
    });

    // Preset 1: Penjualan per Kota
    const pk = document.getElementById('presetKota');
    if (pk) pk.addEventListener('click', () => {
      pivotState.rows = ['Kota'];
      pivotState.cols = [];
      pivotState.vals = ['Penjualan'];
      const sel = document.getElementById('pivotAggSelect');
      if (sel) sel.value = 'sum';
      renderFieldList();
      renderZones();
      buildPivot();
    });

    // Preset 2: Matriks Kota x Produk
    const pm = document.getElementById('presetMatriks');
    if (pm) pm.addEventListener('click', () => {
      pivotState.rows = ['Kota'];
      pivotState.cols = ['Produk'];
      pivotState.vals = ['Penjualan'];
      const sel = document.getElementById('pivotAggSelect');
      if (sel) sel.value = 'sum';
      renderFieldList();
      renderZones();
      buildPivot();
    });

    // Preset 3: Total Qty per Produk
    const pq = document.getElementById('presetQty');
    if (pq) pq.addEventListener('click', () => {
      pivotState.rows = ['Produk'];
      pivotState.cols = [];
      pivotState.vals = ['Qty'];
      const sel = document.getElementById('pivotAggSelect');
      if (sel) sel.value = 'sum';
      renderFieldList();
      renderZones();
      buildPivot();
    });

    // Build button
    const buildBtn = document.getElementById('buildPivotBtn');
    if (buildBtn) buildBtn.addEventListener('click', buildPivot);

    // Reset button
    const resetBtn = document.getElementById('resetPivotBtn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      pivotState.rows = []; pivotState.cols = []; pivotState.vals = [];
      renderFieldList(); renderZones();
      const res = document.getElementById('pivotResult');
      if (res) res.style.display = 'none';
    });
  }
}

function buildPivot() {
  if (!pivotState.vals.length) {
    alert('Pilih minimal 1 field untuk Values (kolom angka yang akan dihitung).');
    return;
  }
  if (!pivotState.rows.length && !pivotState.cols.length) {
    alert('Pilih minimal 1 field untuk Rows atau Columns.');
    return;
  }

  const agg = document.getElementById('pivotAggSelect')?.value || 'sum';
  const rowField = pivotState.rows[0] || null;
  const colField = pivotState.cols[0] || null;
  const valField = pivotState.vals[0];

  // Collect unique row/col keys
  const rowKeys = rowField ? [...new Set(PIVOT_DATA.map(r => r[rowField]))] : ['Total'];
  const colKeys = colField ? [...new Set(PIVOT_DATA.map(r => r[colField]))] : null;

  // Aggregate function
  function aggregate(subset) {
    if (!subset.length) return '–';
    const vals = subset.map(r => Number(r[valField])).filter(v => !isNaN(v));
    if (!vals.length) return '–';
    let result;
    if (agg === 'sum')   result = vals.reduce((a, b) => a + b, 0);
    else if (agg === 'count') result = vals.length;
    else if (agg === 'avg')  result = vals.reduce((a, b) => a + b, 0) / vals.length;
    else if (agg === 'max')  result = Math.max(...vals);
    else if (agg === 'min')  result = Math.min(...vals);
    return typeof result === 'number' ? result.toLocaleString('id-ID', { maximumFractionDigits: 1 }) : result;
  }

  // Build table HTML
  const tbl = document.getElementById('pivotOutputTbl');
  let html = '<thead><tr>';

  if (colKeys) {
    html += `<th>${rowField || ''}</th>`;
    colKeys.forEach(ck => { html += `<th>${ck}</th>`; });
    html += '<th><b>Grand Total</b></th>';
  } else {
    html += `<th>${rowField || ''}</th><th>${agg.toUpperCase()}(${valField})</th>`;
  }
  html += '</tr></thead><tbody>';

  let grandTotal = 0;
  rowKeys.forEach(rk => {
    html += '<tr>';
    html += `<td><b>${rk}</b></td>`;
    let rowTotal = 0;
    if (colKeys) {
      colKeys.forEach(ck => {
        const subset = PIVOT_DATA.filter(r =>
          (!rowField || r[rowField] === rk) && (!colField || r[colField] === ck)
        );
        const val = aggregate(subset);
        const num = parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
        if (!isNaN(num)) rowTotal += num;
        html += `<td style="text-align:right">${val}</td>`;
      });
      html += `<td style="text-align:right;font-weight:700">${rowTotal.toLocaleString('id-ID')}</td>`;
      grandTotal += rowTotal;
    } else {
      const subset = PIVOT_DATA.filter(r => !rowField || r[rowField] === rk);
      const val = aggregate(subset);
      html += `<td style="text-align:right">${val}</td>`;
    }
    html += '</tr>';
  });

  // Grand Total row
  if (colKeys) {
    html += '<tr class="pivot-total-row"><td><b>Grand Total</b></td>';
    colKeys.forEach(ck => {
      const subset = PIVOT_DATA.filter(r => !colField || r[colField] === ck);
      html += `<td style="text-align:right">${aggregate(subset)}</td>`;
    });
    html += `<td style="text-align:right">${grandTotal.toLocaleString('id-ID')}</td></tr>`;
  } else {
    html += `<tr class="pivot-total-row"><td><b>Grand Total</b></td><td style="text-align:right">${aggregate(PIVOT_DATA)}</td></tr>`;
  }

  html += '</tbody>';
  tbl.innerHTML = html;

  // Insight
  const insight = document.getElementById('pivotInsight');
  if (insight) {
    const aggLabel = {sum:'total',count:'jumlah baris',avg:'rata-rata',max:'nilai terbesar',min:'nilai terkecil'}[agg];
    insight.innerHTML = `✅ Pivot selesai: menampilkan <b>${aggLabel} ${valField}</b>${rowField?' per <b>'+rowField+'</b>':''}${colField?' × <b>'+colField+'</b>':''}.
      Coba ganti <b>aggregasi</b> (SUM/COUNT/AVG/MAX/MIN) di atas lalu tekan Buat Pivot Table lagi untuk melihat perspektif berbeda.`;
  }

  document.getElementById('pivotResult').style.display = 'block';
  document.getElementById('pivotResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ================= INITIALIZATION ================= */
if (typeof QUIZZES !== 'undefined') {
  Object.keys(QUIZZES).forEach(renderQuiz);
}
loadScenario('siswa');
refreshDashboard();
initPivot();

