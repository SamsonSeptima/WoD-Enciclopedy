/* ============================================================
   ПЕПЕЛ НЕБЕС — конструктор падшего
   ============================================================ */
(function () {
  'use strict';
  const DTF = (window.DTF = window.DTF || {});
  const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const HOUSES = [
    { id: 'devils', name: 'Дьяволы', en: 'Devils', torment: 4 },
    { id: 'fiends', name: 'Изверги', en: 'Fiends', torment: 3 },
    { id: 'scourges', name: 'Кнуты', en: 'Scourges', torment: 3 },
    { id: 'defilers', name: 'Осквернители', en: 'Defilers', torment: 3 },
    { id: 'devourers', name: 'Пожиратели', en: 'Devourers', torment: 4 },
    { id: 'malefactors', name: 'Малефакторы', en: 'Malefactors', torment: 3 },
    { id: 'slayers', name: 'Убийцы', en: 'Slayers', torment: 4 },
  ];
  const FACTIONS = ['luciferans', 'faustians', 'cryptics', 'raveners', 'reconcilers'];
  const FACTION_NAMES = { luciferans: 'Люцифериане', faustians: 'Фаустианцы', cryptics: 'Скрытные', raveners: 'Жаждущие', reconcilers: 'Миротворцы' };

  const ATTRS = [
    { id: 'str', name: 'Сила', cat: 'physical' }, { id: 'dex', name: 'Ловкость', cat: 'physical' }, { id: 'sta', name: 'Выносливость', cat: 'physical' },
    { id: 'cha', name: 'Харизма', cat: 'social' }, { id: 'man', name: 'Манипулирование', cat: 'social' }, { id: 'app', name: 'Привлекательность', cat: 'social' },
    { id: 'per', name: 'Восприятие', cat: 'mental' }, { id: 'int', name: 'Интеллект', cat: 'mental' }, { id: 'wit', name: 'Сообразительность', cat: 'mental' },
  ];
  const CAT_NAMES = { physical: 'Физические', social: 'Социальные', mental: 'Умственные' };
  const ABILS = {
    talents: [['alert', 'Внимательность'], ['athl', 'Атлетика'], ['brawl', 'Драка'], ['dodge', 'Уклонение'], ['emp', 'Эмпатия'], ['expr', 'Выразительность'], ['intim', 'Запугивание'], ['lead', 'Лидерство'], ['street', 'Уличное чутьё'], ['subter', 'Хитрость']],
    skills: [['anim', 'Обращение с животными'], ['craft', 'Ремесло'], ['drive', 'Вождение'], ['etiq', 'Этикет'], ['fire', 'Огнестрельное оружие'], ['melee', 'Фехтование'], ['perf', 'Выступление'], ['sec', 'Безопасность'], ['stealth', 'Скрытность'], ['surv', 'Выживание']],
    knowledges: [['acad', 'Академические знания'], ['comp', 'Компьютеры'], ['fin', 'Финансы'], ['inv', 'Расследование'], ['law', 'Закон'], ['ling', 'Лингвистика'], ['med', 'Медицина'], ['occ', 'Оккультизм'], ['pol', 'Политика'], ['res', 'Исследования'], ['sci', 'Наука'], ['rel', 'Религия']],
  };
  const ABIL_NAMES = Object.fromEntries(Object.values(ABILS).flat().map(([k, v]) => [k, v]));
  const ABIL_CAT_NAMES = { talents: 'Таланты', skills: 'Навыки', knowledges: 'Знания' };
  const BACKGROUNDS = [['allies', 'Союзники'], ['contacts', 'Контакты'], ['eminence', 'Известность'], ['fame', 'Слава'], ['followers', 'Последователи'], ['influence', 'Влияние'], ['legacy', 'Наследие'], ['mentor', 'Наставник'], ['pacts', 'Пакты'], ['paragon', 'Парагон'], ['resources', 'Ресурсы']];
  const VIRTUES = [['conscience', 'Совесть'], ['self', 'Самоконтроль'], ['courage', 'Смелость']];
  const NATURES = ['Addict', 'Architect', 'Autocrat', 'Bon Vivant', 'Bravo', 'Caregiver', 'Child', 'Competitor', 'Conformist', 'Conniver', 'Curmudgeon', 'Deviant', 'Director', 'Fanatic', 'Gallant', 'Gambler', 'Judge', 'Loner', 'Martyr', 'Masochist', 'Monster', 'Pedagogue', 'Penitent', 'Perfectionist', 'Rebel', 'Rogue', 'Survivor', 'Thrill-Seeker', 'Traditionalist', 'Trickster', 'Visionary'];
  const NATURE_RU = {
    Addict: 'Зависимый', Architect: 'Архитектор', Autocrat: 'Автократ', 'Bon Vivant': 'Бонвиван', Bravo: 'Браво',
    Caregiver: 'Опекун', Child: 'Ребёнок', Competitor: 'Соперник', Conformist: 'Конформист', Conniver: 'Интриган',
    Curmudgeon: 'Брюзга', Deviant: 'Девиант', Director: 'Директор', Fanatic: 'Фанатик', Gallant: 'Галант',
    Gambler: 'Игрок', Judge: 'Судья', Loner: 'Одиночка', Martyr: 'Мученик', Masochist: 'Мазохист', Monster: 'Монстр',
    Pedagogue: 'Педагог', Penitent: 'Кающийся', Perfectionist: 'Перфекционист', Rebel: 'Бунтарь', Rogue: 'Плут',
    Survivor: 'Выживший', 'Thrill-Seeker': 'Искатель острых ощущений', Traditionalist: 'Традиционалист', Trickster: 'Трикстер', Visionary: 'Визионер',
  };
  const VISAGE = {
    celestials: 'Бел', flame: 'Носку', radiance: 'Кингу', awakening: 'Даган', firmament: 'Аншар', winds: 'Эллиль',
    earth: 'Кишар', paths: 'Анту', forge: 'Мумму', patterns: 'Нинсун', portals: 'Нэду', light: 'Шамаш',
    longing: 'Ишхара', storms: 'Адад', beast: 'Залту', wild: 'Нинурту', flesh: 'Аруру', death: 'Намтар',
    spirit: 'Нергал', realms: 'Эрешкигаль', transfiguration: 'Лик Метаморфоз', fundament: 'Лик Основания', humanity: 'Лик Человечества',
  };
  const COST = { attr: 5, abil: 2, bg: 1, lore: 7, faith: 6, virtue: 2, wp: 1 };

  function loresFor(house) {
    const all = DTF.lores || [];
    const h = all.filter(l => l.house === house).map(l => ({ id: l.id, name: l.name }));
    const common = all.filter(l => l.house === 'common').map(l => ({ id: l.id, name: l.name }));
    return h.concat(common);
  }

  const base = () => ({
    name: '', celestial: '', concept: '', house: 'devils', faction: 'luciferans', nature: 'Visionary', demeanor: 'Director',
    priorities: { physical: 1, social: 2, mental: 3 }, // 1 primary, 2 secondary, 3 tertiary
    attrs: { str: 1, dex: 1, sta: 1, cha: 1, man: 1, app: 1, per: 1, int: 1, wit: 1 },
    abil: Object.fromEntries(Object.values(ABILS).flat().map(([k]) => [k, 0])),
    abilPriority: { talents: 1, skills: 2, knowledges: 3 },
    bg: Object.fromEntries(BACKGROUNDS.map(([k]) => [k, 0])),
    lores: {}, primary: '', virtues: { conscience: 1, self: 1, courage: 1 },
    faith: 3, wpFree: 0, free: {}, torment: null, damage: [0, 0, 0, 0, 0, 0, 0], rollAttr: {},
  });

  const SHEET_KEY = 'dtf:sheet-v1';
  function mergeState(v) {
    const b = base();
    if (!v || typeof v !== 'object') return b;
    return {
      ...b, ...v,
      attrs: { ...b.attrs, ...(v.attrs || {}) },
      abil: { ...b.abil, ...(v.abil || {}) },
      bg: { ...b.bg, ...(v.bg || {}) },
      virtues: { ...b.virtues, ...(v.virtues || {}) },
      priorities: { ...b.priorities, ...(v.priorities || {}) },
      abilPriority: { ...b.abilPriority, ...(v.abilPriority || {}) },
      lores: { ...(v.lores || {}) },
      free: { ...(v.free || {}) },
      rollAttr: { ...(v.rollAttr || {}) },
      damage: Array.isArray(v.damage) ? v.damage.slice(0, 7) : [0, 0, 0, 0, 0, 0, 0],
    };
  }
  function loadSheetState() {
    try { return mergeState(JSON.parse(localStorage.getItem(SHEET_KEY) || 'null')); } catch (e) { return base(); }
  }
  let S = loadSheetState();

  let saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(SHEET_KEY, JSON.stringify(S)); } catch (e) { /* noop */ }
    }, 120);
  }

  const budget = (rank) => rank === 1 ? 7 : rank === 2 ? 5 : 3;
  const abilBudget = (rank) => rank === 1 ? 13 : rank === 2 ? 9 : 5;
  const usedAttr = (cat) => ATTRS.filter(a => a.cat === cat).reduce((n, a) => n + S.attrs[a.id] - 1, 0);
  const usedAbil = (cat) => Object.keys(ABILS[cat]).reduce((n, k) => n + S.abil[ABILS[cat][k][0]], 0);
  const usedBg = () => Object.values(S.bg).reduce((a, b) => a + b, 0);
  const usedLore = () => Object.values(S.lores).reduce((a, b) => a + b, 0);
  const usedVirtue = () => VIRTUES.reduce((n, [k]) => n + S.virtues[k] - 1, 0);
  const freeSpent = () => Object.values(S.free).reduce((a, b) => a + b, 0);
  const freeLeft = () => 15 - freeSpent();
  const houseTorment = () => (HOUSES.find(h => h.id === S.house) || {}).torment || 3;
  const tormentValue = () => (S.torment == null ? houseTorment() : clamp(Number(S.torment) || 0, 0, 10));
  const topVirtues = () => VIRTUES.map(([k]) => S.virtues[k]).sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a + b, 0);
  const willpower = () => clamp(topVirtues() + (S.free.wp || 0), 1, 10);

  /* ---------------- действия ---------------- */
  function bump(kind, key, dir) {
    if (dir > 0) inc(kind, key); else dec(kind, key);
    persist();
    renderBuilder();
  }

  function inc(kind, key) {
    if (kind === 'attr') {
      if (S.attrs[key] >= 5) return;
      const cat = ATTRS.find(a => a.id === key).cat;
      if (usedAttr(cat) < budget(S.priorities[cat])) { S.attrs[key]++; return; }
      if (freeLeft() >= COST.attr) { S.attrs[key]++; S.free['a:' + key] = (S.free['a:' + key] || 0) + COST.attr; }
    }
    if (kind === 'abil') {
      if (S.abil[key] >= (S.free['b:' + key] ? 5 : 3)) return;
      const cat = Object.keys(ABILS).find(c => ABILS[c].some(([k]) => k === key));
      if (usedAbil(cat) < abilBudget(S.abilPriority[cat]) && S.abil[key] < 3) { S.abil[key]++; return; }
      if (freeLeft() >= COST.abil) { S.abil[key]++; S.free['b:' + key] = (S.free['b:' + key] || 0) + COST.abil; }
    }
    if (kind === 'bg') {
      if (S.bg[key] >= 5) return;
      if (usedBg() < 5) { S.bg[key]++; return; }
      if (freeLeft() >= COST.bg) { S.bg[key]++; S.free['g:' + key] = (S.free['g:' + key] || 0) + COST.bg; }
    }
    if (kind === 'lore') {
      if (S.lores[key] >= 3) return;
      if (!S.primary) S.primary = key;
      const pr = S.lores[S.primary] || 0;
      if (key !== S.primary && S.lores[key] >= pr) return;
      if (usedLore() < 3 && (key === S.primary || S.lores[key] < pr)) { S.lores[key] = (S.lores[key] || 0) + 1; return; }
      if (freeLeft() >= COST.lore && (key === S.primary || S.lores[key] < pr)) { S.lores[key] = (S.lores[key] || 0) + 1; S.free['l:' + key] = (S.free['l:' + key] || 0) + COST.lore; }
    }
    if (kind === 'virtue') {
      if (S.virtues[key] >= 5) return;
      if (usedVirtue() < 3) { S.virtues[key]++; return; }
      if (freeLeft() >= COST.virtue) { S.virtues[key]++; S.free['v:' + key] = (S.free['v:' + key] || 0) + COST.virtue; }
    }
    if (kind === 'faith') {
      if (S.faith >= 10 || freeLeft() < COST.faith) return;
      S.faith++; S.free.faith = (S.free.faith || 0) + COST.faith;
    }
    if (kind === 'wp') {
      if (willpower() >= 10 || freeLeft() < COST.wp) return;
      S.wpFree++; S.free.wp = (S.free.wp || 0) + COST.wp;
    }
  }

  function dec(kind, key) {
    if (kind === 'attr') {
      if (S.attrs[key] <= 1) return;
      if (S.free['a:' + key]) { S.free['a:' + key] -= COST.attr; if (!S.free['a:' + key]) delete S.free['a:' + key]; }
      S.attrs[key]--;
    }
    if (kind === 'abil') {
      if (S.abil[key] <= 0) return;
      if (S.free['b:' + key]) { S.free['b:' + key] -= COST.abil; if (!S.free['b:' + key]) delete S.free['b:' + key]; }
      S.abil[key]--;
    }
    if (kind === 'bg') {
      if (S.bg[key] <= 0) return;
      if (S.free['g:' + key]) { S.free['g:' + key] -= COST.bg; if (!S.free['g:' + key]) delete S.free['g:' + key]; }
      S.bg[key]--;
    }
    if (kind === 'lore') {
      if (!S.lores[key]) return;
      if (S.free['l:' + key]) { S.free['l:' + key] -= COST.lore; if (!S.free['l:' + key]) delete S.free['l:' + key]; }
      S.lores[key]--;
      if (S.lores[key] <= 0) delete S.lores[key];
      if (S.primary === key && !S.lores[key]) S.primary = Object.keys(S.lores)[0] || '';
    }
    if (kind === 'virtue') {
      if (S.virtues[key] <= 1) return;
      if (S.free['v:' + key]) { S.free['v:' + key] -= COST.virtue; if (!S.free['v:' + key]) delete S.free['v:' + key]; }
      S.virtues[key]--;
    }
    if (kind === 'faith') {
      if (S.faith <= 3) return;
      S.faith--; S.free.faith = Math.max(0, (S.free.faith || 0) - COST.faith); if (!S.free.faith) delete S.free.faith;
    }
    if (kind === 'wp') {
      if (!S.wpFree) return;
      S.wpFree--; S.free.wp = Math.max(0, (S.free.wp || 0) - COST.wp); if (!S.free.wp) delete S.free.wp;
    }
  }

  /* ---------------- разметка ---------------- */
  const dots = (n, max, kind, key) => `<span class="bdots">${Array.from({ length: max }).map((_, i) => `<button class="bd ${i < n ? 'on' : ''}" data-${kind}="${key}" data-dir="-1" data-i="${i}" aria-label="убрать"></button><button class="bd ${i < n ? 'on' : ''}" data-${kind}="${key}" data-dir="1" data-i="${i}" aria-label="добавить"></button>`).join('')}</span>`;

  function dotRow(label, n, max, kind, key) {
    return `<div class="brow"><span class="brow__name">${esc(label)}</span><div class="brow__dots"><button class="bminus" data-${kind}="${key}" data-dir="-1" aria-label="минус">−</button><span class="bdots-static">${Array.from({ length: max }).map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span><button class="bplus" data-${kind}="${key}" data-dir="1" aria-label="плюс">+</button></div></div>`;
  }

  function renderBuilder() {
    const host = document.getElementById('builder-host');
    if (!host) return;
    const loreOpts = loresFor(S.house);
    if (!S.primary && loreOpts.length) {
      S.primary = loreOpts[0].id;
      if (usedLore() === 0) S.lores[S.primary] = 1;
    }
    const prim = S.primary || '';
    const free = freeLeft();
    host.innerHTML = `
    <div class="builder">
      <div class="builder__main">
        <section class="bstep">
          <div class="bstep__head"><span>01</span><h2>Кто он</h2><em>Дом, фракция, маска</em></div>
          <div class="field-row">
            <div class="field"><label>Имя носителя</label><input id="b-name" type="text" value="${esc(S.name)}" placeholder="Лора Блейк"></div>
            <div class="field"><label>Небесное имя</label><input id="b-cel" type="text" value="${esc(S.celestial)}" placeholder="Зафриэль"></div>
          </div>
          <div class="field"><label>Концепция</label><input id="b-concept" type="text" value="${esc(S.concept)}" placeholder="Адвокат, который продал душу задолго до тебя"></div>
          <div class="field-row">
            <div class="field"><label>Дом</label><select id="b-house">${HOUSES.map(h => `<option value="${h.id}" ${h.id === S.house ? 'selected' : ''}>${h.name} (${h.en})</option>`).join('')}</select></div>
            <div class="field"><label>Фракция</label><select id="b-faction">${FACTIONS.map(f => `<option value="${f}" ${f === S.faction ? 'selected' : ''}>${FACTION_NAMES[f]}</option>`).join('')}</select></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Нрав</label><select id="b-nature">${NATURES.map(n => `<option value="${n}" ${n === S.nature ? 'selected' : ''}>${NATURE_RU[n] || n}</option>`).join('')}</select></div>
            <div class="field"><label>Маска</label><select id="b-demeanor">${NATURES.map(n => `<option value="${n}" ${n === S.demeanor ? 'selected' : ''}>${NATURE_RU[n] || n}</option>`).join('')}</select></div>
          </div>
        </section>

        <section class="bstep">
          <div class="bstep__head"><span>02</span><h2>Атрибуты</h2><em>7 / 5 / 3</em></div>
          ${['physical', 'social', 'mental'].map(cat => `<div class="bcat">
            <div class="bcat__head"><b>${CAT_NAMES[cat]}</b>
              <select data-prio="${cat}" class="bprio">${[1, 2, 3].map(r => `<option value="${r}" ${S.priorities[cat] === r ? 'selected' : ''}>${r === 1 ? 'основная (7)' : r === 2 ? 'средняя (5)' : 'слабая (3)'}</option>`).join('')}</select>
              <span class="bcat__count">${usedAttr(cat)} / ${budget(S.priorities[cat])}</span>
            </div>
            ${ATTRS.filter(a => a.cat === cat).map(a => dotRow(a.name, S.attrs[a.id], 5, 'attr', a.id)).join('')}
          </div>`).join('')}
        </section>

        <section class="bstep">
          <div class="bstep__head"><span>03</span><h2>Способности</h2><em>13 / 9 / 5</em></div>
          ${Object.keys(ABILS).map(cat => `<div class="bcat">
            <div class="bcat__head"><b>${ABIL_CAT_NAMES[cat]}</b>
              <select data-aprio="${cat}" class="bprio">${[1, 2, 3].map(r => `<option value="${r}" ${S.abilPriority[cat] === r ? 'selected' : ''}>${r === 1 ? 'основная (13)' : r === 2 ? 'средняя (9)' : 'слабая (5)'}</option>`).join('')}</select>
              <span class="bcat__count">${usedAbil(cat)} / ${abilBudget(S.abilPriority[cat])}</span>
            </div>
            ${ABILS[cat].map(([k, n]) => dotRow(n, S.abil[k], 5, 'abil', k)).join('')}
          </div>`).join('')}
        </section>

        <section class="bstep">
          <div class="bstep__head"><span>04</span><h2>Преимущества</h2><em>5 точек</em></div>
          <div class="bcat"><div class="bcat__head"><b>Преимущества</b><span class="bcat__count">${usedBg()} / 5</span></div>
          ${BACKGROUNDS.map(([k, n]) => dotRow(n, S.bg[k], 5, 'bg', k)).join('')}</div>
        </section>

        <section class="bstep">
          <div class="bstep__head"><span>05</span><h2>Знания</h2><em>3 точки, первичное Знание</em></div>
          <div class="field"><label>Первичное Знание (определяет Лик)</label><select id="b-primary">${loreOpts.map(l => `<option value="${l.id}" ${l.id === prim ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></div>
          <div class="bcat"><div class="bcat__head"><b>Пути</b><span class="bcat__count">${usedLore()} / 3</span></div>
          ${loreOpts.map(l => dotRow(l.name, S.lores[l.id] || 0, 3, 'lore', l.id)).join('')}</div>
          <p class="bhint">Ни одно Знание не может быть выше первичного. Лик: <b>${esc(VISAGE[prim] || '—')}</b>.</p>
        </section>

        <section class="bstep">
          <div class="bstep__head"><span>06</span><h2>Добродетели и Вера</h2><em>3 точки + 15 свободных</em></div>
          <div class="bcat"><div class="bcat__head"><b>Добродетели</b><span class="bcat__count">${usedVirtue()} / 3</span></div>
          ${VIRTUES.map(([k, n]) => dotRow(n, S.virtues[k], 5, 'virtue', k)).join('')}</div>
          <div class="bgrid2">
            <div class="bstat"><span>Вера</span><b>${S.faith}</b><div class="bstat__ctrl"><button data-faith="-1">−</button><button data-faith="1">+</button></div></div>
            <div class="bstat"><span>Воля</span><b>${willpower()}</b><div class="bstat__ctrl"><button data-wp="-1">−</button><button data-wp="1">+</button></div></div>
            <div class="bstat"><span>Мука</span><b>${tormentValue()}</b></div>
            <div class="bstat"><span>Здоровье</span><b>${S.attrs.sta + 3}</b></div>
          </div>
        </section>
      </div>

      <aside class="builder__sheet">
        <div class="sheet">
          <div class="sheet__head"><div class="sheet__kicker">Лист падшего</div><h3>${esc(S.name || 'Безымянный')}</h3><p>${esc(S.celestial || 'Небесное имя не выбрано')}</p></div>
          <div class="sheet__row"><span>Дом</span><b>${esc((HOUSES.find(h => h.id === S.house) || {}).name || '')}</b></div>
          <div class="sheet__row"><span>Фракция</span><b>${esc(FACTION_NAMES[S.faction])}</b></div>
          <div class="sheet__row"><span>Нрав / маска</span><b>${esc(NATURE_RU[S.nature] || S.nature)} / ${esc(NATURE_RU[S.demeanor] || S.demeanor)}</b></div>
          <div class="sheet__row"><span>Вера</span><b>${S.faith}</b></div>
          <div class="sheet__row"><span>Воля</span><b>${willpower()}</b></div>
          <div class="sheet__row"><span>Мука</span><b class="red">${tormentValue()}</b></div>
          <div class="sheet__row"><span>Лик</span><b>${esc(VISAGE[S.primary] || '—')}</b></div>
          <div class="sheet__free ${free < 0 ? 'is-bad' : ''}"><span>Свободные очки</span><b>${free} / 15</b></div>
          <div class="sheet__actions">
            <button class="btn btn--blood" id="b-save">${'Сохранить'}</button>
            <button class="btn btn--ghost" id="b-load">Загрузить</button>
            <button class="btn btn--ghost" id="b-random">Случайно</button>
            <button class="btn btn--ghost" id="b-print">Печать</button>
          </div>
        </div>
      </aside>
    </div>`;
    bindBuilder();
  }

  function bindBuilder() {
    const host = document.getElementById('builder-host');
    host.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.attr) return bump('attr', b.dataset.attr, Number(b.dataset.dir));
      if (b.dataset.abil) return bump('abil', b.dataset.abil, Number(b.dataset.dir));
      if (b.dataset.bg) return bump('bg', b.dataset.bg, Number(b.dataset.dir));
      if (b.dataset.lore) return bump('lore', b.dataset.lore, Number(b.dataset.dir));
      if (b.dataset.virtue) return bump('virtue', b.dataset.virtue, Number(b.dataset.dir));
      if (b.dataset.faith) return bump('faith', '', Number(b.dataset.faith));
      if (b.dataset.wp) return bump('wp', '', Number(b.dataset.wp));
      if (b.id === 'b-save') return saveChar();
      if (b.id === 'b-load') return loadChar();
      if (b.id === 'b-random') return randomChar();
      if (b.id === 'b-print') return window.print();
    };
    host.onchange = (e) => {
      const t = e.target;
      if (t.id === 'b-house') { S.house = t.value; S.lores = {}; S.primary = ''; S.torment = null; }
      if (t.id === 'b-faction') S.faction = t.value;
      if (t.id === 'b-nature') S.nature = t.value;
      if (t.id === 'b-demeanor') S.demeanor = t.value;
      if (t.id === 'b-primary') { S.primary = t.value; normalizeLores(); }
      if (t.dataset.prio) { S.priorities[t.dataset.prio] = Number(t.value); normalizePriorities('priorities', 'attr'); }
      if (t.dataset.aprio) { S.abilPriority[t.dataset.aprio] = Number(t.value); normalizePriorities('abilPriority', 'abil'); }
      persist();
      renderBuilder();
    };
    ['b-name', 'b-cel', 'b-concept'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.oninput = () => {
        if (id === 'b-name') S.name = el.value;
        if (id === 'b-cel') S.celestial = el.value;
        if (id === 'b-concept') S.concept = el.value;
        persist();
        const h = document.querySelector('.sheet__head h3');
        if (id === 'b-name' && h) h.textContent = el.value || 'Безымянный';
        if (id === 'b-cel') { const p = document.querySelector('.sheet__head p'); if (p) p.textContent = el.value || 'Небесное имя не выбрано'; }
      };
    });
  }

  function normalizePriorities(field, kind) {
    // гарантируем перестановку 1/2/3 без дублей
    const obj = S[field];
    const vals = Object.values(obj);
    if (new Set(vals).size !== 3) {
      // мягко: сдвигаем конфликтующие
      const keys = Object.keys(obj);
      keys.forEach((k, i) => { obj[k] = i + 1; });
    }
  }
  function normalizeLores() {
    const pr = S.lores[S.primary] || 0;
    Object.keys(S.lores).forEach(k => { if (k !== S.primary && S.lores[k] > pr) S.lores[k] = pr; });
    while (usedLore() > 3) {
      const k = Object.keys(S.lores).sort((a, b) => S.lores[b] - S.lores[a]).find(x => x !== S.primary);
      if (!k) break;
      S.lores[k]--; if (!S.lores[k]) delete S.lores[k];
    }
  }

  function randomChar() {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    S = base();
    S.house = pick(HOUSES).id;
    S.faction = pick(FACTIONS);
    S.nature = pick(NATURES); S.demeanor = pick(NATURES);
    S.name = pick(['Лора Блейк', 'Макс Холл', 'Дэвид Кейн', 'Хелен Торн', 'Марк Восс', 'Эмили Рид', 'Томас Грин', 'Джессика Лоу']);
    S.celestial = pick(['Зафриэль', 'Мельхиор', 'Азраил', 'Гадариэль', 'Саммаэль', 'Разиэль', 'Паймон']);
    S.concept = pick(['адвокат, продавший душу', 'проповедник без веры', 'детектив, который видел слишком много', 'музыкант на дне', 'охранник больницы', 'журналистка, которой не верят']);
    // приоритеты
    S.priorities = { physical: 3, social: 1, mental: 2 }; S.priorities[pick(['physical', 'social', 'mental'])] = 1;
    S.abilPriority = { talents: 1, skills: 2, knowledges: 3 };
    // атрибуты по бюджету
    const spendCat = (cat, n) => { let guard = 0; while (n > 0 && guard++ < 200) { const a = pick(ATTRS.filter(x => x.cat === cat)); if (S.attrs[a.id] < 5) { S.attrs[a.id]++; n--; } } };
    spendCat('physical', budget(S.priorities.physical)); spendCat('social', budget(S.priorities.social)); spendCat('mental', budget(S.priorities.mental));
    // способности
    const spendAb = (cat, n) => { let guard = 0; while (n > 0 && guard++ < 300) { const [k] = pick(ABILS[cat]); if (S.abil[k] < 3) { S.abil[k]++; n--; } } };
    spendAb('talents', 13); spendAb('skills', 9); spendAb('knowledges', 5);
    // преимущества
    for (let i = 0; i < 5; i++) S.bg[pick(BACKGROUNDS)[0]]++;
    // знания
    const loreOpts = loresFor(S.house);
    S.primary = loreOpts[0].id; S.lores[S.primary] = 1;
    const others = loreOpts.slice(1);
    if (others[0]) S.lores[others[0].id] = 1;
    if (others[1]) S.lores[others[1].id] = 1;
    // добродетели
    S.virtues[pick(['conscience', 'self', 'courage'])]++; S.virtues[pick(['conscience', 'self', 'courage'])]++; S.virtues[pick(['conscience', 'self', 'courage'])]++;
    persist();
    renderBuilder();
  }

  function saveChar() {
    try {
      persist();
      const list = JSON.parse(localStorage.getItem('dtf:characters') || '[]');
      list.push({ ...S, savedAt: Date.now() });
      localStorage.setItem('dtf:characters', JSON.stringify(list));
      toast('Персонаж сохранён');
    } catch (e) { toast('Не удалось сохранить'); }
  }
  function loadChar() {
    try {
      const list = JSON.parse(localStorage.getItem('dtf:characters') || '[]');
      if (!list.length) { toast('Сохранённых персонажей нет'); return; }
      const last = list[list.length - 1];
      delete last.savedAt;
      S = mergeState(last);
      persist();
      renderBuilder();
      toast('Загружен последний сохранённый персонаж');
    } catch (e) { toast('Не удалось загрузить'); }
  }
  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('is-on');
    setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  window.DTF_BUILDER = {
    render() {
      return `<article class="page">
        <nav class="crumbs"><a href="#/">Главная</a><span>/</span><a href="#/tools">Инструменты</a><span>/</span><span>Конструктор</span></nav>
        <header class="page__head"><div class="page__kicker">За столом</div><h1>Конструктор падшего</h1>
        <p class="page__sub">Пошаговая сборка персонажа по базовым правилам: 7/5/3, 13/9/5, 5 преимуществ, 3 Знания, 3 добродетели, 15 свободных очков.</p>
        <div class="page__meta"><div class="meta-line"><a href="#/tools/sheet" style="color:var(--paper)">Открыть чистый лист персонажа →</a></div></div></header>
        <div id="builder-host"></div>
        <p class="bhint" style="margin-top:26px">Конструктор не заменяет согласование с рассказчиком: Дом, фракция и Нрав должны быть вписаны в хронику. Свободные очки считаются автоматически; значения сверх лимитов стоят по таблице (Атрибут 5, Способность 2, Знание 7, Преимущество 1, Вера 6, Добродетель 2, Воля 1).</p>
      </article>`;
    },
    mount() { renderBuilder(); },
  };

  window.DTF_SHEET_DATA = {
    get state() { return S; },
    set state(v) { S = mergeState(v); },
    base, mergeState, persist,
    saveRoster: saveChar,
    reset() { S = base(); persist(); },
    loresFor, houseTorment, tormentValue, willpower, topVirtues,
    HOUSES, FACTIONS, FACTION_NAMES, ATTRS, ABILS, ABIL_NAMES, ABIL_CAT_NAMES,
    BACKGROUNDS, VIRTUES, NATURES, NATURE_RU, VISAGE,
  };
})();
