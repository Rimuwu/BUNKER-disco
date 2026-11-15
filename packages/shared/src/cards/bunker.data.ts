import { ICardDocument, IBunkerRoomMetadata, IBunkerDefectMetadata, IBunkerArchetypeMetadata } from '../types/card.types.js';

export const bunkerRoomsDeck: ICardDocument[] = [
  {
    cardId: "room_01_airlock",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Шлюзовая камера",
    nameEn: "AirLock",
    description: "Двухкамерный герметичный тамбур с дезактивационным душем и бронедверью 4-го класса защиты.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Военный, Разведчик, Пожарный, Сапер."],
      roomEvents: ["*«Стук в дверь снаружи»*, *«Нарушение гермопечати»*, *«Возвращение сталкера с трофеями»*, *«Мародеры у периметра»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_02_hydroponics_bay",
    category: 'bunker_room',
    originTag: "EXPANSION",
    name: "Гидропонная ферма",
    nameEn: "Hydroponics Bay",
    description: "Стеллажи с фитолампами, питательными субстратами и замкнутым капельным орошением.",
    metadata: {
      powerDraw: 2,
      waterDraw: 1.5,
      foodOutput: 3,
      workerCapacity: 2,
      effectiveProfessions: ["Агроном, Фермер, Ботаник, Химик."],
      roomEvents: ["*«Грибковая гниль корней»*, *«Рекордный сбор питательных водорослей»*, *«Перегорание фитоматрицы»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_03_generator_core",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Машинное отделение и Генераторная",
    nameEn: "Generator Core",
    description: "Вибрирующий дизель-генератор или малогабаритный радиоизотопный термоэлектрический генератор (РИТЭГ).",
    metadata: {
      powerDraw: -10,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Электрик, Механик, Инженер, Физик-ядерщик."],
      roomEvents: ["*«Утечка дизеля»*, *«Критический перегрев обмотки»*, *«Короткое замыкание»*, *«Черный дым в кабельном канале»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_04_life_support_ventilation",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Фильтровентиляционная установка / ФВУ",
    nameEn: "Life Support & Ventilation",
    description: "Система угольных поглотителей, каталитических фильтров и компрессоров регенерации кислорода.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Сантехник, Пожарный, Шахтер, Инженер."],
      roomEvents: ["*«Токсичный осадок в фильтре»*, *«Клин компрессора»*, *«Просачивание угарного газа»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_05_medbay",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Медицинский отсек",
    nameEn: "MedBay",
    description: "Операционный стол, шкафы с медикаментами, кварцевая лампа и мониторы жизненных показателей.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Врач, Хирург, Парамедик, Акушерка, Аптекарь."],
      roomEvents: ["*«Инфицирование раны»*, *«Успешная сложная операция»*, *«Синтез кустарного анальгетика»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_06_kitchen_mess_hall",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Кухня и Пищеблок",
    nameEn: "Kitchen & Mess Hall",
    description: "Электроплита, автоклав-консервооткрыватель, длинный металлический стол для общего приема пищи.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Повар, Пекарь, Технолог пищепрома."],
      roomEvents: ["*«Праздничный ужин из тушенки»*, *«Подгоревший суп — ссора за столом»*, *«Вздутая банка консервов»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_07_workshop",
    category: 'bunker_room',
    originTag: "EXPANSION",
    name: "Мастерская и Крафт-лаборатория",
    nameEn: "Workshop",
    description: "Верстак, тиски, токарный станок по металлу, 3D-принтер прототипирования и ящики метизов.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Плотник, Механик, Оружейник, Слесарь, Сварщик."],
      roomEvents: ["*«Сломалось сверло»*, *«Гениальное изобретение из мусора»*, *«Травма на циркулярной пиле»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_08_comms_station",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Радиорубка и Центр связи",
    nameEn: "Comms Station",
    description: "Стойка трансиверов КВ/УКВ, поворотное устройство внешней антенны, криптографический терминал.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Радист, Системный администратор, Хакер, Военный."],
      roomEvents: ["*«Перехват сигнала бедствия»*, *«Координаты военного сброса»*, *«Атмосферные помехи шторма»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_09_crew_quarters",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Жилой отсек / Каюты",
    nameEn: "Crew Quarters",
    description: "Двухъярусные койки с виниловыми матрасами, индивидуальные рундуки, тусклые ночники.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Психолог, Учитель, Священник (поддержание порядка и психологической разгрузки)."],
      roomEvents: ["*«Бессонница от кошмаров»*, *«Тайная кража из рундука»*, *«Интимная близость выживших (+Мораль)»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_10_armory",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Арсенал и Оружейная комната",
    nameEn: "Armory",
    description: "Сейфы за кодовой решеткой, пирамиды для автоматов, цинки с патронами и бронежилеты.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Оружейник, Военный, Снайпер, Сотрудник СБ."],
      roomEvents: ["*«Самопроизвольный выстрел при чистке»*, *«Отсыревший порох»*, *«Попытка тайного взлома сейфа саботажником»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_11_science_lab",
    category: 'bunker_room',
    originTag: "NEW",
    name: "Научная химико-биологическая лаборатория",
    nameEn: "Science Lab",
    description: "Вытяжные шкафы, центрифуги, спектрометры, реактивы в ампулах и герметичные перчаточные боксы.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Ученый, Химик, Физик, Фармацевт, Вирусолог."],
      roomEvents: ["*«Разбитая пробирка с патогеном»*, *«Открытие формулы антирадина»*, *«Химический хлопок»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_12_water_treatment_plant",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Очистные сооружения и Водокачка",
    nameEn: "Water Treatment Plant",
    description: "Артезианский скважинный насос, накопительные резервуары, песчано-гравийные и мембранные фильтры.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Сантехник, Инженер, Шахтер, Эколог."],
      roomEvents: ["*«Заиливание скважины»*, *«Прорыв трубы под полом»*, *«Химическое загрязнение горизонта»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_13_brig_quarantine_cell",
    category: 'bunker_room',
    originTag: "NEW",
    name: "Карцер / Изолятор",
    nameEn: "Brig & Quarantine Cell",
    description: "Бронированная камера с глазком, внешним замком и автономным воздуховодом.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Детектив, Сотрудник СБ, Юрист, Военный."],
      roomEvents: ["*«Попытка подкупа охранника»*, *«Бунт заключенного»*, *«Чистосердечное признание»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_14_lounge_archive",
    category: 'bunker_room',
    originTag: "EXPANSION",
    name: "Библиотека и Зал психологической разгрузки",
    nameEn: "Lounge & Archive",
    description: "Книжные полки, шахматный стол, проектор диафильмов, акустическая гитара и мягкие кресла.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Психолог, Учитель, Библиотекарь, Дипломат, Священник."],
      roomEvents: ["*«Теплый вечер воспоминаний»*, *«Драка из-за разорванной редкой книги»*, *«Находка полезной инструкции по выживанию»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_15_deep_storage_vault",
    category: 'bunker_room',
    originTag: "BASE",
    name: "Склад материального резерва",
    nameEn: "Deep Storage Vault",
    description: "Стеллажи с опломбированными ящиками Госрезерва, погрузочная таль и инвентарные описи.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Кладовщик, Бухгалтер, Мародер, Логист."],
      roomEvents: ["*«Обнаружение забытого опломбированного ящика»*, *«Падение стеллажа»*, *«Инвентаризационная недостача»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  },
  {
    cardId: "room_16_incinerator_waste_disposal",
    category: 'bunker_room',
    originTag: "NEW",
    name: "Мусоросжигатель и Крематорий",
    nameEn: "Incinerator & Waste Disposal",
    description: "Высокотемпературная печь с дожигом газов для утилизации биоотходов и опасных предметов.",
    metadata: {
      powerDraw: 2,
      waterDraw: 0,
      foodOutput: 0,
      workerCapacity: 2,
      effectiveProfessions: ["Пожарный, Шахтер, Патологоанатом."],
      roomEvents: ["*«Забитый колосник печи»*, *«Выброс сажи в жилой сектор»*, *«Случайно сожженная ценная вещь»*."],
      roomUpgrades: [""]
    } satisfies IBunkerRoomMetadata
  }
];

export const bunkerDefectsDeck: ICardDocument[] = [
  {
    cardId: "defect_def_01_drainage_pump_clog",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Засор дренажной помпы",
    nameEn: "Drainage Pump Clog",
    description: "Затоплен технический отсек, уровень грунтовых вод поднимается.",
    metadata: {
      defectCode: "DEF-01",
      failurePenalty: "Потребление POWER +1/день; риск замыкания комнат 20%/день.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["1 Инструмент + Механик/Сантехник (работа 1 день)."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  },
  {
    cardId: "defect_def_02_airlock_microcrack",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Микротрещина шлюза",
    nameEn: "Airlock Microcrack",
    description: "Разгерметизация внешнего контура, утечка радиации/токсинов.",
    metadata: {
      defectCode: "DEF-02",
      failurePenalty: "AIR падает на 2 ед./день быстрее; Мораль -1/день.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["1 Инструмент + Инженер/Сварщик/Сапер."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  },
  {
    cardId: "defect_def_03_hydrant_mold_infestation",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Плесень в гидранте",
    nameEn: "Hydrant Mold Infestation",
    description: "Заражение основного бака технической водой.",
    metadata: {
      defectCode: "DEF-03",
      failurePenalty: "Расход WATER +25%; 15% риск отравления выживших.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["2 Медикамента + Химик/Врач/Агроном."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  },
  {
    cardId: "defect_def_04_power_grid_automation_glitch",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Сбой автоматики энергосети",
    nameEn: "Power Grid Automation Glitch",
    description: "Скачки напряжения выбивают предохранители в отсеках.",
    metadata: {
      defectCode: "DEF-04",
      failurePenalty: "1 случайная комната обесточивается каждый 2-й день.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["1 Инструмент + Электрик/Системный администратор/Инженер."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  },
  {
    cardId: "defect_def_05_storage_rat_nest",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Крысиное гнездо в кладовой",
    nameEn: "Storage Rat Nest",
    description: "Грызуны повредили картонную тару с сухпайками.",
    metadata: {
      defectCode: "DEF-05",
      failurePenalty: "Стартовый запас FOOD уменьшен на 15%; риск инфекций.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["Любой персонаж с оружием или Хобби Охота/Кошки."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  },
  {
    cardId: "defect_def_06_damaged_ventilation_flap",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Выбитая вентиляционная заслонка",
    nameEn: "Damaged Ventilation Flap",
    description: "Шумный гул и вибрации по вентиляционной шахте.",
    metadata: {
      defectCode: "DEF-06",
      failurePenalty: "MORALE штраф -3 ежедневно; сон персонажей нарушен.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["1 Инструмент + Шахтер/Плотник/Механик."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  },
  {
    cardId: "defect_def_07_radio_mast_failure",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Отказ радиомачты",
    nameEn: "Radio Mast Failure",
    description: "Антенна на поверхности застряла в сложенном состоянии.",
    metadata: {
      defectCode: "DEF-07",
      failurePenalty: "Модуль внешней связи заблокирован до выхода наружу/ремонта.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["1 Инструмент + Радист/Связист/Хакер."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  },
  {
    cardId: "defect_def_08_broken_medbay_refrigerator",
    category: 'bunker_defect',
    originTag: 'NEW',
    name: "Разбитый холодильник медблока",
    nameEn: "Broken MedBay Refrigerator",
    description: "Охлаждающий контур крио-аптечки пуст.",
    metadata: {
      defectCode: "DEF-08",
      failurePenalty: "50% стартовых MED испорчено; антибиотики непригодны.",
      repairRequirements: {
        tools: ['item_tools_kit'],
        professions: ["Химик/Физик/Холодильщик или крафт Хладагент."],
        days: 1
      }
    } satisfies IBunkerDefectMetadata
  }
];

export const bunkerArchetypesDeck: ICardDocument[] = [
  {
    cardId: "bunker_military",
    category: 'bunker_archetype',
    originTag: 'NEW',
    name: "Военный бункер «Объект-77»",
    nameEn: "Military Command Bunker Object-77",
    description: "Советский заглубленный командный пункт ПВО из тяжелого бетона.",
    metadata: {
      voxelStyle: "Оливково-зеленый (хаки), темно-серый бетон, ржавые балки, предупреждающие полосы.",
      startingRooms: ["Шлюзовая камера","Арсенал","Радиорубка","Машинное отделение","ФВУ","Жилой отсек","Карцер"],
      startingResources: {"food":25,"water":25,"air":100,"medicine":8,"power":35,"morale":50},
      uniqueRule: "Голосования быстрее на 30%. Если лидер военный — падение морали уменьшено вдвое.",
      drawback: "Отсутствие гидропоники (кризис еды без вылазок)."
    } satisfies IBunkerArchetypeMetadata
  },
  {
    cardId: "bunker_science",
    category: 'bunker_archetype',
    originTag: 'NEW',
    name: "Научная лаборатория «Биосфера-4»",
    nameEn: "Research Facility Biosphere-4",
    description: "Высокотехнологичный научный виварий и комплекс био-изоляции под эгидой Академии Наук.",
    metadata: {
      voxelStyle: "Белоснежные панели, синие неоновые полосы, прозрачное стекло, чистый хром.",
      startingRooms: ["Шлюзовая камера","Научлаб","Гидропоника","Медблок","ФВУ","Жилой отсек","Библиотека","Генератор"],
      startingResources: {"food":35,"water":30,"air":100,"medicine":15,"power":40,"morale":65},
      uniqueRule: "Исследования открывают новые технологии и лечат любые болезни вдвое быстрее.",
      drawback: "Слабая физическая защита и отсутствие арсенала."
    } satisfies IBunkerArchetypeMetadata
  },
  {
    cardId: "bunker_civilian",
    category: 'bunker_archetype',
    originTag: 'NEW',
    name: "Гражданское бомбоубежище №12",
    nameEn: "Civilian Bomb Shelter #12",
    description: "Типовое городское бомбоубежище под жилым кварталом.",
    metadata: {
      voxelStyle: "Облезлая масляная краска, побелка, деревянные нары, эмалированные чайники.",
      startingRooms: ["Шлюз","Жилой сектор","Кухня","Склад","ФВУ","Дизельная"],
      startingResources: {"food":30,"water":35,"air":90,"medicine":10,"power":25,"morale":60},
      uniqueRule: "Повышенный комфорт и сплоченность: мораль падает медленнее.",
      drawback: "Устаревшее оборудование, частые поломки электросети."
    } satisfies IBunkerArchetypeMetadata
  },
  {
    cardId: "bunker_corporate",
    category: 'bunker_archetype',
    originTag: 'NEW',
    name: "Apex Executive Vault",
    nameEn: "Apex Executive Vault",
    description: "Роскошный корпоративный бункер для топ-менеджмента корпорации Apex.",
    metadata: {
      voxelStyle: "Панели из темного ореха, мрамор, золотые акценты, мягкий рассеянный свет.",
      startingRooms: ["VIP-Шлюз","Конференц-зал","Апартаменты","Серверная","Винный погреб","ФВУ"],
      startingResources: {"food":45,"water":40,"air":100,"medicine":20,"power":50,"morale":75},
      uniqueRule: "Автоматизированная охрана и избыток премиальных ресурсов.",
      drawback: "Паранойя и взаимное недоверие: интриги и корпоративный шпионаж."
    } satisfies IBunkerArchetypeMetadata
  },
  {
    cardId: "bunker_prepper",
    category: 'bunker_archetype',
    originTag: 'NEW',
    name: "Самодельная нычка выживальщика",
    nameEn: "Prepper's Underground Stash",
    description: "Тайное убежище, построенное семьей сурвивалистов из вкопанных морских контейнеров.",
    metadata: {
      voxelStyle: "Гофрированное железо, мешки с песком, деревянные распорки, керосиновые лампы.",
      startingRooms: ["Маскировочный люк","Оружейка","Жилой контейнер","Кладовая","Мини-генератор"],
      startingResources: {"food":40,"water":30,"air":85,"medicine":12,"power":20,"morale":55},
      uniqueRule: "Огромный запас патронов, инструментов и ловушек на периметре.",
      drawback: "Теснота (максимум 4-6 мест) и примитивная вентиляция."
    } satisfies IBunkerArchetypeMetadata
  },
  {
    cardId: "bunker_industrial",
    category: 'bunker_archetype',
    originTag: 'NEW',
    name: "Подземный завод-бомбоубежище",
    nameEn: "Underground Factory Shelter",
    description: "Законсервированный подземный сборочный цех военного завода.",
    metadata: {
      voxelStyle: "Ржавый чугун, мостовые краны, конвейерные ленты, желтые промышленные балки.",
      startingRooms: ["Грузовой шлюз","Мастерская","Плавильня","Склад сырья","Электроподстанция","Бытовки"],
      startingResources: {"food":20,"water":25,"air":95,"medicine":6,"power":45,"morale":50},
      uniqueRule: "Крафт любых предметов и починка дефектов в 2 раза быстрее.",
      drawback: "Острый дефицит свежих продуктов и медикаментов."
    } satisfies IBunkerArchetypeMetadata
  }
];
