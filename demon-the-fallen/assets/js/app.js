/* ============================================================
   ПЕПЕЛ НЕБЕС — ядро приложения: роутер, навигация, страницы,
   поиск, бестиарий, библиотека, кости, генератор НПС.
   ============================================================ */
(function () {
  'use strict';

  const DTF = (window.DTF = window.DTF || {});
  const PAGES = DTF.pages || [];
  const LORES = DTF.lores || [];
  const BEASTS = DTF.bestiary || [];
  const BOOKS = DTF.books || [];

  /* ---------------- утилиты ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const strip = (html) => String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const slug = (s) => String(s).toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const plural = (n, one, few, many) => { const m = n % 100, d = n % 10; if (m > 10 && m < 20) return many; if (d > 1 && d < 5) return few; if (d === 1) return one; return many; };
  const readingTime = (html) => Math.max(2, Math.round(strip(html).split(/\s+/).length / 175));

  /* ---------------- конфигурация ---------------- */
  const GROUPS = [
    { id: 'start', num: '01', title: 'Начало', hubTitle: 'Начать здесь', intro: 'Что это за игра, во что верят падшие и как сесть за стол. Короткий путь для того, кто впервые открыл книгу.' },
    { id: 'history', num: '02', title: 'История', hubTitle: 'История', intro: 'От первого дня Творения до трещин в Бездне: тысячелетняя война, приговор и возвращение на Землю.' },
    { id: 'cosmology', num: '03', title: 'Космология', hubTitle: 'Космология', intro: 'Творец, ангелы, Вера и Мука. Устройство мира, каким его помнят те, кто видел его начало.' },
    { id: 'houses', num: '04', title: 'Дома', hubTitle: 'Семь Домов', intro: 'Семь ангельских Домов, семь проклятий. Каждый Дом был создан для одной задачи — и каждый по-своему предал её.' },
    { id: 'factions', num: '05', title: 'Фракции', hubTitle: 'Фракции', intro: 'Пять ответов на вопрос, что делать теперь, когда Небеса молчат, а Бездна больше не держит.' },
    { id: 'lores', num: '06', title: 'Знания', hubTitle: 'Знания', intro: 'Двадцать три Знания — собранные команды Творения. Каждое открывает пять сил и столько же способов ими испортить всё.' },
    { id: 'rules', num: '07', title: 'Правила', hubTitle: 'Правила', intro: 'Система d10, черты, Вера, Мука, бой и одержимость. Всё, что нужно, чтобы бросить кости и не соврать.' },
    { id: 'character', num: '08', title: 'Персонаж', hubTitle: 'Создание персонажа', intro: 'Пошаговое создание падшего: от концепции и Дома до последней точки свободных очков.' },
    { id: 'bestiary', num: '09', title: 'Бестиарий', hubTitle: 'Бестиарий', intro: 'Монстры, охотники, Земные и смертные, которые слишком много видели. Все, кто может испортить вечер падшему.' },
    { id: 'world', num: '10', title: 'Мир', hubTitle: 'Мир падших', intro: 'Лос-Анджелес, Энох, Пустоши и конец времён. География войны, которая продолжается.' },
    { id: 'library', num: '11', title: 'Библиотека', hubTitle: 'Библиотека', intro: 'Каталог книг линейки: что в них лежит и когда к ним тянуться за столом.' },
    { id: 'tools', num: '12', title: 'Инструменты', hubTitle: 'Инструменты', intro: 'Интерактивный лист персонажа, конструктор, генераторы и кости. Всё работает офлайн, прямо в браузере.' },
  ];
  const GROUP = Object.fromEntries(GROUPS.map(g => [g.id, g]));

  const HOUSE_ORDER = ['devils', 'fiends', 'scourges', 'defilers', 'devourers', 'malefactors', 'slayers'];
  const HOUSE = {
    devils: { num: 'I', ru: 'Дьяволы', en: 'Devils', trueName: 'Namaru', order: 1, tint: 'rgba(206,26,30,.12)' },
    fiends: { num: 'II', ru: 'Изверги', en: 'Fiends', trueName: 'Neberu', order: 2, tint: 'rgba(131,127,120,.12)' },
    scourges: { num: 'III', ru: 'Кнуты', en: 'Scourges', trueName: 'Asharu', order: 3, tint: 'rgba(77,82,75,.18)' },
    defilers: { num: 'IV', ru: 'Осквернители', en: 'Defilers', trueName: 'Lammasu', order: 4, tint: 'rgba(101,6,14,.18)' },
    devourers: { num: 'V', ru: 'Пожиратели', en: 'Devourers', trueName: 'Rabisu', order: 5, tint: 'rgba(34,51,48,.28)' },
    malefactors: { num: 'VI', ru: 'Малефакторы', en: 'Malefactors', trueName: 'Annunaki', order: 6, tint: 'rgba(77,82,75,.14)' },
    slayers: { num: 'VII', ru: 'Убийцы', en: 'Slayers', trueName: 'Halaku', order: 7, tint: 'rgba(101,6,14,.24)' },
  };
  const SIGILS = {
    devils: '<circle cx="20" cy="20" r="6"/><path d="M20 3v8M20 29v8M3 20h8M29 20h8M8 8l5.5 5.5M26.5 26.5 32 32M32 8l-5.5 5.5M13.5 26.5 8 32"/>',
    fiends: '<path d="M20 3 23 16 35 20 23 24 20 37 17 24 5 20 17 16Z"/><circle cx="20" cy="20" r="3"/><path d="M4 4l5 5M36 4l-5 5M4 36l5-5M36 36l-5-5"/>',
    scourges: '<path d="M4 12h16c5 0 5 7 0 7H9c-4 0-4 6 0 6h18"/><path d="M6 7h12c7 0 7 9 0 9"/><path d="M10 31h14c6 0 6 5 0 5H14"/>',
    defilers: '<path d="M25 4a16 16 0 1 0 0 32 13 13 0 0 1 0-32Z"/><path d="M4 24c5-4 8 4 13 0s8 4 13 0 8 4 13 0" transform="translate(-6 4) scale(.8)"/>',
    devourers: '<path d="M7 6c4 7 4 13 0 20M16 4c4 9 4 17 0 26M25 6c4 7 4 13 0 20M34 9c3 5 3 10 0 15"/>',
    malefactors: '<path d="M20 4v14M12 18h16l-3 6H15Z"/><path d="m8 34 12-10 12 10"/><path d="M4 36h32"/>',
    slayers: '<path d="M20 4a16 16 0 1 0 0 32 16 16 0 0 0 0-32Z"/><path d="M20 8v24M14 14c-3 4-3 8 0 12M26 14c3 4 3 8 0 12"/>',
  };
  const sigil = (id, cls) => `<svg class="${cls || ''}" viewBox="0 0 40 40" aria-hidden="true">${SIGILS[id] || SIGILS.fiends}</svg>`;

  const ICON = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    star: '<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7Z"/>',
    book: '<path d="M4 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4z"/><path d="M20 4h-2a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h3z"/>',
    scroll: '<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    dice: '<path d="m12 2 9 5v10l-9 5-9-5V7z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="13" r="1"/><circle cx="9" cy="15" r="1"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    heart: '<path d="M20 8.5a5 5 0 0 0-8-4 5 5 0 0 0-8 4c0 6 8 11 8 11s8-5 8-11Z"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2"/><path d="M16 4.5a3 3 0 0 1 0 7M17 15a6 6 0 0 1 4 6"/>',
    shuffle: '<path d="M3 6h4l10 12h4M17 6h4v4M3 18h4l3-3.5M14 9l3-3h5"/>',
    save: '<path d="M4 4h13l3 3v13H4z"/><path d="M8 4v6h8V4M8 20v-7h8v7"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ICON.star}</svg>`;

  /* ---------------- состояние ---------------- */
  const LS_FAV = 'dtf:favs';
  const LS_CHAR = 'dtf:characters';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* noop */ } },
  };
  const state = {
    favs: store.get(LS_FAV, []),
    open: new Set(),
    lastRoute: '',
  };

  /* ---------------- данные: страницы ---------------- */
  const PAGE = Object.fromEntries(PAGES.map(p => [p.id, p]));
  const byGroup = (g) => PAGES.filter(p => p.group === g).sort((a, b) => (a.order || 999) - (b.order || 999) || a.title.localeCompare(b.title, 'ru'));
  const housePage = (slugId) => PAGE['houses/' + slugId] || {};
  const loreByHouse = (h) => LORES.filter(l => l.house === h);
  const beastRoute = (b) => '#/bestiary/' + b.id;

  /* ---------------- навигация ---------------- */
  function buildNav() {
    const nav = $('#nav');
    const html = [];
    html.push(`<a class="nav__home" href="#/" data-nav="home">${icon('book')}<span>Главная</span></a>`);
    for (const g of GROUPS) {
      const kids = byGroup(g.id);
      const open = state.open.has(g.id);
      const caret = kids.length ? `<button class="nav__caret" data-toggle="${g.id}" aria-label="Развернуть раздел ${esc(g.title)}" aria-expanded="${open}">${icon('chevron')}</button>` : '';
      html.push(`<div class="nav__group ${open ? 'is-open' : ''}" data-group="${g.id}">
        <a class="nav__head" href="#/${g.id}"><span class="nav__num">${g.num}</span><span class="nav__label">${esc(g.title)}</span>${caret}</a>
        <div class="nav__list">${kids.map(k => `<a class="nav__link" href="#/${k.id}" data-page="${k.id}">${esc(k.nav || k.title)}</a>`).join('')}</div>
      </div>`);
    }
    html.push(`<div class="nav__group" data-group="about"><a class="nav__head" href="#/about"><span class="nav__num">—</span><span class="nav__label">О проекте</span></a><div class="nav__list"></div></div>`);
    nav.innerHTML = html.join('');
  }

  function markNav(route, group) {
    $$('.nav__head').forEach(a => a.classList.remove('is-current'));
    $$('.nav__group').forEach(g => g.classList.remove('is-current'));
    $$('.nav__link').forEach(a => a.classList.remove('is-active'));
    $('.nav__home')?.classList.remove('is-active');
    if (!route) { $('.nav__home')?.classList.add('is-active'); return; }
    if (group) {
      const g = $(`.nav__group[data-group="${group}"]`);
      if (g) {
        g.classList.add('is-current');
        if (!state.open.has(group)) { state.open.add(group); g.classList.add('is-open'); }
      }
    }
    const link = $(`.nav__link[data-page="${route}"]`);
    if (link) link.classList.add('is-active');
  }

  function toggleGroup(id) {
    if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
    const g = $(`.nav__group[data-group="${id}"]`);
    if (g) { g.classList.toggle('is-open'); g.querySelector('.nav__caret')?.setAttribute('aria-expanded', g.classList.contains('is-open')); }
  }

  /* ---------------- общие блоки ---------------- */
  function crumbs(items) {
    return `<nav class="crumbs" aria-label="Хлебные крошки">${items.map((it, i) => {
      const sep = i ? '<span>/</span>' : '';
      return sep + (it.href ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`);
    }).join('')}</nav>`;
  }

  function pageHead(p) {
    const tags = (p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const meta = [tags ? `<div class="tags">${tags}</div>` : '', `<div class="meta-line">${p.source ? esc(p.source) + ' <span class="dotsep">·</span> ' : ''}${readingTime(p.body)} мин чтения</div>`].join('');
    return `<header class="page__head">
      ${p.kicker ? `<div class="page__kicker">${esc(p.kicker)}</div>` : ''}
      <h1>${esc(p.title)}</h1>
      ${p.subtitle ? `<p class="page__sub">${esc(p.subtitle)}</p>` : ''}
      <div class="page__meta">${meta}</div>
    </header>`;
  }

  function factsBox(p) {
    let facts = p.facts;
    if (!facts && p.group === 'houses') {
      const h = HOUSE[p.id.split('/')[1]];
      if (h) facts = [['Истинное имя', h.trueName], ['Дом', h.ru + ' (' + h.en + ')']];
    }
    if (!facts || !facts.length) return '';
    return `<div class="rail__box"><div class="rail__title">Кратко</div><dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`;
  }

  function sourceBox(p) {
    if (!p.source) return '';
    return `<div class="rail__box"><div class="rail__title">Источник</div><p class="rail__source">${esc(p.source)}</p></div>`;
  }

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

  function neighbor(p) {
    const list = byGroup(p.group);
    const i = list.findIndex(x => x.id === p.id);
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
  }

  function relatedPages(p, n) {
    const list = byGroup(p.group).filter(x => x.id !== p.id);
    return list.slice(0, n || 3);
  }

  /* ---------------- герой ---------------- */
  function hero() {
    const houses = byGroup('houses').length || 7;
    const factions = byGroup('factions').length || 5;
    const loreCount = LORES.length || 23;
    return `<section class="hero">
      <div class="hero__bg" aria-hidden="true"></div>
      <div class="hero__in">
        <div class="hero__text">
          <div class="hero__kicker">Энциклопедия · Мир Тьмы</div>
          <h1><span>Пепел</span><span class="red">Небес</span></h1>
          <p class="hero__sub">Они были первыми созданиями Творца — и первыми, кто усомнился. Тысячу лет они воевали с Небом, три тысячи — гнили в Бездне. Теперь <strong>падшие</strong> вернулись в мир, где их считают сказкой, а веру собирают по крупицам.</p>
          <div class="hero__actions">
            <a class="btn btn--blood" href="#/start">${icon('arrow')} Начать</a>
            <a class="btn btn--ghost" href="#/houses">${icon('star')} 7 Домов</a>
            <a class="btn btn--ghost" href="#/rules">Правила</a>
          </div>
          <div class="hero__stats">
            <div class="hero__stat"><b>${houses}</b><span>${plural(houses, 'Дом', 'Дома', 'Домов')}</span></div>
            <div class="hero__stat"><b>${factions}</b><span>${plural(factions, 'фракция', 'фракции', 'фракций')}</span></div>
            <div class="hero__stat"><b>${loreCount}</b><span>${plural(loreCount, 'Знание', 'Знания', 'Знаний')}</span></div>
            <div class="hero__stat"><b>${BOOKS.length || 22}</b><span>${plural(BOOKS.length || 22, 'книга', 'книги', 'книг')} в библиотеке</span></div>
          </div>
        </div>
        <div class="hero__plate" aria-hidden="true">
          <div class="plate">
            <div class="plate__seal"><svg viewBox="0 0 40 40">${SIGILS.devils}</svg></div>
            <div class="plate__kicker">Liber Damnatorum</div>
            <div class="plate__title">Пепел<br><span>Небес</span></div>
            <div class="plate__rule"></div>
            <p class="plate__desc">Семь Домов. Пять фракций. Двадцать три Знания. Одна история, рассказанная проигравшими.</p>
            <div class="plate__swatches">
              <i style="background:#081919"></i><i style="background:#223330"></i><i style="background:#4D524B"></i>
              <i style="background:#837F78"></i><i style="background:#65060E"></i><i style="background:#CE1A1E"></i>
            </div>
            <div class="plate__foot"><span>MMXXVI</span><span>издание первое</span></div>
          </div>
          <div class="hero__cap"><span>Палитра проекта</span><span>шесть цветов</span></div>
        </div>
      </div>
    </section>`;
  }

  /* ---------------- главная ---------------- */
  function home() {
    const houses = byGroup('houses');
    const featuredLores = ['flame', 'patterns', 'storms', 'longing', 'forge', 'death'].map(id => LORES.find(l => l.id === id)).filter(Boolean);
    const rulePages = ['rules/dice', 'rules/faith', 'rules/combat', 'rules/forms'].map(id => PAGE[id]).filter(Boolean);
    const books = BOOKS.slice(0, 4);
    const favItems = state.favs.map(r => {
      if (PAGE[r]) return { id: r, title: PAGE[r].title, lead: PAGE[r].lead, kind: 'Статья' };
      const l = LORES.find(x => 'lores/' + x.id === r);
      if (l) return { id: r, title: l.name, lead: l.tagline, kind: 'Знание' };
      const b = BEASTS.find(x => 'bestiary/' + x.id === r);
      if (b) return { id: r, title: b.name, lead: b.summary || b.concept, kind: 'Бестиарий' };
      return null;
    }).filter(Boolean);
    const favBlock = favItems.length ? `<section class="section section--tight">
      <div class="wrap">
        <div class="sec-head"><div><div class="sec-head__kicker">Ваше</div><h2>Избранное</h2></div><span class="sec-head__more" style="border:0">${favItems.length} ${plural(favItems.length, 'запись', 'записи', 'записей')}</span></div>
        <div class="hub hub--auto">${favItems.map(f => `<a class="hub__card" href="#/${f.id}"><div class="house-card__en" style="margin-bottom:6px">${esc(f.kind)}</div><h3>${esc(f.title)}</h3><p>${esc(f.lead || '')}</p><span class="tag">Открыть</span></a>`).join('')}</div>
      </div>
    </section>` : '';
    const palette = [
      ['#081919', 'Black Stallion', 'dark'], ['#223330', 'Concealed Green', 'dark'], ['#4D524B', 'Iron River', 'dark'],
      ['#837F78', 'Chain Link', 'light'], ['#65060E', 'Blood God', 'dark'], ['#CE1A1E', 'Thunder Mountain', 'light'],
    ];
    return hero() + `
    <section class="section">
      <div class="wrap">
        <div class="sec-head">
          <div><div class="sec-head__kicker">Начало пути</div><h2>Как читать <em>эту книгу</em></h2></div>
          <a class="sec-head__more" href="#/start">Все статьи ${icon('arrow')}</a>
        </div>
        <div class="intro-grid">
          <a class="intro-card" href="#/start/what-is"><div class="intro-card__num">I</div><h3>Что такое Demon: The Fallen</h3><p>Игра о падших ангелах, которые помнят Творение и не помнят, как жить в человеческом теле.</p><span class="intro-card__arrow">${icon('arrow')}</span></a>
          <a class="intro-card" href="#/history"><div class="intro-card__num">II</div><h3>История падения</h3><p>От первого дня до трещин в Бездне: как треть Небес подняла меч и что из этого вышло.</p><span class="intro-card__arrow">${icon('arrow')}</span></a>
          <a class="intro-card" href="#/start/how-to-play"><div class="intro-card__num">III</div><h3>Как играть</h3><p>Что делает рассказчик, что делают игроки и почему Вера важнее кулаков.</p><span class="intro-card__arrow">${icon('arrow')}</span></a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="sec-head">
          <div><div class="sec-head__kicker">Себетту · Семь</div><h2>Дома <em>падших</em></h2></div>
          <a class="sec-head__more" href="#/houses">Все Дома ${icon('arrow')}</a>
        </div>
        <div class="houses">${houses.map((p, i) => {
          const h = HOUSE[p.id.split('/')[1]] || {};
          return `<a class="house-card" href="#/${p.id}" style="--house-tint:${h.tint || 'transparent'}">
            <div class="house-card__top"><span class="house-card__num">${h.num || '0' + (i + 1)}</span>${sigil(p.id.split('/')[1], 'house-card__sigil')}</div>
            <h3>${esc(p.title)}</h3>
            <div class="house-card__en">${esc(p.en || h.en || '')}</div>
            <p class="house-card__ep">${esc(p.subtitle || p.lead || '')}</p>
            <div class="house-card__foot"><span>${esc(h.trueName || '')}</span><b>${loreByHouse(p.id.split('/')[1]).length || 3} Знания</b></div>
          </a>`;
        }).join('')}<a class="house-card house-card--all" href="#/houses">
          <div class="house-card__top"><span class="house-card__num">VII</span>${icon('arrow')}</div>
          <h3>Все семь</h3>
          <div class="house-card__en">Себетту</div>
          <p class="house-card__ep">Полный свод: происхождение, Война, Бездна, Вера, слабости и стереотипы каждого Дома.</p>
          <div class="house-card__foot"><span>Раздел</span><b>Открыть →</b></div>
        </a></div>
      </div>
    </section>

    <section class="section section--texture">
      <div class="wrap">
        <div class="sec-head">
          <div><div class="sec-head__kicker">Слова Творения</div><h2>Знания <em>падших</em></h2></div>
          <a class="sec-head__more" href="#/lores">Все ${LORES.length} ${plural(LORES.length, 'Знание', 'Знания', 'Знаний')} ${icon('arrow')}</a>
        </div>
        <div class="lores-strip">${featuredLores.map(l => `<a class="lore-chip" href="#/lores/${l.id}">
          <span class="lore-chip__dots">•••••</span>
          <span class="lore-chip__name">${esc(l.name)}</span>
          <span class="lore-chip__house">${esc((HOUSE[l.house] || {}).ru || '')}</span>
        </a>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="sec-head">
          <div><div class="sec-head__kicker">За столом</div><h2>Правила <em>без тумана</em></h2></div>
          <a class="sec-head__more" href="#/rules">Все правила ${icon('arrow')}</a>
        </div>
        <div class="intro-grid" style="grid-template-columns:repeat(4,1fr)">
          ${rulePages.map((p, i) => `<a class="intro-card" href="#/${p.id}"><div class="intro-card__num">0${i + 1}</div><h3>${esc(p.title)}</h3><p>${esc(p.lead || '')}</p><span class="intro-card__arrow">${icon('arrow')}</span></a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap">
        <div class="sec-head">
          <div><div class="sec-head__kicker">Библиотека</div><h2>Книги <em>линейки</em></h2></div>
          <a class="sec-head__more" href="#/library">Вся библиотека ${icon('arrow')}</a>
        </div>
        <div class="books">${books.map(b => `<a class="book" href="#/library"><span class="book__spine"></span><div><h3>${esc(b.ru || b.title)}</h3><div class="book__en">${esc(b.en || '')}${b.year ? ' · ' + b.year : ''}</div><p>${esc(b.summary || '')}</p></div></a>`).join('')}</div>
      </div>
    </section>

    ${favBlock}
    <section class="section section--tight">
      <div class="wrap">
        <div class="sec-head">
          <div><div class="sec-head__kicker">Референс</div><h2>Палитра <em>проекта</em></h2></div>
          <span class="sec-head__more" style="border:0">шесть цветов одного кадра</span>
        </div>
        <div class="palette">${palette.map(([hex, name, mode]) => `<div class="swatch swatch--${mode}" style="background:${hex}"><b>${name}</b><span>${hex}</span></div>`).join('')}</div>
      </div>
    </section>`;
  }

  /* ---------------- страница ---------------- */
  function pageView(p) {
    const { prev, next } = neighbor(p);
    const toc = [];
    const body = p.body || '';
    const tmp = document.createElement('div');
    tmp.innerHTML = body;
    $$('h2', tmp).forEach(h => {
      if (!h.id) h.id = slug(h.textContent);
      toc.push({ id: h.id, text: h.textContent });
    });
    const cleanBody = tmp.innerHTML;
    const rail = `
      ${factsBox(p)}
      ${toc.length > 1 ? `<div class="rail__box"><div class="rail__title">На странице</div><ul class="toc">${toc.map(t => `<li><a href="#${t.id}" data-toc="${t.id}">${esc(t.text)}</a></li>`).join('')}</ul></div>` : ''}
      ${sourceBox(p)}
      ${actionsBox(p.id)}`;
    return `<article class="page">
      ${crumbs(p.group === 'about' ? [{ label: 'Главная', href: '#/' }, { label: p.title }] : [{ label: 'Главная', href: '#/' }, { label: GROUP[p.group]?.title || 'Раздел', href: '#/' + p.group }, { label: p.nav || p.title }])}
      ${pageHead(p)}
      <div class="page__grid">
        <div class="prose" id="prose">${cleanBody}</div>
        <aside class="rail">${rail}</aside>
      </div>
      ${pager(prev, next)}
    </article>`;
  }

  /* ---------------- хаб ---------------- */
  function hubView(groupId) {
    const g = GROUP[groupId];
    if (!g) return notFound();
    if (groupId === 'houses') return housesHub(g);
    if (groupId === 'lores') return loresHub(g);
    if (groupId === 'bestiary') return bestiaryHub(g);
    if (groupId === 'library') return libraryView(g);
    if (groupId === 'tools') return toolsHub(g);
    const kids = byGroup(groupId);
    const cta = groupId === 'character'
      ? `<a class="hub__card hub__card--cta" href="#/tools/sheet"><h3>Лист персонажа</h3><p>Готовый интерактивный лист: поставьте ромбы, отметьте раны и бросайте Атрибут + Способность прямо со страницы.</p><span class="tag">инструмент</span></a>`
      : kids.length % 2 ? `<a class="hub__card hub__card--cta" href="#/tools/npc"><h3>Случайный падший</h3><p>Не хватает идеи? Сгенерируйте НПС с Домом, фракцией, Мукой и сюжетным крючком — и используйте его как зацепку.</p><span class="tag">генератор</span></a>` : '';
    const body = kids.length ? `<div class="hub">${kids.map(p => `<a class="hub__card" href="#/${p.id}"><h3>${esc(p.nav || p.title)}</h3><p>${esc(p.lead || p.subtitle || '')}</p>${(p.tags || []).slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</a>`).join('')}${cta}</div>` : '';
    return `<article class="page">
      ${crumbs([{ label: 'Главная', href: '#/' }, { label: g.title }])}
      <header class="page__head">
        <div class="page__kicker">Раздел ${g.num}</div>
        <h1>${esc(g.hubTitle || g.title)}</h1>
        <p class="page__sub">${esc(g.intro)}</p>
        <div class="page__meta"><span>${kids.length} ${plural(kids.length, 'статья', 'статьи', 'статей')}</span></div>
      </header>
      ${body || `<p class="dim">Раздел наполняется.</p>`}
    </article>`;
  }

  /* ---------------- дома ---------------- */
  function housesHub(g) {
    const kids = byGroup('houses');
    const body = `<div class="houses">${kids.map((p, i) => {
      const id = p.id.split('/')[1];
      const h = HOUSE[id] || {};
      return `<a class="house-card" href="#/${p.id}" style="--house-tint:${h.tint || 'transparent'}">
        <div class="house-card__top"><span class="house-card__num">${h.num || i + 1}</span>${sigil(id, 'house-card__sigil')}</div>
        <h3>${esc(p.title)}</h3>
        <div class="house-card__en">${esc(p.en || h.en || '')}</div>
        <p class="house-card__ep">${esc(p.subtitle || p.lead || '')}</p>
        <div class="house-card__foot"><span>${esc(h.trueName || '')}</span><b>${loreByHouse(id).length || 3} Знания</b></div>
      </a>`;
    }).join('')}<a class="house-card house-card--all" href="#/tools/builder">
        <div class="house-card__top"><span class="house-card__num">VIII</span>${icon('users')}</div>
        <h3>Собрать своего</h3>
        <div class="house-card__en">Конструктор</div>
        <p class="house-card__ep">Дом, фракция, Атрибуты, Способности, Знания и Лик — пошагово, с подсчётом свободных очков.</p>
        <div class="house-card__foot"><span>Инструмент</span><b>Открыть →</b></div>
      </a></div>
    <div class="prose" style="margin-top:42px"><p class="lead">Семь Домов были не сословиями, а функциями: один нёс волю, другой считал звёзды, третий растил плоть. После Падения функции стали проклятиями, а иерархия — привычкой, от которой невозможно избавиться.</p>
    <p>Каждая страница Дома построена одинаково: происхождение, роль в Войне, Бездна, возвращение, характер, Вера, носители, фракции, слабость и стереотипы. Внизу — игровые заметки: Начальная Мука, Знания Дома и то, на что стоит смотреть при создании персонажа.</p></div>`;
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Дома' }])}
      <header class="page__head"><div class="page__kicker">Себетту · Семь Домов</div><h1>Дома <em style="font-style:italic;color:var(--ash)">падших</em></h1>
      <p class="page__sub">${esc(g.intro)}</p><div class="page__meta"><div class="meta-line"><span>7 Домов</span><span class="dotsep">·</span><span>${LORES.length} ${plural(LORES.length, 'Знание', 'Знания', 'Знаний')}</span></div></div></header>
      ${body}</article>`;
  }

  /* ---------------- знания ---------------- */
  function loreDots(n) { return '●'.repeat(n) + '○'.repeat(5 - n); }

  function loresHub(g, initialFilter) {
    const filter = initialFilter || 'all';
    const houses = HOUSE_ORDER;
    const chips = `<div class="lore-filter" id="lore-filter">
      <button class="${filter === 'all' ? 'is-active' : ''}" data-filter="all">Все</button>
      ${houses.map(h => `<button class="${filter === h ? 'is-active' : ''}" data-filter="${h}">${esc(HOUSE[h].ru)}</button>`).join('')}
      <button class="${filter === 'common' ? 'is-active' : ''}" data-filter="common">Общие</button>
    </div>`;
    const cards = (f) => LORES.filter(l => f === 'all' || l.house === f).map(l => `<a class="hub__card" href="#/lores/${l.id}">
      <div class="house-card__en" style="margin-bottom:6px">${esc((HOUSE[l.house] || {}).ru || 'Общее')}</div>
      <h3>${esc(l.name)}</h3><p>${esc(l.tagline || '')}</p>
      <span class="tag">${l.powers ? l.powers.length : 5} сил</span>
    </a>`).join('');
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Знания' }])}
      <header class="page__head"><div class="page__kicker">Слова Творения</div><h1>Знания</h1><p class="page__sub">${esc(g.intro)}</p>
      <div class="page__meta"><div class="meta-line"><span>${LORES.length} ${plural(LORES.length, 'Знание', 'Знания', 'Знаний')}</span><span class="dotsep">·</span><span>${LORES.reduce((n, l) => n + (l.powers ? l.powers.length : 0), 0)} сил</span></div></div></header>
      ${chips}<div class="hub hub--3" id="lore-cards">${cards(filter)}</div>
    </article>`;
  }

  function lorePage(l) {
    const h = HOUSE[l.house] || {};
    const same = LORES.filter(x => x.house === l.house);
    const idx = same.findIndex(x => x.id === l.id);
    const prev = idx > 0 ? same[idx - 1] : null;
    const next = idx >= 0 && idx < same.length - 1 ? same[idx + 1] : null;
    const powers = (l.powers || []).map(p => `<div class="power" id="power-${p.level}">
      <div class="power__head"><span class="power__dots">${loreDots(p.level)}</span><span class="power__name">${esc(p.name)}</span><span class="power__en">${esc(p.en || '')}</span></div>
      <div class="power__meta">${p.cost ? `<span><b>Стоимость:</b> ${esc(p.cost)}</span>` : ''}${p.pool ? `<span><b>Бросок:</b> ${esc(p.pool)}</span>` : ''}</div>
      <div class="power__text">${/^\s*</.test(p.text || '') ? p.text : '<p>' + esc(p.text || '') + '</p>'}</div>
      ${p.torment ? `<div class="power__torment"><b>Мука.</b> ${esc(p.torment)}</div>` : ''}
    </div>`).join('');
    const intro = /</.test(l.intro || '') ? l.intro : String(l.intro || '').split(/\n{2,}/).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('');
    return `<article class="page">
      ${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Знания', href: '#/lores' }, { label: l.name }])}
      <header class="page__head"><div class="page__kicker">${esc(h.ru || 'Общее')} · Знание</div><h1>${esc(l.name)}</h1>
      <p class="page__sub">${esc(l.tagline || '')}</p>
      <div class="page__meta"><div class="tags">${h.ru ? `<a class="tag" href="#/houses/${l.house}">${esc(h.ru)}</a>` : '<span class="tag">Общее</span>'}<span class="tag">${l.powers ? l.powers.length : 5} сил</span></div><div class="meta-line">${esc(l.en || '')}${l.source ? ' <span class="dotsep">·</span> ' + esc(l.source) : ''}</div></div></header>
      <div class="page__grid"><div class="prose"><div class="lore-intro">${intro}</div><div class="lore-list">${powers}</div></div>
      <aside class="rail">
        <div class="rail__box"><div class="rail__title">Силы</div><ul class="toc">${(l.powers || []).map(p => `<li><a href="#power-${p.level}">${'•'.repeat(p.level)} ${esc(p.name)}</a></li>`).join('')}</ul></div>
        ${sourceBox(l)}
        ${h.ru ? `<div class="rail__box"><div class="rail__title">Дом</div><a class="lore-house" href="#/houses/${l.house}">${sigil(l.house)} ${esc(h.ru)}</a></div>` : ''}
        ${actionsBox('lores/' + l.id)}
      </aside></div>
      <div class="page__foot">
        ${prev ? `<a class="pager" href="#/lores/${prev.id}"><span>← Знание</span><b>${esc(prev.name)}</b></a>` : '<span class="pager pager--none"></span>'}
        ${next ? `<a class="pager pager--next" href="#/lores/${next.id}"><span>Знание →</span><b>${esc(next.name)}</b></a>` : '<span class="pager pager--none"></span>'}
      </div>
    </article>`;
  }

  /* ---------------- бестиарий ---------------- */
  function threatDots(n) { n = clamp(Number(n) || 1, 1, 5); return '◆'.repeat(n) + '◇'.repeat(5 - n); }

  function bestiaryHub(g, initialType) {
    const types = ['all', ...Array.from(new Set(BEASTS.map(b => b.type || 'Иное')))];
    const t = initialType || 'all';
    const cards = (filter) => BEASTS.filter(b => filter === 'all' || (b.type || 'Иное') === filter).map(b => `<a class="beast-card" href="${beastRoute(b)}">
      <div class="beast-card__top"><span>${esc(b.type || 'Иное')}${b.subtype ? ' · ' + esc(b.subtype) : ''}</span><span class="beast-card__threat" title="Опасность">${threatDots(b.threat)}</span></div>
      <h3>${esc(b.name)}</h3><div class="beast-card__en">${esc(b.en || '')}</div>
      <p>${esc(b.summary || b.concept || '')}</p>
      <div class="beast-card__foot"><span>${esc(b.source ? String(b.source).split(',')[0] : '')}</span><span>Открыть →</span></div>
    </a>`).join('');
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Бестиарий' }])}
      <header class="page__head"><div class="page__kicker">Кто ждёт в темноте</div><h1>Бестиарий</h1><p class="page__sub">${esc(g.intro)}</p>
      <div class="page__meta"><span>${BEASTS.length} ${plural(BEASTS.length, 'запись', 'записи', 'записей')}</span></div></header>
      <div class="lore-filter" id="beast-filter">${types.map(x => `<button class="${x === t ? 'is-active' : ''}" data-btype="${esc(x)}">${x === 'all' ? 'Все' : esc(x)}</button>`).join('')}</div>
      <div class="beast-grid" id="beast-cards">${cards(t)}</div>
    </article>`;
  }

  function statBlock(b) {
    const s = b.stats;
    if (!s) return '';
    const hasAttrs = s.attributes && Object.values(s.attributes).some(v => typeof v === 'number' && !isNaN(v));
    const hasCore = typeof s.willpower === 'number' || (typeof s.health === 'number');
    if (!hasAttrs && !hasCore) return '';
    const A = [['str', 'Сила'], ['dex', 'Ловкость'], ['sta', 'Выносливость'], ['cha', 'Харизма'], ['man', 'Манипулирование'], ['app', 'Привлекательность'], ['per', 'Восприятие'], ['int', 'Интеллект'], ['wit', 'Сообразительность']];
    const attrs = s.attributes ? `<div class="stat-attrs">${A.filter(([k]) => s.attributes[k] != null).map(([k, n]) => `<div class="stat-attr"><span>${n}</span><b>${esc(s.attributes[k])}</b></div>`).join('')}</div>` : '';
    const abil = s.abilities && s.abilities.length ? `<div class="stat-row"><span>Способности</span><b>${s.abilities.map(([n, v]) => `${esc(n)} ${esc(v)}`).join(', ')}</b></div>` : '';
    const rows = [
      ['Преимущества', s.backgrounds], ['Воля', s.willpower], ['Вера', s.faith], ['Мука', s.torment],
      ['Здоровье', s.health], ['Лик', s.form], ['Знания', s.lore],
    ].filter(([, v]) => v != null && v !== '' && v !== '—');
    const extras = rows.map(([n, v]) => `<div class="stat-row"><span>${n}</span><b>${esc(v)}</b></div>`).join('');
    return `<div class="statblock"><div class="statblock__head"><b>${esc(b.name)}</b><span>${esc(b.type || '')}${b.subtype ? ' · ' + esc(b.subtype) : ''}</span></div>
      <div class="statblock__body">${attrs}${abil}${extras}</div></div>`;
  }

  function beastPage(b) {
    const list = BEASTS.filter(x => (x.type || 'Иное') === (b.type || 'Иное'));
    const i = list.findIndex(x => x.id === b.id);
    const prev = i > 0 ? list[i - 1] : null;
    const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    const body = b.body ? (/^\s*</.test(b.body) ? b.body : String(b.body).split(/\n{2,}/).filter(Boolean).map(x => `<p>${esc(x)}</p>`).join('')) : `<p>${esc(b.summary || '')}</p>`;
    return `<article class="page">
      ${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Бестиарий', href: '#/bestiary' }, { label: b.name }])}
      <header class="page__head"><div class="page__kicker">${esc(b.type || 'Иное')}${b.subtype ? ' · ' + esc(b.subtype) : ''} · опасность ${clamp(Number(b.threat) || 1, 1, 5)}/5</div>
      <h1>${esc(b.name)}</h1><p class="page__sub">${esc(b.concept || '')}</p>
      <div class="page__meta"><div class="tags"><span class="tag">Опасность ${clamp(Number(b.threat) || 1, 1, 5)}/5</span><span class="tag">${esc(b.type || 'Иное')}</span></div><div class="meta-line">${b.en ? esc(b.en) + ' <span class="dotsep">·</span> ' : ''}${b.source ? esc(b.source) : ''}</div></div></header>
      <div class="page__grid"><div class="prose">
        ${b.quote ? `<blockquote><p>${esc(b.quote)}</p></blockquote>` : ''}
        ${statBlock(b)}
        ${body}
      </div><aside class="rail">
        ${b.source ? sourceBox(b) : ''}
        ${b.stats ? `<div class="rail__box"><div class="rail__title">Опасность</div><div class="dots dots--big">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= (b.threat || 1) ? 'on' : ''}"></i>`).join('')}</div></div>` : ''}
        ${actionsBox('bestiary/' + b.id)}
      </aside></div>
      <div class="page__foot">
        ${prev ? `<a class="pager" href="${beastRoute(prev)}"><span>←</span><b>${esc(prev.name)}</b></a>` : '<span class="pager pager--none"></span>'}
        ${next ? `<a class="pager pager--next" href="${beastRoute(next)}"><span>→</span><b>${esc(next.name)}</b></a>` : '<span class="pager pager--none"></span>'}
      </div>
    </article>`;
  }

  /* ---------------- библиотека ---------------- */
  const LINE_RU = { core: 'Основная', "player's guide": 'Путеводитель', players: 'Путеводитель', setting: 'Сеттинг', earthbound: 'Земные', fiction: 'Художественное', stv: 'STV', lore: 'Знания', companion: 'Компаньон' };
  const lineRu = (l) => LINE_RU[String(l || '').toLowerCase()] || l || 'Прочее';

  function libraryView(g) {
    const lines = ['all', ...Array.from(new Set(BOOKS.map(b => b.line || 'Прочее')))];
    const cards = BOOKS.map(b => `<div class="book" data-line="${esc(b.line || 'Прочее')}">
      <span class="book__spine"></span>
      <div style="min-width:0"><h3>${esc(b.ru || b.title || b.en)}</h3>
        <div class="book__en">${esc(b.en || '')}${b.year ? ' · ' + b.year : ''}${b.pages ? ' · ' + b.pages + ' стр.' : ''}</div>
        <p>${esc(b.summary || '')}</p>
        ${b.use ? `<p class="book__use">${esc(b.use)}</p>` : ''}
        <div class="book__meta">${(b.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      </div>
    </div>`).join('');
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Библиотека' }])}
      <header class="page__head"><div class="page__kicker">Книжная полка</div><h1>Библиотека</h1><p class="page__sub">${esc(g.intro)}</p>
      <div class="page__meta"><span>${BOOKS.length} ${plural(BOOKS.length, 'книга', 'книги', 'книг')}</span></div></header>
      <div class="lore-filter" id="book-filter">${lines.map(x => `<button class="${x === 'all' ? 'is-active' : ''}" data-bline="${esc(x)}">${x === 'all' ? 'Все' : esc(lineRu(x))}</button>`).join('')}</div>
      <div class="books" id="book-cards">${cards}</div>
      <div class="callout" style="margin-top:26px;border:1px solid var(--line);border-left:2px solid var(--ash);padding:18px 22px;background:rgba(34,51,48,.35);font-size:13.5px;color:var(--dim)">Файлы книг не распространяются вместе с энциклопедией. Каталог описывает содержание и помогает выбрать источник; сами PDF стоит приобретать у правообладателя.</div>
    </article>`;
  }

  /* ---------------- инструменты ---------------- */
  function toolsHub(g) {
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Инструменты' }])}
      <header class="page__head"><div class="page__kicker">За столом</div><h1>Инструменты</h1><p class="page__sub">${esc(g.intro)}</p></header>
      <div class="hub">
        <a class="hub__card" href="#/tools/sheet"><h3>Лист персонажа</h3><p>Интерактивный лист: ромбы Атрибутов и Способностей, Вера, Мука, раны и броски в один клик.</p><span class="tag">лист</span></a>
        <a class="hub__card" href="#/tools/builder"><h3>Конструктор падшего</h3><p>Соберите персонажа по шагам: Дом, фракция, Атрибуты, Способности, Знания и Лик. Всё сохраняется в браузере.</p><span class="tag">персонаж</span></a>
        <a class="hub__card" href="#/tools/npc"><h3>Генератор НПС</h3><p>Падший, культист или охотник за один клик — с характером, Мукой и сюжетным крючком.</p><span class="tag">быстро</span></a>
        <a class="hub__card" href="#/tools/dice"><h3>Кости</h3><p>Пул d10, сложность, десятки, ботчи. История бросков и честный подсчёт успехов.</p><span class="tag">d10</span></a>
        <a class="hub__card" href="#/rules/dice"><h3>Шпаргалка по броскам</h3><p>Как собирается пул, что считается успехом и когда бросок вообще не нужен.</p><span class="tag">правила</span></a>
        <a class="hub__card" href="#/library"><h3>Библиотека</h3><p>Каталог книг линейки: что читать про Дом, город или конец времён.</p><span class="tag">книги</span></a>
      </div>
    </article>`;
  }

  /* ---------------- кости ---------------- */
  function diceModal() {
    openModal(`<h2>Кости</h2><p class="muted">Пул d10 против сложности. Семёрка и выше — успех; единицы отменяют успехи; если успехов нет, а единицы есть — ботч.</p>
      <div class="field-row">
        <div class="field"><label for="d-pool">Пул</label><input id="d-pool" type="number" min="1" max="30" value="6"></div>
        <div class="field"><label for="d-diff">Сложность</label><input id="d-diff" type="number" min="2" max="10" value="7"></div>
      </div>
      <label style="display:flex;gap:9px;align-items:center;font-size:13px;color:var(--dim);margin-bottom:18px"><input id="d-ten" type="checkbox" checked> десятки дают дополнительный бросок</label>
      <button class="btn btn--blood" data-roll>Бросить</button>
      <div id="dice-out" style="margin-top:22px"></div>`);
  }

  function rollDice() {
    const pool = clamp(parseInt($('#d-pool').value, 10) || 1, 1, 30);
    const diff = clamp(parseInt($('#d-diff').value, 10) || 7, 2, 10);
    const ten = $('#d-ten').checked;
    const dice = [];
    let successes = 0, ones = 0, rolls = 0;
    for (let i = 0; i < pool; i++) {
      let v = 1 + Math.floor(Math.random() * 10);
      rolls++;
      dice.push(v);
      if (v >= diff) successes++;
      if (v === 1) ones++;
      if (ten && v === 10) { let extra = 0; while (extra < 10) { const w = 1 + Math.floor(Math.random() * 10); rolls++; dice.push(w); if (w >= diff) successes++; if (w === 1) ones++; if (w !== 10) break; extra++; } }
    }
    const net = Math.max(0, successes - ones);
    const botch = successes === 0 && ones > 0;
    const cls = botch ? 'var(--ember)' : net > 0 ? 'var(--paper)' : 'var(--ash)';
    const verdict = botch ? 'БОТЧ' : net > 0 ? `${net} ${plural(net, 'успех', 'успеха', 'успехов')}` : 'Провал';
    $('#dice-out').innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${dice.map(v => `<span style="display:grid;place-items:center;width:34px;height:40px;border:1px solid ${v >= diff ? 'var(--ember)' : 'var(--line)'};font-family:var(--mono);font-size:15px;color:${v >= diff ? 'var(--paper)' : v === 1 ? 'var(--ember)' : 'var(--faint)'};background:${v >= diff ? 'rgba(101,6,14,.25)' : 'transparent'}">${v}</span>`).join('')}</div>
      <div style="font-family:var(--serif);font-size:1.7rem;color:${cls}">${verdict}</div>
      <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-top:4px">${successes} успехов · ${ones} единиц · ${rolls} бросков</div>`;
  }

  function npcModal() {
    const houses = byGroup('houses');
    const factions = byGroup('factions');
    const h = houses.length ? houses[Math.floor(Math.random() * houses.length)] : null;
    const f = factions.length ? factions[Math.floor(Math.random() * factions.length)] : null;
    const first = ['Азраил', 'Баал', 'Гадариэль', 'Дагон', 'Зафкиэль', 'Иезекииль', 'Ксафан', 'Лилит', 'Мельхиор', 'Наама', 'Озаз', 'Паймон', 'Разиэль', 'Саммаэль', 'Тубало', 'Уриил', 'Фенекс', 'Харон', 'Цафкиэль', 'Шемхазай'];
    const last = ['Ашер', 'Блэк', 'Восс', 'Грин', 'Дельгадо', 'Кейн', 'Лоу', 'Мор', 'Норд', 'Ортис', 'Прайс', 'Рид', 'Стоун', 'Тейт', 'Уайт', 'Ферро', 'Холл', 'Шоу', 'Эванс', 'Янг'];
    const jobs = ['адвокат', 'бармен', 'детектив', 'журналистка', 'медсестра', 'музыкант', 'охранник', 'политик', 'проповедник', 'скульптор', 'татуировщик', 'фотограф', 'хакер', 'водитель', 'студентка'];
    const hooks = ['Ищет человека, чьё тело занимает уже третью жизнь подряд.', 'Собирает веру в маленькой общине, которая скоро перестанет быть маленькой.', 'Боится, что Люцифер вернётся и спросит, что он сделал с Его наследием.', 'Прячет в подвале вещь, которую не должен был создавать.', 'Хочет вернуть смертному носителю память о его семье — и не понимает, зачем.', 'Убил другого падшего и теперь слышит его голос в чужих молитвах.', 'Знает адрес Земного и слишком долго не решается его использовать.', 'Пытается доказать, что человек способен на добро без веры.'];
    const name = first[Math.floor(Math.random() * first.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
    const mortal = ['Макс', 'Лора', 'Дэвид', 'Хелен', 'Марк', 'Бекки', 'Ной', 'Эмили', 'Томас', 'Джессика'][Math.floor(Math.random() * 10)] + ' ' + last[Math.floor(Math.random() * last.length)];
    const torment = 3 + Math.floor(Math.random() * 6);
    const faith = 2 + Math.floor(Math.random() * 6);
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    openModal(`<h2>${esc(name)}</h2><p class="muted">${esc(h ? h.title : 'Падший')} · ${esc(f ? f.title : 'Без фракции')} · Мука ${torment}</p>
      <div class="facts"><div><dt>Носитель</dt><dd>${esc(mortal)}, ${esc(jobs[Math.floor(Math.random() * jobs.length)])}</dd></div>
      <div><dt>Дом</dt><dd>${esc(h ? h.title : '—')}</dd></div>
      <div><dt>Фракция</dt><dd>${esc(f ? f.title : '—')}</dd></div>
      <div><dt>Вера / Воля</dt><dd>${faith} / ${4 + Math.floor(Math.random() * 6)}</dd></div>
      <div><dt>Мука</dt><dd>${torment}</dd></div></div>
      <p style="margin-top:20px;font-family:var(--serif);font-size:1.25rem;font-style:italic;color:var(--paper)">${esc(hook)}</p>
      <button class="btn btn--blood" data-npc style="margin-top:18px">${icon('shuffle')} Ещё</button>`);
  }

  /* ---------------- поиск ---------------- */
  let SEARCH = [];
  function buildSearch() {
    SEARCH = [];
    PAGES.forEach(p => SEARCH.push({ type: GROUP[p.group]?.title || 'Статья', title: p.title, text: strip(p.lead + ' ' + (p.body || '')).slice(0, 4000), route: p.id }));
    LORES.forEach(l => SEARCH.push({ type: 'Знание', title: l.name, text: strip((l.tagline || '') + ' ' + (l.intro || '') + ' ' + (l.powers || []).map(p => p.name + ' ' + p.text).join(' ')).slice(0, 6000), route: 'lores/' + l.id }));
    BEASTS.forEach(b => SEARCH.push({ type: 'Бестиарий', title: b.name, text: strip((b.concept || '') + ' ' + (b.summary || '') + ' ' + (b.body || '')).slice(0, 4000), route: 'bestiary/' + b.id }));
    BOOKS.forEach(b => SEARCH.push({ type: 'Книга', title: b.ru || b.en || '', text: strip((b.en || '') + ' ' + (b.summary || '') + ' ' + (b.use || '')), route: 'library' }));
    SEARCH.push({ type: 'Инструмент', title: 'Лист персонажа', text: 'интерактивный лист персонажа атрибуты способности ромбы броски раны вера воля мука конструктор', route: 'tools/sheet' });
    SEARCH.push({ type: 'Инструмент', title: 'Конструктор падшего', text: 'создание персонажа дом фракция нрав атрибуты способности преимущества знания свободные очки', route: 'tools/builder' });
    SEARCH.push({ type: 'Инструмент', title: 'Кости d10', text: 'броски кубики пул сложность успехи ботч', route: 'tools/dice' });
  }

  function score(item, q) {
    const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9\s-]/g, ' ')
      .split(/\s+/).filter(Boolean)
      .map(w => (w.length > 4 ? w.slice(0, 4) : w)).join(' ');
    const t = norm(item.title), x = norm(item.text), nq = norm(q);
    let s = 0;
    if (t === nq) s += 100; else if (t.startsWith(nq)) s += 60; else if (t.includes(nq)) s += 35;
    if (x.includes(nq)) s += 10;
    const w = item.type === 'Книга' ? 0 : item.type === 'Знание' ? 45 : item.type === 'Бестиарий' ? 15 : 25;
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
    box.innerHTML = searchItems.length ? searchItems.map((it, i) => `<a class="result ${i === 0 ? 'is-sel' : ''}" href="#/${it.route}" data-i="${i}"><div class="result__top"><span class="result__type">${esc(it.type)}</span><span class="result__title">${esc(it.title)}</span></div><div class="result__text">${esc(it.text.slice(0, 150))}</div></a>`).join('') : `<div class="search__empty">Ничего не найдено. Попробуйте «Пламя», «Люцифер» или «Мука».</div>`;
  }

  function openSearch() {
    const s = $('#search');
    s.hidden = false;
    document.body.classList.add('is-locked');
    const input = $('#search-input');
    input.value = '';
    runSearch('');
    setTimeout(() => input.focus(), 30);
  }
  function closeSearch() { $('#search').hidden = true; document.body.classList.remove('is-locked'); }

  /* ---------------- модальные ---------------- */
  function openModal(html) {
    $('#modal-body').innerHTML = html;
    $('#modal').hidden = false;
    document.body.classList.add('is-locked');
  }
  function closeModal() {
    $('#modal').hidden = true;
    document.body.classList.remove('is-locked');
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2400);
  }

  /* ---------------- события страницы ---------------- */
  function afterRender(route) {
    // TOC active state
    const links = $$('[data-toc]');
    if (links.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            links.forEach(a => a.classList.toggle('is-active', a.getAttribute('data-toc') === en.target.id));
          }
        });
      }, { rootMargin: '-90px 0px -70% 0px' });
      links.forEach(a => { const el = document.getElementById(a.getAttribute('data-toc')); if (el) obs.observe(el); });
    }
    // lore filter
    const lf = $('#lore-filter');
    if (lf && $('#lore-cards')) {
      lf.addEventListener('click', (e) => {
        const b = e.target.closest('[data-filter]');
        if (!b) return;
        lf.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
        const f = b.dataset.filter;
        $('#lore-cards').innerHTML = LORES.filter(l => f === 'all' || l.house === f).map(l => `<a class="hub__card" href="#/lores/${l.id}"><div class="house-card__en" style="margin-bottom:6px">${esc((HOUSE[l.house] || {}).ru || 'Общее')}</div><h3>${esc(l.name)}</h3><p>${esc(l.tagline || '')}</p><span class="tag">${l.powers ? l.powers.length : 5} сил</span></a>`).join('');
      });
    }
    const bf = $('#beast-filter');
    if (bf && $('#beast-cards')) {
      bf.addEventListener('click', (e) => {
        const b = e.target.closest('[data-btype]');
        if (!b) return;
        bf.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
        const f = b.dataset.btype;
        $('#beast-cards').innerHTML = BEASTS.filter(x => f === 'all' || (x.type || 'Иное') === f).map(x => `<a class="beast-card" href="${beastRoute(x)}"><div class="beast-card__top"><span>${esc(x.type || 'Иное')}${x.subtype ? ' · ' + esc(x.subtype) : ''}</span><span class="beast-card__threat">${threatDots(x.threat)}</span></div><h3>${esc(x.name)}</h3><div class="beast-card__en">${esc(x.en || '')}</div><p>${esc(x.summary || x.concept || '')}</p><div class="beast-card__foot"><span>${esc(x.source ? String(x.source).split(',')[0] : '')}</span><span>Открыть →</span></div></a>`).join('');
      });
    }
    const bkf = $('#book-filter');
    if (bkf && $('#book-cards')) {
      bkf.addEventListener('click', (e) => {
        const b = e.target.closest('[data-bline]');
        if (!b) return;
        bkf.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
        const f = b.dataset.bline;
        $$('#book-cards .book').forEach(el => { el.style.display = (f === 'all' || el.dataset.line === f) ? '' : 'none'; });
      });
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    markNav(route, (PAGE[route] || {}).group || route.split('/')[0]);
  }

  /* ---------------- роутер ---------------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const params = new URLSearchParams(query || '');
    return { parts: path.split('/').filter(Boolean), params, raw: path };
  }

  function render() {
    const { parts, params } = parseHash();
    const view = $('#view');
    let html = '', route = '';
    if (!parts.length) { html = home(); route = ''; }
    else if (parts[0] === 'about') { route = 'about'; html = PAGE['about'] ? pageView(PAGE['about']) : notFound(); }
    else if (parts[0] === 'lores') {
      if (parts[1]) {
        const l = LORES.find(x => x.id === parts[1]);
        route = 'lores/' + parts[1];
        html = l ? lorePage(l) : notFound();
      } else { route = 'lores'; html = loresHub(GROUP.lores, params.get('house') || 'all'); }
    }
    else if (parts[0] === 'bestiary') {
      if (parts[1]) {
        const b = BEASTS.find(x => x.id === parts[1]);
        route = 'bestiary/' + parts[1];
        html = b ? beastPage(b) : notFound();
      } else { route = 'bestiary'; html = bestiaryHub(GROUP.bestiary, params.get('type') || 'all'); }
    }
    else if (parts[0] === 'library') { route = 'library'; html = libraryView(GROUP.library); }
    else if (parts[0] === 'tools') {
      route = parts[1] ? 'tools/' + parts[1] : 'tools';
      if (parts[1] === 'builder') html = window.DTF_BUILDER ? window.DTF_BUILDER.render() : toolsHub(GROUP.tools);
      else if (parts[1] === 'sheet') html = window.DTF_SHEET ? window.DTF_SHEET.render() : toolsHub(GROUP.tools);
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
    state.lastRoute = route;
    document.body.classList.remove('menu-open');
    if (window.DTF_BUILDER && route === 'tools/builder') window.DTF_BUILDER.mount();
    if (window.DTF_SHEET && route === 'tools/sheet') window.DTF_SHEET.mount();
    if (route === 'tools/npc') mountNpcPage();
    if (route === 'tools/dice') mountDicePage();
  }

  function routeTitle(route) {
    const base = 'Пепел Небес';
    if (!route) return base;
    if (PAGE[route]) return PAGE[route].title + ' — ' + base;
    if (route.indexOf('lores/') === 0) {
      const l = LORES.find(x => 'lores/' + x.id === route);
      if (l) return l.name + ' — ' + base;
    }
    if (route.indexOf('bestiary/') === 0) {
      const b = BEASTS.find(x => 'bestiary/' + x.id === route);
      if (b) return b.name + ' — ' + base;
    }
    if (GROUP[route]) return (GROUP[route].hubTitle || GROUP[route].title) + ' — ' + base;
    if (route === 'tools/builder') return 'Конструктор падшего — ' + base;
    if (route === 'tools/sheet') return 'Лист персонажа — ' + base;
    if (route === 'tools/npc') return 'Генератор НПС — ' + base;
    if (route === 'tools/dice') return 'Кости — ' + base;
    return base;
  }

  function notFound() {
    return `<article class="page"><div class="page__head"><div class="page__kicker">Ошибка 404</div><h1>Страница выпала из книги</h1><p class="page__sub">Такого раздела нет — или он ещё не написан. Вернитесь к началу или воспользуйтесь поиском.</p></div><div class="hero__actions"><a class="btn btn--blood" href="#/">На главную</a><button class="btn btn--ghost" data-action="search">Поиск</button></div></article>`;
  }

  /* ---------------- страницы инструментов ---------------- */
  function dicePage() {
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Инструменты', href: '#/tools' }, { label: 'Кости' }])}
      <header class="page__head"><div class="page__kicker">d10</div><h1>Кости</h1><p class="page__sub">Пул d10 против сложности. Семёрка и выше — успех; единицы отменяют успехи.</p></header>
      <div style="max-width:520px">
        <div class="field-row"><div class="field"><label for="dp">Пул</label><input id="dp" type="number" min="1" max="30" value="6"></div><div class="field"><label for="dd">Сложность</label><input id="dd" type="number" min="2" max="10" value="7"></div></div>
        <label style="display:flex;gap:9px;align-items:center;font-size:13px;color:var(--dim);margin-bottom:18px"><input id="dt" type="checkbox" checked> десятки дают дополнительный бросок</label>
        <button class="btn btn--blood" id="roll-btn">Бросить</button>
        <div id="dice-out" style="margin-top:22px"></div>
      </div></article>`;
  }
  function mountDicePage() {
    const btn = $('#roll-btn'); if (!btn) return;
    btn.addEventListener('click', () => {
      const pool = clamp(parseInt($('#dp').value, 10) || 1, 1, 30);
      const diff = clamp(parseInt($('#dd').value, 10) || 7, 2, 10);
      const ten = $('#dt').checked;
      const dice = []; let successes = 0, ones = 0;
      for (let i = 0; i < pool; i++) { let v = 1 + Math.floor(Math.random() * 10); dice.push(v); if (v >= diff) successes++; if (v === 1) ones++; if (ten && v === 10) { for (let k = 0; k < 10; k++) { const w = 1 + Math.floor(Math.random() * 10); dice.push(w); if (w >= diff) successes++; if (w === 1) ones++; if (w !== 10) break; } } }
      const net = Math.max(0, successes - ones), botch = successes === 0 && ones > 0;
      const verdict = botch ? 'БОТЧ' : net > 0 ? `${net} ${plural(net, 'успех', 'успеха', 'успехов')}` : 'Провал';
      $('#dice-out').innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${dice.map(v => `<span style="display:grid;place-items:center;width:36px;height:42px;border:1px solid ${v >= diff ? 'var(--ember)' : 'var(--line)'};font-family:var(--mono);font-size:15px;color:${v >= diff ? 'var(--paper)' : v === 1 ? 'var(--ember)' : 'var(--faint)'};background:${v >= diff ? 'rgba(101,6,14,.25)' : 'transparent'}">${v}</span>`).join('')}</div><div style="font-family:var(--serif);font-size:1.8rem;color:${botch ? 'var(--ember)' : 'var(--paper)'}">${verdict}</div>`;
    });
  }

  function npcPage() {
    return `<article class="page">${crumbs([{ label: 'Главная', href: '#/' }, { label: 'Инструменты', href: '#/tools' }, { label: 'Генератор НПС' }])}
      <header class="page__head"><div class="page__kicker">Быстрый вход</div><h1>Генератор НПС</h1><p class="page__sub">Падший, который появится в вашей истории через минуту.</p></header>
      <div id="npc-host"></div>
      <button class="btn btn--blood" id="npc-roll" style="margin-top:22px">Сгенерировать</button></article>`;
  }
  function mountNpcPage() {
    const gen = () => { npcModal(); closeModal(); $('#modal').hidden = false; };
    const host = $('#npc-host');
    const make = () => {
      const houses = byGroup('houses');
      const factions = byGroup('factions');
      const h = houses[Math.floor(Math.random() * Math.max(1, houses.length))] || { title: 'Падший' };
      const f = factions[Math.floor(Math.random() * Math.max(1, factions.length))] || { title: 'Без фракции' };
      const names = ['Азраил', 'Баал', 'Гадариэль', 'Дагон', 'Зафкиэль', 'Иезекииль', 'Ксафан', 'Лилит', 'Мельхиор', 'Наама', 'Озаз', 'Паймон', 'Разиэль', 'Саммаэль', 'Тубало', 'Уриил', 'Фенекс', 'Харон', 'Цафкиэль', 'Шемхазай'];
      const last = ['Ашер', 'Блэк', 'Восс', 'Грин', 'Дельгадо', 'Кейн', 'Лоу', 'Мор', 'Норд', 'Ортис', 'Прайс', 'Рид', 'Стоун', 'Тейт', 'Уайт', 'Ферро', 'Холл', 'Шоу', 'Эванс', 'Янг'];
      const jobs = ['адвокат', 'бармен', 'детектив', 'журналистка', 'медсестра', 'музыкант', 'охранник', 'политик', 'проповедник', 'скульптор', 'татуировщик', 'фотограф', 'хакер', 'водитель', 'студентка'];
      const hooks = ['Ищет человека, чьё тело занимает уже третью жизнь подряд.', 'Собирает веру в маленькой общине, которая скоро перестанет быть маленькой.', 'Боится, что Люцифер вернётся и спросит, что он сделал с Его наследием.', 'Прячет в подвале вещь, которую не должен был создавать.', 'Хочет вернуть смертному носителю память о его семье — и не понимает, зачем.', 'Убил другого падшего и теперь слышит его голос в чужих молитвах.', 'Знает адрес Земного и слишком долго не решается его использовать.', 'Пытается доказать, что человек способен на добро без веры.'];
      const name = names[Math.floor(Math.random() * names.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
      const mortal = ['Макс', 'Лора', 'Дэвид', 'Хелен', 'Марк', 'Бекки', 'Ной', 'Эмили', 'Томас', 'Джессика'][Math.floor(Math.random() * 10)] + ' ' + last[Math.floor(Math.random() * last.length)];
      const torment = 3 + Math.floor(Math.random() * 6), faith = 2 + Math.floor(Math.random() * 6);
      const hook = hooks[Math.floor(Math.random() * hooks.length)];
      host.innerHTML = `<div class="prose" style="max-width:640px"><div class="page__kicker">${esc(h.title)} · ${esc(f.title)}</div><h2 style="border:0;padding:0;margin:0 0 10px;font-size:2.4rem">${esc(name)}</h2><div class="facts"><div><dt>Носитель</dt><dd>${esc(mortal)}, ${esc(jobs[Math.floor(Math.random() * jobs.length)])}</dd></div><div><dt>Дом</dt><dd>${esc(h.title)}</dd></div><div><dt>Фракция</dt><dd>${esc(f.title)}</dd></div><div><dt>Вера / Воля</dt><dd>${faith} / ${4 + Math.floor(Math.random() * 6)}</dd></div><div><dt>Мука</dt><dd>${torment}</dd></div></div><p style="margin-top:20px;font-family:var(--serif);font-size:1.3rem;font-style:italic;color:var(--paper)">${esc(hook)}</p></div>`;
    };
    make();
    $('#npc-roll').addEventListener('click', make);
  }

  /* ---------------- глобальные события ---------------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    const act = t.closest('[data-action]');
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
    const tg = t.closest('[data-toggle]');
    if (tg) { e.preventDefault(); toggleGroup(tg.dataset.toggle); return; }
    const fav = t.closest('[data-fav]');
    if (fav) {
      const r = fav.dataset.fav;
      if (state.favs.includes(r)) state.favs = state.favs.filter(x => x !== r); else state.favs.push(r);
      store.set(LS_FAV, state.favs);
      fav.classList.toggle('is-on');
      fav.innerHTML = `${ICON.heart ? `<svg viewBox="0 0 24 24">${ICON.heart}</svg>` : ''} ${state.favs.includes(r) ? 'В избранном' : 'В избранное'}`;
      toast(state.favs.includes(r) ? 'Добавлено в избранное' : 'Убрано из избранного');
      return;
    }
    if (t.closest('[data-copy]')) {
      const url = location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Ссылка скопирована')).catch(() => toast('Не удалось скопировать'));
      else toast(url);
      return;
    }
    if (t.closest('[data-print]')) { window.print(); return; }
    if (t.closest('[data-roll]')) { rollDice(); return; }
    if (t.closest('[data-npc]')) { npcModal(); return; }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
    if (e.key === 'Escape') { if (!$('#search').hidden) closeSearch(); else if (!$('#modal').hidden) closeModal(); else document.body.classList.remove('menu-open'); return; }
    if (!$('#search').hidden) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!searchItems.length) return;
        searchSel = clamp(searchSel + (e.key === 'ArrowDown' ? 1 : -1), 0, searchItems.length - 1);
        $$('#search-results .result').forEach((el, i) => el.classList.toggle('is-sel', i === searchSel));
        const sel = $$('#search-results .result')[searchSel]; sel?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && searchItems[searchSel]) {
        location.hash = '#/' + searchItems[searchSel].route;
        closeSearch();
      }
    }
  });

  $('#search-input').addEventListener('input', (e) => runSearch(e.target.value));
  $('#search').addEventListener('click', (e) => { if (e.target.id === 'search') closeSearch(); });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    $('.progress i').style.width = (p * 100) + '%';
  }, { passive: true });

  window.addEventListener('hashchange', render);

  /* ---------------- старт ---------------- */
  buildNav();
  buildSearch();
  render();
})();
