import { apiClient } from './client';

export const playersApi = {
  async getMe() {
    const res = await apiClient.get('/players/me');
    return res.data;
  },

  async getPlayer(playerId: string) {
    const res = await apiClient.get(`/players/${playerId}`);
    return res.data;
  },

  async reroll(clientSequence?: string) {
    const res = await apiClient.post('/players/reroll', {
      clientSequence: clientSequence || `seq_${Date.now()}`
    });
    return res.data;
  }
};
