import { defineStore } from 'pinia';

export type CardOriginTag = 'BASE' | 'ALPHA' | 'EXPANSION' | 'NEW';

export interface IPlayerCard {
  cardId: string;
  category: string;
  originTag: CardOriginTag;
  name: string;
  nameEn?: string;
  description: string;
  flavorText?: string;
  isRevealed: boolean;
  metadata?: Record<string, any>;
}

export interface IPlayerAbility {
  abilityId: string;
  name: string;
  description?: string;
  apCost: number;
  cooldownRemaining: number;
  totalCooldown?: number;
  isReaction?: boolean;
}

export interface IInventoryItem {
  itemId: string;
  name: string;
  weight: number;
  quantity: number;
  description?: string;
  originTag?: CardOriginTag;
}

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playerId: '',
    playerToken: '',
    nickname: '',
    avatarSeed: 'survivor-1',
    isHost: false,
    isEliminated: false,
    isInBunker: true,
    actionPoints: 3, // AP_PER_ROUND = 3
    remainingRerolls: 1,
    hasUsedVeto: false,
    cards: {} as Record<string, IPlayerCard>,
    abilities: [] as IPlayerAbility[],
    inventory: [] as IInventoryItem[],
    stats: {
      health: 100,
      morale: 100,
      energy: 100
    }
  }),

  getters: {
    cardList(state): IPlayerCard[] {
      return Object.values(state.cards);
    },
    revealedCards(state): IPlayerCard[] {
      return Object.values(state.cards).filter((c) => c.isRevealed);
    },
    unrevealedCards(state): IPlayerCard[] {
      return Object.values(state.cards).filter((c) => !c.isRevealed);
    },
    secretQuest(state): IPlayerCard | undefined {
      return state.cards['special_condition'];
    },
    canAffordAp: (state) => (cost: number) => state.actionPoints >= cost,
    canReroll(state): boolean {
      return state.remainingRerolls > 0 && !state.isEliminated;
    },
    canVeto(state): boolean {
      return !state.hasUsedVeto && state.actionPoints >= 2 && !state.isEliminated;
    },
    readyAbilities(state): IPlayerAbility[] {
      return state.abilities.filter((a) => a.cooldownRemaining <= 0);
    }
  },

  actions: {
    setCredentials(payload: {
      playerId: string;
      playerToken: string;
      nickname: string;
      isHost?: boolean;
      avatarSeed?: string;
    }) {
      this.playerId = payload.playerId;
      this.playerToken = payload.playerToken;
      this.nickname = payload.nickname;
      if (payload.isHost !== undefined) this.isHost = payload.isHost;
      if (payload.avatarSeed) this.avatarSeed = payload.avatarSeed;
    },

    setHand(cards: Record<string, IPlayerCard> | IPlayerCard[]) {
      if (Array.isArray(cards)) {
        const dict: Record<string, IPlayerCard> = {};
        for (const c of cards) {
          dict[c.category] = c;
        }
        this.cards = dict;
      } else {
        this.cards = cards;
      }
    },

    revealCard(category: string) {
      if (this.cards[category]) {
        this.cards[category].isRevealed = true;
      }
    },

    spendAp(cost: number): boolean {
      if (this.actionPoints >= cost) {
        this.actionPoints -= cost;
        return true;
      }
      return false;
    },

    resetAp() {
      this.actionPoints = 3;
    },

    setRerolls(count: number) {
      this.remainingRerolls = count;
    },

    decrementRerolls() {
      if (this.remainingRerolls > 0) {
        this.remainingRerolls -= 1;
      }
    },

    useCandidateVeto(): boolean {
      if (this.canVeto) {
        this.actionPoints -= 2;
        this.hasUsedVeto = true;
        return true;
      }
      return false;
    },

    setAbilities(abilities: IPlayerAbility[]) {
      this.abilities = abilities;
    },

    reduceCooldowns() {
      this.abilities.forEach((a) => {
        if (a.cooldownRemaining > 0) a.cooldownRemaining -= 1;
      });
    },

    setInventory(items: IInventoryItem[]) {
      this.inventory = items;
    },

    updateStats(stats: Partial<typeof this.stats>) {
      this.stats = { ...this.stats, ...stats };
    },

    setEliminated(eliminated = true) {
      this.isEliminated = eliminated;
    },

    reset() {
      this.playerId = '';
      this.playerToken = '';
      this.nickname = '';
      this.avatarSeed = 'survivor-1';
      this.isHost = false;
      this.isEliminated = false;
      this.isInBunker = true;
      this.actionPoints = 3;
      this.remainingRerolls = 1;
      this.hasUsedVeto = false;
      this.cards = {};
      this.abilities = [];
      this.inventory = [];
      this.stats = { health: 100, morale: 100, energy: 100 };
    }
  }
});
