/* ============================================================
   ПЕПЕЛ НЕБЕС — интерактивный лист персонажа
   ============================================================ */
(function () {
  'use strict';
  const D = window.DTF_SHEET_DATA;
  if (!D) return;

  const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const ATTR_SHORT = { str: 'Сил', dex: 'Лов', sta: 'Вын', cha: 'Хар', man: 'Ман', app: 'При', per: 'Вос', int: 'Инт', wit: 'Соч' };
  const ABIL_ATTR = {
    alert: 'per', athl: 'dex', brawl: 'str', dodge: 'dex', emp: 'per', expr: 'cha', intim: 'man', lead: 'cha', street: 'man', subter: 'man',
    anim: 'cha', craft: 'dex', drive: 'dex', etiq: 'cha', fire: 'dex', melee: 'dex', perf: 'cha', sec: 'wit', stealth: 'dex', surv: 'per',
    acad: 'int', comp: 'int', fin: 'int', inv: 'per', law: 'int', ling: 'int', med: 'int', occ: 'int', pol: 'int', res: 'int', sci: 'int', rel: 'int',
  };
  const HEALTH = [
    { label: '0', pen: 0, name: 'Царапина' },
    { label: '−1', pen: 1, name: 'Ушиб' },
    { label: '−1', pen: 1, name: 'Рана' },
    { label: '−2', pen: 2, name: 'Тяжёлая' },
    { label: '−2', pen: 2, name: 'Критическая' },
    { label: '−5', pen: 5, name: 'Смертельная' },
    { label: '—', pen: 9, name: 'Без сознания' },
  ];
  const panel = { attr: 'dex', abil: '', diff: 6, mod: 0, ten: true, wound: true };
  let last = null;
  let log = [];

  const S = () => D.state;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const attrName = (id) => (D.ATTRS.find(a => a.id === id) || {}).name || id;
  const abilName = (id) => D.ABIL_NAMES[id] || id;
  const plural = (n, one, few, many) => { const m = n % 100, d = n % 10; if (m > 10 && m < 20) return many; if (d > 1 && d < 5) return few; if (d === 1) return one; return many; };

  function stats() { return S(); }
  function ensure() {
    const s = stats();
    if (!s.rollAttr) s.rollAttr = {};
    if (!s.lores) s.lores = {};
    if (!Array.isArray(s.damage)) s.damage = [0, 0, 0, 0, 0, 0, 0];
    while (s.damage.length < 7) s.damage.push(0);
    const lores = D.loresFor(s.house);
    if (!s.primary && lores.length) {
      s.primary = lores[0].id;
      if (!s.lores[s.primary]) s.lores[s.primary] = 1;
    }
  }
  function persist() { D.persist(); }
  function woundPenalty() {
    const d = stats().damage || [];
    let idx = -1;
    d.forEach((v, i) => { if (v) idx = i; });
    return idx < 0 ? 0 : HEALTH[idx].pen;
  }
  function woundsLabel() {
    const p = woundPenalty();
    return p === 0 ? 'без штрафа' : (p >= 9 ? 'без сознания' : '−' + p + ' к броскам');
  }

  /* ---------------- разметка ---------------- */
  function dots(kind, key, val, max, min) {
    const v = Number(val) || 0;
    const mn = min == null ? 0 : min;
    return `<span class="cs-dots" role="group" aria-label="${esc(abilName(key) || attrName(key))}: ${v} из ${max}">${Array.from({ length: max }, (_, i) => {
      const n = i + 1;
      return `<button class="cs-dot ${n <= v ? 'on' : ''}" data-dot="${kind}" data-key="${key}" data-val="${n}" title="${n}" aria-label="${n}"></button>`;
    }).join('')}</span>`;
  }

  function attrGroup(cat) {
    const s = stats();
    return `<div class="cs-attrgroup">
      <h3>${({ physical: 'Физические', social: 'Социальные', mental: 'Умственные' })[cat]}</h3>
      ${D.ATTRS.filter(a => a.cat === cat).map(a => `<div class="cs-attr">
        <button class="cs-attr__name" data-rollattr="${a.id}" title="Бросить ${esc(a.name)}">${esc(a.name)}</button>
        ${dots('attr', a.id, s.attrs[a.id], 5, 1)}
        <b class="cs-attr__val">${s.attrs[a.id]}</b>
      </div>`).join('')}
    </div>`;
  }

  function abilGroup(cat) {
    const s = stats();
    return `<div class="cs-abilgroup ${cat === 'knowledges' ? 'cs-abilgroup--wide' : ''}">
      <h3>${({ talents: 'Таланты', skills: 'Навыки', knowledges: 'Знания' })[cat]}</h3>
      <div class="cs-abilrows">
      ${D.ABILS[cat].map(([k, name]) => {
        const attr = s.rollAttr[k] || ABIL_ATTR[k] || 'wit';
        return `<div class="cs-abil">
          <button class="cs-abil__name" data-rollabil="${k}" title="Бросить ${esc(name)}">${esc(name)}</button>
          ${dots('abil', k, s.abil[k], 5, 0)}
          <select class="cs-abil__attr" data-abilattr="${k}" aria-label="Атрибут для ${esc(name)}">
            ${D.ATTRS.map(a => `<option value="${a.id}" ${a.id === attr ? 'selected' : ''}>${ATTR_SHORT[a.id]}</option>`).join('')}
          </select>
          <button class="cs-die" data-rollabil="${k}" title="Бросить ${esc(name)} + ${esc(attrName(attr))}">d10</button>
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }

  function statBox(label, value, kind, dirs, extra) {
    return `<div class="cs-stat">
      <span>${label}</span><b class="${extra || ''}">${value}</b>
      ${dirs ? `<div class="cs-stat__ctrl"><button data-stat="${kind}" data-dir="-1" aria-label="минус">−</button><button data-stat="${kind}" data-dir="1" aria-label="плюс">+</button></div>` : ''}
    </div>`;
  }

  function healthTrack() {
    const s = stats();
    return `<div class="cs-health">${HEALTH.map((h, i) => `<button class="cs-health__box ${s.damage[i] ? 'on' : ''}" data-dmg="${i}" title="${h.name} (${h.label})"><span>${h.label}</span></button>`).join('')}</div>
      <div class="cs-health__meta"><span>${HEALTH.filter((_, i) => s.damage[i]).length} из 7</span><span>${woundsLabel()}</span></div>`;
  }

  function rollPanel() {
    const s = stats();
    return `<div class="cs-roll">
      <div class="cs-roll__row">
        <label>Атрибут<select id="cs-p-attr">${D.ATTRS.map(a => `<option value="${a.id}" ${panel.attr === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
        <label>Способность<select id="cs-p-abil"><option value="">— нет —</option>${Object.values(D.ABILS).flat().map(([k, n]) => `<option value="${k}" ${panel.abil === k ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
      </div>
      <div class="cs-roll__row cs-roll__row--3">
        <label>Сложность<input id="cs-p-diff" type="number" min="2" max="10" value="${panel.diff}"></label>
        <label>Модификатор<input id="cs-p-mod" type="number" min="-10" max="10" value="${panel.mod}"></label>
        <label class="cs-check"><input id="cs-p-wound" type="checkbox" ${panel.wound ? 'checked' : ''}> штраф ран</label>
      </div>
      <label class="cs-check"><input id="cs-p-ten" type="checkbox" ${panel.ten ? 'checked' : ''}> десятки дают дополнительный бросок</label>
      <button class="btn btn--blood cs-roll__go" id="cs-p-roll">${'Бросить'} <span>${clamp((s.attrs[panel.attr] || 0) + (panel.abil ? (s.abil[panel.abil] || 0) : 0) + Number(panel.mod || 0) - (panel.wound ? woundPenalty() : 0), 1, 40)}d10</span></button>
    </div>`;
  }

  function resultBox() {
    if (!last) return `<div class="cs-result cs-result--empty">Здесь появится результат броска. Кликните по имени Атрибута, Способности или по кнопке d10.</div>`;
    const cls = last.botch ? 'is-botch' : last.net > 0 ? 'is-ok' : 'is-fail';
    return `<div class="cs-result ${cls}">
      <div class="cs-result__label">${esc(last.label)}</div>
      <div class="cs-result__pool">${last.total}d10 · сложность ${last.diff}${last.pen ? ' · штраф −' + last.pen : ''}</div>
      <div class="cs-dice">${last.dice.map(v => `<span class="cs-die-val ${v >= last.diff ? 'hit' : ''} ${v === 1 ? 'one' : ''} ${v === 10 ? 'ten' : ''}">${v}</span>`).join('')}</div>
      <div class="cs-result__verdict">${last.botch ? 'Ботч' : last.net > 0 ? last.net + ' ' + plural(last.net, 'успех', 'успеха', 'успехов') : 'Провал'}</div>
      <div class="cs-result__meta">${last.dice.length} ${plural(last.dice.length, 'кость', 'кости', 'костей')} · ${last.ones} ${plural(last.ones, 'единица', 'единицы', 'единиц')}</div>
    </div>`;
  }

  function logBox() {
    if (!log.length) return `<div class="cs-log__empty">Пока пусто.</div>`;
    return log.slice(0, 8).map(r => `<div class="cs-log__row ${r.botch ? 'is-botch' : r.net > 0 ? 'is-ok' : ''}">
      <span>${esc(r.label)}</span><b>${r.botch ? 'ботч' : r.net > 0 ? r.net + ' усп.' : 'провал'}</b><em>${r.time}</em>
    </div>`).join('');
  }

  function loreRows() {
    const s = stats();
    const opts = D.loresFor(s.house);
    const common = (window.DTF.lores || []).filter(l => l.house === 'common');
    const all = opts.concat(common.filter(c => !opts.some(o => o.id === c.id)));
    return all.map(l => `<div class="cs-lore ${s.primary === l.id ? 'is-primary' : ''}">
      <button class="cs-lore__star" data-primary="${l.id}" title="Сделать основным Знанием">${s.primary === l.id ? '★' : '☆'}</button>
      <span class="cs-lore__name">${esc(l.name)}</span>
      ${dots('lore', l.id, s.lores[l.id], 5, 0)}
    </div>`).join('');
  }

  function sheetHTML() {
    const s = stats();
    const house = (D.HOUSES.find(h => h.id === s.house) || {}).name || '';
    const faction = D.FACTION_NAMES[s.faction] || '';
    const visage = D.VISAGE[s.primary] || '—';
    const primaryLore = (D.loresFor(s.house).find(l => l.id === s.primary) || {}).name || '—';
    return `<article class="page sheet-page">
      <nav class="crumbs"><a href="#/">Главная</a><span>/</span><a href="#/tools">Инструменты</a><span>/</span><span>Лист персонажа</span></nav>
      <header class="page__head">
        <div class="page__kicker">Лист персонажа · интерактивный</div>
        <h1 id="cs-title">${esc(s.name || 'Безымянный')}</h1>
        <p class="page__sub">${esc(s.celestial || 'Небесное имя не выбрано')} · ${esc(house)} · ${esc(faction)}</p>
        <div class="page__meta"><div class="tags">
          <span class="tag">Вера ${s.faith}</span><span class="tag">Воля ${D.willpower()}</span><span class="tag">Мука ${D.tormentValue()}</span><span class="tag">Лик: ${esc(visage)}</span>
        </div></div>
      </header>
      <div class="cs-tools">
        <button class="btn btn--blood" data-cs="save">${'Сохранить'}</button>
        <button class="btn btn--ghost" data-cs="load">Загрузить</button>
        <button class="btn btn--ghost" data-cs="reset">Сбросить</button>
        <button class="btn btn--ghost" data-cs="print">Печать</button>
        <span class="cs-tools__hint">Изменения сохраняются в браузере автоматически</span>
      </div>

      <div class="cs-identity">
        <label>Имя носителя<input data-id="name" value="${esc(s.name)}" placeholder="Лора Блейк"></label>
        <label>Небесное имя<input data-id="celestial" value="${esc(s.celestial)}" placeholder="Зафриэль"></label>
        <label>Концепция<input data-id="concept" value="${esc(s.concept)}" placeholder="Адвокат, продавший душу"></label>
        <label>Дом<select data-id="house">${D.HOUSES.map(h => `<option value="${h.id}" ${h.id === s.house ? 'selected' : ''}>${h.name}</option>`).join('')}</select></label>
        <label>Фракция<select data-id="faction">${D.FACTIONS.map(f => `<option value="${f}" ${f === s.faction ? 'selected' : ''}>${D.FACTION_NAMES[f]}</option>`).join('')}</select></label>
        <label>Нрав<select data-id="nature">${D.NATURES.map(n => `<option value="${n}" ${n === s.nature ? 'selected' : ''}>${D.NATURE_RU[n] || n}</option>`).join('')}</select></label>
        <label>Маска<select data-id="demeanor">${D.NATURES.map(n => `<option value="${n}" ${n === s.demeanor ? 'selected' : ''}>${D.NATURE_RU[n] || n}</option>`).join('')}</select></label>
      </div>

      <div class="cs-grid">
        <div class="cs-col">
          <section class="cs-panel">
            <div class="cs-panel__head"><h2>Атрибуты</h2><span>клик по ромбу — значение · клик по имени — бросок</span></div>
            <div class="cs-attrs">${['physical', 'social', 'mental'].map(attrGroup).join('')}</div>
          </section>
          <section class="cs-panel">
            <div class="cs-panel__head"><h2>Способности</h2><span>каждая строка бросает выбранный Атрибут + Способность</span></div>
            <div class="cs-abils">${['talents', 'skills', 'knowledges'].map(abilGroup).join('')}</div>
          </section>
        </div>

        <aside class="cs-col cs-col--side">
          <section class="cs-panel">
            <div class="cs-panel__head"><h2>Состояние</h2><span>Вера · Воля · Мука</span></div>
            <div class="cs-statgrid">
              ${statBox('Вера', s.faith, 'faith', true)}
              ${statBox('Воля', D.willpower(), 'wp', true)}
              ${statBox('Мука', D.tormentValue(), 'torment', true, 'red')}
              ${statBox('Здоровье', '7', null, false)}
            </div>
            <div class="cs-healthwrap">${healthTrack()}</div>
          </section>

          <section class="cs-panel">
            <div class="cs-panel__head"><h2>Добродетели</h2><span>две высшие дают Волю</span></div>
            ${D.VIRTUES.map(([k, n]) => `<div class="cs-virtue"><span>${esc(n)}</span>${dots('virtue', k, s.virtues[k], 5, 1)}</div>`).join('')}
          </section>

          <section class="cs-panel">
            <div class="cs-panel__head"><h2>Бросок</h2><span>Атрибут + Способность</span></div>
            ${rollPanel()}
            <div id="cs-result">${resultBox()}</div>
          </section>

          <section class="cs-panel">
            <div class="cs-panel__head"><h2>Журнал</h2><span>последние броски</span></div>
            <div id="cs-log">${logBox()}</div>
          </section>
        </aside>
      </div>

      <div class="cs-lower">
        <section class="cs-panel">
          <div class="cs-panel__head"><h2>Преимущества</h2><span>клик по ромбу — значение</span></div>
          <div class="cs-bgs">${D.BACKGROUNDS.map(([k, n]) => `<div class="cs-bg"><span>${esc(n)}</span>${dots('bg', k, s.bg[k], 5, 0)}</div>`).join('')}</div>
        </section>
        <section class="cs-panel">
          <div class="cs-panel__head"><h2>Знания</h2><span>★ — основное Знание, определяет Лик</span></div>
          <div class="cs-lores">${loreRows()}</div>
          <div class="cs-visage"><b>${esc(visage)}</b><span>${esc(primaryLore)}</span></div>
        </section>
      </div>
    </article>`;
  }

  /* ---------------- броски ---------------- */
  function doRoll(pool, diff, label, ten, wound) {
    const pen = wound ? woundPenalty() : 0;
    const total = clamp(Math.round(pool) - pen, 1, 40);
    const dice = [];
    let successes = 0, ones = 0;
    for (let i = 0; i < total; i++) {
      let v = 1 + Math.floor(Math.random() * 10);
      dice.push(v);
      if (v >= diff) successes++;
      if (v === 1) ones++;
      if (ten && v === 10) {
        for (let k = 0; k < 10; k++) {
          const w = 1 + Math.floor(Math.random() * 10);
          dice.push(w);
          if (w >= diff) successes++;
          if (w === 1) ones++;
          if (w !== 10) break;
        }
      }
    }
    const net = Math.max(0, successes - ones);
    last = { label, pool, total, pen, diff, dice, successes, ones, net, botch: successes === 0 && ones > 0 };
    const d = new Date();
    log.unshift({ label, net, botch: last.botch, time: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') });
    log = log.slice(0, 12);
    updateResult();
    toast(label + ': ' + (last.botch ? 'ботч' : net > 0 ? net + ' ' + plural(net, 'успех', 'успеха', 'успехов') : 'провал'));
  }

  function updateResult() {
    const box = $('#cs-result');
    if (box) box.innerHTML = resultBox();
    const lg = $('#cs-log');
    if (lg) lg.innerHTML = logBox();
  }

  function syncPanel(attr, abil) {
    panel.attr = attr;
    panel.abil = abil || '';
    const a = $('#cs-p-attr'), b = $('#cs-p-abil');
    if (a) a.value = panel.attr;
    if (b) b.value = panel.abil;
    updateGoLabel();
  }

  function rollAbility(key) {
    const s = stats();
    const attr = s.rollAttr[key] || ABIL_ATTR[key] || 'wit';
    const pool = (s.attrs[attr] || 0) + (s.abil[key] || 0);
    syncPanel(attr, key);
    doRoll(pool, panel.diff, attrName(attr) + ' + ' + abilName(key), panel.ten, panel.wound);
  }
  function rollAttr(key) {
    const s = stats();
    syncPanel(key, '');
    doRoll(s.attrs[key] || 0, panel.diff, attrName(key), panel.ten, panel.wound);
  }

  /* ---------------- изменение значений ---------------- */
  function setDot(kind, key, val) {
    const s = stats();
    const map = { attr: s.attrs, abil: s.abil, bg: s.bg, virtue: s.virtues, lore: s.lores };
    if (!map[kind]) return;
    const max = 5, min = kind === 'attr' || kind === 'virtue' ? 1 : 0;
    const cur = Number(map[kind][key]) || 0;
    const next = cur === val ? Math.max(min, val - 1) : val;
    if (kind === 'lore') {
      s.lores[key] = clamp(next, 0, 5);
      if (!s.primary) s.primary = key;
    } else {
      map[kind][key] = clamp(next, min, max);
    }
    persist();
    rerender();
  }

  function adjustStat(kind, dir) {
    const s = stats();
    if (kind === 'faith') s.faith = clamp(s.faith + dir, 1, 10);
    if (kind === 'wp') s.free.wp = clamp((s.free.wp || 0) + dir, -9, 9);
    if (kind === 'torment') s.torment = clamp(D.tormentValue() + dir, 0, 10);
    if (kind === 'willpower') s.free.wp = clamp((s.free.wp || 0) + dir, -9, 9);
    persist();
    rerender();
  }

  function toggleDamage(i) {
    const s = stats();
    if (!Array.isArray(s.damage)) s.damage = [0, 0, 0, 0, 0, 0, 0];
    const on = !!s.damage[i];
    for (let k = 0; k < s.damage.length; k++) s.damage[k] = on ? (k < i ? 1 : 0) : (k <= i ? 1 : 0);
    persist();
    rerender();
  }

  function setPrimary(key) {
    const s = stats();
    s.primary = key;
    if (!s.lores[key]) s.lores[key] = 1;
    persist();
    rerender();
  }

  function rerender() {
    ensure();
    const y = window.scrollY;
    const host = $('#sheet-host');
    if (!host) return;
    host.innerHTML = sheetHTML();
    bind();
    window.scrollTo(0, y);
  }

  /* ---------------- события ---------------- */
  function bind() {
    const host = $('#sheet-host');
    if (!host) return;
    host.onclick = (e) => {
      const dot = e.target.closest('[data-dot]');
      if (dot) { setDot(dot.dataset.dot, dot.dataset.key, Number(dot.dataset.val)); return; }
      const rollB = e.target.closest('[data-rollabil]');
      if (rollB) { rollAbility(rollB.dataset.rollabil); return; }
      const rollA = e.target.closest('[data-rollattr]');
      if (rollA) { rollAttr(rollA.dataset.rollattr); return; }
      const stat = e.target.closest('[data-stat]');
      if (stat) { adjustStat(stat.dataset.stat, Number(stat.dataset.dir)); return; }
      const dmg = e.target.closest('[data-dmg]');
      if (dmg) { toggleDamage(Number(dmg.dataset.dmg)); return; }
      const prim = e.target.closest('[data-primary]');
      if (prim) { setPrimary(prim.dataset.primary); return; }
      const act = e.target.closest('[data-cs]');
      if (act) {
        const a = act.dataset.cs;
        if (a === 'save') { D.saveRoster(); return; }
        if (a === 'load') { loadRoster(); return; }
        if (a === 'reset') { if (confirm('Сбросить лист к чистому шаблону?')) { D.reset(); rerender(); } return; }
        if (a === 'print') { window.print(); return; }
      }
      if (e.target.closest('#cs-p-roll')) { doPanelRoll(); return; }
    };
    host.onchange = (e) => {
      const t = e.target;
      if (t.dataset.id) {
        const s = stats();
        if (t.dataset.id === 'house') {
          s.house = t.value; s.lores = {}; s.primary = ''; s.torment = null;
        } else if (t.dataset.id === 'faction') s.faction = t.value;
        else if (t.dataset.id === 'nature') s.nature = t.value;
        else if (t.dataset.id === 'demeanor') s.demeanor = t.value;
        else s[t.dataset.id] = t.value;
        persist();
        rerender();
        return;
      }
      if (t.dataset.abilattr) {
        stats().rollAttr[t.dataset.abilattr] = t.value;
        persist();
        return;
      }
      if (t.id === 'cs-p-attr') { panel.attr = t.value; updateGoLabel(); }
      if (t.id === 'cs-p-abil') { panel.abil = t.value; updateGoLabel(); }
      if (t.id === 'cs-p-diff') panel.diff = clamp(parseInt(t.value, 10) || 6, 2, 10);
      if (t.id === 'cs-p-mod') panel.mod = clamp(parseInt(t.value, 10) || 0, -10, 10);
      if (t.id === 'cs-p-ten') panel.ten = t.checked;
      if (t.id === 'cs-p-wound') panel.wound = t.checked;
      updateGoLabel();
    };
    host.oninput = (e) => {
      const t = e.target;
      if (t.dataset.id && !['house', 'faction', 'nature', 'demeanor'].includes(t.dataset.id)) {
        stats()[t.dataset.id] = t.value;
        persist();
        if (t.dataset.id === 'name') { const h = $('#cs-title'); if (h) h.textContent = t.value || 'Безымянный'; }
        if (t.dataset.id === 'celestial') {
          const s = stats();
          const sub = $('.sheet-page .page__sub');
          if (sub) sub.textContent = (t.value || 'Небесное имя не выбрано') + ' · ' + ((D.HOUSES.find(h => h.id === s.house) || {}).name || '') + ' · ' + (D.FACTION_NAMES[s.faction] || '');
        }
      }
      if (t.id === 'cs-p-diff') { panel.diff = clamp(parseInt(t.value, 10) || 6, 2, 10); updateGoLabel(); }
      if (t.id === 'cs-p-mod') { panel.mod = clamp(parseInt(t.value, 10) || 0, -10, 10); updateGoLabel(); }
    };
  }

  function updateGoLabel() {
    const btn = $('#cs-p-roll span');
    if (!btn) return;
    const s = stats();
    const pool = (s.attrs[panel.attr] || 0) + (panel.abil ? (s.abil[panel.abil] || 0) : 0) + Number(panel.mod || 0);
    btn.textContent = clamp(pool - (panel.wound ? woundPenalty() : 0), 1, 40) + 'd10';
  }

  function doPanelRoll() {
    const s = stats();
    const pool = (s.attrs[panel.attr] || 0) + (panel.abil ? (s.abil[panel.abil] || 0) : 0) + Number(panel.mod || 0);
    const label = attrName(panel.attr) + (panel.abil ? ' + ' + abilName(panel.abil) : '');
    doRoll(pool, panel.diff, label, panel.ten, panel.wound);
  }

  function loadRoster() {
    try {
      const list = JSON.parse(localStorage.getItem('dtf:characters') || '[]');
      if (!list.length) { toast('Сохранённых персонажей нет'); return; }
      const lastSaved = list[list.length - 1];
      delete lastSaved.savedAt;
      D.state = lastSaved;
      persist();
      rerender();
      toast('Загружен последний сохранённый персонаж');
    } catch (e) { toast('Не удалось загрузить'); }
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('is-on');
    setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  window.DTF_SHEET = {
    render() {
      return `<div id="sheet-host"></div>`;
    },
    mount() {
      ensure();
      rerender();
    },
  };
})();
