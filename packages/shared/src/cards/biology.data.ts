import { ICardDocument, IBiologyAgeMetadata, IBiologyGenderMetadata } from '../types/card.types.js';

export const biologyAgeDeck: ICardDocument[] = [
  {
    cardId: 'bio_age_5_9',
    category: 'biology_age',
    originTag: 'BASE',
    name: '5–9 лет — Ребёнок',
    nameEn: '5–9 years — Child',
    description: 'Ребёнок не понимает всей серьёзности ситуации. Потребляет меньше ресурсов, держит мораль группы.',
    metadata: {
      ageRange: '5–9',
      stats: { phys: -2, psych: -1, soc: -1, med: 1 },
      resourceMultiplier: 0.5,
      specialRule: 'Если ребёнка хотят исключить, все игроки делают моральный бросок (пропуск способности).',
      roleplayHint: 'Играй наивно, задавай неудобные вопросы взрослым. Используй невинность как щит.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_10_14',
    category: 'biology_age',
    originTag: 'BASE',
    name: '10–14 лет — Подросток (ранний)',
    nameEn: '10–14 years — Early Teen',
    description: 'Ранний подросток. Быстро обучается, потребляет меньше ресурсов, но нуждается в опекуне.',
    metadata: {
      ageRange: '10–14',
      stats: { phys: -1, psych: -1, soc: 0, med: 1 },
      resourceMultiplier: 0.7,
      specialRule: 'Каждые 5 дней получает +1 к случайному стату. Без опекуна -1 Псих каждые 10 дней.',
      roleplayHint: 'Импульсивный, пробует казаться взрослее. Хорошо копирует авторитетного игрока рядом.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_15_19',
    category: 'biology_age',
    originTag: 'BASE',
    name: '15–19 лет — Подросток (старший)',
    nameEn: '15–19 years — Late Teen',
    description: 'Старший подросток. Высокая физическая энергия, максимализм и жажда доказать свою ценность.',
    metadata: {
      ageRange: '15–19',
      stats: { phys: 0, psych: -1, soc: 0, med: 0 },
      resourceMultiplier: 1.0,
      specialRule: 'Раз в 10 дней может предпринять безрассудное действие с бонусом +2.',
      roleplayHint: 'Максимализм, конфликты с авторитетами или слепое подражание.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_20_24',
    category: 'biology_age',
    originTag: 'BASE',
    name: '20–24 лет — Молодой взрослый',
    nameEn: '20–24 years — Young Adult',
    description: 'Молодой взрослый на пике физической формы и обучаемости. Быстро адаптируется к условиям.',
    metadata: {
      ageRange: '20–24',
      stats: { phys: 1, psych: 0, soc: 0, med: 0 },
      resourceMultiplier: 1.0,
      specialRule: 'Получает бонусные навыки от хобби на 1 уровень выше.',
      roleplayHint: 'Энергичный, амбициозный. Часто переоценивает силы, но быстро учится.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_25_34',
    category: 'biology_age',
    originTag: 'BASE',
    name: '25–34 лет — Взрослый (активный)',
    nameEn: '25–34 years — Active Adult',
    description: 'Активный взрослый. Базовый сбалансированный тип с отличным жизненным опытом и выносливостью.',
    metadata: {
      ageRange: '25–34',
      stats: { phys: 1, psych: 1, soc: 1, med: 0 },
      resourceMultiplier: 1.0,
      roleplayHint: 'Уверен в себе, имеет жизненный опыт без груза лет. Надёжный лидер или исполнитель.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_35_44',
    category: 'biology_age',
    originTag: 'BASE',
    name: '35–44 лет — Взрослый (зрелый)',
    nameEn: '35–44 years — Mature Adult',
    description: 'Зрелый взрослый. Прагматичный и взвешенный, отлично справляется с психологическими кризисами.',
    metadata: {
      ageRange: '35–44',
      stats: { phys: 0, psych: 2, soc: 1, med: 0 },
      resourceMultiplier: 1.0,
      specialRule: 'Раз в 15 дней может перебросить один провальный бросок психологической устойчивости.',
      roleplayHint: 'Прагматичный, взвешенный. Умеет держать себя в руках в панике.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_45_54',
    category: 'biology_age',
    originTag: 'BASE',
    name: '45–54 лет — Средний возраст',
    nameEn: '45–54 years — Middle Age',
    description: 'Человек среднего возраста с высоким социальным авторитетом и богатым опытом переговоров.',
    metadata: {
      ageRange: '45–54',
      stats: { phys: -1, psych: 2, soc: 2, med: 0 },
      resourceMultiplier: 1.0,
      specialRule: 'Голос этого персонажа весит 1.5x при голосованиях (округляется вверх).',
      roleplayHint: 'Видал многое, знает людей. Физически уступает молодым, но берёт мудростью.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_55_64',
    category: 'biology_age',
    originTag: 'BASE',
    name: '55–64 лет — Старший взрослый',
    nameEn: '55–64 years — Older Adult',
    description: 'Старший взрослый. Мудрый советник с замедленным физическим восстановлением.',
    metadata: {
      ageRange: '55–64',
      stats: { phys: -2, psych: 2, soc: 2, med: -1 },
      resourceMultiplier: 1.0,
      specialRule: 'Раз в 10 дней раскрывает подсказку ведущего. При угрозе исключения произносит Прощальную речь.',
      roleplayHint: 'Не торопится, говорит по делу. Играй с достоинством и скрытой грустью.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_65_74',
    category: 'biology_age',
    originTag: 'BASE',
    name: '65–74 лет — Пожилой',
    nameEn: '65–74 years — Elderly',
    description: 'Пожилой житель. Богатый практический опыт выживания при сниженных физических кондициях.',
    metadata: {
      ageRange: '65–74',
      stats: { phys: -3, psych: 1, soc: 1, med: -2 },
      resourceMultiplier: 0.8,
      specialRule: 'Потребляет ресурсы x0.8. Физические травмы наносят +1 урон.',
      roleplayHint: 'Медлителен, но опытен. Рассказывает истории прошлого, дающие контекст событиям.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_75_84',
    category: 'biology_age',
    originTag: 'NEW',
    name: '75–84 лет — Глубокая старость',
    nameEn: '75–84 years — Very Old',
    description: 'Глубокая старость. Живая легенда, способная один раз остановить исключение.',
    metadata: {
      ageRange: '75–84',
      stats: { phys: -4, psych: 1, soc: 0, med: -3 },
      resourceMultiplier: 0.6,
      specialRule: 'Один раз за игру может остановить голосование. При естественной смерти -1 Псих всем на 5 дней.',
      roleplayHint: 'Тихий и мудрый. Принимает неизбежное, может стать моральным якорем группы.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_85_90',
    category: 'biology_age',
    originTag: 'NEW',
    name: '85–90 лет — Старческий возраст',
    nameEn: '85–90 years — Senile Age',
    description: 'Старческий возраст. Крайне уязвим, требует постоянного медицинского внимания.',
    metadata: {
      ageRange: '85–90',
      stats: { phys: -5, psych: 0, soc: -1, med: -4 },
      resourceMultiplier: 0.5,
      specialRule: 'Всегда первым получает медицинскую помощь. При исключении все получают -2 Псих.',
      roleplayHint: 'Крайне уязвим. Играй медленно, путайся. Любимец группы или моральный балласт.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_90_plus',
    category: 'biology_age',
    originTag: 'NEW',
    name: '90+ лет — Долгожитель',
    nameEn: '90+ years — Centenarian',
    description: 'Долгожитель. Иммунитет к панике и уникальная способность снимать напряжение в бункере.',
    metadata: {
      ageRange: '90+',
      stats: { phys: -5, psych: 3, soc: 3, med: -5 },
      resourceMultiplier: 0.4,
      specialRule: 'Иммунитет к панике. Способность Прожитые века сбрасывает напряжение (+1 Псих всем). При доживании +1 победное очко.',
      roleplayHint: 'Видел войны и катастрофы. Говори редко, но весомо. Присутствие — событие.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_2_4',
    category: 'biology_age',
    originTag: 'NEW',
    name: '2–4 лет — Малыш',
    nameEn: '2–4 years — Toddler',
    description: 'Маленький ребёнок. Символ надежды, объединяющий группу, но требующий ухода опекуна.',
    metadata: {
      ageRange: '2–4',
      stats: { phys: -5, psych: -3, soc: -2, med: 2 },
      resourceMultiplier: 0.3,
      specialRule: 'Требует опекуна (1 ОД/день). Символ надежды дает +1 к морали. При смерти/исключении -3 Псих всем.',
      roleplayHint: 'Малыша отыгрывает опекун. Плачет, смеётся, сплачивает группу вокруг себя.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_0_1',
    category: 'biology_age',
    originTag: 'NEW',
    name: '0–1 год — Новорождённый',
    nameEn: '0–1 year — Infant',
    description: 'Младенец. Самый уязвимый персонаж в игре, требующий специального питания и постоянной опеки.',
    metadata: {
      ageRange: '0–1',
      stats: { phys: -6, psych: 0, soc: -3, med: 3 },
      resourceMultiplier: 0.3,
      specialRule: 'Требует молоко/питание (-1 HP/день без них). Плач привлекает угрозы (d6 на 1 = +1 угроза). Доступен при беременности/акушерке.',
      roleplayHint: 'Опекун несёт огромную нагрузку. Победа с младенцем — абсолютный триумф.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_unknown',
    category: 'biology_age',
    originTag: 'NEW',
    name: 'Неизвестный возраст — Загадочный тип',
    nameEn: 'Unknown Age — Enigma',
    description: 'Возраст намеренно скрыт до конца Отбора. Раскрытие даёт бонус неожиданности.',
    metadata: {
      ageRange: '???',
      stats: { phys: 0, psych: 0, soc: 0, med: 0 },
      resourceMultiplier: 1.0,
      specialRule: 'Возраст скрыт в Фазе 1. При раскрытии даёт +1 ко всем статам.',
      roleplayHint: 'Создаёт неопределённость. Одевается и говорит вне возраста. Держи интригу.'
    } satisfies IBiologyAgeMetadata
  },
  {
    cardId: 'bio_age_forged',
    category: 'biology_age',
    originTag: 'NEW',
    name: 'Любой возраст — Провальный документ',
    nameEn: 'Forged Age — Counterfeit Papers',
    description: 'Возраст в документах отличается от реального на 10–20 лет. Опасность разоблачения.',
    metadata: {
      ageRange: 'Fake',
      stats: { phys: 0, psych: 0, soc: 0, med: 0 },
      resourceMultiplier: 1.0,
      specialRule: 'При раскрытии обмана -2 Соц на 10 дней. Детектив и Шпион раскрывают автоматически.',
      roleplayHint: 'Живёшь с чужими документами. Беженец или человек с тёмным прошлым. Держи маску.'
    } satisfies IBiologyAgeMetadata
  }
];

export const biologyGenderDeck: ICardDocument[] = [
  {
    cardId: 'bio_gender_male',
    category: 'biology_gender',
    originTag: 'BASE',
    name: 'М — Мужчина',
    nameEn: 'M — Male',
    description: 'Персонаж идентифицирует себя как мужчина. Стандартный базовый вариант.',
    metadata: {
      gameplayEffect: 'Нет механических бонусов или штрафов.',
      hasSocialReactionRoll: false,
      roleplayHint: 'Стандартное ролевое поведение.'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_female',
    category: 'biology_gender',
    originTag: 'BASE',
    name: 'Ж — Женщина',
    nameEn: 'F — Female',
    description: 'Персонаж идентифицирует себя как женщина. Стандартный базовый вариант.',
    metadata: {
      gameplayEffect: 'Нет механических бонусов или штрафов.',
      hasSocialReactionRoll: false,
      roleplayHint: 'Стандартное ролевое поведение.'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_trans_male',
    category: 'biology_gender',
    originTag: 'BASE',
    name: 'Трансгендерный мужчина',
    nameEn: 'Transgender Man',
    description: 'Персонаж — трансгендерный мужчина (ФтМ). Опыт преодоления трудностей закалил характер.',
    metadata: {
      gameplayEffect: 'Бросок социальной реакции при раскрытии. Бонус +1 к Псих.',
      hasSocialReactionRoll: true,
      roleplayHint: 'Защитные правила: мисгендеринг оппонента даёт -1 Соц нарушителю.',
      pronounRule: 'Он / его'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_trans_female',
    category: 'biology_gender',
    originTag: 'BASE',
    name: 'Трансгендерная женщина',
    nameEn: 'Transgender Woman',
    description: 'Персонаж — трансгендерная женщина (МтФ). Опыт преодоления трудностей закалил характер.',
    metadata: {
      gameplayEffect: 'Бросок социальной реакции при раскрытии. Бонус +1 к Псих.',
      hasSocialReactionRoll: true,
      roleplayHint: 'Защитные правила: мисгендеринг оппонента даёт -1 Соц нарушителю.',
      pronounRule: 'Она / её'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_non_binary',
    category: 'biology_gender',
    originTag: 'NEW',
    name: 'Небинарный / Небинарная',
    nameEn: 'Non-Binary',
    description: 'Персонаж не идентифицирует себя ни с одним из бинарных полов. Воспринимается нейтрально.',
    metadata: {
      gameplayEffect: '+1 к броскам дипломатии. Раз в игру снимает поляризацию (останавливает конфликт).',
      hasSocialReactionRoll: false,
      roleplayHint: 'Нейтральные местоимения в ролевой речи (они / их).',
      pronounRule: 'Они / их'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_genderfluid',
    category: 'biology_gender',
    originTag: 'NEW',
    name: 'Гендерфлюид',
    nameEn: 'Genderfluid',
    description: 'Гендер меняется каждые 10 дней по броску кубика или выбору игрока.',
    metadata: {
      gameplayEffect: 'При смене гендера получает +1 к любому одному стату на 10 дней.',
      hasSocialReactionRoll: false,
      roleplayHint: 'Игроки адаптируют обращение в зависимости от текущего состояния.'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_agender',
    category: 'biology_gender',
    originTag: 'NEW',
    name: 'Агендер',
    nameEn: 'Agender',
    description: 'Персонаж не имеет гендерной идентичности. Иммунитет к гендерным манипуляциям.',
    metadata: {
      gameplayEffect: 'Иммунитет к гендерно-ориентированным манипуляциям. -1 к социальному давлению.',
      hasSocialReactionRoll: false,
      roleplayHint: 'Используют имя персонажа вместо местоимений.'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_intersex',
    category: 'biology_gender',
    originTag: 'NEW',
    name: 'Интерсекс',
    nameEn: 'Intersex',
    description: 'Биологические характеристики выходят за пределы бинарной модели.',
    metadata: {
      gameplayEffect: 'Медик получает +1 к броскам при лечении интерсекса. Бросок социальной реакции при раскрытии.',
      hasSocialReactionRoll: true,
      roleplayHint: 'Идентичность определяется игроком.'
    } satisfies IBiologyGenderMetadata
  },
  {
    cardId: 'bio_gender_hidden',
    category: 'biology_gender',
    originTag: 'NEW',
    name: 'Скрытый гендер',
    nameEn: 'Hidden Gender',
    description: 'Персонаж скрывает гендер под одеждой и маской. Виден только статус ???.',
    metadata: {
      gameplayEffect: 'Мини-игра угадай мой гендер (+1/-1 Соц). Раскрытие даёт +2 к броску убеждения.',
      hasSocialReactionRoll: false,
      roleplayHint: 'До раскрытия все обязаны использовать нейтральные местоимения.'
    } satisfies IBiologyGenderMetadata
  }
];
