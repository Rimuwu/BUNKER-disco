import axios, { type AxiosInstance } from 'axios';
import { usePlayerStore } from '@/stores/playerStore';

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  try {
    const playerStore = usePlayerStore();
    const token = playerStore.playerToken || localStorage.getItem('bunker_player_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
