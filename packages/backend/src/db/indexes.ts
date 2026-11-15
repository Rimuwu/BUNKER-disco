import { Db } from 'mongodb';

export interface IndexCreationResult {
  collection: string;
  indexes: string[];
}

export async function ensureAllIndexes(db: Db): Promise<IndexCreationResult[]> {
  const results: IndexCreationResult[] = [];

  // 1. rooms collection
  const roomsColl = db.collection('rooms');
  const roomIndex1 = await roomsColl.createIndex({ code: 1 }, { unique: true });
  const roomIndex2 = await roomsColl.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  results.push({ collection: 'rooms', indexes: [roomIndex1, roomIndex2] });

  // 2. players collection
  const playersColl = db.collection('players');
  const playerIndex1 = await playersColl.createIndex({ roomId: 1, nickname: 1 }, { unique: true });
  const playerIndex2 = await playersColl.createIndex({ token: 1 });
  const playerIndex3 = await playersColl.createIndex({ roomId: 1 });
  results.push({ collection: 'players', indexes: [playerIndex1, playerIndex2, playerIndex3] });

  // 3. game_states collection
  const gameStatesColl = db.collection('game_states');
  const gsIndex1 = await gameStatesColl.createIndex({ roomId: 1 }, { unique: true });
  results.push({ collection: 'game_states', indexes: [gsIndex1] });

  // 4. events collection
  const eventsColl = db.collection('events');
  const evtIndex1 = await eventsColl.createIndex({ 'instance.roomId': 1 });
  const evtIndex2 = await eventsColl.createIndex({ 'template.eventId': 1 });
  results.push({ collection: 'events', indexes: [evtIndex1, evtIndex2] });

  // 5. cards collection
  const cardsColl = db.collection('cards');
  const cardIndex1 = await cardsColl.createIndex({ cardId: 1 }, { unique: true });
  const cardIndex2 = await cardsColl.createIndex({ category: 1, originTag: 1 });
  results.push({ collection: 'cards', indexes: [cardIndex1, cardIndex2] });

  // 6. failed_tasks collection
  const failedTasksColl = db.collection('failed_tasks');
  const ftIndex1 = await failedTasksColl.createIndex({ taskId: 1 }, { unique: true });
  const ftIndex2 = await failedTasksColl.createIndex({ roomId: 1 });
  results.push({ collection: 'failed_tasks', indexes: [ftIndex1, ftIndex2] });

  // 7. scenarios collection
  const scenariosColl = db.collection('scenarios');
  const scIndex1 = await scenariosColl.createIndex({ id: 1 }, { unique: true });
  results.push({ collection: 'scenarios', indexes: [scIndex1] });

  return results;
}
