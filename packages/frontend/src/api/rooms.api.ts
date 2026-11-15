import { apiClient } from './client';
import type { IRoomSettings } from '@/stores/roomStore';

export const roomsApi = {
  async createRoom(nickname: string, settings?: Partial<IRoomSettings>) {
    const res = await apiClient.post('/rooms', { nickname, settings });
    return res.data;
  },

  async getRoom(code: string) {
    const res = await apiClient.get(`/rooms/${code.toUpperCase()}`);
    return res.data;
  },

  async joinRoom(code: string, nickname: string) {
    const res = await apiClient.post(`/rooms/${code.toUpperCase()}/join`, { nickname });
    return res.data;
  },

  async getPlayers(code: string) {
    const res = await apiClient.get(`/rooms/${code.toUpperCase()}/players`);
    return res.data;
  },

  async getSettings(code: string) {
    const res = await apiClient.get(`/rooms/${code.toUpperCase()}/settings`);
    return res.data;
  },

  async updateSettings(code: string, settings: Partial<IRoomSettings>) {
    const res = await apiClient.patch(`/rooms/${code.toUpperCase()}/settings`, settings);
    return res.data;
  },

  async closeRoom(code: string) {
    const res = await apiClient.delete(`/rooms/${code.toUpperCase()}`);
    return res.data;
  }
};
