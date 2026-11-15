# BUNKER-disco — REST API & WebSocket Documentation

> Версия: 1.0 | Дата: 2026-11-14

---

## Оглавление

1. [Принципы API](#1-принципы-api)
2. [Аутентификация](#2-аутентификация)
3. [Структура ответа](#3-структура-ответа)
4. [Rate Limiting](#4-rate-limiting)
5. [Эндпоинты /rooms](#5-эндпоинты-rooms)
6. [Эндпоинты /game](#6-эндпоинты-game)
7. [Эндпоинты /players](#7-эндпоинты-players)
8. [Эндпоинты /cards](#8-эндпоинты-cards)
9. [Эндпоинты /actions](#9-эндпоинты-actions)
10. [Эндпоинты /scenarios (Редактор таймлайна)](#10-эндпоинты-scenarios-редактор-таймлайна)
11. [WebSocket /ws](#11-websocket-ws)

---

## 1. Принципы API

### 1.1 Разделение чтения и записи (CQRS-lite)

API построен по принципу строгого разделения:

- **Все GET-эндпоинты** — только чтение состояния из MongoDB. Никаких side effects.
- **Единственный мутирующий эндпоинт** — `POST /actions`. Он не изменяет состояние напрямую, а кладёт задачу в Redis Queue. Реальное изменение происходит в Worker.

```
Client → GET /game/state       → читает MongoDB → возвращает данные
Client → POST /actions         → кладёт задачу в Redis → 202 Accepted
                                       ↓
                              Worker обрабатывает задачу
                                       ↓
                              MongoDB обновляется
                                       ↓
                              WebSocket emit → клиенты обновляют UI
```

### 1.2 Versioning

Все эндпоинты имеют префикс `/api/v1/`.

### 1.3 Content-Type

Все запросы и ответы — `application/json; charset=utf-8`.

### 1.4 Идемпотентность действий

Каждый POST /actions принимает `clientSequence` — уникальный номер запроса от клиента. Worker использует его для защиты от дублирования.

---

## 2. Аутентификация

### 2.1 Схема

BUNKER-disco использует двухуровневую аутентификацию без аккаунтов:

| Уровень | Как получить | Где используется |
|---------|-------------|-----------------|
| `room_code` | 5-символьный код комнаты | `X-Room-Code` header |
| `player_token` | JWT, выдаётся при входе в комнату | `Authorization: Bearer <token>` |

### 2.2 Получение токена

```http
POST /api/v1/rooms/:code/join
Body: { "nickname": "Иван" }

Response:
{
  "playerToken": "eyJhbGc...",
  "playerId": "64f...",
  "expiresIn": 86400
}
```

### 2.3 JWT Payload

```json
{
  "playerId": "64f3a2b1c5e6d7f8a9b0c1d2",
  "roomId": "64f3a2b1c5e6d7f8a9b0c1d3",
  "roomCode": "ABCD1",
  "isHost": false,
  "iat": 1700000000,
  "exp": 1700086400
}
```

### 2.4 Заголовки запроса

```http
Authorization: Bearer eyJhbGc...
X-Room-Code: ABCD1
Content-Type: application/json
```

### 2.5 Ошибки аутентификации

| HTTP код | Код ошибки | Описание |
|----------|-----------|----------|
| 401 | `MISSING_TOKEN` | Токен не передан |
| 401 | `INVALID_TOKEN` | Токен невалиден или истёк |
| 403 | `WRONG_ROOM` | Токен выдан для другой комнаты |
| 403 | `PLAYER_ELIMINATED` | Игрок изгнан, действие недоступно |
| 403 | `HOST_ONLY` | Действие доступно только хосту |

---

## 3. Структура ответа

### 3.1 Успешный ответ

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_uuid",
    "timestamp": "2026-11-14T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### 3.2 Ответ на POST /actions (202 Accepted)

```json
{
  "success": true,
  "data": {
    "taskId": "task_uuid",
    "status": "queued",
    "estimatedProcessingMs": 50
  },
  "meta": { ... }
}
```

### 3.3 Ошибка

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PHASE",
    "message": "Это действие доступно только в Фазе 1",
    "details": {
      "currentPhase": "phase2",
      "requiredPhase": "phase1"
    }
  },
  "meta": { ... }
}
```

### 3.4 Коды ошибок

| Код | HTTP | Описание |
|-----|------|----------|
| `ROOM_NOT_FOUND` | 404 | Комната не найдена |
| `ROOM_FULL` | 409 | Комната переполнена |
| `ROOM_STARTED` | 409 | Игра уже началась |
| `PLAYER_NOT_FOUND` | 404 | Игрок не найден |
| `INVALID_PHASE` | 422 | Неверная фаза для действия |
| `NOT_YOUR_TURN` | 422 | Не ваш ход |
| `ABILITY_ON_COOLDOWN` | 422 | Способность на кулдауне |
| `INSUFFICIENT_RESOURCES` | 422 | Недостаточно ресурсов |
| `INVALID_ACTION` | 422 | Неизвестный тип действия |
| `QUEUE_FULL` | 503 | Очередь переполнена |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |

---

## 4. Rate Limiting

### 4.1 Лимиты по типу

| Эндпоинт / группа | Лимит | Окно |
|--------------------|-------|------|
| `GET /api/v1/*` | 120 req | 60 сек |
| `POST /api/v1/actions` | 10 req | 10 сек |
| `POST /api/v1/rooms` | 5 req | 60 сек |
| `POST /api/v1/rooms/:code/join` | 10 req | 60 сек |

### 4.2 Заголовки ответа

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1700000060
Retry-After: 5    (только при 429)
```

### 4.3 Превышение лимита

```http
HTTP 429 Too Many Requests

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Слишком много запросов. Попробуйте через 5 секунд.",
    "retryAfter": 5
  }
}
```

---

## 5. Эндпоинты /rooms

### GET /api/v1/rooms/:code

Получить информацию о комнате по коду.

**Параметры пути:**
- `code` — 5-символьный код комнаты

**Аутентификация:** Не требуется (публичная информация)

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "roomId": "64f3a2b1c5e6d7f8a9b0c1d3",
    "code": "ABCD1",
    "status": "lobby",
    "playerCount": 4,
    "maxPlayers": 8,
    "settings": {
      "bunkerCapacity": 4,
      "phase2Days": 30,
      "rerollLimit": 1,
      "enableSuperpowers": false,
      "enablePhobias": true,
      "enableCharacter": true,
      "language": "ru"
    },
    "createdAt": "2026-11-14T09:00:00Z"
  }
}
```

---

### POST /api/v1/rooms

Создать новую комнату. Создатель становится хостом (подключает большой ТВ-экран).

**Аутентификация:** Не требуется

**Тело запроса:**
```json
{
  "nickname": "Алексей",
  "settings": {
    "maxPlayers": 12,
    "bunkerCapacity": 6,
    "phase2Days": 30,
    "revealMode": "sequential",
    "timelineMode": "custom",
    "scenarioId": "nuclear_winter_2026",
    "timeline": [
      { "day": 5, "eventId": "FILTER_CLOG", "title": "Засор фильтра ФВУ" },
      { "day": 12, "eventId": "RAIDER_ATTACK", "title": "Набег рейдеров" },
      { "day": 21, "eventId": "FLU_OUTBREAK", "title": "Мутировавший вирус" }
    ],
    "rerollLimit": 1,
    "enableSuperpowers": false,
    "enablePhobias": true,
    "enableCharacter": true,
    "language": "ru"
  }
}
```

**Описание полей `settings`:**
- `maxPlayers` (number, 4–20, default: 8) — максимальное количество игроков в лобби
- `bunkerCapacity` (number, 2–10, default: `Math.floor(maxPlayers / 2)`) — вместимость бункера по официальной формуле $\lfloor N / 2 \rfloor$
- `phase2Days` (number, default: 30) — количество дней в фазе Выживания
- `revealMode` ("sequential" | "free", default: "sequential") — режим раскрытия карт
- `timelineMode` ("procedural" | "custom", default: "procedural") — режим генерации цепочки событий (случайный или кастомный таймлайн)
- `scenarioId` (string, optional) — идентификатор готового шаблона сценария
- `timeline` (array of objects, optional) — подневный массив запланированных событий `{ day: number, eventId: string, customPayload?: object }`
- `rerollLimit` (number, default: 1, допустимые: 0, 1, 2, 3, 5, 999) — лимит перерандомов персонажа (маллиганов) для каждого игрока
- `enableSuperpowers` (boolean, default: false) — включение карт колоды «Суперсила» (дополнение «Поколение Альфа»)
- `enablePhobias` (boolean, default: true) — включение карт колоды «Фобия» (дополнение «Поколение Альфа»)
- `enableCharacter` (boolean, default: true) — включение карт колоды «Характер» (дополнение «Поколение Альфа»)
- `language` ("ru" | "en", default: "ru") — язык локализации

**Пример ответа (201 Created):**
```json
{
  "success": true,
  "data": {
    "roomId": "64f3a2b1c5e6d7f8a9b0c1d3",
    "code": "ABCD1",
    "playerToken": "eyJhbGc...",
    "playerId": "64f3a2b1c5e6d7f8a9b0c1d2",
    "isHost": true
  }
}
```

---

### POST /api/v1/rooms/:code/join

Присоединиться к комнате.

**Тело запроса:**
```json
{ "nickname": "Мария" }
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "playerToken": "eyJhbGc...",
    "playerId": "64f...",
    "roomId": "64f...",
    "currentState": { "status": "lobby", "players": [...] }
  }
}
```

---

### GET /api/v1/rooms/:code/players

Список игроков в комнате.

**Аутентификация:** Требуется

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "playerId": "64f...",
        "nickname": "Алексей",
        "isHost": true,
        "isConnected": true,
        "isEliminated": false,
        "avatarSeed": "abc123"
      }
    ],
    "total": 4
  }
}
```

---

### DELETE /api/v1/rooms/:code

Закрыть комнату (только хост).

**Аутентификация:** Требуется + Host only

**Пример ответа:**
```json
{ "success": true, "data": { "closed": true } }
```

---

### GET /api/v1/rooms/:code/settings

Получить настройки комнаты.

**Аутентификация:** Требуется

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "maxPlayers": 8,
      "bunkerCapacity": 4,
      "phase2Days": 30,
      "revealMode": "sequential",
      "rerollLimit": 1,
      "enableSuperpowers": false,
      "enablePhobias": true,
      "enableCharacter": true,
      "language": "ru"
    }
  }
}
```

---

### PATCH /api/v1/rooms/:code/settings

Обновить настройки комнаты (доступно только хосту до старта игры в лобби).

**Аутентификация:** Требуется + Host only

**Тело запроса (частичное обновление):**
```json
{
  "settings": {
    "bunkerCapacity": 5,
    "rerollLimit": 2,
    "timelineMode": "custom",
    "timeline": [
      { "day": 7, "eventId": "WATER_CONTAMINATION" },
      { "day": 15, "eventId": "GENERATOR_FAILURE" }
    ],
    "enableSuperpowers": true,
    "enablePhobias": true,
    "enableCharacter": true
  }
}
```

**Пример ответа (200 OK):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "maxPlayers": 10,
      "bunkerCapacity": 5,
      "phase2Days": 30,
      "revealMode": "sequential",
      "timelineMode": "custom",
      "timeline": [
        { "day": 7, "eventId": "WATER_CONTAMINATION" },
        { "day": 15, "eventId": "GENERATOR_FAILURE" }
      ],
      "rerollLimit": 2,
      "enableSuperpowers": true,
      "enablePhobias": true,
      "enableCharacter": true,
      "language": "ru"
    }
  }
}
```

---

### GET /api/v1/rooms/:code/logs

Получить лог действий комнаты (для истории).

**Query params:**
- `limit` (default: 50, max: 200)
- `offset` (default: 0)
- `phase` — `"phase1"` | `"phase2"` | `"all"`

**Аутентификация:** Требуется

---

## 6. Эндпоинты /game

### GET /api/v1/game/:roomId/state

Полное состояние игры. Основной эндпоинт для BigScreen.

**Аутентификация:** Требуется

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "phase": "phase1",
    "phase1": {
      "currentRound": 2,
      "currentPlayerTurnId": "64f...",
      "votingState": { "isActive": false },
      "eliminatedPlayers": ["64f..."]
    },
    "players": [
      {
        "playerId": "64f...",
        "nickname": "Алексей",
        "isEliminated": false,
        "revealedCards": ["profession", "biology"]
      }
    ],
    "updatedAt": "2026-11-14T10:30:00Z"
  }
}
```

---

### GET /api/v1/game/:roomId/phase1

Состояние Фазы 1 (Отбор).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "currentRound": 3,
    "totalRounds": 8,
    "currentPlayerTurnId": "64f...",
    "revealOrder": ["64f_1", "64f_2", "64f_3"],
    "votingState": {
      "isActive": true,
      "nomineeId": "64f_2",
      "votesSubmitted": 3,
      "totalVoters": 5,
      "endsAt": "2026-11-14T10:35:00Z"
    },
    "eliminatedPlayers": []
  }
}
```

---

### GET /api/v1/game/:roomId/phase2

Состояние Фазы 2 (Выживание).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "currentDay": 7,
    "totalDays": 30,
    "resources": {
      "food": 65,
      "water": 48,
      "air": 90,
      "medicine": 20,
      "morale": 55,
      "power": 80
    },
    "bunkerRooms": [
      {
        "type": "food_storage",
        "level": 2,
        "isOperational": true,
        "assignedPlayers": ["64f_1"]
      }
    ],
    "activeEvents": [
      {
        "eventId": "WATER_LEAK",
        "name": "Утечка воды",
        "turnsRemaining": 2
      }
    ]
  }
}
```

---

### GET /api/v1/game/:roomId/bunker

Состояние воксельного бункера (для рендера BigScreen).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "type": "corridor",
        "position": { "x": 0, "y": 0, "z": 0 },
        "connections": ["food_storage", "workshop"],
        "state": "normal"
      },
      {
        "type": "food_storage",
        "position": { "x": 2, "y": 0, "z": 0 },
        "state": "damaged",
        "damageLevel": 0.3
      }
    ],
    "characters": [
      {
        "playerId": "64f...",
        "position": { "x": 2, "y": 0, "z": 0 },
        "animation": "idle"
      }
    ]
  }
}
```

---

### GET /api/v1/game/:roomId/events

История событий игры.

**Query params:**
- `day` — фильтр по дню (Фаза 2)
- `type` — `"resource"` | `"threat"` | `"social"` | `"discovery"`
- `limit` (default: 20)

---

### GET /api/v1/game/:roomId/day-log/:day

Лог конкретного игрового дня (Фаза 2).

---

### GET /api/v1/game/:roomId/results

Финальные результаты игры (доступно после завершения).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "outcome": "survived",
    "survivors": ["64f_1", "64f_3"],
    "day": 30,
    "stats": {
      "totalEvents": 42,
      "craftsCompleted": 7,
      "questsCompleted": 3,
      "resourcesConsumed": { "food": 450, "water": 380 }
    }
  }
}
```

---

## 7. Эндпоинты /players

### GET /api/v1/players/me

Данные текущего игрока (карточки, статы, инвентарь).

**Аутентификация:** Требуется

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "playerId": "64f...",
    "nickname": "Мария",
    "isHost": false,
    "isEliminated": false,
    "isInBunker": false,
    "cards": {
      "profession": {
        "cardId": "prof_doctor",
        "isRevealed": true,
        "data": {
          "name": { "ru": "Врач", "en": "Doctor" },
          "passive": "...",
          "activeAbility": { "name": "Экстренная помощь", "cooldown": 2 }
        }
      },
      "biology": { "cardId": "bio_25_30", "isRevealed": false, "data": null },
      "health": { "cardId": "health_asthma", "isRevealed": true, "data": { ... } },
      "phobia": { "cardId": "phobia_dark", "isRevealed": false, "data": null },
      "hobby": { "cardId": "hobby_cooking", "isRevealed": false, "data": null },
      "baggage": { "cardId": "bag_firstaid", "isRevealed": false, "data": null },
      "fact": { "cardId": "fact_01", "isRevealed": false, "data": null }
    },
    "abilities": [
      { "abilityId": "emergency_care", "cooldownRemaining": 0, "usesRemaining": -1 }
    ],
    "stats": { "health": 85, "morale": 70, "energy": 60 },
    "inventory": []
  }
}
```

---

### GET /api/v1/players/:playerId

Публичные данные другого игрока (только открытые карточки).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "playerId": "64f...",
    "nickname": "Алексей",
    "avatarSeed": "abc123",
    "isEliminated": false,
    "revealedCards": {
      "profession": { "name": "Инженер", "category": "Инженерия" },
      "biology": null,
      "health": { "name": "Астма (лёгкая форма)" }
    }
  }
}
```

---

### GET /api/v1/players/me/inventory

Инвентарь текущего игрока (Фаза 2).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "itemId": "item_bandage", "name": "Бинт", "quantity": 3, "weight": 0.1 },
      { "itemId": "item_tools", "name": "Набор инструментов", "quantity": 1, "weight": 2.5 }
    ],
    "totalWeight": 2.8,
    "maxWeight": 10.0
  }
}
```

---

### GET /api/v1/players/me/quests

Скрытые квесты текущего игрока.

---

### GET /api/v1/players/me/stats

Статы персонажа (здоровье, мораль, энергия).

---

### GET /api/v1/players/:roomId/leaderboard

Таблица результатов по комнате (после окончания игры).

---

### POST /api/v1/players/reroll

Перерандомить персонажа (Маллиган). Доступно в лобби и перед стартом первого раунда, пока не исчерпан `rerollLimit`.

**Аутентификация:** Требуется (`Authorization: Bearer <playerToken>`)

**Тело запроса:**
```json
{
  "clientSequence": 2
}
```

**Процесс обработки:**
1. API валидирует текущую фазу (только `lobby` или `briefing` перед дебатами).
2. Проверяется остаток попыток игрока (`remainingRerolls > 0` или `rerollLimit == 999`).
3. Действие отправляется в очередь Worker (`BullMQ / Redis`).
4. Worker генерирует новый набор карточек, сбрасывает раскрытые статусы, декрементирует счетчик `remainingRerolls`.
5. По WebSocket клиенту отправляется обновленная рука и событие `player:rerolled`.

**Пример ответа (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "taskId": "task_reroll_98fa21",
    "status": "queued",
    "remainingRerolls": 1
  }
}
```

---

## 8. Эндпоинты /cards

### GET /api/v1/cards

Список всех карточек в пуле.

**Query params:**
- `type` — `"profession"` | `"biology"` | `"health"` | `"phobia"` | `"hobby"` | `"baggage"` | `"fact"`
- `tags` — `"BASE"` | `"NEW"` | `"RARE"`
- `active` — `true` | `false`
- `limit`, `offset`

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "cardId": "prof_doctor",
        "type": "profession",
        "tags": ["BASE"],
        "name": { "ru": "Врач", "en": "Doctor" },
        "description": { "ru": "Медик общей практики..." },
        "professionData": {
          "category": "Медицина",
          "passive": "+15 к эффективности медикаментов",
          "activeAbility": {
            "name": "Экстренная помощь",
            "description": "Восстанавливает 30 HP игроку",
            "cooldown": 2,
            "actionPoints": 1
          }
        }
      }
    ],
    "total": 240,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET /api/v1/cards/:cardId

Получить конкретную карточку по ID.

---

### GET /api/v1/cards/professions

Все профессии (shortcut).

---

### GET /api/v1/cards/craft-recipes

Все рецепты крафта (Фаза 2).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "recipes": [
      {
        "recipeId": "recipe_medkit",
        "resultItem": "item_medkit",
        "resultName": "Аптечка",
        "ingredients": [
          { "itemId": "item_bandage", "quantity": 2 },
          { "itemId": "item_antiseptic", "quantity": 1 }
        ],
        "requiredProfession": "prof_doctor",
        "turnsRequired": 1
      }
    ]
  }
}
```

---

### GET /api/v1/cards/events-catalog

Каталог всех событий (шаблоны, без привязки к игре).

**Query params:**
- `phase` — `"phase1"` | `"phase2"`
- `category` — `"resource"` | `"threat"` | `"social"` | `"discovery"`
- `rarity`

---

## 9. Эндпоинты /actions

### POST /api/v1/actions

**Единственный мутирующий эндпоинт.** Принимает действие, кладёт задачу в Redis.

**Аутентификация:** Требуется

**Общая структура тела:**
```json
{
  "type": "ACTION_TYPE",
  "clientSequence": 42,
  "payload": { ... }
}
```

**Ответ (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "taskId": "task_uuid",
    "status": "queued",
    "type": "ACTION_TYPE",
    "estimatedProcessingMs": 50
  }
}
```

---

### Типы действий

#### `START_GAME` — запустить игру (только хост)
```json
{
  "type": "START_GAME",
  "clientSequence": 1,
  "payload": {}
}
```

---

#### `REVEAL_CARD` — открыть карточку (Фаза 1, ваш ход)
```json
{
  "type": "REVEAL_CARD",
  "clientSequence": 5,
  "payload": {
    "cardType": "profession"
  }
}
```

---

#### `CAST_VOTE` — проголосовать за изгнание (Фаза 1)
```json
{
  "type": "CAST_VOTE",
  "clientSequence": 8,
  "payload": {
    "nomineeId": "64f...",
    "vote": true
  }
}
```

---

#### `NOMINATE_PLAYER` — выдвинуть игрока на голосование (Фаза 1)
```json
{
  "type": "NOMINATE_PLAYER",
  "clientSequence": 7,
  "payload": {
    "targetPlayerId": "64f..."
  }
}
```

---

#### `USE_ABILITY` — использовать активную способность профессии
```json
{
  "type": "USE_ABILITY",
  "clientSequence": 10,
  "payload": {
    "abilityId": "emergency_care",
    "targetPlayerId": "64f..."
  }
}
```

---

#### `ASSIGN_ROOM` — назначить игрока в комнату бункера (Фаза 2)
```json
{
  "type": "ASSIGN_ROOM",
  "clientSequence": 15,
  "payload": {
    "roomType": "food_storage",
    "playerId": "64f..."
  }
}
```

---

#### `START_CRAFT` — начать крафт предмета (Фаза 2)
```json
{
  "type": "START_CRAFT",
  "clientSequence": 20,
  "payload": {
    "recipeId": "recipe_medkit"
  }
}
```

---

#### `RESOLVE_EVENT` — выбрать вариант ответа на событие (Фаза 2)
```json
{
  "type": "RESOLVE_EVENT",
  "clientSequence": 25,
  "payload": {
    "eventInstanceId": "64f...",
    "choiceId": "choice_repair"
  }
}
```

---

#### `TRADE_ITEM` — передать предмет другому игроку (Фаза 2)
```json
{
  "type": "TRADE_ITEM",
  "clientSequence": 30,
  "payload": {
    "targetPlayerId": "64f...",
    "itemId": "item_bandage",
    "quantity": 1
  }
}
```

---

#### `UPDATE_ROOM_SETTINGS` — изменить настройки комнаты (только хост, только лобби)
```json
{
  "type": "UPDATE_ROOM_SETTINGS",
  "clientSequence": 2,
  "payload": {
    "maxPlayers": 10,
    "phase2Days": 20,
    "bunkerCapacity": 5
  }
}
```

---

#### `KICK_PLAYER` — кикнуть игрока из лобби (только хост)
```json
{
  "type": "KICK_PLAYER",
  "clientSequence": 3,
  "payload": { "targetPlayerId": "64f..." }
}
```

---

#### `END_TURN` — завершить ход (Фаза 1, ваш ход)
```json
{
  "type": "END_TURN",
  "clientSequence": 12,
  "payload": {}
}
```

---

#### `SKIP_VOTE` — пропустить голосование (Фаза 1)
```json
{
  "type": "SKIP_VOTE",
  "clientSequence": 9,
  "payload": {}
}
```

---

#### `UPGRADE_ROOM` — улучшить комнату бункера (Фаза 2)
```json
{
  "type": "UPGRADE_ROOM",
  "clientSequence": 40,
  "payload": {
    "roomType": "workshop",
    "cost": { "food": 10, "power": 20 }
  }
}
```

---

#### `PLAYER_REROLL` — полный перерандом персонажа (Маллиган)
Доступно в лобби или в фазе брифинга перед началом игры, если `remainingRerolls > 0`.
```json
{
  "type": "PLAYER_REROLL",
  "clientSequence": 2,
  "payload": {}
}
```

---

### GET /api/v1/actions/:taskId/status

Проверить статус задачи (для подтверждения обработки).

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "taskId": "task_uuid",
    "status": "completed",
    "processedAt": "2026-11-14T10:00:01Z",
    "result": { "voteResult": "eliminated" }
  }
}
```

Возможные статусы: `"queued"` | `"processing"` | `"completed"` | `"failed"` | `"retrying"`

---

## 10. Эндпоинты /scenarios (Редактор таймлайна)

Эндпоинты для управления режимом сценариев (Scenario Builder & Custom Timeline Mode). Позволяют выбирать готовые сюжетные пресеты либо проектировать авторские подневные цепочки катастроф, угроз и стартовых поломок бункера.

### GET /api/v1/scenarios

Получить список готовых сценариев и пользовательских шаблонов таймлайна.

**Аутентификация:** Не требуется

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "nuclear_winter_2026",
        "title": "Ядерная зима 2026",
        "description": "После масштабного обмена ударами температура на поверхности падает до -40°C. Критический дефицит топлива и замерзание гидрантов.",
        "difficulty": "hard",
        "catastropheId": "CATA_NUCLEAR_WINTER",
        "bunkerType": "military",
        "durationDays": 30,
        "isOfficial": true
      },
      {
        "id": "biohazard_outbreak",
        "title": "Утечка патогена «Штамм-X»",
        "description": "Вирус высокой контагиозности. В бункере заперт нулевой пациент. Высокий расход медикаментов и строгий карантинный режим.",
        "difficulty": "nightmare",
        "catastropheId": "CATA_BIOHAZARD",
        "bunkerType": "science_lab",
        "durationDays": 30,
        "isOfficial": true
      }
    ],
    "total": 2
  }
}
```

---

### GET /api/v1/scenarios/:id

Получить полную конфигурацию сценария с подневным таймлайном событий.

**Аутентификация:** Не требуется

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": "nuclear_winter_2026",
    "title": "Ядерная зима 2026",
    "catastrophe": {
      "id": "CATA_NUCLEAR_WINTER",
      "name": "Ядерная зима",
      "specialRule": "Расход энергии удвоен из-за экстремального мороза."
    },
    "bunker": {
      "type": "military",
      "initialDefects": ["DEF-01", "DEF-06"],
      "resources": {
        "food": 25,
        "water": 20,
        "power": 40,
        "medicine": 6,
        "tools": 4,
        "morale": 50
      }
    },
    "timeline": [
      {
        "day": 3,
        "eventId": "DEFROST_PIPE_BURST",
        "title": "Прорыв замерзшей трубы водоснабжения",
        "severity": "medium"
      },
      {
        "day": 8,
        "eventId": "FROSTBITE_SQUAD",
        "title": "Обморожение дежурных",
        "severity": "high"
      },
      {
        "day": 15,
        "eventId": "RAIDER_SIEGE",
        "title": "Рейдеры пытаются срезать гермошлюз горелками",
        "severity": "critical"
      },
      {
        "day": 24,
        "eventId": "BLIZZARD_SENSOR_LOSS",
        "title": "Буран сносит внешние датчики радиомачты",
        "severity": "medium"
      }
    ]
  }
}
```

---

### POST /api/v1/scenarios

Создать авторский сценарий / пользовательский таймлайн.

**Аутентификация:** Требуется

**Тело запроса:**
```json
{
  "title": "Осада кибер-культистов",
  "description": "Техногенный апокалипсис с серией кибератак на ИИ-ядро бункера.",
  "difficulty": "custom",
  "catastropheId": "CATA_AI_UPRISING",
  "bunkerType": "corporate",
  "initialDefects": ["DEF-04"],
  "initialResources": {
    "food": 35,
    "water": 30,
    "power": 50,
    "medicine": 10,
    "tools": 3,
    "morale": 65
  },
  "timeline": [
    {
      "day": 5,
      "eventId": "AI_FIREWALL_BREACH",
      "title": "Взлом вспомогательного фаервола",
      "customPayload": { "targetRoom": "server_room" }
    },
    {
      "day": 14,
      "eventId": "BLACKOUT_SABOTAGE",
      "title": "Аварийное обесточивание гидропоники"
    },
    {
      "day": 26,
      "eventId": "SOS_ORBITAL_DROP",
      "title": "Сброс гуманитарного контейнера с орбиты"
    }
  ]
}
```

**Пример ответа (201 Created):**
```json
{
  "success": true,
  "data": {
    "scenarioId": "scen_custom_78a1bc92",
    "title": "Осада кибер-культистов",
    "createdAt": "2026-11-14T11:00:00Z"
  }
}
```

---

## 11. WebSocket /ws

### 10.1 Подключение

```
ws://host/ws?roomCode=ABCD1&playerToken=eyJhbGc...

// или Socket.io
const socket = io('/game', {
  auth: { token: playerToken, roomCode: 'ABCD1' }
});
```

### 10.2 События клиент → сервер

| Событие | Payload | Описание |
|---------|---------|----------|
| `join_room` | `{ roomCode, playerToken }` | Войти в комнату |
| `leave_room` | `{}` | Выйти из комнаты |
| `ping` | `{ timestamp }` | Heartbeat |
| `request_full_state` | `{}` | Запросить полный стейт (реконнект) |

### 10.3 Системные события сервер → клиент

| Событие | Payload | Описание |
|---------|---------|----------|
| `server_hello` | `{ version, serverTime }` | При подключении |
| `room_joined` | `{ roomId, playerId, fullState }` | Успешный вход |
| `join_error` | `{ code, message }` | Ошибка входа |
| `reconnect_state` | `{ fullState }` | Полный стейт при реконнекте |
| `player_connected` | `{ playerId, nickname }` | Игрок вошёл |
| `player_disconnected` | `{ playerId }` | Игрок вышел |
| `room_closed` | `{ reason }` | Комната закрыта |
| `error` | `{ code, message }` | Общая ошибка |

### 10.4 Лобби

| Событие | Payload |
|---------|---------|
| `lobby_update` | `{ players[], settings, playerCount }` |
| `host_changed` | `{ newHostId, newHostNickname }` |
| `player_kicked` | `{ playerId }` |
| `settings_updated` | `{ settings }` |
| `game_starting` | `{ countdown: 3 }` |
| `cards_dealt` | `{ cards: { profession, biology, ... } }` *только игроку* |
| `player_rerolled` | `{ playerId, remainingRerolls, cards? }` *новые карты только игроку; остальным — факт реролла* |

### 10.5 Фаза 1

| Событие | Payload | Кому |
|---------|---------|------|
| `phase1_start` | `{ revealOrder[], round: 1 }` | Room |
| `turn_start` | `{ activePlayerId, timeLimit, cardsToReveal }` | Room |
| `your_turn` | `{ cardsLeft, timeLimit }` | Player only |
| `card_revealed` | `{ playerId, cardType, cardData }` | Room |
| `ability_used` | `{ playerId, abilityId, abilityName, targetId, effect }` | Room |
| `ability_blocked` | `{ playerId, abilityId, reason }` | Player |
| `nominate_vote` | `{ nomineeId, nomineeNickname, nominatorId }` | Room |
| `vote_started` | `{ nomineeId, timeLimit, voterIds[] }` | Room |
| `vote_cast` | `{ voterId, hasVoted, totalVoted, totalVoters }` | Room |
| `vote_result` | `{ nomineeId, votesFor, votesAgainst, eliminated, tieBreak }` | Room |
| `player_eliminated` | `{ playerId, nickname, finalCards }` | Room |
| `turn_timeout` | `{ playerId }` | Room |
| `round_complete` | `{ round, nextPlayerId, eliminatedCount }` | Room |
| `phase1_complete` | `{ inBunker[], eliminated[], transitionIn: 5 }` | Room |

### 10.6 Фаза 2

| Событие | Payload | Кому |
|---------|---------|------|
| `phase2_start` | `{ bunkerState, players[], day: 1, resources }` | Room |
| `day_start` | `{ day, resources, assignmentRequired }` | Room |
| `resource_update` | `{ food, water, air, medicine, morale, power, delta }` | Room |
| `assignment_requested` | `{ timeLimit, availableRooms[] }` | Player |
| `assignment_confirmed` | `{ playerId, roomType }` | Room |
| `event_triggered` | `{ eventId, name, description, category }` | Room |
| `event_choice_required` | `{ eventInstanceId, event, choices[], timeLimit }` | Player/Room |
| `event_timeout` | `{ eventInstanceId, defaultChoice }` | Room |
| `event_resolved` | `{ eventInstanceId, choiceId, consequences, effects }` | Room |
| `craft_started` | `{ playerId, recipeId, turnsRequired, estimatedDay }` | Room |
| `craft_complete` | `{ playerId, recipeId, item }` | Room |
| `craft_failed` | `{ playerId, recipeId, reason }` | Player |
| `item_traded` | `{ fromId, toId, itemId, quantity }` | Room |
| `quest_discovered` | `{ quest }` | Player only |
| `quest_updated` | `{ questId, progress, completed }` | Player only |
| `quest_complete` | `{ questId, reward }` | Player only |
| `room_assigned` | `{ playerId, roomType }` | Room |
| `room_damaged` | `{ roomType, damage, isDestroyed }` | Room |
| `room_repaired` | `{ roomType, repairedBy }` | Room |
| `room_upgraded` | `{ roomType, newLevel }` | Room |
| `threat_incoming` | `{ threatId, name, turnsUntilImpact, severity }` | Room |
| `threat_resolved` | `{ threatId, outcome }` | Room |
| `player_stat_update` | `{ health, morale, energy, delta }` | Player only |
| `player_died` | `{ playerId, cause, day }` | Room |
| `ability_cooldown_update` | `{ abilityId, cooldownRemaining }` | Player |
| `day_complete` | `{ day, summary, nextDayIn }` | Room |
| `voxel_animation` | `{ type, position, duration, params }` | BigScreen |
| `scene_update` | `{ voxelChanges[], cameraTarget }` | BigScreen |
| `character_move` | `{ playerId, fromRoom, toRoom, duration }` | BigScreen |
| `ambient_change` | `{ atmosphere, lighting, mood }` | BigScreen |
| `game_over` | `{ result, survivors[], stats, day }` | Room |

### 10.7 Namespace и комнаты

```javascript
// BigScreen подписывается на всё
socket.join(`room:${roomId}:bigscreen`);

// Игрок подписывается на общее + личное
socket.join(`room:${roomId}`);
socket.join(`room:${roomId}:player:${playerId}`);

// Server emit helpers:
io.to(`room:${roomId}`).emit(event, data);             // всем в комнате
io.to(`room:${roomId}:bigscreen`).emit(event, data);   // только BigScreen
io.to(`room:${roomId}:player:${playerId}`).emit(...);  // только игроку
```

---

## Сводная таблица эндпоинтов

| # | Метод | Путь | Auth | Описание |
|---|-------|------|------|----------|
| 1 | GET | `/api/v1/rooms/:code` | Нет | Инфо о комнате |
| 2 | POST | `/api/v1/rooms` | Нет | Создать комнату |
| 3 | POST | `/api/v1/rooms/:code/join` | Нет | Войти в комнату |
| 4 | DELETE | `/api/v1/rooms/:code` | Хост | Закрыть комнату |
| 5 | GET | `/api/v1/rooms/:code/players` | Да | Список игроков |
| 6 | GET | `/api/v1/rooms/:code/settings` | Да | Настройки |
| 7 | GET | `/api/v1/rooms/:code/logs` | Да | Лог комнаты |
| 8 | GET | `/api/v1/game/:roomId/state` | Да | Полный стейт игры |
| 9 | GET | `/api/v1/game/:roomId/phase1` | Да | Стейт Фазы 1 |
| 10 | GET | `/api/v1/game/:roomId/phase2` | Да | Стейт Фазы 2 |
| 11 | GET | `/api/v1/game/:roomId/bunker` | Да | Воксельный бункер |
| 12 | GET | `/api/v1/game/:roomId/events` | Да | История событий |
| 13 | GET | `/api/v1/game/:roomId/day-log/:day` | Да | Лог дня |
| 14 | GET | `/api/v1/game/:roomId/results` | Да | Итоги игры |
| 15 | GET | `/api/v1/players/me` | Да | Мои данные + карточки |
| 16 | GET | `/api/v1/players/:playerId` | Да | Данные игрока |
| 17 | GET | `/api/v1/players/me/inventory` | Да | Мой инвентарь |
| 18 | GET | `/api/v1/players/me/quests` | Да | Мои квесты |
| 19 | GET | `/api/v1/players/me/stats` | Да | Мои статы |
| 20 | GET | `/api/v1/players/:roomId/leaderboard` | Да | Таблица лидеров |
| 21 | GET | `/api/v1/cards` | Нет | Все карточки (пагинация) |
| 22 | GET | `/api/v1/cards/:cardId` | Нет | Одна карточка |
| 23 | GET | `/api/v1/cards/professions` | Нет | Все профессии |
| 24 | GET | `/api/v1/cards/craft-recipes` | Нет | Рецепты крафта |
| 25 | GET | `/api/v1/cards/events-catalog` | Нет | Каталог событий |
| 26 | POST | `/api/v1/actions` | Да | Действие (все мутации) |
| 27 | GET | `/api/v1/actions/:taskId/status` | Да | Статус задачи |
| 28 | GET | `/api/v1/health` | Нет | Health check сервера |
| 29 | GET | `/api/v1/version` | Нет | Версия API |
| 30 | WS | `/ws` | token в query | WebSocket подключение |
| 31 | GET | `/api/v1/game/:roomId/voting` | Да | Текущее голосование |
| 32 | GET | `/api/v1/players/me/abilities` | Да | Мои способности + KD |
