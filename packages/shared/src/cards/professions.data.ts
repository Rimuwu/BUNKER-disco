import { ICardDocument, IProfessionMetadata } from '../types/card.types.js';

export const professionsDeck: ICardDocument[] = [
  // --- MEDICINE (6) ---
  {
    cardId: 'prof_doctor',
    category: 'profession',
    originTag: 'BASE',
    name: 'Врач',
    nameEn: 'Doctor',
    description: 'Опытный терапевт широкого профиля. Знает как лечить болезни, организовывать медпомощь и рационировать медикаменты.',
    metadata: {
      domain: 'MEDICINE',
      activeAbility: {
        name: 'Экстренный осмотр',
        description: 'Публично называет одного игрока и ставит диагноз: раскрывает один из его скрытых параметров (болезнь/возраст/здоровье) для всех.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Каждые 5 дней снижает общий уровень заболеваемости бункера на 1 ступень. При наличии Аптекаря удваивает эффективность лекарств.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_paramedic',
    category: 'profession',
    originTag: 'BASE',
    name: 'Парамедик',
    nameEn: 'Paramedic',
    description: 'Специалист скорой помощи, обученный работать в полевых условиях с минимумом ресурсов.',
    metadata: {
      domain: 'MEDICINE',
      activeAbility: {
        name: 'Полевая стабилизация',
        description: 'Выбирает игрока и спасает его в любой ситуации, давая защиту от одного голосования об исключении в этом раунде.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'В первые 10 дней любая критическая травма бункерника автоматически стабилизируется (тяжелораненый вместо смерти).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_surgeon',
    category: 'profession',
    originTag: 'BASE',
    name: 'Хирург',
    nameEn: 'Surgeon',
    description: 'Мастер операционного стола, способный выполнять сложные хирургические вмешательства в условиях бункера.',
    metadata: {
      domain: 'MEDICINE',
      activeAbility: {
        name: 'Показ инструментов',
        description: 'Демонстрирует скальпель и хирургический набор, снимая с себя один негативный жетон подозрения или угрозы.',
        apCost: 1,
        cooldownRounds: 0
      },
      survivalPassive: 'Снижает смертность от травм на 50%. Раз в 10 дней может провести операцию, убирающую одно постоянное увечье у жителя.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_midwife',
    category: 'profession',
    originTag: 'NEW',
    name: 'Акушерка',
    nameEn: 'Midwife',
    description: 'Специалист по родовспоможению и уходу за новорождёнными. В бункере незаменима для прироста популяции.',
    metadata: {
      domain: 'MEDICINE',
      activeAbility: {
        name: 'Тихая уверенность',
        description: 'Выбирает одного игрока и выражает ему поддержку; тот получает +1 к числу голосов за от других игроков в этом раунде.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Если в бункере есть пара репродуктивного возраста, прирост популяции через 20 дней снижает риск гибели матери до 0%.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_pharmacist',
    category: 'profession',
    originTag: 'NEW',
    name: 'Аптекарь',
    nameEn: 'Pharmacist',
    description: 'Знает состав, дозировку и взаимодействие лекарств. Умеет синтезировать базовые препараты из подручных химикатов.',
    metadata: {
      domain: 'MEDICINE',
      activeAbility: {
        name: 'Рецепт',
        description: 'Превращает ингредиент запасов бункера в лекарство, добавляя +1 к общему пулу медицинских ресурсов на 1 раунд.',
        apCost: 2,
        cooldownRounds: 0
      },
      survivalPassive: 'Удваивает срок годности медикаментов бункера. Каждые 7 дней производит 1 единицу базового антибиотика.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_veterinarian',
    category: 'profession',
    originTag: 'NEW',
    name: 'Ветеринар',
    nameEn: 'Veterinarian',
    description: 'Врач для животных, чьи знания анатомии и хирургии применимы к людям в чрезвычайных ситуациях.',
    metadata: {
      domain: 'MEDICINE',
      activeAbility: {
        name: 'Нестандартное решение',
        description: 'Объявляет, что вылечит непопулярный симптом (психоз, инфекцию), убеждая голосующих оставить его.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Снижает смертность скота/животных до нуля. Может заменять Врача при его отсутствии с эффективностью 70%.'
    } satisfies IProfessionMetadata
  },

  // --- ENGINEERING (7) ---
  {
    cardId: 'prof_engineer',
    category: 'profession',
    originTag: 'BASE',
    name: 'Инженер',
    nameEn: 'Engineer',
    description: 'Специалист широкого профиля в строительстве и инфраструктуре. Проектирует и возводит конструкции внутри бункера.',
    metadata: {
      domain: 'ENGINEERING',
      activeAbility: {
        name: 'Аудит бункера',
        description: 'Изучает карту бункера и публично называет одну скрытую проблему (трещина, утечка, слабый отсек), повышая свою ценность.',
        apCost: 1,
        cooldownRounds: 0
      },
      survivalPassive: 'Каждые 10 дней улучшает одну конструкцию бункера (стены, вентиляция, склады), повышая её надёжность на 1.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_mechanic',
    category: 'profession',
    originTag: 'BASE',
    name: 'Механик',
    nameEn: 'Mechanic',
    description: 'Мастер по ремонту техники и оборудования. Из металлолома сделает рабочий генератор.',
    metadata: {
      domain: 'ENGINEERING',
      activeAbility: {
        name: 'Экстренный ремонт',
        description: 'Немедленно чинит объявленную поломку бункера, убирая этот кризис из текущего раунда.',
        apCost: 1,
        cooldownRounds: 4
      },
      survivalPassive: 'Снижает скорость деградации оборудования бункера на 25%. При поломке любого агрегата чинит его в 2 раза быстрее.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_electrician',
    category: 'profession',
    originTag: 'BASE',
    name: 'Электрик',
    nameEn: 'Electrician',
    description: 'Специалист по электрическим сетям и энергоснабжению. В бункере без него темно и холодно.',
    metadata: {
      domain: 'ENGINEERING',
      activeAbility: {
        name: 'Аварийное освещение',
        description: 'Включает аварийный свет, раскрывая жетон одного скрытого события следующего раунда всем игрокам.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Поддерживает энергоснабжение бункера на базовом уровне. С Физиком-ядерщиком запускает реактор за 5 дней вместо 15.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_plumber',
    category: 'profession',
    originTag: 'BASE',
    name: 'Сантехник',
    nameEn: 'Plumber',
    description: 'Обеспечивает водоснабжение и канализацию — критически важные системы жизнеобеспечения бункера.',
    metadata: {
      domain: 'ENGINEERING',
      activeAbility: {
        name: 'Анализ воды',
        description: 'Берёт пробу воды и манипулирует информацией в свою пользу (чистая/заражённая).',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Поддерживает водоснабжение в рабочем состоянии. Предотвращает эпидемии заражения воды (холера, дизентерия).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_carpenter',
    category: 'profession',
    originTag: 'BASE',
    name: 'Плотник',
    nameEn: 'Carpenter',
    description: 'Мастер по дереву и конструкциям из подручных материалов. Строит мебель, полки и заграждения.',
    metadata: {
      domain: 'ENGINEERING',
      activeAbility: {
        name: 'Быстрая постройка',
        description: 'Обещает возвести улучшение немедленно, добавляя +2 к параметру комфорта бункера на 1 раунд.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Раз в 10 дней создаёт 1 единицу деревянного ресурса. Улучшает жилые условия, снижая стресс жителей на 1.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_gunsmith',
    category: 'profession',
    originTag: 'NEW',
    name: 'Оружейник',
    nameEn: 'Gunsmith',
    description: 'Специалист по обслуживанию, ремонту и созданию огнестрельного и холодного оружия.',
    metadata: {
      domain: 'ENGINEERING',
      activeAbility: {
        name: 'Показ арсенала',
        description: 'Демонстрирует список оружия, заставляя других игроков отдать ему 1 голос за или объяснить причину против.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Поддерживает боеспособность арсенала бункера. Каждые 15 дней создаёт 1 единицу боеприпасов из металлолома.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_sapper',
    category: 'profession',
    originTag: 'NEW',
    name: 'Сапёр',
    nameEn: 'Sapper / EOD Specialist',
    description: 'Специалист по взрывчатым веществам и разминированию. Незаменим при расчистке завалов и защите периметра.',
    metadata: {
      domain: 'ENGINEERING',
      activeAbility: {
        name: 'Контролируемый подрыв',
        description: 'Угрожает аргументом без меня выход заблокирован, нейтрализуя одну атаку против своей кандидатуры.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Защищает бункер от взрывов (утечка газа, старая мина). Минирует периметр, снижая риск вторжения.'
    } satisfies IProfessionMetadata
  },

  // --- SECURITY (6) ---
  {
    cardId: 'prof_military',
    category: 'profession',
    originTag: 'BASE',
    name: 'Военный',
    nameEn: 'Military Officer',
    description: 'Офицер вооружённых сил с опытом командования и боевых операций. Дисциплина и тактика.',
    metadata: {
      domain: 'SECURITY',
      activeAbility: {
        name: 'Приказ',
        description: 'Отдаёт приказ одному игроку правдиво публично ответить на один вопрос об его карточке.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Поддерживает порядок: снижает вероятность бунта на 30%. Увеличивает эффективность любой охраны на 20%.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_sniper',
    category: 'profession',
    originTag: 'BASE',
    name: 'Снайпер',
    nameEn: 'Sniper',
    description: 'Высококлассный стрелок на больших дистанциях. Терпелив, наблюдателен и хладнокровен.',
    metadata: {
      domain: 'SECURITY',
      activeAbility: {
        name: 'В прицеле',
        description: 'Берёт на мушку одного игрока, запрещая ему использовать активные способности в этом раунде.',
        apCost: 1,
        cooldownRounds: 4
      },
      survivalPassive: 'При внешнем столкновении гарантированно устраняет 1 угрозу без потерь со стороны бункера.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_security',
    category: 'profession',
    originTag: 'BASE',
    name: 'Сотрудник СБ',
    nameEn: 'Security Officer',
    description: 'Опытный охранник со знанием протоколов безопасности, тактики патрулирования и работы с внутренними угрозами.',
    metadata: {
      domain: 'SECURITY',
      activeAbility: {
        name: 'Досмотр',
        description: 'Объявляет досмотр одного игрока, заставляя того раскрыть один из своих скрытых параметров.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Снижает вероятность кражи до нуля. Выявляет шпионов и предателей на 15-й и 25-й день (бросок +2).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_firefighter',
    category: 'profession',
    originTag: 'BASE',
    name: 'Пожарный',
    nameEn: 'Firefighter',
    description: 'Специалист по ликвидации пожаров и аварийному спасению в замкнутых пространствах.',
    metadata: {
      domain: 'SECURITY',
      activeAbility: {
        name: 'Эвакуация',
        description: 'Объявляет пожар в зоне голосования: активные способности не применяются, голосование переносится.',
        apCost: 1,
        cooldownRounds: 5
      },
      survivalPassive: 'Автоматически нейтрализует событие Возгорание. Снижает ущерб от взрывов на 50%.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_detective',
    category: 'profession',
    originTag: 'BASE',
    name: 'Детектив',
    nameEn: 'Detective',
    description: 'Опытный следователь, специализирующийся на анализе улик, допросах и раскрытии скрытых мотивов.',
    metadata: {
      domain: 'SECURITY',
      activeAbility: {
        name: 'Допрос',
        description: 'Задаёт игроку 2 прямых вопроса о карточке; игрок обязан ответить да/нет и не может соврать дважды.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Раз в 10 дней устраняет внутренний конфликт без потерь. Раскрывает одного тайного агента.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_scout',
    category: 'profession',
    originTag: 'NEW',
    name: 'Разведчик',
    nameEn: 'Scout',
    description: 'Мастер наблюдения, маскировки и разведки на местности. Незаменим для рейдов за ресурсами.',
    metadata: {
      domain: 'SECURITY',
      activeAbility: {
        name: 'Разведданные',
        description: 'Сообщает секретную информацию о текущем кризисе, раскрывая его параметры и получая +1 голос.',
        apCost: 1,
        cooldownRounds: 0
      },
      survivalPassive: 'Каждые 7 дней приносит случайный ресурс с вылазки. Снижает вероятность засады при экспедициях на 40%.'
    } satisfies IProfessionMetadata
  },

  // --- SCIENCE (8) ---
  {
    cardId: 'prof_scientist',
    category: 'profession',
    originTag: 'BASE',
    name: 'Учёный',
    nameEn: 'Scientist',
    description: 'Универсальный исследователь с широкими знаниями в естественных науках. Анализирует и находит решения.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Научное обоснование',
        description: 'Доказывает, что его присутствие критично для текущей проблемы, получая иммунитет от исключения в раунде.',
        apCost: 1,
        cooldownRounds: 4
      },
      survivalPassive: 'Каждые 10 дней исследование даёт +1 к выбранному параметру (еда, медицина, энергия, безопасность).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_chemist',
    category: 'profession',
    originTag: 'BASE',
    name: 'Химик',
    nameEn: 'Chemist',
    description: 'Специалист по химическим процессам, синтезу веществ и анализу состава материалов.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Анализ состава',
        description: 'Анализирует ресурсы бункера и улучшает один из них (+1 к эффективности выбранного склада).',
        apCost: 2,
        cooldownRounds: 0
      },
      survivalPassive: 'Синтезирует дезинфекторы, удобрения и взрывчатку. Нейтрализует химические угрозы (Утечка токсинов).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_nuclear_physicist',
    category: 'profession',
    originTag: 'BASE',
    name: 'Физик-ядерщик',
    nameEn: 'Nuclear Physicist',
    description: 'Специалист по ядерным реакциям и радиационной защите. Управляет реактором или создаёт экранирование.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Радиационная лекция',
        description: 'Объясняет последствия радиации без защиты, получая +2 голоса от игроков без радиационной защиты.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Запускает ядерный реактор бункера на 15-й день (+3 к энергии). Снижает радиационный фон до нормы.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_programmer',
    category: 'profession',
    originTag: 'NEW',
    name: 'Программист',
    nameEn: 'Programmer',
    description: 'Разработчик ПО. В бункере управляет автоматизированными системами, сенсорами и базами данных.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Взлом данных',
        description: 'Получает доступ к базе данных бункера и раскрывает один скрытый параметр события или игрока.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Автоматизирует одну систему бункера, снижая её ресурсопотребление на 30%. Предотвращает сбои систем.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_sysadmin',
    category: 'profession',
    originTag: 'NEW',
    name: 'Системный администратор',
    nameEn: 'Sysadmin',
    description: 'Специалист по сетям и серверам. Поддерживает внутреннюю коммуникационную инфраструктуру бункера.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Аварийный бэкап',
        description: 'Откатывает результат текущего раунда голосования на начало (один раз за игру).',
        apCost: 1,
        cooldownRounds: 0,
        oncePerGame: true
      },
      survivalPassive: 'Обеспечивает работу радио и сенсоров. Первым получает уведомления об угрозах (+2 хода предупреждения).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_hacker',
    category: 'profession',
    originTag: 'NEW',
    name: 'Хакер',
    nameEn: 'Hacker',
    description: 'Специалист по кибербезопасности и взлому цифровых систем. Получает доступ к чужим секретам.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Слив данных',
        description: 'Раскрывает два скрытых параметра одного игрока на выбор хакера, демонстрируя досье всем.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Защищает цифровые системы от кибератак. Раз в 15 дней взламывает внешнюю сеть, добавляя ресурс.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_biologist',
    category: 'profession',
    originTag: 'NEW',
    name: 'Биолог',
    nameEn: 'Biologist',
    description: 'Специалист по живым организмам, экологии и эволюции. Незаменим при изучении мутаций и биоугроз.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Анализ угрозы',
        description: 'Раскрывает природу биологического события, снижая его эффект вдвое и получая +1 голос от медиков.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Идентифицирует биоугрозы за 2 дня до наступления. Помогает Агроному в гидропонике (+1 к урожаю).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_geologist',
    category: 'profession',
    originTag: 'NEW',
    name: 'Геолог',
    nameEn: 'Geologist',
    description: 'Специалист по породам и минералам. Знает, где искать воду, металлы и подземные полости.',
    metadata: {
      domain: 'SCIENCE',
      activeAbility: {
        name: 'Геологическая карта',
        description: 'Показывает карту пород вокруг бункера, получая +1 голос от строителей и инженеров.',
        apCost: 1,
        cooldownRounds: 0
      },
      survivalPassive: 'Снижает риск обвала бункера до нуля. Каждые 15 дней открывает подземный источник воды или металлов.'
    } satisfies IProfessionMetadata
  },

  // --- PSYCHOLOGY / DIPLOMACY (8) ---
  {
    cardId: 'prof_psychologist',
    category: 'profession',
    originTag: 'BASE',
    name: 'Психолог',
    nameEn: 'Psychologist',
    description: 'Специалист по психическому здоровью и человеческому поведению. Помогает справляться со стрессом.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Анализ личности',
        description: 'Выдаёт психологический профиль одного игрока, заставляя других усомниться в его аргументах.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Снижает стресс бункера на 1 каждые 5 дней. Предотвращает срыв одного жителя в критический момент.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_diplomat',
    category: 'profession',
    originTag: 'BASE',
    name: 'Дипломат',
    nameEn: 'Diplomat',
    description: 'Опытный переговорщик и посредник. Умеет находить компромиссы в любой ситуации.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Переговоры',
        description: 'Предлагает сделку: игрок голосует за Дипломата, а Дипломат обязуется защитить его в следующем раунде.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Снижает остроту бунтов и конфликтов на 1 ступень. Позволяет вести переговоры с внешними группами.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_lawyer',
    category: 'profession',
    originTag: 'BASE',
    name: 'Юрист',
    nameEn: 'Lawyer',
    description: 'Специалист в области права и юридических процедур. Мастер регламентов и правил голосования.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Апелляция',
        description: 'Оспаривает результат голосования, требуя повторного подсчёта по юридической процедуре.',
        apCost: 1,
        cooldownRounds: 5
      },
      survivalPassive: 'Составляет Устав бункера. Нарушители лишаются голоса. Может оспорить любое спорное решение.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_teacher',
    category: 'profession',
    originTag: 'BASE',
    name: 'Учитель',
    nameEn: 'Teacher',
    description: 'Педагог с широкими общими знаниями. Обеспечивает образование, передачу навыков и мораль.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Урок выживания',
        description: 'Проводит мини-лекцию об условиях бункера, получая +1 голос от каждого игрока, согласного с логикой.',
        apCost: 1,
        cooldownRounds: 0
      },
      survivalPassive: 'Каждые 10 дней обучает жителя новому навыку (+1 к эффективности профессии). Детская смертность 0%.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_priest',
    category: 'profession',
    originTag: 'BASE',
    name: 'Священник',
    nameEn: 'Priest',
    description: 'Духовный лидер и моральный авторитет общины. Поддерживает веру и волю к жизни.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Отпущение',
        description: 'Прощает игроку его самый опасный раскрытый параметр, нейтрализуя его негатив при голосовании.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Снижает панику на 2 при катастрофах. Предотвращает суициды. +1 к морали каждые 7 дней.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_radio_operator',
    category: 'profession',
    originTag: 'NEW',
    name: 'Радист',
    nameEn: 'Radio Operator',
    description: 'Специалист по радиосвязи. Единственный, кто может установить контакт с внешним миром.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Трансляция',
        description: 'Зачитывает перехваченное сообщение, раскрывая событие будущего хода или давая внешний союзник.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Поддерживает радиосвязь. Каждые 7 дней получает сигнал снаружи со случайной подсказкой.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_psychiatrist',
    category: 'profession',
    originTag: 'NEW',
    name: 'Психиатр',
    nameEn: 'Psychiatrist',
    description: 'Врач по психическим расстройствам. Определяет и лечит тяжёлые ментальные состояния.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Принудительная госпитализация',
        description: 'Изолирует одного игрока: тот не голосует и не использует способности, но не может быть исключён.',
        apCost: 1,
        cooldownRounds: 4
      },
      survivalPassive: 'Предотвращает психотические срывы. Снижает риск суицида до нуля. Лечит ПТСР у выживших.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_interpreter',
    category: 'profession',
    originTag: 'NEW',
    name: 'Переводчик',
    nameEn: 'Interpreter',
    description: 'Полиглот и культурный посредник. Незаменим при контактах с иностранными группами выживших.',
    metadata: {
      domain: 'PSYCHOLOGY_DIPLOMACY',
      activeAbility: {
        name: 'Точный перевод',
        description: 'Переформулирует аргумент игрока: даёт +1 голос за или намеренно отнимает -1 голос.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Переговоры с иностранными группами без риска конфликта. Снижает недопонимание между жителями.'
    } satisfies IProfessionMetadata
  },

  // --- SURVIVAL (7) ---
  {
    cardId: 'prof_agronomist',
    category: 'profession',
    originTag: 'BASE',
    name: 'Агроном',
    nameEn: 'Agronomist',
    description: 'Специалист по земледелию и агрокультуре. Организует устойчивое производство еды в бункере.',
    metadata: {
      domain: 'SURVIVAL',
      activeAbility: {
        name: 'План посевов',
        description: 'Раскрывает план еды: +2 к голосам за от игроков с едой в приоритете.',
        apCost: 1,
        cooldownRounds: 0
      },
      survivalPassive: 'Запускает гидропонику на 10-й день (+2 еды каждые 5 дней, с Химиком +3 еды).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_cook',
    category: 'profession',
    originTag: 'BASE',
    name: 'Повар',
    nameEn: 'Cook',
    description: 'Профессиональный кулинар, способный приготовить полноценные блюда из минимального набора.',
    metadata: {
      domain: 'SURVIVAL',
      activeAbility: {
        name: 'Дегустация',
        description: 'Предлагает фирменное блюдо: +1 голос от игроков с негативным параметром Голод.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Снижает расход еды на 15%. Раз в 10 дней устраивает пир (+2 к морали всех жителей).'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_miner',
    category: 'profession',
    originTag: 'BASE',
    name: 'Шахтёр',
    nameEn: 'Miner',
    description: 'Опытный горняк, привыкший работать под землёй. Может расширить бункер или добыть руду.',
    metadata: {
      domain: 'SURVIVAL',
      activeAbility: {
        name: 'Нашёл залежи',
        description: 'Обнаруживает ресурс в породе, добавляя бункеру +3 к случайному ресурсу немедленно.',
        apCost: 1,
        cooldownRounds: 4
      },
      survivalPassive: 'Каждые 15 дней открывает новый отсек бункера. Добывает +1 металл каждые 10 дней.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_farmer',
    category: 'profession',
    originTag: 'BASE',
    name: 'Фермер',
    nameEn: 'Farmer',
    description: 'Универсальный сельский хозяин: животноводство, растениеводство, переработка.',
    metadata: {
      domain: 'SURVIVAL',
      activeAbility: {
        name: 'Знание природы',
        description: 'Описывает способ добычи еды из доступных ресурсов: +1 голос от каждого голодного игрока.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Производит +1 еды каждые 3 дня (с Агрономом удваивается). Скотоводство даёт +2 еды каждые 10 дней.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_pilot',
    category: 'profession',
    originTag: 'NEW',
    name: 'Пилот',
    nameEn: 'Pilot',
    description: 'Военный или гражданский лётчик. Единственный, способный управлять вертолётом или самолётом.',
    metadata: {
      domain: 'SURVIVAL',
      activeAbility: {
        name: 'Аварийный маршрут',
        description: 'Описывает путь рейда, снимая кризис нехватки ресурсов за счёт внешней экспедиции.',
        apCost: 1,
        cooldownRounds: 4
      },
      survivalPassive: 'Увеличивает дальность рейдов техники на 50%. Единственный может выполнить Эвакуацию в финале.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_driver',
    category: 'profession',
    originTag: 'NEW',
    name: 'Водитель',
    nameEn: 'Driver',
    description: 'Профессиональный водитель тяжёлой техники. Мастер логистики и маршрутов снабжения.',
    metadata: {
      domain: 'SURVIVAL',
      activeAbility: {
        name: 'Знаю дорогу',
        description: 'Называет маршрут до ближайшей базы снабжения, добавляя +2 к ресурсам следующего рейда.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Рейды за ресурсами возвращаются на 2 дня раньше. Снижает риск аварий транспорта до нуля.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_prepper',
    category: 'profession',
    originTag: 'NEW',
    name: 'Снаряжённый выживальщик',
    nameEn: 'Prepper',
    description: 'Человек, годами готовившийся к апокалипсису. Имеет личный запас и навыки выживания.',
    metadata: {
      domain: 'SURVIVAL',
      activeAbility: {
        name: 'Личный запас',
        description: 'Раскрывает часть своего тайника, предлагая бункеру ресурс в обмен на гарантированное место.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Стартует с личным набором (+2 еды, +1 аптечка, +1 нож). 3 дня выживает без общих ресурсов.'
    } satisfies IProfessionMetadata
  },

  // --- CRIMINAL (4) ---
  {
    cardId: 'prof_marauder',
    category: 'profession',
    originTag: 'BASE',
    name: 'Мародёр',
    nameEn: 'Marauder',
    description: 'Опытный добытчик в руинах. Знает как найти ресурсы там, где другие видят только мусор.',
    metadata: {
      domain: 'CRIMINAL',
      activeAbility: {
        name: 'Трофей',
        description: 'Достаёт найденный предмет (случайная карта ресурса) и предлагает бункеру в обмен на голос за.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Каждые 7 дней приносит случайный ресурс из руин. Не ограничен периметром безопасности.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_pickpocket',
    category: 'profession',
    originTag: 'BASE',
    name: 'Карманник',
    nameEn: 'Pickpocket',
    description: 'Мастер лёгкой руки и незаметных манипуляций. Умеет брать чужое без следов.',
    metadata: {
      domain: 'CRIMINAL',
      activeAbility: {
        name: 'Незаметное хищение',
        description: 'Тайно крадёт один жетон (бонус/ресурс/защиту) у игрока, объявляется только в конце раунда.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Раз в 10 дней перераспределяет ресурс между складами без разрешения или изымает предмет.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_spy',
    category: 'profession',
    originTag: 'BASE',
    name: 'Шпион',
    nameEn: 'Spy',
    description: 'Агент разведки с двойной идентичностью. Мастер дезинформации и скрытых операций.',
    metadata: {
      domain: 'CRIMINAL',
      activeAbility: {
        name: 'Дезинформация',
        description: 'Распускает слух об одном игроке (выдуманный факт), который все принимают за правду до конца раунда.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Двойная карточка профессии на 20-й день. Получает информацию от куратора каждые 7 дней.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_saboteur',
    category: 'profession',
    originTag: 'NEW',
    name: 'Разведчик-диверсант',
    nameEn: 'Saboteur',
    description: 'Специалист по диверсиям и скрытому уничтожению инфраструктуры. Выводит системы из строя.',
    metadata: {
      domain: 'CRIMINAL',
      activeAbility: {
        name: 'Закладка',
        description: 'Тайно минирует систему: если попытаются исключить, система взрывается кризисом (один раз за игру).',
        apCost: 1,
        cooldownRounds: 0,
        oncePerGame: true
      },
      survivalPassive: 'Снижает боевой потенциал внешних врагов на 2 каждые 10 дней. Может саботировать систему по приказу.'
    } satisfies IProfessionMetadata
  },

  // --- OTHER (5) ---
  {
    cardId: 'prof_safety_inspector',
    category: 'profession',
    originTag: 'BASE',
    name: 'Пожарный инспектор / Шахтёрский инспектор',
    nameEn: 'Safety Inspector',
    description: 'Специалист по технике безопасности и предотвращению аварий. Соблюдает нормы и регламенты.',
    metadata: {
      domain: 'OTHER',
      activeAbility: {
        name: 'Проверка соответствия',
        description: 'Проводит инспекцию одного игрока, заставляя его раскрыть параметр и публично оправдать его.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Снижает частоту техногенных аварий на 40%. Выдаёт предписание за 2 хода до аварии.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_journalist',
    category: 'profession',
    originTag: 'NEW',
    name: 'Журналист',
    nameEn: 'Journalist',
    description: 'Профессиональный репортёр и хроникёр. Ведёт летопись и влияет на общественное мнение.',
    metadata: {
      domain: 'OTHER',
      activeAbility: {
        name: 'Публикация',
        description: 'Публикует статью об игроке: даёт +2 или -2 голоса на этот раунд голосования.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Ведёт Хронику бункера (+1 к морали). Его версия событий становится официальной историей.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_politician',
    category: 'profession',
    originTag: 'NEW',
    name: 'Политик',
    nameEn: 'Politician',
    description: 'Опытный государственный деятель. Привык управлять массами и принимать непопулярные решения.',
    metadata: {
      domain: 'OTHER',
      activeAbility: {
        name: 'Популизм',
        description: 'Произносит речь, гарантированно получая голос за от 2 игроков без защиты от манипуляций.',
        apCost: 1,
        cooldownRounds: 3
      },
      survivalPassive: 'Объявляет указы (правила на 5 дней). Имеет +1 к весу своего голоса при любых выборах.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_actor',
    category: 'profession',
    originTag: 'NEW',
    name: 'Актёр',
    nameEn: 'Actor',
    description: 'Профессиональный актёр. Мастер перевоплощения, убеждения и управления эмоциями публики.',
    metadata: {
      domain: 'OTHER',
      activeAbility: {
        name: 'Роль',
        description: 'На один раунд притворяется любой другой профессией, получая её пассивный бонус при голосовании.',
        apCost: 1,
        cooldownRounds: 4
      },
      survivalPassive: 'Снижает стресс постановками (-1 стресс каждые 7 дней). Увеличивает общую мораль на 1.'
    } satisfies IProfessionMetadata
  },
  {
    cardId: 'prof_logistics',
    category: 'profession',
    originTag: 'NEW',
    name: 'Логист',
    nameEn: 'Logistics Specialist',
    description: 'Специалист по цепочкам поставок и оптимизации ресурсов. Хранитель складов бункера.',
    metadata: {
      domain: 'OTHER',
      activeAbility: {
        name: 'Аудит склада',
        description: 'Проверяет инвентарь бункера, выявляя скрытые потери или добавляя бонусный ресурс за оптимизацию.',
        apCost: 1,
        cooldownRounds: 2
      },
      survivalPassive: 'Снижает потери ресурсов на складах на 20%. +1 к эффективности каждого склада еды и медикаментов.'
    } satisfies IProfessionMetadata
  }
];
