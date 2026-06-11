# Orrin Frontend

[![🇬🇧 English version](https://img.shields.io/badge/🇬🇧_Language-English-1565C0?style=flat-square)](./README.md)

Застосунок для стримінгу музики з інтегрованою соціальною мережею та обміном повідомленнями в реальному часі.
Побудований на React 19 з модульною, офлайн-сумісною архітектурою.

---

## Зміст

- [Огляд проєкту](#огляд-проєкту)
- [Архітектура](#архітектура)
    - [Аудіорушій](#аудіорушій)
    - [WebSocket шар реального часу](#websocket-шар-реального-часу)
    - [Управління станом](#управління-станом)
    - [Мережевий шар та безпека](#мережевий-шар-та-безпека)
    - [RBAC та маршрутизація](#rbac-та-маршрутизація)
    - [Система мокування](#система-мокування)
- [Технологічний стек](#технологічний-стек)
- [Структура проєкту](#структура-проєкту)
- [Сторінки та функціонал](#сторінки-та-функціонал)
- [Провайдери контексту](#провайдери-контексту)
- [Кастомні хуки](#кастомні-хуки)
- [Початок роботи](#початок-роботи)
- [Доступні скрипти](#доступні-скрипти)
- [Деплой](#деплой)
- [Контакти](#контакти)
- [Ліцензія](#ліцензія)

---

## Огляд проєкту

Orrin — це веб-платформа, що поєднує стримінг музики з соціальними функціями: підписки на виконавців, публікації у
стрічці з прикріпленими треками, управління плейлистами, обмін повідомленнями в реальному часі та нотатки до треків і
профілів виконавців.

Фронтенд спроєктований з орієнтиром на продуктивність, офлайн-розробку та підтримуваність. Підтримуються два повністю
незалежних режими роботи — реальний бекенд і локальна система моків — які перемикаються однією змінною середовища.

---

## Архітектура

### Аудіорушій

Відтворення керується через `AudioCoreContext` — кастомну абстракцію над нативним HTML5-елементом `<audio>`. Рушій
навмисно відв'язаний від циклу рендерингу React: часті оновлення (позиція треку, стан буферизації) керуються через
`requestAnimationFrame`, а не зміни стану, що запобігає зайвим рендерингам під час відтворення.

Ключові можливості:

- **Інтеграція з OS-level `MediaSession` API** — апаратні медіаклавіші та керування з екрана блокування через
  `useMediaSession` і `useMediaSessionPosition`
- **Управління чергою** — стан черги у `QueueContext`: додавання, видалення, перевпорядкування (drag-and-drop), вставка
  наступним, шафл зі збереженням оригінальної черги, режими повтору
- **Режими повтору та шафл** — `useRepeatMode` і `useTrackEndHandler` координують автоматичний перехід і повтор окремого
  треку
- **Гучність та mute** — персистується незалежно через `useAudioVolume`, не пов'язана зі станом відтворення
- **Стан буферизації** — `useAudioLoading` відстежує події `waiting` / `canplay` і передає `isLoading` / `loadError` до
  UI

UI-компонент `BottomPlayer` споживає цей контекст і рендерить підкомпоненти (`TimeControls`, `VolumeControls`,
`FloatingMiniPlayer`), не маючи власного аудіостану.

### WebSocket шар реального часу

Прямі повідомлення реалізовані через кастомний синглтон `SocketService` (`src/services/socket/socket.service.js`) з
чистим інтерфейсом event-emitter (`on` / `off` / `emit`).

Реальна реалізація (`RealSocket`) містить:

- **Перепідключення з експоненційним відступом** — при незапланованому закритті повторює до 5 спроб із затримками
  `1с × 2^n`
- **JWT-захищений handshake** — токен доступу додається до URL WebSocket при підключенні
- **Захист від зайвих перепідключень** — прапор `_intentionalClose` блокує повторні підключення при ручному від'єднанні
- **Диспетчеризація подій** — вхідні JSON-повідомлення парсяться та маршрутизуються до зареєстрованих слухачів за полем
  `type`

У режимі мокування `MockSocket` симулює індикатори друку та затримані вхідні повідомлення без бекенду.

### Управління станом

**Серверний стан** керується TanStack React Query v5:

- Автоматичне фонове оновлення та інвалідація застарілих даних
- Оптимістичні оновлення UI для соціальних дій (лайки, репости, збереження) з автоматичним відкатом кешу при помилці
- Нескінченне прокручування для стрічок і дискографій через `IntersectionObserver`
- Доменно-специфічні хуки: `useMusicQueries`, `usePostMutations`, `useArtistMutations`, `useUserProfileMutations`

**Клієнтський стан** розподілений між вісьмома контекст-провайдерами, що компонуються через утиліту `composeProviders` в
`AppProviders.jsx`.

### Мережевий шар та безпека

HTTP-клієнт (`api.real.js`) реалізує production-готовий fetch wrapper:

- **JWT в пам'яті** — токен доступу живе у змінній модуля, а не в `localStorage`, щоб знизити вектор XSS-атак. У
  `localStorage` зберігається лише refresh-токен
- **Тихе оновлення токена з чергою запитів** — при `401`-відповіді всі запити, що виконуються, ставляться в чергу. Одне
  оновлення відбувається у фоні; при успіху черга скидається і запити повторюються прозоро. При невдачі спрацьовує
  `onSessionExpiredCallback` і виконується примусовий вихід
- **Структуроване витягування помилок** — `ApiError` несе `status`, `endpoint` і розпарсені серверні повідомлення про
  помилки
- **FormData-сумісність** — `Content-Type: application/json` автоматично опускається, якщо `body` є `FormData`

### RBAC та маршрутизація

Всі маршрути lazy-завантажуються через `React.lazy` з межею `<Suspense>` та кастомним фолбеком `VinylLoader`.

Два рівні захисту маршрутів у `ProtectedRoute`:

| Guard                            | Умова                                           | Редирект                               |
|----------------------------------|-------------------------------------------------|----------------------------------------|
| `requireArtistManagement: false` | Користувач має бути авторизованим               | `/login` (зі збереженням `state.from`) |
| `requireArtistManagement: true`  | Користувач має керувати конкретним `artistSlug` | `/artist/:artistSlug` або `/`          |

Доступ до управління виконавцем перевіряється для кожного slug через `usePermissions` → `isArtistManager(slug)`, що
перевіряє `user.managed_artists`. Менеджер одного виконавця не має доступу до дашборду іншого.

### Система мокування

При `VITE_USE_MOCK_DATA=true` активується повна паралельна реалізація:

| Шар       | Реальний                           | Мок                                                       |
|-----------|------------------------------------|-----------------------------------------------------------|
| API       | `api.real.js` → Django REST бекенд | `api.mock.js` → дані в пам'яті з симульованими затримками |
| Auth      | `auth.real.js` → JWT endpoint      | `auth.mock.js` → генерує фейкові токени                   |
| WebSocket | `RealSocket` → `ws://` з'єднання   | `MockSocket` → симулює події локально                     |

Всі мокові дані (`src/data/`) охоплюють треки, виконавців, користувачів, пости, плейлисти, сповіщення, чати та юридичний
контент. Мутабельний стан (історія, повідомлення) підтримує операції запису в межах сесії.

---

## Технологічний стек

| Компонент           | Технологія                                 | Версія          |
|---------------------|--------------------------------------------|-----------------|
| Основний фреймворк  | React                                      | 19.1.1          |
| Інструмент збірки   | Vite                                       | 7.1.7           |
| Серверний стан      | TanStack React Query                       | 5.90.5          |
| Маршрутизація       | React Router DOM                           | 7.9.3           |
| Форми               | React Hook Form + `@hookform/resolvers`    | 7.65.0          |
| Схемна валідація    | Yup                                        | 1.7.1           |
| Стилізація          | CSS Modules + CSS Custom Properties        | —               |
| Інтернаціоналізація | i18next + react-i18next + browser detector | 25.6.0          |
| Іконки              | Lucide React + React Icons                 | 0.545.0 / 5.5.0 |
| Лінтинг             | ESLint 9 + react-hooks + react-refresh     | 9.36.0          |

---

## Структура проєкту

```text
orrin-frontend/
├── public/                         # Статичні ресурси (логотип, аватар за замовчуванням)
├── src/
│   ├── assets/                     # Зображення та SVG, що бандляться
│   ├── components/
│   │   ├── Layout/
│   │   │   └── BottomPlayer/       # UI програвача (TimeControls, VolumeControls, FloatingMiniPlayer)
│   │   ├── Shared/
│   │   │   ├── TrackCard/          # Картка треку
│   │   │   ├── AlbumCard/          # Картка альбому
│   │   │   ├── FeedPost/           # Пост соціальної стрічки
│   │   │   └── MusicLyrics/        # Рендерер синхронізованих текстів
│   │   └── UI/
│   │       └── Spinner/
│   │           └── VinylLoader.jsx # Suspense-фолбек — анімований вініл
│   ├── constants/
│   │   └── fallbacks.js            # Нормалізатори даних: normalizeTrackData, normalizeArtistData,
│   │                               # normalizeUserData, normalizePostData
│   ├── context/
│   │   ├── AppProviders.jsx        # Компонує всі провайдери через composeProviders()
│   │   ├── AudioCoreContext.jsx    # HTML5 аудіорушій, MediaSession, керування відтворенням
│   │   ├── AuthContext.jsx         # Сесія, login/logout, lifecycle токенів
│   │   ├── NotificationContext.jsx # Список сповіщень і дії з ними
│   │   ├── PlayerUIContext.jsx     # Стан розгорнутого/згорнутого програвача та панелей
│   │   ├── QueueContext.jsx        # Черга відтворення, шафл, перевпорядкування, insert-next
│   │   ├── SettingsContext.jsx     # Тема (темна/світла), персистується в localStorage
│   │   ├── SidebarContext.jsx      # Стан відкриття/закриття навігаційного сайдбару
│   │   └── ToastContext.jsx        # Глобальні сповіщення-снекбари (авто-закриття через 4с)
│   ├── data/                       # Мокові дані (треки, виконавці, чати тощо)
│   │   └── mocks/                  # Доменно-специфічні моки (сповіщення, юридичний контент)
│   ├── hooks/
│   │   ├── audio/                  # useAudioElement, useAudioPlayback, useAudioVolume,
│   │   │                           # useAudioLoading, useRepeatMode, useTrackNavigation,
│   │   │                           # useTrackEndHandler, useMediaSession, useMediaSessionPosition
│   │   ├── useMusicQueries.js      # React Query обгортки для даних музики
│   │   ├── useArtistMutations.js   # Мутації оновлення профілю виконавця
│   │   ├── usePostMutations.js     # Мутації постів (лайк/репост/збереження)
│   │   ├── useUserProfileMutations.js
│   │   ├── useChat.js              # Абстракція WebSocket-чату (відправка, отримання, typing)
│   │   ├── useNotifications.js     # Отримання та позначення сповіщень
│   │   ├── usePermissions.js       # RBAC: isArtistManager(slug)
│   │   ├── useRequiresAuth.js      # Редирект-захист маршруту
│   │   ├── useTotalUnreadMessages.js
│   │   ├── useDebounce.js
│   │   ├── useGoogleAuth.js
│   │   ├── useMarquee.js           # Авто-прокрутка переповненого тексту
│   │   └── useProgressBar.js       # Розрахунок відсотка позиції треку
│   ├── i18n/                       # en.json, uk.json та конфіг i18next
│   ├── layouts/
│   │   ├── MainLayout.jsx          # Оболонка з сайдбаром, програвачем і тостами
│   │   └── HeaderOnlyLayout.jsx    # Мінімальна оболонка для 404
│   ├── pages/
│   │   ├── Auth/                   # Login, Register, ForgotPassword, ResetPassword
│   │   ├── ArtistDashboardPage/    # Дашборд менеджера: редагування профілю, завантаження треків
│   │   ├── ArtistPage/             # Публічний профіль виконавця: дискографія, учасники, нотатки
│   │   ├── BrowseAllPage/          # Пагінований список (треки / виконавці / друзі)
│   │   ├── FavoritesPage/          # Улюблені пісні
│   │   ├── FeedPage/               # Соціальна стрічка з нескінченним прокручуванням
│   │   ├── HistoryPage/            # Історія прослуховування з видаленням
│   │   ├── HomePage/               # Головна панель для авторизованих
│   │   ├── LegalPages/             # TermsPage, PrivacyPage
│   │   ├── LibraryPage/            # Збережені альбоми, плейлисти, підписки
│   │   ├── MessagesPage/           # Обмін повідомленнями в реальному часі
│   │   ├── NotFoundPage/           # 404
│   │   ├── PlaylistsPage/          # Деталі плейлиста і список треків
│   │   ├── RadioPage/              # Безперервне алгоритмічне відтворення
│   │   ├── SearchResultsPage/      # Глобальний пошук: треки, виконавці, користувачі
│   │   ├── SettingsPage/           # Мова, тема, налаштування акаунта
│   │   ├── TopTracksPage/          # Чарт популярних треків
│   │   ├── TrackPage/              # Деталі треку: вкладки з коментарями, нотатками, текстом
│   │   └── UserProfilePage/        # Публічний профіль: пости, підписники
│   ├── routes/
│   │   ├── AppRouter.jsx           # Всі маршрути, lazy-імпорти, межа Suspense
│   │   └── ProtectedRoute.jsx      # Guard автентифікації та guard менеджера виконавця
│   ├── services/
│   │   ├── api/
│   │   │   ├── api.real.js         # Production HTTP-клієнт (fetch + черга оновлення JWT)
│   │   │   ├── api.mock.js         # Повна мок-реалізація з мутабельним станом у пам'яті
│   │   │   └── index.js            # Runtime-перемикач: реальний або мок за VITE_USE_MOCK_DATA
│   │   ├── auth/
│   │   │   ├── auth.real.js        # Реальні auth-ендпоінти
│   │   │   ├── auth.mock.js        # Мок-авторизація з генерацією фейкових токенів
│   │   │   └── index.js            # Перемикач за VITE_USE_MOCK_AUTH
│   │   └── socket/
│   │       └── socket.service.js   # Синглтон SocketService: RealSocket або MockSocket
│   ├── utils/
│   │   └── logger.js               # Dev-only обгортка console (вимкнена у production)
│   ├── App.jsx                     # BrowserRouter + QueryClient + AppProviders + AppRouter
│   └── main.jsx                    # ReactDOM.createRoot точка входу
├── .env.dist                       # Шаблон змінних середовища
├── Dockerfile                      # Багатоетапна збірка: node:20-alpine → nginx:alpine
├── nginx.conf                      # nginx конфіг для SPA
├── vercel.json                     # Правило перезапису для Vercel
├── i18next-parser.config.js        # Конфіг екстракції i18n-ключів (локалі: en, uk)
├── eslint.config.js                # ESLint 9 flat config
├── package.json
└── vite.config.js                  # Vite dev-сервер (host: true, port: 5173, polling)
```

---

## Сторінки та функціонал

| Сторінка            | Маршрут                                                      | Авторизація | Примітки                                     |
|---------------------|--------------------------------------------------------------|-------------|----------------------------------------------|
| Головна             | `/`                                                          | Ні          | Дашборд для авторизованих                    |
| Стрічка             | `/feed`                                                      | Ні          | Соціальна стрічка, нескінченне прокручування |
| Трек                | `/track/:trackId`                                            | Ні          | Коментарі, нотатки, текст — вкладки          |
| Пошук               | `/search`                                                    | Ні          | Треки, виконавці, користувачі                |
| Профіль виконавця   | `/artist/:artistSlug`                                        | Ні          | Дискографія, учасники, схожі виконавці       |
| Профіль користувача | `/user/:userId`                                              | Ні          | Пости, підписники                            |
| Огляд               | `/tracks`, `/artists`, `/friends`                            | Ні          | Пагіновані списки                            |
| Бібліотека          | `/library`                                                   | ✓           | Плейлисти, альбоми, підписки                 |
| Плейлист            | `/playlist/:id`                                              | ✓           | Деталі та відтворення                        |
| Улюблені            | `/favorites`                                                 | ✓           | Лайкнуті пісні                               |
| Історія             | `/history`                                                   | ✓           | Історія прослуховування, можна очистити      |
| Повідомлення        | `/messages/:chatId`                                          | ✓           | Чат через WebSocket                          |
| Налаштування        | `/settings`                                                  | Ні          | Мова, тема, уподобання                       |
| Дашборд виконавця   | `/artist/:artistSlug/manage`                                 | ✓ Менеджер  | Профіль та завантаження треків               |
| Юридичні            | `/terms`, `/privacy`                                         | Ні          | Локалізований контент з API                  |
| Auth                | `/login`, `/register`, `/forgot-password`, `/reset-password` | Ні          | Повні auth-флоу                              |

---

## Провайдери контексту

Всі провайдери компонуються в `AppProviders.jsx` через `composeProviders`. Порядок важливий — провайдери вище по дереву
доступні нижчим.

| Контекст              | Відповідальність                                                                                                                                         |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `AuthContext`         | Сесія, `isLoggedIn`, `login()`, `logout()`, реєстрація callback оновлення токена                                                                         |
| `NotificationContext` | Список сповіщень, кількість непрочитаних, `markAsRead`, `markAllAsRead`                                                                                  |
| `SettingsContext`     | Тема (`dark`/`light`) з персистенцією, `toggleTheme()`                                                                                                   |
| `ToastContext`        | `showToast(message, type)` — авто-закриття через 4с                                                                                                      |
| `SidebarContext`      | `isOpen`, `toggle()`, `close()` для навігаційного сайдбару                                                                                               |
| `QueueContext`        | Масив черги, `currentIndex`, стан шафлу, всі мутації черги                                                                                               |
| `PlayerUIContext`     | `isExpanded`, `showQueue`, `showTrackInfo`, `showVolumeControl`, `isPlayerCollapsed`                                                                     |
| `AudioCoreContext`    | `playTrack()`, `pauseTrack()`, `seek()`, `seekToPercent()`, `nextTrack()`, `previousTrack()`, `toggleRepeat()`, `toggleMute()`, `isLoading`, `loadError` |

---

## Кастомні хуки

**Аудіо (src/hooks/audio/)**

| Хук                       | Відповідальність                                                            |
|---------------------------|-----------------------------------------------------------------------------|
| `useAudioElement`         | Створює та конфігурує ref `HTMLAudioElement`; замінює `src` при зміні треку |
| `useAudioPlayback`        | `play()`, `pause()`, `stop()` з `isPlaying`                                 |
| `useAudioVolume`          | Гучність і mute, застосовуються безпосередньо до елемента                   |
| `useAudioLoading`         | Відстежує `waiting` / `canplay` / `error` → `isLoading`, `loadError`        |
| `useRepeatMode`           | Перемикання `off` → `queue` → `track`                                       |
| `useTrackNavigation`      | `nextTrack()`, `previousTrack()`, `playTrackByIndex()`                      |
| `useTrackEndHandler`      | Поведінка при завершенні треку залежно від режиму повтору                   |
| `useMediaSession`         | Реєстрація метаданих та обробників дій `MediaSession` на рівні OS           |
| `useMediaSessionPosition` | Синхронізація прогрес-бару на екрані блокування через `setPositionState`    |

**Дані та UI**

| Хук                       | Відповідальність                                                     |
|---------------------------|----------------------------------------------------------------------|
| `useMusicQueries`         | React Query хуки для треків, виконавців, стрічки, бібліотеки, пошуку |
| `usePostMutations`        | Оптимістичні мутації лайку / репосту / збереження / коментарів       |
| `useArtistMutations`      | PATCH профілю виконавця з інвалідацією кешу                          |
| `useUserProfileMutations` | PATCH профілю користувача                                            |
| `useChat`                 | Відправка/отримання через WebSocket, debounce індикатора друку       |
| `useNotifications`        | Завантаження сповіщень, розрахунок непрочитаних                      |
| `usePermissions`          | `isArtistManager(slug)` — перевірка `user.managed_artists`           |
| `useRequiresAuth`         | Редирект на `/login` для неавторизованих                             |
| `useTotalUnreadMessages`  | Загальна кількість непрочитаних повідомлень для бейджа               |
| `useProgressBar`          | Розрахунок відсотку поточної позиції для seekbar                     |
| `useDebounce`             | Затримка значення (для пошукового поля)                              |
| `useGoogleAuth`           | Google One Tap / OAuth флоу                                          |
| `useMarquee`              | Авто-прокрутка тексту заголовка треку при переповненні               |

---

## Початок роботи

### Вимоги

- Node.js 20.x або вище
- npm 8.x або вище

### Встановлення

```bash
git clone https://github.com/ivasx/orrin-frontend.git
cd orrin-frontend
npm install
```

### Налаштування середовища

Скопіюйте шаблон та налаштуйте:

```bash
cp .env.dist .env
```

```env
# URL бекенду API
VITE_API_BASE_URL=http://127.0.0.1:8000

# URL WebSocket
VITE_WS_URL=ws://127.0.0.1:8000

# 'true' = використовувати локальні моки (бекенд не потрібен)
# 'false' = підключитися до реального бекенду
VITE_USE_MOCK_DATA=true
```

> При `VITE_USE_MOCK_DATA=true` застосунок працює повністю офлайн — всі API-запити, автентифікація та WebSocket-події
> обробляються локальною системою моків.

### Запуск локально

```bash
npm run dev
```

Доступно за адресою `http://localhost:5173`

---

## Доступні скрипти

| Скрипт                 | Опис                                                                   |
|------------------------|------------------------------------------------------------------------|
| `npm run dev`          | Запуск dev-сервера Vite з HMR                                          |
| `npm run build`        | Компіляція та бандлінг для production у `/dist`                        |
| `npm run preview`      | Локальний запуск production-збірки для перевірки                       |
| `npm run lint`         | ESLint по всіх `.js` / `.jsx` файлах                                   |
| `npm run i18n:extract` | Сканування джерел та оновлення `src/i18n/en.json` + `src/i18n/uk.json` |

---

## Деплой

**Docker (self-hosted)**

`Dockerfile` використовує багатоетапну збірку:

1. **Builder** — `node:20-alpine`: встановлює залежності, запускає `vite build`
2. **Runner** — `nginx:alpine`: копіює `/dist` до web root nginx, роздає на порту 80

```bash
docker build -t orrin-frontend .
docker run -p 80:80 orrin-frontend
```

**Vercel**

Проєкт налаштований для Vercel через `vercel.json`. Всі маршрути перенаправляються на `index.html` для підтримки
клієнтської маршрутизації.

Демо: [https://orrin-yl1x.onrender.com](https://orrin-yl1x.onrender.com)

---

## Контакти

- **Email:** ambroziak.v.ivan@gmail.com
- **GitHub Issues:** [orrin-frontend/issues](https://github.com/ivasx/orrin-frontend/issues)

**Автор:** Ivas — [@ivasx](https://github.com/ivasx)

---

## Ліцензія

Ліцензія MIT — детальніше у файлі [LICENSE](./LICENSE).