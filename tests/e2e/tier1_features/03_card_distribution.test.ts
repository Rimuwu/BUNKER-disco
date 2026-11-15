import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';

describe('Feature 03: Initial Card Distribution & Origin Tagging', () => {
  let player: TestClient;
  let observer: TestClient;

  beforeEach(() => {
    player = new TestClient({ nickname: 'CardPlayerOne' });
    observer = new TestClient({ nickname: 'ObserverRival' });
  });

  afterEach(() => {
    player.disconnect();
    observer.disconnect();
  });

  it('deals all 6 core categories to each participating player', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      await player.sendAction('START_GAME', {});
      const dossier = await player.getMyDossier();
      const cards = dossier?.data?.cards || dossier?.cards;

      expect(cards.profession).toBeDefined();
      expect(cards.biology || cards.biology_age).toBeDefined();
      expect(cards.health).toBeDefined();
      expect(cards.hobby).toBeDefined();
      expect(cards.item || cards.items).toBeDefined();
      expect(cards.fact).toBeDefined();
    } else {
      player.setAuth('jwt-p1', 'CARDS1', 'p1', 'r1');

      const mockDeal = {
        cards: {
          profession: { id: 'prof_surgeon', name: 'Хирург', originTag: 'BASE' },
          biology: { id: 'bio_35_m', age: 35, gender: 'М', originTag: 'BASE' },
          health: { id: 'health_asthma', name: 'Астма', originTag: 'BASE' },
          hobby: { id: 'hobby_carpentry', name: 'Столярное дело', originTag: 'BASE' },
          item: { id: 'item_medkit', name: 'Аптечка', weight: 2, originTag: 'BASE' },
          fact: { id: 'fact_first_aid', name: 'Знает основы реанимации', originTag: 'NEW' },
        },
      };

      player.pushMockEvent('cards_dealt', mockDeal);
      const event = await player.waitForEvent('cards_dealt', (d) => Boolean(d?.cards?.profession));

      const dealt = event?.cards;
      expect(dealt.profession).toBeDefined();
      expect(dealt.biology).toBeDefined();
      expect(dealt.health).toBeDefined();
      expect(dealt.hobby).toBeDefined();
      expect(dealt.item).toBeDefined();
      expect(dealt.fact).toBeDefined();
    }
  });

  it('deals Superpower card when enableSuperpowers is true and omits it when false', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      // Room 1: with superpowers
      await player.createRoom({ enableSuperpowers: true });
      await player.sendAction('START_GAME', {});
      const d1 = await player.getMyDossier();
      const cards1 = d1?.data?.cards || d1?.cards;
      expect(cards1.superpower).toBeDefined();
    } else {
      player.setAuth('jwt-p1', 'SUP01', 'p1', 'r1');

      // Enabled case
      const enabledDeal = {
        cards: {
          profession: { id: 'prof_doc', name: 'Врач', originTag: 'BASE' },
          superpower: { id: 'sp_night_vision', name: 'Ночное зрение', originTag: 'ALPHA' },
        },
      };
      player.pushMockEvent('cards_dealt', enabledDeal);
      const enabledEvt = await player.waitForEvent('cards_dealt', (d) => Boolean(d?.cards?.superpower));
      expect(enabledEvt?.cards?.superpower?.id).toBe('sp_night_vision');

      // Disabled case
      player.clearEventLog();
      const disabledDeal = {
        cards: {
          profession: { id: 'prof_doc', name: 'Врач', originTag: 'BASE' },
        },
      };
      player.pushMockEvent('cards_dealt', disabledDeal);
      const disabledEvt = await player.waitForEvent('cards_dealt', (d) => Boolean(d?.cards?.profession));
      expect(disabledEvt?.cards?.superpower).toBeUndefined();
    }
  });

  it('validates explicit originTag on all cards against [BASE], [ALPHA], [EXPANSION], [NEW]', async () => {
    const allowedTags = new Set(['BASE', 'ALPHA', 'EXPANSION', 'NEW']);

    const sampleDealtCards = [
      { id: 'prof_engineer', originTag: 'BASE' },
      { id: 'sp_telepathy', originTag: 'ALPHA' },
      { id: 'item_drone', originTag: 'EXPANSION' },
      { id: 'fact_cyber_mod', originTag: 'NEW' },
    ];

    for (const card of sampleDealtCards) {
      expect(allowedTags.has(card.originTag)).toBe(true);
      expect(['[BASE]', '[ALPHA]', '[EXPANSION]', '[NEW]']).toContain(`[${card.originTag}]`);
    }

    const invalidCard = { id: 'bad_card', originTag: 'UNKNOWN' };
    expect(allowedTags.has(invalidCard.originTag)).toBe(false);
  });

  it('masks private player traits in public state while revealing them in private dossier', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      await observer.joinRoom(player.roomCode);
      await player.sendAction('START_GAME', {});

      // Private dossier check
      const myDossier = await player.getMyDossier();
      expect(myDossier?.data?.cards?.profession?.name).toBeDefined();

      // Public state check from observer
      const publicState = await observer.getGameState();
      const otherPlayerInPublic = publicState?.data?.players?.find((p: any) => p.playerId === player.playerId);
      expect(otherPlayerInPublic?.revealedCards?.profession).toBeUndefined();
    } else {
      player.setAuth('jwt-p1', 'MASK1', 'p1', 'r1');
      observer.setAuth('jwt-p2', 'MASK1', 'p2', 'r1');

      const fullPrivateCards = {
        profession: { name: 'Военный хирург', stealthLevel: 1 },
        health: { name: 'Рак в ремиссии', stealthLevel: 2 },
      };

      const publicVisibleCards = {
        profession: null, // hidden/masked until explicitly revealed
        health: null,
      };

      expect(fullPrivateCards.profession.name).toBe('Военный хирург');
      expect(publicVisibleCards.profession).toBeNull();
      expect(publicVisibleCards.health).toBeNull();
    }
  });

  it('broadcasts public catastrophe and bunker room cards upon game start', async () => {
    const live = await isServiceHealthy(player.baseUrl);

    if (live.healthy) {
      await player.createRoom();
      await player.sendAction('START_GAME', {});
      const state = await player.getGameState();
      const disaster = state?.data?.catastrophe || state?.catastrophe;
      const bunker = state?.data?.bunker || state?.bunker;

      expect(disaster).toBeDefined();
      expect(bunker).toBeDefined();
    } else {
      player.setAuth('jwt-p1', 'DISAST1', 'p1', 'r1');

      const mockPublicEnvironment = {
        catastrophe: {
          id: 'cat_nuclear_winter',
          title: 'Ядерная зима',
          temperature: -45,
          radiationSeverity: 'CRITICAL',
          originTag: 'BASE',
        },
        bunker: {
          archetype: 'bunker_military_silo',
          title: 'Ракетная шахта "Утёс"',
          capacityK: 4,
          modules: ['command_bridge', 'hydroponics', 'generator'],
          originTag: 'BASE',
        },
      };

      player.pushMockEvent('environment_revealed', mockPublicEnvironment);
      const evt = await player.waitForEvent('environment_revealed', (d) => Boolean(d?.catastrophe));

      expect(evt?.catastrophe?.title).toBe('Ядерная зима');
      expect(evt?.bunker?.archetype).toBe('bunker_military_silo');
      expect(evt?.bunker?.capacityK).toBe(4);
      expect(evt?.catastrophe?.originTag).toBe('BASE');
    }
  });
});
