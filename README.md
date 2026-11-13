# dsh-locale-ru

Русский языковой пакет для веб-интерфейса DeepSeek Harness.

Пакет регистрирует в клиентском сервисе локализации DSH язык `ru` («Русский», резервный — `en`) и
русские словари для пространств имён клиентских плагинов. Непереведённые ключи берутся из английского
словаря, поэтому неполный перевод не ломает интерфейс.

## Состав

| Путь | Назначение |
|---|---|
| `package.json` | Манифест плагина: `dsh.client` объявляет браузерную половину (`platform: web`). |
| `lib/index.js` | Хостовая половина: пустой `apply()`. Нужна, чтобы у Loader была строка для монтирования. |
| `lib/client.js` | Сгенерированный браузерный бандл в формате `window.__ModuleLoader__.load({ id, factory })`. |
| `data/ru.json` | Источник перевода: `{ "пространство имён": { "ключ": "русский текст" } }`. |
| `tool/build-client.js` | Пересобирает `lib/client.js` из `data/ru.json`. |

## Как это работает

Клиентская половина объявляет `inject: ['locale']` и в `apply(ctx)`:

1. регистрирует язык `{ id: 'ru-RU', label: 'Русский (полный)', fallback: 'ru' }` через `ctx.locale.addLanguage`;
2. для каждого пространства имён регистрирует русский словарь через `ctx.locale.register(ns, 'ru-RU', dict)`.

Обе операции оформлены через `ctx.effect`, поэтому при выгрузке плагина язык и словари снимаются.

**Почему не `ru`.** Каждый встроенный клиентский плагин сам регистрирует свой словарь
(`ctx.locale.register(ns, { ru, en, … })`), а `register` из `@deepseek-ai/dsh-client-locale`
бросает `locale namespace "<ns>" already has locale "ru"`, если `ru` уже занят. Пакет,
успевший зарегистрировать `ru` раньше, роняет 18 встроенных плагинов (theme, shortcuts,
settings-*, approval, jobs, cordis и др.), и веб-клиент не загружается:
`web boot: N entries did not activate`. Отдельный id `ru-RU` с цепочкой `ru-RU → ru → en`
даёт тексты пакета, добивает пропуски штатным `ru` и не конфликтует ни с кем.

## Сборка

```powershell
node tool/build-client.js
```

Скрипт проверяет `data/ru.json`, сортирует ключи и перезаписывает `lib/client.js`.

## Установка

Нужны Node.js 20+ и `pnpm` (DSH ставит плагины через него):

```powershell
dsh plugin --profile desktop add @bayan1377/dsh-locale-ru
```

Пакет несёт собственный bundle-патч: он сам вставляет плагин в стек слоёв профиля и
выставляет `preference: ru-RU` для `@deepseek-ai/dsh-client-locale`. Править
`cordis.patch.yml` руками не нужно.

Обновление — двумя шагами, `add` поверх уже установленного пакета DSH отклонит:

```powershell
dsh plugin --profile desktop remove @bayan1377/dsh-locale-ru
dsh plugin --profile desktop add @bayan1377/dsh-locale-ru
```

После установки перезагрузите окно интерфейса.

## Обновление перевода

1. Правится `data/ru.json`.
2. `node tool/build-client.js`.
3. Файлы `lib/client.js` и `data/ru.json` копируются в `$DSH_HOME\profiles\node_modules\dsh-locale-ru`.
4. Перезагрузка окна интерфейса.

## Удаление

```powershell
dsh plugin --profile desktop remove @bayan1377/dsh-locale-ru
```

Если `preference: ru-RU` остался в патче профиля, его можно убрать отдельно.
