import { defineStore } from 'pinia';

export interface IToast {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
  duration?: number;
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeModal: null as string | null,
    inspectedPlayerId: null as string | null,
    toasts: [] as IToast[],
    sfxEnabled: true,
    hapticsEnabled: true,
    crtEffect: true,
    cameraMode: 'SURFACE_WIDE' as 'SURFACE_WIDE' | 'SPEAKER_FOCUS' | 'VOTE_ARENA' | 'BUNKER_OVERVIEW' | 'EMERGENCY_TRACK'
  }),

  actions: {
    openModal(modalName: string) {
      this.activeModal = modalName;
    },

    closeModal() {
      this.activeModal = null;
    },

    openDossier(playerId: string) {
      this.inspectedPlayerId = playerId;
      this.activeModal = 'dossier';
    },

    closeDossier() {
      this.inspectedPlayerId = null;
      if (this.activeModal === 'dossier') {
        this.activeModal = null;
      }
    },

    addToast(message: string, type: IToast['type'] = 'info', duration = 3000) {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const toast: IToast = { id, message, type, duration };
      this.toasts.push(toast);

      if (duration > 0 && typeof window !== 'undefined') {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }
      return id;
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },

    toggleSfx() {
      this.sfxEnabled = !this.sfxEnabled;
    },

    toggleHaptics() {
      this.hapticsEnabled = !this.hapticsEnabled;
    },

    toggleCrt() {
      this.crtEffect = !this.crtEffect;
    },

    setCameraMode(mode: typeof this.cameraMode) {
      this.cameraMode = mode;
    }
  }
});
