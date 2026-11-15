import {
  ICardDocument,
  CardCategory,
  ILobbySettings,
  calculateBunkerCapacity,
  calculateEliminationRounds,
} from '@bunker/shared';
import {
  getCardsByCategory,
  getCardById,
} from '@bunker/shared';
import { IPlayerDocument } from '../../db/repositories/player.repository.js';

export interface IDealtHand {
  cards: Record<string, any>;
  inventory: Array<{
    itemId: string;
    name: string;
    weight: number;
    quantity: number;
    description?: string;
  }>;
  abilities: Array<{
    abilityId: string;
    name: string;
    actionPoints: number;
    cooldownRemaining: number;
    usesRemaining: number;
    metadata?: any;
  }>;
  secretQuests: Array<any>;
}

export interface IInitialGameDeal {
  catastrophe: ICardDocument;
  bunkerArchetype: ICardDocument;
  startingDefects: ICardDocument[];
  targetCapacityK: number;
  eliminationRoundsTotal: number;
  playerHands: Map<string, IDealtHand>;
}

function shuffle<T>(array: readonly T[] | T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function dealInitialCards(
  players: IPlayerDocument[],
  settings: Partial<ILobbySettings> = {}
): IInitialGameDeal {
  const playerCount = players.length;
  if (playerCount < 2 || playerCount > 20) {
    throw new Error(`Invalid player count ${playerCount}. Must be between 2 and 20.`);
  }

  const targetCapacityK = calculateBunkerCapacity(playerCount);
  const eliminationRoundsTotal = calculateEliminationRounds(playerCount);

  // 1. Public cards
  const catastrophes = shuffle(getCardsByCategory('catastrophe'));
  const catastrophe = catastrophes[0];

  const bunkerArchetypes = shuffle(getCardsByCategory('bunker_archetype'));
  const bunkerArchetype = bunkerArchetypes[0];

  const bunkerDefects = shuffle(getCardsByCategory('bunker_defect'));
  // Draw 1-2 starting defects
  const defectCount = Math.floor(Math.random() * 2) + 1;
  const startingDefects = bunkerDefects.slice(0, defectCount);

  // 2. Player card decks
  const professions = shuffle(getCardsByCategory('profession'));
  const biologyAges = shuffle(getCardsByCategory('biology_age'));
  const biologyGenders = shuffle(getCardsByCategory('biology_gender'));
  const healths = shuffle(getCardsByCategory('health'));
  const hobbies = shuffle(getCardsByCategory('hobby'));
  const facts = shuffle(getCardsByCategory('fact'));
  const items = shuffle(getCardsByCategory('item'));

  const enableQuests = settings.enableSecretQuests !== false;
  const quests = enableQuests ? shuffle(getCardsByCategory('special_condition')) : [];

  const enablePhobias = settings.enablePhobias !== false;
  const phobias = enablePhobias ? shuffle(getCardsByCategory('phobia')) : [];

  const enableCharacter = settings.enableCharacter !== false;
  const characters = enableCharacter ? shuffle(getCardsByCategory('character')) : [];

  // Superpowers: default false per GEMINI.md & ADR-04
  const enableSuperpowers = settings.enableSuperpowers === true;
  const superpowers = enableSuperpowers ? shuffle(getCardsByCategory('superpower')) : [];

  const playerHands = new Map<string, IDealtHand>();

  players.forEach((player, index) => {
    const prof = professions[index % professions.length];
    const bioAge = biologyAges[index % biologyAges.length];
    const bioGender = biologyGenders[index % biologyGenders.length];
    const health = healths[index % healths.length];
    const hobby = hobbies[index % hobbies.length];
    const fact = facts[index % facts.length];

    const cards: Record<string, any> = {
      profession: {
        cardId: prof.cardId,
        category: 'profession',
        originTag: prof.originTag,
        name: prof.name,
        nameEn: prof.nameEn,
        description: prof.description,
        isRevealed: false,
        metadata: prof.metadata,
      },
      biology_age: {
        cardId: bioAge.cardId,
        category: 'biology_age',
        originTag: bioAge.originTag,
        name: bioAge.name,
        nameEn: bioAge.nameEn,
        description: bioAge.description,
        isRevealed: false,
        metadata: bioAge.metadata,
      },
      biology_gender: {
        cardId: bioGender.cardId,
        category: 'biology_gender',
        originTag: bioGender.originTag,
        name: bioGender.name,
        nameEn: bioGender.nameEn,
        description: bioGender.description,
        isRevealed: false,
        metadata: bioGender.metadata,
      },
      health: {
        cardId: health.cardId,
        category: 'health',
        originTag: health.originTag,
        name: health.name,
        nameEn: health.nameEn,
        description: health.description,
        isRevealed: false,
        metadata: health.metadata,
      },
      hobby: {
        cardId: hobby.cardId,
        category: 'hobby',
        originTag: hobby.originTag,
        name: hobby.name,
        nameEn: hobby.nameEn,
        description: hobby.description,
        isRevealed: false,
        metadata: hobby.metadata,
      },
      fact: {
        cardId: fact.cardId,
        category: 'fact',
        originTag: fact.originTag,
        name: fact.name,
        nameEn: fact.nameEn,
        description: fact.description,
        isRevealed: false,
        metadata: fact.metadata,
      },
    };

    const secretQuests: any[] = [];
    if (enableQuests && quests.length > 0) {
      const q = quests[index % quests.length];
      secretQuests.push({
        cardId: q.cardId,
        originTag: q.originTag,
        name: q.name,
        nameEn: q.nameEn,
        description: q.description,
        metadata: q.metadata,
      });
      cards.special_condition = {
        cardId: q.cardId,
        category: 'special_condition',
        originTag: q.originTag,
        name: q.name,
        nameEn: q.nameEn,
        description: q.description,
        isRevealed: false,
        isSecret: true,
        metadata: q.metadata,
      };
    }

    if (enablePhobias && phobias.length > 0) {
      const ph = phobias[index % phobias.length];
      cards.phobia = {
        cardId: ph.cardId,
        category: 'phobia',
        originTag: ph.originTag,
        name: ph.name,
        nameEn: ph.nameEn,
        description: ph.description,
        isRevealed: false,
        metadata: ph.metadata,
      };
    }

    if (enableCharacter && characters.length > 0) {
      const ch = characters[index % characters.length];
      cards.character = {
        cardId: ch.cardId,
        category: 'character',
        originTag: ch.originTag,
        name: ch.name,
        nameEn: ch.nameEn,
        description: ch.description,
        isRevealed: false,
        metadata: ch.metadata,
      };
    }

    if (enableSuperpowers && superpowers.length > 0) {
      const sp = superpowers[index % superpowers.length];
      cards.superpower = {
        cardId: sp.cardId,
        category: 'superpower',
        originTag: sp.originTag,
        name: sp.name,
        nameEn: sp.nameEn,
        description: sp.description,
        isRevealed: false,
        metadata: sp.metadata,
      };
    }

    // Starting items (1-2 items)
    const item1 = items[(index * 2) % items.length];
    const item2 = items[(index * 2 + 1) % items.length];
    const inventory = [
      {
        itemId: item1.cardId,
        name: item1.name,
        weight: item1.metadata?.weight ?? 2,
        quantity: 1,
        description: item1.description,
      },
      {
        itemId: item2.cardId,
        name: item2.name,
        weight: item2.metadata?.weight ?? 1,
        quantity: 1,
        description: item2.description,
      },
    ];

    // Ability from profession
    const activeAbility = prof.metadata?.activeAbility;
    const abilities = [
      {
        abilityId: prof.cardId,
        name: activeAbility?.name || prof.name,
        actionPoints: activeAbility?.apCost ?? 1,
        cooldownRemaining: 0,
        usesRemaining: activeAbility?.oncePerGame ? 1 : 999,
        metadata: activeAbility,
      },
    ];

    playerHands.set(player.playerId, {
      cards,
      inventory,
      abilities,
      secretQuests,
    });
  });

  return {
    catastrophe,
    bunkerArchetype,
    startingDefects,
    targetCapacityK,
    eliminationRoundsTotal,
    playerHands,
  };
}

export function executeMulliganReroll(
  player: IPlayerDocument,
  settings: Partial<ILobbySettings> = {}
): IDealtHand {
  if (player.remainingRerolls <= 0 && settings.rerollLimit !== 999) {
    throw new Error('NO_REROLLS_LEFT: No rerolls remaining for this player.');
  }

  // Draw fresh cards for this single player
  const mockPlayers = [player];
  const deal = dealInitialCards(
    [
      player,
      { ...player, playerId: 'mock_2' } as any,
      { ...player, playerId: 'mock_3' } as any,
      { ...player, playerId: 'mock_4' } as any,
    ],
    settings
  );

  const freshHand = deal.playerHands.get(player.playerId)!;
  return freshHand;
}
