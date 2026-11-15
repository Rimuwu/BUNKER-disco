import { ICraftRecipe } from '../types/craft.types.js';

export const craftRecipes: ICraftRecipe[] = [
  {
    id: "craft_adv_medkit",
    ingredient1Id: "item_medkit_car",
    ingredient2Id: "item_antibiotics",
    resultName: "Расширенная медсумка",
    resultNameEn: "Advanced Hospital Medkit",
    icon: "🏥",
    mechanicalEffect: "Полноценный госпитальный набор: лечит ранения любой тяжести, снимает заражение и инфекции (8 применений, +2 к Лечению)."
  },
  {
    id: "craft_upgr_radio",
    ingredient1Id: "item_radio_military",
    ingredient2Id: "item_batteries",
    resultName: "Улучшенная рация",
    resultNameEn: "Upgraded Long-Range Radio",
    icon: "📡",
    mechanicalEffect: "Дальность передачи возрастает до 50 км; добавляется функция автоматического сканирования и дешифровки переговоров."
  },
  {
    id: "craft_spotlight",
    ingredient1Id: "item_flashlight_tactical",
    ingredient2Id: "item_batteries",
    resultName: "Усиленный прожектор",
    resultNameEn: "Heavy Spotlight",
    icon: "🔦",
    mechanicalEffect: "Мощный луч на 300 метров: работает непрерывно 20 дней; ослепляет врагов в темноте на 1 ход."
  },
  {
    id: "craft_analyt_center",
    ingredient1Id: "item_laptop_toughbook",
    ingredient2Id: "item_usb_flash",
    resultName: "Аналитический центр",
    resultNameEn: "Strategic Analytics Center",
    icon: "💻",
    mechanicalEffect: "Открывает доступ к засекреченным базам данных: даёт +2 ко всем стратегическим и оборонительным решениям группы на 10 дней."
  },
  {
    id: "craft_micro_power",
    ingredient1Id: "item_solar_panel",
    ingredient2Id: "item_microchips",
    resultName: "Микро-электростанция",
    resultNameEn: "Micro Power Station",
    icon: "⚡",
    mechanicalEffect: "Создаёт постоянную бесперебойную автономную линию питания для одного жилого или технического отсека без топлива."
  },
  {
    id: "craft_hybrid_power",
    ingredient1Id: "item_generator_gasoline",
    ingredient2Id: "item_solar_panel",
    resultName: "Гибридная энергосистема",
    resultNameEn: "Hybrid Power System",
    icon: "🔋",
    mechanicalEffect: "Интеллектуальный блок управления: сокращает расход бензина генератором в 2 раза (0.5 л/сутки) за счёт подзарядки от солнца."
  },
  {
    id: "craft_tourniquet",
    ingredient1Id: "item_duct_tape",
    ingredient2Id: "item_rags",
    resultName: "Перевязочный жгут",
    resultNameEn: "Improvised Tourniquet",
    icon: "🩹",
    mechanicalEffect: "Экстренная герметичная повязка: моментально останавливает артериальное кровотечение и предотвращает гибель от потери крови."
  },
  {
    id: "craft_moonshine",
    ingredient1Id: "item_sugar",
    ingredient2Id: "item_yeast",
    resultName: "Брага очищенная",
    resultNameEn: "Purified Moonshine (3L)",
    icon: "🍺",
    mechanicalEffect: "3 литра крепкого напитка: повышает Мораль группы на +2; может использоваться как универсальный антисептик или валюта."
  },
  {
    id: "craft_tactical_spear",
    ingredient1Id: "item_knife_hunting",
    ingredient2Id: "item_rope_nylon",
    resultName: "Копьё тактическое",
    resultNameEn: "Tactical Spear",
    icon: "🏹",
    mechanicalEffect: "Универсальное древковое оружие дистанции 3 метра: наносит 1d6+2 колющего урона; эффективно против диких зверей без сближения."
  },
  {
    id: "craft_nav_package",
    ingredient1Id: "item_military_manual",
    ingredient2Id: "item_compass_liquid",
    resultName: "Навигационный пакет",
    resultNameEn: "Field Navigation Package",
    icon: "🗺️",
    mechanicalEffect: "Идеально выверенная система разведки: снижает риск заблудиться или попасть в засаду при вылазках на 50%."
  },
  {
    id: "craft_elec_repair",
    ingredient1Id: "item_tools_kit",
    ingredient2Id: "item_microchips",
    resultName: "Электронный ремнабор",
    resultNameEn: "Electronic Repair Kit",
    icon: "🔌",
    mechanicalEffect: "Профессиональный инструмент электромеханика: ремонт сложнейших микропроцессорных плат и сенсоров жизнеобеспечения."
  },
  {
    id: "craft_night_scope",
    ingredient1Id: "item_binoculars_tactical",
    ingredient2Id: "item_microchips",
    resultName: "Ночной оптический прицел",
    resultNameEn: "Night Vision Scope",
    icon: "🌙",
    mechanicalEffect: "Электронный ПНВ: позволяет вести наблюдение и прицельную стрельбу в полной темноте без демаскирующей подсветки."
  },
  {
    id: "craft_rad_alarm",
    ingredient1Id: "item_dosimeter",
    ingredient2Id: "item_microchips",
    resultName: "Радиометр-сигнализатор",
    resultNameEn: "Radiation Alarm System",
    icon: "☢️",
    mechanicalEffect: "Автоматическая охранная система: громкая сирена срабатывает при малейшем проникновении радиоактивной пыли в вентиляцию."
  },
  {
    id: "craft_tripwire",
    ingredient1Id: "item_trap_spring",
    ingredient2Id: "item_rope_nylon",
    resultName: "Растяжка-сигнализация",
    resultNameEn: "Perimeter Tripwire Alarm",
    icon: "⚠️",
    mechanicalEffect: "Периметровая скрытая ловушка: наносит 1d6 урона нарушителю и будит весь гарнизон бункера при попытке несанкционированного входа."
  },
  {
    id: "craft_poison_trap",
    ingredient1Id: "item_rat_poison",
    ingredient2Id: "item_trap_spring",
    resultName: "Отравленный капкан",
    resultNameEn: "Poisoned Spring Trap",
    icon: "☠️",
    mechanicalEffect: "Смертоносная ловушка: гарантированно парализует или уничтожает любую мелкую или среднюю цель без права на спасбросок."
  },
  {
    id: "craft_molotov",
    ingredient1Id: "item_vodka",
    ingredient2Id: "item_rags",
    resultName: "Коктейль Молотова",
    resultNameEn: "Molotov Cocktail",
    icon: "🔥",
    mechanicalEffect: "Оборонительная зажигательная граната: наносит 2d6 урона огнём по площади 3х3 метра и обращает в паническое бегство нападающих."
  },
  {
    id: "craft_miner_helmet",
    ingredient1Id: "item_helmet_hard",
    ingredient2Id: "item_flashlight_tactical",
    resultName: "Шахтёрская каска",
    resultNameEn: "Mining Hard Hat with Light",
    icon: "⛏️",
    mechanicalEffect: "Свободные руки при работе в подземных галереях: устраняет штрафы освещения; +1 к добыче руды и разборке завалов."
  },
  {
    id: "craft_fire_trap",
    ingredient1Id: "item_canister_gasoline",
    ingredient2Id: "item_lighter_piezo",
    resultName: "Огненная ловушка-барьер",
    resultNameEn: "Fire Barrier Trap",
    icon: "💥",
    mechanicalEffect: "Управляемый огненный вал 5х5 метров перед шлюзом: сжигает волну мутантов или блокирует прорыв рейдеров на 3 раунда."
  },
  {
    id: "craft_water_station",
    ingredient1Id: "item_filter_water",
    ingredient2Id: "item_disinfectant_alcohol",
    resultName: "Стерилизационная станция воды",
    resultNameEn: "Water Sterilization Station",
    icon: "💧",
    mechanicalEffect: "Стационарный узел очистки: непрерывно снабжает всю колонию (до 15 человек) 100% безопасной питьевой водой высшей категории."
  },
  {
    id: "craft_grappling_hook",
    ingredient1Id: "item_axe_fire",
    ingredient2Id: "item_rope_hemp",
    resultName: "Абордажный крюк-кошка",
    resultNameEn: "Boarding Grappling Hook",
    icon: "⚓",
    mechanicalEffect: "Тяжёлый альпинистский зацеп: преодоление вертикальных стен, эвакуация раненых из расщелин и быстрый штурм укреплений."
  }
];
