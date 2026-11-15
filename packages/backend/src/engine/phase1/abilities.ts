import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { IGameStateDocument } from '@bunker/shared';
import { APEconomy } from './ap-economy.js';

export interface IAbilityExecutionContext {
  roomId: string;
  sourcePlayer: IPlayerDocument;
  targetPlayer?: IPlayerDocument;
  gameState: IGameStateDocument;
  payload?: any;
}

export interface IAbilityExecutionResult {
  success: boolean;
  abilityId: string;
  abilityName: string;
  apSpent: number;
  message: string;
  revealedCard?: any;
  shieldedPlayerId?: string;
  bonusVotes?: number;
  itemTransferred?: {
    fromPlayerId: string;
    toPlayerId: string;
    itemId: string;
  };
  eventPayload?: any;
}

export type AbilityHandler = (context: IAbilityExecutionContext) => Promise<IAbilityExecutionResult> | IAbilityExecutionResult;

export class AbilityRegistry {
  private static handlers = new Map<string, AbilityHandler>();

  public static register(abilityId: string, handler: AbilityHandler): void {
    this.handlers.set(abilityId, handler);
  }

  public static has(abilityId: string): boolean {
    return this.handlers.has(abilityId);
  }

  public static async execute(
    abilityId: string,
    context: IAbilityExecutionContext
  ): Promise<IAbilityExecutionResult> {
    const { sourcePlayer } = context;

    // 1. Locate player ability metadata
    const ability = sourcePlayer.abilities.find((a) => a.abilityId === abilityId) || {
      abilityId,
      name: abilityId,
      actionPoints: 1,
      cooldownRemaining: 0,
      usesRemaining: 999,
    };

    if (ability.cooldownRemaining > 0) {
      throw new Error(`ABILITY_ON_COOLDOWN: Ability "${ability.name}" is on cooldown for ${ability.cooldownRemaining} more round(s).`);
    }

    if (ability.usesRemaining <= 0) {
      throw new Error(`ABILITY_EXHAUSTED: Ability "${ability.name}" has no remaining uses.`);
    }

    const handler = this.handlers.get(abilityId);
    if (!handler) {
      throw new Error(`ABILITY_NOT_FOUND: Profession ability "${abilityId}" is not registered in AbilityRegistry.`);
    }

    const apCost = ability.actionPoints ?? 1;
    APEconomy.spendAP(sourcePlayer, apCost, `Used ability ${ability.name}`);

    // Update cooldown & uses
    const cd = (ability as any).metadata?.cooldownRounds ?? 1;
    ability.cooldownRemaining = cd;
    if (ability.usesRemaining < 900) {
      ability.usesRemaining -= 1;
    }

    return handler(context);
  }
}

// ---------------------------------------------------------------------------
// Helper: Reveal First Unrevealed Public Card
// ---------------------------------------------------------------------------
function revealFirstUnrevealedCard(targetPlayer: IPlayerDocument, preferredCategories: string[] = []): any | null {
  const cards = targetPlayer.cards || {};

  // Check preferred categories first
  for (const cat of preferredCategories) {
    if (cards[cat] && !cards[cat].isRevealed && !cards[cat].isSecret) {
      cards[cat].isRevealed = true;
      return cards[cat];
    }
  }

  // Fallback to any unrevealed non-secret card
  for (const [key, card] of Object.entries(cards)) {
    if (key !== 'special_condition' && !card.isRevealed && !card.isSecret) {
      card.isRevealed = true;
      return card;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// 1. MEDICINE (6 Professions)
// ---------------------------------------------------------------------------

// Doctor: Inspect Health / Bio
AbilityRegistry.register('prof_doctor', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Doctor inspection requires target player.');
  const targetHealth = ctx.targetPlayer.cards?.health;
  if (targetHealth) targetHealth.isRevealed = true;
  return {
    success: true,
    abilityId: 'prof_doctor',
    abilityName: 'Экстренный осмотр',
    apSpent: 1,
    revealedCard: targetHealth,
    message: `${ctx.sourcePlayer.nickname} провел экстренный медицинский осмотр ${ctx.targetPlayer.nickname} и огласил диагноз.`,
  };
});

// Paramedic: Emergency stabilization shield
AbilityRegistry.register('prof_paramedic', (ctx) => {
  const targetId = ctx.targetPlayer?.playerId || ctx.sourcePlayer.playerId;
  return {
    success: true,
    abilityId: 'prof_paramedic',
    abilityName: 'Полевая стабилизация',
    apSpent: 1,
    shieldedPlayerId: targetId,
    message: `${ctx.sourcePlayer.nickname} оказал полевую стабилизацию и защитил ${ctx.targetPlayer?.nickname || 'себя'} от изгнания в этом раунде!`,
  };
});

// Surgeon: Inspection & Injury diagnosis
AbilityRegistry.register('prof_surgeon', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Surgeon inspection requires target player.');
  const targetHealth = ctx.targetPlayer.cards?.health;
  if (targetHealth) targetHealth.isRevealed = true;
  return {
    success: true,
    abilityId: 'prof_surgeon',
    abilityName: 'Показ инструментов',
    apSpent: 1,
    revealedCard: targetHealth,
    message: `${ctx.sourcePlayer.nickname} продемонстрировал хирургический инструментарий и поставил диагноз ${ctx.targetPlayer.nickname}.`,
  };
});

// Midwife: Quiet confidence / vote support
AbilityRegistry.register('prof_midwife', (ctx) => {
  const target = ctx.targetPlayer || ctx.sourcePlayer;
  return {
    success: true,
    abilityId: 'prof_midwife',
    abilityName: 'Тихая уверенность',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} выразила поддержку кандидатуре ${target.nickname}, обеспечив +1 голос в раунде.`,
  };
});

// Pharmacist: Recipe / Med synthesis
AbilityRegistry.register('prof_pharmacist', (ctx) => {
  // Adds 1 medicine resource if in phase 2 or grants medkit
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.medicine += 1;
  }
  ctx.sourcePlayer.inventory.push({
    itemId: 'item_basic_antiseptic',
    name: 'Базовый антисептик',
    weight: 1,
    quantity: 1,
  });
  return {
    success: true,
    abilityId: 'prof_pharmacist',
    abilityName: 'Рецепт',
    apSpent: 2,
    message: `${ctx.sourcePlayer.nickname} синтезировал медикамент по специальному рецепту.`,
  };
});

// Veterinarian: Non-standard treatment / AP restoration
AbilityRegistry.register('prof_veterinarian', (ctx) => {
  const target = ctx.targetPlayer || ctx.sourcePlayer;
  target.actionPoints += 1;
  return {
    success: true,
    abilityId: 'prof_veterinarian',
    abilityName: 'Нестандартное решение',
    apSpent: 1,
    message: `${ctx.sourcePlayer.nickname} применил ветеринарную методику и восстановил 1 ОД ${target.nickname}.`,
  };
});

// ---------------------------------------------------------------------------
// 2. ENGINEERING (7 Professions)
// ---------------------------------------------------------------------------

// Engineer: Bunker Audit
AbilityRegistry.register('prof_engineer', (ctx) => {
  const defects = ctx.gameState.phase2?.activeDefects || [];
  return {
    success: true,
    abilityId: 'prof_engineer',
    abilityName: 'Аудит бункера',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} провел технический аудит конструкций бункера (обнаружено дефектов: ${defects.length}).`,
  };
});

// Mechanic: Emergency Repair
AbilityRegistry.register('prof_mechanic', (ctx) => {
  if (ctx.gameState.phase2?.activeDefects && ctx.gameState.phase2.activeDefects.length > 0) {
    const repaired = ctx.gameState.phase2.activeDefects.pop();
    return {
      success: true,
      abilityId: 'prof_mechanic',
      abilityName: 'Экстренный ремонт',
      apSpent: 1,
      message: `${ctx.sourcePlayer.nickname} выполнил экстренный ремонт и устранил поломку "${repaired}".`,
    };
  }
  return {
    success: true,
    abilityId: 'prof_mechanic',
    abilityName: 'Экстренный ремонт',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} отрегулировал механизмы бункера и заслужил доверие группы.`,
  };
});

// Electrician: Emergency Lighting
AbilityRegistry.register('prof_electrician', (ctx) => {
  let revealed: any = null;
  if (ctx.targetPlayer) {
    revealed = revealFirstUnrevealedCard(ctx.targetPlayer);
  }
  return {
    success: true,
    abilityId: 'prof_electrician',
    abilityName: 'Аварийное освещение',
    apSpent: 1,
    revealedCard: revealed,
    message: `${ctx.sourcePlayer.nickname} подключил аварийное освещение, пролив свет на скрытые обстоятельства.`,
  };
});

// Plumber: Water Analysis
AbilityRegistry.register('prof_plumber', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.water += 3;
  }
  return {
    success: true,
    abilityId: 'prof_plumber',
    abilityName: 'Анализ воды',
    apSpent: 1,
    message: `${ctx.sourcePlayer.nickname} провел анализ водоснабжения и оптимизировал подачу чистой воды (+3 Water).`,
  };
});

// Carpenter: Rapid Construction
AbilityRegistry.register('prof_carpenter', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.morale = Math.min(100, ctx.gameState.phase2.resources.morale + 2);
  }
  return {
    success: true,
    abilityId: 'prof_carpenter',
    abilityName: 'Быстрая постройка',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} возвел удобные нары и переборки, повысив комфорт лагеря (+2 Мораль).`,
  };
});

// Gunsmith: Arsenal Demonstration
AbilityRegistry.register('prof_gunsmith', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_gunsmith',
    abilityName: 'Показ арсенала',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} продемонстрировал надежность своего оружия и готовность защищать вход (+1 голос).`,
  };
});

// Sapper: Controlled Demolition / Perimeter Defense
AbilityRegistry.register('prof_sapper', (ctx) => {
  const targetId = ctx.sourcePlayer.playerId;
  return {
    success: true,
    abilityId: 'prof_sapper',
    abilityName: 'Контролируемый подрыв',
    apSpent: 1,
    shieldedPlayerId: targetId,
    message: `${ctx.sourcePlayer.nickname} доказал, что только он может безопасно разминировать гермодверь, нейтрализовав угрозу изгнания!`,
  };
});

// ---------------------------------------------------------------------------
// 3. SECURITY (6 Professions)
// ---------------------------------------------------------------------------

// Military Officer: Direct Order
AbilityRegistry.register('prof_military', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Military command requires target player.');
  const revealed = revealFirstUnrevealedCard(ctx.targetPlayer, ['fact', 'health', 'hobby']);
  return {
    success: true,
    abilityId: 'prof_military',
    abilityName: 'Приказ',
    apSpent: 1,
    revealedCard: revealed,
    message: `${ctx.sourcePlayer.nickname} отдал приказ, заставив ${ctx.targetPlayer.nickname} раскрыть скрытый факт.`,
  };
});

// Sniper: In the Crosshairs
AbilityRegistry.register('prof_sniper', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Sniper requires target player.');
  for (const ab of ctx.targetPlayer.abilities) {
    ab.cooldownRemaining = Math.max(ab.cooldownRemaining, 1);
  }
  return {
    success: true,
    abilityId: 'prof_sniper',
    abilityName: 'В прицеле',
    apSpent: 1,
    message: `${ctx.sourcePlayer.nickname} взял на мушку ${ctx.targetPlayer.nickname}, заблокировав его способности на этот раунд.`,
  };
});

// Security Officer: Inspection / Search
AbilityRegistry.register('prof_security', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Security inspection requires target player.');
  const revealed = revealFirstUnrevealedCard(ctx.targetPlayer, ['hobby', 'fact', 'health']);
  return {
    success: true,
    abilityId: 'prof_security',
    abilityName: 'Досмотр',
    apSpent: 1,
    revealedCard: revealed,
    message: `${ctx.sourcePlayer.nickname} провел личный досмотр ${ctx.targetPlayer.nickname}.`,
  };
});

// Firefighter: Evacuation
AbilityRegistry.register('prof_firefighter', (ctx) => {
  const targetId = ctx.targetPlayer?.playerId || ctx.sourcePlayer.playerId;
  return {
    success: true,
    abilityId: 'prof_firefighter',
    abilityName: 'Эвакуация',
    apSpent: 1,
    shieldedPlayerId: targetId,
    message: `${ctx.sourcePlayer.nickname} оперативно организовал эвакуацию при пожарной тревоге и защитил союзника.`,
  };
});

// Detective: Interrogation
AbilityRegistry.register('prof_detective', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Detective interrogation requires target player.');
  const revealed = revealFirstUnrevealedCard(ctx.targetPlayer);
  return {
    success: true,
    abilityId: 'prof_detective',
    abilityName: 'Допрос',
    apSpent: 1,
    revealedCard: revealed,
    message: `${ctx.sourcePlayer.nickname} провел перекрестный допрос и раскрыл улику против ${ctx.targetPlayer.nickname}.`,
  };
});

// Scout: Reconnaissance Intel
AbilityRegistry.register('prof_scout', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_scout',
    abilityName: 'Разведданные',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} предоставил разведывательные данные о ситуации снаружи бункера (+1 голос).`,
  };
});

// ---------------------------------------------------------------------------
// 4. SCIENCE (8 Professions)
// ---------------------------------------------------------------------------

// Scientist: Scientific Rationale
AbilityRegistry.register('prof_scientist', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_scientist',
    abilityName: 'Научное обоснование',
    apSpent: 1,
    shieldedPlayerId: ctx.sourcePlayer.playerId,
    message: `${ctx.sourcePlayer.nickname} научно доказал незаменимость своей квалификации для выживания убежища!`,
  };
});

// Chemist: Composition Analysis
AbilityRegistry.register('prof_chemist', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.air = Math.min(100, ctx.gameState.phase2.resources.air + 5);
  }
  return {
    success: true,
    abilityId: 'prof_chemist',
    abilityName: 'Анализ состава',
    apSpent: 2,
    message: `${ctx.sourcePlayer.nickname} оптимизировал фильтрационные химикаты (+5 к качеству воздуха).`,
  };
});

// Nuclear Physicist: Radiation Lecture
AbilityRegistry.register('prof_nuclear_physicist', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_nuclear_physicist',
    abilityName: 'Радиационная лекция',
    apSpent: 1,
    bonusVotes: 2,
    message: `${ctx.sourcePlayer.nickname} провел лекцию по радиационной безопасности, убедив участников собрания (+2 голоса).`,
  };
});

// Programmer: Data Hack
AbilityRegistry.register('prof_programmer', (ctx) => {
  let revealed: any = null;
  if (ctx.targetPlayer) {
    revealed = revealFirstUnrevealedCard(ctx.targetPlayer);
  }
  return {
    success: true,
    abilityId: 'prof_programmer',
    abilityName: 'Взлом данных',
    apSpent: 1,
    revealedCard: revealed,
    message: `${ctx.sourcePlayer.nickname} взломал базу данных и расшифровал секретную запись о цели.`,
  };
});

// Sysadmin: Emergency Backup
AbilityRegistry.register('prof_sysadmin', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_sysadmin',
    abilityName: 'Аварийный бэкап',
    apSpent: 1,
    shieldedPlayerId: ctx.sourcePlayer.playerId,
    message: `${ctx.sourcePlayer.nickname} активировал аварийную копию системы жизнеобеспечения бункера.`,
  };
});

// Hacker: Data Leak
AbilityRegistry.register('prof_hacker', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Hacker requires target player.');
  const card1 = revealFirstUnrevealedCard(ctx.targetPlayer);
  const card2 = revealFirstUnrevealedCard(ctx.targetPlayer);
  return {
    success: true,
    abilityId: 'prof_hacker',
    abilityName: 'Слив данных',
    apSpent: 1,
    revealedCard: card1 || card2,
    message: `${ctx.sourcePlayer.nickname} слил досье на ${ctx.targetPlayer.nickname}, раскрыв его скрытые параметры!`,
  };
});

// Biologist: Threat Analysis
AbilityRegistry.register('prof_biologist', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_biologist',
    abilityName: 'Анализ угрозы',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} классифицировал мутационные угрозы и снизил панику в лагере.`,
  };
});

// Geologist: Geological Map
AbilityRegistry.register('prof_geologist', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.water += 3;
  }
  return {
    success: true,
    abilityId: 'prof_geologist',
    abilityName: 'Геологическая карта',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} нашел подземный водоносный горизонт по геологической карте (+3 Water, +1 голос).`,
  };
});

// ---------------------------------------------------------------------------
// 5. PSYCHOLOGY / DIPLOMACY (8 Professions)
// ---------------------------------------------------------------------------

// Psychologist: Personality Analysis
AbilityRegistry.register('prof_psychologist', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Psychologist requires target player.');
  const targetChar = ctx.targetPlayer.cards?.character || ctx.targetPlayer.cards?.phobia;
  if (targetChar) targetChar.isRevealed = true;
  return {
    success: true,
    abilityId: 'prof_psychologist',
    abilityName: 'Анализ личности',
    apSpent: 1,
    revealedCard: targetChar,
    message: `${ctx.sourcePlayer.nickname} составил психологический профиль ${ctx.targetPlayer.nickname}.`,
  };
});

// Diplomat: Negotiations
AbilityRegistry.register('prof_diplomat', (ctx) => {
  const target = ctx.targetPlayer || ctx.sourcePlayer;
  return {
    success: true,
    abilityId: 'prof_diplomat',
    abilityName: 'Переговоры',
    apSpent: 1,
    bonusVotes: 1,
    shieldedPlayerId: target.playerId,
    message: `${ctx.sourcePlayer.nickname} заключил дипломатическое соглашение, защитив ${target.nickname} от давления.`,
  };
});

// Lawyer: Appeal
AbilityRegistry.register('prof_lawyer', (ctx) => {
  const targetId = ctx.targetPlayer?.playerId || ctx.sourcePlayer.playerId;
  return {
    success: true,
    abilityId: 'prof_lawyer',
    abilityName: 'Апелляция',
    apSpent: 1,
    shieldedPlayerId: targetId,
    message: `${ctx.sourcePlayer.nickname} подал юридическую апелляцию по регламенту отбора, защитив кандидата!`,
  };
});

// Teacher: Survival Lecture
AbilityRegistry.register('prof_teacher', (ctx) => {
  const target = ctx.targetPlayer || ctx.sourcePlayer;
  target.actionPoints += 1;
  return {
    success: true,
    abilityId: 'prof_teacher',
    abilityName: 'Урок выживания',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} провел инструктаж по технике выживания для ${target.nickname} (+1 ОД).`,
  };
});

// Priest: Absolution
AbilityRegistry.register('prof_priest', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.morale = Math.min(100, ctx.gameState.phase2.resources.morale + 3);
  }
  return {
    success: true,
    abilityId: 'prof_priest',
    abilityName: 'Отпущение',
    apSpent: 1,
    message: `${ctx.sourcePlayer.nickname} отпустил тревоги и укрепил духовную стойкость выживших (+3 Мораль).`,
  };
});

// Radio Operator: Emergency Broadcast
AbilityRegistry.register('prof_radio_operator', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_radio_operator',
    abilityName: 'Трансляция',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} поймал радиопередачу от выживших на волнах КВ, доказав ценность радиосвязи!`,
  };
});

// Psychiatrist: Forced Hospitalization / Quarantine
AbilityRegistry.register('prof_psychiatrist', (ctx) => {
  const targetId = ctx.targetPlayer?.playerId || ctx.sourcePlayer.playerId;
  return {
    success: true,
    abilityId: 'prof_psychiatrist',
    abilityName: 'Принудительная госпитализация',
    apSpent: 1,
    shieldedPlayerId: targetId,
    message: `${ctx.sourcePlayer.nickname} выписал постановление о медицинском карантине для защиты кандидата.`,
  };
});

// Interpreter: Accurate Translation
AbilityRegistry.register('prof_interpreter', (ctx) => {
  const target = ctx.targetPlayer || ctx.sourcePlayer;
  return {
    success: true,
    abilityId: 'prof_interpreter',
    abilityName: 'Точный перевод',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} мастерски переформулировал аргументы ${target.nickname}, расположив к нему собрание.`,
  };
});

// ---------------------------------------------------------------------------
// 6. SURVIVAL (7 Professions)
// ---------------------------------------------------------------------------

// Agronomist: Planting Plan
AbilityRegistry.register('prof_agronomist', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.food += 3;
  }
  return {
    success: true,
    abilityId: 'prof_agronomist',
    abilityName: 'План посевов',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} представил план агрокультуры и гидропоники (+3 Food, +1 голос).`,
  };
});

// Cook / Chef: Field Ration / Tasting
const cookHandler: AbilityHandler = (ctx) => {
  const target = ctx.targetPlayer || ctx.sourcePlayer;
  target.actionPoints += 1;
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.morale = Math.min(100, ctx.gameState.phase2.resources.morale + 2);
  }
  return {
    success: true,
    abilityId: 'prof_cook',
    abilityName: 'Полевой рацион',
    apSpent: 1,
    message: `${ctx.sourcePlayer.nickname} приготовил горячий питательный рацион для ${target.nickname} (+1 ОД).`,
  };
};
AbilityRegistry.register('prof_cook', cookHandler);
AbilityRegistry.register('prof_chef', cookHandler);

// Miner: Mineral Strike
AbilityRegistry.register('prof_miner', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.power += 3;
  }
  return {
    success: true,
    abilityId: 'prof_miner',
    abilityName: 'Нашёл залежи',
    apSpent: 1,
    message: `${ctx.sourcePlayer.nickname} нашел запасы горючих сланцев в штольне (+3 Энергия).`,
  };
});

// Farmer: Nature Knowledge
AbilityRegistry.register('prof_farmer', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.food += 2;
  }
  return {
    success: true,
    abilityId: 'prof_farmer',
    abilityName: 'Знание природы',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} организовал сохранение посевных семян и запасов (+2 Food).`,
  };
});

// Pilot: Emergency Route
AbilityRegistry.register('prof_pilot', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_pilot',
    abilityName: 'Аварийный маршрут',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} проложил авиационный маршрут к точке эвакуации (+1 голос).`,
  };
});

// Driver: Road Logistics
AbilityRegistry.register('prof_driver', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_driver',
    abilityName: 'Знаю дорогу',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} наметил безопасные пути снабжения колонн выживших (+1 голос).`,
  };
});

// Prepper: Personal Cache
AbilityRegistry.register('prof_prepper', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.food += 2;
    ctx.gameState.phase2.resources.water += 2;
  }
  return {
    success: true,
    abilityId: 'prof_prepper',
    abilityName: 'Личный запас',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} вскрыл свой автономный тайник, поделившись припасами с убежищем (+2 Food, +2 Water).`,
  };
});

// ---------------------------------------------------------------------------
// 7. CRIMINAL (4 Professions)
// ---------------------------------------------------------------------------

// Marauder: Ruin Trophy
AbilityRegistry.register('prof_marauder', (ctx) => {
  ctx.sourcePlayer.inventory.push({
    itemId: 'item_scavenged_scrap',
    name: 'Найденный трофей',
    weight: 1,
    quantity: 1,
  });
  return {
    success: true,
    abilityId: 'prof_marauder',
    abilityName: 'Трофей',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} добыл ценный предмет из руин и предложил его лагерю (+1 голос).`,
  };
});

// Pickpocket: Subtle Theft
AbilityRegistry.register('prof_pickpocket', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Pickpocket requires target player.');
  if (ctx.targetPlayer.inventory.length > 0) {
    const stolen = ctx.targetPlayer.inventory.shift()!;
    ctx.sourcePlayer.inventory.push(stolen);
    return {
      success: true,
      abilityId: 'prof_pickpocket',
      abilityName: 'Незаметное хищение',
      apSpent: 1,
      itemTransferred: {
        fromPlayerId: ctx.targetPlayer.playerId,
        toPlayerId: ctx.sourcePlayer.playerId,
        itemId: stolen.itemId,
      },
      message: `${ctx.sourcePlayer.nickname} незаметно вытащил ${stolen.name} из рюкзака ${ctx.targetPlayer.nickname}.`,
    };
  }
  return {
    success: true,
    abilityId: 'prof_pickpocket',
    abilityName: 'Незаметное хищение',
    apSpent: 1,
    message: `${ctx.sourcePlayer.nickname} попытался совершить кражу, но инвентарь цели пуст.`,
  };
});

// Spy: Disinformation
AbilityRegistry.register('prof_spy', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_spy',
    abilityName: 'Дезинформация',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} запустил дезинформацию среди участников, запутав оппонентов.`,
  };
});

// Saboteur: Trap / Mine System
AbilityRegistry.register('prof_saboteur', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_saboteur',
    abilityName: 'Закладка',
    apSpent: 1,
    shieldedPlayerId: ctx.sourcePlayer.playerId,
    message: `${ctx.sourcePlayer.nickname} предупредил о скрытой ловушке в вентиляции, предотвратив изгнание!`,
  };
});

// ---------------------------------------------------------------------------
// 8. OTHER (5 Professions)
// ---------------------------------------------------------------------------

// Safety Inspector: Compliance Check
AbilityRegistry.register('prof_safety_inspector', (ctx) => {
  if (!ctx.targetPlayer) throw new Error('TARGET_REQUIRED: Safety inspector requires target player.');
  const revealed = revealFirstUnrevealedCard(ctx.targetPlayer, ['health', 'fact', 'hobby']);
  return {
    success: true,
    abilityId: 'prof_safety_inspector',
    abilityName: 'Проверка соответствия',
    apSpent: 1,
    revealedCard: revealed,
    message: `${ctx.sourcePlayer.nickname} провел инспекцию по технике безопасности против ${ctx.targetPlayer.nickname}.`,
  };
});

// Journalist: Publication
AbilityRegistry.register('prof_journalist', (ctx) => {
  const target = ctx.targetPlayer || ctx.sourcePlayer;
  return {
    success: true,
    abilityId: 'prof_journalist',
    abilityName: 'Публикация',
    apSpent: 1,
    bonusVotes: 2,
    message: `${ctx.sourcePlayer.nickname} выпустил громкую статью о кандидатуре ${target.nickname} (+2 голоса).`,
  };
});

// Politician: Populism
AbilityRegistry.register('prof_politician', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_politician',
    abilityName: 'Популизм',
    apSpent: 1,
    bonusVotes: 2,
    message: `${ctx.sourcePlayer.nickname} произнес пламенную популистскую речь, склонив чашу весов (+2 решающих голоса).`,
  };
});

// Actor: Dramatic Role
AbilityRegistry.register('prof_actor', (ctx) => {
  return {
    success: true,
    abilityId: 'prof_actor',
    abilityName: 'Роль',
    apSpent: 1,
    bonusVotes: 1,
    shieldedPlayerId: ctx.sourcePlayer.playerId,
    message: `${ctx.sourcePlayer.nickname} блестяще сыграл драматическую роль, убедив всех в своей незаменимости!`,
  };
});

// Logistics Specialist: Warehouse Audit
AbilityRegistry.register('prof_logistics', (ctx) => {
  if (ctx.gameState.phase2?.resources) {
    ctx.gameState.phase2.resources.food += 1;
    ctx.gameState.phase2.resources.water += 1;
  }
  return {
    success: true,
    abilityId: 'prof_logistics',
    abilityName: 'Аудит склада',
    apSpent: 1,
    bonusVotes: 1,
    message: `${ctx.sourcePlayer.nickname} провел аудит складских остатков и оптимизировал распределение ресурсов.`,
  };
});

// ---------------------------------------------------------------------------
// Rhythm Mini-Game Resolution (Pickpocket)
// ---------------------------------------------------------------------------
export interface IPickpocketResult {
  score: number; // 0..5 hits
  sourcePlayer: IPlayerDocument;
  targetPlayer: IPlayerDocument;
  targetItemId: string;
}

export function resolvePickpocketMiniGame(result: IPickpocketResult): {
  success: boolean;
  cleanTheft: boolean;
  alertTriggered: boolean;
  thiefRevealed: boolean;
  transferredItem?: any;
  message: string;
} {
  const { score, sourcePlayer, targetPlayer, targetItemId } = result;

  const itemIndex = targetPlayer.inventory.findIndex((i) => i.itemId === targetItemId);
  if (itemIndex === -1) {
    throw new Error('ITEM_NOT_FOUND: Target player does not have specified item in inventory.');
  }

  if (score >= 5) {
    const [stolenItem] = targetPlayer.inventory.splice(itemIndex, 1);
    sourcePlayer.inventory.push(stolenItem);
    return {
      success: true,
      cleanTheft: true,
      alertTriggered: false,
      thiefRevealed: false,
      transferredItem: stolenItem,
      message: `${sourcePlayer.nickname} незаметно вытащил предмет из рюкзака цели.`,
    };
  } else if (score >= 3) {
    const [stolenItem] = targetPlayer.inventory.splice(itemIndex, 1);
    sourcePlayer.inventory.push(stolenItem);
    return {
      success: true,
      cleanTheft: false,
      alertTriggered: true,
      thiefRevealed: false,
      transferredItem: stolenItem,
      message: `Внимание! Кто-то украл предмет у ${targetPlayer.nickname}, но вор скрылся в суматохе!`,
    };
  } else {
    sourcePlayer.actionPoints = Math.max(0, sourcePlayer.actionPoints - 1);
    return {
      success: false,
      cleanTheft: false,
      alertTriggered: true,
      thiefRevealed: true,
      message: `Попытка кражи провалена! ${sourcePlayer.nickname} был пойман за руку при попытке ограбить ${targetPlayer.nickname}!`,
    };
  }
}
