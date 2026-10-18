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
        team_vs: SquadWarMode
    },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();

        InputManager.init();
        UIManager.init();

        // Bind Map Selectors across all modes
        document.querySelectorAll('.map-select-group').forEach(group => {
            group.querySelectorAll('.seg-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    SoundEngine.playUIClick();
                    MatchConfig.arenaKey = btn.dataset.arena;
                    document.querySelectorAll('.map-select-group .seg-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.arena === MatchConfig.arenaKey);
                    });
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
        this.arena = ARENA_PRESETS.park_ground;
        ArenaHazards.initForArena(this.arena);
        InputManager.gameplayActive = false;

        const colorKeys = ['blue', 'red', 'green', 'gold'];
        const spawns = PhysicsEngine.generateSpawnPositions(4, this.arena);
        for (let i = 0; i < 4; i++) {
            this.cars.push(new BattleCar({
                id: i + 1, label: `BOT ${i + 1}`, team: `DEMO_${i}`,
                isAI: true, colorKey: colorKeys[i],
                x: spawns[i].x, y: spawns[i].y, angle: spawns[i].angle
            }));
        }
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
        if (MatchConfig.mode === 'single') totalCombatants = 1 + MatchConfig.enemyBotCount;
        if (MatchConfig.mode === 'coop') totalCombatants = 2 + MatchConfig.allyBotCount + MatchConfig.enemyBotCount;
        if (MatchConfig.mode === 'team_vs') totalCombatants = 2 + MatchConfig.p1TeamBots + MatchConfig.p2TeamBots;

        // Use the selected map (Football Ground or Park Ground)
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

    drawArenaGround(ctx) {
        const W = this.arena.width, H = this.arena.height;

        if (!this.arena.hasHazards) {
            // ===============================================================
            // MAP 1: PLAIN FOOTBALL GROUND (Clean Open Pitch Without Hurdles)
            // ===============================================================
            ctx.fillStyle = '#1f6f38';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#247a3f';
            for (let x = 0; x < W; x += 280) {
                ctx.fillRect(x, 0, 140, H);
            }

            // Crisp White Football Pitch Markings
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 7;
            ctx.strokeRect(85, 85, W - 170, H - 170);

            // Halfway Line & Center Kickoff Circle
            ctx.beginPath();
            ctx.moveTo(W / 2, 85);
            ctx.lineTo(W / 2, H - 85);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 280, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 12, 0, Math.PI * 2);
            ctx.fill();

            // Left & Right Football Penalty Boxes
            ctx.strokeRect(85, H / 2 - 420, 380, 840);
            ctx.strokeRect(85, H / 2 - 200, 150, 400);
            ctx.strokeRect(W - 85 - 380, H / 2 - 420, 380, 840);
            ctx.strokeRect(W - 85 - 150, H / 2 - 200, 150, 400);
        } else {
            // ===============================================================
            // MAP 2: REALISTIC PARK GROUND (Grass, Walkways, Benches & Trees)
            // ===============================================================
            ctx.fillStyle = '#216836';
            ctx.fillRect(0, 0, W, H);

            // Subtle natural lawn variation
            ctx.fillStyle = '#26733d';
            for (let y = 0; y < H; y += 300) {
                ctx.fillRect(0, y, W, 150);
            }

            // Sandy / Gravel Park Walkways (Cross-shaped paths + Center Plaza Ring)
            ctx.fillStyle = 'rgba(180, 154, 118, 0.28)';
            ctx.fillRect(70, H / 2 - 75, W - 140, 150);
            ctx.fillRect(W / 2 - 75, 70, 150, H - 140);

            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 230, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 230, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Stadium Outer Dirt Track & Safety Bumper Wall
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 36; ctx.strokeRect(18, 18, W - 36, H - 36);
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 12; ctx.strokeRect(6, 6, W - 12, H - 12);
    },

    drawWorldEffects(ctx, dt) {
        for (let i = 0; i < this.tireTracks.length; i++) {
            const t = this.tireTracks[i];
            ctx.fillStyle = `rgba(42, 28, 16, ${t.alpha})`;
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
        const mapW = 185, mapH = Math.round(mapW * (this.arena.height / this.arena.width)), pad = 16;
        const x0 = this.canvas.width - mapW - pad, y0 = this.canvas.height - mapH - pad;
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.80)'; ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x0, y0, mapW, mapH, 8); ctx.fill(); ctx.stroke();

        // Draw Park Trees & Benches on Minimap
        for (const t of ArenaHazards.trees) {
            const tx = x0 + (t.x / this.arena.width) * mapW;
            const ty = y0 + (t.y / this.arena.height) * mapH;
            ctx.fillStyle = '#22c55e';
            ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2); ctx.fill();
        }
        for (const b of ArenaHazards.benches) {
            const bx = x0 + (b.x / this.arena.width) * mapW;
            const by = y0 + (b.y / this.arena.height) * mapH;
            ctx.fillStyle = '#d97706';
            ctx.fillRect(bx - 2, by - 2, 4, 4);
        }

        this.cars.forEach(c => {
            if (c.dead) return;
            const rx = x0 + (c.x / this.arena.width) * mapW, ry = y0 + (c.y / this.arena.height) * mapH;
            ctx.fillStyle = c.mainColor;
            ctx.beginPath(); ctx.arc(rx, ry, c.isAI ? 3.5 : 5.5, 0, Math.PI * 2); ctx.fill();
            if (!c.isAI) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke(); }
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
        ArenaHazards.drawGroundElements(ctx);
        this.drawWorldEffects(ctx, dt);
        for (const car of this.cars) car.draw(ctx, this.state !== 'MENU_BG');
        ArenaHazards.drawTreeCanopies(ctx);
        ctx.restore();

        KillAnnouncer.drawOverlay(ctx, this.canvas);
        this.drawMinimap(ctx);
        requestAnimationFrame((t) => this.loop(t));
    }
};

window.addEventListener('DOMContentLoaded', () => Game.init());
