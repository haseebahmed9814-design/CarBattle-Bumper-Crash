const StoryMode = {
    sectorWidth: 3800,
    mapHeight: 3000,
    roadTop: 520,
    roadBottom: 2480,
    episode: 1,
    currentStage: 0,
    stageCleared: false,
    lives: 3,
    killCounterForLife: 0,
    maxBodyguards: 4,
    nextEntityId: 200,
    repairCrates: [],
    obstacles: [],
    gates: [],
    stageFlag: null,
    captiveCar: null,
    viperCompanion: null,
    soloCompanion: null,
    extractionCars: [],
    cageIntact: true,
    cageUnlockProgress: 0,
    cageUnlockRequired: 360,
    postRescueFollowTimer: 0,
    cutsceneMode: null,
    cutsceneTimer: 0,
    commsSpeaker: "",
    commsText: "",
    commsColor: "#38bdf8",
    commsTimer: 0,
    keyListenerBound: false,

    formationSpecs: [
        {
            id: 0,
            name: "1. COMMANDO COVER (FRONT / BACK / SIDES)",
            shortLabel: "FRONT/BACK COVER",
            slots: [
                { fwd: 165,  side: 0    },
                { fwd: -165, side: 0    },
                { fwd: 0,    side: -145 },
                { fwd: 0,    side: 145  }
            ]
        },
        {
            id: 1,
            name: "2. VANGUARD SPEARHEAD (FRONT SHIELD)",
            shortLabel: "FRONT SHIELD",
            slots: [
                { fwd: 195, side: -75  },
                { fwd: 195, side: 75   },
                { fwd: 140, side: -165 },
                { fwd: 140, side: 165  }
            ]
        },
        {
            id: 2,
            name: "3. REAR ORDERED COLUMN (STAND BEHIND YOU)",
            shortLabel: "REAR LINE",
            slots: [
                { fwd: -145, side: 0   },
                { fwd: -255, side: 0   },
                { fwd: -365, side: 0   },
                { fwd: -475, side: 0   }
            ]
        }
    ],

    episode1Stages: [
        {
            index: 0,
            name: "EP1 STAGE 1: DEADMAN CANYON",
            sub: "Defeat the Canyon Patrols, capture the Gate Key Flag, and unlock Gate 1!",
            radioSpeaker: "VIPER [CAPTIVE RADIO]",
            radioMsg: "General Kraken locked me in the Sector 5 Cage! Defeat the patrols and bring the Key Flag to Gate 1!",
            xStart: 0, xEnd: 3800,
            checkpointX: 460, checkpointY: 1500,
            hasKeyFlag: true, flagX: 2250, flagY: 920,
            enemies: [
                { chassis: "buggy",        label: "CANYON SCOUT 1",   hp: 190, x: 1450, y: 1120, color: "green",  actRange: 760 },
                { chassis: "buggy",        label: "CANYON SCOUT 2",   hp: 190, x: 1450, y: 1880, color: "green",  actRange: 760 },
                { chassis: "zombie_truck", label: "KEY GUARD TRUCK",  hp: 290, x: 2250, y: 920,  color: "red",    actRange: 680, dropsCrate: true },
                { chassis: "buggy",        label: "KEY ESCORT BUGGY", hp: 195, x: 2350, y: 1220, color: "gold",   actRange: 680 },
                { chassis: "zombie_truck", label: "GATE HAULER 1",    hp: 310, x: 3250, y: 1260, color: "purple", actRange: 680 },
                { chassis: "zombie_truck", label: "GATE HAULER 2",    hp: 310, x: 3250, y: 1740, color: "red",    actRange: 680, dropsCrate: true }
            ],
            boss: null
        },
        {
            index: 1,
            name: "EP1 STAGE 2: TOXIC REFINERY",
            sub: "Crush the Tanker Squads, seize the Key Flag, and defeat the Refinery Behemoth!",
            radioSpeaker: "HQ TACTICAL COMMS",
            radioMsg: "Your ability charges up to 200% (2 full charges)! Save 200% to deploy 2 bots at once when fighting bosses!",
            xStart: 3800, xEnd: 7600,
            checkpointX: 4180, checkpointY: 1500,
            hasKeyFlag: true, flagX: 5750, flagY: 2050,
            enemies: [
                { chassis: "zombie_truck", label: "REFINERY TRUCK 1", hp: 310, x: 5000, y: 1100, color: "red",    actRange: 760 },
                { chassis: "zombie_truck", label: "REFINERY TRUCK 2", hp: 310, x: 5000, y: 1900, color: "green",  actRange: 760, dropsCrate: true },
                { chassis: "warrig",       label: "FLAG WARDEN RIG",  hp: 360, x: 5750, y: 2050, color: "purple", actRange: 680 },
                { chassis: "buggy",        label: "BEHEMOTH GUARD 1", hp: 210, x: 6850, y: 1180, color: "gold",   actRange: 700 },
                { chassis: "buggy",        label: "BEHEMOTH GUARD 2", hp: 210, x: 6850, y: 1820, color: "green",  actRange: 700 }
            ],
            boss: { chassis: "boss", label: "MINI-BOSS: REFINERY BEHEMOTH", hp: 920, x: 7080, y: 1500, color: "red", scale: 1.36, actRange: 720, dropsCrate: true }
        },
        {
            index: 2,
            name: "EP1 STAGE 3: LAVA CHASM BRIDGE",
            sub: "Fight across the Suspension Bridge, take the Key Flag, and crush the Bridge Colossus!",
            radioSpeaker: "VIPER [CAPTIVE RADIO]",
            radioMsg: "Once an enemy spots you, they will pursue you across the entire sector! Keep your bots in formation!",
            xStart: 7600, xEnd: 11400,
            checkpointX: 7980, checkpointY: 1500,
            hasKeyFlag: true, flagX: 9500, flagY: 1500,
            enemies: [
                { chassis: "zombie_truck", label: "BRIDGE HAULER 1",  hp: 330, x: 8950,  y: 1220, color: "red",    actRange: 760 },
                { chassis: "zombie_truck", label: "BRIDGE HAULER 2",  hp: 330, x: 8950,  y: 1780, color: "purple", actRange: 760, dropsCrate: true },
                { chassis: "warrig",       label: "SPAN WAR-RIG",     hp: 380, x: 9650,  y: 1500, color: "gold",   actRange: 680 },
                { chassis: "zombie_truck", label: "COLOSSUS GUARD 1", hp: 320, x: 10650, y: 1150, color: "green",  actRange: 720 },
                { chassis: "zombie_truck", label: "COLOSSUS GUARD 2", hp: 320, x: 10650, y: 1850, color: "red",    actRange: 720 }
            ],
            boss: { chassis: "boss", label: "MINI-BOSS: BRIDGE COLOSSUS", hp: 1120, x: 10900, y: 1500, color: "purple", scale: 1.40, actRange: 740, dropsCrate: true }
        },
        {
            index: 3,
            name: "EP1 STAGE 4: DREAD COURTYARD",
            sub: "Overrun the Courtyard Siege Rigs, deliver the Key Flag, and defeat the Fortress Goliath!",
            radioSpeaker: "HQ TACTICAL COMMS",
            radioMsg: "Heavy 8-Wheel Siege Rigs are ahead! Capture the North Key Flag and smash the Fortress Goliath!",
            xStart: 11400, xEnd: 15200,
            checkpointX: 11780, checkpointY: 1500,
            hasKeyFlag: true, flagX: 13300, flagY: 880,
            enemies: [
                { chassis: "warrig",       label: "SIEGE WAR-RIG 1",  hp: 390, x: 12650, y: 1150, color: "red",    actRange: 760 },
                { chassis: "warrig",       label: "SIEGE WAR-RIG 2",  hp: 390, x: 12650, y: 1850, color: "gold",   actRange: 760, dropsCrate: true },
                { chassis: "zombie_truck", label: "FLAG SENTRY RIG",  hp: 350, x: 13300, y: 880,  color: "green",  actRange: 680 },
                { chassis: "warrig",       label: "GOLIATH GUARD 1",  hp: 380, x: 14400, y: 1150, color: "purple", actRange: 740 },
                { chassis: "warrig",       label: "GOLIATH GUARD 2",  hp: 380, x: 14400, y: 1850, color: "red",    actRange: 740 }
            ],
            boss: { chassis: "boss", label: "MINI-BOSS: FORTRESS GOLIATH", hp: 1350, x: 14680, y: 1500, color: "gold", scale: 1.46, actRange: 760, dropsCrate: true }
        },
        {
            index: 4,
            name: "EP1 STAGE 5: THE IRON LOCKAGE",
            sub: "Defeat WARLORD KRAKEN, then hold inside Viper Cage Zone for 6s to free him!",
            radioSpeaker: "WARLORD KRAKEN [FINAL BOSS]",
            radioMsg: "My Citadel Armada will tear your squad apart! You will never unlock Viper Cage!",
            xStart: 15200, xEnd: 19000,
            checkpointX: 15580, checkpointY: 1500,
            hasKeyFlag: false,
            enemies: [
                { chassis: "warrig",       label: "CITADEL RIG 1",    hp: 410, x: 16450, y: 1120, color: "purple", actRange: 780 },
                { chassis: "warrig",       label: "CITADEL RIG 2",    hp: 410, x: 16450, y: 1880, color: "red",    actRange: 780, dropsCrate: true },
                { chassis: "zombie_truck", label: "KRAKEN GUARD 1",   hp: 370, x: 17350, y: 1050, color: "green",  actRange: 760 },
                { chassis: "zombie_truck", label: "KRAKEN GUARD 2",   hp: 370, x: 17350, y: 1950, color: "gold",   actRange: 760, dropsCrate: true }
            ],
            boss: { chassis: "boss", label: "FINAL BOSS: WARLORD KRAKEN", hp: 2200, x: 17750, y: 1500, color: "red", scale: 1.62, actRange: 800, isFinalBoss: true }
        }
    ],

    episode2Stages: [
        {
            index: 0,
            name: "EP2 STAGE 1: GLACIER COAST HIGHWAY",
            sub: "Escort Viper across the Snow Highway, capture the Key Flag, and sink the Patrol Boats!",
            radioSpeaker: "VIPER [RESCUED FRIEND]",
            radioMsg: "I am following right behind you! Escort me to Sector 5 so my Allied Extraction Team can pick me up!",
            xStart: 0, xEnd: 3800,
            checkpointX: 460, checkpointY: 1500,
            hasKeyFlag: true, flagX: 2250, flagY: 2050,
            enemies: [
                { chassis: "buggy",        label: "ARCTIC SCOUT 1",   hp: 210, x: 1450, y: 1150, color: "green",  actRange: 760 },
                { chassis: "buggy",        label: "ARCTIC SCOUT 2",   hp: 210, x: 1450, y: 1850, color: "gold",   actRange: 760 },
                { chassis: "gunboat",      label: "COAST GUNBOAT 1",  hp: 330, x: 2250, y: 2050, color: "purple", actRange: 700, dropsCrate: true },
                { chassis: "zombie_truck", label: "FROST HAULER",     hp: 320, x: 3150, y: 1220, color: "red",    actRange: 720 },
                { chassis: "gunboat",      label: "COAST GUNBOAT 2",  hp: 340, x: 3250, y: 1780, color: "red",    actRange: 720, dropsCrate: true }
            ],
            boss: null
        },
        {
            index: 1,
            name: "EP2 STAGE 2: FROZEN HARBOR PIERS",
            sub: "Destroy the Harbor Gunboats, grab the Pier Key Flag, and sink the Ironclad Destroyer!",
            radioSpeaker: "VIPER [RESCUED FRIEND]",
            radioMsg: "Syndicate Gunboats have blockaded the frozen piers! Watch your bots patrol when they get close!",
            xStart: 3800, xEnd: 7600,
            checkpointX: 4180, checkpointY: 1500,
            hasKeyFlag: true, flagX: 5750, flagY: 920,
            enemies: [
                { chassis: "gunboat",      label: "PIER GUNBOAT 1",   hp: 350, x: 5000, y: 1120, color: "red",    actRange: 760 },
                { chassis: "gunboat",      label: "PIER GUNBOAT 2",   hp: 350, x: 5000, y: 1880, color: "gold",   actRange: 760, dropsCrate: true },
                { chassis: "zombie_truck", label: "KEY GUARD SEMI",   hp: 340, x: 5750, y: 920,  color: "green",  actRange: 680 },
                { chassis: "gunboat",      label: "DESTROYER ESCORT 1", hp: 320, x: 6850, y: 1150, color: "purple", actRange: 720 },
                { chassis: "gunboat",      label: "DESTROYER ESCORT 2", hp: 320, x: 6850, y: 1850, color: "red",    actRange: 720 }
            ],
            boss: { chassis: "gunboat", label: "MINI-BOSS: IRONCLAD DESTROYER BOAT", hp: 1050, x: 7080, y: 1500, color: "red", scale: 1.40, actRange: 740, dropsCrate: true }
        },
        {
            index: 2,
            name: "EP2 STAGE 3: SEA CHANNEL CAUSEWAY",
            sub: "Cross the Naval Causeway, capture the Key Flag, and sink the Frigate Commander!",
            radioSpeaker: "HQ TACTICAL COMMS",
            radioMsg: "The Sea Channel is heavily guarded by Gunboats and War-Rigs. Protect Viper as you cross!",
            xStart: 7600, xEnd: 11400,
            checkpointX: 7980, checkpointY: 1500,
            hasKeyFlag: true, flagX: 9500, flagY: 1500,
            enemies: [
                { chassis: "gunboat",      label: "CHANNEL BOAT 1",   hp: 370, x: 8950,  y: 1200, color: "purple", actRange: 760 },
                { chassis: "gunboat",      label: "CHANNEL BOAT 2",   hp: 370, x: 8950,  y: 1800, color: "red",    actRange: 760, dropsCrate: true },
                { chassis: "warrig",       label: "CAUSEWAY RIG",     hp: 400, x: 9650,  y: 1500, color: "gold",   actRange: 700 },
                { chassis: "gunboat",      label: "FRIGATE GUARD 1",  hp: 350, x: 10650, y: 1150, color: "green",  actRange: 740 },
                { chassis: "gunboat",      label: "FRIGATE GUARD 2",  hp: 350, x: 10650, y: 1850, color: "red",    actRange: 740 }
            ],
            boss: { chassis: "gunboat", label: "MINI-BOSS: FRIGATE COMMANDER", hp: 1220, x: 10900, y: 1500, color: "purple", scale: 1.44, actRange: 760, dropsCrate: true }
        },
        {
            index: 3,
            name: "EP2 STAGE 4: MILITARY CONVOY RUNWAY",
            sub: "Smash the Zombie Semi-Truck Fleet, grab the Key Flag, and wreck the Juggernaut!",
            radioSpeaker: "VIPER [RESCUED FRIEND]",
            radioMsg: "We are almost at the extraction point! Clear this runway and deliver the Key Flag to Gate 4!",
            xStart: 11400, xEnd: 15200,
            checkpointX: 11780, checkpointY: 1500,
            hasKeyFlag: true, flagX: 13300, flagY: 2050,
            enemies: [
                { chassis: "zombie_truck", label: "RUNWAY SEMI 1",    hp: 380, x: 12650, y: 1150, color: "green",  actRange: 760 },
                { chassis: "zombie_truck", label: "RUNWAY SEMI 2",    hp: 380, x: 12650, y: 1850, color: "red",    actRange: 760, dropsCrate: true },
                { chassis: "warrig",       label: "KEY FORTRESS RIG", hp: 420, x: 13300, y: 2050, color: "gold",   actRange: 700 },
                { chassis: "gunboat",      label: "RUNWAY GUNBOAT 1", hp: 380, x: 14400, y: 1150, color: "purple", actRange: 740 },
                { chassis: "gunboat",      label: "RUNWAY GUNBOAT 2", hp: 380, x: 14400, y: 1850, color: "red",    actRange: 740 }
            ],
            boss: { chassis: "boss", label: "MINI-BOSS: ZOMBIE JUGGERNAUT", hp: 1450, x: 14680, y: 1500, color: "green", scale: 1.48, actRange: 760, dropsCrate: true }
        },
        {
            index: 4,
            name: "EP2 STAGE 5: EXTRACTION RENDEZVOUS",
            sub: "FINAL SHOWDOWN: Sink Admiral Leviathan so the Allied Convoy can extract Viper!",
            radioSpeaker: "ADMIRAL VANE [FINAL BOSS]",
            radioMsg: "My Leviathan Flagship Boat blocks the Extraction Highway! Viper is never leaving this coast!",
            xStart: 15200, xEnd: 19000,
            checkpointX: 15580, checkpointY: 1500,
            hasKeyFlag: false,
            enemies: [
                { chassis: "gunboat",      label: "ROYAL GUNBOAT 1",  hp: 420, x: 16450, y: 1120, color: "red",    actRange: 780 },
                { chassis: "gunboat",      label: "ROYAL GUNBOAT 2",  hp: 420, x: 16450, y: 1880, color: "purple", actRange: 780, dropsCrate: true },
                { chassis: "warrig",       label: "ADMIRAL GUARD 1",  hp: 430, x: 17350, y: 1050, color: "gold",   actRange: 760 },
                { chassis: "warrig",       label: "ADMIRAL GUARD 2",  hp: 430, x: 17350, y: 1950, color: "green",  actRange: 760, dropsCrate: true }
            ],
            boss: { chassis: "gunboat", label: "FINAL BOSS: ADMIRAL LEVIATHAN BOAT", hp: 2400, x: 17750, y: 1500, color: "red", scale: 1.66, actRange: 800, isFinalBoss: true }
        }
    ],

    getActiveStages() {
        return this.episode === 2 ? this.episode2Stages : this.episode1Stages;
    },

    bindHotkeysOnce() {
        if (this.keyListenerBound) return;
        this.keyListenerBound = true;
        window.addEventListener("keydown", (e) => {
            if (typeof Game === "undefined" || Game.state !== "PLAYING" || MatchConfig.mode !== "story") return;
            if (this.cutsceneMode) return;
            const activeTag = document.activeElement ? document.activeElement.tagName : "";
            if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

            if (e.code === "KeyE") {
                e.preventDefault();
                const p1 = Game.cars.find(c => c.playerSlot === "p1");
                if (p1) this.triggerPrimaryAbility(p1);
            } else if (e.code === "KeyQ") {
                e.preventDefault();
                const p1 = Game.cars.find(c => c.playerSlot === "p1");
                if (p1) this.cyclePlayerBotFormation(p1, 1);
            } else if (e.code === "Enter" || e.code === "NumpadEnter") {
                const p2 = Game.cars.find(c => c.playerSlot === "p2");
                if (p2) {
                    e.preventDefault();
                    this.triggerPrimaryAbility(p2);
                }
            } else if (e.code === "PageUp") {
                e.preventDefault();
                const p2 = Game.cars.find(c => c.playerSlot === "p2") || Game.cars.find(c => c.playerSlot === "p1");
                if (p2) this.cyclePlayerBotFormation(p2, 1);
            } else if (e.code === "PageDown") {
                e.preventDefault();
                const p2 = Game.cars.find(c => c.playerSlot === "p2") || Game.cars.find(c => c.playerSlot === "p1");
                if (p2) this.cyclePlayerBotFormation(p2, -1);
            }
        });
    },

    cyclePlayerBotFormation(playerCar, dir = 1) {
        const count = this.formationSpecs.length;
        playerCar.botFormation = ((playerCar.botFormation || 0) + dir + count) % count;
        const spec = this.formationSpecs[playerCar.botFormation];
        SoundEngine.playUIClick();
        Game.floatingTexts.push({
            x: playerCar.x, y: playerCar.y - 48,
            text: `BOT PATTERN: ${spec.name}`,
            color: "#38bdf8", life: 1.45
        });
    },

    initMapGeometry() {
        const isEp2 = (this.episode === 2);
        this.obstacles = [
            { x: 1350, y: 360,  r: 62, kind: isEp2 ? "ice_spire" : "canyon_rock" },
            { x: 1350, y: 2640, r: 62, kind: isEp2 ? "ice_spire" : "canyon_rock" },
            { x: 2650, y: 360,  r: 62, kind: isEp2 ? "ice_spire" : "canyon_rock" },
            { x: 2650, y: 2640, r: 62, kind: isEp2 ? "ice_spire" : "canyon_rock" },

            { x: 4800, y: 360,  r: 68, kind: "fuel_tank" },
            { x: 4800, y: 2640, r: 68, kind: "fuel_tank" },
            { x: 6400, y: 360,  r: 68, kind: "fuel_tank" },
            { x: 6400, y: 2640, r: 68, kind: "fuel_tank" },

            { x: 12450, y: 660,  r: 54, kind: "stone_pillar" },
            { x: 12450, y: 2340, r: 54, kind: "stone_pillar" },
            { x: 13950, y: 660,  r: 54, kind: "stone_pillar" },
            { x: 13950, y: 2340, r: 54, kind: "stone_pillar" },

            { x: 16250, y: 660,  r: 56, kind: isEp2 ? "ice_spire" : "iron_brazier" },
            { x: 16250, y: 2340, r: 56, kind: isEp2 ? "ice_spire" : "iron_brazier" },
            { x: 17250, y: 660,  r: 56, kind: isEp2 ? "ice_spire" : "iron_brazier" },
            { x: 17250, y: 2340, r: 56, kind: isEp2 ? "ice_spire" : "iron_brazier" }
        ];

        this.gates = [
            { stageIndex: 0, x: 3800,  isOpen: false, openProgress: 0 },
            { stageIndex: 1, x: 7600,  isOpen: false, openProgress: 0 },
            { stageIndex: 2, x: 11400, isOpen: false, openProgress: 0 },
            { stageIndex: 3, x: 15200, isOpen: false, openProgress: 0 }
        ];
    },

    spawn(cars, spawns) {
        this.bindHotkeysOnce();
        MatchConfig.timedMode = false;
        MatchConfig.difficulty = "normal";
        Game.arena = ARENA_PRESETS.story_ep1;
        UserSettings.cameraMode = "moving_wide";
        if (typeof UIManager !== "undefined") UIManager.syncCameraModeUI();

        this.episode = MatchConfig.storyEpisode || 1;
        this.currentStage = 0;
        this.stageCleared = false;
        this.lives = 3;
        this.killCounterForLife = 0;
        this.nextEntityId = 200;
        this.repairCrates = [];
        this.extractionCars = [];
        this.viperCompanion = null;
        this.soloCompanion = null;
        this.captiveCar = null;
        this.cageIntact = (this.episode === 1);
        this.cageUnlockProgress = 0;
        this.postRescueFollowTimer = 0;
        this.initMapGeometry();

        const n1 = (MatchConfig.p1Name || "PLAYER 1").trim().toUpperCase();
        const p1 = new BattleCar({
            id: 1, label: n1, team: "ALLIES",
            isAI: false, playerSlot: "p1", colorKey: MatchConfig.p1Color,
            x: 140, y: MatchConfig.storyCoop ? 1360 : 1500, angle: 0
        });
        this.decoratePlayerCar(p1, MatchConfig.p1Ability || "summon_guard", "E");
        cars.push(p1);

        if (MatchConfig.storyCoop) {
            const n2 = (MatchConfig.p2Name || "PLAYER 2").trim().toUpperCase();
            const p2 = new BattleCar({
                id: 2, label: n2, team: "ALLIES",
                isAI: false, playerSlot: "p2", colorKey: MatchConfig.p2Color,
                x: 140, y: 1640, angle: 0
            });
            this.decoratePlayerCar(p2, MatchConfig.p2Ability || "group_heal", "ENTER");
            cars.push(p2);
        } else {
            this.spawnSoloCompanionBot(p1, cars, MatchConfig.p2Ability || "group_heal");
        }

        // Start with 1 Support Bot; players can build up to 4 active Support Bots using the 200% Charge Bank!
        this.summonBodyguard(p1);

        if (this.episode === 1) {
            this.captiveCar = new BattleCar({
                id: 99, label: "VIPER [LOCKED IN CAGE]", team: "ALLIES",
                isAI: true, colorKey: "gold",
                x: 18420, y: 1500, angle: Math.PI
            });
            this.captiveCar.isCaptiveFriend = true;
            this.captiveCar.maxHp = 600;
            this.captiveCar.hp = 600;
        } else {
            this.spawnViperCompanion(p1, cars);
        }

        this.spawnStageEnemies(0, cars);
        this.startIntroCutscene();
    },

    startIntroCutscene() {
        this.cutsceneMode = "INTRO";
        this.cutsceneTimer = 260;
        if (this.episode === 1) {
            this.showRadioComms(
                "OPENING CUTSCENE // COMMAND BRIEFING",
                "Viper is locked inside Kraken Cage in Sector 5! Let us roll in, seize the Gate Key Flags, and rescue our friend!",
                "#38bdf8", 260
            );
        } else {
            this.showRadioComms(
                "OPENING CUTSCENE // VIPER & COMMANDER",
                "VIPER: Thanks for saving me in Episode 1! Escort me to Sector 5 where my Allied Extraction Convoy is waiting!",
                "#00e676", 260
            );
        }
    },

    spawnSoloCompanionBot(leaderCar, cars, companionAbility) {
        const compColor = leaderCar.colorKey === "green" ? "gold" : "green";
        const comp = new BattleCar({
            id: 98,
            label: "WINGMAN BOT",
            team: "ALLIES",
            isAI: true,
            colorKey: compColor,
            x: leaderCar.x - 90,
            y: leaderCar.y + 130,
            angle: 0
        });
        comp.isSoloCompanion = true;
        comp.commander = leaderCar;
        comp.maxHp = 240;
        comp.hp = 240;
        comp.primaryAbility = companionAbility || "group_heal";
        comp.abilityCharge = 60;
        this.attachCommandoEscortBrain(comp, leaderCar, -140, 110);
        this.soloCompanion = comp;
        cars.push(comp);
    },

    spawnViperCompanion(leaderCar, cars) {
        const viper = new BattleCar({
            id: 99,
            label: "VIPER [RESCUED FRIEND]",
            team: "ALLIES",
            isAI: true,
            colorKey: "gold",
            x: leaderCar.x - 120,
            y: leaderCar.y - 120,
            angle: 0
        });
        viper.isViperCompanion = true;
        viper.commander = leaderCar;
        viper.maxHp = 520;
        viper.hp = 520;
        viper.spec = Object.assign({}, VEHICLE_ARCHETYPES.classic, {
            maxSpeed: 12.0,
            accel: 0.48
        });
        this.attachCommandoEscortBrain(viper, leaderCar, -155, -105);
        this.viperCompanion = viper;
        cars.push(viper);
    },

    attachCommandoEscortBrain(guard, defaultLeader, fixedFwd = null, fixedSide = null) {
        const origUpdate = guard.aiBrain.update.bind(guard.aiBrain);
        guard.aiBrain.update = (allCars, arena, dt) => {
            if (guard.dead) return { up: false, down: false, steer: 0, drift: false, throttle: 0 };
            let leader = guard.commander;
            if (!leader || leader.dead) {
                leader = allCars.find(c => !c.isAI && !c.dead) || defaultLeader;
            }
            if (!leader || leader.dead) return origUpdate(allCars, arena, dt);

            const formationIdx = leader.botFormation || 0;
            const formSpec = this.formationSpecs[formationIdx] || this.formationSpecs[0];

            const myGuards = allCars.filter(c => c.isBodyguard && !c.dead && c.commander === leader);
            const idx = Math.max(0, myGuards.indexOf(guard));
            const slot = (fixedFwd !== null) ? { fwd: fixedFwd, side: fixedSide } : formSpec.slots[idx % formSpec.slots.length];

            const fx = Math.cos(leader.angle), fy = Math.sin(leader.angle);
            const rx = -fy, ry = fx;
            const slotX = Math.max(120, Math.min(arena.width - 120, leader.x + fx * slot.fwd + rx * slot.side));
            const slotY = Math.max(this.roadTop + 65, Math.min(this.roadBottom - 65, leader.y + fy * slot.fwd + ry * slot.side));

            // NO TELEPORTING! Bots never teleport away from combat. They drive naturally!
            let nearestEnemy = null, minEnemyDist = Infinity;
            for (const en of allCars) {
                if (en.dead || en.team !== "ENEMIES") continue;
                const dLeader = Math.hypot(en.x - leader.x, en.y - leader.y);
                const dGuard = Math.hypot(en.x - guard.x, en.y - guard.y);
                const d = Math.min(dLeader, dGuard);
                if (d < minEnemyDist) {
                    minEnemyDist = d;
                    nearestEnemy = en;
                }
            }

            const distToLeader = Math.hypot(leader.x - guard.x, leader.y - guard.y);

            // 1. DIRECT COMBAT: If an enemy is within 440 units (and bot is not super far behind leader), fight!
            if (nearestEnemy && minEnemyDist < 440 && distToLeader < 920) {
                guard.aiBrain.target = nearestEnemy;
                return guard.aiBrain.steerTowardPoint(
                    nearestEnemy.x + nearestEnemy.vx * 4,
                    nearestEnemy.y + nearestEnemy.vy * 4,
                    allCars, arena, AI_DIFFICULTY_PROFILES.hard
                );
            }

            // 2. ENEMY NEARBY SIGNAL (440..840 units): Patrol around player as a warning signal!
            if (nearestEnemy && minEnemyDist < 840 && distToLeader < 650) {
                if (!leader.lastAlertTime || performance.now() - leader.lastAlertTime > 4500) {
                    leader.lastAlertTime = performance.now();
                    Game.floatingTexts.push({
                        x: leader.x, y: leader.y - 54,
                        text: "BOTS PATROLLING: ENEMY NEARBY!",
                        color: "#fbbf24", life: 1.25
                    });
                }
                const orbitAng = performance.now() * 0.0032 + (idx * (Math.PI * 2 / Math.max(1, myGuards.length)));
                const px = Math.max(120, Math.min(arena.width - 120, leader.x + Math.cos(orbitAng) * 165));
                const py = Math.max(this.roadTop + 60, Math.min(this.roadBottom - 60, leader.y + Math.sin(orbitAng) * 145));
                return guard.aiBrain.steerTowardPoint(px, py, allCars, arena, AI_DIFFICULTY_PROFILES.hard);
            }

            // 3. SAFE STANDBY OR NATURAL CATCH-UP DRIVE (Zero Teleportation!)
            const distToSlot = Math.hypot(slotX - guard.x, slotY - guard.y);
            const leaderSpd = Math.hypot(leader.vx, leader.vy);
            if (distToSlot < 58) {
                if (leaderSpd < 0.85) {
                    guard.vx *= 0.78;
                    guard.vy *= 0.78;
                    const angleDiff = guard.aiBrain.normalizeAngle(leader.angle - guard.angle);
                    guard.angle += angleDiff * 0.15;
                    return { up: false, down: false, steer: 0, drift: true, throttle: 0 };
                }
                const angleDiff = guard.aiBrain.normalizeAngle(leader.angle - guard.angle);
                return {
                    up: true,
                    down: false,
                    steer: Math.max(-1, Math.min(1, angleDiff * 2.2)),
                    drift: false,
                    throttle: 0.94
                };
            }

            // If far behind the player, give a natural engine speed boost so it drives back smoothly
            if (distToSlot > 480) {
                guard.spec.maxSpeed = 13.6;
            } else {
                guard.spec.maxSpeed = 11.8;
            }
            return guard.aiBrain.steerTowardPoint(slotX, slotY, allCars, arena, AI_DIFFICULTY_PROFILES.hard);
        };
    },

    decoratePlayerCar(car, abilityId, keyHint) {
        car.primaryAbility = abilityId;
        // Starts at 100% (1 full charge ready), and can charge up to 200% (2 stacked charges)!
        car.abilityCharge = 100;
        car.abilityKeyHint = keyHint;
        car.lastDamageTracked = 0;
        car.botFormation = 0;

        const baseDraw = car.draw.bind(car);
        car.draw = (ctx, showIndicator = true) => {
            baseDraw(ctx, showIndicator);
            if (showIndicator && !car.dead && MatchConfig.mode === "story") {
                ctx.save();
                ctx.translate(car.x, car.y - car.radius - 28);
                const bw = 88;
                const charge = Math.max(0, Math.min(200, car.abilityCharge || 0));
                const bar1 = Math.min(1, charge / 100);
                const bar2 = Math.max(0, (charge - 100) / 100);
                ctx.fillStyle = "rgba(9, 13, 22, 0.92)";
                ctx.fillRect(-bw / 2, 14, bw, 6);
                ctx.fillStyle = bar1 >= 1 ? "#00e676" : "#38bdf8";
                ctx.fillRect(-bw / 2 + 1, 15, ((bw - 4) / 2) * bar1, 4);
                ctx.fillStyle = bar2 >= 1 ? "#fbbf24" : "#38bdf8";
                ctx.fillRect(1, 15, ((bw - 4) / 2) * bar2, 4);
                ctx.restore();
            }
        };
    },

    showRadioComms(speaker, text, color = "#38bdf8", durationFrames = 260) {
        this.commsSpeaker = speaker;
        this.commsText = text;
        this.commsColor = color;
        this.commsTimer = durationFrames;
    },

    triggerPrimaryAbility(car) {
        if (!car || car.dead) return;
        if ((car.abilityCharge || 0) < 100) {
            if (!car.isAI) {
                Game.floatingTexts.push({
                    x: car.x, y: car.y - 38,
                    text: `CHARGING (${Math.floor(car.abilityCharge || 0)}% / 200%)`,
                    color: "#94a3b8", life: 0.85
                });
            }
            return;
        }

        const ab = car.primaryAbility || "summon_guard";

        if (ab === "summon_guard") {
            const myGuards = Game.cars.filter(c => c.isBodyguard && !c.dead && c.commander === car);
            if (myGuards.length >= this.maxBodyguards) {
                Game.floatingTexts.push({
                    x: car.x, y: car.y - 42,
                    text: "MAX 4 SUPPORT BOTS ACTIVE! (CHARGE SAVED)", color: "#fbbf24", life: 1.25
                });
                return;
            }
            // Spend 100% per bot! If at 200%, you can press twice to deploy 2 bots!
            car.abilityCharge = Math.max(0, (car.abilityCharge || 0) - 100);
            this.summonBodyguard(car);
            return;
        }

        car.abilityCharge = Math.max(0, (car.abilityCharge || 0) - 100);

        if (ab === "group_heal") {
            SoundEngine.playPowerupPickup(true, false);
            Game.cars.filter(c => c.team === "ALLIES" && !c.dead).forEach(ally => {
                ally.hp = Math.min(ally.maxHp, ally.hp + 85);
                ally.dentFront *= 0.35; ally.dentRear *= 0.35;
                ally.dentLeft *= 0.35;  ally.dentRight *= 0.35;
                Game.shockwaves.push({ x: ally.x, y: ally.y, r: 10, maxR: 135, alpha: 0.95, color: "#00e676" });
            });
            Game.floatingTexts.push({
                x: car.x, y: car.y - 42,
                text: `${car.label}: +85 HP SQUAD REPAIR!`, color: "#00e676", life: 1.35
            });
            return;
        }

        const spec = POWERUP_CATALOG.find(p => p.id === ab) || POWERUP_CATALOG[2];
        SoundEngine.playPowerupPickup(false, false);
        car.activePowerup = spec.id;
        car.powerupTimer = 540;
        car.powerupMaxTimer = 540;
        car.powerupMeta = spec;
        Game.shockwaves.push({ x: car.x, y: car.y, r: 12, maxR: 145, alpha: 1.0, color: spec.ringColor });
        Game.floatingTexts.push({
            x: car.x, y: car.y - 42,
            text: `${car.label}: ${spec.shortTag}`,
            color: spec.ringColor, life: 1.4
        });
    },

    summonBodyguard(ownerCar) {
        const myGuards = Game.cars.filter(c => c.isBodyguard && !c.dead && c.commander === ownerCar);
        if (myGuards.length >= this.maxBodyguards) return;

        const guardNum = myGuards.length + 1;
        const formSpec = this.formationSpecs[ownerCar.botFormation || 0] || this.formationSpecs[0];
        const slot = formSpec.slots[(guardNum - 1) % formSpec.slots.length];
        const fx = Math.cos(ownerCar.angle), fy = Math.sin(ownerCar.angle);
        const rx = -fy, ry = fx;
        const gx = Math.max(140, Math.min(Game.arena.width - 140, ownerCar.x + fx * slot.fwd + rx * slot.side));
        const gy = Math.max(this.roadTop + 70, Math.min(this.roadBottom - 70, ownerCar.y + fy * slot.fwd + ry * slot.side));

        const guard = new BattleCar({
            id: this.nextEntityId++,
            label: `${ownerCar.playerSlot === "p2" ? "P2" : "P1"} BOT ${guardNum}`,
            team: "ALLIES",
            isAI: true,
            colorKey: ownerCar.colorKey,
            x: gx, y: gy, angle: ownerCar.angle
        });
        guard.isBodyguard = true;
        guard.commander = ownerCar;
        // Balanced 155 HP so strong enemies & bosses can destroy support bots if overwhelmed!
        guard.maxHp = 155;
        guard.hp = 155;
        guard.spawnShieldTimer = 80;
        this.attachCommandoEscortBrain(guard, ownerCar);

        Game.cars.push(guard);
        SoundEngine.playPowerupPickup(true, false);
        Game.shockwaves.push({ x: gx, y: gy, r: 10, maxR: 130, alpha: 0.95, color: guard.lightColor });
        Game.floatingTexts.push({
            x: gx, y: gy - 38,
            text: `${guard.label} DEPLOYED (${guardNum}/4)!`,
            color: guard.lightColor, life: 1.3
        });
    },

    spawnStageEnemies(stageIdx, cars) {
        const stages = this.getActiveStages();
        const st = stages[stageIdx];
        if (!st) return;
        this.stageCleared = false;

        if (st.hasKeyFlag) {
            this.stageFlag = {
                homeX: st.flagX,
                homeY: st.flagY,
                x: st.flagX,
                y: st.flagY,
                terminalX: st.xEnd - 220,
                terminalY: 1500,
                state: "AT_POST",
                carrier: null
            };
        } else {
            this.stageFlag = null;
        }

        st.enemies.forEach((def) => {
            const bot = this.createStoryEnemyCar(def, false);
            cars.push(bot);
        });

        if (st.boss) {
            const bossCar = this.createStoryEnemyCar(st.boss, true);
            cars.push(bossCar);
        }
    },

    createStoryEnemyCar(def, isBoss) {
        const isTruck = def.chassis === "zombie_truck";
        const isRig = def.chassis === "warrig";
        const isBoat = def.chassis === "gunboat";
        const scale = def.scale || (isBoat ? 1.28 : (isRig ? 1.25 : (isTruck ? 1.20 : (def.chassis === "buggy" ? 0.94 : 1.08))));

        const car = new BattleCar({
            id: this.nextEntityId++,
            label: def.label,
            team: "ENEMIES",
            isAI: true,
            colorKey: def.color || "red",
            x: def.x, y: def.y, angle: Math.PI
        });

        car.storyChassis = def.chassis || "zombie_truck";
        car.isStoryBoss = !!isBoss;
        car.isFinalBoss = !!def.isFinalBoss;
        car.dropsCrate = !!def.dropsCrate;
        car.homeX = def.x;
        car.homeY = def.y;
        car.actRange = def.actRange || 740;
        car.activated = false;
        car.bossEnraged = false;
        car.bossPulseTimer = 185;
        car.length = Math.round(82 * scale);
        car.width = Math.round(44 * scale);
        car.radius = 34.5 * scale;
        car.mass = isBoss ? 2.15 : (isBoat ? 1.55 : (isRig ? 1.50 : (isTruck ? 1.35 : 1.0)));
        car.maxHp = def.hp || 240;
        car.hp = car.maxHp;

        // Balanced Enemy Speeds (Slightly below Player 11.8 so they do not unfairly cut you off, but strong in packs!)
        car.spec = Object.assign({}, VEHICLE_ARCHETYPES.classic, {
            maxSpeed: def.isFinalBoss ? 10.6 : (isBoss ? 10.2 : (def.chassis === "buggy" ? 10.4 : 9.6)),
            accel: def.isFinalBoss ? 0.43 : (isBoss ? 0.40 : 0.37),
            steerRate: 0.064
        });

        // PERMANENT AGGRO AI: Waits at post until you enter range (or attack a nearby ally), then pursues you ANYWHERE!
        const origUpdate = car.aiBrain.update.bind(car.aiBrain);
        car.aiBrain.update = (allCars, arena, dt) => {
            if (car.dead) return { up: false, down: false, steer: 0, drift: false, throttle: 0 };
            const allies = allCars.filter(c => !c.dead && c.team === "ALLIES");
            let minAllyDist = Infinity;
            for (const a of allies) {
                const d = Math.hypot(a.x - car.x, a.y - car.y);
                if (d < minAllyDist) minAllyDist = d;
            }

            // Trigger permanent aggro if player enters range, damages this car, or triggers a squadmate within 460 units
            if (!car.activated) {
                if (minAllyDist <= car.actRange || car.hp < car.maxHp * 0.99) {
                    car.activated = true;
                } else {
                    const squadMateActive = allCars.some(other => other.team === "ENEMIES" && !other.dead && other.activated && Math.hypot(other.x - car.x, other.y - car.y) < 460);
                    if (squadMateActive) car.activated = true;
                }
            }

            if (!car.activated) {
                const distFromHome = Math.hypot(car.x - car.homeX, car.y - car.homeY);
                if (distFromHome > 75) {
                    return car.aiBrain.steerTowardPoint(car.homeX, car.homeY, allCars, arena, AI_DIFFICULTY_PROFILES.normal);
                }
                car.vx *= 0.82;
                car.vy *= 0.82;
                return { up: false, down: false, steer: 0, drift: true, throttle: 0 };
            }

            // Once activated, use Hard AI targeting to relentlessly fight Players & Support Bots across the entire stage!
            return origUpdate(allCars, arena, dt);
        };

        car.draw = (ctx, showIndicator = true) => {
            this.drawCustomEnemyCar(ctx, car, showIndicator);
        };

        return car;
    },

    drawCustomEnemyCar(ctx, car, showIndicator) {
        ctx.save();
        ctx.translate(car.x, car.y);
        const L = car.length, W = car.width;
        const hpRatio = Math.max(0, car.hp / car.maxHp);
        const now = performance.now();

        if (!car.dead && car.isStoryBoss) {
            ctx.save();
            ctx.strokeStyle = car.isFinalBoss ? "#ff1e42" : "#fbbf24";
            ctx.fillStyle = car.isFinalBoss ? "rgba(255, 30, 66, 0.18)" : "rgba(245, 158, 11, 0.14)";
            ctx.lineWidth = 4.5;
            ctx.setLineDash([14, 8]);
            ctx.beginPath();
            ctx.arc(0, 0, car.radius + 18, now * 0.005, now * 0.005 + Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        ctx.rotate(car.angle);

        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.beginPath();
        ctx.roundRect(-L / 2 - 4, -W / 2 + 4, L + 8, W - 2, 8);
        ctx.fill();

        if (car.storyChassis === "gunboat") {
            if (!car.dead) {
                ctx.strokeStyle = "rgba(186, 230, 253, 0.55)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-L * 0.48, -W * 0.35);
                ctx.lineTo(-L * 0.72, -W * 0.65);
                ctx.moveTo(-L * 0.48, W * 0.35);
                ctx.lineTo(-L * 0.72, W * 0.65);
                ctx.stroke();
            }

            ctx.fillStyle = car.dead ? "#27272a" : "#1e293b";
            ctx.strokeStyle = car.isStoryBoss ? "#fbbf24" : "#38bdf8";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-L * 0.48, -W * 0.44);
            ctx.lineTo(L * 0.18, -W * 0.46);
            ctx.lineTo(L * 0.56, 0);
            ctx.lineTo(L * 0.18, W * 0.46);
            ctx.lineTo(-L * 0.48, W * 0.44);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = car.dead ? "#3f3f46" : car.mainColor;
            ctx.beginPath();
            ctx.moveTo(-L * 0.38, -W * 0.32);
            ctx.lineTo(L * 0.14, -W * 0.32);
            ctx.lineTo(L * 0.38, 0);
            ctx.lineTo(L * 0.14, W * 0.32);
            ctx.lineTo(-L * 0.38, W * 0.32);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#090d16";
            ctx.beginPath();
            ctx.arc(-L * 0.05, 0, W * 0.26, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(0, -6, L * 0.36, 4);
            ctx.fillRect(0, 2, L * 0.36, 4);
        } else {
            const isMultiAxle = (car.storyChassis === "zombie_truck" || car.storyChassis === "warrig" || car.isStoryBoss);
            const wheelX = isMultiAxle ? [L * 0.31, -L * 0.08, -L * 0.33] : [L * 0.28, -L * 0.28];
            wheelX.forEach((wx) => {
                [-W * 0.52, W * 0.52].forEach(wy => {
                    ctx.fillStyle = "#090d16";
                    ctx.beginPath();
                    ctx.roundRect(wx - 11, wy - 6.5, 22, 13, 3);
                    ctx.fill();
                    ctx.fillStyle = car.isStoryBoss ? "#fbbf24" : "#64748b";
                    ctx.fillRect(wx - 5, wy - 2, 10, 4);
                });
            });

            if (car.storyChassis === "zombie_truck") {
                ctx.fillStyle = car.dead ? "#27272a" : "#1e293b";
                ctx.strokeStyle = "#090d16";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(-L * 0.48, -W * 0.45, L * 0.58, W * 0.90, 4);
                ctx.fill();
                ctx.stroke();

                if (!car.dead) {
                    ctx.fillStyle = "#84cc16";
                    ctx.fillRect(-L * 0.42, -W * 0.36, L * 0.44, 6);
                    ctx.fillRect(-L * 0.42, W * 0.36 - 6, L * 0.44, 6);
                }

                ctx.fillStyle = car.dead ? "#3f3f46" : car.mainColor;
                ctx.beginPath();
                ctx.roundRect(L * 0.06, -W * 0.42, L * 0.38, W * 0.84, 5);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#090d16";
                ctx.fillRect(L * 0.16, -W * 0.34, L * 0.14, W * 0.68);

                ctx.fillStyle = "#cbd5e1";
                ctx.strokeStyle = "#090d16";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(L * 0.42, -W * 0.48);
                ctx.lineTo(L * 0.58, 0);
                ctx.lineTo(L * 0.42, W * 0.48);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (car.storyChassis === "warrig" || car.isStoryBoss) {
                const grad = ctx.createLinearGradient(-L / 2, -W / 2, L / 2, W / 2);
                grad.addColorStop(0, "#090d16");
                grad.addColorStop(0.5, car.mainColor);
                grad.addColorStop(1, car.darkColor);
                ctx.fillStyle = car.dead ? "#27272a" : grad;
                ctx.strokeStyle = car.isStoryBoss ? "#fbbf24" : "#090d16";
                ctx.lineWidth = car.isStoryBoss ? 3.5 : 2.5;
                ctx.beginPath();
                ctx.roundRect(-L * 0.48, -W * 0.46, L * 0.92, W * 0.92, 6);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-L * 0.34, -W * 0.34, L * 0.54, W * 0.68);
                if (!car.dead) {
                    ctx.fillStyle = car.isFinalBoss ? "#ff1e42" : (car.isStoryBoss ? "#fbbf24" : "#38bdf8");
                    ctx.beginPath();
                    ctx.arc(-L * 0.06, 0, W * 0.24, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = car.isStoryBoss ? "#fbbf24" : "#e2e8f0";
                ctx.strokeStyle = "#090d16";
                ctx.lineWidth = 2;
                for (let s = -2; s <= 2; s++) {
                    const sy = s * (W * 0.19);
                    ctx.beginPath();
                    ctx.moveTo(L * 0.44, sy - 6);
                    ctx.lineTo(L * 0.62, sy);
                    ctx.lineTo(L * 0.44, sy + 6);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            } else {
                ctx.fillStyle = car.dead ? "#27272a" : car.darkColor;
                ctx.strokeStyle = "#090d16";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-L * 0.45, -W * 0.38);
                ctx.lineTo(L * 0.18, -W * 0.42);
                ctx.lineTo(L * 0.50, 0);
                ctx.lineTo(L * 0.18, W * 0.42);
                ctx.lineTo(-L * 0.45, W * 0.38);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = car.dead ? "#52525b" : "#84cc16";
                ctx.lineWidth = 3;
                ctx.strokeRect(-L * 0.28, -W * 0.28, L * 0.46, W * 0.56);
            }
        }

        ctx.restore();

        if (showIndicator && !car.dead) {
            ctx.save();
            ctx.translate(car.x, car.y - car.radius - (car.isStoryBoss ? 38 : 26));
            const bw = car.isFinalBoss ? 156 : (car.isStoryBoss ? 128 : 80);
            const bh = car.isStoryBoss ? 13 : 9;

            ctx.font = car.isStoryBoss ? "900 14px Segoe UI, sans-serif" : "800 11.5px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            const txt = `${car.label} (${Math.ceil(car.hp)})`;
            ctx.strokeText(txt, 0, -5);
            ctx.fillStyle = car.isStoryBoss ? "#fde047" : "#f87171";
            ctx.fillText(txt, 0, -5);

            ctx.fillStyle = "rgba(9, 13, 22, 0.92)";
            ctx.strokeStyle = car.isStoryBoss ? "#fbbf24" : "#f87171";
            ctx.lineWidth = car.isStoryBoss ? 2.2 : 1.3;
            ctx.beginPath();
            ctx.roundRect(-bw / 2, 1, bw, bh, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = car.isFinalBoss ? "#ff1e42" : (car.isStoryBoss ? "#f59e0b" : "#ef4444");
            const fillW = Math.max(0, (bw - 4) * hpRatio);
            if (fillW > 0) {
                ctx.beginPath();
                ctx.roundRect(-bw / 2 + 2, 3, fillW, bh - 4, 2.5);
                ctx.fill();
            }
            ctx.restore();
        }
    },

    updateStoryBanner(stageIdx) {
        const stages = this.getActiveStages();
        const st = stages[stageIdx];
        if (!st) return;
        const pill = document.getElementById("hud-mode-pill");
        if (pill) pill.textContent = `[BETA] ${st.name}`;
        if (typeof KillAnnouncer !== "undefined") {
            KillAnnouncer.showBanner(st.name, st.sub, "#38bdf8", 135);
        }
        this.showRadioComms(st.radioSpeaker, st.radioMsg, stageIdx === 4 ? "#ff4d6d" : "#38bdf8", 320);
    },

    enforceWorldCollisions(cars, dt) {
        for (const obs of this.obstacles) {
            for (const car of cars) {
                const dx = car.x - obs.x, dy = car.y - obs.y;
                const dist = Math.hypot(dx, dy);
                const minDist = car.radius + obs.r * 0.90;
                if (dist < minDist && dist > 0.001) {
                    const nx = dx / dist, ny = dy / dist;
                    car.x += nx * (minDist - dist + 1.5);
                    car.y += ny * (minDist - dist + 1.5);
                    const dot = car.vx * nx + car.vy * ny;
                    if (dot < 0) {
                        car.vx -= 1.35 * dot * nx;
                        car.vy -= 1.35 * dot * ny;
                    }
                }
            }
        }

        // Stage 3 Central Suspension Bridge / Sea Causeway (x: 8800 to 10150, y: 820 to 2180)
        for (const car of cars) {
            if (car.x > 8800 && car.x < 10150) {
                if (car.y < 820 + car.radius) {
                    car.y = 820 + car.radius;
                    car.vy = Math.abs(car.vy) * 0.5;
                } else if (car.y > 2180 - car.radius) {
                    car.y = 2180 - car.radius;
                    car.vy = -Math.abs(car.vy) * 0.5;
                }
            } else if (car.x > 8740 && car.x <= 8800 && (car.y < 820 || car.y > 2180)) {
                car.x = 8740;
                car.vx = -Math.abs(car.vx) * 0.5;
            } else if (car.x >= 10150 && car.x < 10210 && (car.y < 820 || car.y > 2180)) {
                car.x = 10210;
                car.vx = Math.abs(car.vx) * 0.5;
            }
        }

        for (const gate of this.gates) {
            if (gate.isOpen) {
                gate.openProgress = Math.min(1, gate.openProgress + 0.03 * dt);
            }
            const gateX = gate.x;
            for (const car of cars) {
                if (Math.abs(car.x - gateX) < car.radius + 32) {
                    const inHighwayGateway = (car.y >= this.roadTop + 20 && car.y <= this.roadBottom - 20);
                    if (gate.isOpen && inHighwayGateway) continue;
                    if (car.x < gateX) {
                        car.x = gateX - car.radius - 32;
                        car.vx = -Math.abs(car.vx) * 0.55;
                    } else {
                        car.x = gateX + car.radius + 32;
                        car.vx = Math.abs(car.vx) * 0.55;
                    }
                }
            }
        }

        if (this.cageIntact && this.captiveCar) {
            const cx = this.captiveCar.x, cy = this.captiveCar.y, cageR = 96;
            for (const car of cars) {
                if (car === this.captiveCar) continue;
                const dx = car.x - cx, dy = car.y - cy;
                const dist = Math.hypot(dx, dy);
                if (dist < car.radius + cageR && dist > 0.001) {
                    const nx = dx / dist, ny = dy / dist;
                    car.x = cx + nx * (car.radius + cageR);
                    car.y = cy + ny * (car.radius + cageR);
                }
            }
        }
    },

    updateGateKeyFlag(humanCars) {
        if (!this.stageFlag || this.stageFlag.state === "UNLOCKED") return;
        const f = this.stageFlag;

        if (f.state === "AT_POST") {
            for (const p of humanCars) {
                if (p.dead) continue;
                if (Math.hypot(p.x - f.x, p.y - f.y) <= p.radius + 75) {
                    f.state = "CARRIED";
                    f.carrier = p;
                    SoundEngine.playPowerupPickup(false, false);
                    Game.shockwaves.push({ x: f.x, y: f.y, r: 10, maxR: 135, alpha: 1, color: "#fbbf24" });
                    Game.floatingTexts.push({
                        x: p.x, y: p.y - 46,
                        text: "GATE KEY FLAG TAKEN! DELIVER TO GATE TERMINAL!",
                        color: "#fbbf24", life: 1.55
                    });
                    break;
                }
            }
        } else if (f.state === "CARRIED") {
            if (!f.carrier || f.carrier.dead) {
                f.state = "AT_POST";
                f.carrier = null;
                Game.floatingTexts.push({
                    x: f.x, y: f.y - 40,
                    text: "KEY FLAG DROPPED!",
                    color: "#ff4d6d", life: 1.3
                });
                return;
            }
            f.x = f.carrier.x;
            f.y = f.carrier.y;
            if (Math.hypot(f.carrier.x - f.terminalX, f.carrier.y - f.terminalY) <= f.carrier.radius + 115) {
                f.state = "UNLOCKED";
                f.carrier = null;
                f.x = f.terminalX;
                f.y = f.terminalY;
                SoundEngine.playPowerupPickup(true, false);
                Game.shockwaves.push({ x: f.terminalX, y: f.terminalY, r: 12, maxR: 165, alpha: 1, color: "#00e676" });
                Game.floatingTexts.push({
                    x: f.terminalX, y: f.terminalY - 48,
                    text: "KEY FLAG DELIVERED TO GATE TERMINAL!",
                    color: "#00e676", life: 1.6
                });
            }
        }
    },

    updateCutscene(cars, dt) {
        if (this.cutsceneMode === "INTRO") {
            InputManager.gameplayActive = false;
            this.cutsceneTimer -= dt;
            const allies = cars.filter(c => c.team === "ALLIES" && !c.isCaptiveFriend);
            allies.forEach(c => {
                if (this.cutsceneTimer > 110 && c.x < 480) {
                    c.vx = 4.2;
                    c.vy = 0;
                    c.angle = 0;
                    c.isAccelerating = true;
                } else {
                    c.vx *= 0.82;
                    c.vy *= 0.82;
                    c.isAccelerating = false;
                }
            });
            if (this.cutsceneTimer <= 0) {
                this.cutsceneMode = null;
                InputManager.gameplayActive = true;
                this.updateStoryBanner(0);
            }
            return null;
        }

        if (this.cutsceneMode === "EP2_EXTRACTION") {
            InputManager.gameplayActive = false;
            this.cutsceneTimer -= dt;
            const humanCars = cars.filter(c => !c.isAI);
            humanCars.forEach(p => { p.vx *= 0.85; p.vy *= 0.85; p.isAccelerating = false; });

            // Phase 1 (360..180): Allied Extraction Cars drive in from east to meet Viper
            if (this.cutsceneTimer > 180) {
                this.extractionCars.forEach(ec => {
                    if (ec.x > 18150) {
                        ec.x -= 5.2 * dt;
                        ec.angle = Math.PI;
                        ec.isAccelerating = true;
                    } else {
                        ec.isAccelerating = false;
                    }
                });
                if (this.viperCompanion) {
                    const dx = 18020 - this.viperCompanion.x;
                    const dy = 1500 - this.viperCompanion.y;
                    this.viperCompanion.angle = Math.atan2(dy, dx);
                    if (Math.hypot(dx, dy) > 40) {
                        this.viperCompanion.x += Math.cos(this.viperCompanion.angle) * 4.5 * dt;
                        this.viperCompanion.y += Math.sin(this.viperCompanion.angle) * 4.5 * dt;
                    }
                }
            } else {
                // Phase 2 (180..0): Viper and the Allied Extraction Cars turn east and drive away together!
                if (this.cutsceneTimer > 170 && this.cutsceneTimer <= 178) {
                    this.showRadioComms(
                        "VIPER [EXTRACTION COMPLETE]",
                        "THANKS FOR SAVING MY LIFE, BROTHER! I AM HEADING HOME WITH THE ALLIED CONVOY! FAREWELL!",
                        "#00e676", 175
                    );
                }
                if (this.viperCompanion) {
                    this.viperCompanion.angle = 0;
                    this.viperCompanion.x += 6.5 * dt;
                    this.viperCompanion.isAccelerating = true;
                }
                this.extractionCars.forEach(ec => {
                    ec.angle = 0;
                    ec.x += 6.5 * dt;
                    ec.isAccelerating = true;
                });
            }

            if (this.cutsceneTimer <= 0) {
                this.cutsceneMode = null;
                return {
                    badge: "STORY CAMPAIGN COMPLETE - VIPER EXTRACTED",
                    title: "EPISODE 2 VICTORY!",
                    subtitle: "You escorted Viper across all 5 coastal stages and handed him safely to the Allied Extraction Convoy!",
                    color: "#00e676"
                };
            }
            return null;
        }
        return null;
    },

    checkResult(cars, dt) {
        if (KillAnnouncer.slowMoActive) return null;

        if (this.commsTimer > 0) this.commsTimer -= dt;

        if (typeof ArenaHazards !== "undefined") {
            ArenaHazards.powerups = [];
            ArenaHazards.dropTimerFrames = 999999;
        }

        this.enforceWorldCollisions(cars, dt);

        if (this.cutsceneMode) {
            return this.updateCutscene(cars, dt);
        }

        const stages = this.getActiveStages();
        const humanCars = cars.filter(c => !c.isAI);

        // 1. BALANCED 200% ABILITY CHARGE BANK (~18s per 100%, stops at 200% until spent!)
        humanCars.forEach(p => {
            if (p.dead) return;
            const dmgDelta = Math.max(0, (p.damageDealt || 0) - (p.lastDamageTracked || 0));
            p.lastDamageTracked = p.damageDealt || 0;
            if ((p.abilityCharge || 0) < 200) {
                p.abilityCharge = Math.min(200, (p.abilityCharge || 0) + 0.092 * dt + dmgDelta * 0.18);
            }
        });

        if (this.soloCompanion && !this.soloCompanion.dead) {
            this.soloCompanion.hp = Math.min(this.soloCompanion.maxHp, this.soloCompanion.hp + 0.025 * dt);
            this.soloCompanion.abilityCharge = Math.min(100, (this.soloCompanion.abilityCharge || 0) + 0.09 * dt);
            if (this.soloCompanion.abilityCharge >= 100) {
                const enemiesNear = cars.some(c => c.team === "ENEMIES" && !c.dead && Math.hypot(c.x - this.soloCompanion.x, c.y - this.soloCompanion.y) < 620);
                const playerNeedsHeal = humanCars.some(p => !p.dead && p.hp < p.maxHp * 0.75);
                if (this.soloCompanion.primaryAbility === "group_heal" && playerNeedsHeal) {
                    this.triggerPrimaryAbility(this.soloCompanion);
                } else if (this.soloCompanion.primaryAbility !== "group_heal" && enemiesNear) {
                    this.triggerPrimaryAbility(this.soloCompanion);
                }
            }
        }

        if (this.viperCompanion && !this.viperCompanion.dead) {
            this.viperCompanion.hp = Math.min(this.viperCompanion.maxHp, this.viperCompanion.hp + 0.05 * dt);
        }

        this.updateGateKeyFlag(humanCars);

        // 2. Boss Enrage & Heavy Shockwave Attacks
        const activeBoss = cars.find(c => c.isStoryBoss && !c.dead);
        if (activeBoss) {
            if (!activeBoss.bossEnraged && activeBoss.hp <= activeBoss.maxHp * 0.52) {
                activeBoss.bossEnraged = true;
                this.showRadioComms("BOSS ENRAGED!", "Heavy Reinforcements deployed! Watch your support bots!", "#ff1e42", 220);
                SoundEngine.playExplosion();
                [1220, 1780].forEach((sy, idx) => {
                    const zTruck = this.createStoryEnemyCar({
                        chassis: this.episode === 2 ? "gunboat" : "zombie_truck",
                        label: `BOSS REINFORCEMENT ${idx + 1}`,
                        hp: 290, x: activeBoss.x - 220, y: sy, color: "green", actRange: 2000, dropsCrate: idx === 0
                    }, false);
                    zTruck.activated = true;
                    cars.push(zTruck);
                    Game.shockwaves.push({ x: zTruck.x, y: zTruck.y, r: 10, maxR: 150, alpha: 1, color: "#84cc16" });
                });
            }

            activeBoss.bossPulseTimer -= dt;
            if (activeBoss.bossPulseTimer <= 0) {
                activeBoss.bossPulseTimer = activeBoss.isFinalBoss ? 175 : 225;
                Game.shockwaves.push({ x: activeBoss.x, y: activeBoss.y, r: 20, maxR: 255, alpha: 0.95, color: "#ff1e42" });
                Game.spawnSparks(activeBoss.x, activeBoss.y, 26);
                cars.filter(c => c.team === "ALLIES" && !c.dead).forEach(ally => {
                    const d = Math.hypot(ally.x - activeBoss.x, ally.y - activeBoss.y);
                    if (d < 250) {
                        const pulseDmg = activeBoss.isFinalBoss ? 28 : 20;
                        ally.applyDirectionalDamage(pulseDmg, "FRONT", ally.x, ally.y, activeBoss);
                        const ang = Math.atan2(ally.y - activeBoss.y, ally.x - activeBoss.x);
                        ally.vx += Math.cos(ang) * 9.5;
                        ally.vy += Math.sin(ang) * 9.5;
                    }
                });
            }
        }

        // 3. Health Crates & Extra Lives
        cars.filter(c => c.team === "ENEMIES" && c.dead && !c.lootHandled).forEach(deadEnemy => {
            deadEnemy.lootHandled = true;
            this.killCounterForLife += 1;

            if (this.killCounterForLife >= 5) {
                this.killCounterForLife = 0;
                this.lives += 1;
                SoundEngine.playPowerupPickup(true, false);
                Game.floatingTexts.push({
                    x: deadEnemy.x, y: deadEnemy.y - 68,
                    text: "+1 EXTRA LIFE EARNED!",
                    color: "#38bdf8", life: 1.65
                });
            }

            if (deadEnemy.dropsCrate || deadEnemy.isStoryBoss) {
                this.repairCrates.push({
                    x: deadEnemy.x,
                    y: Math.max(this.roadTop + 80, Math.min(this.roadBottom - 80, deadEnemy.y)),
                    r: 38,
                    healAmount: 75
                });
                Game.floatingTexts.push({
                    x: deadEnemy.x, y: deadEnemy.y - 42,
                    text: "HEALTH CRATE DROPPED (+75 HP)!",
                    color: "#00e676", life: 1.4
                });
            }
        });

        for (let i = this.repairCrates.length - 1; i >= 0; i--) {
            const crate = this.repairCrates[i];
            for (const p of humanCars) {
                if (p.dead) continue;
                if (Math.hypot(p.x - crate.x, p.y - crate.y) < p.radius + crate.r) {
                    p.hp = Math.min(p.maxHp, p.hp + crate.healAmount);
                    p.dentFront *= 0.4; p.dentRear *= 0.4;
                    SoundEngine.playPowerupPickup(true, false);
                    Game.shockwaves.push({ x: crate.x, y: crate.y, r: 10, maxR: 120, alpha: 1, color: "#00e676" });
                    Game.floatingTexts.push({
                        x: p.x, y: p.y - 40,
                        text: `+${crate.healAmount} HP FIELD REPAIR!`,
                        color: "#00e676", life: 1.35
                    });
                    this.repairCrates.splice(i, 1);
                    break;
                }
            }
        }

        for (const p of humanCars) {
            if (p.dead) {
                if (!p.lifeDeducted) {
                    p.lifeDeducted = true;
                    if (this.lives > 0) {
                        this.lives -= 1;
                        p.respawnTimer = 130;
                        if (typeof KillAnnouncer !== "undefined") {
                            KillAnnouncer.showBanner(
                                "CHECKPOINT RESPAWN!",
                                `${p.label} used 1 Life (${this.lives} Remaining)`,
                                "#fbbf24", 90
                            );
                        }
                    }
                } else if (p.respawnTimer > 0) {
                    p.respawnTimer -= dt;
                    if (p.respawnTimer <= 0) {
                        const st = stages[this.currentStage] || stages[0];
                        const savedAbility = p.primaryAbility;
                        const savedHint = p.abilityKeyHint;
                        const savedForm = p.botFormation || 0;
                        const savedCharge = Math.max(100, p.abilityCharge || 100);
                        p.reset(false);
                        p.x = st.checkpointX;
                        p.y = st.checkpointY + (p.playerSlot === "p2" ? 140 : 0);
                        p.angle = 0;
                        p.spawnShieldTimer = 160;
                        p.lifeDeducted = false;
                        this.decoratePlayerCar(p, savedAbility, savedHint);
                        p.botFormation = savedForm;
                        p.abilityCharge = savedCharge;
                        p.lastDamageTracked = p.damageDealt || 0;
                        SoundEngine.playPowerupPickup(true, false);
                        Game.shockwaves.push({ x: p.x, y: p.y, r: 12, maxR: 150, alpha: 1.0, color: p.lightColor });
                    }
                }
            }
        }

        const anyHumanAliveOrRespawning = humanCars.some(p => !p.dead || p.respawnTimer > 0);
        if (!anyHumanAliveOrRespawning && this.lives <= 0) {
            return {
                badge: stages[this.currentStage].name,
                title: "MISSION FAILED!",
                subtitle: `You ran out of Lives on ${stages[this.currentStage].name}.`,
                color: "#ff4d6d"
            };
        }

        // 4. Check Stage Clear (Requires all stage enemies defeated + Gate Key Flag unlocked if stage has one!)
        const aliveEnemies = cars.filter(c => c.team === "ENEMIES" && !c.dead);
        const flagDone = (!this.stageFlag || this.stageFlag.state === "UNLOCKED");

        if (aliveEnemies.length === 0 && flagDone && !this.stageCleared) {
            if (this.currentStage < stages.length - 1) {
                this.stageCleared = true;
                const gate = this.gates[this.currentStage];
                if (gate) gate.isOpen = true;
                this.lives += 1;
                SoundEngine.playPowerupPickup(true, false);
                cars.filter(c => c.team === "ALLIES" && !c.dead).forEach(ally => {
                    ally.hp = Math.min(ally.maxHp, ally.hp + 90);
                });
                if (typeof KillAnnouncer !== "undefined") {
                    KillAnnouncer.playFanfare(4);
                    KillAnnouncer.showBanner(
                        `STAGE ${this.currentStage + 1} CLEARED! (+1 LIFE & GATE OPEN)`,
                        "Follow the Green >>> Arrows on the Highway to the Next Stage!",
                        "#00e676", 150
                    );
                }
            } else if (this.episode === 2) {
                // EPISODE 2 STAGE 5 CLEARED -> Trigger Allied Extraction Convoy Cutscene!
                this.stageCleared = true;
                this.cutsceneMode = "EP2_EXTRACTION";
                this.cutsceneTimer = 360;
                this.extractionCars = [
                    new BattleCar({ id: 191, label: "ALLIED EXTRACTION 1", team: "ALLIES", isAI: true, colorKey: "blue",  x: 18920, y: 1380, angle: Math.PI }),
                    new BattleCar({ id: 192, label: "ALLIED EXTRACTION 2", team: "ALLIES", isAI: true, colorKey: "green", x: 18920, y: 1620, angle: Math.PI })
                ];
                this.extractionCars.forEach(ec => cars.push(ec));
                this.showRadioComms(
                    "ALLIED EXTRACTION CONVOY",
                    "Admiral Vane is down! We are pulling in from the East Highway to pick up Viper and take him home!",
                    "#38bdf8", 185
                );
                return null;
            }
        }

        // 5. EPISODE 1 STAGE 5 ENDING: Hold inside Viper Cage Zone for 6.0 seconds to unlock & destroy the cage!
        if (this.episode === 1 && this.currentStage === stages.length - 1 && aliveEnemies.length === 0) {
            if (this.cageIntact && this.captiveCar) {
                const cx = this.captiveCar.x, cy = this.captiveCar.y;
                const playerInZone = humanCars.some(p => !p.dead && Math.hypot(p.x - cx, p.y - cy) <= 230);
                if (playerInZone) {
                    this.cageUnlockProgress = Math.min(this.cageUnlockRequired, this.cageUnlockProgress + dt);
                    if (this.cageUnlockProgress >= this.cageUnlockRequired) {
                        this.cageIntact = false;
                        this.stageCleared = true;
                        this.postRescueFollowTimer = 260;
                        SoundEngine.playExplosion();
                        Game.shockwaves.push({ x: cx, y: cy, r: 20, maxR: 280, alpha: 1, color: "#00e676" });
                        Game.spawnSparks(cx, cy, 55);
                        // Attach Commando Escort Brain to Viper so he immediately follows behind Player 1 instead of running randomly!
                        const p1 = humanCars[0];
                        this.captiveCar.label = "VIPER [RESCUED FRIEND]";
                        this.captiveCar.commander = p1;
                        this.attachCommandoEscortBrain(this.captiveCar, p1, -150, 0);
                        if (!cars.includes(this.captiveCar)) {
                            cars.push(this.captiveCar);
                        }
                        try { localStorage.setItem("bc_ep1_viper_rescued", "true"); } catch (e) {}
                        this.showRadioComms(
                            "VIPER [RESCUED FRIEND]",
                            "THANKS FOR SAVING ME, BROTHER! The Cage is destroyed! I am following right behind you now!",
                            "#00e676", 250
                        );
                        if (typeof KillAnnouncer !== "undefined") {
                            KillAnnouncer.playFanfare(5);
                            KillAnnouncer.showBanner(
                                "CAGE DESTROYED! VIPER IS FOLLOWING YOU!",
                                "Viper has joined your formation! Prepare for Episode 2!",
                                "#00e676", 180
                            );
                        }
                    }
                } else {
                    this.cageUnlockProgress = Math.max(0, this.cageUnlockProgress - dt * 0.5);
                }
            } else if (!this.cageIntact && this.postRescueFollowTimer > 0) {
                this.postRescueFollowTimer -= dt;
                if (this.postRescueFollowTimer <= 0) {
                    MatchConfig.storyEpisode = 2;
                    return {
                        badge: "EPISODE 1 COMPLETE - VIPER RESCUED",
                        title: "VIPER SAVED! CONTINUE TO EPISODE 2!",
                        subtitle: "Viper is now following your lead! Click CONTINUE TO EPISODE 2 below to escort Viper to the Allied Extraction Convoy!",
                        color: "#00e676",
                        nextEpisodeAvailable: true
                    };
                }
            }
        }

        if (this.stageCleared && this.currentStage < stages.length - 1) {
            const nextStage = stages[this.currentStage + 1];
            const crossed = humanCars.some(p => !p.dead && p.x > nextStage.xStart + 200);
            if (crossed) {
                this.currentStage += 1;
                this.spawnStageEnemies(this.currentStage, cars);
                this.updateStoryBanner(this.currentStage);
            }
        }

        return null;
    },

    drawArenaGround(ctx, ar) {
        const H = ar.height;
        const rTop = this.roadTop, rBot = this.roadBottom, rH = rBot - rTop;
        const now = performance.now();
        const isEp2 = (this.episode === 2);

        // DISTINCT MAPS FOR EPISODE 1 (Scorched Wasteland) VS EPISODE 2 (Arctic Coastal Naval Highway)
        if (isEp2) {
            // EPISODE 2: ARCTIC SNOW & COASTAL HARBOR THEME
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(0, 0, 3800, H);
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(0, 0, 3800, 320);
            ctx.fillRect(0, H - 320, 3800, 320);

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(3800, 0, 3800, H);
            ctx.fillStyle = "rgba(14, 165, 233, 0.32)";
            ctx.fillRect(3950, 80, 3500, 400);
            ctx.fillRect(3950, H - 480, 3500, 400);

            ctx.fillStyle = "#082f49";
            ctx.fillRect(7600, 0, 3800, H);

            ctx.fillStyle = "#1e293b";
            ctx.fillRect(11400, 0, 3800, H);

            ctx.fillStyle = "#090d16";
            ctx.fillRect(15200, 0, 3800, H);
        } else {
            // EPISODE 1: SCORCHED CANYON, TOXIC REFINERY & VOLCANIC CITADEL THEME
            ctx.fillStyle = "#7c2d12";
            ctx.fillRect(0, 0, 3800, H);
            ctx.fillStyle = "#451a03";
            ctx.fillRect(0, 0, 3800, 320);
            ctx.fillRect(0, H - 320, 3800, 320);

            ctx.fillStyle = "#1e293b";
            ctx.fillRect(3800, 0, 3800, H);
            ctx.fillStyle = "rgba(132, 204, 22, 0.20)";
            ctx.fillRect(3950, 80, 3500, 400);
            ctx.fillRect(3950, H - 480, 3500, 400);

            ctx.fillStyle = "#450a0a";
            ctx.fillRect(7600, 0, 3800, H);

            ctx.fillStyle = "#334155";
            ctx.fillRect(11400, 0, 3800, H);

            ctx.fillStyle = "#18181b";
            ctx.fillRect(15200, 0, 3800, H);
        }

        // Stage 3 Chasm (Lava Chasm in Ep 1, Deep Sea Channel in Ep 2: x = 8800 to 10150)
        const chasmGrad = ctx.createLinearGradient(8800, 0, 10150, 0);
        if (isEp2) {
            chasmGrad.addColorStop(0, "#082f49");
            chasmGrad.addColorStop(0.5, "#0284c7");
            chasmGrad.addColorStop(1, "#082f49");
        } else {
            chasmGrad.addColorStop(0, "#7f1d1d");
            chasmGrad.addColorStop(0.5, "#ea580c");
            chasmGrad.addColorStop(1, "#7f1d1d");
        }
        ctx.fillStyle = chasmGrad;
        ctx.fillRect(8800, 0, 1350, H);

        // Wide Multi-Lane Overland Highway (y: 520 to 2480)
        const roadGrad = ctx.createLinearGradient(0, rTop, 0, rBot);
        roadGrad.addColorStop(0, "#090d16");
        roadGrad.addColorStop(0.15, isEp2 ? "#1e293b" : "#111827");
        roadGrad.addColorStop(0.5, isEp2 ? "#334155" : "#1e293b");
        roadGrad.addColorStop(0.85, isEp2 ? "#1e293b" : "#111827");
        roadGrad.addColorStop(1, "#090d16");
        ctx.fillStyle = roadGrad;
        ctx.fillRect(0, rTop, ar.width, rH);

        for (let rx = 0; rx < ar.width; rx += 80) {
            ctx.fillStyle = (rx / 80) % 2 === 0 ? (isEp2 ? "#0284c7" : "#dc2626") : "#f8fafc";
            ctx.fillRect(rx, rTop + 4, 40, 12);
            ctx.fillRect(rx, rBot - 16, 40, 12);
        }

        ctx.strokeStyle = "rgba(226, 232, 240, 0.28)";
        ctx.lineWidth = 4;
        ctx.setLineDash([36, 44]);
        ctx.beginPath();
        ctx.moveTo(100, rTop + 480); ctx.lineTo(ar.width - 100, rTop + 480);
        ctx.moveTo(100, rBot - 480); ctx.lineTo(ar.width - 100, rBot - 480);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(100, H / 2 - 7, ar.width - 200, 4);
        ctx.fillRect(100, H / 2 + 3, ar.width - 200, 4);

        // Stage 3 Central Suspension Bridge (x: 8760 to 10190, y: 820 to 2180)
        ctx.fillStyle = "#334155";
        ctx.fillRect(8760, 820, 1430, 1360);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
        ctx.lineWidth = 4;
        for (let bx = 8800; bx < 10160; bx += 95) {
            ctx.beginPath();
            ctx.moveTo(bx, 820); ctx.lineTo(bx, 2180);
            ctx.stroke();
        }
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(8760, 796, 1430, 26);
        ctx.fillRect(8760, 2178, 1430, 26);

        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 18;
        ctx.strokeRect(10, 10, ar.width - 20, H - 20);
    },

    drawGateKeyFlagGraphic(ctx, x, y, color) {
        ctx.save();
        ctx.translate(x, y);
        const wave = Math.sin(performance.now() * 0.01) * 5;
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, -44); ctx.stroke();
        ctx.fillStyle = color;
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.quadraticCurveTo(18, -46 + wave, 36, -34 + wave);
        ctx.lineTo(28, -24 + wave);
        ctx.lineTo(36, -14 + wave);
        ctx.quadraticCurveTo(18, -10 + wave, 0, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    },

    drawWorldExtras(ctx) {
        if (MatchConfig.mode !== "story") return;
        const now = performance.now();
        const rTop = this.roadTop, rBot = this.roadBottom;

        // 1. Draw Gate Key Flag & Gate Unlock Terminal if active
        if (this.stageFlag) {
            const f = this.stageFlag;
            // Draw Flag Post
            ctx.save();
            ctx.translate(f.homeX, f.homeY);
            ctx.fillStyle = "rgba(245, 158, 11, 0.20)";
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, 65, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.font = "900 13px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#fde047";
            ctx.fillText(f.state === "AT_POST" ? "TAKE GATE KEY FLAG!" : "KEY FLAG POST", 0, 82);
            ctx.restore();

            // Draw Gate Terminal Receptacle near Blast Gate
            ctx.save();
            ctx.translate(f.terminalX, f.terminalY);
            ctx.fillStyle = f.state === "UNLOCKED" ? "rgba(0, 230, 118, 0.25)" : "rgba(56, 189, 248, 0.20)";
            ctx.strokeStyle = f.state === "UNLOCKED" ? "#00e676" : "#38bdf8";
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(0, 0, 85, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.font = "900 14px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = f.state === "UNLOCKED" ? "#00e676" : "#38bdf8";
            ctx.fillText(f.state === "UNLOCKED" ? "KEY FLAG UNLOCKED!" : "DELIVER KEY FLAG HERE", 0, -98);
            ctx.restore();

            if (f.state === "AT_POST") {
                this.drawGateKeyFlagGraphic(ctx, f.homeX, f.homeY, "#f59e0b");
            } else if (f.state === "CARRIED" && f.carrier) {
                this.drawGateKeyFlagGraphic(ctx, f.carrier.x, f.carrier.y - 18, "#00e676");
            } else if (f.state === "UNLOCKED") {
                this.drawGateKeyFlagGraphic(ctx, f.terminalX, f.terminalY, "#00e676");
            }
        }

        // 2. Guidance Arrows when Stage Gate is Open
        for (const gate of this.gates) {
            if (gate.isOpen && this.currentStage === gate.stageIndex) {
                for (let a = 0; a < 5; a++) {
                    const ax = gate.x - 950 + a * 260 + ((now * 0.22) % 260);
                    const ay = this.mapHeight / 2;
                    ctx.save();
                    ctx.translate(ax, ay);
                    ctx.strokeStyle = "#00e676";
                    ctx.lineWidth = 10;
                    ctx.lineCap = "round";
                    for (let c = -1; c <= 1; c++) {
                        ctx.beginPath();
                        ctx.moveTo(c * 28 - 20, -34);
                        ctx.lineTo(c * 28 + 14, 0);
                        ctx.lineTo(c * 28 - 20, 34);
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            }
        }

        for (const obs of this.obstacles) {
            ctx.save();
            ctx.translate(obs.x, obs.y);
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.beginPath(); ctx.arc(7, 9, obs.r, 0, Math.PI * 2); ctx.fill();

            if (obs.kind === "fuel_tank") {
                ctx.fillStyle = "#e2e8f0";
                ctx.strokeStyle = "#dc2626";
                ctx.lineWidth = 7;
                ctx.beginPath(); ctx.arc(0, 0, obs.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = "#dc2626";
                ctx.font = "900 13px Segoe UI, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("FUEL", 0, 5);
            } else if (obs.kind === "ice_spire") {
                ctx.fillStyle = "#bae6fd";
                ctx.strokeStyle = "#0284c7";
                ctx.lineWidth = 6;
                ctx.beginPath(); ctx.arc(0, 0, obs.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (obs.kind === "stone_pillar") {
                ctx.fillStyle = "#64748b";
                ctx.strokeStyle = "#0f172a";
                ctx.lineWidth = 6;
                ctx.beginPath(); ctx.arc(0, 0, obs.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (obs.kind === "iron_brazier") {
                ctx.fillStyle = "#27272a";
                ctx.strokeStyle = "#f97316";
                ctx.lineWidth = 6;
                ctx.beginPath(); ctx.arc(0, 0, obs.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = "#f97316";
                ctx.beginPath(); ctx.arc(0, 0, obs.r * 0.52 + Math.sin(now * 0.01) * 4, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = "#9a3412";
                ctx.strokeStyle = "#451a03";
                ctx.lineWidth = 6;
                ctx.beginPath(); ctx.arc(0, 0, obs.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
            ctx.restore();
        }

        for (const gate of this.gates) {
            ctx.save();
            ctx.fillStyle = "#334155";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 6;
            ctx.fillRect(gate.x - 32, 0, 64, rTop);
            ctx.strokeRect(gate.x - 32, 0, 64, rTop);
            ctx.fillRect(gate.x - 32, rBot, 64, this.mapHeight - rBot);
            ctx.strokeRect(gate.x - 32, rBot, 64, this.mapHeight - rBot);

            ctx.fillStyle = gate.isOpen ? "#16a34a" : "#dc2626";
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(gate.x, rTop, 36, 0, Math.PI * 2);
            ctx.arc(gate.x, rBot, 36, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (gate.openProgress < 1) {
                const halfRoad = (rBot - rTop) / 2;
                const doorLen = Math.max(0, halfRoad * (1 - gate.openProgress));
                ctx.fillStyle = "#dc2626";
                ctx.strokeStyle = "#fbbf24";
                ctx.lineWidth = 4;
                ctx.fillRect(gate.x - 18, rTop, 36, doorLen);
                ctx.strokeRect(gate.x - 18, rTop, 36, doorLen);
                ctx.fillRect(gate.x - 18, rBot - doorLen, 36, doorLen);
                ctx.strokeRect(gate.x - 18, rBot - doorLen, 36, doorLen);

                ctx.font = "900 17px Segoe UI, sans-serif";
                ctx.textAlign = "center";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 4;
                const gateMsg = "GATE LOCKED - DEFEAT ENEMIES & DELIVER KEY FLAG!";
                ctx.strokeText(gateMsg, gate.x, this.mapHeight / 2);
                ctx.fillStyle = "#fde047";
                ctx.fillText(gateMsg, gate.x, this.mapHeight / 2);
            }
            ctx.restore();
        }

        // 3. Draw Captive Friend VIPER & 6-Second Cage Unlock Zone in Episode 1 Stage 5
        if (this.episode === 1 && this.captiveCar && this.cageIntact) {
            this.captiveCar.draw(ctx, true);
            const cx = this.captiveCar.x, cy = this.captiveCar.y;
            const enemiesAlive = Game.cars.filter(c => c.team === "ENEMIES" && !c.dead).length;
            ctx.save();
            ctx.translate(cx, cy);

            // Outer 6-Second Stand-and-Hold Unlock Zone Circle when Warlord Kraken is defeated
            if (enemiesAlive === 0) {
                ctx.fillStyle = "rgba(0, 230, 118, 0.16)";
                ctx.strokeStyle = "#00e676";
                ctx.lineWidth = 4;
                ctx.beginPath(); ctx.arc(0, 0, 215, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                if (this.cageUnlockProgress > 0) {
                    const ratio = this.cageUnlockProgress / this.cageUnlockRequired;
                    ctx.strokeStyle = "#fde047";
                    ctx.lineWidth = 9;
                    ctx.beginPath();
                    ctx.arc(0, 0, 215, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
                    ctx.stroke();
                }
            }

            ctx.fillStyle = "rgba(220, 38, 38, 0.16)";
            ctx.strokeStyle = (Math.floor(now / 120) % 2 === 0) ? "#ff1e42" : "#fbbf24";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.roundRect(-95, -95, 190, 190, 16);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 4;
            for (let b = -60; b <= 60; b += 40) {
                ctx.beginPath(); ctx.moveTo(b, -95); ctx.lineTo(b, 95); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-95, b); ctx.lineTo(95, b); ctx.stroke();
            }

            ctx.font = "900 16px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 4;
            const secLeft = Math.max(0, (this.cageUnlockRequired - this.cageUnlockProgress) / 60).toFixed(1);
            const helpTxt = enemiesAlive === 0
                ? `STAND IN GREEN ZONE TO DESTROY CAGE (${secLeft}s)!`
                : "VIPER LOCKED IN CAGE! DEFEAT WARLORD KRAKEN FIRST!";
            ctx.strokeText(helpTxt, 0, -125);
            ctx.fillStyle = enemiesAlive === 0 ? "#00e676" : "#fde047";
            ctx.fillText(helpTxt, 0, -125);
            ctx.restore();
        }

        for (const crate of this.repairCrates) {
            ctx.save();
            ctx.translate(crate.x, crate.y);
            ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
            ctx.strokeStyle = "#00e676";
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.roundRect(-22, -22, 44, 44, 8); ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#00e676";
            ctx.fillRect(-5, -14, 10, 28);
            ctx.fillRect(-14, -5, 28, 10);
            ctx.restore();
        }
    },

    drawStoryMinimap(ctx, canvas) {
        // Cinematic Letterbox Bars during Opening / Extraction Cutscenes
        if (this.cutsceneMode) {
            ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
            ctx.fillRect(0, 0, canvas.width, 54);
            ctx.fillRect(0, canvas.height - 54, canvas.width, 54);
            ctx.font = "900 14px Segoe UI, sans-serif";
            ctx.fillStyle = "#fbbf24";
            ctx.textAlign = "center";
            ctx.fillText("STORY CUTSCENE IN PROGRESS...", canvas.width / 2, 33);
            ctx.restore();
        }

        if (this.commsTimer > 0) {
            ctx.save();
            const bw = Math.min(780, canvas.width - 40);
            const bh = 66;
            const bx = (canvas.width - bw) / 2;
            const by = canvas.height - 102;
            ctx.fillStyle = "rgba(9, 13, 22, 0.92)";
            ctx.strokeStyle = this.commsColor;
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 12); ctx.fill(); ctx.stroke();

            ctx.font = "900 13px Segoe UI, sans-serif";
            ctx.fillStyle = this.commsColor;
            ctx.textAlign = "left";
            ctx.fillText(`RADIO TRANSMISSION // ${this.commsSpeaker}:`, bx + 18, by + 24);

            ctx.font = "700 13.5px Segoe UI, sans-serif";
            ctx.fillStyle = "#f8fafc";
            ctx.fillText(this.commsText, bx + 18, by + 47);
            ctx.restore();
        }

        const mapW = 330, mapH = 56, pad = 16;
        const x0 = canvas.width - mapW - pad;
        const hudBar = document.querySelector(".hud-top-bar"); const y0 = (hudBar ? hudBar.offsetHeight : 54) + 10;
        const scaleX = mapW / Game.arena.width;
        const scaleY = mapH / Game.arena.height;

        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x0, y0, mapW, mapH, 8);
        ctx.fill();
        ctx.stroke();

        for (let s = 1; s < 5; s++) {
            const sx = x0 + (s * 3800) * scaleX;
            ctx.strokeStyle = this.gates[s - 1].isOpen ? "rgba(0, 230, 118, 0.55)" : "rgba(255, 30, 66, 0.75)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(sx, y0); ctx.lineTo(sx, y0 + mapH); ctx.stroke();
        }

        if (this.stageFlag && this.stageFlag.state !== "UNLOCKED") {
            const fx = x0 + this.stageFlag.x * scaleX, fy = y0 + this.stageFlag.y * scaleY;
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath(); ctx.arc(fx, fy, 4.5, 0, Math.PI * 2); ctx.fill();
        }

        if (this.episode === 1 && this.cageIntact && this.captiveCar) {
            const vx = x0 + this.captiveCar.x * scaleX, vy = y0 + this.captiveCar.y * scaleY;
            ctx.fillStyle = "#00e676";
            ctx.beginPath(); ctx.arc(vx, vy, 5, 0, Math.PI * 2); ctx.fill();
        }

        Game.cars.forEach(c => {
            if (c.dead) return;
            const rx = x0 + c.x * scaleX, ry = y0 + c.y * scaleY;
            ctx.fillStyle = c.team === "ENEMIES" ? (c.isStoryBoss ? "#fbbf24" : "#ff1e42") : c.lightColor;
            ctx.beginPath();
            ctx.arc(rx, ry, c.isStoryBoss ? 5.5 : (c.isAI ? 3.2 : 4.8), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
};