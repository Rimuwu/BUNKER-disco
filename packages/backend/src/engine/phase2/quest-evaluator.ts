import { IPlayerDocument } from '../../db/repositories/player.repository.js';
import { IGameStateDocument } from '@bunker/shared';

export interface IQuestEvaluationResult {
  playerId: string;
  questCardId: string;
  questName: string;
  fulfilled: boolean;
  scoreBonus: number;
  reason: string;
}

export class QuestEvaluator {
  public static evaluateAllQuests(
    players: IPlayerDocument[],
    gameState: IGameStateDocument,
    isVictory: boolean
  ): IQuestEvaluationResult[] {
    const results: IQuestEvaluationResult[] = [];
    const aliveSurvivors = players.filter((p) => !p.isEliminated);
    const currentDay = gameState.phase2?.currentDay ?? 30;

    for (const player of players) {
      const quest = player.cards?.special_condition;
      if (!quest) continue;

      const cardId = quest.cardId;
      const questName = quest.name || 'Секретный квест';

      let fulfilled = false;
      let scoreBonus = 0;
      let reason = '';

      switch (cardId) {
        // 01. Нулевой пациент
        case 'sc_01_patient_zero': {
          fulfilled = !player.isEliminated || gameState.phase2?.resources?.food === 0 || (gameState as any).infectedCount >= 3;
          scoreBonus = fulfilled ? 200 : 0;
          reason = fulfilled
            ? 'Нулевой пациент: вирус успешно распространен среди жителей убежища.'
            : 'Квест провален: вирус изолирован.';
          break;
        }

        // 02. Агент корпорации
        case 'sc_02_corporate_agent': {
          fulfilled = !player.isEliminated && currentDay >= 20;
          scoreBonus = fulfilled ? 250 : 0;
          reason = fulfilled
            ? 'Корпоративный агент: данные успешно сохранены до финального этапа (День 20+).'
            : 'Квест провален: агент не дожил до рубежа Дня 20.';
          break;
        }

        // 03. Телохранитель
        case 'sc_03_bodyguard': {
          // Protected target: first other survivor or assigned target
          const targetId = (quest as any).metadata?.targetPlayerId || (player as any).bodyguardTargetId;
          const target = targetId ? players.find((p) => p.playerId === targetId) : players.find((p) => p.playerId !== player.playerId && !p.isEliminated);
          fulfilled = Boolean(target && !target.isEliminated && isVictory);
          scoreBonus = fulfilled ? 200 : 0;
          reason = fulfilled
            ? `Телохранитель: объект защиты (${target?.nickname || 'клиент'}) успешно пережил бункер.`
            : 'Квест провален: объект защиты погиб или бункер пал.';
          break;
        }

        // 04. Саботажник
        case 'sc_04_saboteur': {
          fulfilled = !isVictory;
          scoreBonus = fulfilled ? 300 : 0;
          reason = fulfilled
            ? 'Саботажник: миссия по срыву выживания бункера успешно выполнена.'
            : 'Бункер выжил — квест диверсанта провален.';
          break;
        }

        // 05. Пацифист
        case 'sc_05_pacifist': {
          const casualties = (gameState.phase2 as any)?.violentCasualties ?? 0;
          fulfilled = isVictory && !player.isEliminated && casualties === 0;
          scoreBonus = fulfilled ? 200 : 0;
          reason = fulfilled
            ? 'Пацифист: бункер пережил 30 дней без насильственных решений.'
            : 'Квест провален: в бункере применялось насилие.';
          break;
        }

        // 06. Параноик
        case 'sc_06_paranoiac': {
          const voluntaryReveals = (player as any).voluntaryRevealsCount ?? 0;
          fulfilled = !player.isEliminated && voluntaryReveals === 0;
          scoreBonus = fulfilled ? 150 : 0;
          reason = fulfilled
            ? 'Параноик: дожил до финала без единого добровольного раскрытия карт.'
            : 'Квест провален: параноик добровольно раскрыл карты.';
          break;
        }

        // 07. Коллекционер
        case 'sc_07_hoarder': {
          const itemCount = player.inventory?.length ?? 0;
          fulfilled = !player.isEliminated && itemCount >= 3;
          scoreBonus = fulfilled ? 200 : 0;
          reason = fulfilled
            ? `Коллекционер: сохранил ценный арсенал предметов (${itemCount} шт.) в бункере.`
            : 'Квест провален: недостаточно предметов в инвентаре.';
          break;
        }

        // 08. Предатель
        case 'sc_08_betrayer': {
          const exiledList = gameState.phase1?.exiledPlayers ?? [];
          const lastExiled = exiledList.length > 0 && exiledList[exiledList.length - 1] === player.playerId;
          const hasCriticalItem = player.inventory?.some((i) => i.itemId.includes('med') || i.itemId.includes('gen') || i.itemId.includes('radio'));
          fulfilled = lastExiled || (player.isEliminated && Boolean(hasCriticalItem));
          scoreBonus = fulfilled ? 250 : 0;
          reason = fulfilled
            ? 'Предатель: нанес критический удар при изгнании, унеся важный ресурс.'
            : 'Квест провален: условия предательства не выполнены.';
          break;
        }

        // 09. Культист
        case 'sc_09_cultist': {
          const cultFollowers = (player as any).cultFollowersCount ?? (aliveSurvivors.length >= 3 ? 3 : 0);
          fulfilled = !player.isEliminated && cultFollowers >= 3;
          scoreBonus = fulfilled ? 200 : 0;
          reason = fulfilled
            ? 'Культист: секта успешно сформирована и пережила катастрофу.'
            : 'Квест провален: культ не набрал достаточного числа последователей.';
          break;
        }

        // 10. Двойник
        case 'sc_10_doppelganger': {
          const exposed = (player as any).isDoppelgangerExposed ?? false;
          fulfilled = !player.isEliminated && !exposed;
          scoreBonus = fulfilled ? 180 : 0;
          reason = fulfilled
            ? 'Двойник: успешно имитировал чужую роль без разоблачения.'
            : 'Квест провален: двойник был разоблачен.';
          break;
        }

        // 11. Хранитель архива
        case 'sc_11_archivist': {
          const recordsCount = (player as any).archiveRecordsCount ?? currentDay;
          fulfilled = !player.isEliminated && recordsCount >= 5;
          scoreBonus = fulfilled ? 150 : 0;
          reason = fulfilled
            ? `Хранитель архива: собрал полную летопись выживания (${recordsCount} записей).`
            : 'Квест провален: архив не собран.';
          break;
        }

        // 12. Призрак прошлого
        case 'sc_12_ghost_of_the_past': {
          const sinExposed = (player as any).isSinExposed ?? false;
          fulfilled = !player.isEliminated && !sinExposed;
          scoreBonus = fulfilled ? 160 : 0;
          reason = fulfilled
            ? 'Призрак прошлого: сохранил тайну своего прошлого до самого конца.'
            : 'Квест провален: тайна прошлого была раскрыта.';
          break;
        }

        // 13. Медиатор
        case 'sc_13_mediator': {
          fulfilled = !player.isEliminated && isVictory;
          scoreBonus = fulfilled ? 180 : 0;
          reason = fulfilled
            ? 'Медиатор: успешно предотвратил раскол группы и сохранил единство.'
            : 'Квест провален.';
          break;
        }

        // 14. Последний романтик
        case 'sc_14_last_romantic': {
          fulfilled = !player.isEliminated && aliveSurvivors.length >= 2 && isVictory;
          scoreBonus = fulfilled ? 200 : 0;
          reason = fulfilled
            ? 'Последний романтик: сохранил человечность и любовь в суровом убежище.'
            : 'Квест провален.';
          break;
        }

        // 15. Ревизор
        case 'sc_15_auditor': {
          fulfilled = !player.isEliminated && currentDay >= 15;
          scoreBonus = fulfilled ? 170 : 0;
          reason = fulfilled
            ? 'Ревизор: успешно провел инспекцию и аудит материальных резервов.'
            : 'Квест провален.';
          break;
        }

        // 16. Одиночка
        case 'sc_16_lone_wolf': {
          fulfilled = !player.isEliminated && aliveSurvivors.length === 1;
          scoreBonus = fulfilled ? 300 : 0;
          reason = fulfilled
            ? 'Одиночка: пережил абсолютно всех и остался единственным хозяином бункера.'
            : 'Квест провален: в бункере выжили другие жители.';
          break;
        }

        // 17. Пророк
        case 'sc_17_prophet': {
          fulfilled = !player.isEliminated && isVictory;
          scoreBonus = fulfilled ? 190 : 0;
          reason = fulfilled
            ? 'Пророк: пророчества помогли убежищу подготовиться к кризисам.'
            : 'Квест провален.';
          break;
        }

        // 18. Контрабандист
        case 'sc_18_smuggler': {
          const contrabandSaved = player.inventory?.length >= 2;
          fulfilled = !player.isEliminated && contrabandSaved;
          scoreBonus = fulfilled ? 180 : 0;
          reason = fulfilled
            ? 'Контрабандист: сохранил тайную контрабанду в безопасности.'
            : 'Квест провален.';
          break;
        }

        // 19. Страховщик
        case 'sc_19_insurer': {
          fulfilled = !player.isEliminated && aliveSurvivors.length >= 2;
          scoreBonus = fulfilled ? 160 : 0;
          reason = fulfilled
            ? 'Страховщик: страховые обязательства выполнены, клиенты спасены.'
            : 'Квест провален.';
          break;
        }

        // 20. Мученик
        case 'sc_20_martyr': {
          // Wins if eliminated and bunker struggled or collapsed
          fulfilled = player.isEliminated && (!isVictory || aliveSurvivors.length <= 2);
          scoreBonus = fulfilled ? 250 : 0;
          reason = fulfilled
            ? 'Мученик: доказал правоту своей жертвы — без него убежище понесло потери.'
            : 'Квест провален: бункер прекрасно справился без мученика.';
          break;
        }

        // 21. Дипломатический иммунитет
        case 'sc_21_diplomatic_immunity': {
          fulfilled = !player.isEliminated;
          scoreBonus = fulfilled ? 150 : 0;
          reason = fulfilled
            ? 'Дипломатический иммунитет: избежал изгнания и вошел в число выживших.'
            : 'Квест провален.';
          break;
        }

        // 22. Близнецы
        case 'sc_22_twins': {
          fulfilled = !player.isEliminated && isVictory;
          scoreBonus = fulfilled ? 220 : 0;
          reason = fulfilled
            ? 'Близнецы: пережили 30 дней суровых испытаний вместе.'
            : 'Квест провален.';
          break;
        }

        // 23. Летописец апокалипсиса
        case 'sc_23_doomsday_chronicler': {
          fulfilled = !player.isEliminated && currentDay >= 15;
          scoreBonus = fulfilled ? 170 : 0;
          reason = fulfilled
            ? 'Летописец апокалипсиса: задокументировал хроники апокалипсиса для потомков.'
            : 'Квест провален.';
          break;
        }

        // 24. Инсайдер угрозы
        case 'sc_24_threat_insider': {
          fulfilled = !player.isEliminated && isVictory;
          scoreBonus = fulfilled ? 180 : 0;
          reason = fulfilled
            ? 'Инсайдер угрозы: ценные разведданные помогли предотвратить крах.'
            : 'Квест провален.';
          break;
        }

        // 25. Первородный грех
        case 'sc_25_original_sin': {
          const sinExposed = (player as any).isSinExposed ?? false;
          fulfilled = !player.isEliminated && !sinExposed;
          scoreBonus = fulfilled ? 190 : 0;
          reason = fulfilled
            ? 'Первородный грех: прожил 30 дней без разоблачения давней вины.'
            : 'Квест провален: первородный грех был раскрыт.';
          break;
        }

        // 26. Самозванец
        case 'sc_26_impostor': {
          const impostorExposed = (player as any).isImpostorExposed ?? false;
          fulfilled = !player.isEliminated && !impostorExposed;
          scoreBonus = fulfilled ? 200 : 0;
          reason = fulfilled
            ? 'Самозванец: успешно выдавал себя за другого специалиста до самого финала.'
            : 'Квест провален: фальшивка разоблачена.';
          break;
        }

        // 27. Вестник конца
        case 'sc_27_harbinger': {
          fulfilled = !player.isEliminated && (isVictory || currentDay >= 20);
          scoreBonus = fulfilled ? 170 : 0;
          reason = fulfilled
            ? 'Вестник конца: вовремя указал на уязвимости и спас группу.'
            : 'Квест провален.';
          break;
        }

        // 28. Страж ворот
        case 'sc_28_gatekeeper': {
          fulfilled = !player.isEliminated;
          scoreBonus = fulfilled ? 160 : 0;
          reason = fulfilled
            ? 'Страж ворот: использовал право вето и закрепил свое место в бункере.'
            : 'Квест провален.';
          break;
        }

        // 29. Эхо войны
        case 'sc_29_echo_of_war': {
          fulfilled = !player.isEliminated && isVictory;
          scoreBonus = fulfilled ? 180 : 0;
          reason = fulfilled
            ? 'Эхо войны: закаленный в боях ветеран прошел все испытания.'
            : 'Квест провален.';
          break;
        }

        // 30. Исповедник
        case 'sc_30_confessor': {
          fulfilled = !player.isEliminated && isVictory;
          scoreBonus = fulfilled ? 170 : 0;
          reason = fulfilled
            ? 'Исповедник: сохранил в тайне исповеди выживших и поддержал дух команды.'
            : 'Квест провален.';
          break;
        }

        default: {
          fulfilled = isVictory && !player.isEliminated;
          scoreBonus = fulfilled ? 100 : 0;
          reason = fulfilled ? 'Особое условие выполнено.' : 'Условие не выполнено.';
          break;
        }
      }

      results.push({
        playerId: player.playerId,
        questCardId: cardId,
        questName,
        fulfilled,
        scoreBonus,
        reason,
      });
    }

    return results;
  }
}
