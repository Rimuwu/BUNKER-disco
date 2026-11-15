import { Db } from 'mongodb';
import { connectMongo, getMongoDb, isMongoConnected, disconnectMongo } from './connection.js';
import { ensureAllIndexes } from './indexes.js';
import { RoomRepository } from './repositories/room.repository.js';
import { PlayerRepository } from './repositories/player.repository.js';
import { GameRepository } from './repositories/game.repository.js';
import { CardRepository } from './repositories/card.repository.js';
import { EventRepository } from './repositories/event.repository.js';
import { FailedTaskRepository } from './repositories/failed-task.repo.js';
import { ScenarioRepository } from './repositories/scenario.repository.js';

export * from './connection.js';
export * from './indexes.js';
export * from './repositories/room.repository.js';
export * from './repositories/player.repository.js';
export * from './repositories/game.repository.js';
export * from './repositories/card.repository.js';
export * from './repositories/event.repository.js';
export * from './repositories/failed-task.repo.js';
export * from './repositories/scenario.repository.js';

export interface Repositories {
  rooms: RoomRepository;
  players: PlayerRepository;
  games: GameRepository;
  cards: CardRepository;
  events: EventRepository;
  failedTasks: FailedTaskRepository;
  scenarios: ScenarioRepository;
}

export function createRepositories(db: Db | null = null): Repositories {
  return {
    rooms: new RoomRepository(db),
    players: new PlayerRepository(db),
    games: new GameRepository(db),
    cards: new CardRepository(db),
    events: new EventRepository(db),
    failedTasks: new FailedTaskRepository(db),
    scenarios: new ScenarioRepository(db),
  };
}
