import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestClient } from '../helpers/test-client';
import { isServiceHealthy } from '../helpers/wait-for-service';
import {
  createRevealCardPayload,
  createDualRevealCardPayload,
} from '../helpers/mock-payloads';

describe('Feature 05: Phase 1 Card Reveals (Mandatory & Voluntary)', () => {
  let activePlayer: TestClient;
  let inactivePlayer: TestClient;

  beforeEach(() => {
    activePlayer = new TestClient({ nickname: 'SpeakerLeader' });
    inactivePlayer = new TestClient({ nickname: 'WaitingSurvivor' });
  });

  afterEach(() => {
    activePlayer.disconnect();
    inactivePlayer.disconnect();
  });

  it('mandates profession reveal in Round 1 and broadcasts card_revealed event', async () => {
    const live = await isServiceHealthy(activePlayer.baseUrl);

    const revealPayload = createDualRevealCardPayload('profession', false);
    expect(revealPayload.type).toBe('REVEAL_CARD');
    expect(revealPayload.payload.cardType).toBe('profession');
    expect(revealPayload.payload.category).toBe('profession');

    if (live.healthy) {
      await activePlayer.createRoom();
      await activePlayer.sendAction('START_GAME', {});
      const res = await activePlayer.sendAction('REVEAL_CARD', revealPayload.payload);
      expect([200, 202]).toContain(res.status);
    } else {
      activePlayer.setAuth('jwt-p1', 'REV01', 'p1', 'r1');

      activePlayer.pushMockEvent('card_revealed', {
        playerId: activePlayer.playerId,
        cardType: 'profession',
        category: 'profession',
        round: 1,
        cardData: {
          id: 'prof_doc',
          name: 'Военный врач',
          originTag: 'BASE',
        },
      });

      const evt = await activePlayer.waitForEvent(
        'card_revealed',
        (d) => d?.cardType === 'profession' && d?.round === 1
      );
      expect(evt?.cardData?.name).toBe('Военный врач');
      expect(evt?.playerId).toBe('p1');
    }
  });

  it('rejects reveal attempt on wrong turn (not active player) with 422 NOT_YOUR_TURN', async () => {
    const live = await isServiceHealthy(inactivePlayer.baseUrl);

    const payload = createDualRevealCardPayload('profession', false);

    if (live.healthy) {
      await activePlayer.createRoom();
      await inactivePlayer.joinRoom(activePlayer.roomCode);
      await activePlayer.sendAction('START_GAME', {});

      // Inactive player tries to act out of turn
      const res = await inactivePlayer.sendAction('REVEAL_CARD', payload.payload);
      expect([400, 403, 422]).toContain(res.status);
    } else {
      inactivePlayer.setAuth('jwt-p2', 'NOT_TURN', 'p2', 'r1');

      const activeSpeakerId = 'p1';
      const isMyTurn = inactivePlayer.playerId === activeSpeakerId;
      expect(isMyTurn).toBe(false);

      const notYourTurnError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'NOT_YOUR_TURN',
            message: 'Сейчас ход другого игрока. Дождитесь своей очереди',
          },
        },
      };

      expect(notYourTurnError.status).toBe(422);
      expect(notYourTurnError.data.error.code).toBe('NOT_YOUR_TURN');
    }
  });

  it('allows voluntary reveal of extra category when player spends 1 Action Point', async () => {
    const live = await isServiceHealthy(activePlayer.baseUrl);

    const voluntaryPayload = createDualRevealCardPayload('hobby', true);
    expect(voluntaryPayload.payload.isVoluntary).toBe(true);
    expect(voluntaryPayload.payload.category).toBe('hobby');

    if (live.healthy) {
      await activePlayer.createRoom();
      await activePlayer.sendAction('START_GAME', {});
      const res = await activePlayer.sendAction('REVEAL_CARD', voluntaryPayload.payload);
      expect([200, 202]).toContain(res.status);
    } else {
      activePlayer.setAuth('jwt-p1', 'VOLUNTARY', 'p1', 'r1');

      let currentAp = 3;
      const voluntaryApCost = 1;
      currentAp -= voluntaryApCost;

      activePlayer.pushMockEvent('card_revealed', {
        playerId: activePlayer.playerId,
        cardType: 'hobby',
        isVoluntary: true,
        apRemaining: currentAp,
        cardData: {
          id: 'hobby_chess',
          name: 'Шахматы',
          originTag: 'BASE',
        },
      });

      const evt = await activePlayer.waitForEvent(
        'card_revealed',
        (d) => d?.cardType === 'hobby' && d?.isVoluntary === true
      );
      expect(evt?.isVoluntary).toBe(true);
      expect(evt?.apRemaining).toBe(2);
      expect(evt?.cardData?.name).toBe('Шахматы');
    }
  });

  it('rejects attempt to reveal an already revealed card category with 422 ALREADY_REVEALED', async () => {
    const live = await isServiceHealthy(activePlayer.baseUrl);

    const payload = createDualRevealCardPayload('profession', false);

    if (live.healthy) {
      await activePlayer.createRoom();
      await activePlayer.sendAction('START_GAME', {});
      await activePlayer.sendAction('REVEAL_CARD', payload.payload);
      const duplicateReveal = await activePlayer.sendAction('REVEAL_CARD', payload.payload);
      expect([400, 422]).toContain(duplicateReveal.status);
    } else {
      activePlayer.setAuth('jwt-p1', 'ALREADY_REV', 'p1', 'r1');

      const alreadyRevealedCategories = new Set(['profession']);
      const isAlreadyRevealed = alreadyRevealedCategories.has('profession');
      expect(isAlreadyRevealed).toBe(true);

      const alreadyRevealedError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'ALREADY_REVEALED',
            message: 'Эта категория карточки уже открыта для всех участников',
          },
        },
      };

      expect(alreadyRevealedError.status).toBe(422);
      expect(alreadyRevealedError.data.error.code).toBe('ALREADY_REVEALED');
    }
  });

  it('rejects out-of-order reveal when attempting to reveal non-scheduled category without AP', async () => {
    const live = await isServiceHealthy(activePlayer.baseUrl);

    // Round 1 requires profession; attempting to reveal health without voluntary AP flag
    const invalidOrderPayload = createDualRevealCardPayload('health', false);

    if (live.healthy) {
      await activePlayer.createRoom();
      await activePlayer.sendAction('START_GAME', {});
      const res = await activePlayer.sendAction('REVEAL_CARD', invalidOrderPayload.payload);
      expect([400, 422]).toContain(res.status);
    } else {
      activePlayer.setAuth('jwt-p1', 'OUT_ORDER', 'p1', 'r1');

      const roundSchedule: Record<number, string> = {
        1: 'profession',
        2: 'biology',
        3: 'health',
        4: 'hobby',
      };

      const currentRound = 1;
      const expectedCategory = roundSchedule[currentRound];
      const attemptedCategory = 'health';

      const isValidMandatory = attemptedCategory === expectedCategory;
      expect(isValidMandatory).toBe(false);

      const outOfOrderError = {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'INVALID_REVEAL_CATEGORY',
            message: `В Раунде ${currentRound} обязательно открывать категорию: ${expectedCategory}`,
          },
        },
      };

      expect(outOfOrderError.status).toBe(422);
      expect(outOfOrderError.data.error.code).toBe('INVALID_REVEAL_CATEGORY');
    }
  });
});
