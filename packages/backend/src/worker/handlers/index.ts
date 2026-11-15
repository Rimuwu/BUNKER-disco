import { GameTaskType } from '@bunker/shared';
import { StartGameHandler } from './StartGameHandler.js';
import { Phase1VoteTickHandler } from './Phase1VoteTickHandler.js';
import { Phase1ResolveVotingHandler } from './Phase1ResolveVotingHandler.js';
import { Phase1ExileHandler } from './Phase1ExileHandler.js';
import { Phase2StartHandler } from './Phase2StartHandler.js';
import { Phase2DayTickHandler } from './Phase2DayTickHandler.js';
import { Phase2ResolveActionsHandler } from './Phase2ResolveActionsHandler.js';
import { Phase2CrisisCheckHandler } from './Phase2CrisisCheckHandler.js';
import { ClientActionHandler } from './ClientActionHandler.js';

export * from './StartGameHandler.js';
export * from './Phase1VoteTickHandler.js';
export * from './Phase1ResolveVotingHandler.js';
export * from './Phase1ExileHandler.js';
export * from './Phase2StartHandler.js';
export * from './Phase2DayTickHandler.js';
export * from './Phase2ResolveActionsHandler.js';
export * from './Phase2CrisisCheckHandler.js';
export * from './ClientActionHandler.js';

export function createAllTaskHandlers(): Map<GameTaskType, any> {
  const handlers = new Map<GameTaskType, any>();

  handlers.set('START_GAME', new StartGameHandler());
  handlers.set('PHASE1_VOTE_TICK', new Phase1VoteTickHandler());
  handlers.set('PHASE1_RESOLVE_VOTING', new Phase1ResolveVotingHandler());
  handlers.set('PHASE1_EXILE', new Phase1ExileHandler());
  handlers.set('PHASE2_START', new Phase2StartHandler());
  handlers.set('PHASE2_DAY_TICK', new Phase2DayTickHandler());
  handlers.set('PHASE2_RESOLVE_ACTIONS', new Phase2ResolveActionsHandler());
  handlers.set('PHASE2_CRISIS_CHECK', new Phase2CrisisCheckHandler());
  handlers.set('CLIENT_ACTION', new ClientActionHandler());

  return handlers;
}
