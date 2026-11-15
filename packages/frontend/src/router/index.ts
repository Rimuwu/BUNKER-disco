import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import BigScreenView from '@/views/BigScreenView.vue';
import PlayerScreenView from '@/views/PlayerScreenView.vue';
import LobbyPageView from '@/views/LobbyPageView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/screen',
    name: 'bigscreen',
    component: BigScreenView
  },
  {
    path: '/play',
    name: 'playerscreen',
    component: PlayerScreenView
  },
  {
    path: '/lobby',
    name: 'lobby',
    component: LobbyPageView
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
