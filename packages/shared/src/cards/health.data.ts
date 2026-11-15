import { ICardDocument, IHealthMetadata } from '../types/card.types.js';

export const healthDeck: ICardDocument[] = [
  // --- BASE HEALTH CONDITIONS (16) ---
  {
    cardId: 'health_perfect',
    category: 'health',
    originTag: 'BASE',
    name: 'Идеальное здоровье',
    nameEn: 'Perfect Health',
    description: 'Персонаж абсолютно здоров. Нет хронических заболеваний, травм или ограничений.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: '+1 Соц при раскрытии — явный плюс для группы.',
      survivalPhaseEffect: '+1 ко всем броскам физической выносливости. Нет штрафов.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_broken_arm',
    category: 'health',
    originTag: 'BASE',
    name: 'Сломана рука',
    nameEn: 'Broken Arm',
    description: 'У персонажа сломана рука (гипс или шина). Восстановление: 10–15 дней.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Видно визуально — сложно скрыть. Может вызвать сомнения в полезности.',
      survivalPhaseEffect: '-2 к физическим заданиям первые 10 дней, затем -1 ещё 5 дней. Полное восстановление на 16-й день с медиком.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_color_blind',
    category: 'health',
    originTag: 'BASE',
    name: 'Дальтонизм',
    nameEn: 'Color Blindness',
    description: 'Персонаж не различает определённые цвета (красный/зелёный).',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Сложно заметить без теста.',
      survivalPhaseEffect: '-1 к заданиям с цветовой кодировкой (провода, карты, сигналы).'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_dust_allergy',
    category: 'health',
    originTag: 'BASE',
    name: 'Аллергия на пыль',
    nameEn: 'Dust Allergy',
    description: 'Хроническая аллергическая реакция на пыль и мелкие частицы.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Симптомы проявляются только в пыльной среде.',
      survivalPhaseEffect: 'В пыльных помещениях -1 Физ каждые 5 дней без антигистаминных. Раз в 10 дней возможен приступ.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_hiv',
    category: 'health',
    originTag: 'BASE',
    name: 'ВИЧ (контролируемый)',
    nameEn: 'HIV (Controlled)',
    description: 'Персонаж ВИЧ-положительный, принимает антиретровирусную терапию.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'При раскрытии возможна сильная негативная реакция других игроков.',
      survivalPhaseEffect: 'Без АРТ: -1 Мед каждые 10 дней. Не заразен при бытовом контакте. При травмах с кровью медик тратит защиту.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_pregnancy',
    category: 'health',
    originTag: 'BASE',
    name: 'Беременность (I триместр)',
    nameEn: 'Pregnancy (1st Trimester)',
    description: 'Персонаж беременен на раннем сроке. Токсикоз, усталость, уязвимость.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'На ранних сроках незаметно.',
      survivalPhaseEffect: '-1 Физ, запрет тяжёлых физических работ. На 30-й день роды (требуют акушерки или медика).'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_psychosis',
    category: 'health',
    originTag: 'BASE',
    name: 'Психоз',
    nameEn: 'Psychosis',
    description: 'Психотическое расстройство: галлюцинации, паранойя, дезориентация.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Странное поведение заметно, но диагноз неясен.',
      survivalPhaseEffect: 'Каждые 7 дней риск эпизода психоза (действие вне контроля игрока). Антипсихотики сдерживают приступы.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_alcoholism',
    category: 'health',
    originTag: 'BASE',
    name: 'Алкоголизм',
    nameEn: 'Alcoholism',
    description: 'Персонаж зависим от алкоголя. Без дозы начинается абстинентный синдром.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Запах и нервное поведение могут выдать.',
      survivalPhaseEffect: 'Без алкоголя каждые 3 дня -1 Псих. С алкоголем: Физ -1, Псих +1, Соц -1.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_missing_leg',
    category: 'health',
    originTag: 'BASE',
    name: 'Нет одной ноги',
    nameEn: 'Missing Leg',
    description: 'Персонаж лишился ноги. Передвигается с протезом или на костылях.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Невозможно скрыть.',
      survivalPhaseEffect: '-3 к физическим заданиям на передвижение. Нет штрафов на сидячую или интеллектуальную работу.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_blindness',
    category: 'health',
    originTag: 'BASE',
    name: 'Слепота (полная)',
    nameEn: 'Total Blindness',
    description: 'Персонаж полностью слеп, но компенсирует это обострённым слухом и осязанием.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Очевидно для всех окружающих.',
      survivalPhaseEffect: '-4 к визуальным заданиям, но +2 к прослушиванию и тактильности. Иммунитет к визуальным иллюзиям.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_arthritis',
    category: 'health',
    originTag: 'BASE',
    name: 'Артрит',
    nameEn: 'Arthritis',
    description: 'Хроническое воспаление суставов, боль и ограниченная подвижность.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Заметна скованность движений.',
      survivalPhaseEffect: '-1 к физическим заданиям постоянно (-2 в холоде и сырости). Не влияет на интеллект.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_diabetes',
    category: 'health',
    originTag: 'BASE',
    name: 'Диабет (I тип)',
    nameEn: 'Type 1 Diabetes',
    description: 'Инсулинозависимый диабет. Требует регулярных инъекций и контроля сахара.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до проверки запасов или медосмотра.',
      survivalPhaseEffect: 'Без инсулина: -1 HP каждые 2 дня. Риск гипогликемии при стрессе.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_cancer_remission',
    category: 'health',
    originTag: 'BASE',
    name: 'Рак в ремиссии',
    nameEn: 'Cancer in Remission',
    description: 'Персонаж перенёс онкологическое заболевание. Сейчас стабилен, но организм ослаблен.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Внешне выглядит здоровым.',
      survivalPhaseEffect: '-1 Физ, -1 Мед. Раз в 15 дней риск рецидива при стрессе. +1 Псих за счёт опыта борьбы.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_tattoos',
    category: 'health',
    originTag: 'BASE',
    name: 'Татуировки по всему телу',
    nameEn: 'Full Body Tattoos',
    description: 'Персонаж покрыт татуировками — выглядит устрашающе или экзотично.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Видно визуально при первой встрече.',
      survivalPhaseEffect: '+1 Соц при запугивании, -1 Соц при дипломатии с консерваторами. Нет физических штрафов.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_immunodeficiency',
    category: 'health',
    originTag: 'BASE',
    name: 'Иммунодефицит',
    nameEn: 'Immunodeficiency',
    description: 'Ослабленная иммунная система — любая инфекция смертельно опасна.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до анализа крови.',
      survivalPhaseEffect: 'Получает двойной урон от болезней. В антисанитарии: -1 HP каждые 5 дней.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_strong_immunity',
    category: 'health',
    originTag: 'BASE',
    name: 'Отличный иммунитет',
    nameEn: 'Strong Immunity',
    description: 'Персонаж редко болеет — крепкое здоровье и природная устойчивость к инфекциям.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрытый положительный параметр.',
      survivalPhaseEffect: '-1 к урону от болезней. Иммунитет к лёгким инфекциям. +1 к броскам выносливости.'
    } satisfies IHealthMetadata
  },

  // --- NEW HEALTH CONDITIONS (32) ---
  {
    cardId: 'health_asthma',
    category: 'health',
    originTag: 'NEW',
    name: 'Астма',
    nameEn: 'Asthma',
    description: 'Хроническое заболевание дыхательных путей. Физическая нагрузка и пыль вызывают приступы.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Кашель и одышка заметны при волнении.',
      survivalPhaseEffect: 'После тяжёлых физических заданий риск приступа (пропуск дня). Без ингалятора частота удваивается.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_epilepsy',
    category: 'health',
    originTag: 'NEW',
    name: 'Эпилепсия',
    nameEn: 'Epilepsy',
    description: 'Персонаж страдает от судорожных приступов.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто при отсутствии внешних триггеров.',
      survivalPhaseEffect: 'Каждые 10 дней риск приступа в произвольный момент. С противосудорожными препаратами риск снижен.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_deafness',
    category: 'health',
    originTag: 'NEW',
    name: 'Глухота (полная)',
    nameEn: 'Total Deafness',
    description: 'Персонаж полностью глух. Общается через жесты, письмо или чтение по губам.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Общение только письменно или жестами.',
      survivalPhaseEffect: 'Не слышит сигналы тревоги, но имеет +2 к визуальной наблюдательности и вниманию.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_claustrophobia',
    category: 'health',
    originTag: 'NEW',
    name: 'Клаустрофобия',
    nameEn: 'Claustrophobia',
    description: 'Панический страх замкнутых пространств. Бункер — личный ад для этого персонажа.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до первого спуска в тесное помещение.',
      survivalPhaseEffect: 'Каждые 5 дней -1 Псих. В тесных отсеках риск паники. Психолог снижает штраф вдвое.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_ptsd',
    category: 'health',
    originTag: 'NEW',
    name: 'ПТСР',
    nameEn: 'PTSD',
    description: 'Посттравматическое стрессовое расстройство после тяжелых потрясений.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до боевых или стрессовых триггеров.',
      survivalPhaseEffect: 'Громкие взрывы и насилие вызывают флэшбэки: -2 Псих на 2 дня. Терапия психолога снимает триггеры.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_obesity',
    category: 'health',
    originTag: 'NEW',
    name: 'Ожирение (III степень)',
    nameEn: 'Severe Obesity',
    description: 'Значительный избыточный вес существенно ограничивает подвижность.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Очевидно при первом взгляде.',
      survivalPhaseEffect: '-3 Физ, потребление ресурсов x1.3, но +1 к грубой силе при упоре массой.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_anorexia',
    category: 'health',
    originTag: 'NEW',
    name: 'Анорексия (активная фаза)',
    nameEn: 'Anorexia',
    description: 'Расстройство пищевого поведения. Отказ от еды приводит к истощению.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Заметная болезненная худоба.',
      survivalPhaseEffect: 'Потребляет ресурсы x0.5, но теряет 1 HP каждые 5 дней от истощения без помощи психолога.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_depression',
    category: 'health',
    originTag: 'NEW',
    name: 'Хроническая депрессия',
    nameEn: 'Chronic Depression',
    description: 'Тяжёлое аффективное расстройство: апатия, потеря мотивации и сил.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Маскируется под спокойствие или замкнутость.',
      survivalPhaseEffect: '-1 Псих постоянно. Каждые 10 дней кризис апатии (пропуск 2 дней работы). Снимается антидепрессантами.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_broken_leg',
    category: 'health',
    originTag: 'NEW',
    name: 'Сломана нога (свежий перелом)',
    nameEn: 'Broken Leg (Fresh)',
    description: 'Свежий перелом ноги: гипс, сильная боль, невозможность передвигаться самостоятельно.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Передвигается на костылях, очевидно для всех.',
      survivalPhaseEffect: '-4 Физ первые 15 дней, -2 Физ следующие 10 дней. Восстановление к 25 дню.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_antibiotic_allergy',
    category: 'health',
    originTag: 'NEW',
    name: 'Аллергия на антибиотики',
    nameEn: 'Antibiotic Allergy',
    description: 'Непереносимость стандартных антибиотиков — обычное лечение инфекций смертельно опасно.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до назначения терапии.',
      survivalPhaseEffect: 'Стандартные антибиотики наносят -2 HP вместо лечения. Требует специфических препаратов.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_hard_of_hearing',
    category: 'health',
    originTag: 'NEW',
    name: 'Тугоухость',
    nameEn: 'Hard of Hearing',
    description: 'Персонаж плохо слышит и нуждается в слуховом аппарате с батарейками.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Переспрашивает слова собеседников.',
      survivalPhaseEffect: 'Без слухового аппарата -2 к коммуникации. Аппарат требует регулярной замены батарей.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_parasitosis',
    category: 'health',
    originTag: 'NEW',
    name: 'Паразитоз',
    nameEn: 'Parasitosis',
    description: 'Внутренние паразиты истощают организм и несут скрытую опасность для соседей.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Внешне не проявляется.',
      survivalPhaseEffect: '-1 HP каждые 7 дней. При плохой гигиене есть риск заразить соседей по каюте.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_chronic_back_pain',
    category: 'health',
    originTag: 'NEW',
    name: 'Хроническая боль (спина)',
    nameEn: 'Chronic Back Pain',
    description: 'Межпозвоночная грыжа вызывает постоянные болевые ощущения при нагрузке.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Держится за поясницу, избегает тяжестей.',
      survivalPhaseEffect: '-1 Физ постоянно. При подъёме тяжестей риск обострения (-3 Физ на 3 дня).'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_sleepwalking',
    category: 'health',
    originTag: 'NEW',
    name: 'Лунатизм',
    nameEn: 'Sleepwalking',
    description: 'Персонаж ходит во сне и может совершать неосознанные опасные действия.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Днём никак не проявляется.',
      survivalPhaseEffect: 'Каждые 5 дней ночной эпизод: может открыть шлюз, сдвинуть запасы или разбудить отсек.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_criminal_tattoos',
    category: 'health',
    originTag: 'NEW',
    name: 'Татуировка с криминальной символикой',
    nameEn: 'Criminal Tattoos',
    description: 'Тюремные наколки на видных местах выдают тюремное прошлое.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Можно скрыть под одеждой, но при раздевании видна.',
      survivalPhaseEffect: '+2 к запугиванию, -2 к дипломатии. Детектив может запросить досье.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_autism',
    category: 'health',
    originTag: 'NEW',
    name: 'Аутизм (спектр, высокофункциональный)',
    nameEn: 'High-Functioning Autism',
    description: 'Особое восприятие мира, трудности с социальным кодом при высоком интеллекте.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Специфический зрительный контакт и манера речи.',
      survivalPhaseEffect: '-1 Соц, но +2 к точным техническим заданиям. Иммунитет к эмоциональным манипуляциям.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_heroin_addiction',
    category: 'health',
    originTag: 'NEW',
    name: 'Героиновая зависимость',
    nameEn: 'Heroin Addiction',
    description: 'Тяжёлая химическая зависимость. Без наркотиков наступает мучительная ломка.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто при наличии дозы.',
      survivalPhaseEffect: 'Без дозы: каждые 2 дня -2 Псих и -1 Физ. На 7 день кризис потери контроля.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_heart_defect',
    category: 'health',
    originTag: 'NEW',
    name: 'Порок сердца (компенсированный)',
    nameEn: 'Compensated Heart Defect',
    description: 'Порок сердца, стабильный при умеренной физической нагрузке.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до ЭКГ или аускультации.',
      survivalPhaseEffect: 'При экстремальных нагрузках риск сердечного приступа (пропуск 3 дней, нужен врач).'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_food_allergy',
    category: 'health',
    originTag: 'NEW',
    name: 'Аллергия на определённую еду',
    nameEn: 'Severe Food Allergy',
    description: 'Тяжёлая аллергия (орехи, глютен) с риском анафилактического шока.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до приёма пищи.',
      survivalPhaseEffect: 'При контакте с аллергеном -3 HP без адреналина. Требует строгого контроля пайка.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_severe_burn',
    category: 'health',
    originTag: 'NEW',
    name: 'Ожог большой площади (старый)',
    nameEn: 'Old Severe Burn',
    description: 'Рубцовая ткань стягивает кожу, ограничивая движения и напоминая о катастрофе.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Шрамы частично скрыты одеждой.',
      survivalPhaseEffect: '-1 к заданиям с открытым огнём и жаром. Психологическая устойчивость к боли: иммунитет к лёгким травмам.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_fever_recovering',
    category: 'health',
    originTag: 'NEW',
    name: 'Геморрагическая лихорадка (выздоравливающий)',
    nameEn: 'Hemorrhagic Fever (Recovering)',
    description: 'Недавно переболел опасной лихорадкой. Иммунитет выработан, но тело истощено.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Бледность и слабость после болезни.',
      survivalPhaseEffect: '-2 Физ первые 15 дней. Полный иммунитет к данному штамму в случае вспышки в бункере.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_migraine',
    category: 'health',
    originTag: 'NEW',
    name: 'Мигрень (хроническая)',
    nameEn: 'Chronic Migraine',
    description: 'Изнурительные приступы головной боли со свето- и звукочувствительностью.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто вне приступа.',
      survivalPhaseEffect: 'Каждые 7 дней риск приступа: пропуск дня работы и -1 Псих. При ярком свете бункера приступы чаще.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_radiation_mild',
    category: 'health',
    originTag: 'NEW',
    name: 'Радиационное облучение (лёгкое)',
    nameEn: 'Mild Radiation Exposure',
    description: 'Получил дозу радиации на поверхности. Симптомы накапливаются скрытно.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто без дозиметра или анализа крови.',
      survivalPhaseEffect: 'Каждые 10 дней -1 Мед (накапливается). На 30 день финальный бросок на последствия.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_multiple_fractures',
    category: 'health',
    originTag: 'NEW',
    name: 'Множественные переломы (после аварии)',
    nameEn: 'Multiple Fractures',
    description: 'Недавняя авария: множественные травмы костей требуют длительного ухода.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Многочисленные повязки и шины невозможно скрыть.',
      survivalPhaseEffect: '-4 Физ первые 10 дней, требует 1 ОД медика в день для перевязок и ухода.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_heat_stroke',
    category: 'health',
    originTag: 'NEW',
    name: 'Солнечный удар (хронический перегрев)',
    nameEn: 'Heat Intolerance',
    description: 'Нарушена терморегуляция: плохо переносит высокие температуры и духоту.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто в прохладном климате.',
      survivalPhaseEffect: 'При работе у генератора риск теплового удара каждые 5 дней. Требует увеличенный паёк воды.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_peak_physique',
    category: 'health',
    originTag: 'NEW',
    name: 'Физическое совершенство (спортсмен)',
    nameEn: 'Peak Athlete Physique',
    description: 'Профессиональный атлет. Пиковая физическая форма и невероятная выносливость.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Атлетическое телосложение видно сразу.',
      survivalPhaseEffect: '+3 Физ ко всем силовым заданиям. Потребляет ресурсы x1.2 из-за высокого метаболизма.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_pill_addiction',
    category: 'health',
    originTag: 'NEW',
    name: 'Лекарственная зависимость (рецептурная)',
    nameEn: 'Prescription Drug Addiction',
    description: 'Зависимость от успокоительных и обезболивающих препаратов.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до проверки медкарты.',
      survivalPhaseEffect: 'Без транквилизаторов: -1 Псих каждые 3 дня. Аптекарь может синтезировать безопасный заменитель.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_tbi',
    category: 'health',
    originTag: 'NEW',
    name: 'Черепно-мозговая травма (последствия)',
    nameEn: 'TBI Consequences',
    description: 'Последствия тяжёлой ЧМТ: периодические провалы памяти и замедленная реакция.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто при обычном разговоре.',
      survivalPhaseEffect: '-1 к интеллектуальным задачам. Раз в 10 дней временный провал памяти.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_tuberculosis',
    category: 'health',
    originTag: 'NEW',
    name: 'Инфекционный туберкулёз',
    nameEn: 'Infectious Tuberculosis',
    description: 'Активная форма инфекции: кашель с кровью, опасен для окружающих в замкнутом объёме.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Характерный кашель слышен окружающим.',
      survivalPhaseEffect: 'Без лечения -1 HP каждые 5 дней. Раз в 7 дней риск заразить соседей. Лечится 20+ дней.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_prosthetic_arm',
    category: 'health',
    originTag: 'NEW',
    name: 'Протез руки (механический)',
    nameEn: 'Prosthetic Arm',
    description: 'Механический протез руки. Функционален и надёжен, но уступает живой руке в точности.',
    metadata: {
      stealthTier: 'OPEN',
      selectionPhaseEffect: 'Механический протез заметен сразу.',
      survivalPhaseEffect: '-1 к мелкой моторике, но +1 к силовому хвату. При поломке чинится механиком.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_genetic_disease',
    category: 'health',
    originTag: 'NEW',
    name: 'Редкое генетическое заболевание',
    nameEn: 'Rare Genetic Disease',
    description: 'Необычная генетическая мутация с непредсказуемым набором симптомов.',
    metadata: {
      stealthTier: 'HIDDEN',
      selectionPhaseEffect: 'Скрыто до проявления симптомов.',
      survivalPhaseEffect: 'Уникальное ролевое событие каждые 10 дней, эффект генерируется ведущим.'
    } satisfies IHealthMetadata
  },
  {
    cardId: 'health_stroke_recovery',
    category: 'health',
    originTag: 'NEW',
    name: 'Восстановление после инсульта',
    nameEn: 'Stroke Recovery',
    description: 'Персонаж перенёс инсульт: частичный парез мышц лица и руки, затруднённая речь.',
    metadata: {
      stealthTier: 'PARTIALLY_HIDDEN',
      selectionPhaseEffect: 'Затруднённая речь и асимметрия заметны при общении.',
      survivalPhaseEffect: '-2 к коммуникации, -1 к точной работе. Физиотерапия медика снижает риски повторного удара.'
    } satisfies IHealthMetadata
  }
];
