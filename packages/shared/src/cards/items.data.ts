import { ICardDocument, IItemMetadata } from '../types/card.types.js';

export const itemsDeck: ICardDocument[] = [
  {
    cardId: "item_tools_kit",
    category: 'item',
    originTag: "BASE",
    name: "Инструменты (набор)",
    nameEn: "Tool Kit",
    description: "Универсальный металлический ящик с молотком, пассатижами, разводным ключом и отвертками.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Весомый прагматичный аргумент: гарантирует починку вентиляции, генератора и шлюзовых дверей в случае аварии.",
      survivalPhaseEffect: "+2 к проверкам Ремонта технических узлов бункера; сокращает время восстановления сломанных систем на 1 день."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_rope_hemp",
    category: 'item',
    originTag: "BASE",
    name: "Верёвка пеньковая (20 м)",
    nameEn: "Hemp Rope (20m)",
    description: "Классическая прочная трёхпрядная верёвка для хозяйственных и альпинистских задач.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Универсальный практический аргумент: подходит для спуска в шахты, связывания грузов и изоляции буйных.",
      survivalPhaseEffect: "Позволяет спускаться в шахты и технические коллекторы без риска травмы; +1 к Строительству баррикад."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_axe_fire",
    category: 'item',
    originTag: "BASE",
    name: "Топор пожарный",
    nameEn: "Fire Axe",
    description: "Тяжёлый стальной топор с клиновидным бойком и резиновой рукоятью для вскрытия конструкций.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Двойной аргумент: эффективное средство расчистки завалов и грозное орудие сдерживания агрессоров.",
      survivalPhaseEffect: "+2 к расчистке завалов и заготовке древесины; наносит 1d6+2 урона в ближнем бою при отражении угроз."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_shovel_entrenching",
    category: 'item',
    originTag: "BASE",
    name: "Лопата сапёрная (МПЛ-50)",
    nameEn: "Entrenching Shovel (MPL-50)",
    description: "Компактная армейская лопатка из закалённой стали с заточенной боковой гранью.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент чернорабочего: готовность копать дренажи, расширять ходы и разбирать обвалы.",
      survivalPhaseEffect: "+1 к земляным и шахтным работам; может использоваться как универсальный инструмент и оружие (1d6 урона)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_padlock_keys",
    category: 'item',
    originTag: "BASE",
    name: "Замок навесной с ключами",
    nameEn: "Padlock with Keys",
    description: "Массивный чугунный замок с закалённой дужкой и комплектом из трёх ключей.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент защиты: обещание запереть склад провизии или личный отсек от внутренних воров.",
      survivalPhaseEffect: "Блокирует 1 шкаф, сундук или дверь отсека: защищает хранилище от кражи со 100% надёжностью."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_sewing_kit",
    category: 'item',
    originTag: "BASE",
    name: "Набор для шитья",
    nameEn: "Sewing Kit",
    description: "Компактный футляр с иглами разного калибра, суровыми нитями, напёрстком и ножницами.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Бытовой аргумент заботы: починка одежды, защитных костюмов и пошив фильтров для всей группы.",
      survivalPhaseEffect: "Позволяет чинить одежду и защитные костюмы (+1 использование к ОЗК); участвует в медицинских перевязках."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_kerosene_lantern",
    category: 'item',
    originTag: "BASE",
    name: "Фонарь керосиновый «Летучая мышь»",
    nameEn: "Kerosene Lantern",
    description: "Надёжный ветроустойчивый фонарь с фитилём и защитным стеклянным колпаком.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент автономного света: не зависит от батареек и проводки бункера при блэкауте.",
      survivalPhaseEffect: "Освещает жилой блок при отключении генератора (снимает штраф темноты на 4 дня на одной заправке)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_kerosene_canister",
    category: 'item',
    originTag: "BASE",
    name: "Керосин очищенный (канистра 3 л)",
    nameEn: "Purified Kerosene (3L)",
    description: "Ёмкость с горючим очищенным углеводородным топливом для горелок и ламп.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Ресурсная взятка: ценное горючее в обмен на место в шлюзе.",
      survivalPhaseEffect: "Топливо для керосинового фонаря (до 15 дней света) или примуса; растворитель технических масел."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_rope_nylon",
    category: 'item',
    originTag: "NEW",
    name: "Верёвка нейлоновая (30 м)",
    nameEn: "Nylon Rope (30m)",
    description: "Легковесный синтетический альпинистский трос статической нагрузки до 1200 кг.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Технологичный аргумент: надёжнее обычной пеньки, не подвержена гниению во влажном климате подземелий.",
      survivalPhaseEffect: "+2 к любым инженерным растяжкам и строительству; не теряет прочности от сырости и плесени."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_duct_tape",
    category: 'item',
    originTag: "NEW",
    name: "Скотч армированный (50 м)",
    nameEn: "Duct Tape (50m)",
    description: "Сверхпрочная клейкая лента на тканевой основе для экстренной герметизации и фиксации.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Универсальный аргумент быстрого ремонта: «Починю скотчем всё от трещины в трубе до скафандра».",
      survivalPhaseEffect: "Расходный материал: даёт +2 к однократному срочному ремонту пробоины или изоляции проводов."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_rags",
    category: 'item',
    originTag: "NEW",
    name: "Тряпка техническая (рулон ветоши)",
    nameEn: "Technical Rags (Roll)",
    description: "Плотное полотно хлопчатобумажной ткани для обтирки, фильтрации и технических нужд.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Слабый аргумент сам по себе, отлично работает как разменная монета в паре с другими ресурсами.",
      survivalPhaseEffect: "Базовый компонент очистки механизмов, грубой фильтрации жидкостей и создания горючих факелов."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_binoculars_tactical",
    category: 'item',
    originTag: "NEW",
    name: "Бинокль тактический 10x42",
    nameEn: "Tactical Binoculars 10x42",
    description: "Оптический прибор с просветлёнными линзами, дальномерной шкалой и прорезиненным корпусом.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Разведывательный аргумент: возможность безопасного наблюдения за входом и окрестностями снаружи.",
      survivalPhaseEffect: "Снижает риск засад при вылазках на поверхность на 25%; позволяет заблаговременно засекать рейды чужаков."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_compass_liquid",
    category: 'item',
    originTag: "NEW",
    name: "Компас жидкостный адмиралтейский",
    nameEn: "Admiralty Liquid Compass",
    description: "Точный магнитный прибор в металлическом корпусе с визиром и светящимся лимбом.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Навигационный аргумент: «Без компаса любая экспедиция за припасами заблудится в радиоактивной пустоши».",
      survivalPhaseEffect: "Обязательный предмет для дальних вылазок: исключает риск потери группы на незнакомой местности."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_flashlight_tactical",
    category: 'item',
    originTag: "NEW",
    name: "Фонарик светодиодный тактический",
    nameEn: "Tactical LED Flashlight",
    description: "Алюминиевый фонарь на сверхъярком диоде Cree с зумом и стробоскопом.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Базовый аргумент комфорта и безопасности: яркий персональный свет в любых аварийных зонах.",
      survivalPhaseEffect: "Устраняет штраф темноты для одного персонажа при выполнении работ; требует батареек после 10 дней."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_batteries",
    category: 'item',
    originTag: "NEW",
    name: "Батарейки (комплект AA/AAA 16 шт)",
    nameEn: "Batteries Set (AA/AAA 16 pcs)",
    description: "Упаковка щелочных долгоиграющих элементов питания промышленной серии.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Критический расходник: питает рации, детекторы, фонари и медицинские приборы группы.",
      survivalPhaseEffect: "Обеспечивает 20 дней суммарной работы портативных приборов (рации, дозиметры, приборы освещения)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_matches_waterproof",
    category: 'item',
    originTag: "NEW",
    name: "Спички охотничьи влагозащитные",
    nameEn: "Waterproof Hunting Matches",
    description: "Упаковка удлинённых спичек с ветро-водостойкой серной головкой в герметичном тубусе.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент надёжного огня: зажигаются под дождём и на ветру при любой чрезвычайной ситуации.",
      survivalPhaseEffect: "Гарантированный розжиг очагов, печей и сигнальных факелов в течение 25 дней (по 1 спичке в день)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_lighter_piezo",
    category: 'item',
    originTag: "NEW",
    name: "Зажигалка газовая пьезо",
    nameEn: "Piezo Gas Lighter",
    description: "Перезаправляемая турбо-зажигалка с направленным синим пламенем высокой температуры.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Удобный карманный источник огня для быстрого прикуривания, нагрева игл и пайки пластика.",
      survivalPhaseEffect: "Обеспечивает до 100 циклов мгновенного розжига; позволяет нагревать инструменты для стерилизации."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_fishing_rod_telescopic",
    category: 'item',
    originTag: "NEW",
    name: "Удочка телескопическая",
    nameEn: "Telescopic Fishing Rod",
    description: "Складное углепластиковое удилище длиной 4 метра с безынерционной катушкой и оснасткой.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Ситуативный аргумент пропитания: добыча свежей рыбы при наличии подземной реки или водоёма.",
      survivalPhaseEffect: "При наличии источника воды в бункере приносит +1 единицу свежей еды каждые 2 дня без затрат энергии."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_trap_spring",
    category: 'item',
    originTag: "NEW",
    name: "Капкан охотничий пружинный",
    nameEn: "Spring Hunting Trap",
    description: "Мощный стальной капкан №3 с зубчатыми дугами и чувствительной тарелочкой насторожки.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент периметра: защита вентиляционных шахт и входов от мутантов, грызунов и диверсантов.",
      survivalPhaseEffect: "При установке на входе блокирует первую атаку мелких угроз; на охоте приносит мясо каждые 4 дня (1d6>=3)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_crowbar_forged",
    category: 'item',
    originTag: "NEW",
    name: "Монтировка стальная кованая",
    nameEn: "Forged Steel Crowbar",
    description: "Гранёный стальной гвоздодёр длиной 70 см, способный отжимать тяжёлые металлические створки.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент силового взлома: незаменима при заклинивших гермодверях и разборке завалов.",
      survivalPhaseEffect: "+2 к проверкам взлома заклинивших дверей и контейнеров; оружие ближнего боя (1d6+1 урона)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_welding_inverter_portable",
    category: 'item',
    originTag: "NEW",
    name: "Сварочный аппарат портативный инверторный",
    nameEn: "Portable Inverter Welding Machine",
    description: "Компактный сварочный инвертор с кабелями, маской и пачкой электродов для ремонта брони и труб.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 5,
      slotsOccupied: 2,
      selectionPhaseEffect: "Громоздкий, но мощнейший инженерный козырь: герметизация переборок при прорывах воды или газа.",
      survivalPhaseEffect: "Капитальный ремонт металлических конструкций; восстанавливает прочность бункера на +15% при авариях."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_multitool_army",
    category: 'item',
    originTag: "NEW",
    name: "Мультитул карманный армейский",
    nameEn: "Pocket Army Multitool",
    description: "Складной инструмент из нержавеющей стали с кусачками, ножом, пилой по дереву и открывалкой.",
    metadata: {
      itemCategory: "TOOLS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Компактный аргумент мастера на все руки: всегда под рукой, не занимает лишнего места в рюкзаке.",
      survivalPhaseEffect: "+1 к мелким ремонтным работам; исключает штраф за отсутствие базового инструмента у владельца."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_medkit_car",
    category: 'item',
    originTag: "BASE",
    name: "Аптечка автомобильная расширенная",
    nameEn: "Extended Car First Aid Kit",
    description: "Оранжевый пластиковый футляр с бинтами, кровоостанавливающим жгутом, пластырями и антисептиком.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Железный довод выживания: «Без базовой аптечки любая травма приведёт к гангрене и гибели».",
      survivalPhaseEffect: "Лечит до 3 ранений лёгкой и средней тяжести; снижает риск осложнений после травм на 40%."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_antibiotics",
    category: 'item',
    originTag: "BASE",
    name: "Антибиотики широкого спектра (курс)",
    nameEn: "Broad Spectrum Antibiotics",
    description: "Две пачки капсул сильного антибактериального препарата последнего поколения.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Спасительный аргумент против эпидемий: критически важен при скученном проживании людей в бункере.",
      survivalPhaseEffect: "Полностью излечивает инфекционное заболевание у одного жителя или купирует очаг болезни у троих."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_gas_mask_gp5",
    category: 'item',
    originTag: "BASE",
    name: "Противогаз ГП-5 с запасным фильтром",
    nameEn: "GP-5 Gas Mask with Filter",
    description: "Резиновая шлем-маска с фильтрующе-поглощающей коробкой против пыли, дыма и паров токсинов.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Ультимативный довод против газовых атак, радиоактивных осадков и продуктов горения.",
      survivalPhaseEffect: "Защищает дыхание владельца при разгерметизации фильтров бункера или вылазках наружу на 10 дней."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_bandages_sterile",
    category: 'item',
    originTag: "BASE",
    name: "Бинты стерильные (упаковка 10 шт)",
    nameEn: "Sterile Bandages (10 pcs)",
    description: "Марлевые медицинские бинты индивидуальной упаковки для фиксации повязок и остановки крови.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Простой, но понятный каждому предмет первой необходимости для перевязочной группы.",
      survivalPhaseEffect: "Расходник для 5 перевязок: предотвращает инфицирование открытых ран и ускоряет регенерацию."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_painkillers_strong",
    category: 'item',
    originTag: "BASE",
    name: "Обезболивающее сильнодействующее (ампулы)",
    nameEn: "Strong Painkillers (Ampoules)",
    description: "Медицинский пенал с ампулами промедола/морфина и стерильными одноразовыми шприцами.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Гуманитарный аргумент: спасение от болевого шока при переломах, операциях и тяжелых ожогах.",
      survivalPhaseEffect: "Снимает болевой шок, временно возвращая тяжелораненого персонажа к дееспособности на 24 часа."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_sleeping_pills_strong",
    category: 'item',
    originTag: "NEW",
    name: "Снотворное сильное (флакон 30 таб)",
    nameEn: "Strong Sleeping Pills (30 tabs)",
    description: "Рецептурный барбитуратный препарат глубокого седативного действия.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Психологический аргумент снятия истерики; скрытно может применяться как аргумент давления.",
      survivalPhaseEffect: "Лечит бессонницу и психозы (+2 к Морали пациента); может быть тайно подмешано в пищу цели."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_rat_poison",
    category: 'item',
    originTag: "NEW",
    name: "Яд крысиный (гранулы фосфида цинка)",
    nameEn: "Rat Poison Pellets",
    description: "Пачка токсичных зерновых гранул с характерным запахом для дератизации помещений.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Двойственный предмет: санитария бункера от крыс-переносчиков чумы или скрытая угроза отравления.",
      survivalPhaseEffect: "Истребляет грызунов на складе продовольствия (спасает 20% запасов еды); компонент смертоносных ловушек."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_field_medicine_book",
    category: 'item',
    originTag: "NEW",
    name: "Книга по полевой медицине и хирургии",
    nameEn: "Field Medicine and Surgery Book",
    description: "Иллюстрированное военное руководство по неотложной помощи, операциям и изготовлению лекарств.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Интеллектуальный аргумент: «Если погибнет доктор, эта книга позволит любому из вас спасти мне жизнь».",
      survivalPhaseEffect: "Позволяет персонажу без медицинского образования проводить лечение со штрафом всего -1 вместо -4."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_epinephrine_syringe",
    category: 'item',
    originTag: "NEW",
    name: "Шприц с адреналином (эпинефрин)",
    nameEn: "Epinephrine Syringe",
    description: "Автоинъектор экстренной реанимации при анафилактическом шоке и остановке сердечной деятельности.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент спасения на волоске: прямой шанс вернуть умирающего ключевого специалиста с того света.",
      survivalPhaseEffect: "Однократно спасает персонажа от клинической смерти или даёт +3 к характеристикам на 1 критический раунд."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_disinfectant_alcohol",
    category: 'item',
    originTag: "NEW",
    name: "Дезинфектор спиртовой (изопропил 1 л)",
    nameEn: "Alcohol Disinfectant (1L)",
    description: "Ёмкость с 90% раствором медицинского антисептика широкого спектра действия.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Гигиенический фундамент безопасности: стерилизация поверхностей, рук и инструментов.",
      survivalPhaseEffect: "Обеззараживает медицинский инвентарь; уничтожает грибок и патогены в жилых блоках; основа крафта."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_dosimeter",
    category: 'item',
    originTag: "NEW",
    name: "Дозиметр бытовой микропроцессорный",
    nameEn: "Microprocessor Dosimeter",
    description: "Портативный прибор со слюдяным счётчиком Гейгера и звуковым сигнализатором фона.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент невидимой опасности: контроль радиационного загрязнения фильтров, еды и выходящих людей.",
      survivalPhaseEffect: "Засекает радиоактивные пятна при экспедициях наружу; предупреждает о прорыве радиации в воздуховод."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_potassium_iodide",
    category: 'item',
    originTag: "NEW",
    name: "Таблетки йодида калия (10 блистеров)",
    nameEn: "Potassium Iodide Tablets (10 blisters)",
    description: "Препарат радиопротекторного блокирования щитовидной железы от изотопов йода-131.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Профилактический аргумент при ядерном ударе или аварии реактора: сохранение здоровья всей группы.",
      survivalPhaseEffect: "Снижает накопление дозы облучения при радиационной тревоге на 50% для всей группы на 10 дней."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_surgical_kit_field",
    category: 'item',
    originTag: "NEW",
    name: "Хирургический набор полевой",
    nameEn: "Field Surgical Kit",
    description: "Чехол с анатомическими пинцетами, скальпелями, зажимами Кохера и стерильным шовным материалом.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Профессиональный аргумент хирурга: возможность извлекать пули, осколки и зашивать глубокие раны.",
      survivalPhaseEffect: "Необходим для проведения полостных операций и извлечения пуль; без набора операции невозможны."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_oxygen_canister",
    category: 'item',
    originTag: "NEW",
    name: "Кислородный баллончик портативный (15 л)",
    nameEn: "Portable Oxygen Canister (15L)",
    description: "Алюминиевый баллон со встроенной маской для обогащённого дыхания в загазованной среде.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Экстренный аргумент: спасение астматиков, сердечников и пострадавших при пожаре в отсеке.",
      survivalPhaseEffect: "Купирует приступ удушья или отравления дымом; даёт 20 минут чистого дыхания при аварии очистки воздуха."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_activated_charcoal_powder",
    category: 'item',
    originTag: "NEW",
    name: "Активированный уголь (порошок 500 г)",
    nameEn: "Activated Charcoal Powder (500g)",
    description: "Мелкодисперсный высокоактивный сорбент медицинского и технического назначения.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Универсальный сорбент: скорая помощь при пищевых токсикоинфекциях и кустарный наполнитель фильтра.",
      survivalPhaseEffect: "Снимает симптомы тяжёлого пищевого отравления за 1 день; может использоваться для регенерации водных фильтров."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_burn_hydrogel",
    category: 'item',
    originTag: "NEW",
    name: "Противоожоговый гидрогель (туба)",
    nameEn: "Anti-burn Hydrogel Tube",
    description: "Охлаждающий антисептический гель с анестетиком для быстрого заживления ожогов II-III степени.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент защиты от ожогов при работе с генератором, печами и кислотными аккумуляторами.",
      survivalPhaseEffect: "Ускоряет заживление термических и химических ожогов в 3 раза; снимает штраф к ловкости от травмы."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_infection_test_strips",
    category: 'item',
    originTag: "NEW",
    name: "Тест-полоски на инфекции и вирусы",
    nameEn: "Infection and Virus Test Strips",
    description: "Набор экспресс-диагностики крови и слюны на наличие опасных патогенов и штаммов.",
    metadata: {
      itemCategory: "MEDICINE",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент биобезопасности: мгновенное выявление заражённых беженцев прямо перед входом в бункер.",
      survivalPhaseEffect: "Позволяет со 100% точностью определить носителя скрытой болезни или вируса среди выживших."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_can_meat",
    category: 'item',
    originTag: "BASE",
    name: "Консервы мясные (тушёнка говяжья, 5 банок)",
    nameEn: "Canned Beef (5 cans)",
    description: "Заводские жестяные банки тушёной говядины высшего сорта длительного хранения.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Прямой продовольственный вклад: гарантирует пропитание на первые дни без нагрузки на общий склад.",
      survivalPhaseEffect: "Обеспечивает 5 порций калорийного питания; снижает уровень голода в группе на 2 единицы."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_seeds_pack",
    category: 'item',
    originTag: "BASE",
    name: "Семена овощных культур (пакет)",
    nameEn: "Vegetable Seeds Pack",
    description: "Сортовые семена быстрорастущих томатов, редиса, бобов и зелени с высокой всхожестью.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Стратегический долгосрочный довод агронома: залог возобновляемого питания на месяцы вперёд.",
      survivalPhaseEffect: "При наличии гидропоники или почвы даёт постоянный приток +2 свежей еды каждые 5 дней после 12-го дня."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_water_canister_5l",
    category: 'item',
    originTag: "BASE",
    name: "Канистра питьевой воды (5 л)",
    nameEn: "Drinking Water Canister (5L)",
    description: "Пищевой пластиковый бурдюк с чистой артезианской водой высокой степени консервации.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 4,
      slotsOccupied: 1,
      selectionPhaseEffect: "Жизненно важный ресурс: запас жидкости на случай пересыхания или заражения скважины.",
      survivalPhaseEffect: "5 суточных рационов чистой воды; спасает группу при внезапной аварии водоснабжения бункера."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_army_rations_mre",
    category: 'item',
    originTag: "BASE",
    name: "Армейский сухпаёк (ИРП 3 суточных набора)",
    nameEn: "Army MRE Ration Packs (3 days)",
    description: "Сбалансированный военный рацион в камуфлированных пакетах с беспламенным разогревателем.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Автономный запас выживальщика: не требует готовки, огня и посуды, полностью готов к употреблению.",
      survivalPhaseEffect: "3 полноценных суточных рациона; идеален для отправки разведывательных групп на поверхность."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_table_salt",
    category: 'item',
    originTag: "NEW",
    name: "Соль поваренная (пачка 1 кг)",
    nameEn: "Table Salt (1kg)",
    description: "Кристаллическая каменная соль высшего сорта — природный консервант и источник электролитов.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Хитрый аргумент гурмана и заготовителя: без соли невозможно консервировать мясо и выделывать шкуры.",
      survivalPhaseEffect: "Предотвращает порчу скоропортящегося мяса и рыбы (продлевает срок на 15 дней); восстанавливает водно-солевой баланс."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_sugar",
    category: 'item',
    originTag: "NEW",
    name: "Сахар-песок (пачка 1 кг)",
    nameEn: "Granulated Sugar (1kg)",
    description: "Белый рафинированный сахар — чистые быстрые углеводы и необходимое сырьё для брожения.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Энергетический ресурс для физического труда и основа для кустарного производства антисептиков.",
      survivalPhaseEffect: "Быстро снимает усталость работников (+1 к выносливости на смену); ключевой компонент самогоноварения."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_yeast",
    category: 'item',
    originTag: "NEW",
    name: "Дрожжи сухие быстродействующие (пачка)",
    nameEn: "Dry Fast-Acting Yeast Pack",
    description: "Пакетик активных гранулированных дрожжей для выпечки свежего хлеба и спиртового брожения.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Технологический аргумент пекаря: превращает безвкусную муку в пышный питательный хлеб.",
      survivalPhaseEffect: "Позволяет печь хлеб при наличии муки (+1 Мораль группы); участвует в крафте алкоголя и дезинфектанта."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_vodka",
    category: 'item',
    originTag: "NEW",
    name: "Бутылка водки (1 л, 40%)",
    nameEn: "Vodka Bottle (1L, 40%)",
    description: "Стеклянная литровая бутылка крепкого алкоголя тройной дистилляции.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Универсальная валюта пустошей, мощнейший антистресс и переговорный стимул для колеблющихся.",
      survivalPhaseEffect: "Снимает панику и поднимает Мораль (+2); используется как анестетик и антисептик; основа зажигательной смеси."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_filter_water",
    category: 'item',
    originTag: "NEW",
    name: "Фильтр для воды мембранный (гравитационный)",
    nameEn: "Membrane Water Filter",
    description: "Походный фильтр с керамическим и угольным картриджами, очищающий до 0.1 микрона.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Ключевой довод гидролога: получение безопасной воды из луж, конденсата и технических резервуаров.",
      survivalPhaseEffect: "Очищает до 50 литров сомнительной воды, полностью удаляя бактерии, взвеси и тяжелые металлы."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_survival_cookbook",
    category: 'item',
    originTag: "NEW",
    name: "Поваренная книга выживания в экстремальных условиях",
    nameEn: "Extreme Survival Cookbook",
    description: "Потрёпанная тетрадь с рецептами приготовления блюд из мха, крыс, кореньев и технического сырья.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Гастрономический аргумент кулинара: превратит скудные отходы в съедобные калорийные порции.",
      survivalPhaseEffect: "Увеличивает отдачу от любых пищевых запасов на 25%; предотвращает депрессию от монотонного пайка."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_thermos_steel_2l",
    category: 'item',
    originTag: "NEW",
    name: "Термос вакуумный стальной (2 л)",
    nameEn: "Steel Vacuum Thermos (2L)",
    description: "Прочный металлический термос с двойными стенками, сохраняющий кипяток горячим 36 часов.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент заботы о разведчиках и дозорных в холодных сырых тоннелях и шлюзах.",
      survivalPhaseEffect: "Сохраняет горячую пищу/воду для караулов; снижает риск простудных заболеваний на холодных дежурствах."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_chocolate_army_bars",
    category: 'item',
    originTag: "NEW",
    name: "Шоколад армейский плиточный (3 плитки)",
    nameEn: "Army Chocolate Bars (3 bars)",
    description: "Тёмный горький шоколад с кофеином и лецитином повышенной энергоёмкости.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Сладкая взятка: мгновенно поднимает настроение оппонентам во время жарких дебатов при отборе.",
      survivalPhaseEffect: "Экстренный источник сил: снимает истощение у двух персонажей; повышает бдительность дозора ночью."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_aquatabs_purification",
    category: 'item',
    originTag: "NEW",
    name: "Таблетки обеззараживания воды (Акватабс 50 шт)",
    nameEn: "Aquatabs Water Purification (50 tabs)",
    description: "Блистер хлорсодержащих шипучих таблеток быстрого уничтожения микроорганизмов в воде.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Компактная гарантия безопасности: 50 литров обеззараженной воды без кипячения и затрат дров.",
      survivalPhaseEffect: "Позволяет пить воду из любых сомнительных подземных источников без риска дизентерии и холеры."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_tea_energizing",
    category: 'item',
    originTag: "NEW",
    name: "Чай листовой тонизирующий (жестяная банка 250 г)",
    nameEn: "Energizing Leaf Tea (250g)",
    description: "Смесь крепкого чёрного байхового чая с сушёными ягодами шиповника и листьями мяты.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Социальный довод душевного комфорта: чаепития гасят конфликты и объединяют людей в бункере.",
      survivalPhaseEffect: "Каждое групповое чаепитие раз в 5 дней повышает Мораль всех выживших на +1 и сплачивает команду."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_freeze_dried_berries_nuts",
    category: 'item',
    originTag: "NEW",
    name: "Сублимированные ягоды и орехи (набор)",
    nameEn: "Freeze-Dried Berries and Nuts",
    description: "Вакуумный пакет с клюквой, черникой, грецким орехом и фундуком богатых витамином C.",
    metadata: {
      itemCategory: "FOOD_WATER",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Витаминный щит против цинги, авитаминоза и снижения иммунитета при длительной изоляции.",
      survivalPhaseEffect: "Предотвращает развитие авитаминоза и цинги у 4 жителей бункера; ускоряет выздоровление больных."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_knife_hunting",
    category: 'item',
    originTag: "BASE",
    name: "Нож охотничий с фиксированным клинком",
    nameEn: "Hunting Knife",
    description: "Крепкий нож из кованой стали 65Х13 с гардой, серрейтором на обухе и кожаными ножнами.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Классический инструмент и оружие последнего шанса: нарезка материалов, готовка и самозащита.",
      survivalPhaseEffect: "+1 к охоте и разделке туш; 1d6 урона в рукопашной; базовый компонент крафта древкового оружия."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_makarov_pistol_9mm",
    category: 'item',
    originTag: "BASE",
    name: "Оружие (пистолет Макарова 9 мм)",
    nameEn: "Makarov Pistol 9mm",
    description: "Надёжный служебный полуавтоматический пистолет с двумя снаряжёнными магазинами (16 патронов).",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Веский силовой аргумент правопорядка: способность пресечь бунт или гарантировать безопасность периметра.",
      survivalPhaseEffect: "Огнестрельное оружие (2d6 урона); при отражении штурмов отпугивает рейдеров без ближнего боя."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_shotgun_toz34",
    category: 'item',
    originTag: "BASE",
    name: "Ружьё охотничье двухствольное (ТОЗ-34)",
    nameEn: "Double-Barrel Shotgun TOZ-34",
    description: "Вертикальное гладкоствольное ружьё 12 калибра с прикладом из ореха и отличным боем дробью.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 4,
      slotsOccupied: 1,
      selectionPhaseEffect: "Оружие крупного калибра для охраны входа: останавливает мутантов и мародёров на подступах.",
      survivalPhaseEffect: "Наносит 3d6 урона на ближней дистанции; увеличивает добычу крупной дичи при поверхностной охоте на +3."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_shotgun_ammo_25",
    category: 'item',
    originTag: "BASE",
    name: "Патроны 12 калибра (пачка 25 шт)",
    nameEn: "12ga Shotgun Ammo (25 pcs)",
    description: "Картонная пачка патронов с картечью 8.5 мм для гладкоствольного охотничьего оружия.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Боеприпасы — настоящая твёрдая валюта постапокалипсиса, особенно для владельцев ружей.",
      survivalPhaseEffect: "Обеспечивает 12 выстрелов из охотничьего ружья; может обмениваться на еду или медикаменты по курсу 1:1."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_flare_gun_spsh44",
    category: 'item',
    originTag: "BASE",
    name: "Ракетница сигнальная СПШ-44",
    nameEn: "Signal Flare Gun SPSh-44",
    description: "Стальной сигнальный пистолет калибра 26 мм с тремя красными осветительными ракетами.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент связи со спасателями: возможность подать сигнал воздушным поисковым бортам.",
      survivalPhaseEffect: "Освещает сектор перед бункером при ночных штурмах; может ослепить и обратить в бегство ночных тварей."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_pepper_spray_stream",
    category: 'item',
    originTag: "BASE",
    name: "Перцовый баллончик струйный",
    nameEn: "Stream Pepper Spray",
    description: "Компактный баллон с экстрактом жгучего перца Oleoresin Capsicum дальностью струи до 4 метров.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Гуманный аргумент самообороны: усмирение буянов и агрессивных беженцев без кровопролития.",
      survivalPhaseEffect: "Мгновенно нейтрализует одного агрессора на 1 раунд без нанесения смертельных повреждений."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_crossbow_compound_10bolts",
    category: 'item',
    originTag: "NEW",
    name: "Арбалет охотничий блочный с 10 стрелами",
    nameEn: "Compound Hunting Crossbow with 10 Bolts",
    description: "Бесшумное метательное оружие с коллиматорным прицелом и многоразовыми карбоновыми стрелами.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент бесшумной охоты: ликвидация угроз без звука выстрела, привлекающего орды снаружи.",
      survivalPhaseEffect: "Наносит 2d6 урона бесшумно; стрелы возвращаются с вероятностью 70% после успешного выстрела."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_body_armor_kevlar_class2",
    category: 'item',
    originTag: "NEW",
    name: "Бронежилет кевларовый скрытого ношения (класс II)",
    nameEn: "Kevlar Concealed Body Armor (Class II)",
    description: "Лёгкий бронежилет из баллистической ткани, защищающий торс от осколков, ножей и пистолетных пуль.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 4,
      slotsOccupied: 1,
      selectionPhaseEffect: "Эгоистичный, но убедительный довод телохранителя: готовность закрыть собой лидера или врача.",
      survivalPhaseEffect: "Поглощает первые 3 попадания из стрелкового оружия или ножей, спасая владельца от критических ран."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_slingshot_steel_balls",
    category: 'item',
    originTag: "NEW",
    name: "Рогатка спортивно-охотничья со стальными шариками",
    nameEn: "Hunting Slingshot with Steel Balls",
    description: "Усиленная рогатка с упором на предплечье и мешочком 50 стальных шариков диаметром 10 мм.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Забавный на первый взгляд, но бесшумный и крайне экономный инструмент для отстрела мелкой дичи.",
      survivalPhaseEffect: "Наносит 1d4 урона; обеспечивает успешную охоту на птиц и грызунов без траты пороха и патронов."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_riot_shield_handmade",
    category: 'item',
    originTag: "NEW",
    name: "Щит штурмовой самодельный",
    nameEn: "Handmade Assault Shield",
    description: "Тяжёлый бронещит из рифлёного стального листа с рукоятью и смотровой щелью с поликарбонатом.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 4,
      slotsOccupied: 1,
      selectionPhaseEffect: "Довод штурмовика: живая подвижная баррикада для прикрытия товарищей в узких коридорах бункера.",
      survivalPhaseEffect: "+3 к защите отряда при прорыве внешнего периметра; полностью блокирует фронтальный урон в узких дверях."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_stun_gun_tactical",
    category: 'item',
    originTag: "NEW",
    name: "Электрошокер тактический с фонарём",
    nameEn: "Tactical Stun Gun with Flashlight",
    description: "Контактный парализатор напряжением 50 000 вольт в ударопрочном корпусе дубинки.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Инструмент службы безопасности бункера для бескровного наведения порядка среди запаниковавших.",
      survivalPhaseEffect: "Оглушает цель на 1 ход; полезен при задержании саботажников без риска повредить аппаратуру стрельбой."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_brass_knuckles_lead",
    category: 'item',
    originTag: "NEW",
    name: "Кастет свинцовый",
    nameEn: "Lead Brass Knuckles",
    description: "Тяжёлое литое оружие скрытого ношения для сокрушительных ударов в рукопашных стычках.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Угрожающий аргумент уличного бойца: способность постоять за себя и свою долю в любой драке.",
      survivalPhaseEffect: "+2 к урону без оружия в рукопашных потасовках; даёт преимущество при проверках запугивания."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_flashbang_grenade_zarya2",
    category: 'item',
    originTag: "NEW",
    name: "Шумовая граната светозвуковая (Заря-2)",
    nameEn: "Stun Flashbang Grenade (Zarya-2)",
    description: "Нелетальная спецназовская граната с оглушающим эффектом 170 дБ и яркой вспышкой.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Козырь пресечения массовых беспорядков: мгновенная дезориентация агрессивной толпы у шлюза.",
      survivalPhaseEffect: "Оглушает всех врагов в отсеке на 2 раунда, позволяя нейтрализовать нападающих без жертв."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_machete_forged",
    category: 'item',
    originTag: "NEW",
    name: "Мачете кованое тростниковое",
    nameEn: "Forged Cane Machete",
    description: "Широкий рубящий клинок длиной 50 см для прорубания сквозь заросли и рукопашного боя.",
    metadata: {
      itemCategory: "WEAPONS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Практичный рубящий инструмент для расчистки вентиляции от корней и защиты от агрессивной фауны.",
      survivalPhaseEffect: "Наносит 1d6+2 рубящего урона; ускоряет расчистку заросших наружных секторов бункера вдвое."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_generator_gasoline",
    category: 'item',
    originTag: "BASE",
    name: "Генератор бензиновый 2 кВт",
    nameEn: "Gasoline Generator 2kW",
    description: "Четырёхтактный мобильный электрогенератор с ручным стартером и розетками на 220 вольт.",
    metadata: {
      itemCategory: "TECH",
      weight: 5,
      slotsOccupied: 2,
      selectionPhaseEffect: "Фундаментальный довод цивилизации: свет, работа медицинских приборов и вентиляции зависят от него.",
      survivalPhaseEffect: "Питает электросеть бункера (требует 1 литр топлива в сутки); без энергии большинство систем отключается."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_radio_military",
    category: 'item',
    originTag: "BASE",
    name: "Рация армейская переносная (Р-168)",
    nameEn: "Portable Military Radio (R-168)",
    description: "Защищённая коротковолновая радиостанция с гарнитурой и гибкой штыревой антенной Куликова.",
    metadata: {
      itemCategory: "TECH",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Коммуникационный аргумент: координация групп снаружи, разведка эфира и связь с другими бункерами.",
      survivalPhaseEffect: "Позволяет переговариваться с экспедициями на расстоянии до 15 км; перехватывает сигналы бедствия."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_radio_receiver_allwave",
    category: 'item',
    originTag: "BASE",
    name: "Радиоприёмник всеволновый",
    nameEn: "All-Wave Radio Receiver",
    description: "Приёмник с диапазонами FM/MW/SW, телескопической антенной и аналоговой шкалой настройки.",
    metadata: {
      itemCategory: "TECH",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Информационный довод: регулярный мониторинг официальных частот оповещения ГО и ЧС.",
      survivalPhaseEffect: "Ловит сводки новостей о состоянии катастрофы в мире; предупреждает о приближении циклонов и осадков."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_mechanical_watch_shockproof",
    category: 'item',
    originTag: "BASE",
    name: "Часы наручные механические противоударные",
    nameEn: "Shockproof Mechanical Watch",
    description: "Наградные армейские часы с автоподзаводом, устойчивые к электромагнитному импульсу (ЭМИ).",
    metadata: {
      itemCategory: "TECH",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Хронометрический довод: в замкнутом бункере без солнца критически важно не терять счёт времени и смен.",
      survivalPhaseEffect: "Позволяет точно координировать действия команды и караулов; не выходят из строя при вспышках ЭМИ."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_laptop_toughbook",
    category: 'item',
    originTag: "NEW",
    name: "Ноутбук защищённый ударопрочный (Panasonic Toughbook)",
    nameEn: "Panasonic Toughbook Laptop",
    description: "Полевой магниевый ноутбук с ярким экраном, защитой от влаги IP65 и автономной батареей на 8 часов.",
    metadata: {
      itemCategory: "TECH",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Вычислительный центр колонии: базы данных, чертежи систем жизнеобеспечения и диагностические утилиты.",
      survivalPhaseEffect: "Необходим для программирования автоматики бункера, дешифровки данных и работы инженеров/хакеров."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_solar_panel",
    category: 'item',
    originTag: "NEW",
    name: "Солнечная панель складная (50W)",
    nameEn: "Foldable Solar Panel (50W)",
    description: "Портативная монокристаллическая панель с USB-выходами и контроллером заряда 12 вольт.",
    metadata: {
      itemCategory: "TECH",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Экологичный довод вечной энергии: подзарядка аккумуляторов без шума и траты драгоценного бензина.",
      survivalPhaseEffect: "Бесплатно заряжает малые приборы при выставлении на поверхность в светлое время суток."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_microchips",
    category: 'item',
    originTag: "NEW",
    name: "Набор микросхем и радиодеталей",
    nameEn: "Microchips & Radio Components Set",
    description: "Органайзер с микроконтроллерами, резисторами, конденсаторами, проводами и портативным паяльником.",
    metadata: {
      itemCategory: "TECH",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Высокотехнологичный ресурс: ремонт автоматических датчиков, микроволновок и систем фильтрации.",
      survivalPhaseEffect: "Базовый компонент высокотехнологичного крафта; даёт +2 к починке любой сложной электроники бункера."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_usb_flash",
    category: 'item',
    originTag: "NEW",
    name: "Флешка с данными (зашифрованный криптонакопитель 128 GB)",
    nameEn: "Encrypted USB Flash Drive (128GB)",
    description: "Металлическая влагостойкая флешка с аппаратным шифрованием PIN-кодом, содержащая секретный архив.",
    metadata: {
      itemCategory: "TECH",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Интригующий сюжетный аргумент: содержит схемы убежищ, государственные секреты или коды доступа к складам.",
      survivalPhaseEffect: "При расшифровке на ноутбуке даёт стратегическую информацию: координаты тайников или компромат на игроков."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_tablet_tactical_gps",
    category: 'item',
    originTag: "NEW",
    name: "Планшет тактический с GPS/оффлайн-картами",
    nameEn: "Tactical Tablet with GPS Offline Maps",
    description: "Бронированный планшетный компьютер со спутниковым приёмником и детальными спутниковыми снимками региона.",
    metadata: {
      itemCategory: "TECH",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Навигационный щит: планирование кратчайших безопасных маршрутов для вылазок за припасами.",
      survivalPhaseEffect: "Снижает время экспедиций на поверхность на 1 день; открывает скрытые точки интереса на карте пустоши."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_satellite_radio_iridium",
    category: 'item',
    originTag: "NEW",
    name: "Рация спутниковая глобальная (Iridium Extreme)",
    nameEn: "Iridium Extreme Global Satellite Radio",
    description: "Тяжёлый терминал со складной антенной для звонков и передачи координат через спутниковую группировку.",
    metadata: {
      itemCategory: "TECH",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Прямая связь со внешним миром: единственный способ связаться с эвакуационными штабами и правительством.",
      survivalPhaseEffect: "Позволяет вызвать спасательный борт или запросить сброс гуманитарного контейнера (1 раз за игру)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_drone_thermal_mini",
    category: 'item',
    originTag: "NEW",
    name: "Квадрокоптер миниатюрный (дрон с тепловизором)",
    nameEn: "Miniature Drone with Thermal Camera",
    description: "Складной разведывательный дрон с камерой 4K, тепловизором и дальностью полёта до 3 км.",
    metadata: {
      itemCategory: "TECH",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Безопасная аэроразведка: осмотр окрестностей бункера и поиск засад без риска для людей.",
      survivalPhaseEffect: "Проводит безопасную разведку поверхности (3 вылета на одном заряде); вскрывает засады мутантов."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_powerbank_30000_flashlight",
    category: 'item',
    originTag: "NEW",
    name: "Пауэрбанк ёмкостью 30000 mAh с фонарём",
    nameEn: "Powerbank 30000mAh with Flashlight",
    description: "Тяжёлый внешний аккумулятор в ударопрочном корпусе с функцией быстрой зарядки QuickCharge.",
    metadata: {
      itemCategory: "TECH",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Мобильный источник питания для радиостанций, смартфонов и навигаторов дозорных групп.",
      survivalPhaseEffect: "Обеспечивает до 8 полных зарядок портативных гаджетов (рации, планшеты, дозиметры, фонарики)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_metal_detector_ground",
    category: 'item',
    originTag: "NEW",
    name: "Металлоискатель ручной грунтовый",
    nameEn: "Handheld Ground Metal Detector",
    description: "Геодезический металлодетектор со звуковым откликом и регулируемой глубиной поиска до 1.5 метров.",
    metadata: {
      itemCategory: "TECH",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Инструмент кладоискателя: поиск закопанных кабелей, труб и схронов с оружием под завалами.",
      survivalPhaseEffect: "Удваивает вероятность обнаружения ценных металлических ресурсов и деталей при раскопках завалов."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_laser_pointer_green_1000mw",
    category: 'item',
    originTag: "NEW",
    name: "Лазерная указка мощная зелёная (1000 mW)",
    nameEn: "High-Power Green Laser Pointer (1000mW)",
    description: "Мощный лазерный целеуказатель с лучом видимым на 10 км и способностью поджигать спички в фокусе.",
    metadata: {
      itemCategory: "TECH",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Сигнальное средство целеуказания для дозоров и возможность ослепить снайперов на дистанции.",
      survivalPhaseEffect: "Позволяет координировать огонь обороны на дистанции; способна ослепить наблюдателя на вышке на 1 ход."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_hazmat_suit_ozk",
    category: 'item',
    originTag: "BASE",
    name: "Костюм ОЗК (общевойсковой защитный комплект)",
    nameEn: "Chemical Protection Suit OZK",
    description: "Прорезиненный защитный плащ с капюшоном, чулками и перчатками для преодоления заражённых зон.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 4,
      slotsOccupied: 1,
      selectionPhaseEffect: "Абсолютный аргумент радиационной и химической стойкости: человек в ОЗК выйдет на поверхность и вернётся живым.",
      survivalPhaseEffect: "Даёт 100% иммунитет к токсинам и радиоактивной пыли на поверхности при 5 выходах наружу."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_tent_2person_storm",
    category: 'item',
    originTag: "BASE",
    name: "Палатка двухместная штормовая",
    nameEn: "2-Person Storm Tent",
    description: "Двухслойная ветроустойчивая палатка с алюминиевыми дугами и водонепроницаемым дном.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 4,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент автономного лагеря при поломке отсека или организации карантинного бокса.",
      survivalPhaseEffect: "Создаёт изолированное спальное место на двух человек (+1 Мораль); снижает риск заражения от соседей."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_sleeping_bag_winter",
    category: 'item',
    originTag: "BASE",
    name: "Спальный мешок зимний (до -25°C)",
    nameEn: "Winter Sleeping Bag (-25C)",
    description: "Тёплый анатомический спальник типа «кокон» с синтетическим утеплителем холлофайбер.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Защита от сырости и гипотермии в неотапливаемых секторах бетонного бункера.",
      survivalPhaseEffect: "Полностью защищает владельца от болезней при переохлаждении при отключении отопления в бункере."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_rubber_boots_swamp",
    category: 'item',
    originTag: "BASE",
    name: "Сапоги резиновые болотные",
    nameEn: "Rubber Swamp Boots",
    description: "Высокие непромокаемые сапоги из плотной резины с рифлёной подошвой против скольжения.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент сантехника: работа в затопленных подвалах и коллекторах без риска промочить ноги и заболеть.",
      survivalPhaseEffect: "Позволяет без последствий устранять протечки труб в ледяной воде; иммунитет к сырости ног."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_combat_boots_reinforced",
    category: 'item',
    originTag: "NEW",
    name: "Берцы армейские усиленные",
    nameEn: "Reinforced Army Combat Boots",
    description: "Высокие кожаные ботинки с мембраной Gore-Tex, металлическим подноском и кевларовой стелькой.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Надёжная обувь бойца: защита стоп от битого стекла, гвоздей и вывихов при завалах.",
      survivalPhaseEffect: "Исключает случайные травмы ног при работе на завалах; +1 к выносливости во время пеших вылазок."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_raincoat_tactical_poncho",
    category: 'item',
    originTag: "NEW",
    name: "Дождевик тактический (пончо-тент)",
    nameEn: "Tactical Raincoat Poncho Tarp",
    description: "Многофункциональное непромокаемое пончо из ткани рипстоп с люверсами по углам.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Компактная защита от кислотных осадков, легко трансформируемая в тент или носилки для раненых.",
      survivalPhaseEffect: "Защищает от кислотных дождей на поверхности; может использоваться как импровизированные носилки."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_gloves_kevlar_cut_proof",
    category: 'item',
    originTag: "NEW",
    name: "Перчатки кевларовые с защитой от порезов",
    nameEn: "Kevlar Cut-Proof Gloves",
    description: "Тактические перчатки с вплетённой кевларовой нитью и полимерными накладками на костяшках пальцев.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Безопасность рук при обыске руин, работе с разбитым стеклом, металлом и обезвреживании ловушек.",
      survivalPhaseEffect: "Снижает риск порезов и заражения крови при ручной разборке завалов до 0; +1 к проверкам разминирования."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_helmet_hard",
    category: 'item',
    originTag: "NEW",
    name: "Каска строительная ударопрочная",
    nameEn: "Impact-Resistant Construction Hard Hat",
    description: "Пластиковая каска высокой жёсткости с амортизирующим подшлемником и креплением для фонаря.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Жизненная необходимость при сейсмической активности, артобстрелах и работе в шахтах бункера.",
      survivalPhaseEffect: "Предотвращает травмы головы при обвалах потолка и падении камней; спасает от нокаута при ударах."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_balaclava_windstopper",
    category: 'item',
    originTag: "NEW",
    name: "Маска-балаклава ветрозащитная (Windstopper)",
    nameEn: "Windstopper Mask Balaclava",
    description: "Флисовый подшлемник, закрывающий всё лицо кроме глаз, с мембраной от пронизывающего ветра.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Элемент анонимности и защита лица от обморожений: помогает скрыть эмоции во время дебатов.",
      survivalPhaseEffect: "Защищает лицо от обморожений в суровых зимних условиях; даёт +1 к запугиванию при допросах."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_backpack_expander_module",
    category: 'item',
    originTag: "NEW",
    name: "Рюкзак-расширитель модульный (+1 слот)",
    nameEn: "Modular Backpack Expander (+1 Slot)",
    description: "Подвесной подсумок системы MOLLE из кордуры 1000D, увеличивающий полезный объём рюкзака.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент носильщика: «Я смогу унести на один ценный предмет больше любого другого кандидата».",
      survivalPhaseEffect: "Навсегда увеличивает вместимость рюкзака владельца на +1 слот (не может превышать лимит веса)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_thermal_underwear_arctic",
    category: 'item',
    originTag: "NEW",
    name: "Термобельё арктическое (комплект)",
    nameEn: "Arctic Thermal Underwear Set",
    description: "Двухслойное функциональное бельё из мериносовой шерсти и синтетики, отводящее влагу и греющее тело.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Личный комфорт и профилактика простуд при жизни на холодном бетонном полу укрытия.",
      survivalPhaseEffect: "Снижает расход калорий организма на обогрев; даёт защиту от переохлаждения при выходе из строя котельной."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_ballistic_goggles_anti_frag",
    category: 'item',
    originTag: "NEW",
    name: "Очки тактические противоосколочные",
    nameEn: "Anti-Fragmentation Ballistic Goggles",
    description: "Баллистические поликарбонатные очки со сменными жёлтыми и тёмными линзами толщиной 2.8 мм.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Защита зрения от пыли, осколков бетона и ослепляющих вспышек взрывов.",
      survivalPhaseEffect: "Полностью защищает глаза от пылевых бурь, щебня и ослепления светошумовыми гранатами."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_harness_climbing_carabiners",
    category: 'item',
    originTag: "NEW",
    name: "Пояс монтажный страховочный с карабинами",
    nameEn: "Safety Harness with Carabiners",
    description: "Широкий пояс с наплечными лямками, двумя стальными карабинами и прочными стропами.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Безопасность высотных работ при ремонте антенн на мачте бункера и спуске в вентиляционные шахты.",
      survivalPhaseEffect: "Исключает риск падения с высоты при наружных работах на крыше и антенных мачтах укрытия."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_chest_rig_tactical",
    category: 'item',
    originTag: "NEW",
    name: "Жилет-разгрузка тактический (Chest Rig)",
    nameEn: "Tactical Chest Rig Vest",
    description: "Нагрудная разгрузочная система с карманами под магазины, рацию, гранаты и аптечку.",
    metadata: {
      itemCategory: "CLOTHING",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Боевая готовность: мгновенный доступ к боеприпасам и инструментам без необходимости снимать рюкзак.",
      survivalPhaseEffect: "Позволяет использовать предметы первой помощи и оружие в бою без траты очков действия на доставание."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_topographic_map_marked",
    category: 'item',
    originTag: "BASE",
    name: "Топографическая карта региона с пометками",
    nameEn: "Marked Regional Topographic Map",
    description: "Ламинированная военная карта масштаба 1:50000 с нанесёнными рельефом, дорогами и схронами.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Ключевой довод разведки: понимание географии окружающего мира, рек, складов и опасных зон.",
      survivalPhaseEffect: "Ускоряет любые наземные экспедиции на 30%; открывает местоположение трёх заброшенных складов."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_special_agent_id",
    category: 'item',
    originTag: "BASE",
    name: "Удостоверение сотрудника спецслужб",
    nameEn: "Special Agent Identification Badge",
    description: "Красная корочка офицера госбезопасности с гербовой печатью и правом беспрепятственного прохода.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Психологический аргумент власти и авторитета: возможность надавить на сомневающихся законом.",
      survivalPhaseEffect: "Даёт право одного решающего вето при спорных голосованиях по внутреннему распорядку бункера."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_military_manual",
    category: 'item',
    originTag: "NEW",
    name: "Военный устав полевой службы",
    nameEn: "Field Service Military Manual",
    description: "Карманное издание устава вооружённых сил, регламентирующее караульную службу, оборону и субординацию.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Аргумент дисциплины: правила организации караулов, распределения пайков и предотвращения хаоса.",
      survivalPhaseEffect: "+1 к слаженности действий гарнизона при отражении штурма; снижает вероятность паники в кризисе."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_survivalist_diary",
    category: 'item',
    originTag: "NEW",
    name: "Дневник опытного выживальщика",
    nameEn: "Experienced Survivalist Diary",
    description: "Толстый блокнот в кожаном переплёте с рукописными советами по выживанию, чертежами и ловушками.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Копилка практической мудрости: сотни проверенных решений при отказе фильтров и систем жизнеобеспечения.",
      survivalPhaseEffect: "Даёт +1 ко всем проверкам Выживания любому персонажу, прочитавшему дневник во время отдыха."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_property_deeds_legal",
    category: 'item',
    originTag: "NEW",
    name: "Юридические документы и свидетельства на собственность",
    nameEn: "Property Deeds & Legal Certificates",
    description: "Нотариально заверенные акты на землю, доли в предприятиях и подтверждения ученых степеней.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Документальное подтверждение квалификации или обещание колоссальной награды после конца катастрофы.",
      survivalPhaseEffect: "В фазе после выхода из бункера даёт статус законного владельца ресурсов; повышает убеждение в спорах."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_bunker_blueprints_vent",
    category: 'item',
    originTag: "NEW",
    name: "Схема коммуникаций и вентиляции бункера",
    nameEn: "Bunker Communications & Ventilation Blueprint",
    description: "Инженерная синька подземного комплекса с указанием кабельных каналов, фильтров и тайных лазов.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Бесценный чертёж убежища: «Без этой схемы вы не поймёте, какую трубу перекрывать при затоплении».",
      survivalPhaseEffect: "+2 к скорости ликвидации любых аварий в бункере; открывает скрытый технический лаз для эвакуации."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_cipher_book_one_time",
    category: 'item',
    originTag: "NEW",
    name: "Шифровальная книга одноразовых ключей",
    nameEn: "One-Time Pad Cipher Book",
    description: "Блокнот со случайными буквенно-цифровыми группами для кодирования секретных радиограмм.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Гарантия конфиденциальности связи: защита каналов от прослушивания мародёрами и шпионами.",
      survivalPhaseEffect: "Позволяет вести закрытые переговоры по радио, исключая перехват информации внешними бандами."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_encyclopedia_applied_science",
    category: 'item',
    originTag: "NEW",
    name: "Энциклопедия прикладных наук (том в одном переплёте)",
    nameEn: "Applied Sciences Encyclopedia",
    description: "Фундаментальный справочник по физике, химии, механике, сельскому хозяйству и металлургии.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Научный багаж возрождения цивилизации: теоретическая база для восстановления технологий с нуля.",
      survivalPhaseEffect: "Снижает сложность любых научных и инженерных исследований в бункере на 2 ступени."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_evacuation_bunkers_map",
    category: 'item',
    originTag: "NEW",
    name: "Карта эвакуационных коридоров и правительственных бункеров",
    nameEn: "Evacuation Corridors & Gov Bunkers Map",
    description: "Секретный план расположения стратегических убежищ высшего руководства страны с радиокодами связи.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Сверхценная информация: маршрут к укреплённому центральному мегабункеру с ресурсами на десятилетия.",
      survivalPhaseEffect: "Открывает квест на организацию радиоконтакта с Правительственным бункером для последующей эвакуации."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_kompromat_dossier",
    category: 'item',
    originTag: "NEW",
    name: "Папка с компроматом на влиятельных лиц",
    nameEn: "Kompromat Dossier on VIP Figures",
    description: "Материалы закрытых расследований, компрометирующие фотографии и стенограммы финансовых махинаций.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Оружие шантажа: возможность дискредитировать оппонентов на дебатах или заставить их голосовать в унисон.",
      survivalPhaseEffect: "Позволяет однократно принудить любого игрока проголосовать так, как выгодно владельцу компромата."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_poisonous_plants_guide",
    category: 'item',
    originTag: "NEW",
    name: "Справочник по ядовитым растениям и грибам",
    nameEn: "Toxic Plants & Fungi Handbook",
    description: "Цветной определитель дикорастущей флоры с описанием токсинов, противоядий и съедобных двойников.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Безопасность собирательства: исключение отравлений при заготовке даров природы на поверхности.",
      survivalPhaseEffect: "Полностью исключает риск случайного отравления группы собранными грибами и ягодами при экспедициях."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_fortifications_plan",
    category: 'item',
    originTag: "NEW",
    name: "Архитектурный план внешних укреплений",
    nameEn: "External Fortifications Architectural Plan",
    description: "Схема расположения противотанковых ежей, колючей проволоки, огневых точек и минных полей на входе.",
    metadata: {
      itemCategory: "DOCUMENTS",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Тактический козырь обороны: оптимизация расстановки караулов и ловушек перед главным шлюзом.",
      survivalPhaseEffect: "Повышает обороноспособность входа в бункер на +20%; позволяет разминировать проходы без потерь."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_guitar_acoustic",
    category: 'item',
    originTag: "BASE",
    name: "Гитара акустическая шестиструнная",
    nameEn: "Six-String Acoustic Guitar",
    description: "Деревянная классическая гитара в брезентовом чехле с запасным комплектом нейлоновых струн.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Эмоциональный довод души компании: живая музыка спасает людей от уныния, ссор и депрессии.",
      survivalPhaseEffect: "Регулярные вечерние концерты повышают Мораль всей группы на +1 каждые 3 дня; гасят конфликты."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_bible_pocket_leather",
    category: 'item',
    originTag: "BASE",
    name: "Библия карманная в кожаном переплёте",
    nameEn: "Leatherbound Pocket Bible",
    description: "Компактная священная книга с закладкой, содержащая Ветхий и Новый Заветы.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Духовный ориентир надежды и милосердия для верующих в период апокалипсиса.",
      survivalPhaseEffect: "Помогает справляться со стрессом и утратой товарищей; снижает шанс безумия при психотравмах на 50%."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_family_photo_framed",
    category: 'item',
    originTag: "BASE",
    name: "Семейная фотография в рамке",
    nameEn: "Framed Family Photograph",
    description: "Тёплый снимок близких людей в латунной рамке под стеклом, напоминающий о доме.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Трогательный личный аргумент: мотивация жить, бороться и сохранить человечность ради памяти о семье.",
      survivalPhaseEffect: "Даёт персонажу несгибаемую волю: 1 раз за игру предотвращает нервный срыв или суицидальный порыв."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_lucky_talisman_coin",
    category: 'item',
    originTag: "BASE",
    name: "Талисман на удачу (старинная монета)",
    nameEn: "Lucky Talisman Vintage Coin",
    description: "Серебряный рубль времён Российской Империи с потёртым орлом, носимый на цепочке.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Иррациональный, но вдохновляющий довод фарта: «Я приношу удачу всем, кто находится рядом».",
      survivalPhaseEffect: "Позволяет владельцу один раз за игру перебросить любой критически проваленный кубик проверки."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_cards_playing_54",
    category: 'item',
    originTag: "BASE",
    name: "Колода игральных карт (54 листа)",
    nameEn: "Playing Cards Deck (54 cards)",
    description: "Пластиковая колода карт с классическим покерным дизайном в картонной коробке.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Простой досуг для снятия напряжения долгими вечерами изоляции от внешнего мира.",
      survivalPhaseEffect: "Снижает скуку и уровень агрессии среди выживших; служит внутренней валютой для азартных пари."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_secret_case",
    category: 'item',
    originTag: "NEW",
    name: "Секретный чемодан с кодовым замком",
    nameEn: "Secret Case with Combination Lock",
    description: "Тяжёлый титановый дипломат с электронно-механическим кодовым замком и неизвестным содержимым.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 5,
      slotsOccupied: 2,
      isQuestItem: true,
      selectionPhaseEffect: "Главная сюжетная загадка игры: интрига содержимого заставляет команду пустить владельца внутрь.",
      survivalPhaseEffect: "Вскрывается на 15-й день (код открывается ведущим): содержит уникальные технологии, сыворотку или взрывчатку."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_harmonica_hohner",
    category: 'item',
    originTag: "NEW",
    name: "Гармоника губная Hohner Marine Band",
    nameEn: "Hohner Marine Band Harmonica",
    description: "Металлическая хроматическая губная гармошка тональности До-мажор в пластиковом футляре.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Компактнейший музыкальный инструмент: поднимает настроение в любом походе и не весит ничего.",
      survivalPhaseEffect: "Повышает настроение владельца и соседей по отсеку; не занимает драгоценных слотов и веса."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_perfume_premium_100ml",
    category: 'item',
    originTag: "NEW",
    name: "Флакон духов премиум-класса (100 мл)",
    nameEn: "Premium Perfume Bottle (100ml)",
    description: "Стеклянный флакон изысканного французского парфюма с утончённым стойким древесным ароматом.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Оригинальный шарм-аргумент: способность заглушить тяжёлый смрад подземного убежища.",
      survivalPhaseEffect: "Маскирует запах пота и немытых тел в замкнутом пространстве (+1 к комфорту); перебивает запах для чужих собак."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_cuban_cigars_box",
    category: 'item',
    originTag: "NEW",
    name: "Сигары кубинские (коробка из кедра 10 шт)",
    nameEn: "Cuban Cigars Cedar Box (10 pcs)",
    description: "Отборные скрученные вручную гаванские сигары в ароматной кедровой коробке с гигростатом.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Роскошная взятка для сильных мира сего: идеальный предмет для заключения дипломатических союзов.",
      survivalPhaseEffect: "При раскуривании с союзником гарантирует взаимную лояльность на 5 дней; предмет дорогого бартера."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_notebook_pencil",
    category: 'item',
    originTag: "NEW",
    name: "Личный блокнот с карандашом",
    nameEn: "Personal Notebook with Pencil",
    description: "Толстый молескин в твёрдой обложке с нестираемым графитовым карандашом для летописи бункера.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Роль летописца: фиксация законов, распределения ресурсов и хроники нового человечества.",
      survivalPhaseEffect: "Позволяет вести точный учёт пайков, предотвращая хищения; фиксирует письменные союзы игроков."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_gun_cleaning_kit",
    category: 'item',
    originTag: "NEW",
    name: "Набор для чистки и смазки оружия",
    nameEn: "Gun Cleaning & Maintenance Kit",
    description: "Футляр с латунным шомполом, вишерными ершами, ветошью и нейтральным оружейным маслом «Беркут».",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Критичный предмет для всех стрелков: без чистки любое огнестрельное оружие в бункере заржавеет от влажности.",
      survivalPhaseEffect: "Предотвращает осечки и поломки огнестрельного оружия; даёт +1 к точности стрельбы почищенного оружия."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_compact_survival_tin",
    category: 'item',
    originTag: "NEW",
    name: "Набор выживальщика компактный (Survival Kit в консервной банке)",
    nameEn: "Compact Survival Kit in Tin Can",
    description: "Герметичная жестяная коробка с огнивом, леской, крючками, пилой-струной, компасом-таблеткой и свистком.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Надёжный мини-комплект: самодостаточный набор для автономного существования вдали от цивилизации.",
      survivalPhaseEffect: "Компенсирует отсутствие профильных инструментов в экстремальных ситуациях (+1 к спасброскам)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_foil_rescue_blanket",
    category: 'item',
    originTag: "NEW",
    name: "Одеяло спасательное из фольги (изотермическое)",
    nameEn: "Isothermal Foil Rescue Blanket",
    description: "Ультратонкая металлизированная плёнка из майлара, отражающая до 90% излучаемого телом тепла.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Легковесный аргумент термозащиты: спасение от шока и холода при минимальном весе в багаже.",
      survivalPhaseEffect: "Спасает пострадавшего от переохлаждения и шока; экранирует тело от инфракрасных датчиков мутантов."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_canister_gasoline",
    category: 'item',
    originTag: "NEW",
    name: "Канистра бензина (металлическая 10 л)",
    nameEn: "Metal Gasoline Canister (10L)",
    description: "Штампованная армейская канистра с высокооктановым бензином АИ-95 для техники и генератора.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 4,
      slotsOccupied: 1,
      selectionPhaseEffect: "Главный энергетический довод: 10 дней света, тепла и фильтрации воздуха для всей группы.",
      survivalPhaseEffect: "Обеспечивает 10 суток бесперебойной работы генератора или заправку разведывательного транспорта."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_woodgas_stove_folding",
    category: 'item',
    originTag: "NEW",
    name: "Переносная походная печь-щепочница",
    nameEn: "Portable Folding Woodgas Stove",
    description: "Складная турбо-печка из нержавеющей стали с принудительным нагнетателем тяги на батарейке.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Тепло и горячая пища на щепках, сухом спирте и мусоре без дыма и демаскирующего пламени.",
      survivalPhaseEffect: "Позволяет варить пищу и кипятить воду на любом горючем мусоре, экономя баллоны с газом бункера."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_plasma_torch_metal",
    category: 'item',
    originTag: "NEW",
    name: "Плазменный ручной резак по металлу",
    nameEn: "Handheld Metal Plasma Cutter",
    description: "Инновационный термический инструмент для скоростной резки бронированных листов и арматуры.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 3,
      slotsOccupied: 1,
      selectionPhaseEffect: "Инструмент быстрого проникновения: вскрытие сейфов, заваренных аварийных люков и складов.",
      survivalPhaseEffect: "Вскрывает любые заваренные двери и сейфы без лишнего шума; 4 применения на полном заряде."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_hardware_nails_screws_box",
    category: 'item',
    originTag: "NEW",
    name: "Коробка строительного крепежа и гвоздей (1 кг)",
    nameEn: "Construction Hardware Box & Nails (1kg)",
    description: "Ассортимент стальных оцинкованных гвоздей, дюбелей, саморезов и стальных уголков.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 2,
      slotsOccupied: 1,
      selectionPhaseEffect: "Расходник плотника и строителя: укрепление дверей, стеллажей и сооружение защитных щитов.",
      survivalPhaseEffect: "Необходим для возведения и укрепления баррикад (+2 к прочности укрытий от штурмов)."
    } satisfies IItemMetadata
  },
  {
    cardId: "item_travel_chess_magnetic",
    category: 'item',
    originTag: "NEW",
    name: "Шахматы дорожные магнитные",
    nameEn: "Magnetic Travel Chess",
    description: "Компактная складная доска с миниатюрными фигурами на магнитах для интеллектуального досуга.",
    metadata: {
      itemCategory: "PERSONAL",
      weight: 1,
      slotsOccupied: 1,
      selectionPhaseEffect: "Интеллектуальный тренажёр ума: сохранение ясности мышления и тактической мысли среди лидеров.",
      survivalPhaseEffect: "Повышает концентрацию игроков; при игре с союзником даёт +1 к тактическому взаимодействию на 3 дня."
    } satisfies IItemMetadata
  }
];
