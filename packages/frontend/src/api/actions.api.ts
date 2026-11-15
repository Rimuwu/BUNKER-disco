import { apiClient } from './client';

export type ActionType =
  | 'REVEAL_CARD'
  | 'USE_ABILITY'
  | 'PLAYER_REROLL'
  | 'CAST_VOTE'
  | 'VETO'
  | 'CANDIDATE_VETO'
  | 'TRADE_ITEM'
  | 'PICKPOCKET_MINIGAME'
  | 'SABOTAGE'
  | 'ASSIGN_WORKSTATION'
  | 'QUEUE_CRAFT';

let sequenceCounter = 1;

export const actionsApi = {
  async startGame() {
    const res = await apiClient.post('/actions', {
      type: 'START_GAME',
      clientSequence: sequenceCounter++,
      payload: {}
    });
    return res.data;
  },

  async sendAction(action: ActionType, payload: Record<string, any> = {}) {
    const res = await apiClient.post('/actions', {
      type: 'CLIENT_ACTION',
      clientSequence: sequenceCounter++,
      payload: {
        action,
        ...payload
      }
    });
    return res.data;
  }
};
