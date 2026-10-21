const Game = {
    canvas: null,
    ctx: null,
    state: 'MENU_BG',
    arena: ARENA_PRESETS.expanded,
    isSpectating: false,
    timeScale: 1.0,
    lastWreckedCar: null,

    cars: [],
    tireTracks: [],
    particles: [],
    detachedParts: [],
    shockwaves: [],
    floatingTexts: [],
    pairCooldowns: new Map(),

    screenShake: 0,
    countdownTimer: 0,
    countdownNumber: 3,
    lastFrameTime: performance.now(),

    modeRegistry: {
        single:  SinglePlayerMode,
        '1v1':   Duel1v1Mode,
        coop:    CoopTeamMode,
        team_vs: SquadWarMode,
        ctf:     CaptureFlagMode
    },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();

        InputManager.init();
        UIManager.init();

        document.querySelectorAll('.map-select-group').forEach(group => {
            group.querySelectorAll('.seg-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    SoundEngine.playUIClick();
                    MatchConfig.arenaKey = btn.dataset.arena;
                    UIManager.refreshAllMapPreviews();
                    if (this.state === 'MENU_BG') {
                        this.setupMenuBackgroundPreview();
                    }
                });
            });
        });

        this.setupMenuBackgroundPreview();
        requestAnimationFrame((t) => this.loop(t));
    },

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    setSpectating(active, remainingCount = 0) {
        this.isSpectating = active;
        const bar = document.getElementById('spectator-bar');
        if (!bar) return;
        if (active) {
            bar.classList.remove('hidden');
            const countEl = document.getElementById('spec-remaining-count');
            if (countEl) countEl.textContent = remainingCount;
        } else {
            bar.classList.add('hidden');
        }
    },

    leaveSpectatorEarly() {
        this.setSpectating(false);
        const p1 = this.cars.find(c => c.playerSlot === 'p1');
        this.finishMatch({
            badge: 'SINGLE PLAYER RESULT',
            title: 'MATCH EXITED',
            subtitle: `${p1 ? p1.label : 'Player 1'} exited spectator mode while remaining bots were still fighting.`,
            color: '#fbbf24'
        });
    },

    clearWorldEntities() {
        this.cars = [];
        this.tireTracks = [];
        this.particles = [];
        this.detachedParts = [];
        this.shockwaves = [];
        this.floatingTexts = [];
        this.pairCooldowns.clear();
        this.screenShake = 0;
        this.timeScale = 1.0;
        this.lastWreckedCar = null;
        this.setSpectating(false);
        if (typeof KillAnnouncer !== 'undefined') KillAnnouncer.reset();
        InputManager.clearKeys();
    },

    setupMenuBackgroundPreview() {
        this.clearWorldEntities();
        this.state = 'MENU_BG';
        this.arena = ARENA_PRESETS[MatchConfig.arenaKey] || ARENA_PRESETS.park_ground;
        ArenaHazards.initForArena(this.arena);
        InputManager.gameplayActive = false;
    },

    startConfiguredMatch() {
        this.clearWorldEntities();
        InputManager.gameplayActive = false;
        TelemetryTracker.recordMatchStart();

        document.querySelectorAll('.menu-screen').forEach(el => el.classList.add('hidden'));
        document.getElementById('hud-overlay').classList.remove('hidden');
        UIManager.syncCameraModeUI();

        TimedSiegeMode.initTimer();

        let totalCombatants = 2;
        if (MatchConfig.mode === 'single') totalCombatants = MatchConfig.spSubMode === 'team' ? (1 + MatchConfig.spAllyBots + MatchConfig.spEnemyBots) : (1 + MatchConfig.enemyBotCount);
        if (MatchConfig.mode === 'coop') totalCombatants = 2 + MatchConfig.allyBotCount + MatchConfig.enemyBotCount;
        if (MatchConfig.mode === 'team_vs') totalCombatants = 2 + MatchConfig.p1TeamBots + MatchConfig.p2TeamBots;

        this.arena = ARENA_PRESETS[MatchConfig.arenaKey] || ARENA_PRESETS.expanded;
        ArenaHazards.initForArena(this.arena);

        const spawns = PhysicsEngine.generateSpawnPositions(totalCombatants, this.arena);
        const activeMode = this.modeRegistry[MatchConfig.mode] || SinglePlayerMode;
        activeMode.spawn(this.cars, spawns);

        CameraController.resetToArena(this.arena, this.canvas);
        UIManager.updateHUD(this.cars);

        this.state = 'COUNTDOWN';
        this.countdownNumber = 3;
        this.countdownTimer = 60;
        const cdOverlay = document.getElementById('countdown-overlay');
        cdOverlay.classList.remove('hidden');
        document.getElementById('countdown-text').textContent = '3';
        document.getElementById('countdown-sub').textContent = 'START YOUR ENGINES!';
        SoundEngine.playCountdownBeep(false);
    },

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            InputManager.gameplayActive = false;
            InputManager.clearKeys();
            document.getElementById('modal-pause').classList.remove('hidden');
            SoundEngine.playUIClick();
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            InputManager.gameplayActive = true;
            document.getElementById('modal-pause').classList.add('hidden');
            SoundEngine.playUIClick();
        }
    },

    returnToMainMenu() {
        document.getElementById('hud-overlay').classList.add('hidden');
        document.getElementById('countdown-overlay').classList.add('hidden');
        document.getElementById('modal-pause').classList.add('hidden');
        document.getElementById('modal-results').classList.add('hidden');
        this.setupMenuBackgroundPreview();
        UIManager.showScreen('screen-main-menu');
    },

    finishMatch(outcome) {
        if (this.state === 'RESULTS') return;
        this.state = 'RESULTS';
        this.timeScale = 1.0;
        this.setSpectating(false);
        InputManager.gameplayActive = false;
        InputManager.clearKeys();
        TelemetryTracker.recordPlayerMatchStats(this.cars, outcome);
        UIManager.updateHUD(this.cars);
        setTimeout(() => {
            if (this.state === 'RESULTS') UIManager.showMatchResults(outcome);
        }, 450);
    },

    addTireTrack(car, fx, fy, rx, ry) {
        const maxTracks = UserSettings.gfxQuality === 'high' ? 650 : 220;
        const rearX = car.x - fx * (car.length * 0.34), rearY = car.y - fy * (car.length * 0.34);
        const wOff = car.width * 0.42;
        this.tireTracks.push({
            x1: rearX + rx * wOff, y1: rearY + ry * wOff,
            x2: rearX - rx * wOff, y2: rearY - ry * wOff, alpha: 0.42
        });
        if (this.tireTracks.length > maxTracks) this.tireTracks.shift();
    },

    spawnSparks(x, y, count) {
        const total = Math.ceil(count * (UserSettings.gfxQuality === 'high' ? 1 : 0.45));
        for (let i = 0; i < total; i++) {
            const ang = Math.random() * Math.PI * 2, spd = 2 + Math.random() * 8.5;
            this.particles.push({
                x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
                size: 2.5 + Math.random() * 3, color: Math.random() < 0.5 ? '#fde047' : '#f97316',
                alpha: 1, decay: 0.035
            });
        }
    },

    spawnSmoke(x, y, fiery = false) {
        if (UserSettings.gfxQuality === 'low' && Math.random() < 0.5) return;
        this.particles.push({
            x, y, vx: (Math.random() - 0.5) * 1.3, vy: (Math.random() - 0.5) * 1.3,
            size: fiery ? 5 + Math.random() * 6 : 7 + Math.random() * 7,
            color: fiery && Math.random() < 0.48 ? '#f97316' : '#334155',
            alpha: 0.65, decay: 0.022
        });
    },

    spawnDetachedPart(x, y, angle, w, h, color) {
        const ang = Math.random() * Math.PI * 2, spd = 3 + Math.random() * 6.5;
        this.detachedParts.push({
            x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            angle, vAng: (Math.random() - 0.5) * 0.25, w, h, color
        });
        if (this.detachedParts.length > 75) this.detachedParts.shift();
    },

    triggerExplosion(car) {
        this.lastWreckedCar = car;
        this.screenShake = 24;
        this.shockwaves.push({ x: car.x, y: car.y, r: 12, maxR: 175, alpha: 1, color: '#f97316' });
        this.spawnSparks(car.x, car.y, 42);
        for (let i = 0; i < 6; i++) {
            this.spawnDetachedPart(car.x, car.y, Math.random() * Math.PI * 2, 16, 10, i % 2 === 0 ? car.mainColor : '#1e293b');
        }
        this.floatingTexts.push({ x: car.x, y: car.y - 30, text: `${car.label} WRECKED!`, color: '#ff4d6d', life: 1.4 });

        if (typeof KillAnnouncer !== 'undefined' && this.state === 'PLAYING') {
            KillAnnouncer.onCarKilled(car.lastAttacker, car);
        }
    },

    drawArenaGround(ctx, targetArena = null) {
        const ar = targetArena || this.arena;
        const W = ar.width, H = ar.height;
        const cx = W / 2, cy = H / 2;
        const mapId = ar.id;

        if (mapId === 'expanded') {
            // ===============================================================
            // MAP 1: FOOTBALL GROUND (Open Stadium Pitch)
            // ===============================================================
            ctx.fillStyle = '#1f6f38';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#247a3f';
            for (let x = 0; x < W; x += 280) {
                ctx.fillRect(x, 0, 140, H);
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 7;
            ctx.strokeRect(85, 85, W - 170, H - 170);

            ctx.beginPath();
            ctx.moveTo(cx, 85);
            ctx.lineTo(cx, H - 85);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, 280, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.arc(cx, cy, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeRect(85, cy - 420, 380, 840);
            ctx.strokeRect(85, cy - 200, 150, 400);
            ctx.strokeRect(W - 85 - 380, cy - 420, 380, 840);
            ctx.strokeRect(W - 85 - 150, cy - 200, 150, 400);

            ctx.strokeStyle = '#78350f'; ctx.lineWidth = 36; ctx.strokeRect(18, 18, W - 36, H - 36);
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, W - 12, H - 12);
        } else if (mapId === 'desert_dunes') {
            // ===============================================================
            // MAP 3: DESERT DUNES (Golden Sand Waves, Oasis Lagoon & Canyon Rocks)
            // ===============================================================
            const sandGrad = ctx.createLinearGradient(0, 0, W, H);
            sandGrad.addColorStop(0, '#d99b4e');
            sandGrad.addColorStop(0.5, '#c68336');
            sandGrad.addColorStop(1, '#b36f24');
            ctx.fillStyle = sandGrad;
            ctx.fillRect(0, 0, W, H);

            // Sweeping Organic Desert Sand Dune Ridges (NO football/park lines!)
            for (let i = 0; i < 6; i++) {
                const yBase = 220 + i * 320;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.16)' : 'rgba(146, 64, 14, 0.14)';
                ctx.beginPath();
                ctx.moveTo(0, yBase);
                ctx.bezierCurveTo(W * 0.28, yBase - 140, W * 0.68, yBase + 140, W, yBase - 30);
                ctx.lineTo(W, yBase + 180);
                ctx.lineTo(0, yBase + 180);
                ctx.closePath();
                ctx.fill();

                // Sharp sunlit dune crest line
                ctx.strokeStyle = 'rgba(254, 243, 199, 0.24)';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(40, yBase);
                ctx.bezierCurveTo(W * 0.28, yBase - 140, W * 0.68, yBase + 140, W - 40, yBase - 30);
                ctx.stroke();
            }

            // Center Desert Oasis Beach & Shimmering Turquoise Water Lagoon
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.ellipse(cx, cy, 280, 195, -0.15, 0, Math.PI * 2);
            ctx.fill();

            const oasisGrad = ctx.createRadialGradient(cx - 30, cy - 20, 20, cx, cy, 220);
            oasisGrad.addColorStop(0, '#67e8f9');
            oasisGrad.addColorStop(0.65, '#06b6d4');
            oasisGrad.addColorStop(1, '#0e7490');
            ctx.fillStyle = oasisGrad;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 220, 145, -0.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(cx - 25, cy - 12, 130, 75, -0.15, 0, Math.PI * 2);
            ctx.stroke();

            // Rugged Red-Rock Canyon Perimeter Wall
            ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 38; ctx.strokeRect(18, 18, W - 36, H - 36);
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, W - 12, H - 12);
        } else if (mapId === 'ice_rink') {
            // ===============================================================
            // MAP 4: FROSTBITE ICE (100% Circular White & Glacial Crystal Dome!)
            // ===============================================================
            // Dark Arctic Abyss outside the circular ice dome
            ctx.fillStyle = '#050b14';
            ctx.fillRect(0, 0, W, H);

            const rArena = ar.radius || 1130;

            // Outer Snowdrift Halo around the Circular Dome
            const haloGrad = ctx.createRadialGradient(cx, cy, rArena - 20, cx, cy, rArena + 70);
            haloGrad.addColorStop(0, 'rgba(186, 230, 253, 0.55)');
            haloGrad.addColorStop(1, 'rgba(5, 11, 20, 0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, rArena + 70, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, rArena, 0, Math.PI * 2);
            ctx.clip();

            // 1. Pure Glacial White-Ice Base Sheet
            const iceGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, rArena);
            iceGrad.addColorStop(0, '#ffffff');
            iceGrad.addColorStop(0.52, '#f0f9ff');
            iceGrad.addColorStop(0.84, '#e0f2fe');
            iceGrad.addColorStop(1, '#bae6fd');
            ctx.fillStyle = iceGrad;
            ctx.fillRect(0, 0, W, H);

            // 2. Geometric Crystalline Ice Facets across the frozen dome
            for (let i = 0; i < 12; i++) {
                const a1 = (i / 12) * Math.PI * 2;
                const a2 = ((i + 1) / 12) * Math.PI * 2;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(186, 230, 253, 0.30)' : 'rgba(255, 255, 255, 0.45)';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a1) * rArena, cy + Math.sin(a1) * rArena);
                ctx.lineTo(cx + Math.cos(a2) * rArena, cy + Math.sin(a2) * rArena);
                ctx.closePath();
                ctx.fill();
            }

            // 3. Giant Etched Ice Crystal Snowflake in the Center of the Dome
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
            ctx.lineWidth = 6;
            for (let k = 0; k < 6; k++) {
                const ang = (k / 6) * Math.PI * 2;
                const ex = cx + Math.cos(ang) * 340;
                const ey = cy + Math.sin(ang) * 340;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(ex, ey);
                ctx.stroke();

                // Crystal branches on each snowflake arm
                const bx = cx + Math.cos(ang) * 210;
                const by = cy + Math.sin(ang) * 210;
                ctx.beginPath();
                ctx.moveTo(bx + Math.cos(ang + 0.65) * 65, by + Math.sin(ang + 0.65) * 65);
                ctx.lineTo(bx, by);
                ctx.lineTo(bx + Math.cos(ang - 0.65) * 65, by + Math.sin(ang - 0.65) * 65);
                ctx.stroke();
            }

            // 4. Natural Jagged Ice Fracture / Crack Lines
            ctx.strokeStyle = 'rgba(14, 165, 233, 0.32)';
            ctx.lineWidth = 3.5;
            const cracks = [
                [[cx - 280, cy - 180], [cx - 520, cy - 290], [cx - 740, cy - 220], [cx - 920, cy - 360]],
                [[cx + 260, cy + 160], [cx + 510, cy + 310], [cx + 760, cy + 250], [cx + 940, cy + 410]],
                [[cx + 220, cy - 240], [cx + 460, cy - 480], [cx + 680, cy - 440]],
                [[cx - 240, cy + 220], [cx - 480, cy + 490], [cx - 710, cy + 430]]
            ];
            cracks.forEach(chain => {
                ctx.beginPath();
                chain.forEach(([px, py], idx) => {
                    if (idx === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                });
                ctx.stroke();
            });

            // 5. Soft White Snowdrifts Banking the Inner Circular Edge
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 42;
            ctx.beginPath();
            ctx.arc(cx, cy, rArena - 18, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();

            // 6. Thick Circular Glacial Crystal Wall Border
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 26;
            ctx.beginPath();
            ctx.arc(cx, cy, rArena, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(cx, cy, rArena + 6, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // ===============================================================
            // MAP 2: PARK GROUND (Grass, Walkways, Benches & Trees)
            // ===============================================================
            ctx.fillStyle = '#216836';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#26733d';
            for (let y = 0; y < H; y += 300) {
                ctx.fillRect(0, y, W, 150);
            }

            ctx.fillStyle = 'rgba(180, 154, 118, 0.28)';
            ctx.fillRect(70, cy - 75, W - 140, 150);
            ctx.fillRect(cx - 75, 70, 150, H - 140);

            ctx.beginPath();
            ctx.arc(cx, cy, 230, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx, cy, 230, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#78350f'; ctx.lineWidth = 36; ctx.strokeRect(18, 18, W - 36, H - 36);
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, W - 12, H - 12);
        }
    },

    drawWorldEffects(ctx, dt) {
        const isIce = this.arena.id === 'ice_rink';
        const isDesert = this.arena.id === 'desert_dunes';
        for (let i = 0; i < this.tireTracks.length; i++) {
            const t = this.tireTracks[i];
            ctx.fillStyle = isIce
                ? `rgba(14, 165, 233, ${t.alpha * 0.65})`
                : (isDesert ? `rgba(120, 53, 15, ${t.alpha})` : `rgba(42, 28, 16, ${t.alpha})`);
            ctx.beginPath(); ctx.arc(t.x1, t.y1, 3.8, 0, Math.PI * 2); ctx.arc(t.x2, t.y2, 3.8, 0, Math.PI * 2); ctx.fill();
            if (this.state === 'PLAYING' || this.state === 'MENU_BG') t.alpha *= 0.996;
        }
        for (let i = 0; i < this.detachedParts.length; i++) {
            const p = this.detachedParts[i];
            if (this.state !== 'PAUSED') {
                p.x += p.vx * dt; p.y += p.vy * dt;
                p.vx *= Math.pow(0.90, dt); p.vy *= Math.pow(0.90, dt);
                p.angle += p.vAng * dt; p.vAng *= Math.pow(0.90, dt);
            }
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
            ctx.fillStyle = p.color; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.5;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const s = this.shockwaves[i];
            if (this.state !== 'PAUSED') { s.r += (s.maxR - s.r) * 0.22 * dt; s.alpha -= 0.045 * dt; }
            if (s.alpha <= 0) { this.shockwaves.splice(i, 1); continue; }
            ctx.strokeStyle = s.color; ctx.globalAlpha = Math.max(0, s.alpha); ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (this.state !== 'PAUSED') { p.x += p.vx * dt; p.y += p.vy * dt; p.alpha -= p.decay * dt; }
            if (p.alpha <= 0) { this.particles.splice(i, 1); continue; }
            ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            if (this.state !== 'PAUSED') { ft.y -= 1.3 * dt; ft.life -= 0.022 * dt; }
            if (ft.life <= 0) { this.floatingTexts.splice(i, 1); continue; }
            ctx.save(); ctx.font = '900 22px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
            ctx.globalAlpha = Math.min(1, ft.life); ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
            ctx.strokeText(ft.text, ft.x, ft.y); ctx.fillStyle = ft.color; ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    },

    drawMinimap(ctx) {
        if (this.state === 'MENU_BG') return;
        const pad = 16;

        // If playing on the Circular Ice Arena, render a Circular Radar Minimap!
        if (this.arena.isCircular) {
            const mapSize = 156;
            const x0 = this.canvas.width - mapSize - pad;
            const y0 = this.canvas.height - mapSize - pad;
            const mcx = x0 + mapSize / 2, mcy = y0 + mapSize / 2;
            const scale = mapSize / this.arena.width;

            ctx.save();
            ctx.fillStyle = 'rgba(224, 242, 254, 0.88)';
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(mcx, mcy, (this.arena.radius || 1130) * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            for (const t of ArenaHazards.trees) {
                const tx = x0 + t.x * scale, ty = y0 + t.y * scale;
                ctx.fillStyle = t.kind === 'ice_crystal' ? '#0284c7' : '#065f46';
                ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2); ctx.fill();
            }

            if (ArenaHazards.powerups) {
                for (const orb of ArenaHazards.powerups) {
                    const ox = x0 + orb.x * scale, oy = y0 + orb.y * scale;
                    ctx.fillStyle = '#f59e0b';
                    ctx.strokeStyle = '#090d16';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.arc(ox, oy, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                }
            }

            this.cars.forEach(c => {
                if (c.dead) return;
                const rx = x0 + c.x * scale, ry = y0 + c.y * scale;
                ctx.fillStyle = c.mainColor;
                ctx.beginPath(); ctx.arc(rx, ry, c.isAI ? 3.8 : 5.5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#090d16';
                ctx.lineWidth = c.isAI ? 1.2 : 2.0;
                ctx.stroke();
            });
            ctx.restore();
            return;
        }

        const mapW = 185, mapH = Math.round(mapW * (this.arena.height / this.arena.width));
        const x0 = this.canvas.width - mapW - pad, y0 = this.canvas.height - mapH - pad;
        const scaleX = mapW / this.arena.width, scaleY = mapH / this.arena.height;

        ctx.save();
        ctx.fillStyle = this.arena.id === 'desert_dunes' ? 'rgba(69, 26, 3, 0.86)' : 'rgba(15, 23, 42, 0.84)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x0, y0, mapW, mapH, 8);
        ctx.fill();
        ctx.stroke();

        for (const b of ArenaHazards.benches) {
            const bx = x0 + b.x * scaleX, by = y0 + b.y * scaleY;
            const bw = Math.max(3, b.w * scaleX), bh = Math.max(2, b.h * scaleY);
            ctx.fillStyle = '#a16207';
            ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
        }

        for (const t of ArenaHazards.trees) {
            const tx = x0 + t.x * scaleX, ty = y0 + t.y * scaleY;
            ctx.fillStyle = '#14532d';
            ctx.strokeStyle = '#854d0e';
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(tx, ty, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }

        if (ArenaHazards.powerups) {
            for (const orb of ArenaHazards.powerups) {
                const ox = x0 + orb.x * scaleX, oy = y0 + orb.y * scaleY;
                ctx.fillStyle = orb.spec.coreColor;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(ox, oy, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
        }

        this.cars.forEach(c => {
            if (c.dead) return;
            const rx = x0 + c.x * scaleX, ry = y0 + c.y * scaleY;
            ctx.fillStyle = c.mainColor;
            ctx.beginPath(); ctx.arc(rx, ry, c.isAI ? 3.8 : 5.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = c.isAI ? '#090d16' : '#ffffff';
            ctx.lineWidth = c.isAI ? 1.2 : 1.8;
            ctx.stroke();
        });
        ctx.restore();
    },

    loop(now) {
        const realDt = Math.min(2.2, (now - this.lastFrameTime) / 16.666);
        this.lastFrameTime = now;
        const dt = realDt * this.timeScale;

        if (this.state === 'COUNTDOWN') {
            this.countdownTimer -= realDt;
            if (this.countdownTimer <= 0) {
                this.countdownNumber--;
                if (this.countdownNumber > 0) {
                    this.countdownTimer = 60;
                    document.getElementById('countdown-text').textContent = this.countdownNumber;
                    SoundEngine.playCountdownBeep(false);
                } else if (this.countdownNumber === 0) {
                    this.countdownTimer = 35;
                    document.getElementById('countdown-text').textContent = 'CRASH!';
                    document.getElementById('countdown-sub').textContent = 'GO!';
                    SoundEngine.playCountdownBeep(true);
                    this.state = 'PLAYING';
                    InputManager.gameplayActive = true;
                }
            }
        } else if (this.state === 'PLAYING' && this.countdownNumber === 0) {
            this.countdownTimer -= realDt;
            if (this.countdownTimer <= 0) {
                document.getElementById('countdown-overlay').classList.add('hidden');
                this.countdownNumber = -1;
            }
        }

        if (this.state === 'PLAYING' || this.state === 'MENU_BG' || this.state === 'RESULTS') {
            for (const car of this.cars) {
                let input = { up: false, down: false, steer: 0, drift: false, throttle: 1.0 };
                if (this.state === 'PLAYING' || this.state === 'MENU_BG') {
                    if (car.isAI && car.aiBrain) input = car.aiBrain.update(this.cars, this.arena, dt);
                    else if (car.playerSlot) input = InputManager.getPlayerInput(car.playerSlot);
                }
                PhysicsEngine.updateCarMovement(car, input, dt, this.arena);
                if (this.state === 'MENU_BG' && car.dead && Math.random() < 0.01) car.reset();
            }

            ArenaHazards.updateAndCollide(this.cars, dt);
            PhysicsEngine.resolveAllCollisions(this.cars);

            if (this.state === 'PLAYING') {
                KillAnnouncer.update(realDt);
                const activeMode = this.modeRegistry[MatchConfig.mode];
                const outcome = activeMode ? activeMode.checkResult(this.cars, dt) : null;
                if (outcome) this.finishMatch(outcome);
                UIManager.updateHUD(this.cars);
            }
        }

        if (!KillAnnouncer.slowMoActive) {
            CameraController.update(this.cars, this.arena, this.canvas, this.state);
        }

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        if (this.screenShake > 0.2 && this.state !== 'PAUSED') {
            ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
            this.screenShake *= Math.pow(0.86, realDt);
        }

        ctx.scale(CameraController.zoom, CameraController.zoom);
        ctx.translate(-CameraController.x, -CameraController.y);

        this.drawArenaGround(ctx);
        if (this.state !== 'MENU_BG' && typeof TimedSiegeMode !== 'undefined') TimedSiegeMode.drawRespawnBases(ctx, this.arena, this.cars);
        ArenaHazards.drawGroundElements(ctx);
        this.drawWorldEffects(ctx, dt);
        for (const car of this.cars) car.draw(ctx, this.state !== 'MENU_BG');
        if (this.state !== 'MENU_BG' && typeof CaptureFlagMode !== 'undefined') CaptureFlagMode.drawFlagsAndStands(ctx);
        ArenaHazards.drawTreeCanopies(ctx);
        ctx.restore();

        KillAnnouncer.drawOverlay(ctx, this.canvas);
        this.drawMinimap(ctx);
        requestAnimationFrame((t) => this.loop(t));
    }
};

window.addEventListener('DOMContentLoaded', () => Game.init());