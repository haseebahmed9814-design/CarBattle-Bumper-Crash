const GAME_VERSION = 'v3.1.0';
const GAME_DEVELOPER = 'Muhammad Haseeb Ahmed';

const CAR_COLOR_PALETTES = {
    blue:   { id: 'blue',   name: 'ELECTRIC BLUE', main: '#00a8ff', light: '#60efff', dark: '#0048b5', glow: '#00d2ff' },
    red:    { id: 'red',    name: 'HYPER RED',     main: '#ff1e42', light: '#ff758f', dark: '#9e001c', glow: '#ff2a55' },
    green:  { id: 'green',  name: 'EMERALD GREEN', main: '#00e676', light: '#69f0ae', dark: '#00803e', glow: '#00ff88' },
    gold:   { id: 'gold',   name: 'CYBER GOLD',    main: '#ffb703', light: '#ffe169', dark: '#bd7200', glow: '#ffd000' },
    purple: { id: 'purple', name: 'PLASMA PURPLE', main: '#b5179e', light: '#f72585', dark: '#560bad', glow: '#d9048e' }
};

const VEHICLE_ARCHETYPES = {
    classic: {
        id: 'classic',
        name: 'APEX GT',
        length: 80,
        width: 42,
        radius: 33.6,
        mass: 1.0,
        maxHp: 200,
        accel: 0.45,
        reverseAccel: 0.28,
        maxSpeed: 11.8,
        maxReverse: 5.8,
        steerRate: 0.068,
        normalGrip: 0.90,
        handbrakeGrip: 0.955,
        rearDamagePenalty: 1.55,
        statsDisplay: { speed: 95, handling: 93, armor: 100 }
    }
};

const AI_DIFFICULTY_PROFILES = {
    easy: {
        id: 'easy', label: 'EASY',
        description: 'Rookie AI drivers with slower reactions, wider turns, and relaxed throttle.',
        decisionInterval: 42, aimJitter: 0.68, leadPrediction: 0.0, flankDistance: 40,
        wallSenseDist: 105, maxChaseFrames: 95, useDriftTurn: false, evadeIncoming: false,
        throttleFactor: 0.65, hesitationChance: 0.28
    },
    normal: {
        id: 'normal', label: 'NORMAL',
        description: 'Balanced AI drivers with smart flanking, obstacle recovery, and equal top speed.',
        decisionInterval: 15, aimJitter: 0.16, leadPrediction: 4.8, flankDistance: 115,
        wallSenseDist: 165, maxChaseFrames: 155, useDriftTurn: true, evadeIncoming: false,
        throttleFactor: 0.94, hesitationChance: 0.04
    },
    hard: {
        id: 'hard', label: 'HARD',
        description: 'Master AI drivers with sharp flanking, drift turns, and equal constant top speed.',
        decisionInterval: 4, aimJitter: 0.0, leadPrediction: 10.5, flankDistance: 160,
        wallSenseDist: 220, maxChaseFrames: 120, useDriftTurn: true, evadeIncoming: true,
        throttleFactor: 1.00, hesitationChance: 0.0
    }
};

const ARENA_PRESETS = {
    expanded:    { id: 'expanded',    name: 'FOOTBALL GROUND', width: 3400, height: 2100, wallPad: 52, hasHazards: false },
    park_ground: { id: 'park_ground', name: 'PARK GROUND',     width: 3400, height: 2100, wallPad: 52, hasHazards: true  }
};

const UserSettings = {
    masterVolume: 0.80,
    sfxVolume: 0.90,
    cameraMode: 'moving_wide',
    gfxQuality: 'high'
};

const MatchConfig = {
    mode: 'single',
    spSubMode: 'ffa',
    arenaKey: 'expanded',
    difficulty: 'normal',
    p1Name: localStorage.getItem('bc_p1_name') || 'PLAYER 1',
    p2Name: localStorage.getItem('bc_p2_name') || 'PLAYER 2',
    p1Color: 'blue',
    p2Color: 'green',
    enemyBotCount: 3,
    allyBotCount: 1,
    spAllyBots: 2,
    spEnemyBots: 3,
    p1TeamBots: 2,
    p2TeamBots: 2,
    timedMode: true,
    timeLimitMinutes: 3
};