// docker/mongo/init-mongo.js
db = db.getSiblingDB('bunker_disco');

// Индекс для мгновенного поиска комнаты по 5-значному коду
db.rooms.createIndex({ "code": 1 }, { unique: true });

// TTL индекс: автоудаление завершённых комнат через 24 часа
db.rooms.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// Индексы для игроков
db.players.createIndex({ "roomId": 1, "nickname": 1 }, { unique: true });
db.players.createIndex({ "token": 1 });

// Индексы состояния игры
db.game_state.createIndex({ "roomId": 1 }, { unique: true });

// Индекс карточек по строковому идентификатору
db.cards.createIndex({ "cardId": 1 }, { unique: true });
db.cards.createIndex({ "type": 1, "tags": 1 });

print(">>> [MongoDB Init] BUNKER-disco indexes initialized successfully.");
