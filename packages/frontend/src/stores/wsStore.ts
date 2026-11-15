import { defineStore } from 'pinia';

export const useWsStore = defineStore('ws', {
  state: () => ({
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
    latencyMs: 0,
    lastPingTimestamp: 0,
    pingIntervalId: null as any
  }),

  getters: {
    connectionQuality(state): 'good' | 'medium' | 'bad' | 'disconnected' {
      if (!state.isConnected) return 'disconnected';
      if (state.latencyMs < 100) return 'good';
      if (state.latencyMs < 300) return 'medium';
      return 'bad';
    }
  },

  actions: {
    setConnected(connected: boolean) {
      this.isConnected = connected;
      if (connected) {
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
      }
    },

    setReconnecting(reconnecting: boolean) {
      this.isReconnecting = reconnecting;
      if (reconnecting) {
        this.reconnectAttempts += 1;
      }
    },

    setLatency(ms: number) {
      this.latencyMs = Math.max(0, ms);
      this.lastPingTimestamp = Date.now();
    },

    recordPingSent(): number {
      const now = Date.now();
      this.lastPingTimestamp = now;
      return now;
    },

    recordPongReceived(sentTimestamp?: number) {
      const start = sentTimestamp || this.lastPingTimestamp;
      if (start > 0) {
        this.latencyMs = Math.max(1, Date.now() - start);
      }
    },

    reset() {
      this.isConnected = false;
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      this.latencyMs = 0;
      if (this.pingIntervalId) {
        clearInterval(this.pingIntervalId);
        this.pingIntervalId = null;
      }
    }
  }
});
