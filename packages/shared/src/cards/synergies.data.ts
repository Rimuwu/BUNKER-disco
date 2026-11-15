import { IProfessionSynergy } from '../types/synergy.types.js';

export const professionSynergies: IProfessionSynergy[] = [
  {
    id: 'syn_doc_pharm',
    profession1Id: 'prof_doctor',
    profession2Id: 'prof_pharmacist',
    description: 'Удваивается эффективность лечения: Врач ставит диагноз, Аптекарь немедленно синтезирует нужный препарат. Суммарный медицинский бонус ×3.',
    bonusEffect: {
      resourceMultiplier: { resource: 'medicine', factor: 3 },
      customEffect: 'Удваивается эффективность лечения, суммарный медицинский бонус ×3.'
    }
  },
  {
    id: 'syn_agro_chem',
    profession1Id: 'prof_agronomist',
    profession2Id: 'prof_chemist',
    description: 'Химик создаёт оптимальные удобрения, Агроном применяет их в гидропонике: производство еды +50% к базовым показателям обоих.',
    bonusEffect: {
      resourceMultiplier: { resource: 'food', factor: 1.5 },
      customEffect: 'Производство еды +50% к базовым показателям обоих специалистов.'
    }
  },
  {
    id: 'syn_eng_elec',
    profession1Id: 'prof_engineer',
    profession2Id: 'prof_electrician',
    description: 'Совместно запускают все системы жизнеобеспечения за 5 дней вместо 15. Каждый усиливает эффективность другого на +20%.',
    bonusEffect: {
      customEffect: 'Запуск систем жизнеобеспечения за 5 дней вместо 15, эффективность каждого +20%.'
    }
  },
  {
    id: 'syn_nuke_elec',
    profession1Id: 'prof_nuclear_physicist',
    profession2Id: 'prof_electrician',
    description: 'Запуск ядерного реактора сокращается с 15 до 5 дней, а выработка энергии увеличивается на 2 уровня.',
    bonusEffect: {
      resourceMultiplier: { resource: 'power', factor: 2 },
      customEffect: 'Запуск ядерного реактора за 5 дней, выработка энергии увеличена на 2 уровня.'
    }
  },
  {
    id: 'syn_psych_dipl',
    profession1Id: 'prof_psychologist',
    profession2Id: 'prof_diplomat',
    description: 'Психолог готовит «психологический портрет» оппонента, Дипломат использует его в переговорах. Вместе нейтрализуют любой внутренний конфликт без потерь.',
    bonusEffect: {
      customEffect: 'Нейтрализуют любой внутренний конфликт без потерь.'
    }
  },
  {
    id: 'syn_det_spy',
    profession1Id: 'prof_detective',
    profession2Id: 'prof_spy',
    description: 'Детектив охотится на Шпиона, Шпион пытается его переиграть. Если они в одном бункере — Детектив получает +2 к проверке раскрытия, Шпион — +2 к сокрытию.',
    bonusEffect: {
      customEffect: 'Детектив получает +2 к раскрытию, Шпион получает +2 к сокрытию.'
    }
  },
  {
    id: 'syn_surg_paramed',
    profession1Id: 'prof_surgeon',
    profession2Id: 'prof_paramedic',
    description: 'Парамедик стабилизирует раненого, Хирург оперирует. Вместе снижают смертность от травм до 0%.',
    bonusEffect: {
      customEffect: 'Снижают смертность от травм до 0%.'
    }
  },
  {
    id: 'syn_prog_sysadmin',
    profession1Id: 'prof_programmer',
    profession2Id: 'prof_sysadmin',
    description: 'Вместе автоматизируют ВСЕ системы бункера, снижая ресурсопотребление на 50% и предотвращая любые технические сбои.',
    bonusEffect: {
      customEffect: 'Снижают суммарное ресурсопотребление систем на 50% и предотвращают технические сбои.'
    }
  },
  {
    id: 'syn_snip_scout',
    profession1Id: 'prof_sniper',
    profession2Id: 'prof_scout',
    description: 'Разведчик обнаруживает цель, Снайпер устраняет её. При внешней атаке вместе гарантированно нейтрализуют 3 угрозы без потерь.',
    bonusEffect: {
      customEffect: 'При внешней атаке гарантированно нейтрализуют 3 угрозы без потерь.'
    }
  },
  {
    id: 'syn_mar_driver',
    profession1Id: 'prof_marauder',
    profession2Id: 'prof_driver',
    description: 'Водитель доставляет Мародёра быстрее, тот возвращается с большим количеством ресурсов. Добыча с каждой вылазки ×2.',
    bonusEffect: {
      customEffect: 'Добыча ресурсов с каждой внешней вылазки удваивается (×2).'
    }
  },
  {
    id: 'syn_farm_agro',
    profession1Id: 'prof_farmer',
    profession2Id: 'prof_agronomist',
    description: 'Научный подход Агронома + практический опыт Фермера = максимальное производство еды в бункере (+4 еды каждые 5 дней суммарно).',
    bonusEffect: {
      customEffect: 'Производство еды увеличено на +4 единицы каждые 5 дней суммарно.'
    }
  },
  {
    id: 'syn_psychiatr_priest',
    profession1Id: 'prof_psychiatrist',
    profession2Id: 'prof_priest',
    description: 'Вместе закрывают все психологические и духовные потребности жителей. Уровень паники и стресса снижается до минимального значения.',
    bonusEffect: {
      customEffect: 'Уровень паники и стресса снижается до минимума, мораль стабилизирована.'
    }
  },
  {
    id: 'syn_sapp_milit',
    profession1Id: 'prof_sapper',
    profession2Id: 'prof_military',
    description: 'Военный командует защитой, Сапёр минирует периметр. Вероятность успешного вторжения внешних врагов снижается до 5%.',
    bonusEffect: {
      customEffect: 'Вероятность успешного вторжения внешних врагов снижается до 5%.'
    }
  },
  {
    id: 'syn_hack_radio',
    profession1Id: 'prof_hacker',
    profession2Id: 'prof_radio_operator',
    description: 'Хакер взламывает внешние сети, Радист поддерживает связь. Вместе первыми получают информацию о внешних событиях и могут манипулировать ею.',
    bonusEffect: {
      customEffect: 'Первыми получают внешнюю информацию и имеют возможность манипулировать перехваченными данными.'
    }
  },
  {
    id: 'syn_journ_polit',
    profession1Id: 'prof_journalist',
    profession2Id: 'prof_politician',
    description: 'Журналист формирует общественное мнение через «публикации», Политик использует его для «указов». Вместе контролируют внутреннюю повестку бункера.',
    bonusEffect: {
      customEffect: 'Полный контроль внутренней повестки и общественного мнения бункера.'
    }
  }
];
