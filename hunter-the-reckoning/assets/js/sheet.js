/* ============================================================
   ОХОТА — интерактивный лист охотника (H5)
   ============================================================ */
(function () {
  'use strict';
  const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const plural = (n, one, few, many) => { const m = n % 100, d = n % 10; if (m > 10 && m < 20) return many; if (d > 1 && d < 5) return few; if (d === 1) return one; return many; };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const KEY = 'htr:sheet-v1';
  const ATTRS = [
    { id: 'str', name: 'Сила', cat: 'physical' }, { id: 'dex', name: 'Ловкость', cat: 'physical' }, { id: 'sta', name: 'Выносливость', cat: 'physical' },
    { id: 'cha', name: 'Харизма', cat: 'social' }, { id: 'man', name: 'Манипулирование', cat: 'social' }, { id: 'com', name: 'Самообладание', cat: 'social' },
    { id: 'int', name: 'Интеллект', cat: 'mental' }, { id: 'wit', name: 'Сообразительность', cat: 'mental' }, { id: 'res', name: 'Решительность', cat: 'mental' },
  ];
  const ATTR_SHORT = { str: 'Сил', dex: 'Лов', sta: 'Вын', cha: 'Хар', man: 'Ман', com: 'Сам', int: 'Инт', wit: 'Соч', res: 'Реш' };
  const CATS = { physical: 'Физические', social: 'Социальные', mental: 'Умственные' };
  const SKILLS = {
    physical: [['athl', 'Атлетика', 'dex'], ['brawl', 'Драка', 'str'], ['craft', 'Ремесло', 'dex'], ['drive', 'Вождение', 'dex'], ['fire', 'Огнестрельное', 'dex'], ['melee', 'Фехтование', 'dex'], ['stealth', 'Скрытность', 'dex'], ['surv', 'Выживание', 'wit']],
    social: [['anim', 'Обращение с животными', 'cha'], ['etiq', 'Этикет', 'cha'], ['insight', 'Проницательность', 'wit'], ['intim', 'Запугивание', 'man'], ['lead', 'Лидерство', 'cha'], ['perf', 'Выступление', 'cha'], ['pers', 'Убеждение', 'man'], ['street', 'Уличное чутьё', 'man'], ['subter', 'Хитрость', 'man']],
    mental: [['acad', 'Академические науки', 'int'], ['aware', 'Осведомлённость', 'wit'], ['fin', 'Финансы', 'int'], ['inv', 'Расследование', 'wit'], ['med', 'Медицина', 'int'], ['occ', 'Оккультизм', 'int'], ['pol', 'Политика', 'int'], ['sci', 'Наука', 'int'], ['tech', 'Технологии', 'int']],
  };
  const SKILL_NAMES = Object.fromEntries(Object.values(SKILLS).flat().map(([k, n]) => [k, n]));
  const DRIVES = ['Любопытство', 'Месть', 'Клятва', 'Жадность', 'Гордость', 'Зависть', 'Искупление'];

  const base = () => ({
    name: '', concept: '', creed: '', drive: 'Любопытство', ambition: '', desire: '', touchstone: '',
    attrs: Object.fromEntries(ATTRS.map(a => [a.id, 1])),
    skills: Object.fromEntries(Object.values(SKILLS).flat().map(([k]) => [k, 0])),
    spec: {}, edges: [], damage: Array(10).fill(0), wpSpent: 0, despair: 1, danger: 1,
  });
  function merge(v) {
    const b = base();
    if (!v || typeof v !== 'object') return b;
    return { ...b, ...v, attrs: { ...b.attrs, ...(v.attrs || {}) }, skills: { ...b.skills, ...(v.skills || {}) }, spec: { ...(v.spec || {}) }, edges: Array.isArray(v.edges) ? v.edges.slice(0, 4) : [], damage: Array.isArray(v.damage) ? v.damage.slice(0, 10) : Array(10).fill(0) };
  }
  let S = (() => { try { return merge(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) { return base(); } })();
  let last = null, log = [];
  const panel = { attr: 'dex', skill: '', diff: 2, mod: 0, despair: 0 };

  function persist() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* noop */ } }
  const healthMax = () => clamp((S.attrs.sta || 1) + 3, 4, 10);
  const wpMax = () => clamp((S.attrs.com || 1) + (S.attrs.res || 1), 2, 10);
  const wpCur = () => clamp(wpMax() - (S.wpSpent || 0), 0, 10);
  const creedList = () => ((window.HTR && HTR.pages) || []).filter(p => p.group === 'creeds').map(p => ({ id: p.id.split('/')[1], name: p.title }));
  const edgeList = () => (window.HTR && HTR.edges) || [];

  function dots(kind, key, val, max) {
    const v = Number(val) || 0;
    return `<span class="cs-dots" role="group" aria-label="${v} из ${max}">${Array.from({ length: max }, (_, i) => `<button class="cs-dot ${i < v ? 'on' : ''}" data-dot="${kind}" data-key="${key}" data-val="${i + 1}" title="${i + 1}" aria-label="${i + 1}"></button>`).join('')}</span>`;
  }

  function attrGroups() {
    return `<div class="cs-attrs">${['physical', 'social', 'mental'].map(cat => `<div class="cs-attrgroup"><h3>${CATS[cat]}</h3>${ATTRS.filter(a => a.cat === cat).map(a => `<div class="cs-attr"><button class="cs-attr__name" data-rollattr="${a.id}">${esc(a.name)}</button>${dots('attr', a.id, S.attrs[a.id], 5)}<b class="cs-attr__val">${S.attrs[a.id]}</b></div>`).join('')}</div>`).join('')}</div>`;
  }

  function skillGroups() {
    return `<div class="cs-abils">${Object.keys(SKILLS).map(cat => `<div class="cs-abilgroup"><h3>${CATS[cat]}</h3>${SKILLS[cat].map(([k, n, def]) => {
      const attr = S._attr && S._attr[k] ? S._attr[k] : def;
      return `<div class="cs-abil">
        <button class="cs-abil__name" data-rollskill="${k}" title="Бросить">${esc(n)}${S.spec[k] ? ' *' : ''}</button>
        ${dots('skill', k, S.skills[k], 5)}
        <button class="cs-spec ${S.spec[k] ? 'on' : ''}" data-spec="${k}" title="Специализация: +1 кубик">★</button>
        <select class="cs-abil__attr" data-skillattr="${k}" aria-label="Атрибут для ${esc(n)}">${ATTRS.map(a => `<option value="${a.id}" ${a.id === attr ? 'selected' : ''}>${ATTR_SHORT[a.id]}</option>`).join('')}</select>
        <button class="cs-die" data-rollskill="${k}">d10</button>
      </div>`;
    }).join('')}</div>`).join('')}</div>`;
  }

  function statBox(label, value, kind, dirs, cls) {
    return `<div class="cs-stat"><span>${label}</span><b class="${cls || ''}">${value}</b>${dirs ? `<div class="cs-stat__ctrl"><button data-stat="${kind}" data-dir="-1">−</button><button data-stat="${kind}" data-dir="1">+</button></div>` : ''}</div>`;
  }

  function healthTrack() {
    const max = healthMax();
    const boxes = [];
    for (let i = 0; i < max; i++) boxes.push(`<button class="cs-health__box ${S.damage[i] ? 'on' : ''}" data-dmg="${i}" title="Уровень ${i + 1}"><span>${i === 0 ? '0' : '−' + (i <= 2 ? 1 : i <= 4 ? 2 : 5)}</span></button>`);
    return `<div class="cs-health" style="grid-template-columns:repeat(${max},1fr)">${boxes.join('')}</div><div class="cs-health__meta"><span>${S.damage.filter(Boolean).length} из ${max}</span><span>${S.damage[4] ? 'тяжёлые раны' : S.damage[2] ? 'ранения' : 'без штрафа'}</span></div>`;
  }

  function track(label, val, kind) {
    return `<div class="cs-track"><span>${label}</span><div class="meter">${[1, 2, 3, 4, 5].map(n => `<button class="meter__btn ${n <= val ? 'on' : ''}" data-track="${kind}" data-val="${n}" aria-label="${label} ${n}"></button>`).join('')}</div><b>${val}</b></div>`;
  }

  function edgePanel() {
    const all = edgeList();
    const chosen = S.edges.map(id => all.find(e => e.id === id)).filter(Boolean);
    return `<div class="cs-edge-list">${chosen.length ? chosen.map(e => `<div class="cs-edge"><div><b>${esc(e.name)}</b><span>${esc(e.summary || '')}</span></div><button data-unedge="${e.id}" aria-label="Убрать">×</button></div>`).join('') : '<div class="cs-log__empty">Грани не выбраны.</div>'}</div>
      <div class="cs-edge-add"><select id="cs-edge-select"><option value="">Добавить Грань…</option>${all.filter(e => !S.edges.includes(e.id)).map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</select><button class="btn btn--ghost" id="cs-edge-add">+</button></div>`;
  }

  function sheetHTML() {
    const creeds = creedList();
    const creedName = (creeds.find(c => c.id === S.creed) || {}).name || 'Кредо не выбрано';
    const edges = edgeList();
    return `<article class="page sheet-page">
      <nav class="crumbs"><a href="#/">Главная</a><span>/</span><a href="#/tools">Инструменты</a><span>/</span><span>Лист охотника</span></nav>
      <header class="page__head"><div class="page__kicker">Лист охотника · интерактивный</div><h1 id="cs-title">${esc(S.name || 'Безымянный')}</h1>
        <p class="page__sub">${esc(S.concept || 'Концепция не задана')} · ${esc(creedName)} · ${esc(S.drive)}</p>
        <div class="page__meta"><div class="tags"><span class="tag">Здоровье ${healthMax()}</span><span class="tag">Воля ${wpCur()}/${wpMax()}</span><span class="tag">Отчаяние ${S.despair}</span><span class="tag">Опасность ${S.danger}</span></div></div>
      </header>
      <div class="cs-tools">
        <button class="btn btn--blood" data-cs="save">Сохранить</button>
        <button class="btn btn--ghost" data-cs="load">Загрузить</button>
        <button class="btn btn--ghost" data-cs="reset">Сбросить</button>
        <button class="btn btn--ghost" data-cs="print">Печать</button>
        <span class="cs-tools__hint">Изменения сохраняются в браузере автоматически</span>
      </div>

      <div class="cs-identity">
        <label>Имя<input data-id="name" value="${esc(S.name)}" placeholder="Аня Кейн"></label>
        <label>Концепция<input data-id="concept" value="${esc(S.concept)}" placeholder="Медсестра, которая видит больше других"></label>
        <label>Кредо<select data-id="creed"><option value="">— не выбрано —</option>${creeds.map(c => `<option value="${c.id}" ${c.id === S.creed ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <label>Драйв<select data-id="drive">${DRIVES.map(d => `<option ${d === S.drive ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label>
        <label>Амбиция<input data-id="ambition" value="${esc(S.ambition)}" placeholder="Чего хочет достичь"></label>
        <label>Желание<input data-id="desire" value="${esc(S.desire)}" placeholder="Чего хочет сейчас"></label>
        <label>Опора<input data-id="touchstone" value="${esc(S.touchstone)}" placeholder="Кто держит на земле"></label>
      </div>

      <div class="cs-grid">
        <div class="cs-col">
          <section class="cs-panel"><div class="cs-panel__head"><h2>Атрибуты</h2><span>клик по ромбу — значение · клик по имени — бросок</span></div>${attrGroups()}</section>
          <section class="cs-panel"><div class="cs-panel__head"><h2>Навыки</h2><span>★ — специализация (+1 кубик)</span></div>${skillGroups()}</section>
        </div>
        <aside class="cs-col cs-col--side">
          <section class="cs-panel"><div class="cs-panel__head"><h2>Состояние</h2><span>здоровье · воля</span></div>
            <div class="cs-statgrid">${statBox('Здоровье', healthMax() + ' / ' + healthMax(), 'health', false)}${statBox('Воля', wpCur() + ' / ' + wpMax(), 'wp', true)}${statBox('Отчаяние', S.despair, 'despair', false, 'red')}${statBox('Опасность', S.danger, 'danger', false, 'red')}</div>
            <div class="cs-healthwrap">${healthTrack()}</div>
            <div class="cs-tracks">${track('Отчаяние', S.despair, 'despair')}${track('Опасность', S.danger, 'danger')}</div>
          </section>
          <section class="cs-panel"><div class="cs-panel__head"><h2>Грани</h2><span>${S.edges.length} из 3</span></div>${edgePanel()}</section>
          <section class="cs-panel"><div class="cs-panel__head"><h2>Бросок</h2><span>Атрибут + Навык</span></div>
            <div class="cs-roll">
              <div class="cs-roll__row"><label>Атрибут<select id="cs-p-attr">${ATTRS.map(a => `<option value="${a.id}" ${panel.attr === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label><label>Навык<select id="cs-p-skill"><option value="">— нет —</option>${Object.values(SKILLS).flat().map(([k, n]) => `<option value="${k}" ${panel.skill === k ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label></div>
              <div class="cs-roll__row"><label>Сложность<input id="cs-p-diff" type="number" min="1" max="10" value="${panel.diff}"></label><label>Модификатор<input id="cs-p-mod" type="number" min="-5" max="5" value="${panel.mod}"></label></div>
              <div class="cs-roll__row"><label>Кости Отчаяния<input id="cs-p-despair" type="number" min="0" max="5" value="${panel.despair}"></label><label class="cs-check"><input id="cs-p-ten" type="checkbox" checked> 10 снова</label></div>
              <button class="btn btn--blood cs-roll__go" id="cs-p-roll">Бросить <span>${(S.attrs[panel.attr] || 0) + (panel.skill ? (S.skills[panel.skill] || 0) : 0)}d10</span></button>
            </div>
            <div id="cs-result">${resultBox()}</div>
          </section>
          <section class="cs-panel"><div class="cs-panel__head"><h2>Журнал</h2><span>последние броски</span></div><div id="cs-log">${logBox()}</div></section>
        </aside>
      </div>
    </article>`;
  }

  function resultBox() {
    if (!last) return `<div class="cs-result cs-result--empty">Здесь появится результат. Кликните по имени Атрибута, Навыка или по d10.</div>`;
    const cls = last.margin >= 0 ? (last.crit ? 'is-ok' : '') : 'is-fail';
    return `<div class="cs-result ${cls}"><div class="cs-result__label">${esc(last.label)}</div><div class="cs-result__pool">${last.pool}d10 · сложность ${last.diff}${last.desp ? ' · Отчаяние +' + last.desp : ''}</div>
      <div class="cs-dice">${last.dice.map(v => `<span class="cs-die-val ${v >= 6 ? 'hit' : ''} ${v === 1 ? 'one' : ''}">${v}</span>`).join('')}</div>
      <div class="cs-result__verdict">${last.margin >= 0 ? (last.crit ? 'Критическая победа' : 'Победа') : 'Провал'}</div>
      <div class="cs-result__meta">${last.total} успехов · запас ${last.margin >= 0 ? '+' + last.margin : last.margin}${last.crit ? ' · критик +' + last.crit * 2 : ''}${last.over ? ' · Перенапряжение' : ''}</div></div>`;
  }
  function logBox() {
    if (!log.length) return `<div class="cs-log__empty">Пока пусто.</div>`;
    return log.slice(0, 8).map(r => `<div class="cs-log__row ${r.margin >= 0 ? 'is-ok' : ''}"><span>${esc(r.label)}</span><b>${r.margin >= 0 ? r.total + ' усп.' : 'провал'}</b><em>${r.time}</em></div>`).join('');
  }

  function syncPanel(attr, skill) {
    panel.attr = attr; panel.skill = skill || '';
    const a = $('#cs-p-attr'), s = $('#cs-p-skill');
    if (a) a.value = panel.attr; if (s) s.value = panel.skill;
    updateGo();
  }
  function updateGo() {
    const span = $('#cs-p-roll span'); if (!span) return;
    const pool = (S.attrs[panel.attr] || 0) + (panel.skill ? (S.skills[panel.skill] || 0) : 0) + (panel.skill && S.spec[panel.skill] ? 1 : 0) + (panel.mod || 0);
    span.textContent = clamp(pool, 1, 40) + 'd10';
  }

  function doRoll(pool, diff, label, desp, ten) {
    const d = [];
    let successes = 0, tens = 0, over = false;
    for (let i = 0; i < pool; i++) { const v = 1 + Math.floor(Math.random() * 10); d.push(v); if (v >= 6) successes++; if (v === 10) tens++; }
    for (let i = 0; i < desp; i++) { const v = 1 + Math.floor(Math.random() * 10); d.push(v); if (v >= 6) successes++; if (v === 10) tens++; if (v === 1) over = true; }
    const crit = Math.floor(tens / 2);
    const total = successes + crit * 2;
    const margin = total - diff;
    const now = new Date();
    last = { label, pool: pool + desp, diff, desp, dice: d, total, crit, margin, over };
    log.unshift({ label, total, margin, time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') });
    log = log.slice(0, 12);
    const box = $('#cs-result'); if (box) box.innerHTML = resultBox();
    const lg = $('#cs-log'); if (lg) lg.innerHTML = logBox();
    toast(label + ': ' + (margin >= 0 ? total + ' ' + plural(total, 'успех', 'успеха', 'успехов') : 'провал') + (over ? ' · перенапряжение' : ''));
  }
  function rollSkill(key) {
    const attr = (S._attr && S._attr[key]) || (SKILLS[Object.keys(SKILLS).find(c => SKILLS[c].some(([k]) => k === key))] || []).find(([k]) => k === key)?.[2] || 'wit';
    const pool = (S.attrs[attr] || 0) + (S.skills[key] || 0) + (S.spec[key] ? 1 : 0) + (panel.mod || 0);
    syncPanel(attr, key);
    doRoll(pool, panel.diff, ATTRS.find(a => a.id === attr)?.name + ' + ' + (SKILL_NAMES[key] || key), Number(panel.despair) || 0, true);
  }
  function rollAttr(key) { syncPanel(key, ''); doRoll((S.attrs[key] || 0) + (panel.mod || 0), panel.diff, ATTRS.find(a => a.id === key)?.name || key, Number(panel.despair) || 0, true); }

  function setDot(kind, key, val) {
    const obj = kind === 'attr' ? S.attrs : S.skills;
    const min = kind === 'attr' ? 1 : 0;
    const cur = Number(obj[key]) || 0;
    obj[key] = clamp(cur === val ? Math.max(min, val - 1) : val, min, 5);
    persist(); rerender();
  }
  function adjust(kind, dir) {
    if (kind === 'wp') S.wpSpent = clamp((S.wpSpent || 0) - dir, 0, 10);
    if (kind === 'health') { /* no-op */ }
    persist(); rerender();
  }
  function toggleDamage(i) {
    const on = !!S.damage[i];
    for (let k = 0; k < S.damage.length; k++) S.damage[k] = on ? (k < i ? 1 : 0) : (k <= i ? 1 : 0);
    persist(); rerender();
  }
  function setTrack(kind, val) { S[kind] = clamp(val, 1, 5); persist(); rerender(); }

  function rerender() {
    const y = window.scrollY;
    const host = $('#sheet-host'); if (!host) return;
    host.innerHTML = sheetHTML(); bind(); window.scrollTo(0, y);
  }

  function bind() {
    const host = $('#sheet-host'); if (!host) return;
    host.onclick = (e) => {
      const dot = e.target.closest('[data-dot]'); if (dot) return setDot(dot.dataset.dot, dot.dataset.key, Number(dot.dataset.val));
      const rs = e.target.closest('[data-rollskill]'); if (rs) return rollSkill(rs.dataset.rollskill);
      const ra = e.target.closest('[data-rollattr]'); if (ra) return rollAttr(ra.dataset.rollattr);
      const sp = e.target.closest('[data-spec]'); if (sp) { S.spec[sp.dataset.spec] = !S.spec[sp.dataset.spec]; persist(); rerender(); return; }
      const st = e.target.closest('[data-stat]'); if (st) return adjust(st.dataset.stat, Number(st.dataset.dir));
      const dm = e.target.closest('[data-dmg]'); if (dm) return toggleDamage(Number(dm.dataset.dmg));
      const tr = e.target.closest('[data-track]'); if (tr) return setTrack(tr.dataset.track, Number(tr.dataset.val));
      const un = e.target.closest('[data-unedge]'); if (un) { S.edges = S.edges.filter(x => x !== un.dataset.unedge); persist(); rerender(); return; }
      const cs = e.target.closest('[data-cs]');
      if (cs) {
        if (cs.dataset.cs === 'save') { persist(); const list = JSON.parse(localStorage.getItem('htr:characters') || '[]'); list.push({ ...S, savedAt: Date.now() }); localStorage.setItem('htr:characters', JSON.stringify(list)); toast('Охотник сохранён'); }
        if (cs.dataset.cs === 'load') { const list = JSON.parse(localStorage.getItem('htr:characters') || '[]'); if (!list.length) toast('Сохранённых нет'); else { const v = list[list.length - 1]; delete v.savedAt; S = merge(v); persist(); rerender(); toast('Загружен последний охотник'); } }
        if (cs.dataset.cs === 'reset') { if (confirm('Сбросить лист?')) { S = base(); persist(); rerender(); } }
        if (cs.dataset.cs === 'print') window.print();
        return;
      }
      if (e.target.closest('#cs-p-roll')) {
        const pool = (S.attrs[panel.attr] || 0) + (panel.skill ? (S.skills[panel.skill] || 0) : 0) + (panel.skill && S.spec[panel.skill] ? 1 : 0) + (panel.mod || 0);
        doRoll(pool, panel.diff, (ATTRS.find(a => a.id === panel.attr)?.name || '') + (panel.skill ? ' + ' + SKILL_NAMES[panel.skill] : ''), Number(panel.despair) || 0, true);
        return;
      }
      if (e.target.closest('#cs-edge-add')) {
        const sel = $('#cs-edge-select'); if (sel && sel.value) { S.edges.push(sel.value); S.edges = [...new Set(S.edges)].slice(0, 3); persist(); rerender(); }
      }
    };
    host.onchange = (e) => {
      const t = e.target;
      if (t.dataset.id) { S[t.dataset.id] = t.value; persist(); if (t.dataset.id === 'creed' || t.dataset.id === 'drive') rerender(); return; }
      if (t.dataset.skillattr) { S._attr = S._attr || {}; S._attr[t.dataset.skillattr] = t.value; persist(); return; }
      if (t.id === 'cs-p-attr') { panel.attr = t.value; updateGo(); }
      if (t.id === 'cs-p-skill') { panel.skill = t.value; updateGo(); }
      if (t.id === 'cs-p-diff') { panel.diff = clamp(parseInt(t.value, 10) || 2, 1, 10); }
      if (t.id === 'cs-p-mod') { panel.mod = clamp(parseInt(t.value, 10) || 0, -5, 5); updateGo(); }
      if (t.id === 'cs-p-despair') { panel.despair = clamp(parseInt(t.value, 10) || 0, 0, 5); }
      if (t.id === 'cs-p-ten') { /* всегда 10 снова, оставлено для совместимости */ }
    };
    host.oninput = (e) => {
      const t = e.target;
      if (t.dataset.id) { S[t.dataset.id] = t.value; persist(); if (t.dataset.id === 'name') { const h = $('#cs-title'); if (h) h.textContent = t.value || 'Безымянный'; } }
      if (t.id === 'cs-p-diff') panel.diff = clamp(parseInt(t.value, 10) || 2, 1, 10);
      if (t.id === 'cs-p-mod') { panel.mod = clamp(parseInt(t.value, 10) || 0, -5, 5); updateGo(); }
      if (t.id === 'cs-p-despair') panel.despair = clamp(parseInt(t.value, 10) || 0, 0, 5);
    };
  }

  function toast(msg) {
    const t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-on'); setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  window.HTR_SHEET = {
    render() { return `<div id="sheet-host"></div>`; },
    mount() { if (!S.name && !S.concept && !S.creed) { /* пустой лист */ } rerender(); },
  };
})();
