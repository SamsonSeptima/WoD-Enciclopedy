# Библиотека Миров Тьмы

Единый статический репозиторий-библиотека по **World of Darkness**: корневой индекс, портал и два самостоятельных тома — **Demon: The Fallen** и **Hunter: The Reckoning 5e**.

Всё работает офлайн: HTML, CSS и JavaScript, без сборщика, сервера и базы данных. Ссылки между порталом и томами относительные, поэтому библиотека одинаково работает локально и на GitHub Pages в подпапке репозитория.

---

## Что внутри

| Часть | Где | Что это |
|---|---|---|
| **Индекс** | `index.html` | Корневая страница: три входа, быстрый доступ к разделам, описание библиотеки |
| **Портал** | `world-of-darkness/` | Обзор линеек World of Darkness, палитры и карта томов |
| **Том I** | `demon-the-fallen/` | «Пепел Небес»: Demon: The Fallen — 52 статьи, 7 Домов, 23 Знания, 115 сил |
| **Том II** | `hunter-the-reckoning/` | «Охота»: Hunter: The Reckoning 5e — 37 статей, 5 Кредо, 7 Драйвов, 14 Граней |

У каждого тома свои стили, поиск, бестиарий, лист персонажа и сохранения в `localStorage`.

---

## Структура

```text
wod-encyclopedia/
├── index.html                    корневой индекс библиотеки
├── assets/
│   └── index.css                 стили индекса
├── .nojekyll                     отключает Jekyll на GitHub Pages
├── README.md
├── world-of-darkness/            портал
│   ├── index.html
│   ├── assets/
│   └── README.md
├── demon-the-fallen/             Том I
│   ├── index.html
│   ├── assets/
│   ├── content/
│   └── README.md
└── hunter-the-reckoning/         Том II
    ├── index.html
    ├── assets/
    ├── content/
    └── README.md
```

Корневой `index.html` ссылается на `world-of-darkness/`, `demon-the-fallen/` и `hunter-the-reckoning/`. Портал ссылается на тома через `../demon-the-fallen/` и `../hunter-the-reckoning/`, а тома возвращаются на `../world-of-darkness/`. Именно поэтому все три папки должны оставаться соседями в корне репозитория.

---

## Публикация на GitHub Pages

1. Создайте **публичный** репозиторий, например `wod-encyclopedia`.
2. Загрузите **содержимое этой папки** в корень репозитория — не саму папку:
   - `index.html`;
   - `assets/`;
   - `.nojekyll`;
   - `world-of-darkness/`;
   - `demon-the-fallen/`;
   - `hunter-the-reckoning/`;
   - `README.md`.

   В веб-интерфейсе GitHub удобно загружать партиями: индекс и портал, затем демоны, затем охотники.
3. **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**;
   - Branch: `main`;
   - Folder: **`/ (root)`**;
   - Save.
4. Через 1–3 минуты откройте:

   ```text
   https://<логин>.github.io/wod-encyclopedia/
   ```

Индекс откроется сразу; из него доступны портал и оба тома.

> `.nojekyll` обязателен именно в корне публикуемой папки. Он отключает обработку Jekyll и гарантирует, что все файлы и папки отдаются как есть.

### Если через Git

```powershell
cd D:\Dev\wod-encyclopedia
git init
git add .
git commit -m "World of Darkness library"
git branch -M main
git remote add origin https://github.com/<логин>/wod-encyclopedia.git
git push -u origin main
```

Затем включите Pages в настройках репозитория. Если Git не установлен, используйте веб-загрузку или GitHub Desktop.

---

## Локальная проверка

Открывайте именно `index.html` — как корневой, так и в папках томов. В индексе все переходы указывают на `.../index.html`, а не на папки: при открытии через `file://` ссылка на папку не открывает её `index.html` автоматически.

Чтобы проверить библиотеку в условиях, максимально похожих на GitHub Pages (сайт в подпапке), запустите сервер из **родительской** папки:

```powershell
python -m http.server 8780 --directory D:\Dev
```

И откройте:

```text
http://127.0.0.1:8780/wod-encyclopedia/
```

Проверьте переходы: индекс → портал → демоны → «Все миры» → охотники → «Все миры».

---

## Обновление

Проекты-источники лежат отдельно (`world-of-darkness`, `demon-the-fallen`, `hunter-the-reckoning`). После правок скопируйте в этот репозиторий только runtime-файлы:

- `index.html`;
- `assets/`;
- `content/` (для томов).

Сборка не нужна: `content/*.js` — это уже готовые данные. Если менялась структура ссылок, проверьте относительные пути.

---

## Что не входит в репозиторий

Сюда намеренно не скопированы:

- `preview/` — скриншоты и превью;
- `sources/` — текстовые выгрузки книг;
- `tools/` — служебные скрипты;
- `.tmp/`, `.tmp-*.txt`;
- PDF-сканы книг.

Их не нужно публиковать: они тяжёлые и/или содержат материалы, не предназначенные для распространения.

---

## Технические заметки

- Никакой серверной части: только статические файлы.
- Никакой сборки: данные лежат в `content/*.js` и `assets/`.
- Сохранения — в `localStorage` браузера, у каждого посетителя свои.
- Роутинг томов — hash-роутинг (`#/start`, `#/rules`, `#/tools/sheet`), поэтому прямые ссылки не требуют настройки 404.
- GitHub Pages чувствителен к регистру имён файлов — не переименовывайте папки `assets` и `content`.

---

## Правовая оговорка

Проект неофициальный и некоммерческий. World of Darkness, Demon: The Fallen и Hunter: The Reckoning © Paradox Interactive. Материалы используются по принципу фан-творчества, без коммерческой выгоды. Сканы книг не распространяются.
