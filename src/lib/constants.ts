import type { BeltLevel, AchievementDef } from './types'

// ── Belt levels ───────────────────────────────────────────────────────────────
export const BELT_LEVELS: BeltLevel[] = [
  'white','whiteYellow','yellow','yellowOrange','orange','orangeGreen',
  'green','greenBlue','blue','blueBrown','brown','black',
]

export const BELT_DISPLAY: Record<BeltLevel, string> = {
  white:        'Білий',
  whiteYellow:  'Біло-жовтий',
  yellow:       'Жовтий',
  yellowOrange: 'Жовто-помаранчевий',
  orange:       'Помаранчевий',
  orangeGreen:  'Помаранчево-зелений',
  green:        'Зелений',
  greenBlue:    'Зелено-синій',
  blue:         'Синій',
  blueBrown:    'Синьо-коричневий',
  brown:        'Коричневий',
  black:        'Чорний (Дан)',
}

export const BELT_COLOR: Record<BeltLevel, string> = {
  white:        '#F5F5F5',
  whiteYellow:  '#FFF176',
  yellow:       '#FFD600',
  yellowOrange: '#FFB300',
  orange:       '#FF6D00',
  orangeGreen:  '#8BC34A',
  green:        '#2E7D32',
  greenBlue:    '#29B6F6',
  blue:         '#1565C0',
  blueBrown:    '#795548',
  brown:        '#4E342E',
  black:        '#212121',
}

export const BELT_ABBR: Record<BeltLevel, string> = {
  white:'Б', whiteYellow:'БЖ', yellow:'Ж', yellowOrange:'ЖП',
  orange:'П', orangeGreen:'ПЗ', green:'З', greenBlue:'ЗС',
  blue:'С', blueBrown:'СК', brown:'К', black:'Дан',
}

// ── Achievement definitions ────────────────────────────────────────────────────
export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Belts
  { id:'belt_white',        name:'Білий пояс',          emoji:'⚪', description:'Отримав білий пояс.',           category:'belts', rarity:'common',    type:'auto' },
  { id:'belt_whiteYellow',  name:'Біло-жовтий пояс',    emoji:'🟡', description:'Отримав біло-жовтий пояс.',    category:'belts', rarity:'common',    type:'auto' },
  { id:'belt_yellow',       name:'Жовтий пояс',         emoji:'🟡', description:'Отримав жовтий пояс.',         category:'belts', rarity:'common',    type:'auto' },
  { id:'belt_yellowOrange', name:'Жовто-помаранчевий',  emoji:'🟠', description:'Отримав жовто-помаранчевий.',  category:'belts', rarity:'rare',      type:'auto' },
  { id:'belt_orange',       name:'Помаранчевий пояс',   emoji:'🟠', description:'Отримав помаранчевий пояс.',   category:'belts', rarity:'rare',      type:'auto' },
  { id:'belt_orangeGreen',  name:'Помаранчево-зелений', emoji:'🟢', description:'Отримав помаранчево-зелений.', category:'belts', rarity:'rare',      type:'auto' },
  { id:'belt_green',        name:'Зелений пояс',        emoji:'🟢', description:'Отримав зелений пояс.',        category:'belts', rarity:'epic',      type:'auto' },
  { id:'belt_greenBlue',    name:'Зелено-синій пояс',   emoji:'🔵', description:'Отримав зелено-синій пояс.',   category:'belts', rarity:'epic',      type:'auto' },
  { id:'belt_blue',         name:'Синій пояс',          emoji:'🔵', description:'Отримав синій пояс.',          category:'belts', rarity:'epic',      type:'auto' },
  { id:'belt_blueBrown',    name:'Синьо-коричневий',    emoji:'🟤', description:'Отримав синьо-коричневий.',    category:'belts', rarity:'legendary', type:'auto' },
  { id:'belt_brown',        name:'Коричневий пояс',     emoji:'🟤', description:'Отримав коричневий пояс.',     category:'belts', rarity:'legendary', type:'auto' },
  { id:'belt_black',        name:'Чорний пояс (Дан)',   emoji:'⚫', description:'Досягнув чорного поясу!',      category:'belts', rarity:'mythic',    type:'auto' },
  // Tournaments
  { id:'first_tournament',    name:'Перший турнір',     emoji:'🎯', description:'Перший турнір.',           category:'tournaments', rarity:'common',    type:'auto' },
  { id:'first_medal',         name:'Перша медаль',      emoji:'🥉', description:'Перша медаль.',            category:'tournaments', rarity:'rare',      type:'auto' },
  { id:'champion',            name:'Чемпіон',           emoji:'🥇', description:'1 місце на турнірі.',      category:'tournaments', rarity:'epic',      type:'auto' },
  { id:'medals_10',           name:'10 медалей',        emoji:'🏅', description:'10 медалей.',              category:'tournaments', rarity:'epic',      type:'auto' },
  { id:'medals_20',           name:'20 медалей',        emoji:'🏆', description:'20 медалей.',              category:'tournaments', rarity:'legendary', type:'auto' },
  { id:'bronze_medalist',     name:'Бронзовий призер',  emoji:'🥉', description:'3 місце.',                 category:'tournaments', rarity:'rare',      type:'auto' },
  { id:'silver_medalist',     name:'Срібний призер',    emoji:'🥈', description:'2 місце.',                 category:'tournaments', rarity:'epic',      type:'auto' },
  { id:'podium_5_streak',     name:'5 подіумів',        emoji:'🏆', description:'5 медалей поспіль.',       category:'tournaments', rarity:'legendary', type:'auto' },
  { id:'tournament_3_streak', name:'3 турніри',         emoji:'🎯', description:'3 турніри.',               category:'tournaments', rarity:'rare',      type:'auto' },
  // Training
  { id:'first_training',  name:'Перший крок',    emoji:'🥋', description:'Перше тренування.',    category:'training', rarity:'common',    type:'auto' },
  { id:'trainings_10',    name:'Новачок',        emoji:'🥋', description:'10 тренувань.',        category:'training', rarity:'common',    type:'auto' },
  { id:'trainings_50',    name:'Наполегливий',   emoji:'🥋', description:'50 тренувань.',        category:'training', rarity:'rare',      type:'auto' },
  { id:'trainings_100',   name:'Боєць',          emoji:'🥋', description:'100 тренувань.',       category:'training', rarity:'epic',      type:'auto' },
  { id:'trainings_250',   name:'Майстер татамі', emoji:'🥋', description:'250 тренувань.',       category:'training', rarity:'legendary', type:'auto' },
  { id:'trainings_500',   name:'Легенда залу',   emoji:'🥋', description:'500 тренувань.',       category:'training', rarity:'mythic',    type:'auto' },
  // Discipline
  { id:'streak_7',            name:'7 днів поспіль',    emoji:'🔥', description:'Тиждень без пропусків.',    category:'discipline', rarity:'common',    type:'auto' },
  { id:'streak_14',           name:'14 днів поспіль',   emoji:'🔥', description:'2 тижні без пропусків.',   category:'discipline', rarity:'rare',      type:'auto' },
  { id:'streak_30',           name:'Невидимий воїн',    emoji:'🥷', description:'30 поспіль.',              category:'discipline', rarity:'epic',      type:'auto', isHidden:true },
  { id:'streak_100',          name:'100 днів прогресу', emoji:'🔥', description:'100 поспіль.',             category:'discipline', rarity:'legendary', type:'auto' },
  { id:'year_no_miss',        name:'Рік без пропусків', emoji:'👑', description:'Жодного пропуску за рік.', category:'discipline', rarity:'mythic',    type:'auto' },
  { id:'attendance_100_year', name:'100% відвідуваності',emoji:'💯',description:'100% за рік.',            category:'discipline', rarity:'legendary', type:'auto' },
  { id:'autumn_discipline',   name:'Осінній самурай',   emoji:'🍂', description:'Без пропусків восени.',    category:'discipline', rarity:'legendary', type:'auto' },
  { id:'winter_discipline',   name:'Зимовий самурай',   emoji:'❄️', description:'Без пропусків взимку.',    category:'discipline', rarity:'legendary', type:'auto' },
  { id:'spring_discipline',   name:'Весняний самурай',  emoji:'🌱', description:'Без пропусків навесні.',   category:'discipline', rarity:'legendary', type:'auto' },
  { id:'summer_discipline',   name:'Літній самурай',    emoji:'☀️', description:'Без пропусків влітку.',    category:'discipline', rarity:'legendary', type:'auto' },
  // Behavior (manual)
  { id:'friend_of_team',  name:'Друг команди',     emoji:'🤝', description:'Допомагає іншим.',         category:'behavior', rarity:'rare',      type:'manual' },
  { id:'team_leader',     name:'Лідер групи',      emoji:'🤝', description:'Веде за собою.',           category:'behavior', rarity:'epic',      type:'manual' },
  { id:'team_support',    name:'Підтримка команди',emoji:'🤝', description:'Підтримує товаришів.',     category:'behavior', rarity:'rare',      type:'manual' },
  { id:'fair_play',       name:'Чесна боротьба',   emoji:'🤝', description:'Бореться чесно.',          category:'behavior', rarity:'rare',      type:'manual' },
  { id:'respect',         name:'Повага',           emoji:'🤝', description:'Виявляє повагу до всіх.',  category:'behavior', rarity:'rare',      type:'manual' },
  // Technique (manual)
  { id:'throw_master',         name:'Майстер кидка',    emoji:'🥋', description:'Техніка кидків.',     category:'technique', rarity:'epic',      type:'manual' },
  { id:'hold_master',          name:'Король утримань',  emoji:'🥋', description:'Еталонне утримання.', category:'technique', rarity:'epic',      type:'manual' },
  { id:'pain_master',          name:'Майстер больових', emoji:'🥋', description:'Больові прийоми.',    category:'technique', rarity:'epic',      type:'manual' },
  { id:'counter_master',       name:'Майстер контратак',emoji:'🥋', description:'Контратаки.',         category:'technique', rarity:'epic',      type:'manual' },
  { id:'technician_of_year',   name:'Технік року',      emoji:'🥋', description:'Найкраща техніка.',   category:'technique', rarity:'legendary', type:'manual' },
  // Theory (manual)
  { id:'judo_expert',       name:'Знавець дзюдо',   emoji:'📖', description:'Знає теорію.',        category:'theory', rarity:'rare', type:'manual' },
  { id:'judo_historian',    name:'Історик дзюдо',   emoji:'📖', description:'Знає історію.',       category:'theory', rarity:'rare', type:'manual' },
  { id:'judo_code',         name:'Кодекс дзюдо',    emoji:'📖', description:'Дотримується кодексу.',category:'theory', rarity:'rare', type:'manual' },
  { id:'terminology_master',name:'Майстер термінів',emoji:'📖', description:'Знає термінологію.', category:'theory', rarity:'epic', type:'manual' },
  // Special (manual)
  { id:'senseis_chosen',      name:'Обранець сенсея',   emoji:'👑', description:'Нагорода від тренера.',   category:'special', rarity:'legendary', type:'manual' },
  { id:'club_pride',          name:'Гордість клубу',    emoji:'👑', description:'Гордість ТРІУМФУ.',        category:'special', rarity:'legendary', type:'manual' },
  { id:'example_for_younger', name:'Приклад',           emoji:'🥋', description:'Натхнення для інших.',    category:'special', rarity:'epic',      type:'manual' },
  { id:'triumph_legend',      name:'Легенда ТРІУМФУ',   emoji:'🏆', description:'Найвища нагорода.',       category:'special', rarity:'mythic',    type:'manual' },
  { id:'secret_technique',    name:'Секретна техніка',  emoji:'🎁', description:'???',                    category:'special', rarity:'epic',      type:'manual', isHidden:true },
  { id:'lightning',           name:'Блискавка',         emoji:'⚡', description:'???',                    category:'special', rarity:'legendary', type:'manual', isHidden:true },
  { id:'perfect_attestation', name:'Без помилок',       emoji:'✅', description:'Ідеальна атестація.',    category:'special', rarity:'epic',      type:'manual' },
  // Seasonal (manual)
  { id:'autumn_champion', name:'Осінній чемпіон', emoji:'🍂', description:'Без пропусків восени.',  category:'seasonal', rarity:'epic', type:'manual' },
  { id:'winter_warrior',  name:'Зимовий воїн',    emoji:'❄️', description:'Без пропусків взимку.',  category:'seasonal', rarity:'epic', type:'manual' },
  { id:'spring_warrior',  name:'Весняний воїн',   emoji:'🌱', description:'Без пропусків навесні.', category:'seasonal', rarity:'epic', type:'manual' },
  { id:'summer_warrior',  name:'Літній воїн',     emoji:'☀️', description:'Без пропусків влітку.',  category:'seasonal', rarity:'epic', type:'manual' },
]

export const RARITY_LABEL: Record<string, string> = {
  common: 'Звичайне', rare: 'Рідкісне', epic: 'Епічне',
  legendary: 'Легендарне', mythic: 'Міфічне',
}

export const RARITY_COLOR: Record<string, string> = {
  common: '#B7B0A8', rare: '#29B6F6', epic: '#AB47BC',
  legendary: '#FFD21A', mythic: '#FF3B30',
}

export const ACHIEVEMENT_CATEGORY_LABEL: Record<string, string> = {
  belts: 'Пояси', tournaments: 'Турніри', training: 'Тренування',
  discipline: 'Дисципліна', behavior: 'Поведінка', technique: 'Техніка',
  theory: 'Теорія', special: 'Особливі', seasonal: 'Сезонні',
}

export const DAY_NAMES = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']

export const MEAL_TYPE_LABEL: Record<string, string> = {
  breakfast: 'Сніданок', snack: 'Перекус', lunch: 'Обід',
  supper: 'Полудень', dinner: 'Вечеря',
}

export const WEIGHT_CATEGORIES = [
  '-16 кг','-18 кг','-20 кг','-22 кг','-24 кг','-26 кг','-28 кг',
  '-30 кг','-32 кг','-34 кг','-36 кг','-38 кг','-40 кг','-42 кг',
  '-44 кг','-46 кг','-48 кг','+48 кг','-50 кг','-55 кг','-60 кг','+60 кг',
]
