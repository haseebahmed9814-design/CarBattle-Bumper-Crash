const POWERUP_CATALOG = [
    {
        id: 'repair_partial',
        name: 'REPAIR KIT (+65 HP)',
        shortTag: '+65 HP REPAIR',
        coreColor: '#10b981',
        lightColor: '#d1fae5',
        darkColor: '#064e3b',
        ringColor: '#34d399',
        isInstantHeal: true
    },
    {
        id: 'repair_full',
        name: 'MEGA MEDKIT (100% FULL HP)',
        shortTag: '100% MEGA HEAL!',
        coreColor: '#0284c7',
        lightColor: '#e0f2fe',
        darkColor: '#0c4a6e',
        ringColor: '#38bdf8',
        isInstantHeal: true
    },
    {
        id: 'inferno_ram',
        name: 'INFERNO FIRE RAM (12S)',
        shortTag: 'INFERNO RAM! (12s)',
        coreColor: '#ea580c',
        lightColor: '#fef08a',
        darkColor: '#7c2d12',
        ringColor: '#ff4d6d',
        durationFrames: 720
    },
    {
        id: 'titan_shield',
        name: 'TITAN ARMOR SHIELD (10S)',
        shortTag: 'TITAN SHIELD! (10s)',
        coreColor: '#7c3aed',
        lightColor: '#ede9fe',
        darkColor: '#3b0764',
        ringColor: '#c084fc',
        durationFrames: 600
    },
    {
        id: 'hyper_nitro',
        name: 'TURBO SPEED BOOST (10S)',
        shortTag: 'TURBO SPEED! (10s)',
        coreColor: '#eab308',
        lightColor: '#fef9c3',
        darkColor: '#713f12',
        ringColor: '#fde047',
        durationFrames: 600
    }
];

const ArenaHazards = {
    trees: [],
    benches: [],
    powerups: [],
    dropTimerFrames: 1800, // 30 seconds at 60fps (30 * 60 = 1800 frames)
    dropIntervalFrames: 1800,
    nextDropId: 1,

    initForArena(arena) {
        this.trees = [];
        this.benches = [];
        this.powerups = [];
        this.dropTimerFrames = this.dropIntervalFrames; // First drop after 30 seconds
        this.nextDropId = 1;

        if (!arena.hasHazards) return;

        const cx = arena.width / 2;
        const cy = arena.height / 2;

        // Expanded Trees across center, mid-field, and outer driving lanes (14 trees)
        this.trees = [
            { x: cx - 560,  y: cy - 380, r: 44, shake: 0 },
            { x: cx + 560,  y: cy - 380, r: 44, shake: 0 },
            { x: cx - 560,  y: cy + 380, r: 44, shake: 0 },
            { x: cx + 560,  y: cy + 380, r: 44, shake: 0 },
            { x: cx,        y: cy - 520, r: 42, shake: 0 },
            { x: cx,        y: cy + 520, r: 42, shake: 0 },
            { x: cx - 980,  y: cy,       r: 46, shake: 0 },
            { x: cx + 980,  y: cy,       r: 46, shake: 0 },
            { x: cx - 1220, y: cy - 640, r: 45, shake: 0 },
            { x: cx + 1220, y: cy - 640, r: 45, shake: 0 },
            { x: cx - 1220, y: cy + 640, r: 45, shake: 0 },
            { x: cx + 1220, y: cy + 640, r: 45, shake: 0 },
            { x: cx - 640,  y: cy - 760, r: 40, shake: 0 },
            { x: cx + 640,  y: cy + 760, r: 40, shake: 0 }
        ];

        // Expanded Wooden Park Benches across inner plaza and outer straightaways (10 benches)
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

    findSafeDropSpot(arena) {
        const margin = arena.wallPad + 240;
        for (let attempt = 0; attempt < 30; attempt++) {
            const x = margin + Math.random() * (arena.width - margin * 2);
            const y = margin + Math.random() * (arena.height - margin * 2);
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
                if (Math.hypot(x - p.x, y - p.y) < 260) { clear = false; break; }
            }
            if (clear) return { x, y };
        }
        return { x: arena.width / 2, y: arena.height / 2 };
    },

    spawnRandomSupplyDrop(arena) {
        if (this.powerups.length >= 3) this.powerups.shift();
        const spec = POWERUP_CATALOG[Math.floor(Math.random() * POWERUP_CATALOG.length)];
        const spot = this.findSafeDropSpot(arena);

        this.powerups.push({
            uid: this.nextDropId++,
            spec,
            x: spot.x,
            y: spot.y,
            r: 44, // Large 44px 3D Orb for immediate visual clarity!
            dropProgress: 0,
            spawnTime: performance.now()
        });

        Game.shockwaves.push({
            x: spot.x, y: spot.y, r: 12, maxR: 160, alpha: 0.95, color: spec.ringColor
        });

        if (typeof KillAnnouncer !== 'undefined' && Game.state === 'PLAYING' && !KillAnnouncer.slowMoActive) {
            KillAnnouncer.showBanner('SUPPLY DROP INCOMING!', `${spec.name} landed in the Arena!`, spec.ringColor, 95);
        }
    },

    applyPowerupToCar(car, orb) {
        const spec = orb.spec;
        SoundEngine.playPowerupPickup(!!spec.isInstantHeal);

        Game.shockwaves.push({
            x: orb.x, y: orb.y, r: 10, maxR: 140, alpha: 1.0, color: spec.ringColor
        });
        this.spawnLeafParticles(orb.x, orb.y, 18, spec.coreColor);

        if (spec.id === 'repair_partial') {
            const healAmt = 65;
            car.hp = Math.min(car.maxHp, car.hp + healAmt);
            car.dentFront *= 0.5; car.dentRear *= 0.5;
            car.dentLeft *= 0.5;  car.dentRight *= 0.5;
            Game.floatingTexts.push({
                x: car.x, y: car.y - 34,
                text: `${car.label} +65 HP REPAIR!`,
                color: '#34d399', life: 1.25
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
                text: `${car.label} 100% MEGA MEDKIT!`,
                color: '#00e676', life: 1.35
            });
        } else {
            car.activePowerup = spec.id;
            car.powerupTimer = spec.durationFrames;
            car.powerupMaxTimer = spec.durationFrames;
            car.powerupMeta = spec;
            Game.floatingTexts.push({
                x: car.x, y: car.y - 34,
                text: `${car.label}: ${spec.shortTag}`,
                color: spec.ringColor, life: 1.35
            });
        }
    },

    updateAndCollide(cars, dt) {
        // 1. Tick 30-Second Supply Drop Spawner during active matches
        if (Game.state === 'PLAYING') {
            this.dropTimerFrames -= dt;
            if (this.dropTimerFrames <= 0) {
                this.dropTimerFrames = this.dropIntervalFrames; // 30 seconds (1800 frames)
                this.spawnRandomSupplyDrop(Game.arena);
            }
        }

        // 2. Update & Collide Active 3D Power-Up Orbs
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const orb = this.powerups[i];
            if (orb.dropProgress < 1) {
                orb.dropProgress = Math.min(1, orb.dropProgress + 0.028 * dt);
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

        // 3. Little Trees
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
                        this.spawnLeafParticles(tree.x + nx * tree.r * 0.5, tree.y + ny * tree.r * 0.5, 6, '#16a34a');
                    }
                }
            }
        }

        // 4. Wooden Park Benches
        for (const b of this.benches) {
            if (b.hitTimer > 0) b.hitTimer = Math.max(0, b.hitTimer - 0.08 * dt);

            const halfW = b.w / 2;
            const halfH = b.h / 2;

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

    drawPowerupLogo(ctx, id) {
        ctx.save();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (id === 'repair_partial') {
            // SINGLE LARGE GREEN PLUS (+) ON CRISP WHITE DISC
            ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
            ctx.strokeStyle = '#064e3b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            this.drawGreenPlus(ctx, 0, 0, 16, 9);
        } else if (id === 'repair_full') {
            // FULL MEDICATED KIT SUITCASE WITH THREE GREEN PLUSES (+ + +)
            // Top Suitcase Handle
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.roundRect(-10, -23, 20, 8, 3);
            ctx.stroke();

            // White Medkit Box Body
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.roundRect(-26, -16, 52, 34, 6);
            ctx.fill();
            ctx.stroke();

            // Three Distinct Bright Green Plus Signs inside the Medkit!
            this.drawGreenPlus(ctx, 0, -2, 8.5, 4.8);     // Center Main Green Plus
            this.drawGreenPlus(ctx, -15, 2, 5.8, 3.4);    // Left Green Plus
            this.drawGreenPlus(ctx, 15, 2, 5.8, 3.4);     // Right Green Plus
        } else if (id === 'inferno_ram') {
            // GIANT BLAZING MULTI-LAYER FLAME EMBLEM
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, -24);
            ctx.bezierCurveTo(20, -10, 22, 12, 0, 23);
            ctx.bezierCurveTo(-22, 12, -20, -10, -5, -15);
            ctx.quadraticCurveTo(-1, -6, 0, -24);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.bezierCurveTo(12, -4, 13, 10, 0, 19);
            ctx.bezierCurveTo(-13, 10, -12, -4, 0, -14);
            ctx.fill();

            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, 9, 6.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (id === 'titan_shield') {
            // GIANT METALLIC ARMOR SHIELD CREST
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#1e1b4b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -23);
            ctx.lineTo(20, -15);
            ctx.quadraticCurveTo(20, 10, 0, 24);
            ctx.quadraticCurveTo(-20, 10, -20, -15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.moveTo(0, -16);
            ctx.lineTo(13, -10);
            ctx.quadraticCurveTo(13, 6, 0, 17);
            ctx.quadraticCurveTo(-13, 6, -13, -10);
            ctx.closePath();
            ctx.fill();
        } else if (id === 'hyper_nitro') {
            // UNMISTAKABLE SPEEDOMETER GAUGE + DOUBLE TURBO CHEVRONS (>>)
            // Dark Gauge Dial Face
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 2, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Speedometer Green-to-Red Tachometer Arc
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.arc(0, 4, 17, Math.PI * 0.85, Math.PI * 1.65);
            ctx.stroke();

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.arc(0, 4, 17, Math.PI * 1.65, Math.PI * 2.15);
            ctx.stroke();

            // High-Speed Needle Pegged to the Right Redline!
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(13, -8);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 4, 4, 0, Math.PI * 2);
            ctx.fill();

            // Bold Forward Speed Arrows (>>) at the bottom of the gauge
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-8, 11); ctx.lineTo(-2, 15); ctx.lineTo(-8, 19);
            ctx.moveTo(2, 11);  ctx.lineTo(8, 15);  ctx.lineTo(2, 19);
            ctx.stroke();
        }
        ctx.restore();
    },

    drawPowerupOrbs(ctx) {
        if (this.powerups.length === 0) return;
        const now = performance.now();

        for (const orb of this.powerups) {
            const spec = orb.spec;
            const pulse = Math.sin(now * 0.006 + orb.uid) * 4.5;
            const scale = 0.45 + 0.55 * orb.dropProgress;
            const altitudeOffset = (1 - orb.dropProgress) * 150;

            ctx.save();
            ctx.translate(orb.x, orb.y);

            // Ground Drop Target Ring & Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.ellipse(5, 10, orb.r * scale, orb.r * 0.72 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = spec.ringColor;
            ctx.globalAlpha = 0.65;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, orb.r + 10 + pulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;

            ctx.translate(0, -altitudeOffset);
            ctx.scale(scale, scale);

            // Rotating Outer 3D Orbital Tech Ring
            ctx.save();
            ctx.rotate(now * 0.0032 + orb.uid);
            ctx.strokeStyle = spec.lightColor;
            ctx.lineWidth = 3.5;
            ctx.setLineDash([16, 10]);
            ctx.beginPath();
            ctx.arc(0, 0, orb.r + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // 3D Sphere Radial Gradient Body
            ctx.save();
            ctx.shadowColor = spec.ringColor;
            ctx.shadowBlur = 24;
            const grad = ctx.createRadialGradient(-orb.r * 0.32, -orb.r * 0.35, 4, 0, 0, orb.r);
            grad.addColorStop(0, spec.lightColor);
            grad.addColorStop(0.50, spec.coreColor);
            grad.addColorStop(1, spec.darkColor);

            ctx.fillStyle = grad;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.arc(0, 0, orb.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Large Center Ability Emblem / Logo
            this.drawPowerupLogo(ctx, spec.id);

            // 3D Glossy Specular Glass Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.ellipse(-orb.r * 0.30, -orb.r * 0.36, orb.r * 0.34, orb.r * 0.16, -0.45, 0, Math.PI * 2);
            ctx.fill();

            // High-Contrast Floating Label Below Orb
            ctx.font = '900 13px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.94)';
            ctx.lineWidth = 4;
            ctx.strokeText(spec.shortTag, 0, orb.r + 22);
            ctx.fillStyle = spec.lightColor;
            ctx.fillText(spec.shortTag, 0, orb.r + 22);

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
        if (this.trees.length === 0) return;

        for (const t of this.trees) {
            ctx.save();
            const sx = t.shake > 0 ? Math.sin(performance.now() * 0.06) * 3 * t.shake : 0;
            const sy = t.shake > 0 ? Math.cos(performance.now() * 0.06) * 3 * t.shake : 0;
            ctx.translate(t.x + sx, t.y + sy);

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

            ctx.restore();
        }
    }
};