const POWERUP_CATALOG = [
    // =========================================================================
    // 5 POSITIVE ABILITIES (BUFFS & HEALS)
    // =========================================================================
    {
        id: 'repair_partial',
        name: 'REPAIR KIT (+65 HP)',
        shortTag: '+65 HP REPAIR!',
        coreColor: '#10b981',
        lightColor: '#d1fae5',
        darkColor: '#064e3b',
        ringColor: '#00e676',
        isInstantHeal: true,
        isTrap: false,
        weight: 22
    },
    {
        id: 'repair_full',
        name: 'MEGA MEDKIT (100% FULL HP)',
        shortTag: '100% MEGA HEAL!',
        coreColor: '#0284c7',
        lightColor: '#e0f2fe',
        darkColor: '#0c4a6e',
        ringColor: '#38bdf8',
        isInstantHeal: true,
        isTrap: false,
        weight: 14
    },
    {
        id: 'inferno_ram',
        name: 'INFERNO FIRE RAM (12S)',
        shortTag: 'INFERNO FIRE RAM! (12s)',
        coreColor: '#ea580c',
        lightColor: '#fef08a',
        darkColor: '#7c2d12',
        ringColor: '#ff4d6d',
        durationFrames: 720,
        isTrap: false,
        weight: 18
    },
    {
        id: 'titan_shield',
        name: 'TITAN ARMOR SHIELD (10S)',
        shortTag: 'TITAN SHIELD! (10s)',
        coreColor: '#7c3aed',
        lightColor: '#ede9fe',
        darkColor: '#3b0764',
        ringColor: '#c084fc',
        durationFrames: 600,
        isTrap: false,
        weight: 16
    },
    {
        id: 'hyper_nitro',
        name: 'TURBO SPEED BOOST (10S)',
        shortTag: 'TURBO SPEED! (10s)',
        coreColor: '#eab308',
        lightColor: '#fef9c3',
        darkColor: '#713f12',
        ringColor: '#ffb703',
        durationFrames: 600,
        isTrap: false,
        weight: 18
    },

    // =========================================================================
    // 3 MYSTERY DISABILITIES (WITH 2.5-SECOND ON-CAR ANIMATIONS)
    // =========================================================================
    {
        id: 'tire_puncture',
        name: 'TIRE PUNCTURE! (5.5S)',
        shortTag: 'TIRE PUNCTURED! (-15 HP & SLOW)',
        coreColor: '#dc2626',
        lightColor: '#fecaca',
        darkColor: '#7f1d1d',
        ringColor: '#ff1e42',
        durationFrames: 330,
        isTrap: true,
        weight: 11
    },
    {
        id: 'sabotage_bomb',
        name: 'SABOTAGE MINI-BOMB! (-28 HP)',
        shortTag: 'MINI-BOMB BLAST! (-28 HP)',
        coreColor: '#be123c',
        lightColor: '#ffe4e6',
        darkColor: '#4c0519',
        ringColor: '#fb7185',
        durationFrames: 150,
        isTrap: true,
        weight: 9
    },
    {
        id: 'steering_glitch',
        name: 'STEERING GLITCH! (5S)',
        shortTag: 'STEERING GLITCH! (5s)',
        coreColor: '#d97706',
        lightColor: '#fef3c7',
        darkColor: '#78350f',
        ringColor: '#fbbf24',
        durationFrames: 300,
        isTrap: true,
        weight: 9
    }
];

// Smooth color palette matching the exact car colors in config.js
const MYSTERY_COLORS = [
    { r: 0,   g: 168, b: 255 }, // Electric Blue
    { r: 0,   g: 230, b: 118 }, // Emerald Green
    { r: 255, g: 183, b: 3   }, // Cyber Gold
    { r: 255, g: 30,  b: 66  }, // Hyper Red
    { r: 181, g: 23,  b: 158 }  // Plasma Purple
];

const ArenaHazards = {
    trees: [],
    benches: [],
    powerups: [],
    revealPopups: [],
    dropTimerFrames: 1800, // 30 seconds at 60fps
    dropIntervalFrames: 1800,
    nextDropId: 1,

    initForArena(arena) {
        this.trees = [];
        this.benches = [];
        this.powerups = [];
        this.revealPopups = [];
        this.dropTimerFrames = this.dropIntervalFrames;
        this.nextDropId = 1;

        if (!arena.hasHazards) return;

        const cx = arena.width / 2;
        const cy = arena.height / 2;

        if (arena.id === 'desert_dunes') {
            // DESERT DUNES: 6 Desert Cactus & Canyon Rock Formations arranged cleanly around the Oasis & Flanks
            this.trees = [
                { x: cx - 720,  y: cy - 480, r: 44, shake: 0, kind: 'cactus' },
                { x: cx + 720,  y: cy - 480, r: 44, shake: 0, kind: 'cactus' },
                { x: cx - 720,  y: cy + 480, r: 44, shake: 0, kind: 'cactus' },
                { x: cx + 720,  y: cy + 480, r: 44, shake: 0, kind: 'cactus' },
                { x: cx,        y: cy - 640, r: 42, shake: 0, kind: 'cactus' },
                { x: cx,        y: cy + 640, r: 42, shake: 0, kind: 'cactus' }
            ];
            return;
        }

        if (arena.id === 'ice_rink') {
            // FROSTBITE ICE: 6 Ice Crystal Spires & Snow-Capped Pines placed in a symmetrical ring inside the circular dome
            const ringR = 520;
            this.trees = [
                { x: cx,        y: cy - ringR, r: 44, shake: 0, kind: 'ice_crystal' },
                { x: cx,        y: cy + ringR, r: 44, shake: 0, kind: 'ice_crystal' },
                { x: cx - 460,  y: cy - 320,   r: 44, shake: 0, kind: 'xmas_tree'   },
                { x: cx + 460,  y: cy - 320,   r: 44, shake: 0, kind: 'xmas_tree'   },
                { x: cx - 460,  y: cy + 320,   r: 44, shake: 0, kind: 'xmas_tree'   },
                { x: cx + 460,  y: cy + 320,   r: 44, shake: 0, kind: 'xmas_tree'   }
            ];
            return;
        }

        // PARK GROUND: 14 Park Trees & 10 Wooden Benches
        this.trees = [
            { x: cx - 560,  y: cy - 380, r: 44, shake: 0, kind: 'park_tree' },
            { x: cx + 560,  y: cy - 380, r: 44, shake: 0, kind: 'park_tree' },
            { x: cx - 560,  y: cy + 380, r: 44, shake: 0, kind: 'park_tree' },
            { x: cx + 560,  y: cy + 380, r: 44, shake: 0, kind: 'park_tree' },
            { x: cx,        y: cy - 520, r: 42, shake: 0, kind: 'park_tree' },
            { x: cx,        y: cy + 520, r: 42, shake: 0, kind: 'park_tree' },
            { x: cx - 980,  y: cy,       r: 46, shake: 0, kind: 'park_tree' },
            { x: cx + 980,  y: cy,       r: 46, shake: 0, kind: 'park_tree' },
            { x: cx - 1220, y: cy - 640, r: 45, shake: 0, kind: 'park_tree' },
            { x: cx + 1220, y: cy - 640, r: 45, shake: 0, kind: 'park_tree' },
            { x: cx - 1220, y: cy + 640, r: 45, shake: 0, kind: 'park_tree' },
            { x: cx + 1220, y: cy + 640, r: 45, shake: 0, kind: 'park_tree' },
            { x: cx - 640,  y: cy - 760, r: 40, shake: 0, kind: 'park_tree' },
            { x: cx + 640,  y: cy + 760, r: 40, shake: 0, kind: 'park_tree' }
        ];

        this.benches = [
            { x: cx - 320,  y: cy - 240, w: 126, h: 36, hitTimer: 0 },
            { x: cx + 320,  y: cy - 240, w: 126, h: 36, hitTimer: 0 },
            { x: cx - 320,  y: cy + 240, w: 126, h: 36, hitTimer: 0 },
            { x: cx + 320,  y: cy + 240, w: 126, h: 36, hitTimer: 0 },
            { x: cx - 500,  y: cy,       w: 36,  h: 126, hitTimer: 0 },
            { x: cx + 500,  y: cy,       w: 36,  h: 126, hitTimer: 0 },
            { x: cx - 1020, y: cy - 380, w: 130, h: 36, hitTimer: 0 },
            { x: cx + 1020, y: cy - 380, w: 130, h: 36, hitTimer: 0 },
            { x: cx - 1020, y: cy + 380, w: 130, h: 36, hitTimer: 0 },
            { x: cx + 1020, y: cy + 380, w: 130, h: 36, hitTimer: 0 }
        ];
    },

    getSmoothMysteryColor(now, uid, alpha = 1.0) {
        const t = (now * 0.0012 + uid * 1.3) % MYSTERY_COLORS.length;
        const idx1 = Math.floor(t);
        const idx2 = (idx1 + 1) % MYSTERY_COLORS.length;
        const frac = t - idx1;
        const c1 = MYSTERY_COLORS[idx1];
        const c2 = MYSTERY_COLORS[idx2];
        const r = Math.round(c1.r + (c2.r - c1.r) * frac);
        const g = Math.round(c1.g + (c2.g - c1.g) * frac);
        const b = Math.round(c1.b + (c2.b - c1.b) * frac);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    rollRandomMysteryAbility() {
        const totalWeight = POWERUP_CATALOG.reduce((sum, item) => sum + (item.weight || 10), 0);
        let roll = Math.random() * totalWeight;
        for (const item of POWERUP_CATALOG) {
            roll -= (item.weight || 10);
            if (roll <= 0) return item;
        }
        return POWERUP_CATALOG[0];
    },

    findSafeDropSpot(arena) {
        const cx = arena.width / 2, cy = arena.height / 2;
        const margin = arena.wallPad + 240;
        for (let attempt = 0; attempt < 30; attempt++) {
            let x, y;
            if (arena.isCircular) {
                const maxR = (arena.radius || 1130) - 240;
                const r = Math.sqrt(Math.random()) * maxR;
                const ang = Math.random() * Math.PI * 2;
                x = cx + Math.cos(ang) * r;
                y = cy + Math.sin(ang) * r;
            } else {
                x = margin + Math.random() * (arena.width - margin * 2);
                y = margin + Math.random() * (arena.height - margin * 2);
            }
            let clear = true;
            for (const t of this.trees) {
                if (Math.hypot(x - t.x, y - t.y) < t.r + 110) { clear = false; break; }
            }
            if (!clear) continue;
            for (const b of this.benches) {
                if (Math.abs(x - b.x) < b.w / 2 + 100 && Math.abs(y - b.y) < b.h / 2 + 100) { clear = false; break; }
            }
            if (!clear) continue;
            for (const p of this.powerups) {
                if (Math.hypot(x - p.x, y - p.y) < 240) { clear = false; break; }
            }
            if (clear) return { x, y };
        }
        return { x: cx, y: cy };
    },

    spawnRandomSupplyDrop(arena) {
        if (this.powerups.length >= 3) this.powerups.shift();
        const hiddenSpec = this.rollRandomMysteryAbility();
        const spot = this.findSafeDropSpot(arena);

        this.powerups.push({
            uid: this.nextDropId++,
            spec: hiddenSpec,
            x: spot.x,
            y: spot.y,
            r: 40,
            dropProgress: 0,
            spawnTime: performance.now()
        });

        Game.shockwaves.push({
            x: spot.x, y: spot.y, r: 10, maxR: 135, alpha: 0.85, color: '#38bdf8'
        });

        if (typeof KillAnnouncer !== 'undefined' && Game.state === 'PLAYING' && !KillAnnouncer.slowMoActive) {
            KillAnnouncer.showBanner('MYSTERY DROP LANDED!', 'Drive into the [?] Zone for a Random Ability!', '#38bdf8', 90);
        }
    },

    applyPowerupToCar(car, orb) {
        const spec = this.rollRandomMysteryAbility();
        SoundEngine.playPowerupPickup(!!spec.isInstantHeal, !!spec.isTrap);

        Game.shockwaves.push({
            x: orb.x, y: orb.y, r: 10, maxR: 130, alpha: 0.95, color: spec.ringColor
        });
        this.spawnLeafParticles(orb.x, orb.y, 16, spec.ringColor);

        this.revealPopups.push({
            car: car,
            x: car.x,
            y: car.y - 64,
            spec: spec,
            life: 1.0
        });

        if (!car.isAI && typeof KillAnnouncer !== 'undefined' && !KillAnnouncer.slowMoActive) {
            const prefix = spec.isTrap ? 'MYSTERY DISABILITY!' : 'MYSTERY ABILITY!';
            KillAnnouncer.showBanner(prefix, `${car.label} got ${spec.name}!`, spec.ringColor, 85);
        }

        if (spec.id === 'repair_partial') {
            car.hp = Math.min(car.maxHp, car.hp + 65);
            car.dentFront *= 0.5; car.dentRear *= 0.5;
            car.dentLeft *= 0.5;  car.dentRight *= 0.5;
            Game.floatingTexts.push({
                x: car.x, y: car.y - 34,
                text: `${car.label}: +65 HP REPAIR!`,
                color: '#00e676', life: 1.30
            });
        } else if (spec.id === 'repair_full') {
            car.hp = car.maxHp;
            car.dentFront = 0; car.dentRear = 0;
            car.dentLeft = 0;  car.dentRight = 0;
            car.parts = {
                frontBumper: true, rearBumper: true, rearSpoiler: true,
                leftFender: true, rightFender: true, hood: true
            };
            Game.floatingTexts.push({
                x: car.x, y: car.y - 34,
                text: `${car.label}: 100% MEGA MEDKIT!`,
                color: '#38bdf8', life: 1.35
            });
        } else if (spec.id === 'sabotage_bomb') {
            car.hp = Math.max(5, car.hp - 28);
            car.vx *= -0.55;
            car.vy *= -0.55;
            car.angVel += (Math.random() < 0.5 ? 1 : -1) * 0.22;
            car.triggerTrapAnimation('sabotage_bomb');
            Game.screenShake = Math.max(Game.screenShake, 15);
            Game.spawnSparks(car.x, car.y, 28);
            Game.floatingTexts.push({
                x: car.x, y: car.y - 36,
                text: `💣 ${car.label}: MINI-BOMB TRAP (-28 HP)!`,
                color: '#fb7185', life: 1.55
            });
        } else if (spec.id === 'tire_puncture') {
            car.hp = Math.max(5, car.hp - 15);
            car.activePowerup = spec.id;
            car.powerupTimer = spec.durationFrames;
            car.powerupMaxTimer = spec.durationFrames;
            car.powerupMeta = spec;
            car.puncturePullDir = Math.random() < 0.5 ? -1 : 1;
            car.triggerTrapAnimation('tire_puncture');
            Game.spawnSparks(car.x, car.y, 18);
            Game.floatingTexts.push({
                x: car.x, y: car.y - 36,
                text: `🛞 ${car.label}: TIRE PUNCTURED! (-15 HP & SLOW)`,
                color: '#ff4d6d', life: 1.55
            });
        } else {
            if (spec.id === 'steering_glitch') {
                car.triggerTrapAnimation('steering_glitch');
            }
            car.activePowerup = spec.id;
            car.powerupTimer = spec.durationFrames;
            car.powerupMaxTimer = spec.durationFrames;
            car.powerupMeta = spec;
            Game.floatingTexts.push({
                x: car.x, y: car.y - 34,
                text: `${car.label}: ${spec.shortTag}`,
                color: spec.ringColor, life: 1.40
            });
        }
    },

    updateAndCollide(cars, dt) {
        if (Game.state === 'PLAYING') {
            this.dropTimerFrames -= dt;
            if (this.dropTimerFrames <= 0) {
                this.dropTimerFrames = this.dropIntervalFrames;
                this.spawnRandomSupplyDrop(Game.arena);
            }
        }

        for (let i = this.revealPopups.length - 1; i >= 0; i--) {
            const rp = this.revealPopups[i];
            rp.life -= 0.009 * dt;
            if (rp.car && !rp.car.dead) {
                rp.x = rp.car.x;
                rp.y = rp.car.y - rp.car.radius - 68 - (1 - rp.life) * 24;
            } else {
                rp.y -= 0.8 * dt;
            }
            if (rp.life <= 0) this.revealPopups.splice(i, 1);
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const orb = this.powerups[i];
            if (orb.dropProgress < 1) {
                orb.dropProgress = Math.min(1, orb.dropProgress + 0.035 * dt);
            }
            if (orb.dropProgress < 0.85) continue;

            for (const car of cars) {
                if (car.dead) continue;
                const d = Math.hypot(car.x - orb.x, car.y - orb.y);
                if (d < car.radius + orb.r) {
                    this.applyPowerupToCar(car, orb);
                    this.powerups.splice(i, 1);
                    break;
                }
            }
        }

        if (this.trees.length === 0 && this.benches.length === 0) return;

        for (const tree of this.trees) {
            if (tree.shake > 0) tree.shake = Math.max(0, tree.shake - 0.08 * dt);

            for (const car of cars) {
                const dx = car.x - tree.x;
                const dy = car.y - tree.y;
                const dist = Math.hypot(dx, dy);
                const minDist = car.radius + tree.r * 0.65;

                if (dist < minDist && dist > 0.001) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const overlap = minDist - dist + 1.5;
                    car.x += nx * overlap;
                    car.y += ny * overlap;

                    const dot = car.vx * nx + car.vy * ny;
                    if (dot < 0) {
                        car.vx -= 1.35 * dot * nx;
                        car.vy -= 1.35 * dot * ny;
                    }
                    car.vx *= 0.72;
                    car.vy *= 0.72;

                    if (tree.shake <= 0.1) {
                        tree.shake = 1.0;
                        SoundEngine.playCrash(0.20);
                        const pCol = tree.kind === 'xmas_tree' ? '#e0f2fe' : (tree.kind === 'cactus' ? '#84cc16' : '#16a34a');
                        this.spawnLeafParticles(tree.x + nx * tree.r * 0.5, tree.y + ny * tree.r * 0.5, 7, pCol);
                    }
                }
            }
        }

        for (const b of this.benches) {
            if (b.hitTimer > 0) b.hitTimer = Math.max(0, b.hitTimer - 0.08 * dt);
            const halfW = b.w / 2, halfH = b.h / 2;

            for (const car of cars) {
                const closestX = Math.max(b.x - halfW, Math.min(car.x, b.x + halfW));
                const closestY = Math.max(b.y - halfH, Math.min(car.y, b.y + halfH));

                const dx = car.x - closestX;
                const dy = car.y - closestY;
                const dist = Math.hypot(dx, dy);

                if (dist < car.radius) {
                    let nx = 0, ny = -1;
                    if (dist > 0.001) {
                        nx = dx / dist;
                        ny = dy / dist;
                    } else {
                        nx = car.x >= b.x ? 1 : -1;
                        ny = 0;
                    }

                    const overlap = car.radius - dist + 1.5;
                    car.x += nx * overlap;
                    car.y += ny * overlap;

                    const dot = car.vx * nx + car.vy * ny;
                    if (dot < 0) {
                        car.vx -= 1.30 * dot * nx;
                        car.vy -= 1.30 * dot * ny;
                    }
                    car.vx *= 0.68;
                    car.vy *= 0.68;

                    if (b.hitTimer <= 0.1) {
                        b.hitTimer = 1.0;
                        SoundEngine.playCrash(0.22);
                        this.spawnLeafParticles(closestX, closestY, 5, '#d97706');
                    }
                }
            }
        }
    },

    spawnLeafParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 1.2 + Math.random() * 3.8;
            Game.particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 3.5 + Math.random() * 4,
                color: color,
                alpha: 0.9,
                decay: 0.025
            });
        }
    },

    drawGreenPlus(ctx, cx, cy, armLen, thickness) {
        ctx.fillStyle = '#00e676';
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - thickness / 2, cy - armLen, thickness, armLen * 2, 2.5);
        ctx.roundRect(cx - armLen, cy - thickness / 2, armLen * 2, thickness, 2.5);
        ctx.fill();
        ctx.stroke();
    },

    // Custom-drawn Vector Question Mark (?) that matches the game's clean vector graphics
    drawVectorQuestionMark(ctx, colorStr) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const drawHookPath = () => {
            ctx.beginPath();
            ctx.arc(0, -7, 9.5, Math.PI * 0.88, Math.PI * 2.15, false);
            ctx.bezierCurveTo(9.5, 1, 0, 2.5, 0, 8.5);
        };

        // Crisp dark vector outline matching the car outlines (#090d16)
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 10.5;
        drawHookPath();
        ctx.stroke();

        // Smooth color-shifting inner vector stroke
        ctx.strokeStyle = colorStr;
        ctx.lineWidth = 6;
        ctx.shadowColor = colorStr;
        ctx.shadowBlur = 10;
        drawHookPath();
        ctx.stroke();

        // Thin bright center highlight for a clean arcade vector look
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2;
        drawHookPath();
        ctx.stroke();

        // Bottom dot of the Question Mark
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(0, 18.5, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colorStr;
        ctx.beginPath();
        ctx.arc(0, 18.5, 3.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(-1, 17.5, 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawPowerupLogo(ctx, id) {
        ctx.save();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (id === 'repair_partial') {
            this.drawGreenPlus(ctx, 0, 0, 13, 7.5);
        } else if (id === 'repair_full') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.roundRect(-20, -12, 40, 25, 5);
            ctx.fill();
            ctx.stroke();

            this.drawGreenPlus(ctx, 0, 0, 6.5, 3.8);
            this.drawGreenPlus(ctx, -11.5, 2, 4.5, 2.6);
            this.drawGreenPlus(ctx, 11.5, 2, 4.5, 2.6);
        } else if (id === 'inferno_ram') {
            ctx.fillStyle = '#f97316';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.bezierCurveTo(15, -7, 16, 9, 0, 17);
            ctx.bezierCurveTo(-16, 9, -15, -7, -4, -11);
            ctx.quadraticCurveTo(-1, -4, 0, -18);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, 6, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (id === 'titan_shield') {
            ctx.fillStyle = '#c084fc';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(0, -17);
            ctx.lineTo(15, -10);
            ctx.quadraticCurveTo(15, 7, 0, 18);
            ctx.quadraticCurveTo(-15, 7, -15, -10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (id === 'hyper_nitro') {
            ctx.fillStyle = '#fde047';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(3, -17);
            ctx.lineTo(-11, 1);
            ctx.lineTo(-1, 1);
            ctx.lineTo(-4, 17);
            ctx.lineTo(11, -2);
            ctx.lineTo(1, -2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (id === 'tire_puncture') {
            ctx.fillStyle = '#ff4d6d';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(0, -1, 14, Math.PI * 0.15, Math.PI * 0.85, true);
            ctx.lineTo(-14, 10);
            ctx.lineTo(14, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (id === 'sabotage_bomb') {
            ctx.fillStyle = '#090d16';
            ctx.strokeStyle = '#fb7185';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(0, 3, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(10, -11, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (id === 'steering_glitch') {
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(0, -16);
            ctx.lineTo(16, 13);
            ctx.lineTo(-16, 13);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    },

    drawPowerupOrbs(ctx) {
        if (this.powerups.length === 0) return;
        const now = performance.now();

        for (const orb of this.powerups) {
            const dynColor = this.getSmoothMysteryColor(now, orb.uid, 1.0);
            const dynGlow = this.getSmoothMysteryColor(now, orb.uid, 0.22);
            const pulse = Math.sin(now * 0.0045 + orb.uid) * 0.06;
            const scale = (0.5 + 0.5 * orb.dropProgress) * (1 + pulse);

            ctx.save();
            ctx.translate(orb.x, orb.y);
            ctx.scale(scale, scale);

            // 1. Translucent Dark-Slate Glass Pad (blends directly with the pitch/park turf & HUD)
            ctx.fillStyle = 'rgba(15, 23, 42, 0.36)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, orb.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 2. Soft Inner Color-Shifting Aura
            const innerGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, orb.r);
            innerGrad.addColorStop(0, dynGlow);
            innerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(0, 0, orb.r, 0, Math.PI * 2);
            ctx.fill();

            // 3. Smooth Rotating Dual-Arc Vector Ring (matches car indicator rings)
            ctx.save();
            ctx.rotate(now * 0.0022 + orb.uid);
            ctx.strokeStyle = dynColor;
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, 0, orb.r - 3, 0, Math.PI * 0.65);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, orb.r - 3, Math.PI, Math.PI * 1.65);
            ctx.stroke();
            ctx.restore();

            // 4. Custom Vector Question Mark (?) in the center
            this.drawVectorQuestionMark(ctx, dynColor);

            ctx.restore();
        }
    },

    drawRevealPopups(ctx) {
        if (this.revealPopups.length === 0) return;
        for (const rp of this.revealPopups) {
            const spec = rp.spec;
            ctx.save();
            ctx.translate(rp.x, rp.y);
            ctx.globalAlpha = Math.min(1, rp.life * 1.5);

            const popScale = rp.life > 0.85 ? 0.75 + (1 - rp.life) * 1.8 : 1.0;
            ctx.scale(popScale, popScale);

            // Translucent vector badge matching the Mystery Pad style
            ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
            ctx.strokeStyle = spec.ringColor;
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            this.drawPowerupLogo(ctx, spec.id);
            ctx.restore();
        }
    },

    drawGroundElements(ctx) {
        for (const b of this.benches) {
            ctx.save();
            const shakeX = b.hitTimer > 0 ? (Math.random() - 0.5) * 3 : 0;
            const shakeY = b.hitTimer > 0 ? (Math.random() - 0.5) * 3 : 0;
            ctx.translate(b.x + shakeX, b.y + shakeY);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.beginPath();
            ctx.roundRect(-b.w / 2 + 4, -b.h / 2 + 5, b.w, b.h, 5);
            ctx.fill();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 5);
            ctx.fill();

            ctx.fillStyle = '#b45309';
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;

            if (b.w > b.h) {
                ctx.fillRect(-b.w / 2 + 6, -b.h / 2 + 3, b.w - 12, 8);
                ctx.fillStyle = '#d97706';
                ctx.fillRect(-b.w / 2 + 6, -2, b.w - 12, 8);
                ctx.fillRect(-b.w / 2 + 6, b.h / 2 - 10, b.w - 12, 7);
                ctx.fillStyle = '#334155';
                ctx.fillRect(-b.w / 2 + 2, -b.h / 2 + 2, 5, b.h - 4);
                ctx.fillRect(b.w / 2 - 7, -b.h / 2 + 2, 5, b.h - 4);
            } else {
                ctx.fillRect(-b.w / 2 + 3, -b.h / 2 + 6, 8, b.h - 12);
                ctx.fillStyle = '#d97706';
                ctx.fillRect(-2, -b.h / 2 + 6, 8, b.h - 12);
                ctx.fillRect(b.w / 2 - 10, -b.h / 2 + 6, 7, b.h - 12);
                ctx.fillStyle = '#334155';
                ctx.fillRect(-b.w / 2 + 2, -b.h / 2 + 2, b.w - 4, 5);
                ctx.fillRect(-b.w / 2 + 2, b.h / 2 - 7, b.w - 4, 5);
            }

            ctx.restore();
        }

        this.drawPowerupOrbs(ctx);
    },

    drawTreeCanopies(ctx) {
        if (this.trees.length > 0) {
            const now = performance.now();
            for (const t of this.trees) {
                ctx.save();
                const sx = t.shake > 0 ? Math.sin(now * 0.06) * 3.5 * t.shake : 0;
                const sy = t.shake > 0 ? Math.cos(now * 0.06) * 3.5 * t.shake : 0;
                ctx.translate(t.x + sx, t.y + sy);

                if (t.kind === 'cactus') {
                    // DESERT HURDLE: Desert Sandstone Base + Giant Saguaro Cactus with Arms & Flower Crown
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
                    ctx.beginPath();
                    ctx.ellipse(6, 8, t.r * 0.95, t.r * 0.78, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Sandy Rock Mound Base
                    ctx.fillStyle = '#b45309';
                    ctx.strokeStyle = '#78350f';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r * 0.78, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Saguaro Cactus Side Arms (Top-Down Cross/Star Ribbed Arms)
                    ctx.fillStyle = '#15803d';
                    ctx.strokeStyle = '#052e16';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.roundRect(-t.r * 0.88, -11, t.r * 1.76, 22, 10);
                    ctx.roundRect(-11, -t.r * 0.72, 22, t.r * 1.44, 10);
                    ctx.fill();
                    ctx.stroke();

                    // Central Ribbed Saguaro Trunk
                    ctx.fillStyle = '#22c55e';
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r * 0.48, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Cactus Spines / Ribs & Desert Bloom Flower on Top
                    ctx.strokeStyle = '#bef264';
                    ctx.lineWidth = 1.6;
                    for (let i = 0; i < 6; i++) {
                        const a = (i / 6) * Math.PI * 2;
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
                        ctx.lineTo(Math.cos(a) * (t.r * 0.44), Math.sin(a) * (t.r * 0.44));
                        ctx.stroke();
                    }

                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath();
                    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fde047';
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (t.kind === 'ice_crystal') {
                    // GLOWING GLACIAL ICE CRYSTAL CLUSTER
                    ctx.fillStyle = 'rgba(14, 116, 144, 0.25)';
                    ctx.beginPath(); ctx.arc(5, 7, t.r, 0, Math.PI * 2); ctx.fill();

                    const drawCrystalStar = (rad, fillCol, strokeCol, rot) => {
                        ctx.fillStyle = fillCol;
                        ctx.strokeStyle = strokeCol;
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        for (let i = 0; i < 12; i++) {
                            const r = (i % 2 === 0) ? rad : rad * 0.48;
                            const a = (i / 12) * Math.PI * 2 + rot;
                            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    };
                    drawCrystalStar(t.r, '#38bdf8', '#0284c7', 0);
                    drawCrystalStar(t.r * 0.72, '#bae6fd', '#0ea5e9', 0.52);
                    drawCrystalStar(t.r * 0.42, '#ffffff', '#38bdf8', 0);
                } else if (t.kind === 'xmas_tree') {
                    // ICE HURDLE: Festive Snow-Dusted Christmas Pine Tree with Star & Ornaments
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.30)';
                    ctx.beginPath();
                    ctx.arc(6, 8, t.r, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw 10-Pointed Starburst Evergreen Pine Branches
                    const drawStarPine = (radius, fillCol, strokeCol, rotOffset) => {
                        ctx.fillStyle = fillCol;
                        ctx.strokeStyle = strokeCol;
                        ctx.lineWidth = 2.2;
                        ctx.beginPath();
                        const points = 10;
                        for (let i = 0; i < points * 2; i++) {
                            const r = (i % 2 === 0) ? radius : radius * 0.62;
                            const a = (i / (points * 2)) * Math.PI * 2 + rotOffset;
                            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    };

                    drawStarPine(t.r, '#064e3b', '#022c22', 0);
                    drawStarPine(t.r * 0.74, '#047857', '#064e3b', 0.31);
                    drawStarPine(t.r * 0.48, '#e0f2fe', '#38bdf8', 0); // Snow-dusted crown

                    // Glowing Christmas Ornaments
                    const ornColors = ['#ff1e42', '#fbbf24', '#38bdf8', '#c084fc', '#00e676', '#ff1e42'];
                    for (let i = 0; i < 6; i++) {
                        const oa = (i / 6) * Math.PI * 2 + 0.2;
                        const ox = Math.cos(oa) * (t.r * 0.56);
                        const oy = Math.sin(oa) * (t.r * 0.56);
                        ctx.fillStyle = ornColors[i];
                        ctx.beginPath();
                        ctx.arc(ox, oy, 4.2, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // Golden Tree Topper Star in Center
                    ctx.fillStyle = '#fde047';
                    ctx.strokeStyle = '#b45309';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    // PARK GROUND HURDLE: Classic Leafy Park Tree
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
                    ctx.beginPath();
                    ctx.arc(7, 8, t.r, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#5c3a21';
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r * 0.38, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#14532d';
                    ctx.strokeStyle = '#052e16';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, t.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#16a34a';
                    ctx.beginPath();
                    ctx.arc(-t.r * 0.25, -t.r * 0.22, t.r * 0.62, 0, Math.PI * 2);
                    ctx.arc(t.r * 0.28, -t.r * 0.12, t.r * 0.55, 0, Math.PI * 2);
                    ctx.arc(0, t.r * 0.26, t.r * 0.58, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#4ade80';
                    ctx.beginPath();
                    ctx.arc(-t.r * 0.18, -t.r * 0.24, t.r * 0.35, 0, Math.PI * 2);
                    ctx.arc(t.r * 0.18, t.r * 0.12, t.r * 0.28, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        this.drawRevealPopups(ctx);
    }
};