import { apiClient } from './client';

export const gameApi = {
  async getGameState(roomIdOrCode: string) {
    const res = await apiClient.get(`/game/${roomIdOrCode}/state`);
    return res.data;
  },

  async getPhase1State(roomId: string) {
    const res = await apiClient.get(`/game/${roomId}/phase1`);
    return res.data;
  },

  async getPhase2State(roomId: string) {
    const res = await apiClient.get(`/game/${roomId}/phase2`);
    return res.data;
  },

  async getBunker(roomId: string) {
    const res = await apiClient.get(`/game/${roomId}/bunker`);
    return res.data;
  }
};
