import { ICardDocument, IHobbyMetadata } from '../types/card.types.js';

export const hobbiesDeck: ICardDocument[] = [
  // --- BASE HOBBIES (1-20) ---
  {
    cardId: 'hobby_gardening',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Огородничество',
    nameEn: 'Gardening',
    description: 'Выращивание овощей, зелени и селекция рассады на участке и балконе.',
    metadata: {
      survivalEffect: '+20% к эффективности гидропонной фермы бункера; снижает риск гибели урожая на 50%.',
      selectionBonus: 'Гарантия свежих витаминов; +1 Соц при голосовании с агрономами и медиками.',
      synergies: {
        professions: ['prof_agronomist', 'prof_farmer', 'prof_cook'],
        items: ['item_hydroponic_module', 'item_seeds_pack', 'item_spectrum_lamp']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_hunting',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Охота',
    nameEn: 'Hunting',
    description: 'Навыки выслеживания дичи, установка капканов и безопасное обращение с оружием.',
    metadata: {
      survivalEffect: '+25% к шансу добычи мяса во время вылазок; снижение риска засад хищников.',
      selectionBonus: 'Аргумент безопасности и провианта; право проверить арсенал до финала голосования.',
      synergies: {
        professions: ['prof_military', 'prof_sniper'],
        items: ['item_knife_hunting', 'item_binoculars_tactical', 'item_trap_spring']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_ham_radio',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Радиолюбительство',
    nameEn: 'Ham Radio',
    description: 'Сборка приёмопередатчиков, работа с антеннами и знание азбуки Морзе.',
    metadata: {
      survivalEffect: 'Раз в 5 дней перехватывает сигнал других выживших (+1 случайный чертёж/ресурс).',
      selectionBonus: 'Обещание связи с внешним миром; нейтрализует страх изоляции в бункере.',
      synergies: {
        professions: ['prof_radio_operator', 'prof_electrician', 'prof_sysadmin'],
        items: ['item_radio_military', 'item_batteries', 'item_microchips']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_yoga',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Йога и дыхательные практики',
    nameEn: 'Yoga & Breathwork',
    description: 'Практика асан, контроль стресса через пранаяму и глубокая релаксация.',
    metadata: {
      survivalEffect: 'Тратит на 15% меньше кислорода; раз в 7 дней восстанавливает +2 Псих себе или соседу.',
      selectionBonus: 'Спокойствие в спорах; иммунитет к провокациям и обвинениям на 1 раунд.',
      synergies: {
        professions: ['prof_psychologist', 'prof_doctor'],
        items: ['item_tea_herbal', 'item_blanket_thermal']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_martial_arts',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Единоборства',
    nameEn: 'Martial Arts',
    description: 'Владение ударной или борцовской техникой (самбо, бокс, джиу-джитсу).',
    metadata: {
      survivalEffect: '+2 к самообороне без оружия; нейтрализация обезумевшего сожителя без летального исхода.',
      selectionBonus: 'Силовой аргумент защиты входа; устрашение агрессивных кандидатов.',
      synergies: {
        professions: ['prof_security', 'prof_military'],
        items: ['item_duct_tape', 'item_helmet_hard']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_knitting',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Вязание и шитьё',
    nameEn: 'Knitting & Tailoring',
    description: 'Ремонт одежды, раскройка ткани, вязание тёплых вещей из шерсти и синтетики.',
    metadata: {
      survivalEffect: 'Починка защитных костюмов и масок раз в 4 дня; защита от переохлаждения.',
      selectionBonus: 'Демонстрация сшитой вещи; успокаивающий эффект (+1 голос от пожилых).',
      synergies: {
        professions: ['prof_carpenter'],
        items: ['item_rags', 'item_duct_tape']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_fishing',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Рыбалка',
    nameEn: 'Fishing',
    description: 'Ловля рыбы на спиннинг, донные снасти и плетение сетей.',
    metadata: {
      survivalEffect: 'При наличии воды обеспечивает стабильный приток белка (+2 еды в день).',
      selectionBonus: 'Терпеливость и расчётливость; хладнокровие при монотонном труде.',
      synergies: {
        professions: ['prof_biologist', 'prof_cook'],
        items: ['item_rope_nylon', 'item_knife_hunting']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_singing',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Пение и вокал',
    nameEn: 'Singing & Vocal',
    description: 'Поставленный голос, знание песен и умение зажигать аудиторию.',
    metadata: {
      survivalEffect: 'Раз в 3 дня выступление снимает эффект клаустрофобии и поднимает мораль на +1.',
      selectionBonus: 'Харизматичный джингл о своей полезности, дающий дополнительное время на речь.',
      synergies: {
        professions: ['prof_actor', 'prof_teacher'],
        items: ['item_radio_military']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_first_aid',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Первая помощь',
    nameEn: 'First Aid Enthusiast',
    description: 'Курсы Красного Креста, остановка кровотечений и реанимация.',
    metadata: {
      survivalEffect: 'Стабилизирует критически раненого союзника до прибытия врача (предотвращает смерть).',
      selectionBonus: 'Спасательный круг: ценность удваивается, если нет профессионального медика.',
      synergies: {
        professions: ['prof_doctor', 'prof_paramedic'],
        items: ['item_medkit_car', 'item_antibiotics', 'item_duct_tape']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_pop_psychology',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Практическая психология',
    nameEn: 'Pop Psychology',
    description: 'Книги по когнитивной терапии, языку тела и распознаванию лжи.',
    metadata: {
      survivalEffect: 'Снижает частоту ссор и драк на 40%; купирует нервные срывы товарищей.',
      selectionBonus: 'Вскрывает противоречие в аргументах оппонента (переголосование одного игрока).',
      synergies: {
        professions: ['prof_psychologist', 'prof_diplomat', 'prof_detective'],
        items: ['item_military_manual']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_coding',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Программирование и скриптинг',
    nameEn: 'Coding & Scripting',
    description: 'Написание скриптов автоматизации на Python/Bash, понимание микроконтроллеров.',
    metadata: {
      survivalEffect: 'Автоматизирует генератор (экономия топлива +15%); взлом заблокированных секторов.',
      selectionBonus: 'Оптимизация систем жизнеобеспечения через компьютер бункера.',
      synergies: {
        professions: ['prof_hacker', 'prof_engineer', 'prof_sysadmin'],
        items: ['item_laptop_toughbook', 'item_usb_flash']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_climbing',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Скалолазание и альпинизм',
    nameEn: 'Rock Climbing',
    description: 'Работа со страховкой, преодоление вертикалей и феноменальный хват пальцев.',
    metadata: {
      survivalEffect: 'Незаменим при заклинивании шахт вентиляции и лифтов; +3 к высотным работам.',
      selectionBonus: 'Ловкость и отсутствие страха высоты и замкнутых пространств шахт.',
      synergies: {
        professions: ['prof_miner', 'prof_firefighter'],
        items: ['item_rope_nylon', 'item_axe_fire']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_bushcraft',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Выживание в дикой природе',
    nameEn: 'Bushcraft',
    description: 'Добыча огня трением, фильтрация воды подручными средствами, постройка укрытий.',
    metadata: {
      survivalEffect: 'При отказе фильтров изготавливает угольно-песчаные фильтры (+3 дня по воде).',
      selectionBonus: 'Идеальный спутник при разрушении бункера для исхода в пустоши.',
      synergies: {
        professions: ['prof_scout', 'prof_military', 'prof_prepper'],
        items: ['item_knife_hunting', 'item_lighter_piezo', 'item_filter_water']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_soapmaking',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Домашняя химия и мыловарение',
    nameEn: 'Amateur Chemistry & Soapmaking',
    description: 'Варка мыла с нуля, понимание pH-баланса и базовых химических реактивов.',
    metadata: {
      survivalEffect: 'Производство антисептиков и мыла из золы и жира; снижает риск кожных инфекций на 60%.',
      selectionBonus: 'Аргумент гигиены в закрытом пространстве, где инфекции смертельны.',
      synergies: {
        professions: ['prof_chemist', 'prof_pharmacist'],
        items: ['item_disinfectant_alcohol', 'item_rat_poison']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_cooking',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Кулинария и ферментация',
    nameEn: 'Cooking & Fermentation',
    description: 'Блюда из скудных пайков, квашение, ферментация сои и овощей.',
    metadata: {
      survivalEffect: 'Даёт +1 Псих всей группе за счёт вкусных блюд; исключает цингу ферментами.',
      selectionBonus: 'Еда в бункере не превратится в пресную кашу; подкуп гурманов описанием меню.',
      synergies: {
        professions: ['prof_cook'],
        items: ['item_sugar', 'item_yeast', 'item_can_meat']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_woodworking',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Плотницкое дело и резьба',
    nameEn: 'Woodworking',
    description: 'Работа с рубанком и стамесками, изготовление мебели и укрепление перекрытий.',
    metadata: {
      survivalEffect: 'Создание дополнительных нар, полок и распорок (+10% к вместимости склада).',
      selectionBonus: 'Обустройство быта и спальных мест с минимальными затратами материалов.',
      synergies: {
        professions: ['prof_carpenter', 'prof_engineer'],
        items: ['item_tools_kit', 'item_axe_fire']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_car_mechanics',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Автомеханика и тюнинг',
    nameEn: 'Car Mechanics',
    description: 'Переборка двигателей ДВС, диагностика карбюраторов и инжекторов.',
    metadata: {
      survivalEffect: '+30% к ресурсу дизель-генератора; запуск сломанного транспорта у входа.',
      selectionBonus: 'Техническое обслуживание главной силовой установки укрытия.',
      synergies: {
        professions: ['prof_mechanic', 'prof_driver'],
        items: ['item_tools_kit', 'item_generator_gasoline', 'item_canister_gasoline']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_board_games',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Настольные игры и головоломки',
    nameEn: 'Board Games & Puzzles',
    description: 'Знание сотен настолок, решение судоку, шахматных этюдов и головоломок.',
    metadata: {
      survivalEffect: 'Турниры в дни изоляции снимают по 1 стрессу у всех участников.',
      selectionBonus: 'Не даст сойти с ума от скуки за 30 дней темноты; разрядка обстановки.',
      synergies: {
        professions: ['prof_teacher', 'prof_actor'],
        items: ['item_notebook_pencil']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_guitar',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Игра на гитаре',
    nameEn: 'Guitar Playing',
    description: 'Исполнение походных и бардовских песен под шестиструнную акустику.',
    metadata: {
      survivalEffect: 'Вечерние акустические сессии снижают уровень паники на -2 при тревогах.',
      selectionBonus: 'Душа компании: +1 постоянный голос симпатии от одного игрока.',
      synergies: {
        professions: ['prof_actor', 'prof_journalist'],
        items: ['item_guitar_acoustic']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_photography',
    category: 'hobby',
    originTag: 'BASE',
    name: 'Фотография и оптика',
    nameEn: 'Photography & Darkroom',
    description: 'Знание экспозиции, оптических линз, микроскопии и юстировки приборов.',
    metadata: {
      survivalEffect: 'Обслуживание перископов и внешних камер; визуальная хроника выживания.',
      selectionBonus: 'Обещание сохранить лица и историю для нового мира.',
      synergies: {
        professions: ['prof_scout', 'prof_journalist'],
        items: ['item_binoculars_tactical', 'item_camera_analog']
      }
    } satisfies IHobbyMetadata
  },

  // --- NEW HOBBIES (21-44) ---
  {
    cardId: 'hobby_beekeeping',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Пчеловодство',
    nameEn: 'Beekeeping',
    description: 'Содержание пасеки, знание биологии пчёл и целебных свойств прополиса.',
    metadata: {
      survivalEffect: 'Запас прополиса как сильный антисептик (+1 к лечению ран); воск для гидроизоляции.',
      selectionBonus: 'Знание природных антибиотиков и консервантов; стрессоустойчивость к боли.',
      synergies: {
        professions: ['prof_agronomist', 'prof_veterinarian', 'prof_pharmacist'],
        items: ['item_honey_jar', 'item_candles_wax']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_moonshining',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Самогоноварение и дистилляция',
    nameEn: 'Distillation & Moonshining',
    description: 'Сборка перегонных аппаратов, знание фракций и брожения спиртов.',
    metadata: {
      survivalEffect: 'Производство чистого этанола (дезинфекция, розжиг, валюта бартера +2/нед).',
      selectionBonus: 'Снабжение медика спиртом, а охраны — стимулятором настроения.',
      synergies: {
        professions: ['prof_chemist', 'prof_cook'],
        items: ['item_sugar', 'item_yeast', 'item_vodka']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_lockpicking',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Слесарное дело и отмычки',
    nameEn: 'Lockpicking',
    description: 'Работа с отмычками, замками разных систем и сейфами без повреждения двери.',
    metadata: {
      survivalEffect: 'Вскрывает заклинившие аварийные гермолюки и запертые контейнеры без шума.',
      selectionBonus: 'Доступ к закрытым складским помещениям с медикаментами и спецоборудованием.',
      synergies: {
        professions: ['prof_pickpocket', 'prof_mechanic'],
        items: ['item_lockpicks', 'item_tools_kit']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_cartography',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Картография и ориентирование',
    nameEn: 'Cartography & Navigation',
    description: 'Чтение карт, использование компаса, ориентирование по звёздам и теням.',
    metadata: {
      survivalEffect: 'Увеличивает безопасность рейдов на 40%; группа не может заблудиться в буране.',
      selectionBonus: 'Составление точной карты окрестностей и безопасных маршрутов эвакуации.',
      synergies: {
        professions: ['prof_scout', 'prof_pilot'],
        items: ['item_compass_liquid', 'item_military_manual']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_metal_detecting',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Металлоискательство',
    nameEn: 'Metal Detecting',
    description: 'Поиск скрытых коммуникаций, подземных кабелей и металлических схронов.',
    metadata: {
      survivalEffect: 'В экспедициях находит цветные металлы, боеприпасы и тайники (+1 находка за рейд).',
      selectionBonus: 'Обнаружение скрытых мин и растяжек у входа в убежище.',
      synergies: {
        professions: ['prof_sapper', 'prof_geologist'],
        items: ['item_dosimeter', 'item_microchips']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_astronomy',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Астрономия и метеорология',
    nameEn: 'Astronomy & Weather Tracking',
    description: 'Наблюдение за светилами, расчёт траекторий и предсказание погоды по барометру.',
    metadata: {
      survivalEffect: 'Прогноз радиоактивных бурь за 24 часа (своевременная герметизация вентиляции).',
      selectionBonus: 'Знание сезонов погоды и безопасного времени выхода наружу.',
      synergies: {
        professions: ['prof_scientist', 'prof_nuclear_physicist'],
        items: ['item_binoculars_tactical']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_trap_shooting',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Стендовая стрельба',
    nameEn: 'Trap Shooting',
    description: 'Стрельба навскидку по движущимся мишеням из гладкоствольного ружья.',
    metadata: {
      survivalEffect: '+3 к попаданию по быстрым целям (дроны, заражённые птицы, мутанты).',
      selectionBonus: 'Превосходная реакция и доказанная меткость без армейской агрессии.',
      synergies: {
        professions: ['prof_sniper', 'prof_military'],
        items: ['item_knife_hunting']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_crossfit',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Кроссфит и тяжёлая атлетика',
    nameEn: 'Crossfit & Weightlifting',
    description: 'Комплексная тренировка выносливости, становой тяги и взрывной силы.',
    metadata: {
      survivalEffect: '+2 к командным физическим работам (разбор завалов, ручная помпа).',
      selectionBonus: 'Внушительный вид, выполнение двойной нормы тяжёлого физического труда.',
      synergies: {
        professions: ['prof_miner', 'prof_firefighter'],
        items: ['item_rope_nylon']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_stoicism',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Стоицизм и медитация',
    nameEn: 'Stoicism & Mindfulness',
    description: 'Труды Марка Аврелия, Сенеки и ежедневные практики принятия неизбежного.',
    metadata: {
      survivalEffect: 'Полный иммунитет к панике от потери запасов или внешних угроз; нет паранойи.',
      selectionBonus: 'Хладнокровие на фоне общей паники; отрезвляет эмоциональных спикеров.',
      synergies: {
        professions: ['prof_priest', 'prof_psychiatrist'],
        items: ['item_notebook_pencil']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_rc_modeling',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Моделизм и радиоэлектроника',
    nameEn: 'RC Modeling & Electronics',
    description: 'Сборка миниатюрных моделей, пайка микросхем, ремонт точной механики.',
    metadata: {
      survivalEffect: 'Чинит датчики утечки радиации и задымления из лома; +2 к точной электронике.',
      selectionBonus: 'Золотые руки: оживляет любую сломанную бытовую плату.',
      synergies: {
        professions: ['prof_programmer', 'prof_sysadmin'],
        items: ['item_microchips', 'item_batteries']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_canning',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Домашнее консервирование',
    nameEn: 'Home Canning & Curing',
    description: 'Автоклавирование тушёнки, сушка сухарей, засолка долгохранящихся продуктов.',
    metadata: {
      survivalEffect: 'Продлевает срок годности скоропортящихся припасов на 20 дней; 0% потерь от гнили.',
      selectionBonus: 'Сохранность каждого грамма продовольствия в бункере без холодильников.',
      synergies: {
        professions: ['prof_cook', 'prof_farmer'],
        items: ['item_can_meat', 'item_sugar']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_dog_training',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Кинология и дрессировка',
    nameEn: 'Dog Training',
    description: 'Этология псовых, дрессировка сторожевых собак на охрану и поиск по запаху.',
    metadata: {
      survivalEffect: 'Удваивает эффективность служебной собаки (охрана шлюза, утечки газа).',
      selectionBonus: 'Контроль любых животных группы и нейтрализация агрессии.',
      synergies: {
        professions: ['prof_veterinarian', 'prof_security'],
        items: ['item_rope_nylon']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_sleight_of_hand',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Фокусы и сценическая магия',
    nameEn: 'Sleight of Hand & Magic',
    description: 'Манипуляции с монетами, картами, отвлечение внимания и ловкость пальцев.',
    metadata: {
      survivalEffect: 'Раз в неделю перепрятывает предмет от обыска/кражи; снятие скуки у детей.',
      selectionBonus: 'Запутывает оппонентов во время дебатов, перенаправляя обвинения.',
      synergies: {
        professions: ['prof_pickpocket', 'prof_actor'],
        items: ['item_cards_playing']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_hema',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Историческая реконструкция и фехтование',
    nameEn: 'HEMA & Reenactment',
    description: 'Владение клинком, древковым оружием, изготовление кольчуг и заклёпок.',
    metadata: {
      survivalEffect: 'Делает из листового металла щитки и копья для бесшумного боя без патронов.',
      selectionBonus: 'Знание выживания без высоких технологий эпохи Средневековья.',
      synergies: {
        professions: ['prof_gunsmith', 'prof_carpenter'],
        items: ['item_axe_fire', 'item_knife_hunting']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_parkour',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Паркур и акробатика',
    nameEn: 'Parkour & Freerun',
    description: 'Преодоление препятствий, безопасные прыжки с высоты и группировка.',
    metadata: {
      survivalEffect: 'Нет урона от падений при обрушении лестниц; доступ в труднодоступные ниши.',
      selectionBonus: 'Идеальный курьер-разведчик для экстренных вылазок наружу.',
      synergies: {
        professions: ['prof_firefighter', 'prof_scout'],
        items: ['item_rope_nylon']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_speed_reading',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Скорочтение и мнемотехника',
    nameEn: 'Speed Reading & Mnemonics',
    description: 'Запоминание массивов цифр, схем и быстрое усвоение техдокументации.',
    metadata: {
      survivalEffect: 'Мгновенно изучает любой найденный чертёж без штрафа необученности.',
      selectionBonus: 'Помнит все открытые карточки и ловит соперников на противоречиях.',
      synergies: {
        professions: ['prof_scientist', 'prof_teacher'],
        items: ['item_notebook_pencil', 'item_military_manual']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_chess',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Шахматы и тактический анализ',
    nameEn: 'Chess & Strategy',
    description: 'Позиционная игра, расчёт ходов на 6–8 шагов вперёд и оценка рисков.',
    metadata: {
      survivalEffect: 'Раз в 10 дней переигрывает одно неудачное кризисное решение совета бункера.',
      selectionBonus: 'Аналитическое хладнокровие; выстраивает коалиции голосования за 2 хода вперёд.',
      synergies: {
        professions: ['prof_diplomat', 'prof_politician'],
        items: ['item_notebook_pencil']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_massage',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Массаж и мануальная терапия',
    nameEn: 'Massage & Bodywork',
    description: 'Снятие мышечных зажимов, триггерных точек и расслабление шеи и спины.',
    metadata: {
      survivalEffect: 'Снимает эффект Усталости с рабочих (+1 рабочее действие в день отдохнувшему).',
      selectionBonus: 'Поддержание работоспособности и здоровой спины всей команды в тесноте.',
      synergies: {
        professions: ['prof_doctor', 'prof_paramedic'],
        items: ['item_disinfectant_alcohol']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_street_art',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Граффити и настенная живопись',
    nameEn: 'Street Art & Sign Painting',
    description: 'Быстрое нанесение трафаретов, ярких ориентиров и пиктограмм аэрозолем.',
    metadata: {
      survivalEffect: 'Маркирует безопасные и заражённые сектора, снижая панику и дезориентацию на 50%.',
      selectionBonus: 'Визуальное оформление серых стен бункера для здоровой атмосферы.',
      synergies: {
        professions: ['prof_actor', 'prof_journalist'],
        items: ['item_duct_tape']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_drone_building',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Сборка дронов и робототехника',
    nameEn: 'Drone Building & FPV',
    description: 'Сборка квадрокоптеров, управление через FPV-очки и пайка контроллеров.',
    metadata: {
      survivalEffect: 'Запуск дрона-разведчика на поверхность без открытия гермодверей (100% безопасно).',
      selectionBonus: 'Дистанционный осмотр периметра без риска для жизни людей.',
      synergies: {
        professions: ['prof_hacker', 'prof_engineer'],
        items: ['item_laptop_toughbook', 'item_microchips', 'item_batteries']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_herbalism',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Травничество и сбор грибов',
    nameEn: 'Herbalism & Mycology',
    description: 'Распознавание целебных растений, сушка трав, знание свойств грибов.',
    metadata: {
      survivalEffect: 'Заменяет медикаменты травяными сборами при простуде; проверка грибов на яды.',
      selectionBonus: 'Поиск пищи и лекарств под ногами при первых вылазках на поверхность.',
      synergies: {
        professions: ['prof_pharmacist', 'prof_biologist'],
        items: ['item_tea_herbal']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_sign_language',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Чтение по губам и язык жестов',
    nameEn: 'Lip Reading & Sign Language',
    description: 'Понимание речи в шуме или через бронестекло, общение жестами РЖЯ.',
    metadata: {
      survivalEffect: 'Бесшумная координация действий группы при проникновении чужаков.',
      selectionBonus: 'Тайный обмен информацией прямо во время открытых споров у входа.',
      synergies: {
        professions: ['prof_interpreter', 'prof_spy'],
        items: ['item_notebook_pencil']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_caving',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Спелеология и подземные исследования',
    nameEn: 'Caving & Spelunking',
    description: 'Передвижение по узким карстовым пещерам, сифонам и оценка сводов.',
    metadata: {
      survivalEffect: 'Предотвращает гибель при обвалах; находит водоносный горизонт или аварийный выход.',
      selectionBonus: 'Полная психологическая адаптация на глубине 50 метров под землёй.',
      synergies: {
        professions: ['prof_geologist', 'prof_miner'],
        items: ['item_flashlight_tactical', 'item_rope_nylon', 'item_helmet_hard']
      }
    } satisfies IHobbyMetadata
  },
  {
    cardId: 'hobby_djing',
    category: 'hobby',
    originTag: 'NEW',
    name: 'Диджеинг и саунд-дизайн',
    nameEn: 'DJing & Acoustic Tuning',
    description: 'Работа со звуковыми частотами, экранирование помех и шумов генератора.',
    metadata: {
      survivalEffect: 'Настройка акустических фильтров бункера для обнаружения шагов чужаков.',
      selectionBonus: 'Создание идеального звукового фона (белый шум для сна без кошмаров).',
      synergies: {
        professions: ['prof_radio_operator'],
        items: ['item_radio_military']
      }
    } satisfies IHobbyMetadata
  }
];
