import { ICardDocument, ISuperpowerMetadata } from '../types/card.types.js';

export const superpowersDeck: ICardDocument[] = [
  {
    cardId: "sp_01_can_opener_gaze",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Взгляд-консервный нож",
    nameEn: "Can-Opener Gaze",
    description: "Способность силой направленного микрокинетического взгляда вскрывать любые металлические банки, запаянную жесть и консервы за доли секунды.",
    metadata: {
      code: "СП-01",
      passivePerk: "Открытие любых консервированных рационов не требует инструментов и времени. Риск травмы рук при вскрытии банок снижен до 0%.",
      activeAbility: {
        name: "Взгляд-консервный нож",
        description: "Раз в 5 дней может силой взгляда разрезать тонкую металлическую пластину, заклинившую дверь или вентиляционную решётку (1 ОД).",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«В темноте и при дефиците инструментов я гарантирую, что ни одна банка тушёнки не останется закрытой, а вы не порежете пальцы ржавыми ножами!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_02_thermogenesis",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Биогенерация тепла",
    nameEn: "Thermogenesis",
    description: "Тело персонажа функционирует как высокоэффективный инфракрасный обогреватель, излучая комфортное тепло до 45°C в радиусе 3 метров без перегрева самого носителя.",
    metadata: {
      code: "СП-02",
      passivePerk: "Отсек бункера, где ночует персонаж, получает статус «Отапливаемый» даже при 100% аварии системы обогрева.",
      activeAbility: {
        name: "Биогенерация тепла",
        description: "Экстренный нагрев до кипения 10 литров воды без использования газа и дров.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Если выйдет из строя генератор или снаружи наступит ядерная зима, я спасу всю спальню от переохлаждения и гипотермии!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_03_lead_blood",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Абсолютный иммунитет к радиации",
    nameEn: "Lead Blood",
    description: "Плотная клеточная репарация делает ткани полностью устойчивыми к ионизирующему излучению любых типов (альфа, бета, гамма, нейтроны).",
    metadata: {
      code: "СП-03",
      passivePerk: "Иммунитет к радиационным угрозам, острой лучевой болезни и загрязнённым осадкам.",
      activeAbility: {
        name: "Абсолютный иммунитет к радиации",
        description: "«Разведка в эпицентр» — выход на заражённую поверхность на 6 часов без скафандра для сбора 1 случайного предмета/ресурса.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Кто полезет чинить реактор или выйдет на поверхность за фильтрами в радиоактивную бурю? Только я!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_04_beast_whisperer",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Зоопсихопатия (Чтение мыслей животных)",
    nameEn: "Beast Whisperer",
    description: "Телепатическая связь с фауной: понимание сигналов грызунов, птиц, одичавших собак и мутировавших насекомых.",
    metadata: {
      code: "СП-04",
      passivePerk: "Предупреждение об угрозах «Нашествие грызунов» и «Обрушение шахты» за 24 часа до их наступления.",
      activeAbility: {
        name: "Зоопсихопатия (Чтение мыслей животных)",
        description: "Приручение 1 дикого животного у гермодвери (превращается в защитный ресурс бункера).",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я заранее скажу вам, когда крысы почувствуют обрушение свода или приближение ядовитых газов, а бродячую стаю превращу в нашу стражу!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_05_dream_weaver",
    category: 'superpower',
    originTag: "NEW",
    name: "Ониромантия (Манипуляция снами)",
    nameEn: "Dream Weaver",
    description: "Способность проникать в коллективные сновидения спящих в бункере, успокаивая кошмары или внушая нужные мысли.",
    metadata: {
      code: "СП-05",
      passivePerk: "Все игроки в одной спальной зоне с носителем восстанавливают мораль на +10% быстрее при сне.",
      activeAbility: {
        name: "Ониромантия (Манипуляция снами)",
        description: "«Телепатический опрос» — узнать скрытую мотивацию или тайное условие победы 1 спящего игрока с шансом 70%.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«В тесном бункере треть людей сходит с ума от ночных панических атак. Я буду вашим психотерапевтом во сне, снимая стресс бесплатно."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_06_bio_echolocation",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Биоэхолокация",
    nameEn: "Bio-Echolocation",
    description: "Способность издавать неслышимые щелчки и строить в мозгу идеальную 3D-карту помещений в абсолютной темноте и плотном дыму.",
    metadata: {
      code: "СП-06",
      passivePerk: "Носитель полностью игнорирует штрафы от темноты, поломок освещения и дымовых завес.",
      activeAbility: {
        name: "Биоэхолокация",
        description: "«Сканирование стен» — обнаружение скрытых трещин в перекрытиях бункера или замурованных комнат.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«При пожаре, задымлении или полном отключении энергии я выведу всех из горящего крыла и найду аварийный рубильник вслепую!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_07_torpor_metabolism",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Замедленный анабиозный метаболизм",
    nameEn: "Torpor Metabolism",
    description: "Способность произвольно замедлять сердцебиение до 2 ударов в минуту и потреблять в 5 раз меньше кислорода и калорий.",
    metadata: {
      code: "СП-07",
      passivePerk: "Персонаж расходует всего 0.25 суточного рациона еды и воды. При голоде и засухе не получает дебаффов до 14 дней подряд.",
      activeAbility: {
        name: "Замедленный анабиозный метаболизм",
        description: "Погрузиться в «Спячку» на 3 дня, вообще не потребляя воздух и ресурсы бункера.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я съем в четыре раза меньше ваших драгоценных консервов и не истрачу лишний литр воды!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_08_geotactile_sense",
    category: 'superpower',
    originTag: "NEW",
    name: "Внутренний компас и сейсмодатчик",
    nameEn: "Geotactile Sense",
    description: "Ощущение магнитных полюсов Земли костями черепа и восприятие микровибраций почвы подошвами ног.",
    metadata: {
      code: "СП-08",
      passivePerk: "Команда получает 12-часовое окно предупреждения перед событиями «Землетрясение» и «Обвал».",
      activeAbility: {
        name: "Внутренний компас и сейсмодатчик",
        description: "Безошибочное определение направления на водную жилу при бурении колодца (+30% к шансу добычи чистой воды).",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я предскажу подземный толчок или подвижку пластов за час до того, как затрещат бетонные балки."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_09_chlorophyll_skin",
    category: 'superpower',
    originTag: "NEW",
    name: "Фотосинтезирующая кожа",
    nameEn: "Chlorophyll Skin",
    description: "В эпидермисе присутствуют симбиотические хлоропласты, способные синтезировать глюкозу под воздействием УФ-лучей или ламп полного спектра.",
    metadata: {
      code: "СП-09",
      passivePerk: "При наличии работающего освещения в гидропонном отсеке персонажу не требуется еда.",
      selectionArgument: "«Дайте мне посидеть 2 часа под фитолампой гидропоники — и мне не нужна ваша тушёнка!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_10_acidic_secretion",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Кислотный плевок",
    nameEn: "Acidic Secretion",
    description: "Слюнные железы способны по воле владельца вырабатывать концентрированную смесь соляной и фтористоводородной кислот.",
    metadata: {
      code: "СП-10",
      passivePerk: "",
      activeAbility: {
        name: "Кислотный плевок",
        description: "Нанесение летального урона дикому мутанту/рейдеру на короткой дистанции.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Заклинило стальной замок? Напал мародёр в бронежилете? Я прожгу металл за минуту без автогена."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_11_ferromagnetic_touch",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Магнитная кожа",
    nameEn: "Ferromagnetic Touch",
    description: "Способность ладонями генерировать мощное магнитное поле, притягивая или удерживая металлические предметы весом до 15 кг.",
    metadata: {
      code: "СП-11",
      passivePerk: "Скорость ремонта любых металлических конструкций повышена на 25%.",
      activeAbility: {
        name: "Магнитная кожа",
        description: "Обезоруживание нападающего с холодным или огнестрельным оружием без получения урона.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Уронили гаечный ключ или связку ключей в шахту вентиляции или колодец? Я достану за секунду!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_12_chemical_sommelier",
    category: 'superpower',
    originTag: "NEW",
    name: "Детектор токсинов языком",
    nameEn: "Chemical Sommelier",
    description: "Вкусовые сосочки способны распознавать миллионные доли любых ядов, радиоизотопов, ботулотоксина и пестицидов при касании кончиком языка.",
    metadata: {
      code: "СП-12",
      passivePerk: "100% защита от случайных отравлений едой и водой для всей группы (персонаж инспектирует рационы).",
      activeAbility: {
        name: "Детектор токсинов языком",
        description: "Анализ неизвестной жидкости/порошка на пригодность к использованию.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Никто в бункере не умрёт от ботулизма или отравленной грунтовой воды — я стану вашим личным дегустатором."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_13_wi_fi_empathy",
    category: 'superpower',
    originTag: "NEW",
    name: "Радиопоглощающая кожа",
    nameEn: "Wi-Fi Empathy",
    description: "Способность слуховыми рецепторами улавливать радиоволны AM/FM диапазонов и сигнатуры азбуки Морзе без приёмника.",
    metadata: {
      code: "СП-13",
      passivePerk: "Постоянный перехват радиосообщений внешнего мира, даже если радиостанция бункера уничтожена.",
      activeAbility: {
        name: "Радиопоглощающая кожа",
        description: "Передача слабого сигнала SOS через колебания нервной системы в антенный контур бункера.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Если рация сгорит от ЭМИ-импульса, я всё равно услышу военные маяки и спасательные частоты собственной головой!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_14_adrenaline_surge",
    category: 'superpower',
    originTag: "NEW",
    name: "Контроль адреналина напарника",
    nameEn: "Adrenaline Surge",
    description: "Феромонный и визуальный триггер, мгновенно разгоняющий пульс и силу выбранного союзника в критической ситуации.",
    metadata: {
      code: "СП-14",
      passivePerk: "",
      activeAbility: {
        name: "Контроль адреналина напарника",
        description: "Выбранный напарник на текущий игровой день удваивает свои физические характеристики и успех ремонта/обороны. На следующий день напарник отдыхает.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«В момент аварии или прорыва дверей я заставлю любого из вас поднять трёхтонную плиту и совершить невозможное!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_15_subdermal_osteoderms",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Костная броня",
    nameEn: "Subdermal Osteoderms",
    description: "Под кожей сформирован слой плотных костных пластин, рассеивающих удары тупыми предметами, осколками и дробью.",
    metadata: {
      code: "СП-15",
      passivePerk: "Не может быть убит одиночным ударом холодного оружия.",
      selectionArgument: "«Я могу идти первым при зачистке завалов или драке с бандитами — меня невозможно вырубить монтировкой!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_16_rapid_mitosis",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Регенерация кончиков пальцев и тканей",
    nameEn: "Rapid Mitosis",
    description: "Скорость заживления ран в 10 раз выше человеческой. Глубокие порезы затягиваются за 3 часа без швов и шрамов.",
    metadata: {
      code: "СП-16",
      passivePerk: "Любые травмы, переломы и ранения заживают за 1 день вместо 4-7 дней.",
      activeAbility: {
        name: "Регенерация кончиков пальцев и тканей",
        description: "«Донорство плазмы» — переливание крови тяжелораненому игроку, мгновенно снимающее статус «При смерти».",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я не стану обузой в лазарете: любая травма заживёт до утра без расхода бинтов и антибиотиков."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_17_cutaneous_respiration",
    category: 'superpower',
    originTag: "NEW",
    name: "Дыхание кожей под водой и в угаре",
    nameEn: "Cutaneous Respiration",
    description: "Способность усваивать растворённый в воде или влажном воздухе кислород через микропоры тела при концентрациях CO₂ до 8%.",
    metadata: {
      code: "СП-17",
      passivePerk: "Иммунитет к удушью при затоплении отсеков и задымлении легкой/средней степени.",
      activeAbility: {
        name: "Дыхание кожей под водой и в угаре",
        description: "Выполнение ремонтных работ в полностью затопленном отсеке без спецоборудования.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Затопило трюм или нижний уровень с насосами? Я спущусь в ледяную воду на полчаса без акваланга и перекрою вентиль!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_18_biological_taser",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Электростатический разряд",
    nameEn: "Biological Taser",
    description: "Модифицированные клетки производят разряд напряжением до 20 000 Вольт при прямом контакте ладонями.",
    metadata: {
      code: "СП-18",
      passivePerk: "",
      activeAbility: {
        name: "Электростатический разряд",
        description: "Мгновенная нейтрализация одного нападающего агрессора без летального исхода.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Бесшумное оружие самообороны и аварийный дефибриллятор в одном флаконе. Никакого расхода патронов!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_19_chromatophore_camouflage",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Хамелеонова кожа",
    nameEn: "Chromatophore Camouflage",
    description: "Способность за 5 секунд сливаться по цвету и текстуре с бетоном, ржавчиной или тёмными углами бункера.",
    metadata: {
      code: "СП-19",
      passivePerk: "Персонажа невозможно застать врасплох или взять в заложники при вторжении снаружи.",
      activeAbility: {
        name: "Хамелеонова кожа",
        description: "«Тайное наблюдение» — подслушивание приватного разговора любых двух игроков на смартфоне без их ведома.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Идеальный разведчик и дозорный. Ни один шпион или мародёр не заметит меня на посту охраны."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_20_hypnotic_cadence",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Голос внушения (Нейроакустика)",
    nameEn: "Hypnotic Cadence",
    description: "Особые обертоны в тембре голоса, вызывающие у слушателей доверие, умиротворение и подавление агрессии.",
    metadata: {
      code: "СП-20",
      passivePerk: "",
      activeAbility: {
        name: "Голос внушения (Нейроакустика)",
        description: "«Успокоение толпы» — полная отмена события «Бунт» или «Массовая истерия» без силового вмешательства.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«В любой драке и бунте я одним монологом остужу горячие головы и заставлю людей договариваться мирно."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_21_osmotic_hands",
    category: 'superpower',
    originTag: "NEW",
    name: "Очищение воды касанием",
    nameEn: "Osmotic Hands",
    description: "Ладони действуют как нанофильтрационные осмотические мембраны: пропуская через пальцы грязную жижу, игрок сливает кристально чистую H₂O.",
    metadata: {
      code: "СП-21",
      passivePerk: "Бункер ежедневно получает +5 литров чистой питьевой воды из любых источников (канализация, грунтовая жижа, технический конденсат).",
      activeAbility: {
        name: "Очищение воды касанием",
        description: "Нейтрализация угрозы «Заражение гидросистемы».",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Если наши фильтры забьются радиоактивным илом, я обеспечу каждого из вас кружкой стерильной воды ежедневно."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_22_technopathic_intuition",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Интуитивный ремонт техники",
    nameEn: "Technopathic Intuition",
    description: "Прикосновением к вибрирующему механизму персонаж мгновенно слышит усталость металла, люфт подшипников и замыкание проводки.",
    metadata: {
      code: "СП-22",
      passivePerk: "Снижает шанс поломки любой действующей системы бункера на 20%.",
      activeAbility: {
        name: "Интуитивный ремонт техники",
        description: "Бесплатный ремонт мелкой неисправности без расхода запчастей и материалов.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Мне не нужны диагностические стенды. Я приложу ухо к дизелю и скажу, какая форсунка откажет завтра."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_23_synaptic_alarm",
    category: 'superpower',
    originTag: "NEW",
    name: "Телепатический будильник",
    nameEn: "Synaptic Alarm",
    description: "Способность транслировать резкий всплеск бодрствования в сознание спящих обитателей бункера при любой угрозе.",
    metadata: {
      code: "СП-23",
      passivePerk: "Все ночные негативные случайные события получают штраф -50% к наносимому урону из-за мгновенной реакции жильцов.",
      activeAbility: {
        name: "Телепатический будильник",
        description: "Мгновенный сбор всех игроков для голосования в экстренной ситуации.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Нас никогда не застанут спящими врасплох: ни диверсанты, ни угарный газ, ни протечка в спальном блоке."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_24_scavenger_guts",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Метаболизм железного желудка",
    nameEn: "Scavenger Guts",
    description: "Сверхмощная микрофлора и желудочный сок, способные без вреда для здоровья переваривать картон, древесные опилки, кожу и тухлое мясо.",
    metadata: {
      code: "СП-24",
      passivePerk: "Абсолютный иммунитет к ботулизму и дизентерии.",
      selectionArgument: "«Когда закончится тушёнка, вы будете есть пайки, а я спокойно проживу на кожаных ремнях и размоченных обоях."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_25_lens_focus",
    category: 'superpower',
    originTag: "NEW",
    name: "Микроскопическое зрение",
    nameEn: "Lens Focus",
    description: "Мутация хрусталика позволяет фокусироваться на объектах размером до 5 микрометров с расстояния в пару сантиметров.",
    metadata: {
      code: "СП-25",
      passivePerk: "Эффективность ремонта электронных компонентов и медицинских операций повышена на 30%.",
      activeAbility: {
        name: "Микроскопическое зрение",
        description: "Выявление скрытых скрытых надписей, микротрещин или фальшивых пломб на снаряжении.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я запаяю микрочип толщиной с волос без микроскопа и увижу бактериальный налёт на швах вентиляции невооружённым глазом."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_26_pheromone_sniffer",
    category: 'superpower',
    originTag: "NEW",
    name: "Биологический компас феромонов",
    nameEn: "Pheromone Sniffer",
    description: "Обонятельный эпителий улавливает молекулы адреналина, кортизола и тестостерона в воздухе, работая как живой детектор лжи.",
    metadata: {
      code: "СП-26",
      passivePerk: "Во время голосований Отбора ведущий подсвечивает игроку 1 человека, который говорит неправду или скрывает квест.",
      activeAbility: {
        name: "Биологический компас феромонов",
        description: "«Тест на верность» — проверка одного игрока на скрытое условие победы типа [QUEST].",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Шпион, предатель или заражённый вирусной лихорадкой не скроет дрожь и запах пота. Я чую ложь за версту."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_27_silent_tread",
    category: 'superpower',
    originTag: "NEW",
    name: "Невесомый шаг",
    nameEn: "Silent Tread",
    description: "Строение ступней и распределение массы позволяют двигаться по битому стеклу, жести и скрипучим решёткам с уровнем шума менее 5 дБ.",
    metadata: {
      code: "СП-27",
      passivePerk: "Шанс провала тайных вылазок или ночных перемещений персонажа равен 0%.",
      activeAbility: {
        name: "Невесомый шаг",
        description: "Тайная кража 1 предмета у любого изгнанного или спящего без шанса быть пойманным.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Если бункер окружен монстрами или мародерами, только я смогу выбраться на цыпочках наружу и закрыть внешний засов."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_28_flame_quencher",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Подавление пламени аурой",
    nameEn: "Flame Quencher",
    description: "Эндотермическое поле вокруг тела снижает температуру в радиусе полутора метров и поглощает свободный кислород возле открытого огня.",
    metadata: {
      code: "СП-28",
      passivePerk: "Персонаж имеет 100% иммунитет к ожогам пламенем.",
      selectionArgument: "«Любой пожар в замкнутом пространстве — это смерть от угара. Я тушу воспламенения проводки голыми руками за 5 секунд."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_29_calcite_vision",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Рентгеновский взор (Флюороскопия)",
    nameEn: "Calcite Vision",
    description: "Способность на 10 секунд фокусировать взгляд сквозь органические ткани и деревянно-гипсовые преграды толщиной до 15 см.",
    metadata: {
      code: "СП-29",
      passivePerk: "Любые хирургические вмешательства в медблоке проходят со 100% успехом, если персонаж ассистирует врачу.",
      activeAbility: {
        name: "Рентгеновский взор (Флюороскопия)",
        description: "Просмотр инвентаря любого игрока на его смартфоне (вскрытие 1 скрытого предмета).",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я увижу внутреннее кровотечение, пулю в брюшине или спрятанное в одежде оружие без громоздкого рентген-аппарата."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_30_grounding_body",
    category: 'superpower',
    originTag: "NEW",
    name: "Поглощение электрического шока",
    nameEn: "Grounding Body",
    description: "Нервная система экранирована миелиновыми наноструктурами; тело перенаправляет любые токи высокого напряжения в землю без спазма мышц.",
    metadata: {
      code: "СП-30",
      passivePerk: "Полная неуязвимость к поражениям электрическим током при авариях энергосети.",
      activeAbility: {
        name: "Поглощение электрического шока",
        description: "Перемыкание аварийной цепи собственным телом на 1 час, позволяя запустить обесточенную фильтр-станцию.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Оборванный высоковольтный кабель в затопленном щитовом подвале? Я возьму его в руки и соединю клеммы."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_31_eidetic_archive",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Фотографическая память чертежей",
    nameEn: "Eidetic Archive",
    description: "Способность один раз взглянуть на сложную электросхему или карту коммуникаций и навечно сохранить её в памяти с точностью до микрона.",
    metadata: {
      code: "СП-31",
      passivePerk: "Полный иммунитет бункера к событию «Потеря карты/технической документации».",
      activeAbility: {
        name: "Фотографическая память чертежей",
        description: "Создание точной копии любой утерянной инструкции, схемы крафта или технического паспорта.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Если документация бункера сгорит в пожаре, я по памяти воспроизведу всю разводку вентилей, кабелей и тайников."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_32_universal_antivenom",
    category: 'superpower',
    originTag: "NEW",
    name: "Синтез противоядий (Кровь-антидот)",
    nameEn: "Universal Antivenom",
    description: "Лимфатическая система мгновенно вырабатывает поликлональные антитела к органическим ядам змей, пауков, трупному яду и токсинам плесени.",
    metadata: {
      code: "СП-32",
      passivePerk: "Носитель полностью иммунен к любым органическим токсинам и ядам.",
      activeAbility: {
        name: "Синтез противоядий (Кровь-антидот)",
        description: "Очищение одного заражённого токсинами союзника путём переливания сыворотки.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Моя кровь — это фабрика сывороток. Укусы мутантов или ядовитая плесень не убьют никого, пока я жив."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_33_cryo_breath",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Временная заморозка жидкостей дыханием",
    nameEn: "Cryo Breath",
    description: "Резкий эндотермический выдох позволяет мгновенно превратить до 2 литров воды в монолитный лёд за 3 секунды.",
    metadata: {
      code: "СП-33",
      passivePerk: "Сохранение скоропортящихся медикаментов и вакцин в импровизированном ледяном контейнере.",
      activeAbility: {
        name: "Временная заморозка жидкостей дыханием",
        description: "Мгновенное купирование аварийной протечки трубопровода (дает 24 часа инженеру на основательную починку).",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Пробоина в трубе под давлением? Я заморожу свищ ледяной пробкой быстрее, чем хлынет кипяток!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_34_sonic_shriek",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Акустический крик-оглушитель",
    nameEn: "Sonic Shriek",
    description: "Горловые мешки способны генерировать узконаправленный звуковой импульс частотой 130 дБ, разрывающий барабанные перепонки врагов.",
    metadata: {
      code: "СП-34",
      passivePerk: "",
      activeAbility: {
        name: "Акустический крик-оглушитель",
        description: "Отражение волны внешней атаки рейдоров без расхода боеприпасов бункера.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Нелетальное, но абсолютное оружие обороны гермоворот. Нападающие рейдеры упадут на колени с кровотечением из ушей."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_35_ore_dowser",
    category: 'superpower',
    originTag: "NEW",
    name: "Магнетическое чутье руды и кабелей",
    nameEn: "Ore dowser",
    description: "Восприятие ферромагнитных аномалий под землей глубиной до 20 метров.",
    metadata: {
      code: "СП-35",
      passivePerk: "Работы по расширению бункера и копке ходов занимают на 50% меньше времени.",
      activeAbility: {
        name: "Магнетическое чутье руды и кабелей",
        description: "Поиск скрытых залежей ценных запчастей или обломков конструкций в аварийных завалах.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Мы сможем расширить бункер, пробив стену ровно там, где нет плывуна, но есть залежи полезных металлов и сухой грунт."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_36_pain_share",
    category: 'superpower',
    originTag: "NEW",
    name: "Эмпатический резонанс боли",
    nameEn: "Pain Share",
    description: "Способность через тактильный контакт забирать на себя 50% физической боли и шока раненого напарника, ускоряя его стабилизацию.",
    metadata: {
      code: "СП-36",
      passivePerk: "",
      activeAbility: {
        name: "Эмпатический резонанс боли",
        description: "Предотвращение гибели тяжелораненого персонажа при отсутствии обезболивающих средств.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Смертельно раненый боец или хирург не умрёт от болевого шока на операционном столе — я разделю его муку."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_37_lexical_accelerator",
    category: 'superpower',
    originTag: "NEW",
    name: "Ускоренное чтение и дешифровка",
    nameEn: "Lexical Accelerator",
    description: "Мозг обрабатывает до 200 страниц технического текста в минуту с полным пониманием шифров, формул и незнакомых диалектов.",
    metadata: {
      code: "СП-37",
      passivePerk: "Любые найденные книги навыков и чертежи активируются мгновенно без затраты игровых дней на обучение.",
      activeAbility: {
        name: "Ускоренное чтение и дешифровка",
        description: "Взлом шифрованных радиопередач и военных кодов вещания.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Дайте мне инструкцию к ядерному реактору на китайском или древний мануал по консервации — через 10 минут я обучу персонал."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_38_keratin_control",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Регенерация зубов и волос",
    nameEn: "Keratin Control",
    description: "Способность стимулировать сверхбыстрый рост плотного кератина и эмали. Выбитый зуб вырастает за ночь; ногти режут пластик.",
    metadata: {
      code: "СП-38",
      passivePerk: "Полный иммунитет к болезням зубов, цинге и деградации костной ткани при дефиците витаминов.",
      activeAbility: {
        name: "Регенерация зубов и волос",
        description: "Создание прочных костяных игл, наконечников или импровизированных отмычек.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«В бункере цинга выбьет вам все зубы за полгода без витамина С. А у меня всегда идеальный прикус и прочные кости."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_39_moisture_condenser",
    category: 'superpower',
    originTag: "NEW",
    name: "Контроль влажности воздуха",
    nameEn: "Moisture Condenser",
    description: "Потовые железы работают в реверсивном режиме, осаждая взвешенные пары воды из душного воздуха отсека в виде капель на коже.",
    metadata: {
      code: "СП-39",
      passivePerk: "Защита продовольственного склада от плесени и сырости (+15% к сохранению еды).",
      activeAbility: {
        name: "Контроль влажности воздуха",
        description: "Сбор 2 литров дистиллята из влажного воздуха жилого блока.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я осушу отсыревший склад с крупами, спасая муку от плесени, и соберу конденсат для питья прямо из пара нашего дыхания."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_40_lantern_hands",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Биолюминесценция ладоней",
    nameEn: "Lantern Hands",
    description: "В тканях ладоней живут колонии симбиотических люциферазных бактерий, дающих мягкий ровный свет силой до 300 люмен при сжатии кулаков.",
    metadata: {
      code: "СП-40",
      passivePerk: "Никогда не расходует батарейки и свечи для собственных нужд.",
      selectionArgument: "«Вечный фонарик, не требующий батареек, керосина и спичек. С ним можно читать, оперировать и нести дозор во тьме."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_41_lie_sense",
    category: 'superpower',
    originTag: "NEW",
    name: "Ментальный компас лжи",
    nameEn: "Lie Sense",
    description: "При прямом зрительном контакте зрачки носителя микропульсируют, если собеседник намеренно произносит фактическую ложь.",
    metadata: {
      code: "СП-41",
      passivePerk: "",
      activeAbility: {
        name: "Ментальный компас лжи",
        description: "Игрок задает любому жильцу бункера прямой вопрос типа «Да/Нет» через интерфейс игры. Собеседник обязан ответить правду (проверяется движком).",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«В совете бункера не будет интриг: ни один заговорщик или саботажник не сможет обмануть меня на общем собрании."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_42_rubber_joints",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Сверхпластичность суставов",
    nameEn: "Rubber Joints",
    description: "Хрящи и связки способны растягиваться втрое без вывиха; кости таза и плеч временно смещаются для пролезания в узкие щели.",
    metadata: {
      code: "СП-42",
      passivePerk: "Персонаж может проникать в изолированные аварийные отсеки бункера через вентшахты.",
      activeAbility: {
        name: "Сверхпластичность суставов",
        description: "Ликвидация засора в воздуховоде без демонтажа перекрытий.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Труба воздуховода диаметром 25 сантиметров? Я протиснусь в неё, чтобы протолкнуть заклинившую заслонку изнутри."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_43_ion_saliva",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Энергетическая подзарядка батареек слюной",
    nameEn: "Ion Saliva",
    description: "Электролиты слюны обладают аномально высоким редокс-потенциалом; вымачивание севших щелочных батареек заряжает их на 60%.",
    metadata: {
      code: "СП-43",
      passivePerk: "Питание карманного дозиметра без расхода ресурсов бункера.",
      activeAbility: {
        name: "Энергетическая подзарядка батареек слюной",
        description: "Восстановление одной разряженной батарейки или аккумулятора до рабочего состояния.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Ваши рации, дозиметры и фонарики будут работать вечно, пока у меня есть слюна!"
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_44_sixth_sense",
    category: 'superpower',
    originTag: "NEW",
    name: "Предвидение катастрофического броска (Прекогниция опасности)",
    nameEn: "Sixth Sense",
    description: "Кратковременная вспышка мигрени за 10 секунд до смертельного события (падение балки, взрыв баллона, рикошет пули).",
    metadata: {
      code: "СП-44",
      passivePerk: "100% защита носителя от случайной мгновенной гибели при непредвиденных кризисах (персонаж всегда успевает отскочить).",
      activeAbility: {
        name: "Предвидение катастрофического броска (Прекогниция опасности)",
        description: "Спасение одного напарника от смертельного исхода при ЧП.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я инстинктивно оттолкну соседа за секунду до обвала плиты. Моя интуиция спасет ценнейшего спеца."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_45_carboxy_resistant_blood",
    category: 'superpower',
    originTag: "NEW",
    name: "Иммунитет к угарному газу (Сверхгемоглобин)",
    nameEn: "Carboxy-Resistant Blood",
    description: "Модифицированная формула гемоглобина не связывается с монооксидом углерода (CO), сохраняя транспортировку кислорода в задымлении.",
    metadata: {
      code: "СП-45",
      passivePerk: "Полная невосприимчивость к угарному газу и продуктам горения пластика.",
      activeAbility: {
        name: "Иммунитет к угарному газу (Сверхгемоглобин)",
        description: "Эвакуация до 2 потерявших сознание людей из горящего крыла без вреда для себя.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Там, где все задохнутся за три вдоха в дыму тлеющей проводки, я спокойно вытащу баллоны и пострадавших."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_46_rust_solvent",
    category: 'superpower',
    originTag: "NEW",
    name: "Растворение ржавчины потом",
    nameEn: "Rust Solvent",
    description: "Кожные выделения содержат концентрированные хелатирующие агенты, превращающие ржавчину и окислы в легко смываемый порошок.",
    metadata: {
      code: "СП-46",
      passivePerk: "Снижает износ старого металлизированного оборудования бункера на 20%.",
      activeAbility: {
        name: "Растворение ржавчины потом",
        description: "Разблокировка любого заржавевшего механизма/шлюза без применения болгарки и лома.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Закипевшие вековые вентили, заржавевшие люки бомбоубежища — я откручу их голыми руками за пару минут."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_47_vent_whisperer",
    category: 'superpower',
    originTag: "ALPHA",
    name: "Психоакустический шепот в вентиляцию",
    nameEn: "Vent Whisperer",
    description: "Умение модулировать голос так, что звук резонирует по воздуховодам и кажется слушателям в отдаленных комнатах голосом их совести или духов.",
    metadata: {
      code: "СП-47",
      passivePerk: "",
      activeAbility: {
        name: "Психоакустический шепот в вентиляцию",
        description: "Снижение боевого духа рейдеров у входа на -30%.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я могу деморализовать осаждающих снаружи врагов или направить бунтовщиков по ложному следу без единого выстрела."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_48_gyro_spine",
    category: 'superpower',
    originTag: "NEW",
    name: "Сверхчеловеческий баланс и вестибулярная стабильность",
    nameEn: "Gyro Spine",
    description: "Абсолютная устойчивость к укачиванию, сотрясениям, падениям с высоты до 5 метров на ноги и работе на висящих тросах над пропастью.",
    metadata: {
      code: "СП-48",
      passivePerk: "Персонаж никогда не получает травм от падений, обрушений лесов и шатких конструкций.",
      activeAbility: {
        name: "Сверхчеловеческий баланс и вестибулярная стабильность",
        description: "Проведение высотного наружного монтажа оборудования в любую непогоду.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Ремонт антенны на скользкой внешней мачте в бурю или переход по разрушенной лестнице шахты — для меня прогулка в парке."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_49_scent_of_the_dead",
    category: 'superpower',
    originTag: "NEW",
    name: "Феромонная маскировка от мутантов",
    nameEn: "Scent of the Dead",
    description: "Способность по желанию источать запах мёртвой неорганической материи или хитина, делающий человека невидимым для обоняния мутировавших хищников.",
    metadata: {
      code: "СП-49",
      passivePerk: "При вылазках на поверхность персонаж не подвергается нападениям бродячих тварей.",
      activeAbility: {
        name: "Феромонная маскировка от мутантов",
        description: "Безопасная экспедиция за пределы бункера за дефицитными медикаментами.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Хищники снаружи сочтут меня куском бетона. Я пройду мимо логова мутантов и принесу припасы с брошенного склада."
    } satisfies ISuperpowerMetadata
  },
  {
    cardId: "sp_50_barometric_skin",
    category: 'superpower',
    originTag: "NEW",
    name: "Биохимический термометр и барометр",
    nameEn: "Barometric Skin",
    description: "Кожные рецепторы фиксируют колебания атмосферного давления с точностью до десятых долей гектопаскаля и температуру с точностью до 0.1°C.",
    metadata: {
      code: "СП-50",
      passivePerk: "Раннее оповещение обо всех погодных катаклизмах поверхности (буря, кислотный ливень, токсичный штиль).",
      activeAbility: {
        name: "Биохимический термометр и барометр",
        description: "Мгновенное обнаружение микроутечки воздуха в любом отсеке бункера до срабатывания аварийных сирен.",
        apCost: 1,
        cooldownDays: 5
      },
      selectionArgument: "«Я предскажу радиоактивную грозу, буран или разгерметизацию наружного шлюза за два часа до того, как стрелка барометра дрогнет."
    } satisfies ISuperpowerMetadata
  }
];
