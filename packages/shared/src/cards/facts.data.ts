import { ICardDocument, IFactMetadata } from '../types/card.types.js';

export const factsDeck: ICardDocument[] = [
  {
    cardId: "fact_01_v_detstve_ya_perebolel_tyazhyo",
    category: 'fact',
    originTag: "BASE",
    name: "В детстве я переболел тяжёлой оспой и имею пожизненный иммунитет",
    nameEn: "Fact #1 [Mechanic]",
    description: "«Я переболел натуральной оспой в изолированном поселении и обладаю редчайшими антителами.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Полный иммунитет к вирусным инфекциям эпидемического типа. Персонаж может сдать кровь для синтеза сыворотки (+1 доза универсальной вакцины для бункера)."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_02_ya_sluzhil_v_rote_radiatsionno",
    category: 'fact',
    originTag: "BASE",
    name: "Я служил в роте радиационной, химической и биологической защиты (РХБЗ)",
    nameEn: "Fact #2 [Mechanic]",
    description: "«Я два года чистил фильтрационные установки войсковых бункеров и умею менять ступени очистки с закрытыми глазами.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "+3 к проверкам ремонта системы фильтрации воздуха (ФВУ) бункера. Защитные костюмы на этом персонаже изнашиваются в 2 раза медленнее."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_03_ya_taynyy_agent_sluzhby_bezopa",
    category: 'fact',
    originTag: "BASE",
    name: "Я тайный агент службы безопасности объекта",
    nameEn: "Fact #3 [Mechanic]",
    description: "«У меня есть персональный аварийный код доступа к гермозатвору сектора Б.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Один раз за Фазу Отбора может отменить результат голосования против себя, предъявив код допуска высшего приоритета. В Фазе Выживания открывает запертый спецотсек с оружием."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_04_ya_stradayu_lunatizmom_v_faze_",
    category: 'fact',
    originTag: "BASE",
    name: "Я страдаю лунатизмом в фазе глубокого стресса",
    nameEn: "Fact #4 [Mechanic]",
    description: "«Во сне я встаю, хожу по комнатам и перекладываю вещи с места на место.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Каждые 6 ночей выживания ведущий бросает d6. При выпадении 1 персонаж случайно прячет один общий предмет из склада в вентиляционную шахту (требуется поиск)."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_05_u_menya_fotograficheskaya_pamy",
    category: 'fact',
    originTag: "BASE",
    name: "У меня фотографическая память на технические чертежи",
    nameEn: "Fact #5 [Mechanic]",
    description: "«Я наизусть помню схему проводки и водяных магистралей типовых убежищ серии А-60.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Любая поломка инженерных коммуникаций диагностируется мгновенно без траты очков действия (ОД) на разведку неисправности."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_06_ya_geneticheskiy_donor_s_redko",
    category: 'fact',
    originTag: "BASE",
    name: "Я генетический донор с редкой IV (Rh−) группой крови",
    nameEn: "Fact #6 [Mechanic]",
    description: "«Моя плазма подходит для экстренной стабилизации больных с тяжелейшим шоком.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Раз в 10 дней персонаж может провести прямое переливание крови тяжелораненому сожителю, вернув его из критического состояния (сам теряет 1 Физ на 2 дня)."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_07_ya_professionalnyy_shuler_i_ma",
    category: 'fact',
    originTag: "BASE",
    name: "Я профессиональный шулер и мастер покера",
    nameEn: "Fact #7 [Mechanic]",
    description: "«Я зарабатывал на жизнь подпольным покером и вижу блеф за версту.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "В Фазе Отбора может заставить одного игрока вскрыть одну скрытую карту здоровья или профессии. В Выживании выигрывает ресурсы в настольных спорах."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_08_ya_perezhil_aviakatastrofu_i_4",
    category: 'fact',
    originTag: "BASE",
    name: "Я пережил авиакатастрофу и 40 дней жил на леднике",
    nameEn: "Fact #8 [Mechanic]",
    description: "«Я знаю истинную цену голоду, морозу и тому, как делить одну галету на троих.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Персонаж не получает дебаффов к настроению при урезании пайков на 50%. Даёт +1 к стойкости всей группы при отказе системы обогрева."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_09_u_menya_zolotaya_karta_pochyot",
    category: 'fact',
    originTag: "BASE",
    name: "У меня золотая карта почётного инвестора бункера",
    nameEn: "Fact #9 [Mechanic]",
    description: "«Моя семья профинансировала постройку этого убежища, моё имя выбито на закладной плите.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "В Фазе Отбора персонаж имеет 2 голоса вместо 1 на каждом финальном раунде исключения. Не может быть исключён в самом первом раунде голосования."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_10_ya_stradayu_nepreodolimoy_klep",
    category: 'fact',
    originTag: "BASE",
    name: "Я страдаю непреодолимой клептоманией",
    nameEn: "Fact #10 [Mechanic]",
    description: "«Мои руки берут блестящие и полезные вещи раньше, чем я успеваю об этом подумать.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "В начале каждого третьего дня персонаж случайно присваивает 1 предмет из инвентаря соседа в свой личный карман. Если пойман с поличным — теряет 2 Соц."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_11_ya_master_sporta_po_pauerlifti",
    category: 'fact',
    originTag: "BASE",
    name: "Я мастер спорта по пауэрлифтингу",
    nameEn: "Fact #11 [Mechanic]",
    description: "«Я жму 220 кг от груди и поднимаю застрявшие бронедвери голыми руками.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Даёт всей группе бонус +3 при разборе завалов и ручном закрытии аварийных ворот без гидравлики. Потребляет на 25% больше калорий в день."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_12_ya_sidel_8_let_za_kontrabandu_",
    category: 'fact',
    originTag: "BASE",
    name: "Я сидел 8 лет за контрабанду и знаю тюремные коды",
    nameEn: "Fact #12 [Mechanic]",
    description: "«Я умею выстукивать сообщения через трубы отопления и выживать в карцере метр на метр.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Персонаж полностью защищён от штрафов клаустрофобии и одиночного заключения. Может тайно координироваться с другим игроком через стук (минуя ведущего)."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_13_ya_stradayu_tyazheleyshey_inso",
    category: 'fact',
    originTag: "BASE",
    name: "Я страдаю тяжелейшей инсомнией",
    nameEn: "Fact #13 [Mechanic]",
    description: "«Я сплю не больше 2 часов в сутки уже последние пять лет.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Персонаж автоматически несёт ночное дежурство без штрафа за усталость. Внезапные ночные проникновения или аварии бункера обнаруживаются мгновенно."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_14_u_menya_allergiya_na_penitsill",
    category: 'fact',
    originTag: "BASE",
    name: "У меня аллергия на пенициллиновый ряд",
    nameEn: "Fact #14 [Mechanic]",
    description: "«Один укол пенициллина — и у меня мгновенный анафилактический шок с отёком Квинке.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Если бункер использует стандартные армейские аптечки для лечения этого персонажа, он получает критический урон вместо исцеления. Нужны спецмедикаменты."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_15_ya_potomstvennyy_okhotnik_prom",
    category: 'fact',
    originTag: "BASE",
    name: "Я потомственный охотник-промысловик с Таймыра",
    nameEn: "Fact #15 [Mechanic]",
    description: "«Я умею выделывать шкуры, ставить петли на мелкую дичь и читать следы на камнях.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "При вылазках наружу удваивает сбор мясных пайков и шкур для утепления жилых отсеков бункера."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_16_ya_tayno_pronyos_v_karmane_pac",
    category: 'fact',
    originTag: "NEW",
    name: "Я тайно пронёс в кармане пачку семян редких овощных культур",
    nameEn: "Fact #16 [Mechanic]",
    description: "«В подкладке моего пальто зашиты семена гибридных томатов, устойчивых к радиации.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Добавляет +25% к пищевой безопасности бункера при запуске гидропоники. Начинает Фазу Выживания со скрытым предметом «Банка сортовых семян»."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_17_ya_proshyol_kursy_ekstremalnog",
    category: 'fact',
    originTag: "NEW",
    name: "Я прошёл курсы экстремального вождения бронетехники",
    nameEn: "Fact #17 [Mechanic]",
    description: "«Я управлял гусеничными вездеходами, БТР и тяжёлыми карьерными самосвалами.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Единственный персонаж, способный эвакуировать группу на броневике из гаража бункера при прорыве внешнего периметра."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_18_ya_skryvayu_shtamm_latentnogo_",
    category: 'fact',
    originTag: "NEW",
    name: "Я скрываю штамм латентного нейровируса",
    nameEn: "Fact #18 [Mechanic]",
    description: "«Я был в контакте с нулевым пациентом в биолаборатории Уханя, вирус спит в моём спинном мозге.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "При падении HP персонажа до 0 вирус активируется и заражает жилой отсек бункера, если тело не будет немедленно сожжено в крематории."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_19_u_menya_stoit_voennyy_bioniche",
    category: 'fact',
    originTag: "NEW",
    name: "У меня стоит военный бионический кардиостимулятор",
    nameEn: "Fact #19 [Mechanic]",
    description: "«Моё сердце работает от титанового насоса с защитой от внешнего давления.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Иммунитет к инфарктам и сердечной аритмии. Но персонаж мгновенно погибает или теряет сознание при воздействии ЭМИ-гранаты или ударе молнии в антенну."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_20_ya_umeyu_chitat_po_gubam_na_tr",
    category: 'fact',
    originTag: "NEW",
    name: "Я умею читать по губам на трёх языках",
    nameEn: "Fact #20 [Mechanic]",
    description: "«Я с 12 лет читаю речь людей через стекло, на расстоянии и без единого звука.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "В Фазе Отбора персонаж узнаёт, за кого тайно договариваются голосовать двое соседних игроков. В Выживании расшифровывает переговоры врагов через визоры."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_21_ya_chempion_po_skorostnoy_razb",
    category: 'fact',
    originTag: "NEW",
    name: "Я чемпион по скоростной разборке и чистке оружия",
    nameEn: "Fact #21 [Mechanic]",
    description: "«Я перебираю автомат Калашникова за 11 секунд с завязанными глазами.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Оружие в руках персонажа и его напарника по сектору обороны никогда не клинит при критических бросках (1 на d20 перебрасывается)."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_22_ya_znayu_azbuku_morze_i_shifro",
    category: 'fact',
    originTag: "NEW",
    name: "Я знаю азбуку Морзе и шифровальные таблицы Вернама",
    nameEn: "Fact #22 [Mechanic]",
    description: "«Я служил шифровальщиком узла связи флота и храню блокнот одноразовых блокнотов.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Сигналы SOS, отправляемые из бункера, не могут быть запеленгованы рейдерами. Группа может связаться с правительственными войсками."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_23_u_menya_silnaya_nikotinovaya_l",
    category: 'fact',
    originTag: "NEW",
    name: "У меня сильная никотиновая ломка без сигарет",
    nameEn: "Fact #23 [Mechanic]",
    description: "«Я выкуривал по две пачки крепких в день на протяжении 20 лет.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Первые 7 дней в бункере без сигарет персонаж получает −2 к терпению и дипломатии, устраивает скандалы при любом спорном голосовании."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_24_ya_masterski_izgotavlivayu_dom",
    category: 'fact',
    originTag: "NEW",
    name: "Я мастерски изготавливаю домашний алкоголь из всего, что бродит",
    nameEn: "Fact #24 [Mechanic]",
    description: "«Дайте мне сахарную свёклу, опилки и ведро — и через три дня у вас будет медицинский спирт.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Каждые 5 дней производит 1 единицу медицинского антисептика или алкоголя для бартера без затрат стандартных медикаментов."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_25_ya_stradal_luchevoy_boleznyu_i",
    category: 'fact',
    originTag: "NEW",
    name: "Я страдал лучевой болезнью и знаю её симптоматику досконально",
    nameEn: "Fact #25 [Mechanic]",
    description: "«Я работал ликвидатором на могильнике радиоактивных отходов и чувствую изотопы по вкусу железа во рту.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Безошибочно определяет уровень радиационного заражения предметов и пищи без дозиметра; спасает сожителей от случайного употребления фонящей воды."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_26_ya_master_sporta_po_strelbe_iz",
    category: 'fact',
    originTag: "NEW",
    name: "Я мастер спорта по стрельбе из лука и арбалета",
    nameEn: "Fact #26 [Mechanic]",
    description: "«Я попадаю в спичечный коробок с сорока шагов без шума пороховых газов.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Бесшумно ликвидирует внешних часовых противника при вылазках. Изготавливает арбалеты из рессор и тросов при исчерпании патронов."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_27_ya_diplomirovannyy_peregovorsh",
    category: 'fact',
    originTag: "NEW",
    name: "Я дипломированный переговорщик по освобождению заложников",
    nameEn: "Fact #27 [Mechanic]",
    description: "«Я провёл 50 успешных переговоров с вооружёнными террористами без штурма.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Один раз за игру может мирно разрешить вооружённый конфликт или бунт внутри убежища без кровопролития и потерь жизней."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_28_ya_panicheski_boyus_krys_i_gry",
    category: 'fact',
    originTag: "NEW",
    name: "Я панически боюсь крыс и грызунов (мусофобия)",
    nameEn: "Fact #28 [Mechanic]",
    description: "«При виде крысы я впадаю в оцепенение и начинаю кричать ультразвуком.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Если склад бункера атакуют крысы или подземные грызуны, персонаж не может участвовать в защите и теряет 2 Псих на 24 часа."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_29_ya_professionalnyy_zakroyshchi",
    category: 'fact',
    originTag: "NEW",
    name: "Я профессиональный закройщик и скорняк",
    nameEn: "Fact #29 [Mechanic]",
    description: "«Я из старого брезента и армированного скотча сошью герметичный защитный костюм.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "При нехватке химкостюмов изготавливает кустарные аналоги из полиэтилена и фильтров для безопасного выхода наружу двух человек."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_30_ya_donor_stvolovykh_kletok_i_k",
    category: 'fact',
    originTag: "NEW",
    name: "Я донор стволовых клеток и костного мозга",
    nameEn: "Fact #30 [Mechanic]",
    description: "«Мой костный мозг уже спас жизнь двоим детям с лейкемией.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "В Фазе Отбора даёт огромный моральный аргумент (+2 Соц при дебатах с врачами). В Выживании повышает регенерацию при тяжёлых облучениях."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_31_u_menya_absolyutnyy_muzykalnyy",
    category: 'fact',
    originTag: "NEW",
    name: "У меня абсолютный музыкальный слух",
    nameEn: "Fact #31 [Mechanic]",
    description: "«Я по звуку вибрации стен определяю, в какой трубе упало давление или треснул шов.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Предупреждает группу о надвигающейся аварии водопровода или сейсмическом сдвиге за 12 часов до катастрофы."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_32_ya_vyros_v_detskom_dome_i_niko",
    category: 'fact',
    originTag: "NEW",
    name: "Я вырос в детском доме и никому не доверяю свои вещи",
    nameEn: "Fact #32 [Mechanic]",
    description: "«Мой тайник в полу никто не найдёт, даже если разберёт бункер по кирпичу.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Личные предметы этого персонажа невозможно украсть никакими способностями воров или клептоманов."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_33_ya_rabotal_na_myasokombinate_i",
    category: 'fact',
    originTag: "NEW",
    name: "Я работал на мясокомбинате и хладнокровно разделываю туши",
    nameEn: "Fact #33 [Mechanic]",
    description: "«Кровь, требуха и вскрытие туш для меня — просто ежедневная рутинная работа.",
    metadata: {
      subcategory: "MECHANIC",
      specialRule: "Персонаж не теряет рассудок и Псих при виде расчленённых тел или необходимости проводить полевые ампутации конечностей товарищей."
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_34_ya_kollektsioniruyu_rezinovykh",
    category: 'fact',
    originTag: "BASE",
    name: "Я коллекционирую резиновых уточек для ванной",
    nameEn: "Fact #34 [Flavor]",
    description: "«У меня дома осталось 340 уникальных жёлтых уточек со всего мира, и я взял с собой любимую в скафандре.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_35_ya_pishu_fantasticheskiy_roman",
    category: 'fact',
    originTag: "BASE",
    name: "Я пишу фантастический роман о жизни после конца света",
    nameEn: "Fact #35 [Flavor]",
    description: "«Я уже десять лет пишу постапокалиптическую антиутопию и теперь чувствую себя героем собственной книги.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_36_ya_veryu_v_teoriyu_poloy_zemli",
    category: 'fact',
    originTag: "BASE",
    name: "Я верю в теорию полой Земли и рептилоидов",
    nameEn: "Fact #36 [Flavor]",
    description: "«Катастрофа наверху — это просто зачистка перед выходом коренных жителей недр на поверхность.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_37_ya_nikogda_v_zhizni_ne_probova",
    category: 'fact',
    originTag: "BASE",
    name: "Я никогда в жизни не пробовал натуральный кофе",
    nameEn: "Fact #37 [Flavor]",
    description: "«Я вырос в семье радикальных трезвенников и пил только цикорий и отвар шиповника.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_38_u_menya_na_poyasnitse_vytatuir",
    category: 'fact',
    originTag: "BASE",
    name: "У меня на пояснице вытатуирована надпись «Не влезай — убьёт!»",
    nameEn: "Fact #38 [Flavor]",
    description: "«Сделал эту татуировку по пьяни после защиты диплома инженера-высоковольтника.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_39_ya_vegetarianets_s_pyatnadtsat",
    category: 'fact',
    originTag: "BASE",
    name: "Я вегетарианец с пятнадцатилетним стажем",
    nameEn: "Fact #39 [Flavor]",
    description: "«Я не ем ничего, у чего когда-то были глаза или билось сердце.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_40_ya_znayu_naizust_vse_dialogi_i",
    category: 'fact',
    originTag: "BASE",
    name: "Я знаю наизусть все диалоги из сериала «Друзья»",
    nameEn: "Fact #40 [Flavor]",
    description: "«Я могу воспроизвести любую сцену из любого сезона на память по ролям.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_41_ya_panicheski_boyus_klounov",
    category: 'fact',
    originTag: "BASE",
    name: "Я панически боюсь клоунов",
    nameEn: "Fact #41 [Flavor]",
    description: "«Даже безобидный красный поролоновый нос вызывает у меня холодный пот и дрожь в коленях.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_42_ya_byl_finalistom_gorodskogo_s",
    category: 'fact',
    originTag: "BASE",
    name: "Я был финалистом городского шоу талантов по художественному свисту",
    nameEn: "Fact #42 [Flavor]",
    description: "«Я могу виртуозно насвистеть 'Полёт шмеля' и 'Времена года' Вивальди.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_43_ya_veryu_v_goroskopy_i_sovmest",
    category: 'fact',
    originTag: "BASE",
    name: "Я верю в гороскопы и совместимость по знакам зодиака",
    nameEn: "Fact #43 [Flavor]",
    description: "«Прежде чем доверить человеку ключ от шлюза, я должен узнать дату и точное время его рождения.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_44_ya_trizhdy_byl_zhenat_i_so_vse",
    category: 'fact',
    originTag: "BASE",
    name: "Я трижды был женат и со всеми бывшими остался в тёплых отношениях",
    nameEn: "Fact #44 [Flavor]",
    description: "«Я умею гасить семейные скандалы и находить компромиссы там, где летают тарелки.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_45_ya_spas_bezdomnogo_kota_iz_gor",
    category: 'fact',
    originTag: "BASE",
    name: "Я спас бездомного кота из горящего гаража",
    nameEn: "Fact #45 [Flavor]",
    description: "«У меня на плече остался шрам от его когтей, но Барсик прожил у меня счастливые двенадцать лет.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_46_ya_vedu_lichnyy_dnevnik_s_dven",
    category: 'fact',
    originTag: "BASE",
    name: "Я веду личный дневник с двенадцати лет без единого пропуска",
    nameEn: "Fact #46 [Flavor]",
    description: "«Каждый день моей жизни задокументирован в кожаных блокнотах мелким почерком.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_47_ya_bezumno_lyublyu_shanson_i_p",
    category: 'fact',
    originTag: "BASE",
    name: "Я безумно люблю шансон и песни Михаила Круга",
    nameEn: "Fact #47 [Flavor]",
    description: "«Владимирский централ — это гимн искренней человеческой души, а не просто песня.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_48_ya_nikogda_ne_vybrasyvayu_poli",
    category: 'fact',
    originTag: "BASE",
    name: "Я никогда не выбрасываю полиэтиленовые пакеты, а стираю и сушу их",
    nameEn: "Fact #48 [Flavor]",
    description: "«У меня дома был пакет с пакетами размером с кресло-мешок.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_49_ya_iskrenne_schitayu_chto_pits",
    category: 'fact',
    originTag: "NEW",
    name: "Я искренне считаю, что пицца с ананасами — вершина гастрономии",
    nameEn: "Fact #49 [Flavor]",
    description: "«Сочетание сладкого ананаса, солёного сыра и томатного соуса — шедевр, спорить с этим глупо.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_50_ya_byl_volontyorom_na_raskopka",
    category: 'fact',
    originTag: "NEW",
    name: "Я был волонтёром на раскопках стоянки каменного века на Алтае",
    nameEn: "Fact #50 [Flavor]",
    description: "«Я два месяца мыл кости мамонта зубной щёткой в ледяной горной воде.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_51_ya_umeyu_shevelit_ushami_po_ot",
    category: 'fact',
    originTag: "NEW",
    name: "Я умею шевелить ушами по отдельности",
    nameEn: "Fact #51 [Flavor]",
    description: "«Я научился этому в школе, чтобы смешить одноклассников на контрольных по физике.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_52_u_menya_allergiya_tolko_na_she",
    category: 'fact',
    originTag: "NEW",
    name: "У меня аллергия только на шерсть сиамских кошек",
    nameEn: "Fact #52 [Flavor]",
    description: "«Обычные дворовые коты — отлично, но сиамские вызывают у меня моментальный чих.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_53_ya_pereplyl_bosfor_v_sostave_l",
    category: 'fact',
    originTag: "NEW",
    name: "Я переплыл Босфор в составе любительского заплыва",
    nameEn: "Fact #53 [Flavor]",
    description: "«Шесть с половиной километров открытой воды из Азии в Европу на чистой силе воли.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_54_ya_veryu_chto_komnatnye_rasten",
    category: 'fact',
    originTag: "NEW",
    name: "Я верю, что комнатные растения чувствуют боль и эмоции",
    nameEn: "Fact #54 [Flavor]",
    description: "«Я всегда здороваюсь со своими фикусами и включаю им классическую музыку Баха.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_55_ya_sluchayno_snyalsya_v_massov",
    category: 'fact',
    originTag: "NEW",
    name: "Я случайно снялся в массовке известного блокбастера в роли зомби",
    nameEn: "Fact #55 [Flavor]",
    description: "«Меня гримировали шесть часов, а в фильме я мелькнул на 1,5 секунды на заднем плане.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_56_ya_zasypayu_tolko_pod_zvuk_rab",
    category: 'fact',
    originTag: "NEW",
    name: "Я засыпаю только под звук работающего пылесоса или фена",
    nameEn: "Fact #56 [Flavor]",
    description: "«Белый шум вентилятора или мотора — моя единственная колыбельная с детства.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_57_ya_professionalno_razbirayus_v",
    category: 'fact',
    originTag: "NEW",
    name: "Я профессионально разбираюсь в сортах элитного сыра",
    nameEn: "Fact #57 [Flavor]",
    description: "«Я отличаю пармиджано реджано 24-месячной выдержки от грана падано по запаху корочки.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_58_ya_do_paniki_boyus_temnoty_i_s",
    category: 'fact',
    originTag: "NEW",
    name: "Я до паники боюсь темноты и сплю с ночником",
    nameEn: "Fact #58 [Flavor]",
    description: "«В детстве меня случайно заперли в тёмном погребе на даче на целую ночь.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_59_ya_umeyu_sobirat_kubik_rubika_",
    category: 'fact',
    originTag: "NEW",
    name: "Я умею собирать кубик Рубика за 30 секунд одной рукой",
    nameEn: "Fact #59 [Flavor]",
    description: "«Спидкубинг развил во мне невероятную моторику пальцев и пространственное воображение.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_60_ya_derzhal_doma_ruchnogo_khork",
    category: 'fact',
    originTag: "NEW",
    name: "Я держал дома ручного хорька по кличке Чудо",
    nameEn: "Fact #60 [Flavor]",
    description: "«Этот пушистый бандит прятал мои носки под диваном и спал в капюшоне толстовки.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_61_ya_nikogda_ne_smotrel_ni_odnoy",
    category: 'fact',
    originTag: "NEW",
    name: "Я никогда не смотрел ни одной серии «Игры престолов»",
    nameEn: "Fact #61 [Flavor]",
    description: "«Я принципиально избегал этого хайпа восемь лет, пока весь офис обсуждал драконов.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_62_ya_boyus_letat_na_samolyotakh_",
    category: 'fact',
    originTag: "NEW",
    name: "Я боюсь летать на самолётах и путешествовал только поездами",
    nameEn: "Fact #62 [Flavor]",
    description: "«Романтика стука колёс, подстаканников и бесконечных сосновых лесов за окном — моё всё.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_63_ya_vyigral_shkolnuyu_olimpiadu",
    category: 'fact',
    originTag: "NEW",
    name: "Я выиграл школьную олимпиаду по латыни двадцать лет назад",
    nameEn: "Fact #63 [Flavor]",
    description: "«Memento mori, alea iacta est и ещё сотня крылатых выражений застряли в моей голове навсегда.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_64_ya_s_zakrytymi_glazami_otlichu",
    category: 'fact',
    originTag: "NEW",
    name: "Я с закрытыми глазами отличу пепси-колу от кока-колы",
    nameEn: "Fact #64 [Flavor]",
    description: "«В пепси больше цитрусовых нот, а кола мягче газирована — я выиграл на этом сотню споров.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_65_ya_veryu_chto_moya_intuitsiya_",
    category: 'fact',
    originTag: "NEW",
    name: "Я верю, что моя интуиция спасла мне жизнь уже трижды",
    nameEn: "Fact #65 [Flavor]",
    description: "«Я просто почувствовал, что не надо садиться на тот рейс и переходить ту улицу.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  },
  {
    cardId: "fact_66_ya_umeyu_zavyazyvat_khvostik_v",
    category: 'fact',
    originTag: "NEW",
    name: "Я умею завязывать хвостик вишни языком во рту",
    nameEn: "Fact #66 [Flavor]",
    description: "«Бесполезный барный трюк, которому я научился в студенческие годы от скуки.",
    metadata: {
      subcategory: "FLAVOR",
      specialRule: ""
    } satisfies IFactMetadata
  }
];
