const UIManager = {
    init() {
        this.populateVersionLabels();
        this.buildAllColorPickers();
        this.bindNameInputs();
        this.bindScreenNavigation();
        this.bindSinglePlayerConfig();
        this.bindSpTeamConfig();
        this.bind1v1Config();
        this.bindCoopConfig();
        this.bindTeamVsConfig();
        this.bindSettings();
        this.bindControlsScreen();
        this.bindPauseAndResults();
        this.bindSpectatorControls();
        FeedbackManager.init();
        this.refreshAllPreviews();
    },

    populateVersionLabels() {
        document.querySelectorAll('.version-pill-text').forEach(el => {
            el.textContent = GAME_VERSION;
        });
    },

    bindNameInputs() {
        const p1Inputs = document.querySelectorAll('.input-p1-name');
        const p2Inputs = document.querySelectorAll('.input-p2-name');

        p1Inputs.forEach(inp => {
            inp.value = MatchConfig.p1Name;
            inp.addEventListener('input', () => {
                MatchConfig.p1Name = inp.value.slice(0, 14) || 'PLAYER 1';
                localStorage.setItem('bc_p1_name', MatchConfig.p1Name);
                p1Inputs.forEach(other => { if (other !== inp) other.value = inp.value; });
            });
        });

        p2Inputs.forEach(inp => {
            inp.value = MatchConfig.p2Name;
            inp.addEventListener('input', () => {
                MatchConfig.p2Name = inp.value.slice(0, 14) || 'PLAYER 2';
                localStorage.setItem('bc_p2_name', MatchConfig.p2Name);
                p2Inputs.forEach(other => { if (other !== inp) other.value = inp.value; });
            });
        });
    },

    buildColorPicker(containerId, playerKey) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        Object.values(CAR_COLOR_PALETTES).forEach(pal => {
            const btn = document.createElement('button');
            btn.className = 'color-swatch-btn';
            btn.dataset.color = pal.id;
            btn.style.background = `linear-gradient(135deg, ${pal.main}, ${pal.dark})`;
            btn.textContent = pal.name.split(' ')[1] || pal.name;
            if (pal.id === (playerKey === 'p1' ? MatchConfig.p1Color : MatchConfig.p2Color)) btn.classList.add('active');

            btn.addEventListener('click', () => {
                SoundEngine.playUIClick();
                if (playerKey === 'p1') {
                    MatchConfig.p1Color = pal.id;
                    if (MatchConfig.p2Color === pal.id) MatchConfig.p2Color = pal.id === 'green' ? 'red' : 'green';
                } else {
                    MatchConfig.p2Color = pal.id;
                    if (MatchConfig.p1Color === pal.id) MatchConfig.p1Color = pal.id === 'blue' ? 'red' : 'blue';
                }
                this.syncColorPickerHighlights();
                this.refreshAllPreviews();
            });
            container.appendChild(btn);
        });
    },

    buildAllColorPickers() {
        ['sp-color-picker', 'spt-color-picker', 'duel-p1-colors', 'coop-p1-colors', 'tvs-p1-colors'].forEach(id => this.buildColorPicker(id, 'p1'));
        ['duel-p2-colors', 'coop-p2-colors', 'tvs-p2-colors'].forEach(id => this.buildColorPicker(id, 'p2'));
    },

    syncColorPickerHighlights() {
        ['sp-color-picker', 'spt-color-picker', 'duel-p1-colors', 'coop-p1-colors', 'tvs-p1-colors'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.toggle('active', b.dataset.color === MatchConfig.p1Color));
        });
        ['duel-p2-colors', 'coop-p2-colors', 'tvs-p2-colors'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.toggle('active', b.dataset.color === MatchConfig.p2Color));
        });
    },

    showScreen(screenId) {
        SoundEngine.playUIClick();
        document.querySelectorAll('.menu-screen').forEach(el => {
            if (!el.classList.contains('modal-backdrop')) el.classList.add('hidden');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            this.syncColorPickerHighlights();
            this.refreshAllPreviews();
            if (screenId === 'screen-analytics') TelemetryTracker.renderAnalyticsDashboard();
        }
    },

    bindScreenNavigation() {
        // Single Player opens the Mode Selection screen (King of the Ring vs Stadium Squad Siege)
        document.getElementById('btn-goto-single').addEventListener('click', () => this.showScreen('screen-single-select'));
        document.getElementById('btn-goto-sp-ffa').addEventListener('click', () => {
            MatchConfig.spSubMode = 'ffa';
            this.showScreen('screen-single-config');
        });
        document.getElementById('btn-goto-sp-team').addEventListener('click', () => {
            MatchConfig.spSubMode = 'team';
            this.showScreen('screen-sp-team-config');
        });

        document.getElementById('btn-goto-twoplayer').addEventListener('click', () => this.showScreen('screen-multi-select'));
        document.getElementById('btn-goto-online').addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.getElementById('modal-coming-soon').classList.remove('hidden');
        });
        document.getElementById('btn-close-coming-soon').addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.getElementById('modal-coming-soon').classList.add('hidden');
        });

        document.getElementById('btn-goto-1v1').addEventListener('click', () => this.showScreen('screen-1v1-config'));
        document.getElementById('btn-goto-coop').addEventListener('click', () => this.showScreen('screen-coop-config'));
        document.getElementById('btn-goto-teamvs').addEventListener('click', () => this.showScreen('screen-teamvs-config'));

        document.getElementById('btn-goto-controls').addEventListener('click', () => {
            this.renderKeybindLists();
            this.showScreen('screen-controls');
        });
        document.getElementById('btn-goto-settings').addEventListener('click', () => this.showScreen('screen-settings'));
        document.getElementById('btn-goto-analytics').addEventListener('click', () => this.showScreen('screen-analytics'));
        document.getElementById('btn-goto-credits').addEventListener('click', () => this.showScreen('screen-credits'));

        document.querySelectorAll('.back-btn').forEach(btn => {
            if (btn.id === 'btn-close-feedback' || btn.id === 'btn-close-coming-soon') return;
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-target');
                if (target) this.showScreen(target);
            });
        });
    },

    renderStatsBars(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const stats = VEHICLE_ARCHETYPES.classic.statsDisplay;
        container.innerHTML = [
            { label: 'Top Speed', val: stats.speed },
            { label: 'Drift & Grip', val: stats.handling },
            { label: 'Chassis Armor', val: stats.armor }
        ].map(it => `
            <div class="stat-bar-row">
                <span style="width:110px;color:#cbd5e1;">${it.label}</span>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${it.val}%"></div></div>
                <strong style="width:32px;text-align:right;color:#38bdf8;">${it.val}</strong>
            </div>
        `).join('');
    },

    renderArenaMapPreview(canvasEl, arenaKey) {
        if (!canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        const W = canvasEl.width, H = canvasEl.height;
        ctx.clearRect(0, 0, W, H);

        if (arenaKey !== 'park_ground') {
            // Football Ground Visual Thumbnail
            ctx.fillStyle = '#1f6f38';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#247a3f';
            for (let x = 0; x < W; x += 40) ctx.fillRect(x, 0, 20, H);

            ctx.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx.lineWidth = 1.8;
            ctx.strokeRect(10, 8, W - 20, H - 16);
            ctx.beginPath();
            ctx.moveTo(W / 2, 8); ctx.lineTo(W / 2, H - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 16, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeRect(10, H / 2 - 20, 22, 40);
            ctx.strokeRect(W - 32, H / 2 - 20, 22, 40);
        } else {
            // Park Ground Visual Thumbnail (Walkways, Trees & Benches)
            ctx.fillStyle = '#216836';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#26733d';
            for (let y = 0; y < H; y += 28) ctx.fillRect(0, y, W, 14);

            ctx.fillStyle = 'rgba(180, 154, 118, 0.42)';
            ctx.fillRect(8, H / 2 - 7, W - 16, 14);
            ctx.fillRect(W / 2 - 7, 8, 14, H - 16);
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 16, 0, Math.PI * 2);
            ctx.fill();

            // Miniature Benches
            ctx.fillStyle = '#d97706';
            const benchCoords = [
                [W * 0.36, H * 0.32], [W * 0.64, H * 0.32],
                [W * 0.36, H * 0.68], [W * 0.64, H * 0.68],
                [W * 0.20, H * 0.30], [W * 0.80, H * 0.70]
            ];
            benchCoords.forEach(([bx, by]) => ctx.fillRect(bx - 5, by - 2, 10, 4));

            // Miniature Trees
            const treeCoords = [
                [W * 0.28, H * 0.24], [W * 0.72, H * 0.24],
                [W * 0.28, H * 0.76], [W * 0.72, H * 0.76],
                [W * 0.14, H * 0.20], [W * 0.86, H * 0.20],
                [W * 0.14, H * 0.80], [W * 0.86, H * 0.80],
                [W * 0.50, H * 0.20], [W * 0.50, H * 0.80]
            ];
            treeCoords.forEach(([tx, ty]) => {
                ctx.fillStyle = '#14532d';
                ctx.beginPath(); ctx.arc(tx, ty, 5.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#4ade80';
                ctx.beginPath(); ctx.arc(tx - 1.5, ty - 1.5, 2.5, 0, Math.PI * 2); ctx.fill();
            });
        }

        // Stadium Safety Border
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, W - 4, H - 4);
    },

    refreshAllMapPreviews() {
        document.querySelectorAll('.map-preview-canvas').forEach(canvas => {
            this.renderArenaMapPreview(canvas, MatchConfig.arenaKey);
        });
        const caption = MatchConfig.arenaKey === 'park_ground'
            ? 'PARK GROUND: 14 Trees & 10 Wooden Benches + 30s Supply Drops'
            : 'FOOTBALL GROUND: Wide-Open Stadium Pitch + 30s Supply Drops';
        document.querySelectorAll('.map-preview-caption').forEach(el => {
            el.textContent = caption;
        });
        document.querySelectorAll('.map-select-group .seg-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.arena === MatchConfig.arenaKey);
        });
    },

    refreshAllPreviews() {
        renderCarPreviewCanvas('sp-car-preview', MatchConfig.p1Color);
        renderCarPreviewCanvas('spt-car-preview', MatchConfig.p1Color);
        this.renderStatsBars('sp-car-stats');
        renderCarPreviewCanvas('duel-p1-preview', MatchConfig.p1Color);
        renderCarPreviewCanvas('duel-p2-preview', MatchConfig.p2Color);
        renderCarPreviewCanvas('tvs-p1-preview', MatchConfig.p1Color);
        renderCarPreviewCanvas('tvs-p2-preview', MatchConfig.p2Color);
        this.refreshAllMapPreviews();
    },

    bindSinglePlayerConfig() {
        const setBotCount = (val) => {
            const clamped = Math.max(1, Math.min(8, parseInt(val, 10) || 1));
            MatchConfig.enemyBotCount = clamped;
            document.getElementById('sp-bot-input').value = clamped;
            document.getElementById('sp-bot-count-label').textContent = clamped;
            document.querySelectorAll('#sp-bot-pills .pill-btn').forEach(p => p.classList.toggle('active', parseInt(p.dataset.count, 10) === clamped));
        };
        document.getElementById('sp-bot-dec').addEventListener('click', () => { SoundEngine.playUIClick(); setBotCount(MatchConfig.enemyBotCount - 1); });
        document.getElementById('sp-bot-inc').addEventListener('click', () => { SoundEngine.playUIClick(); setBotCount(MatchConfig.enemyBotCount + 1); });
        document.querySelectorAll('#sp-bot-pills .pill-btn').forEach(pill => pill.addEventListener('click', () => { SoundEngine.playUIClick(); setBotCount(pill.dataset.count); }));

        const diffRow = document.getElementById('sp-diff-selector');
        diffRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            diffRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.difficulty = btn.dataset.diff;
            document.getElementById('sp-diff-desc').textContent = AI_DIFFICULTY_PROFILES[MatchConfig.difficulty].description;
        }));

        document.getElementById('btn-start-single').addEventListener('click', () => {
            MatchConfig.mode = 'single';
            MatchConfig.spSubMode = 'ffa';
            MatchConfig.timedMode = false;
            Game.startConfiguredMatch();
        });
    },

    bindSpTeamConfig() {
        document.querySelectorAll('#spt-ally-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.querySelectorAll('#spt-ally-pills .pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.spAllyBots = parseInt(btn.dataset.count, 10);
            document.getElementById('spt-ally-label').textContent = MatchConfig.spAllyBots;
        }));

        document.querySelectorAll('#spt-enemy-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.querySelectorAll('#spt-enemy-pills .pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.spEnemyBots = parseInt(btn.dataset.count, 10);
            document.getElementById('spt-enemy-label').textContent = MatchConfig.spEnemyBots;
        }));

        const ruleRow = document.getElementById('spt-rule-selector');
        if (ruleRow) {
            ruleRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
                SoundEngine.playUIClick();
                ruleRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                MatchConfig.timedMode = btn.dataset.timed === 'true';
                document.getElementById('spt-time-box').classList.toggle('hidden', !MatchConfig.timedMode);
            }));
        }

        document.querySelectorAll('#spt-time-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        const diffRow = document.getElementById('spt-diff-selector');
        if (diffRow) {
            diffRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
                SoundEngine.playUIClick();
                diffRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                MatchConfig.difficulty = btn.dataset.diff;
            }));
        }

        const startBtn = document.getElementById('btn-start-sp-team');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                MatchConfig.mode = 'single';
                MatchConfig.spSubMode = 'team';
                const activeRule = document.querySelector('#spt-rule-selector .seg-btn.active');
                MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === 'true' : true;
                Game.startConfiguredMatch();
            });
        }
    },

    bind1v1Config() {
        document.getElementById('btn-start-1v1').addEventListener('click', () => {
            MatchConfig.mode = '1v1'; MatchConfig.timedMode = false;
            Game.startConfiguredMatch();
        });
    },

    bindCoopConfig() {
        document.querySelectorAll('#coop-ally-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.querySelectorAll('#coop-ally-pills .pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.allyBotCount = parseInt(btn.dataset.count, 10);
            document.getElementById('coop-ally-label').textContent = MatchConfig.allyBotCount;
        }));

        document.querySelectorAll('#coop-enemy-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.querySelectorAll('#coop-enemy-pills .pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.enemyBotCount = parseInt(btn.dataset.count, 10);
            document.getElementById('coop-enemy-label').textContent = MatchConfig.enemyBotCount;
        }));

        const ruleRow = document.getElementById('coop-rule-selector');
        ruleRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            ruleRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.timedMode = btn.dataset.timed === 'true';
            document.getElementById('coop-time-box').classList.toggle('hidden', !MatchConfig.timedMode);
        }));

        document.querySelectorAll('#coop-time-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        const diffRow = document.getElementById('coop-diff-selector');
        diffRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            diffRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.difficulty = btn.dataset.diff;
        }));

        document.getElementById('btn-start-coop').addEventListener('click', () => {
            MatchConfig.mode = 'coop';
            const activeRule = document.querySelector('#coop-rule-selector .seg-btn.active');
            MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === 'true' : true;
            Game.startConfiguredMatch();
        });
    },

    bindTeamVsConfig() {
        document.querySelectorAll('#tvs-p1-bot-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.querySelectorAll('#tvs-p1-bot-pills .pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.p1TeamBots = parseInt(btn.dataset.count, 10);
            document.getElementById('tvs-p1-bots-label').textContent = MatchConfig.p1TeamBots;
        }));

        document.querySelectorAll('#tvs-p2-bot-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            document.querySelectorAll('#tvs-p2-bot-pills .pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.p2TeamBots = parseInt(btn.dataset.count, 10);
            document.getElementById('tvs-p2-bots-label').textContent = MatchConfig.p2TeamBots;
        }));

        const ruleRow = document.getElementById('tvs-rule-selector');
        ruleRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            ruleRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.timedMode = btn.dataset.timed === 'true';
            document.getElementById('tvs-time-box').classList.toggle('hidden', !MatchConfig.timedMode);
        }));

        document.querySelectorAll('#tvs-time-pills .pill-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        const diffRow = document.getElementById('tvs-diff-selector');
        diffRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            diffRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            MatchConfig.difficulty = btn.dataset.diff;
        }));

        document.getElementById('btn-start-teamvs').addEventListener('click', () => {
            MatchConfig.mode = 'team_vs';
            const activeRule = document.querySelector('#tvs-rule-selector .seg-btn.active');
            MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === 'true' : true;
            Game.startConfiguredMatch();
        });
    },

    syncTimeLimitPills(mins) {
        MatchConfig.timeLimitMinutes = mins;
        const sptLbl = document.getElementById('spt-time-label');
        if (sptLbl) sptLbl.textContent = mins;
        document.getElementById('coop-time-label').textContent = mins;
        document.getElementById('tvs-time-label').textContent = mins;
        document.querySelectorAll('#spt-time-pills .pill-btn, #coop-time-pills .pill-btn, #tvs-time-pills .pill-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.min, 10) === mins);
        });
    },

    bindSettings() {
        const masterSlider = document.getElementById('set-master-vol');
        const sfxSlider = document.getElementById('set-sfx-vol');
        masterSlider.addEventListener('input', () => {
            UserSettings.masterVolume = parseInt(masterSlider.value, 10) / 100;
            document.getElementById('lbl-master-vol').textContent = `${masterSlider.value}%`;
        });
        sfxSlider.addEventListener('input', () => {
            UserSettings.sfxVolume = parseInt(sfxSlider.value, 10) / 100;
            document.getElementById('lbl-sfx-vol').textContent = `${sfxSlider.value}%`;
        });

        const camRow = document.getElementById('set-camera-mode');
        camRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            UserSettings.cameraMode = btn.dataset.cam;
            this.syncCameraModeUI();
        }));

        const gfxRow = document.getElementById('set-gfx-quality');
        gfxRow.querySelectorAll('.seg-btn').forEach(btn => btn.addEventListener('click', () => {
            SoundEngine.playUIClick();
            gfxRow.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            UserSettings.gfxQuality = btn.dataset.gfx;
        }));
    },

    syncCameraModeUI() {
        const camRow = document.getElementById('set-camera-mode');
        if (camRow) camRow.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.cam === UserSettings.cameraMode));
        const hudCamBtn = document.getElementById('btn-hud-cam');
        if (hudCamBtn) hudCamBtn.textContent = UserSettings.cameraMode === 'moving_wide' ? 'CAM: FOLLOW ZOOM' : 'CAM: FULL STADIUM';
    },

    bindControlsScreen() {
        document.getElementById('btn-reset-keys').addEventListener('click', () => {
            SoundEngine.playUIClick();
            InputManager.resetToDefaults();
            this.renderKeybindLists();
        });
    },

    renderKeybindLists() {
        const actions = [
            { key: 'up', label: 'Accelerate Forward' },
            { key: 'down', label: 'Reverse / Brake' },
            { key: 'left', label: 'Steer Left' },
            { key: 'right', label: 'Steer Right' },
            { key: 'drift', label: 'Handbrake Drift' }
        ];
        ['p1', 'p2'].forEach(player => {
            const container = document.getElementById(`${player}-keybind-list`);
            container.innerHTML = '';
            actions.forEach(act => {
                const row = document.createElement('div');
                row.className = 'keybind-row';
                row.innerHTML = `<span>${act.label}</span><button class="keybind-btn">${InputManager.formatKeyName(InputManager.bindings[player][act.key])}</button>`;
                const btn = row.querySelector('.keybind-btn');
                btn.addEventListener('click', () => {
                    SoundEngine.playUIClick();
                    document.querySelectorAll('.keybind-btn').forEach(b => b.classList.remove('listening'));
                    btn.classList.add('listening');
                    btn.textContent = 'PRESS KEY...';
                    InputManager.listeningTarget = { player, action: act.key, callback: () => this.renderKeybindLists() };
                });
                container.appendChild(row);
            });
        });
    },

    bindPauseAndResults() {
        document.getElementById('btn-hud-cam').addEventListener('click', () => CameraController.cycleMode());
        document.getElementById('btn-hud-pause').addEventListener('click', () => Game.togglePause());
        document.getElementById('btn-pause-resume').addEventListener('click', () => Game.togglePause());
        document.getElementById('btn-pause-restart').addEventListener('click', () => {
            document.getElementById('modal-pause').classList.add('hidden');
            Game.startConfiguredMatch();
        });
        document.getElementById('btn-pause-menu').addEventListener('click', () => {
            document.getElementById('modal-pause').classList.add('hidden');
            Game.returnToMainMenu();
        });
        document.getElementById('btn-result-rematch').addEventListener('click', () => {
            document.getElementById('modal-results').classList.add('hidden');
            Game.startConfiguredMatch();
        });
        document.getElementById('btn-result-menu').addEventListener('click', () => {
            document.getElementById('modal-results').classList.add('hidden');
            Game.returnToMainMenu();
        });
    },

    bindSpectatorControls() {
        const nextBtn = document.getElementById('btn-spec-next');
        const leaveBtn = document.getElementById('btn-spec-leave');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                CameraController.cycleSpectateTarget(Game.cars);
            });
        }
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => {
                Game.leaveSpectatorEarly();
            });
        }
    },

    updateHUD(cars) {
        const strip = document.getElementById('hud-score-strip');
        if (!strip) return;

        const timerBox = document.getElementById('hud-timer-box');
        const isTeamMode = (
            MatchConfig.mode === 'coop' ||
            MatchConfig.mode === 'team_vs' ||
            (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'team')
        );

        if (isTeamMode && MatchConfig.timedMode) {
            timerBox.classList.remove('hidden');
            const totalSec = Math.max(0, Math.ceil(TimedSiegeMode.timeRemaining));
            const mins = Math.floor(totalSec / 60), secs = totalSec % 60;
            document.getElementById('hud-timer-val').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            timerBox.classList.toggle('timer-urgent', totalSec <= 20);
        } else {
            timerBox.classList.add('hidden');
        }

        if (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'team') {
            const p1 = cars.find(c => c.playerSlot === 'p1');
            const alliesAlive = cars.filter(c => c.team === 'ALLIES' && !c.dead).length;
            const enemiesAlive = cars.filter(c => c.team === 'ENEMIES' && !c.dead).length;
            strip.innerHTML = `
                <div class="hud-mini-tag" style="border-color:${p1 ? p1.mainColor : '#38bdf8'}">
                    ${p1 ? p1.label : 'P1'}: <span style="color:${p1 ? p1.lightColor : '#fff'}">${p1 ? Math.ceil(p1.hp) : 0} HP</span>
                </div>
                <div class="hud-mini-tag">YOUR SQUAD ALIVE: <span style="color:#38bdf8">${alliesAlive}</span></div>
                <div class="hud-mini-tag">ENEMY SQUAD ALIVE: <span style="color:#ff4d6d">${enemiesAlive}</span></div>
            `;
        } else if (MatchConfig.mode === 'single') {
            const p1 = cars.find(c => c.playerSlot === 'p1');
            const botsAlive = cars.filter(c => c.isAI && !c.dead).length;
            strip.innerHTML = `
                <div class="hud-mini-tag" style="border-color:${p1 ? p1.mainColor : '#38bdf8'}">
                    ${p1 ? p1.label : 'P1'}: <span style="color:${p1 ? p1.lightColor : '#fff'}">${p1 ? Math.ceil(p1.hp) : 0} HP</span>
                </div>
                <div class="hud-mini-tag">OPPONENTS LEFT: <span style="color:#4ade80">${botsAlive}</span></div>
            `;
        } else if (MatchConfig.mode === '1v1') {
            const p1 = cars.find(c => c.playerSlot === 'p1'), p2 = cars.find(c => c.playerSlot === 'p2');
            strip.innerHTML = `
                <div class="hud-mini-tag" style="border-color:${p1.mainColor}">${p1.label}: <span style="color:${p1.lightColor}">${Math.ceil(p1.hp)} HP</span></div>
                <div class="hud-mini-tag" style="border-color:${p2.mainColor}">${p2.label}: <span style="color:${p2.lightColor}">${Math.ceil(p2.hp)} HP</span></div>
            `;
        } else if (MatchConfig.mode === 'coop') {
            const blueAlive = cars.filter(c => c.team === 'ALLIES' && !c.dead).length;
            const redAlive = cars.filter(c => c.team === 'ENEMIES' && !c.dead).length;
            strip.innerHTML = `
                <div class="hud-mini-tag">ALLIES ALIVE: <span style="color:#38bdf8">${blueAlive}</span></div>
                <div class="hud-mini-tag">ENEMIES ALIVE: <span style="color:#ff4d6d">${redAlive}</span></div>
            `;
        } else if (MatchConfig.mode === 'team_vs') {
            const t1Alive = cars.filter(c => c.team === 'P1_SQUAD' && !c.dead).length;
            const t2Alive = cars.filter(c => c.team === 'P2_SQUAD' && !c.dead).length;
            const p1Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color], p2Pal = CAR_COLOR_PALETTES[MatchConfig.p2Color];
            strip.innerHTML = `
                <div class="hud-mini-tag" style="border-color:${p1Pal.main}">${MatchConfig.p1Name} SQUAD: <span style="color:${p1Pal.light}">${t1Alive}</span></div>
                <div class="hud-mini-tag" style="border-color:${p2Pal.main}">${MatchConfig.p2Name} SQUAD: <span style="color:${p2Pal.light}">${t2Alive}</span></div>
            `;
        }
    },

    showMatchResults(outcome) {
        const modal = document.getElementById('modal-results');
        document.getElementById('result-badge').textContent = outcome.badge;
        const title = document.getElementById('result-title');
        title.textContent = outcome.title; title.style.color = outcome.color;
        document.getElementById('result-subtitle').textContent = outcome.subtitle;

        const teamSummary = document.getElementById('result-team-summary');
        if (outcome.teamStats) {
            teamSummary.classList.remove('hidden');
            const t1 = outcome.teamStats.team1, t2 = outcome.teamStats.team2;
            teamSummary.innerHTML = `
                <div class="team-stat-card" style="border-color:${t1.color}">
                    <strong style="color:${t1.color};font-size:14px;">${t1.name}</strong>
                    <div style="margin-top:4px;">Cars Destroyed: <b>${t1.kills}</b></div>
                    <div>Total Car Damage Dealt: <b>${t1.damage} DMG</b></div>
                    <div>Survivors Left: <b>${t1.alive}</b></div>
                </div>
                <div class="team-stat-card" style="border-color:${t2.color}">
                    <strong style="color:${t2.color};font-size:14px;">${t2.name}</strong>
                    <div style="margin-top:4px;">Cars Destroyed: <b>${t2.kills}</b></div>
                    <div>Total Car Damage Dealt: <b>${t2.damage} DMG</b></div>
                    <div>Survivors Left: <b>${t2.alive}</b></div>
                </div>
            `;
        } else {
            teamSummary.classList.add('hidden');
        }

        document.getElementById('result-stats-table').innerHTML = Game.cars.map(c => `
            <div class="result-row">
                <span><strong style="color:${c.lightColor}">${c.label}</strong></span>
                <span>${c.dead ? '<em style="color:#ff4d6d">WRECKED</em>' : `<strong style="color:#00e676">${Math.ceil(c.hp)} HP LEFT</strong>`} &bull; Kills: <b>${c.kills}</b> &bull; Damage: <b>${c.damageDealt}</b></span>
            </div>
        `).join('');

        modal.classList.remove('hidden');
    }
};