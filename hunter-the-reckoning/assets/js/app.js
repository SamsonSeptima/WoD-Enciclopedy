/* ============================================================
   ОХОТА — Hunter: The Reckoning. Роутер, навигация, страницы.
   ============================================================ */
(function () {
  'use strict';
  const HTR = (window.HTR = window.HTR || {});
  const PAGES = HTR.pages || [];
  const EDGES = HTR.edges || [];
  const BEASTS = HTR.bestiary || [];
  const BOOKS = HTR.books || [];
  const THREATS = HTR.threats || [];
  const BEAST_TYPE = { 'Вампир': 'vampires', 'Оборотень': 'werewolves', 'Призрак': 'ghosts', 'Маг': 'mages', 'Люди': 'cults', 'Уникальная тварь': 'fey' };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const strip = (html) => String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const slug = (s) => String(s).toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const plural = (n, one, few, many) => { const m = n % 100, d = n % 10; if (m > 10 && m < 20) return many; if (d > 1 && d < 5) return few; if (d === 1) return one; return many; };
  const readingTime = (html) => Math.max(2, Math.round(strip(html).split(/\s+/).length / 175));

  const GROUPS = [
    { id: 'start', num: '01', title: 'Начало', hubTitle: 'Начать охоту', intro: 'Что такое Расплата, как человек прозревает и почему охота не отпускает.' },
    { id: 'hunt', num: '02', title: 'Охота', hubTitle: 'Охота', intro: 'Ячейка, первый взгляд, Драйв и цена, которую платит тот, кто видит слишком много.' },
    { id: 'creeds', num: '03', title: 'Кредо', hubTitle: 'Пять Кредо', intro: 'Пять способов подходить к охоте. Пять сообществ, которые узнают друг друга по шрамам.' },
    { id: 'edges', num: '04', title: 'Грани', hubTitle: 'Грани', intro: 'Активы, Способности и Дарования — то, что делает охотника опасным для ночи.' },
    { id: 'rules', num: '05', title: 'Правила', hubTitle: 'Правила', intro: 'Пул d10, успехи на 6+, Сложность, Кости Отчаяния, Опасность и бой.' },
    { id: 'character', num: '06', title: 'Персонаж', hubTitle: 'Создание персонажа', intro: 'Концепция, Амбиция, Желание, Опоры, Кредо, Драйв и первый выход на охоту.' },
    { id: 'bestiary', num: '07', title: 'Бестиарий', hubTitle: 'Бестиарий', intro: 'Вампиры, оборотни, призраки, колдуны и твари, для которых нет названия.' },
    { id: 'organizations', num: '08', title: 'Организации', hubTitle: 'Организации', intro: 'Структуры, которые охотятся на монстров — и на охотников, если те мешают.' },
    { id: 'world', num: '09', title: 'Мир', hubTitle: 'Мир охотников', intro: 'Город, сети, слухи, классическая линия и расстановка сил.' },
    { id: 'library', num: '10', title: 'Библиотека', hubTitle: 'Библиотека', intro: 'Книги H5 и классической линии: что читать и зачем.' },
    { id: 'tools', num: '11', title: 'Инструменты', hubTitle: 'Инструменты', intro: 'Лист персонажа, кости и генератор охотника. Всё работает офлайн.' },
  ];
  const GROUP = Object.fromEntries(GROUPS.map(g => [g.id, g]));

  const CREED_EN = { entrepreneurial: 'Entrepreneurial', faithful: 'Faithful', inquisitor: 'Inquisitor', martial: 'Martial', underground: 'Underground' };
  const CREED_SIGILS = {
    entrepreneurial: '<path d="M20 4v10M14 14h12l-2 6H16Z"/><path d="M20 4 16 8M20 4l4 4"/><path d="M8 36h24"/>',
    faithful: '<path d="M20 4v32M10 14h20"/><path d="M8 36c4-6 8-6 12 0 4-6 8-6 12 0"/>',
    inquisitor: '<path d="M4 20c5-8 11-12 16-12s11 4 16 12c-5 8-11 12-16 12S9 28 4 20Z"/><circle cx="20" cy="20" r="4"/><path d="M20 2v5M20 33v5"/>',
    martial: '<circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="3"/><path d="M20 3v8M20 29v8M3 20h8M29 20h8"/>',
    underground: '<path d="M6 26c0-8 6-14 14-14s14 6 14 14v8H6Z"/><path d="M12 22h4M24 22h4"/><path d="M4 34h32"/>',
  };
  const SIGILS = {
    none: '<circle cx="20" cy="20" r="12"/><path d="M20 4v6M20 30v6M4 20h6M30 20h6"/>',
  };
  const sigil = (id, cls) => `<svg class="${cls || ''}" viewBox="0 0 40 40" aria-hidden="true">${CREED_SIGILS[id] || SIGILS.none}</svg>`;

  const ICON = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    book: '<path d="M4 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4z"/><path d="M20 4h-2a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h3z"/>',
    dice: '<path d="m12 2 9 5v10l-9 5-9-5V7z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="13" r="1"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    heart: '<path d="M20 8.5a5 5 0 0 0-8-4 5 5 0 0 0-8 4c0 6 8 11 8 11s8-5 8-11Z"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>', users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2"/><path d="M16 4.5a3 3 0 0 1 0 7M17 15a6 6 0 0 1 4 6"/>',
    shuffle: '<path d="M3 6h4l10 12h4M17 6h4v4M3 18h4l3-3.5M14 9l3-3h5"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 9h6M9 13h7M9 17h4"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ICON.target}</svg>`;
  const THREAT_ICONS = {
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 5.2 4 6.4V21h8v-3.6c2.5-1.2 4-3.4 4-6.4a8 8 0 0 0-8-8Z"/><circle cx="9" cy="11" r="1.4"/><circle cx="15" cy="11" r="1.4"/><path d="M9 17h6"/>',
    shield: '<path d="M12 3 20 6v6c0 5-4 8-8 9-4-1-8-4-8-9V6Z"/><path d="M9 12l2 2 4-4"/>',
    spark: '<path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><path d="M19 3v3M20.5 4.5h-3M5 18v2M6 19H4"/>',
    claw: '<path d="M5 4c2 6 2 12 0 17M11 3c2 7 2 14 0 19M17 5c1.5 5 1.5 10 0 14"/>',
    fangs: '<path d="M5 4c2 6 3 10 3 14 0 2 1 3 2 3s2-1 2-3c0-4 1-8 3-14M15 4c1 5 1.5 8 1.5 11 0 2 .7 3 1.5 3s1.5-1 1.5-3c0-3-.5-6-1.5-11"/>',
    wolf: '<path d="m4 4 5 4h6l5-4-2 8c0 5-3 8-6 8s-6-3-6-8Z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="m10 16 2 1 2-1"/>',
    ghost: '<path d="M5 20V10a7 7 0 0 1 14 0v10l-2-1-2 1-2-1-2 1-2-1-2 1Z"/><circle cx="9.5" cy="11" r="1"/><circle cx="14.5" cy="11" r="1"/>',
    speech: '<path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9h8M8 12h5"/>',
    mage: '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/><circle cx="12" cy="12" r="3"/>',
    fairy: '<path d="M12 4c2 3 2 6 0 8-2-2-2-5 0-8ZM12 12c3-2 6-2 8 0-2 2-5 2-8 0ZM12 12c-3 2-6 2-8 0 2-2 5-2 8 0ZM12 12c0 4-2 7-2 9 2-1 3-3 3-5 0 2 1 4 3 5 0-2-2-5-2-9Z"/>',
  };
  const threatIcon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${THREAT_ICONS[n] || THREAT_ICONS.skull}</svg>`;

  const DRIVES = [
    { id: 'curiosity', name: 'Любопытство', en: 'Curiosity', text: 'Что монстры делают в тени? Копать глубже, пока не станет слишком поздно.' },
    { id: 'revenge', name: 'Месть', en: 'Vengeance', text: 'Кто-то пострадал. Весы должны быть уравновешены — любой ценой.' },
    { id: 'oath', name: 'Клятва', en: 'Oath', text: 'Слово дано созданиям ночи. Пока оно не исполнено, охотник не остановится.' },
    { id: 'greed', name: 'Жадность', en: 'Greed', text: 'Монстры наживаются на своей природе. Почему бы не забрать это себе?' },
    { id: 'pride', name: 'Гордость', en: 'Pride', text: 'Победить то, что сильнее тебя. Доказать, что человек чего-то стоит.' },
    { id: 'envy', name: 'Зависть', en: 'Envy', text: 'У них есть сила, которой они не заслуживают. Охотник хочет её коснуться.' },
    { id: 'redemption', name: 'Искупление', en: 'Redemption', text: 'Когда-то он помог монстру. Теперь он платит долг, вставая на пути опасности.' },
  ];

  const LS_FAV = 'htr:favs';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* noop */ } },
  };
  const state = { favs: store.get(LS_FAV, []), open: new Set(), lastRoute: '' };

  const PAGE = Object.fromEntries(PAGES.map(p => [p.id, p]));
  const byGroup = (g) => PAGES.filter(p => p.group === g).sort((a, b) => (a.order || 999) - (b.order || 999) || a.title.localeCompare(b.title, 'ru'));
  const EDGE = Object.fromEntries(EDGES.map(e => [e.id, e]));
  const BEAST = Object.fromEntries(BEASTS.map(b => [b.id, b]));

  /* ---------------- навигация ---------------- */
  function buildNav() {
    const nav = $('#nav');
    const html = [`<a class="nav__home" href="#/" data-nav="home">${icon('target')}<span>Главная</span></a>`];
    for (const g of GROUPS) {
      const kids = byGroup(g.id).filter(k => k.id !== g.id);
      const open = state.open.has(g.id);
      const caret = kids.length ? `<button class="nav__caret" data-toggle="${g.id}" aria-label="Развернуть раздел ${esc(g.title)}" aria-expanded="${open}">${icon('chevron')}</button>` : '';
      html.push(`<div class="nav__group ${open ? 'is-open' : ''}" data-group="${g.id}">
        <a class="nav__head" href="#/${g.id}"><span class="nav__num">${g.num}</span><span class="nav__label">${esc(g.title)}</span>${caret}</a>
        <div class="nav__list">${kids.map(k => `<a class="nav__link" href="#/${k.id}" data-page="${k.id}">${esc(k.nav || k.title)}</a>`).join('')}</div>
      </div>`);
    }
    html.push(`<div class="nav__group" data-group="about"><a class="nav__head" href="#/about"><span class="nav__num">—</span><span class="nav__label">О проекте</span></a></div>`);
    nav.innerHTML = html.join('');
  }

  function markNav(route, group) {
    $$('.nav__group').forEach(g => g.classList.remove('is-current'));
    $$('.nav__link').forEach(a => a.classList.remove('is-active'));
    $('.nav__home')?.classList.remove('is-active');
    if (!route) { $('.nav__home')?.classList.add('is-active'); return; }
    if (group) {
      const g = $(`.nav__group[data-group="${group}"]`);
      if (g) { g.classList.add('is-current'); if (!state.open.has(group) && g.querySelector('.nav__list')?.children.length) { state.open.add(group); g.classList.add('is-open'); } }
    }
    $(`.nav__link[data-page="${route}"]`)?.classList.add('is-active');
  }
  function toggleGroup(id) {
    if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
    const g = $(`.nav__group[data-group="${id}"]`);
    if (g) { g.classList.toggle('is-open'); g.querySelector('.nav__caret')?.setAttribute('aria-expanded', g.classList.contains('is-open')); }
  }

  /* ---------------- общие блоки ---------------- */
  function crumbs(items) {
    return `<nav class="crumbs" aria-label="Хлебные крошки">${items.map((it, i) => (i ? '<span>/</span>' : '') + (it.href ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`)).join('')}</nav>`;
  }
  function pageHead(p) {
    const tags = (p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    return `<header class="page__head">
      ${p.kicker ? `<div class="page__kicker">${esc(p.kicker)}</div>` : ''}
      <h1>${esc(p.title)}</h1>
      ${p.subtitle ? `<p class="page__sub">${esc(p.subtitle)}</p>` : ''}
      <div class="page__meta">${tags ? `<div class="tags">${tags}</div>` : ''}<div class="meta-line">${p.source ? esc(p.source) + ' <span class="dotsep">·</span> ' : ''}${readingTime(p.body)} мин чтения</div></div>
    </header>`;
  }
  function factsBox(p) {
    if (!p.facts || !p.facts.length) return '';
    return `<div class="rail__box"><div class="rail__title">Кратко</div><dl class="facts">${p.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`;
  }
  function sourceBox(p) { return p.source ? `<div class="rail__box"><div class="rail__title">Источник</div><p class="rail__source">${esc(p.source)}</p></div>` : ''; }
  function actionsBox(route) {
    const fav = state.favs.includes(route);
    return `<div class="rail__box"><div class="rail__title">Действия</div><div class="rail__actions">
      <button class="rail__btn ${fav ? 'is-on' : ''}" data-fav="${esc(route)}">${icon('heart')} ${fav ? 'В избранном' : 'В избранное'}</button>
      <button class="rail__btn" data-copy>${icon('link')} Ссылка</button>
      <button class="rail__btn" data-print>${icon('print')} Печать</button>
    </div></div>`;
  }
  function pager(prev, next) {
    return `<div class="page__foot">
      ${prev ? `<a class="pager" href="#/${prev.id}"><span>← Предыдущее</span><b>${esc(prev.title)}</b></a>` : '<span class="pager pager--none"></span>'}
      ${next ? `<a class="pager pager--next" href="#/${next.id}"><span>Следующее →</span><b>${esc(next.title)}</b></a>` : '<span class="pager pager--none"></span>'}
    </div>`;
  }
  const neighbor = (p) => { const l = byGroup(p.group); const i = l.findIndex(x => x.id === p.id); return { prev: i > 0 ? l[i - 1] : null, next: i >= 0 && i < l.length - 1 ? l[i + 1] : null }; };

  /* ---------------- герой и главная ---------------- */
  function hero() {
    const creeds = byGroup('creeds').length || 5;
    const edges = EDGES.length;
    return `<section class="hero">
      <div class="hero__bg" aria-hidden="true"></div>
      <div class="hero__in">
        <div class="hero__text">
          <div class="hero__kicker">Hunter: The Reckoning · Мир Тьмы</div>
          <h1><span>Охота</span><span class="red">началась</span></h1>
          <p class="hero__sub">Вы видели то, чего не должно быть. Монстры живут среди людей, и большинство предпочитает не замечать. <strong>Охотник</strong> — тот, кто заметил, записал и вышел на улицу, пока не стало поздно.</p>
          <div class="hero__actions">
            <a class="btn btn--blood" href="#/start">${icon('arrow')} Начать</a>
            <a class="btn btn--ghost" href="#/creeds">${icon('target')} 5 Кредо</a>
            <a class="btn btn--ghost" href="#/tools/sheet">Лист</a>
          </div>
          <div class="hero__stats">
            <div class="hero__stat"><b>${creeds}</b><span>${plural(creeds, 'Кредо', 'Кредо', 'Кредо')}</span></div>
            <div class="hero__stat"><b>7</b><span>Драйвов</span></div>
            <div class="hero__stat"><b>${edges || 14}</b><span>${plural(edges || 14, 'Грань', 'Грани', 'Граней')}</span></div>
            <div class="hero__stat"><b>${BOOKS.length || 10}</b><span>${plural(BOOKS.length || 10, 'книга', 'книги', 'книг')}</span></div>
          </div>
        </div>
        <div class="hero__plate" aria-hidden="true">
          <div class="plate">
            <div class="case-stamp">ДЕЛО № 001</div>
            <div class="plate__seal"><svg viewBox="0 0 40 40">${CREED_SIGILS.martial}</svg></div>
            <div class="plate__kicker">Полевое досье · не для распространения</div>
            <div class="plate__title">Охота<br><span>началась</span></div>
            <div class="plate__rule"></div>
            <p class="plate__desc">Пять Кредо. Семь Драйвов. Одна ночь, после которой вы уже не будете прежним.</p>
            <div class="plate__swatches">
              <i style="background:#241B1C"></i><i style="background:#3D3539"></i><i style="background:#4F484F"></i>
              <i style="background:#766058"></i><i style="background:#F0B569"></i><i style="background:#EADFCF"></i>
            </div>
            <div class="plate__foot"><span>MMXXVI</span><span>статус: открыто</span></div>
          </div>
          <div class="hero__cap"><span>Палитра проекта</span><span>шесть цветов</span></div>
        </div>
      </div>
    </section>`;
  }

  function home() {
    const creeds = byGroup('creeds');
    const core = ['start/what-is', 'hunt/reckoning', 'start/how-to-play'].map(id => PAGE[id]).filter(Boolean);
    const rulePages = ['rules/dice', 'rules/drive-despair', 'rules/danger', 'rules/combat'].map(id => PAGE[id]).filter(Boolean);
    const books = BOOKS.slice(0, 4);
    const palette = [['#241B1C', 'Kurobeni', 'dark'], ['#3D3539', 'Shiny Rubber', 'dark'], ['#4F484F', 'Extravagance', 'dark'], ['#766058', 'Poppy Pods', 'dark'], ['#F0B569', 'Olden Amber', 'light'], ['#EADFCF', 'Bone', 'light']];
    return hero() + `
    <section class="section">
      <div class="wrap">
        <div class="sec-head"><div><div class="sec-head__kicker">С чего начать</div><h2>Три шага <em>в ночь</em></h2></div><a class="sec-head__more" href="#/start">Все статьи ${icon('arrow')}</a></div>
        <div class="intro-grid">
          ${core.map((p, i) => `<a class="intro-card" href="#/${p.id}"><div class="intro-card__num">0${i + 1}</div><h3>${esc(p.title)}</h3><p>${esc(p.lead || '')}</p><span class="intro-card__arrow">${icon('arrow')}</span></a>`).join('')}
          <a class="intro-card" href="#/tools/sheet"><div class="intro-card__num">04</div><h3>Лист охотника</h3><p>Расставьте ромбы, отметьте раны и бросайте Атрибут + Навык прямо со страницы.</p><span class="intro-card__arrow">${icon('arrow')}</span></a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="sec-head"><div><div class="sec-head__kicker">Пять путей</div><h2>Кредо <em>охотников</em></h2></div><a class="sec-head__more" href="#/creeds">Все Кредо ${icon('arrow')}</a></div>
        <div class="houses">${creeds.map((p, i) => {
          const id = p.id.split('/')[1];
          return `<a class="house-card" href="#/${p.id}">
            <div class="house-card__top"><span class="house-card__num">${['I', 'II', 'III', 'IV', 'V'][i] || '0' + (i + 1)}</span>${sigil(id, 'house-card__sigil')}</div>
            <h3>${esc(p.title)}</h3>
            <div class="house-card__en">${esc(p.en || '')}</div>
            <p class="house-card__ep">${esc(p.subtitle || p.lead || '')}</p>
            <div class="house-card__foot"><span>${esc(p.en || CREED_EN[p.id.split('/')[1]] || '')}</span><b>Открыть →</b></div>
          </a>`;
        }).join('')}<a class="house-card house-card--all" href="#/edges">
          <div class="house-card__top"><span class="house-card__num">+</span>${icon('arrow')}</div>
          <h3>Грани</h3><div class="house-card__en">Assets · Abilities · Endowments</div>
          <p class="house-card__ep">Активы, Способности и Дарования — инструменты, которыми охотник компенсирует человеческую хрупкость.</p>
          <div class="house-card__foot"><span>Каталог</span><b>Открыть →</b></div>
        </a></div>
      </div>
    </section>

    <section class="section section--texture">
      <div class="wrap">
        <div class="sec-head"><div><div class="sec-head__kicker">Семь причин</div><h2>Драйвы</h2></div><a class="sec-head__more" href="#/hunt/drive">Подробнее ${icon('arrow')}</a></div>
        <div class="lores-strip">${DRIVES.map(d => `<a class="lore-chip" href="#/hunt/drive"><span class="lore-chip__dots">◆</span><span class="lore-chip__name">${esc(d.name)}</span><span class="lore-chip__house">${esc(d.en)}</span></a>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="sec-head"><div><div class="sec-head__kicker">За столом</div><h2>Правила <em>без тумана</em></h2></div><a class="sec-head__more" href="#/rules">Все правила ${icon('arrow')}</a></div>
        <div class="intro-grid" style="grid-template-columns:repeat(4,1fr)">
          ${rulePages.map((p, i) => `<a class="intro-card" href="#/${p.id}"><div class="intro-card__num">0${i + 1}</div><h3>${esc(p.title)}</h3><p>${esc(p.lead || '')}</p><span class="intro-card__arrow">${icon('arrow')}</span></a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap">
        <div class="sec-head"><div><div class="sec-head__kicker">Библиотека</div><h2>Книги <em>охоты</em></h2></div><a class="sec-head__more" href="#/library">Вся библиотека ${icon('arrow')}</a></div>
        <div class="books">${books.map(b => `<a class="book" href="#/library"><span class="book__spine"></span><div><h3>${esc(b.ru || b.en)}</h3><div class="book__en">${esc(b.en || '')}${b.year ? ' · ' + b.year : ''}</div><p>${esc(b.summary || '')}</p></div></a>`).join('')}</div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap">
        <div class="sec-head"><div><div class="sec-head__kicker">Референс</div><h2>Палитра <em>проекта</em></h2></div><span class="sec-head__more" style="border:0">шесть цветов одного кадра</span></div>
        <div class="palette">${palette.map(([hex, name, mode]) => `<div class="swatch swatch--${mode}" style="background:${hex}"><b>${name}</b><span>${hex}</span></div>`).join('')}</div>
      </div>
    </section>`;
  }

  /* ---------------- страница ---------------- */
  function pageView(p) {
    const { prev, next } = neighbor(p);
    const tmp = document.createElement('div');
    tmp.innerHTML = p.body || '';
    const toc = [];
    $$('h2', tmp).forEach(h => { if (!h.id) h.id = slug(h.textContent); toc.push({ id: h.id, text: h.textContent }); });
    return `<article class="page">
      ${crumbs(p.group === 'about' ? [{ label: 'Главная', href: '#/' }, { label: p.title }] : [{ label: 'Главная', href: '#/' }, { label: GROUP[p.group]?.title || 'Раздел', href: '#/' + p.group }, { label: p.nav || p.title }])}
      ${pageHead(p)}
      <div class="page__grid">
        <div class="prose">${tmp.innerHTML}</div>
        <aside class="rail">
          ${factsBox(p)}
          ${toc.length > 1 ? `<div class="rail__box"><div class="rail__title">На странице</div><ul class="toc">${toc.map(t => `<li><a href="#${t.id}" data-toc="${t.id}">${esc(t.text)}</a></li>`).join('')}</ul></div>` : ''}
          ${sourceBox(p)}${actionsBox(p.id)}
        </aside>
      </div>
      ${pager(prev, next)}
    </article>`;
  }

  /* ---------------- хабы ---------------- */
  function hubView(groupId) {
    const g = GROUP[groupId];
    if (!g) return notFound();
    if (groupId === 'creeds') return creedsHub(g);
    if (groupId === 'edges') return edgesHub(g);
    if (groupId === 'bestiary') return bestiaryHub(g);
    if (groupId === 'library') return libraryView(g);
    if (groupId === 'tools') return toolsHub(g);
    const kids = byGroup(groupId);
    const cta = kids.length % 2 ? `<a class="hub__card hub__card--cta" href="#/tools/npc"><h3>Случайный охотник</h3><p>Нужен НПС за минуту? Кредо, Драйв и крючок — одним кликом.</p><span class="tag">генератор</span></a>` : '';
    return `<article class="page">
      ${crumbs([{ label: 'Главная', href: '#/' }, { label: g.title }])}
      <header class="page__head"><div class="page__kicker">Раздел ${g.num}</div><h1>${esc(g.hubTitle || g.title)}</h1><p class="page__sub">${esc(g.intro)}</p><div class="page__meta"><div class="meta-line">${kids.length} ${plural(kids.length, 'статья', 'статьи', 'статей')}</div></div></header>
      <div class="hub">${kids.map(p => `<a class="hub__card" href="#/${p.id}"><h3>${esc(p.nav || p.title)}</h3><p>${esc(p.lead || p.subtitle || '')}</p>${(p.tags || []).slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</a>`).join('')}${cta}</div>
    </article>`;
  }

  function creedsHub(g) {
    const kids = byGroup('creeds');
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Кредо' }])}
      <header class="page__head"><div class="page__kicker">Пять путей · вероисповедания</div><h1>Пять Кредо</h1><p class="page__sub">${esc(g.intro)}</p><div class="page__meta"><div class="meta-line">5 Кредо <span class="dotsep">·</span> Семь Драйвов</div></div></header>
      <div class="houses">${kids.map((p, i) => {
        const id = p.id.split('/')[1];
        return `<a class="house-card" href="#/${p.id}">
          <div class="house-card__top"><span class="house-card__num">${['I', 'II', 'III', 'IV', 'V'][i] || i + 1}</span>${sigil(id, 'house-card__sigil')}</div>
          <h3>${esc(p.title)}</h3><div class="house-card__en">${esc(p.en || '')}</div>
          <p class="house-card__ep">${esc(p.subtitle || p.lead || '')}</p>
          <div class="house-card__foot"><span>${esc(p.en || CREED_EN[p.id.split('/')[1]] || '')}</span><b>Открыть →</b></div>
        </a>`;
      }).join('')}<a class="house-card house-card--all" href="#/character/creation">
        <div class="house-card__top"><span class="house-card__num">+</span>${icon('users')}</div><h3>Собрать охотника</h3><div class="house-card__en">Character</div>
        <p class="house-card__ep">Кредо, Драйв, Амбиция, Желание и Опоры — пошагово, с листом и бросками.</p>
        <div class="house-card__foot"><span>Персонаж</span><b>Открыть →</b></div>
      </a></div>
      <div class="prose" style="margin-top:40px"><p class="lead">Кредо — не класс и не профессия. Это способ смотреть на ночь: что в ней главное, чего от неё ждать и чем за это платить.</p></div>
    </article>`;
  }

  function edgesHub(g) {
    const cats = [['all', 'Все'], ['asset', 'Активы'], ['ability', 'Способности'], ['endowment', 'Дарования']];
    const catName = { asset: 'Актив', ability: 'Способность', endowment: 'Дарование' };
    const cards = (f) => EDGES.filter(e => f === 'all' || e.category === f).map(e => `<a class="edge-card" href="#/edges/${e.id}">
      <div class="edge-card__cat">${catName[e.category] || 'Грань'}</div>
      <h3>${esc(e.name)}</h3><div class="edge-card__en">${esc(e.en || '')}</div>
      <p>${esc(e.summary || '')}</p>
      <div class="edge-card__pool">${esc(e.pool || '')}</div>
    </a>`).join('');
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Грани' }])}
      <header class="page__head"><div class="page__kicker">Инструменты охотника</div><h1>Грани</h1><p class="page__sub">${esc(g.intro)}</p><div class="page__meta"><div class="meta-line">${EDGES.length} ${plural(EDGES.length, 'Грань', 'Грани', 'Граней')} <span class="dotsep">·</span> 3 категории</div></div></header>
      <div class="prose" style="max-width:74ch"><p class="lead">Грань — это не заклинание и не суперсила. Это способ, которым обычный человек делает невозможное: находит нужное оружие, чувствует чужую природу, отгоняет то, что сильнее его.</p></div>
      <div class="edge-filter" id="edge-filter">${cats.map(([id, n]) => `<button class="${id === 'all' ? 'is-active' : ''}" data-ecat="${id}">${n}</button>`).join('')}</div>
      <div class="edge-grid" id="edge-cards">${cards('all')}</div>
      <p class="bhint" style="margin-top:24px">Подробные правила — в <a href="#/rules/edge-use">разделе «Как работают Грани»</a>.</p>
    </article>`;
  }

  function edgePage(e) {
    const catName = { asset: 'Актив', ability: 'Способность', endowment: 'Дарование' };
    const list = EDGES.filter(x => x.category === e.category);
    const i = list.findIndex(x => x.id === e.id);
    const prev = i > 0 ? list[i - 1] : null, next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    const body = e.system ? (/^\s*</.test(e.system) ? e.system : `<p>${esc(e.system)}</p>`) : '';
    return `<article class="page">
      ${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Грани', href: '#/edges' }, { label: e.name }])}
      <header class="page__head"><div class="page__kicker">${catName[e.category] || 'Грань'} · Грань</div><h1>${esc(e.name)}</h1><p class="page__sub">${esc(e.summary || '')}</p><div class="page__meta"><div class="tags"><span class="tag">${catName[e.category] || ''}</span>${e.creed ? `<span class="tag">${esc(e.creed)}</span>` : ''}</div><div class="meta-line">${esc(e.en || '')} <span class="dotsep">·</span> ${esc(e.source || '')}</div></div></header>
      <div class="page__grid"><div class="prose">
        <div class="edge-detail"><div class="edge-detail__head"><h2>${esc(e.name)}</h2><div class="edge-detail__meta"><span>Пул: ${esc(e.pool || '—')}</span><span>${catName[e.category] || ''}</span></div></div>
        <div class="edge-detail__body">${body}${(e.perks || []).length ? `<h3>Перки</h3><ul class="perk-list">${e.perks.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}</div></div>
      </div><aside class="rail">${sourceBox(e)}${actionsBox('edges/' + e.id)}</aside></div>
      <div class="page__foot">
        ${prev ? `<a class="pager" href="#/edges/${prev.id}"><span>← Грань</span><b>${esc(prev.name)}</b></a>` : '<span class="pager pager--none"></span>'}
        ${next ? `<a class="pager pager--next" href="#/edges/${next.id}"><span>Грань →</span><b>${esc(next.name)}</b></a>` : '<span class="pager pager--none"></span>'}
      </div></article>`;
  }

  const threatDots = (n) => { n = clamp(Number(n) || 1, 1, 5); return '◆'.repeat(n) + '◇'.repeat(5 - n); };

  function bestiaryHub(g) {
    const types = ['all', ...Array.from(new Set(BEASTS.map(b => b.type || 'Иное')))];
    const cards = (f) => BEASTS.filter(b => f === 'all' || (b.type || 'Иное') === f).map(b => `<a class="beast-card" href="#/bestiary/${b.id}">
      <div class="beast-card__top"><span>${esc(b.type || 'Иное')}</span><span class="beast-card__threat">${threatDots(b.threat)}</span></div>
      <h3>${esc(b.name)}</h3><div class="beast-card__en">${esc(b.en || '')}</div>
      <p>${esc(b.summary || b.concept || '')}</p>
      <div class="beast-card__foot"><span>${b.threat ? 'опасность ' + b.threat + '/5' : esc(b.type || '')}</span><span>Открыть →</span></div>
    </a>`).join('');
    const threatCards = THREATS.map(t => `<a class="threat-card" href="#/bestiary/type/${t.id}">
      <span class="threat-card__icon">${threatIcon(t.icon)}</span>
      <h3>${esc(t.name)}</h3>
      <p>${esc(t.summary || '')}</p>
      <span class="threat-card__more">Открыть →</span>
    </a>`).join('');
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Бестиарий' }])}
      <header class="page__head"><div class="page__kicker">Кто живёт в ночи</div><h1>Бестиарий</h1><p class="page__sub">${esc(g.intro)}</p><div class="page__meta"><div class="meta-line">${BEASTS.length} ${plural(BEASTS.length, 'запись', 'записи', 'записей')} <span class="dotsep">·</span> ${THREATS.length} видов угроз</div></div></header>
      <div class="threat-block">
        <div class="sec-head"><div><div class="sec-head__kicker">Классификация</div><h2>Виды <em>угроз</em></h2></div><span class="sec-head__more" style="border:0">форматы, способности, слабости</span></div>
        <div class="threat-grid">${threatCards}</div>
      </div>
      <div class="bestiary-list-head"><h2>Записи бестиария</h2><span>${BEASTS.length} ${plural(BEASTS.length, 'запись', 'записи', 'записей')} · фильтр по типу</span></div>
      <div class="edge-filter" id="beast-filter">${types.map(t => `<button class="${t === 'all' ? 'is-active' : ''}" data-btype="${esc(t)}">${t === 'all' ? 'Все' : esc(t)}</button>`).join('')}</div>
      <div class="beast-grid" id="beast-cards">${cards('all')}</div>
    </article>`;
  }

  function threatPage(t) {
    const list = THREATS.filter(x => x.kind === t.kind);
    const i = list.findIndex(x => x.id === t.id);
    const prev = i > 0 ? list[i - 1] : null, next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    const ex = (t.examples || []).map(id => BEAST[id]).filter(Boolean);
    const body = t.body ? (/^\s*</.test(t.body) ? t.body : `<p>${esc(t.body)}</p>`) : '';
    const listHtml = (items, cls) => items && items.length ? `<ul class="threat-list ${cls || ''}">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
    const strong = t.strengths && t.strengths.length;
    const weak = t.weaknesses && t.weaknesses.length;
    const panels = (strong || weak) ? `<div class="threat-cols">${strong ? `<div class="threat-panel threat-panel--strong"><h3>${esc(t.strongTitle || 'Сильные стороны')}</h3>${listHtml(t.strengths)}</div>` : ''}${weak ? `<div class="threat-panel threat-panel--weak"><h3>${esc(t.weakTitle || 'Слабые стороны')}</h3>${listHtml(t.weaknesses)}</div>` : ''}</div>` : '';
    return `<article class="page">
      ${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Бестиарий', href: '#/bestiary' }, { label: 'Виды угроз', href: '#/bestiary' }, { label: t.name }])}
      <header class="page__head"><div class="page__kicker">${t.kind === 'system' ? 'Правила угроз' : 'Вид угрозы'}</div><h1>${esc(t.name)}</h1><p class="page__sub">${esc(t.lead || t.summary || '')}</p><div class="page__meta"><div class="tags"><span class="tag">${t.kind === 'system' ? 'Система' : 'Тип антагониста'}</span></div><div class="meta-line">${esc(t.en || '')}${t.source ? ' <span class="dotsep">·</span> ' + esc(t.source) : ''}</div></div></header>
      <div class="page__grid"><div class="prose">
        <p class="lead">${esc(t.summary || '')}</p>
        ${body}
        ${panels}
        ${t.tactics && t.tactics.length ? `<h2>Как охотиться</h2><ol class="threat-tactics">${t.tactics.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
        ${ex.length ? `<h2>Кто из бестиария</h2><div class="threat-examples">${ex.map(b => `<a class="threat-example" href="#/bestiary/${b.id}"><span>${esc(b.type || '')}</span><b>${esc(b.name)}</b><em>${esc(b.concept || '')}</em></a>`).join('')}</div>` : ''}
      </div>
      <aside class="rail">${sourceBox(t)}${actionsBox('bestiary/type/' + t.id)}<div class="rail__box"><div class="rail__title">Все виды</div><ul class="toc">${THREATS.map(x => `<li><a href="#/bestiary/type/${x.id}" class="${x.id === t.id ? 'is-active' : ''}">${esc(x.name)}</a></li>`).join('')}</ul></div></aside></div>
      <div class="page__foot">
        ${prev ? `<a class="pager" href="#/bestiary/type/${prev.id}"><span>←</span><b>${esc(prev.name)}</b></a>` : '<span class="pager pager--none"></span>'}
        ${next ? `<a class="pager pager--next" href="#/bestiary/type/${next.id}"><span>→</span><b>${esc(next.name)}</b></a>` : '<span class="pager pager--none"></span>'}
      </div></article>`;
  }

  function statBlock(b) {
    const s = b.stats; if (!s) return '';
    const diff = s.difficulty ? `<div class="statblock__head"><b>${esc(b.name)}</b><span>Сложность ${esc(s.difficulty)}</span></div>` : `<div class="statblock__head"><b>${esc(b.name)}</b><span>${esc(b.type || '')}</span></div>`;
    const pools = (s.pools || []).map(([n, v]) => `<div class="stat-row"><span>${esc(n)}</span><b>${esc(v)}</b></div>`).join('');
    const powers = (s.powers || []).length ? `<div class="stat-row"><span>Способности</span><b>${s.powers.map(esc).join('; ')}</b></div>` : '';
    const weak = (s.weaknesses || []).length ? `<div class="stat-row"><span>Слабости</span><b>${s.weaknesses.map(esc).join('; ')}</b></div>` : '';
    return `<div class="statblock">${diff}<div class="statblock__body">${pools}${powers}${weak}</div></div>`;
  }

  function beastPage(b) {
    const list = BEASTS.filter(x => (x.type || 'Иное') === (b.type || 'Иное'));
    const i = list.findIndex(x => x.id === b.id);
    const prev = i > 0 ? list[i - 1] : null, next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    const body = b.body ? (/^\s*</.test(b.body) ? b.body : `<p>${esc(b.body)}</p>`) : `<p>${esc(b.summary || '')}</p>`;
    return `<article class="page">
      ${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Бестиарий', href: '#/bestiary' }, { label: b.name }])}
      <header class="page__head"><div class="page__kicker">${esc(b.type || 'Иное')} · опасность ${clamp(Number(b.threat) || 1, 1, 5)}/5</div><h1>${esc(b.name)}</h1><p class="page__sub">${esc(b.concept || '')}</p><div class="page__meta"><div class="tags"><span class="tag">${esc(b.type || 'Иное')}</span>${BEAST_TYPE[b.type] ? `<a class="tag" href="#/bestiary/type/${BEAST_TYPE[b.type]}">Вид угрозы →</a>` : ''}</div><div class="meta-line">${esc(b.en || '')}${b.source ? ' <span class="dotsep">·</span> ' + esc(b.source) : ''}</div></div></header>
      <div class="page__grid"><div class="prose">${b.quote ? `<blockquote><p>${esc(b.quote)}</p></blockquote>` : ''}${statBlock(b)}${body}</div>
      <aside class="rail">${sourceBox(b)}${actionsBox('bestiary/' + b.id)}</aside></div>
      <div class="page__foot">
        ${prev ? `<a class="pager" href="#/bestiary/${prev.id}"><span>←</span><b>${esc(prev.name)}</b></a>` : '<span class="pager pager--none"></span>'}
        ${next ? `<a class="pager pager--next" href="#/bestiary/${next.id}"><span>→</span><b>${esc(next.name)}</b></a>` : '<span class="pager pager--none"></span>'}
      </div></article>`;
  }

  function libraryView(g) {
    const lines = ['all', ...Array.from(new Set(BOOKS.map(b => b.line || 'Прочее')))];
    const cards = BOOKS.map(b => `<div class="book" data-line="${esc(b.line || 'Прочее')}"><span class="book__spine"></span><div style="min-width:0"><h3>${esc(b.ru || b.en || '')}</h3><div class="book__en">${esc(b.en || '')}${b.year ? ' · ' + b.year : ''}${b.pages ? ' · ' + b.pages + ' стр.' : ''}</div><p>${esc(b.summary || '')}</p>${b.use ? `<p class="book__use">${esc(b.use)}</p>` : ''}<div class="book__meta">${(b.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></div></div>`).join('');
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Библиотека' }])}
      <header class="page__head"><div class="page__kicker">Книжная полка</div><h1>Библиотека</h1><p class="page__sub">${esc(g.intro)}</p><div class="page__meta"><div class="meta-line">${BOOKS.length} книг</div></div></header>
      <div class="edge-filter" id="book-filter">${lines.map(x => `<button class="${x === 'all' ? 'is-active' : ''}" data-bline="${esc(x)}">${x === 'all' ? 'Все' : esc(x)}</button>`).join('')}</div>
      <div class="books" id="book-cards">${cards}</div>
    </article>`;
  }

  function toolsHub(g) {
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Инструменты' }])}
      <header class="page__head"><div class="page__kicker">За столом</div><h1>Инструменты</h1><p class="page__sub">${esc(g.intro)}</p></header>
      <div class="hub">
        <a class="hub__card" href="#/tools/sheet"><h3>Лист охотника</h3><p>Ромбы Атрибутов и Навыков, Кредо, Драйв, здоровье, Кости Отчаяния и броски в один клик.</p><span class="tag">лист</span></a>
        <a class="hub__card" href="#/tools/dice"><h3>Кости</h3><p>Пул d10, успехи на 6+, критическая пара, Кости Отчаяния и Сложность числом успехов.</p><span class="tag">d10</span></a>
        <a class="hub__card" href="#/tools/npc"><h3>Генератор охотника</h3><p>Кредо, Драйв, концепция и крючок для НПС за один клик.</p><span class="tag">быстро</span></a>
        <a class="hub__card" href="#/rules/dice"><h3>Шпаргалка</h3><p>Как собрать пул, что считается успехом и когда бросать не нужно.</p><span class="tag">правила</span></a>
        <a class="hub__card" href="#/edges"><h3>Каталог Граней</h3><p>Все Активы, Способности и Дарования с пулами и перками.</p><span class="tag">грани</span></a>
        <a class="hub__card" href="#/library"><h3>Библиотека</h3><p>Книги H5 и классики: что читать про Кредо, правила и монстров.</p><span class="tag">книги</span></a>
      </div>
    </article>`;
  }

  /* ---------------- кости (H5) ---------------- */
  function rollHtml(pool, diff, despair, tenAgain) {
    const normal = [];
    const desp = [];
    let successes = 0, tens = 0, ones = 0;
    for (let i = 0; i < pool; i++) { const v = 1 + Math.floor(Math.random() * 10); normal.push(v); if (v >= 6) successes++; if (v === 10) tens++; }
    for (let i = 0; i < despair; i++) { const v = 1 + Math.floor(Math.random() * 10); desp.push(v); if (v >= 6) successes++; if (v === 10) tens++; if (v === 1) ones++; }
    const crit = Math.floor(tens / 2);
    const total = successes + crit * 2;
    const margin = total - diff;
    const cls = margin >= 0 ? 'var(--paper)' : 'var(--ash)';
    const verdict = margin >= 0 ? (crit > 0 ? 'Критическая победа' : 'Победа') : 'Провал';
    return `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px">${normal.map(v => `<span style="display:grid;place-items:center;width:32px;height:38px;border:1px solid ${v >= 6 ? 'var(--ember)' : 'var(--line)'};font-family:var(--mono);font-size:13px;color:${v >= 6 ? 'var(--paper)' : 'var(--faint)'};background:${v >= 6 ? 'rgba(240,181,105,.1)' : 'transparent'}">${v}</span>`).join('')}${desp.map(v => `<span style="display:grid;place-items:center;width:32px;height:38px;border:1px dashed ${v === 1 ? 'var(--blood)' : 'var(--line-2)'};font-family:var(--mono);font-size:13px;color:${v === 1 ? 'var(--blood)' : 'var(--dim)'}">${v}</span>`).join('')}</div>
      <div style="font-family:var(--serif);font-size:1.6rem;color:${cls};text-transform:uppercase">${verdict}</div>
      <div class="kv-mono" style="margin-top:4px">${total} ${plural(total, 'успех', 'успеха', 'успехов')} · сложность ${diff} · запас ${margin >= 0 ? '+' + margin : margin}${crit ? ' · критик +' + crit * 2 : ''}${ones ? ' · Перенапряжение!' : ''}</div>`;
  }

  function diceModal() {
    openModal(`<h2>Кости охотника</h2><p class="muted">Успех на 6+. Сложность — число нужных успехов. Каждая пара десяток добавляет 2 успеха. «1» на Кости Отчаяния — Перенапряжение.</p>
      <div class="field-row"><div class="field"><label>Пул</label><input id="d-pool" type="number" min="1" max="30" value="6"></div><div class="field"><label>Сложность</label><input id="d-diff" type="number" min="1" max="10" value="2"></div></div>
      <div class="field-row"><div class="field"><label>Кости Отчаяния</label><input id="d-despair" type="number" min="0" max="5" value="0"></div><div class="field"><label>Модификатор</label><input id="d-mod" type="number" min="-5" max="5" value="0"></div></div>
      <button class="btn btn--blood" data-roll>Бросить</button><div id="dice-out" style="margin-top:20px"></div>`);
  }
  function rollDiceModal() {
    const pool = clamp((parseInt($('#d-pool').value, 10) || 1) + (parseInt($('#d-mod').value, 10) || 0), 1, 30);
    const diff = clamp(parseInt($('#d-diff').value, 10) || 2, 1, 10);
    const desp = clamp(parseInt($('#d-despair').value, 10) || 0, 0, 5);
    $('#dice-out').innerHTML = rollHtml(pool, diff, desp);
  }

  function npcModal() {
    const creeds = byGroup('creeds');
    const c = creeds.length ? creeds[Math.floor(Math.random() * creeds.length)] : { title: 'Охотник' };
    const d = DRIVES[Math.floor(Math.random() * DRIVES.length)];
    const first = ['Аня', 'Марк', 'Джо', 'Лена', 'Томас', 'Рита', 'Сэм', 'Кира', 'Нил', 'Ольга'];
    const last = ['Кейн', 'Уайт', 'Ортис', 'Грин', 'Блэк', 'Мор', 'Лоу', 'Дельгадо', 'Рид', 'Ферро'];
    const jobs = ['медсестра', 'таксист', 'журналист', 'охранник', 'студентка', 'электрик', 'бармен', 'учитель', 'детектив', 'курьер'];
    const hooks = ['Видел, как монстр заходит в квартиру соседа, и теперь сосед не выходит.', 'Ведёт канал, где публикует записи охот, не понимая, что их смотрят.', 'Ищет человека, который убил его брата — и это не человек.', 'Нашёл на чердаке дневник охотника 1990-х и не может перестать читать.', 'Работает в морге и иногда слышит, как тела говорят.', 'Должен денег организации, которая знает о монстрах больше него.'];
    openModal(`<h2>${esc(first[Math.floor(Math.random() * first.length)])} ${esc(last[Math.floor(Math.random() * last.length)])}</h2><p class="muted">${esc(c.title)} · ${esc(d.name)} · ${esc(jobs[Math.floor(Math.random() * jobs.length)])}</p>
      <div class="facts"><div><dt>Кредо</dt><dd>${esc(c.title)}</dd></div><div><dt>Драйв</dt><dd>${esc(d.name)}</dd></div><div><dt>Опасность</dt><dd>${1 + Math.floor(Math.random() * 3)}</dd></div></div>
      <p style="margin-top:18px;font-family:var(--serif);font-size:1.2rem;font-style:italic;color:var(--paper)">${esc(hooks[Math.floor(Math.random() * hooks.length)])}</p>
      <button class="btn btn--blood" data-npc style="margin-top:16px">Ещё</button>`);
  }

  /* ---------------- поиск ---------------- */
  let SEARCH = [];
  function buildSearch() {
    SEARCH = [];
    PAGES.forEach(p => SEARCH.push({ type: GROUP[p.group]?.title || 'Статья', title: p.title, text: strip(p.lead + ' ' + (p.body || '')).slice(0, 5000), route: p.id }));
    EDGES.forEach(e => SEARCH.push({ type: 'Грань', title: e.name, text: strip((e.summary || '') + ' ' + (e.system || '') + ' ' + (e.perks || []).join(' ')), route: 'edges/' + e.id }));
    BEASTS.forEach(b => SEARCH.push({ type: 'Бестиарий', title: b.name, text: strip((b.concept || '') + ' ' + (b.summary || '') + ' ' + (b.body || '')), route: 'bestiary/' + b.id }));
    THREATS.forEach(t => SEARCH.push({ type: 'Угроза', title: t.name, text: strip((t.summary || '') + ' ' + (t.lead || '') + ' ' + (t.body || '') + ' ' + (t.strengths || []).join(' ') + ' ' + (t.weaknesses || []).join(' ')), route: 'bestiary/type/' + t.id }));
    BOOKS.forEach(b => SEARCH.push({ type: 'Книга', title: b.ru || b.en || '', text: strip((b.en || '') + ' ' + (b.summary || '') + ' ' + (b.use || '')), route: 'library' }));
    SEARCH.push({ type: 'Инструмент', title: 'Лист охотника', text: 'лист персонажа охотник атрибуты навыки кредо драйв здоровье броски', route: 'tools/sheet' });
    SEARCH.push({ type: 'Инструмент', title: 'Кости', text: 'броски d10 успехи сложность кости отчаяния', route: 'tools/dice' });
  }
  function score(item, q) {
    const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s-]/g, ' ').split(/\s+/).filter(Boolean).map(w => (w.length > 4 ? w.slice(0, 4) : w)).join(' ');
    const t = norm(item.title), x = norm(item.text), nq = norm(q);
    let s = 0;
    if (t === nq) s += 100; else if (t.startsWith(nq)) s += 60; else if (t.includes(nq)) s += 35;
    if (x.includes(nq)) s += 10;
    const w = item.type === 'Книга' ? 0 : item.type === 'Грань' ? 35 : item.type === 'Бестиарий' ? 20 : 25;
    return s + w;
  }
  let searchSel = 0, searchItems = [];
  function runSearch(q) {
    const box = $('#search-results'), hint = $('#search-hint');
    q = q.trim().toLowerCase();
    if (q.length < 2) { box.innerHTML = ''; hint.innerHTML = 'Начните печатать. <span>↑ ↓</span> — выбор, <span>Enter</span> — открыть.'; hint.hidden = false; return; }
    hint.hidden = true;
    searchItems = SEARCH.map(it => ({ ...it, score: score(it, q) })).filter(it => it.score > 0).sort((a, b) => b.score - a.score).slice(0, 24);
    searchSel = 0;
    box.innerHTML = searchItems.length ? searchItems.map((it, i) => `<a class="result ${i === 0 ? 'is-sel' : ''}" href="#/${it.route}" data-i="${i}"><div class="result__top"><span class="result__type">${esc(it.type)}</span><span class="result__title">${esc(it.title)}</span></div><div class="result__text">${esc(it.text.slice(0, 150))}</div></a>`).join('') : `<div class="search__empty">Ничего не найдено. Попробуйте «Кредо», «Грань» или «Опасность».</div>`;
  }
  function openSearch() { $('#search').hidden = false; document.body.classList.add('is-locked'); $('#search-input').value = ''; runSearch(''); setTimeout(() => $('#search-input').focus(), 30); }
  function closeSearch() { $('#search').hidden = true; document.body.classList.remove('is-locked'); }

  function openModal(html) { $('#modal-body').innerHTML = html; $('#modal').hidden = false; document.body.classList.add('is-locked'); }
  function closeModal() { $('#modal').hidden = true; document.body.classList.remove('is-locked'); }
  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2400); }

  /* ---------------- после рендера ---------------- */
  function afterRender(route) {
    const links = $$('[data-toc]');
    if (links.length) {
      const obs = new IntersectionObserver((entries) => entries.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('data-toc') === en.target.id)); }), { rootMargin: '-90px 0px -70% 0px' });
      links.forEach(a => { const el = document.getElementById(a.getAttribute('data-toc')); if (el) obs.observe(el); });
    }
    const ef = $('#edge-filter');
    if (ef && $('#edge-cards')) {
      ef.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ecat]'); if (!b) return;
        ef.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
        const f = b.dataset.ecat;
        const catName = { asset: 'Актив', ability: 'Способность', endowment: 'Дарование' };
        $('#edge-cards').innerHTML = EDGES.filter(x => f === 'all' || x.category === f).map(x => `<a class="edge-card" href="#/edges/${x.id}"><div class="edge-card__cat">${catName[x.category] || 'Грань'}</div><h3>${esc(x.name)}</h3><div class="edge-card__en">${esc(x.en || '')}</div><p>${esc(x.summary || '')}</p><div class="edge-card__pool">${esc(x.pool || '')}</div></a>`).join('');
      });
    }
    const bf = $('#beast-filter');
    if (bf && $('#beast-cards')) {
      bf.addEventListener('click', (e) => {
        const b = e.target.closest('[data-btype]'); if (!b) return;
        bf.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
        const f = b.dataset.btype;
        $('#beast-cards').innerHTML = BEASTS.filter(x => f === 'all' || (x.type || 'Иное') === f).map(x => `<a class="beast-card" href="#/bestiary/${x.id}"><div class="beast-card__top"><span>${esc(x.type || 'Иное')}</span><span class="beast-card__threat">${threatDots(x.threat)}</span></div><h3>${esc(x.name)}</h3><div class="beast-card__en">${esc(x.en || '')}</div><p>${esc(x.summary || x.concept || '')}</p><div class="beast-card__foot"><span>${x.threat ? 'опасность ' + x.threat + '/5' : esc(x.type || '')}</span><span>Открыть →</span></div></a>`).join('');
      });
    }
    const bkf = $('#book-filter');
    if (bkf && $('#book-cards')) {
      bkf.addEventListener('click', (e) => {
        const b = e.target.closest('[data-bline]'); if (!b) return;
        bkf.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
        const f = b.dataset.bline;
        $$('#book-cards .book').forEach(el => { el.style.display = (f === 'all' || el.dataset.line === f) ? '' : 'none'; });
      });
    }
    window.scrollTo(0, 0);
    markNav(route, (PAGE[route] || {}).group || route.split('/')[0]);
  }

  /* ---------------- роутер ---------------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query || ''), raw: path };
  }
  function routeTitle(route) {
    const base = 'ОХОТА — Hunter: The Reckoning';
    if (!route) return base;
    if (PAGE[route]) return PAGE[route].title + ' — ' + base;
    if (route.indexOf('edges/') === 0) { const e = EDGE[route.slice(6)]; if (e) return e.name + ' — ' + base; }
    if (route.indexOf('bestiary/') === 0) { const b = BEAST[route.slice(9)]; if (b) return b.name + ' — ' + base; }
    if (route.indexOf('bestiary/type/') === 0) { const t = THREATS.find(x => x.id === route.slice(14)); if (t) return t.name + ' — ' + base; }
    if (GROUP[route]) return (GROUP[route].hubTitle || GROUP[route].title) + ' — ' + base;
    if (route === 'edges') return 'Грани — ' + base;
    if (route === 'tools/sheet') return 'Лист охотника — ' + base;
    if (route === 'tools/npc') return 'Генератор охотника — ' + base;
    if (route === 'tools/dice') return 'Кости — ' + base;
    return base;
  }

  function render() {
    const { parts, params } = parseHash();
    const view = $('#view');
    let html = '', route = '';
    if (!parts.length) { html = home(); route = ''; }
    else if (parts[0] === 'about') { route = 'about'; html = PAGE['about'] ? pageView(PAGE['about']) : notFound(); }
    else if (parts[0] === 'edges') {
      if (parts[1] && parts[1] !== 'overview') { const e = EDGE[parts[1]]; route = 'edges/' + parts[1]; html = e ? edgePage(e) : notFound(); }
      else if (parts[1] === 'overview' && PAGE['edges/overview']) { route = 'edges/overview'; html = pageView(PAGE['edges/overview']); }
      else { route = 'edges'; html = edgesHub(GROUP.edges); }
    }
    else if (parts[0] === 'bestiary' && parts[1] === 'type' && parts[2]) {
      const t = THREATS.find(x => x.id === parts[2]);
      route = 'bestiary/type/' + parts[2];
      html = t ? threatPage(t) : notFound();
    }
    else if (parts[0] === 'bestiary' && parts[1]) { const b = BEAST[parts[1]]; route = 'bestiary/' + parts[1]; html = b ? beastPage(b) : notFound(); }
    else if (parts[0] === 'bestiary') { route = 'bestiary'; html = bestiaryHub(GROUP.bestiary); }
    else if (parts[0] === 'library') { route = 'library'; html = libraryView(GROUP.library); }
    else if (parts[0] === 'tools') {
      route = parts[1] ? 'tools/' + parts[1] : 'tools';
      if (parts[1] === 'sheet') html = window.HTR_SHEET ? window.HTR_SHEET.render() : toolsHub(GROUP.tools);
      else if (parts[1] === 'npc') html = npcPage();
      else if (parts[1] === 'dice') html = dicePage();
      else html = toolsHub(GROUP.tools);
    }
    else {
      const id = parts.join('/');
      const p = PAGE[id];
      if (p) { route = id; html = pageView(p); }
      else if (parts.length === 1 && GROUP[parts[0]]) { route = parts[0]; html = hubView(parts[0]); }
      else html = notFound();
    }
    view.innerHTML = html;
    document.title = routeTitle(route);
    afterRender(route);
    document.body.classList.remove('menu-open');
    if (route === 'tools/sheet' && window.HTR_SHEET) window.HTR_SHEET.mount();
    if (route === 'tools/npc') mountNpcPage();
    if (route === 'tools/dice') mountDicePage();
  }
  function notFound() { return `<article class="page"><div class="page__head"><div class="page__kicker">Ошибка 404</div><h1>Досье не найдено</h1><p class="page__sub">Такого раздела нет — или он ещё не написан. Вернитесь к началу или воспользуйтесь поиском.</p></div><div class="hero__actions"><a class="btn btn--blood" href="#/">На главную</a><button class="btn btn--ghost" data-action="search">Поиск</button></div></article>`; }

  /* ---------------- страницы инструментов ---------------- */
  function dicePage() {
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Инструменты', href: '#/tools' }, { label: 'Кости' }])}
      <header class="page__head"><div class="page__kicker">d10 · успех на 6+</div><h1>Кости</h1><p class="page__sub">Пул, сложность числом успехов, критическая пара и Кости Отчаяния.</p></header>
      <div style="max-width:540px"><div class="field-row"><div class="field"><label>Пул</label><input id="dp" type="number" min="1" max="30" value="6"></div><div class="field"><label>Сложность</label><input id="dd" type="number" min="1" max="10" value="2"></div></div>
      <div class="field-row"><div class="field"><label>Кости Отчаяния</label><input id="ddesp" type="number" min="0" max="5" value="0"></div><div class="field"><label>Модификатор</label><input id="dmod" type="number" min="-5" max="5" value="0"></div></div>
      <button class="btn btn--blood" id="roll-btn">Бросить</button><div id="dice-out" style="margin-top:22px"></div></div></article>`;
  }
  function mountDicePage() {
    const btn = $('#roll-btn'); if (!btn) return;
    btn.addEventListener('click', () => {
      const pool = clamp((parseInt($('#dp').value, 10) || 1) + (parseInt($('#dmod').value, 10) || 0), 1, 30);
      const diff = clamp(parseInt($('#dd').value, 10) || 2, 1, 10);
      const desp = clamp(parseInt($('#ddesp').value, 10) || 0, 0, 5);
      $('#dice-out').innerHTML = rollHtml(pool, diff, desp);
    });
  }

  function npcPage() {
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Инструменты', href: '#/tools' }, { label: 'Генератор' }])}
      <header class="page__head"><div class="page__kicker">Быстрый вход</div><h1>Генератор охотника</h1><p class="page__sub">Кредо, Драйв и крючок для НПС, который появится в вашей истории через минуту.</p></header>
      <div id="npc-host"></div><button class="btn btn--blood" id="npc-roll" style="margin-top:22px">Сгенерировать</button></article>`;
  }
  function mountNpcPage() {
    const host = $('#npc-host');
    const make = () => {
      const creeds = byGroup('creeds');
      const c = creeds[Math.floor(Math.random() * Math.max(1, creeds.length))] || { title: 'Охотник', id: '' };
      const d = DRIVES[Math.floor(Math.random() * DRIVES.length)];
      const first = ['Аня', 'Марк', 'Джо', 'Лена', 'Томас', 'Рита', 'Сэм', 'Кира', 'Нил', 'Ольга'];
      const last = ['Кейн', 'Уайт', 'Ортис', 'Грин', 'Блэк', 'Мор', 'Лоу', 'Дельгадо', 'Рид', 'Ферро'];
      const jobs = ['медсестра', 'таксист', 'журналист', 'охранник', 'студентка', 'электрик', 'бармен', 'учитель', 'детектив', 'курьер'];
      const hooks = ['Видел, как монстр заходит в квартиру соседа, и теперь сосед не выходит.', 'Ведёт канал, где публикует записи охот, не понимая, что их смотрят.', 'Ищет человека, который убил его брата — и это не человек.', 'Нашёл на чердаке дневник охотника 1990-х и не может перестать читать.', 'Работает в морге и иногда слышит, как тела говорят.', 'Должен денег организации, которая знает о монстрах больше него.'];
      const name = first[Math.floor(Math.random() * first.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const hook = hooks[Math.floor(Math.random() * hooks.length)];
      host.innerHTML = `<div class="prose" style="max-width:660px"><div class="page__kicker">${esc(c.title)} · ${esc(d.name)}</div><h2 style="border:0;padding:0;margin:0 0 10px;font-size:2.2rem;text-transform:uppercase">${esc(name)}</h2><div class="facts"><div><dt>Профессия</dt><dd>${esc(job)}</dd></div><div><dt>Кредо</dt><dd>${esc(c.title)}</dd></div><div><dt>Драйв</dt><dd>${esc(d.name)}</dd></div><div><dt>Опасность</dt><dd>${1 + Math.floor(Math.random() * 3)}</dd></div></div><p style="margin-top:18px;font-family:var(--serif);font-size:1.25rem;font-style:italic;color:var(--paper)">${esc(hook)}</p></div>`;
    };
    make(); $('#npc-roll').addEventListener('click', make);
  }

  /* ---------------- события ---------------- */
  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a === 'menu') { document.body.classList.toggle('menu-open'); act.setAttribute('aria-expanded', document.body.classList.contains('menu-open')); }
      if (a === 'close-menu') document.body.classList.remove('menu-open');
      if (a === 'search') openSearch();
      if (a === 'dice') diceModal();
      if (a === 'print') window.print();
      if (a === 'close-modal') closeModal();
      return;
    }
    const tg = e.target.closest('[data-toggle]'); if (tg) { e.preventDefault(); toggleGroup(tg.dataset.toggle); return; }
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      const r = fav.dataset.fav;
      if (state.favs.includes(r)) state.favs = state.favs.filter(x => x !== r); else state.favs.push(r);
      store.set(LS_FAV, state.favs); fav.classList.toggle('is-on');
      fav.innerHTML = `${ICON.heart ? `<svg viewBox="0 0 24 24">${ICON.heart}</svg>` : ''} ${state.favs.includes(r) ? 'В избранном' : 'В избранное'}`;
      toast(state.favs.includes(r) ? 'Добавлено в избранное' : 'Убрано из избранного'); return;
    }
    if (e.target.closest('[data-copy]')) {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('Ссылка скопирована')).catch(() => toast('Не удалось скопировать')); else toast(location.href);
      return;
    }
    if (e.target.closest('[data-print]')) { window.print(); return; }
    if (e.target.closest('[data-roll]')) { rollDiceModal(); return; }
    if (e.target.closest('[data-npc]')) { npcModal(); return; }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
    if (e.key === 'Escape') { if (!$('#search').hidden) closeSearch(); else if (!$('#modal').hidden) closeModal(); else document.body.classList.remove('menu-open'); return; }
    if (!$('#search').hidden) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!searchItems.length) return;
        searchSel = clamp(searchSel + (e.key === 'ArrowDown' ? 1 : -1), 0, searchItems.length - 1);
        $$('#search-results .result').forEach((el, i) => el.classList.toggle('is-sel', i === searchSel));
        $$('#search-results .result')[searchSel]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && searchItems[searchSel]) { location.hash = '#/' + searchItems[searchSel].route; closeSearch(); }
    }
  });
  $('#search-input').addEventListener('input', (e) => runSearch(e.target.value));
  $('#search').addEventListener('click', (e) => { if (e.target.id === 'search') closeSearch(); });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
  window.addEventListener('scroll', () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); $('.progress i').style.width = (p * 100) + '%'; }, { passive: true });
  window.addEventListener('hashchange', render);

  buildNav(); buildSearch(); render();
})();
