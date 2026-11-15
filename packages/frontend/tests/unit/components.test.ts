import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TactileCard from '@/components/player/TactileCard.vue';
import VotingBallot from '@/components/player/VotingBallot.vue';
import ResourceBar from '@/components/bigscreen/ResourceBar.vue';
import LobbyView from '@/components/player/LobbyView.vue';
import PixelBadge from '@/components/ui/PixelBadge.vue';
import { usePlayerStore, type IPlayerCard } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';

describe('Frontend Components Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('PixelBadge.vue & GEMINI.md Origin Tags', () => {
    it('renders [BASE] origin tag badge correctly', () => {
      const wrapper = mount(PixelBadge, { props: { tag: 'BASE' } });
      expect(wrapper.text()).toBe('[BASE]');
      expect(wrapper.classes()).toContain('border-[#71717a]');
    });

    it('renders [ALPHA] origin tag badge with purple border', () => {
      const wrapper = mount(PixelBadge, { props: { tag: 'ALPHA' } });
      expect(wrapper.text()).toBe('[ALPHA]');
      expect(wrapper.classes()).toContain('border-[#a855f7]');
    });

    it('renders [EXPANSION] origin tag badge with bronze border', () => {
      const wrapper = mount(PixelBadge, { props: { tag: 'EXPANSION' } });
      expect(wrapper.text()).toBe('[EXPANSION]');
      expect(wrapper.classes()).toContain('border-[#d97706]');
    });

    it('renders [NEW] origin tag badge with cyan border', () => {
      const wrapper = mount(PixelBadge, { props: { tag: 'NEW' } });
      expect(wrapper.text()).toBe('[NEW]');
      expect(wrapper.classes()).toContain('border-[#06b6d4]');
    });
  });

  describe('TactileCard.vue', () => {
    const baseCard: IPlayerCard = {
      cardId: 'prof_01',
      category: 'profession',
      originTag: 'BASE',
      name: 'Военный хирург',
      description: 'Проводит операции в полевых условиях',
      flavorText: 'Шью без наркоза',
      isRevealed: false
    };

    it('renders locked armored back with [LOCKED] when isRevealed is false', () => {
      const wrapper = mount(TactileCard, { props: { card: baseCard } });
      expect(wrapper.text()).toContain('[LOCKED]');
      expect(wrapper.find('.card-back').exists()).toBe(true);
      expect(wrapper.find('.tactile-card').classes()).not.toContain('is-flipped');
    });

    it('displays card name and origin tag when isRevealed is true', () => {
      const revealedCard: IPlayerCard = {
        ...baseCard,
        originTag: 'ALPHA',
        isRevealed: true
      };

      const wrapper = mount(TactileCard, { props: { card: revealedCard } });
      expect(wrapper.text()).toContain('Военный хирург');
      expect(wrapper.text()).toContain('[ALPHA]');
      expect(wrapper.find('.tactile-card').classes()).toContain('is-flipped');
      expect(wrapper.find('.tactile-card').classes()).toContain('border-origin-alpha');
    });

    it('emits reveal-requested when clicking on an unrevealed card', async () => {
      const wrapper = mount(TactileCard, { props: { card: baseCard } });
      await wrapper.find('.tactile-card-wrapper').trigger('click');
      expect(wrapper.emitted('reveal-requested')).toBeTruthy();
      expect(wrapper.emitted('reveal-requested')?.[0][0]).toEqual(baseCard);
    });
  });

  describe('VotingBallot.vue', () => {
    it('strictly disables self-voting button to prevent SELF_VOTE_FORBIDDEN', () => {
      const playerStore = usePlayerStore();
      playerStore.playerId = 'p_self';

      const candidates = [
        { playerId: 'p_self', nickname: 'Мой Ник' },
        { playerId: 'p_other', nickname: 'Соперник' }
      ];

      const wrapper = mount(VotingBallot, {
        props: {
          candidates,
          timerSeconds: 60
        }
      });

      const buttons = wrapper.findAll('.candidate-btn');
      // Candidate 1 (self): disabled
      expect(buttons[0].attributes('disabled')).toBeDefined();
      expect(buttons[0].text()).toContain('(ВЫ - НЕЛЬЗЯ)');

      // Candidate 2 (other): enabled
      expect(buttons[1].attributes('disabled')).toBeUndefined();
    });

    it('emits vote event when clicking an eligible rival candidate', async () => {
      const playerStore = usePlayerStore();
      playerStore.playerId = 'p_self';

      const candidates = [
        { playerId: 'p_self', nickname: 'Мой Ник' },
        { playerId: 'p_target', nickname: 'Иван' }
      ];

      const wrapper = mount(VotingBallot, {
        props: {
          candidates,
          timerSeconds: 60
        }
      });

      const buttons = wrapper.findAll('.candidate-btn');
      await buttons[1].trigger('click');

      expect(wrapper.emitted('vote')).toBeTruthy();
      expect(wrapper.emitted('vote')?.[0][0]).toBe('p_target');
    });

    it('allows candidate veto for 2 AP', async () => {
      const playerStore = usePlayerStore();
      playerStore.actionPoints = 3;
      playerStore.hasUsedVeto = false;

      const wrapper = mount(VotingBallot, {
        props: {
          candidates: [{ playerId: 'p2', nickname: 'Боб' }],
          canUseVeto: true
        }
      });

      const vetoBtn = wrapper.find('button[class*="border-[#ffc700]"]');
      expect(vetoBtn.exists()).toBe(true);

      await vetoBtn.trigger('click');
      expect(playerStore.actionPoints).toBe(1);
      expect(playerStore.hasUsedVeto).toBe(true);
      expect(wrapper.emitted('veto')).toBeTruthy();
    });
  });

  describe('ResourceBar.vue', () => {
    it('renders all 6 core bunker resources with values', () => {
      const resources = {
        food: 80,
        water: 50,
        air: 90,
        medicine: 60,
        power: 70,
        morale: 40
      };

      const wrapper = mount(ResourceBar, { props: { resources } });
      expect(wrapper.text()).toContain('ЕДА');
      expect(wrapper.text()).toContain('80%');
      expect(wrapper.text()).toContain('ВОДА');
      expect(wrapper.text()).toContain('50%');
      expect(wrapper.text()).toContain('ВОЗДУХ');
      expect(wrapper.text()).toContain('90%');
      expect(wrapper.text()).toContain('МЕД.');
      expect(wrapper.text()).toContain('60%');
      expect(wrapper.text()).toContain('ЭНЕРГИЯ');
      expect(wrapper.text()).toContain('70%');
      expect(wrapper.text()).toContain('МОРАЛЬ');
      expect(wrapper.text()).toContain('40%');
    });

    it('triggers critical hazard border when any resource falls below 15%', () => {
      const resources = {
        food: 80,
        water: 10, // Critical < 15%
        air: 90,
        medicine: 60,
        power: 70,
        morale: 40
      };

      const wrapper = mount(ResourceBar, { props: { resources } });
      expect(wrapper.find('.border-\\[\\#e02424\\]').exists()).toBe(true);
      expect(wrapper.find('.animate-pulse').exists()).toBe(true);
    });
  });

  describe('LobbyView.vue', () => {
    it('binds deck toggles and displays capacity formula K = floor(N / 2)', async () => {
      const roomStore = useRoomStore();
      const playerStore = usePlayerStore();
      playerStore.isHost = true;
      roomStore.isHost = true;
      roomStore.setRoom({ roomCode: 'ALPHA' });
      roomStore.setPlayers([
        { playerId: 'p1', nickname: 'Host', isHost: true, isConnected: true, isEliminated: false, avatarSeed: 's1' },
        { playerId: 'p2', nickname: 'User2', isHost: false, isConnected: true, isEliminated: false, avatarSeed: 's2' },
        { playerId: 'p3', nickname: 'User3', isHost: false, isConnected: true, isEliminated: false, avatarSeed: 's3' },
        { playerId: 'p4', nickname: 'User4', isHost: false, isConnected: true, isEliminated: false, avatarSeed: 's4' },
        { playerId: 'p5', nickname: 'User5', isHost: false, isConnected: true, isEliminated: false, avatarSeed: 's5' }
      ]);

      const wrapper = mount(LobbyView);

      // K = floor(5 / 2) = 2
      expect(wrapper.text()).toContain('Вместимость бункера: 2 мест (из 5)');
      expect(wrapper.text()).toContain('ALPHA');

      // Check Superpowers toggle
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(3); // superpowers, phobias, character

      await checkboxes[0].setValue(true);
      expect(roomStore.settings.enableSuperpowers).toBe(true);

      // Check reroll select
      const select = wrapper.find('select');
      await select.setValue('3');
      expect(roomStore.settings.rerollLimit).toBe(3);
    });
  });
});
