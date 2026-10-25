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
        this.bindCtfConfigs();
        this.bindStoryConfig();
        this.bindSettings();
        this.bindControlsScreen();
        this.bindPauseAndResults();
        this.bindSpectatorControls();
        FeedbackManager.init();
        this.refreshAllPreviews();
    },

    populateVersionLabels() {
        document.querySelectorAll(".version-pill-text").forEach(el => {
            el.textContent = GAME_VERSION;
        });
    },

    bindNameInputs() {
        const p1Inputs = document.querySelectorAll(".input-p1-name");
        const p2Inputs = document.querySelectorAll(".input-p2-name");

        p1Inputs.forEach(inp => {
            inp.value = MatchConfig.p1Name;
            inp.addEventListener("input", () => {
                MatchConfig.p1Name = inp.value.slice(0, 14) || "PLAYER 1";
                localStorage.setItem("bc_p1_name", MatchConfig.p1Name);
                p1Inputs.forEach(other => { if (other !== inp) other.value = inp.value; });
            });
        });

        p2Inputs.forEach(inp => {
            inp.value = MatchConfig.p2Name;
            inp.addEventListener("input", () => {
                MatchConfig.p2Name = inp.value.slice(0, 14) || "PLAYER 2";
                localStorage.setItem("bc_p2_name", MatchConfig.p2Name);
                p2Inputs.forEach(other => { if (other !== inp) other.value = inp.value; });
            });
        });
    },

    buildColorPicker(containerId, playerKey) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";
        Object.values(CAR_COLOR_PALETTES).forEach(pal => {
            const btn = document.createElement("button");
            btn.className = "color-swatch-btn";
            btn.dataset.color = pal.id;
            btn.style.background = `linear-gradient(135deg, ${pal.main}, ${pal.dark})`;
            btn.textContent = pal.name.split(" ")[1] || pal.name;
            if (pal.id === (playerKey === "p1" ? MatchConfig.p1Color : MatchConfig.p2Color)) btn.classList.add("active");

            btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                if (playerKey === "p1") {
                    MatchConfig.p1Color = pal.id;
                    if (MatchConfig.p2Color === pal.id) MatchConfig.p2Color = pal.id === "green" ? "red" : "green";
                } else {
                    MatchConfig.p2Color = pal.id;
                    if (MatchConfig.p1Color === pal.id) MatchConfig.p1Color = pal.id === "blue" ? "red" : "blue";
                }
                this.syncColorPickerHighlights();
                this.refreshAllPreviews();
            });
            container.appendChild(btn);
        });
    },

    buildAllColorPickers() {
        ["sp-color-picker", "spt-color-picker", "spctf-color-picker", "mpctf-p1-colors", "duel-p1-colors", "coop-p1-colors", "tvs-p1-colors", "story-p1-colors"].forEach(id => this.buildColorPicker(id, "p1"));
        ["duel-p2-colors", "coop-p2-colors", "tvs-p2-colors", "mpctf-p2-colors", "story-p2-colors"].forEach(id => this.buildColorPicker(id, "p2"));
    },

    syncColorPickerHighlights() {
        ["sp-color-picker", "spt-color-picker", "spctf-color-picker", "mpctf-p1-colors", "duel-p1-colors", "coop-p1-colors", "tvs-p1-colors", "story-p1-colors"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.querySelectorAll(".color-swatch-btn").forEach(b => b.classList.toggle("active", b.dataset.color === MatchConfig.p1Color));
        });
        ["duel-p2-colors", "coop-p2-colors", "tvs-p2-colors", "mpctf-p2-colors", "story-p2-colors"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.querySelectorAll(".color-swatch-btn").forEach(b => b.classList.toggle("active", b.dataset.color === MatchConfig.p2Color));
        });
    },

    showScreen(screenId) {
        SoundEngine.playUIClick();
        document.querySelectorAll(".menu-screen").forEach(el => {
            if (!el.classList.contains("modal-backdrop")) el.classList.add("hidden");
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove("hidden");
            this.syncColorPickerHighlights();
            this.refreshAllPreviews();
            if (screenId === "screen-analytics") TelemetryTracker.renderAnalyticsDashboard();
            if (screenId === "screen-guide") this.renderAbilitiesGuideIcons();
        }
    },

    bindScreenNavigation() {
        const storyBtn = document.getElementById("btn-goto-story");
        if (storyBtn) storyBtn.addEventListener("click", () => this.showScreen("screen-story-config"));

        document.getElementById("btn-goto-single").addEventListener("click", () => this.showScreen("screen-single-select"));
        document.getElementById("btn-goto-sp-ffa").addEventListener("click", () => {
            MatchConfig.spSubMode = "ffa";
            this.showScreen("screen-single-config");
        });
        document.getElementById("btn-goto-sp-team").addEventListener("click", () => {
            MatchConfig.spSubMode = "team";
            this.showScreen("screen-sp-team-config");
        });

        document.getElementById("btn-goto-twoplayer").addEventListener("click", () => this.showScreen("screen-multi-select"));
        document.getElementById("btn-goto-online").addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.getElementById("modal-coming-soon").classList.remove("hidden");
        });
        document.getElementById("btn-close-coming-soon").addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.getElementById("modal-coming-soon").classList.add("hidden");
        });

        const spCtfBtn = document.getElementById("btn-goto-sp-ctf");
        if (spCtfBtn) spCtfBtn.addEventListener("click", () => {
            MatchConfig.ctfType = "solo";
            this.showScreen("screen-sp-ctf-config");
        });
        const mpCtfBtn = document.getElementById("btn-goto-mp-ctf");
        if (mpCtfBtn) mpCtfBtn.addEventListener("click", () => {
            MatchConfig.ctfType = "versus";
            this.showScreen("screen-mp-ctf-config");
        });
        const guideBtn = document.getElementById("btn-goto-guide");
        if (guideBtn) guideBtn.addEventListener("click", () => this.showScreen("screen-guide"));
        const setGuideBtn = document.getElementById("btn-settings-guide");
        if (setGuideBtn) setGuideBtn.addEventListener("click", () => this.showScreen("screen-guide"));

        document.getElementById("btn-goto-1v1").addEventListener("click", () => this.showScreen("screen-1v1-config"));
        document.getElementById("btn-goto-coop").addEventListener("click", () => this.showScreen("screen-coop-config"));
        document.getElementById("btn-goto-teamvs").addEventListener("click", () => this.showScreen("screen-teamvs-config"));

        document.getElementById("btn-goto-controls").addEventListener("click", () => {
            this.renderKeybindLists();
            this.showScreen("screen-controls");
        });
        document.getElementById("btn-goto-settings").addEventListener("click", () => this.showScreen("screen-settings"));
        document.getElementById("btn-goto-analytics").addEventListener("click", () => this.showScreen("screen-analytics"));
        document.getElementById("btn-goto-credits").addEventListener("click", () => this.showScreen("screen-credits"));

        document.querySelectorAll(".back-btn").forEach(btn => {
            if (btn.id === "btn-close-feedback" || btn.id === "btn-close-coming-soon") return;
            btn.addEventListener("click", () => {
                const target = btn.getAttribute("data-target");
                if (target) this.showScreen(target);
            });
        });
    },

    bindStoryConfig() {
        const epRow = document.getElementById("story-episode-selector");
        if (epRow) {
            epRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                epRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.storyEpisode = parseInt(btn.dataset.ep, 10) || 1;
            }));
        }

        const modeRow = document.getElementById("story-players-selector");
        if (modeRow) {
            modeRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                modeRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.storyCoop = btn.dataset.coop === "true";
                const p2Box = document.getElementById("story-p2-box");
                if (p2Box) p2Box.classList.toggle("hidden", !MatchConfig.storyCoop);
            }));
        }

        const p1AbRow = document.getElementById("story-p1-ability");
        if (p1AbRow) {
            p1AbRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                p1AbRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.p1Ability = btn.dataset.ab;
            }));
        }

        const p2AbRow = document.getElementById("story-p2-ability");
        if (p2AbRow) {
            p2AbRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                p2AbRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.p2Ability = btn.dataset.ab;
            }));
        }

        const startStoryBtn = document.getElementById("btn-start-story");
        if (startStoryBtn) {
            startStoryBtn.addEventListener("click", () => {
                MatchConfig.mode = "story";
                MatchConfig.timedMode = false;
                Game.startConfiguredMatch();
            });
        }
    },

    renderStatsBars(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const stats = VEHICLE_ARCHETYPES.classic.statsDisplay;
        container.innerHTML = [
            { label: "Top Speed", val: stats.speed },
            { label: "Drift & Grip", val: stats.handling },
            { label: "Chassis Armor", val: stats.armor }
        ].map(it => `
            <div class="stat-bar-row">
                <span style="width:110px;color:#cbd5e1;">${it.label}</span>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${it.val}%"></div></div>
                <strong style="width:32px;text-align:right;color:#38bdf8;">${it.val}</strong>
            </div>
        `).join("");
    },

    renderArenaMapPreview(canvasEl, arenaKey) {
        if (!canvasEl || typeof Game === "undefined") return;
        const ctx = canvasEl.getContext("2d");
        const W = canvasEl.width, H = canvasEl.height;
        const safeKey = arenaKey === "story_ep1" ? "expanded" : arenaKey;
        const preset = ARENA_PRESETS[safeKey] || ARENA_PRESETS.expanded;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#050b14";
        ctx.fillRect(0, 0, W, H);

        const scale = Math.min((W - 6) / preset.width, (H - 6) / preset.height);
        const offsetX = (W - preset.width * scale) / 2;
        const offsetY = (H - preset.height * scale) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        Game.drawArenaGround(ctx, preset);

        const { leftRect, rightRect } = PhysicsEngine.getTeamBaseRects(preset);
        ctx.strokeStyle = "#38bdf8";
        ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
        ctx.lineWidth = 28;
        ctx.beginPath(); ctx.roundRect(leftRect.xMin, leftRect.yMin, leftRect.w, leftRect.h, 24); ctx.fill(); ctx.stroke();

        ctx.strokeStyle = "#ff4d6d";
        ctx.fillStyle = "rgba(255, 77, 109, 0.28)";
        ctx.beginPath(); ctx.roundRect(rightRect.xMin, rightRect.yMin, rightRect.w, rightRect.h, 24); ctx.fill(); ctx.stroke();

        ctx.restore();
    },

    refreshAllMapPreviews() {
        document.querySelectorAll(".map-preview-canvas").forEach(canvas => {
            this.renderArenaMapPreview(canvas, MatchConfig.arenaKey);
        });
        const captionMap = {
            expanded:     "FOOTBALL GROUND: Open Stadium Pitch + 30s Mystery [?] Drops",
            park_ground:  "PARK GROUND: Trees & Benches + 30s Mystery [?] Drops",
            desert_dunes: "DESERT DUNES: Golden Sand & 4 Giant Cacti + 30s Mystery [?] Drops",
            ice_rink:     "FROSTBITE ICE: Glacier Arena & 4 Pine Trees + 30s Mystery [?] Drops"
        };
        const caption = captionMap[MatchConfig.arenaKey] || captionMap.expanded;
        document.querySelectorAll(".map-preview-caption").forEach(el => {
            el.textContent = caption;
        });
        document.querySelectorAll(".map-select-group .seg-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.arena === MatchConfig.arenaKey);
        });
    },

    refreshAllPreviews() {
        renderCarPreviewCanvas("sp-car-preview", MatchConfig.p1Color);
        renderCarPreviewCanvas("spt-car-preview", MatchConfig.p1Color);
        renderCarPreviewCanvas("spctf-car-preview", MatchConfig.p1Color);
        renderCarPreviewCanvas("mpctf-p1-preview", MatchConfig.p1Color);
        renderCarPreviewCanvas("mpctf-p2-preview", MatchConfig.p2Color);
        renderCarPreviewCanvas("story-p1-preview", MatchConfig.p1Color);
        this.renderStatsBars("sp-car-stats");
        renderCarPreviewCanvas("duel-p1-preview", MatchConfig.p1Color);
        renderCarPreviewCanvas("duel-p2-preview", MatchConfig.p2Color);
        renderCarPreviewCanvas("tvs-p1-preview", MatchConfig.p1Color);
        renderCarPreviewCanvas("tvs-p2-preview", MatchConfig.p2Color);
        this.refreshAllMapPreviews();
    },

    bindSinglePlayerConfig() {
        const setBotCount = (val) => {
            const clamped = Math.max(1, Math.min(8, parseInt(val, 10) || 1));
            MatchConfig.enemyBotCount = clamped;
            document.getElementById("sp-bot-input").value = clamped;
            document.getElementById("sp-bot-count-label").textContent = clamped;
            document.querySelectorAll("#sp-bot-pills .pill-btn").forEach(p => p.classList.toggle("active", parseInt(p.dataset.count, 10) === clamped));
        };
        document.getElementById("sp-bot-dec").addEventListener("click", () => { SoundEngine.playUIClick(); setBotCount(MatchConfig.enemyBotCount - 1); });
        document.getElementById("sp-bot-inc").addEventListener("click", () => { SoundEngine.playUIClick(); setBotCount(MatchConfig.enemyBotCount + 1); });
        document.querySelectorAll("#sp-bot-pills .pill-btn").forEach(pill => pill.addEventListener("click", () => { SoundEngine.playUIClick(); setBotCount(pill.dataset.count); }));

        const diffRow = document.getElementById("sp-diff-selector");
        diffRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            diffRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.difficulty = btn.dataset.diff;
            document.getElementById("sp-diff-desc").textContent = AI_DIFFICULTY_PROFILES[MatchConfig.difficulty].description;
        }));

        const spRuleRow = document.getElementById("sp-rule-selector");
        if (spRuleRow) {
            spRuleRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                spRuleRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.timedMode = btn.dataset.timed === "true";
                const tb = document.getElementById("sp-time-box");
                if (tb) tb.classList.toggle("hidden", !MatchConfig.timedMode);
            }));
        }
        document.querySelectorAll("#sp-time-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        document.getElementById("btn-start-single").addEventListener("click", () => {
            MatchConfig.mode = "single";
            MatchConfig.spSubMode = "ffa";
            const activeRule = document.querySelector("#sp-rule-selector .seg-btn.active");
            MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === "true" : false;
            Game.startConfiguredMatch();
        });
    },

    bindSpTeamConfig() {
        document.querySelectorAll("#spt-ally-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#spt-ally-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.spAllyBots = parseInt(btn.dataset.count, 10);
            document.getElementById("spt-ally-label").textContent = MatchConfig.spAllyBots;
        }));

        document.querySelectorAll("#spt-enemy-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#spt-enemy-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.spEnemyBots = parseInt(btn.dataset.count, 10);
            document.getElementById("spt-enemy-label").textContent = MatchConfig.spEnemyBots;
        }));

        const ruleRow = document.getElementById("spt-rule-selector");
        if (ruleRow) {
            ruleRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                ruleRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.timedMode = btn.dataset.timed === "true";
                document.getElementById("spt-time-box").classList.toggle("hidden", !MatchConfig.timedMode);
            }));
        }

        document.querySelectorAll("#spt-time-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        const diffRow = document.getElementById("spt-diff-selector");
        if (diffRow) {
            diffRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                diffRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.difficulty = btn.dataset.diff;
            }));
        }

        const startBtn = document.getElementById("btn-start-sp-team");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                MatchConfig.mode = "single";
                MatchConfig.spSubMode = "team";
                const activeRule = document.querySelector("#spt-rule-selector .seg-btn.active");
                MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === "true" : true;
                Game.startConfiguredMatch();
            });
        }
    },

    bind1v1Config() {
        const duelRuleRow = document.getElementById("duel-rule-selector");
        if (duelRuleRow) {
            duelRuleRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                duelRuleRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.timedMode = btn.dataset.timed === "true";
                const tb = document.getElementById("duel-time-box");
                if (tb) tb.classList.toggle("hidden", !MatchConfig.timedMode);
            }));
        }
        document.querySelectorAll("#duel-time-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        document.getElementById("btn-start-1v1").addEventListener("click", () => {
            MatchConfig.mode = "1v1";
            const activeRule = document.querySelector("#duel-rule-selector .seg-btn.active");
            MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === "true" : false;
            Game.startConfiguredMatch();
        });
    },

    bindCoopConfig() {
        document.querySelectorAll("#coop-ally-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#coop-ally-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.allyBotCount = parseInt(btn.dataset.count, 10);
            document.getElementById("coop-ally-label").textContent = MatchConfig.allyBotCount;
        }));

        document.querySelectorAll("#coop-enemy-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#coop-enemy-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.enemyBotCount = parseInt(btn.dataset.count, 10);
            document.getElementById("coop-enemy-label").textContent = MatchConfig.enemyBotCount;
        }));

        const ruleRow = document.getElementById("coop-rule-selector");
        ruleRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            ruleRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.timedMode = btn.dataset.timed === "true";
            document.getElementById("coop-time-box").classList.toggle("hidden", !MatchConfig.timedMode);
        }));

        document.querySelectorAll("#coop-time-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        const diffRow = document.getElementById("coop-diff-selector");
        diffRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            diffRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.difficulty = btn.dataset.diff;
        }));

        document.getElementById("btn-start-coop").addEventListener("click", () => {
            MatchConfig.mode = "coop";
            const activeRule = document.querySelector("#coop-rule-selector .seg-btn.active");
            MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === "true" : true;
            Game.startConfiguredMatch();
        });
    },

    bindTeamVsConfig() {
        document.querySelectorAll("#tvs-p1-bot-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#tvs-p1-bot-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.p1TeamBots = parseInt(btn.dataset.count, 10);
            document.getElementById("tvs-p1-bots-label").textContent = MatchConfig.p1TeamBots;
        }));

        document.querySelectorAll("#tvs-p2-bot-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#tvs-p2-bot-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.p2TeamBots = parseInt(btn.dataset.count, 10);
            document.getElementById("tvs-p2-bots-label").textContent = MatchConfig.p2TeamBots;
        }));

        const ruleRow = document.getElementById("tvs-rule-selector");
        ruleRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            ruleRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.timedMode = btn.dataset.timed === "true";
            document.getElementById("tvs-time-box").classList.toggle("hidden", !MatchConfig.timedMode);
        }));

        document.querySelectorAll("#tvs-time-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));

        const diffRow = document.getElementById("tvs-diff-selector");
        diffRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            diffRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.difficulty = btn.dataset.diff;
        }));

        document.getElementById("btn-start-teamvs").addEventListener("click", () => {
            MatchConfig.mode = "team_vs";
            const activeRule = document.querySelector("#tvs-rule-selector .seg-btn.active");
            MatchConfig.timedMode = activeRule ? activeRule.dataset.timed === "true" : true;
            Game.startConfiguredMatch();
        });
    },

    syncTimeLimitPills(mins) {
        MatchConfig.timeLimitMinutes = mins;
        ["sp-time-label", "spt-time-label", "spctf-time-label", "mpctf-time-label", "duel-time-label", "coop-time-label", "tvs-time-label"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = mins;
        });
        document.querySelectorAll("#sp-time-pills .pill-btn, #spt-time-pills .pill-btn, #spctf-time-pills .pill-btn, #mpctf-time-pills .pill-btn, #duel-time-pills .pill-btn, #coop-time-pills .pill-btn, #tvs-time-pills .pill-btn").forEach(b => {
            b.classList.toggle("active", parseInt(b.dataset.min, 10) === mins);
        });
    },

    bindCtfConfigs() {
        document.querySelectorAll("#spctf-ally-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#spctf-ally-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.ctfSpAllyBots = parseInt(btn.dataset.count, 10);
            document.getElementById("spctf-ally-label").textContent = MatchConfig.ctfSpAllyBots;
        }));
        document.querySelectorAll("#spctf-enemy-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#spctf-enemy-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.ctfSpEnemyBots = parseInt(btn.dataset.count, 10);
            document.getElementById("spctf-enemy-label").textContent = MatchConfig.ctfSpEnemyBots;
        }));
        document.querySelectorAll("#spctf-time-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));
        const spCtfDiff = document.getElementById("spctf-diff-selector");
        if (spCtfDiff) {
            spCtfDiff.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                spCtfDiff.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.difficulty = btn.dataset.diff;
            }));
        }
        const startSpCtf = document.getElementById("btn-start-sp-ctf");
        if (startSpCtf) {
            startSpCtf.addEventListener("click", () => {
                MatchConfig.mode = "ctf";
                MatchConfig.ctfType = "solo";
                MatchConfig.timedMode = true;
                Game.startConfiguredMatch();
            });
        }

        const mpTypeRow = document.getElementById("mpctf-type-selector");
        if (mpTypeRow) {
            mpTypeRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                mpTypeRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.ctfType = btn.dataset.ctftype;
            }));
        }
        document.querySelectorAll("#mpctf-p1-bot-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#mpctf-p1-bot-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.ctfMpP1Bots = parseInt(btn.dataset.count, 10);
            document.getElementById("mpctf-p1-bots-label").textContent = MatchConfig.ctfMpP1Bots;
        }));
        document.querySelectorAll("#mpctf-p2-bot-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            document.querySelectorAll("#mpctf-p2-bot-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            MatchConfig.ctfMpP2Bots = parseInt(btn.dataset.count, 10);
            document.getElementById("mpctf-p2-bots-label").textContent = MatchConfig.ctfMpP2Bots;
        }));
        document.querySelectorAll("#mpctf-time-pills .pill-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            this.syncTimeLimitPills(Math.max(1, Math.min(5, parseInt(btn.dataset.min, 10))));
        }));
        const mpCtfDiff = document.getElementById("mpctf-diff-selector");
        if (mpCtfDiff) {
            mpCtfDiff.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                mpCtfDiff.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                MatchConfig.difficulty = btn.dataset.diff;
            }));
        }
        const startMpCtf = document.getElementById("btn-start-mp-ctf");
        if (startMpCtf) {
            startMpCtf.addEventListener("click", () => {
                MatchConfig.mode = "ctf";
                const activeType = document.querySelector("#mpctf-type-selector .seg-btn.active");
                MatchConfig.ctfType = activeType ? activeType.dataset.ctftype : "versus";
                MatchConfig.timedMode = true;
                Game.startConfiguredMatch();
            });
        }
    },

    renderAbilitiesGuideIcons() {
        document.querySelectorAll(".guide-icon-canvas").forEach(c => {
            const ctx = c.getContext("2d");
            const id = c.dataset.ability;
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.save();
            ctx.translate(c.width / 2, c.height / 2);

            if (id === "mystery_orb") {
                ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.scale(0.82, 0.82);
                ArenaHazards.drawVectorQuestionMark(ctx, "#38bdf8");
            } else {
                const spec = POWERUP_CATALOG.find(p => p.id === id);
                ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
                ctx.strokeStyle = spec ? spec.ringColor : "#38bdf8";
                ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ArenaHazards.drawPowerupLogo(ctx, id);
            }
            ctx.restore();
        });
    },

    bindSettings() {
        const masterSlider = document.getElementById("set-master-vol");
        const sfxSlider = document.getElementById("set-sfx-vol");
        masterSlider.addEventListener("input", () => {
            UserSettings.masterVolume = parseInt(masterSlider.value, 10) / 100;
            document.getElementById("lbl-master-vol").textContent = `${masterSlider.value}%`;
        });
        sfxSlider.addEventListener("input", () => {
            UserSettings.sfxVolume = parseInt(sfxSlider.value, 10) / 100;
            document.getElementById("lbl-sfx-vol").textContent = `${sfxSlider.value}%`;
        });

        const camRow = document.getElementById("set-camera-mode");
        camRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            UserSettings.cameraMode = btn.dataset.cam;
            this.syncCameraModeUI();
        }));

        const gfxRow = document.getElementById("set-gfx-quality");
        gfxRow.querySelectorAll(".seg-btn").forEach(btn => btn.addEventListener("click", () => {
            SoundEngine.playUIClick();
            gfxRow.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            UserSettings.gfxQuality = btn.dataset.gfx;
        }));
    },

    syncCameraModeUI() {
        const camRow = document.getElementById("set-camera-mode");
        if (camRow) camRow.querySelectorAll(".seg-btn").forEach(b => b.classList.toggle("active", b.dataset.cam === UserSettings.cameraMode));
        const hudCamBtn = document.getElementById("btn-hud-cam");
        if (hudCamBtn) hudCamBtn.textContent = UserSettings.cameraMode === "moving_wide" ? "CAM: FOLLOW ZOOM" : "CAM: FULL STADIUM";
    },

    bindControlsScreen() {
        const runFullReset = (btnEl) => {
            SoundEngine.playUIClick();
            InputManager.resetToDefaults();
            this.renderKeybindLists();
            if (typeof MobileControls !== "undefined") {
                MobileControls.resetToDefaults();
            }
            if (btnEl) {
                const origTxt = btnEl.textContent;
                btnEl.textContent = "DEFAULTS RESTORED!";
                btnEl.style.borderColor = "#4ade80";
                btnEl.style.color = "#4ade80";
                setTimeout(() => {
                    btnEl.textContent = origTxt;
                    btnEl.style.borderColor = "";
                    btnEl.style.color = "";
                }, 1200);
            }
        };
        const resetKeysBtn = document.getElementById("btn-reset-keys");
        if (resetKeysBtn) resetKeysBtn.addEventListener("click", () => runFullReset(resetKeysBtn));
        const resetSetBtn = document.getElementById("btn-reset-settings");
        if (resetSetBtn) resetSetBtn.addEventListener("click", () => runFullReset(resetSetBtn));
    },

    renderKeybindLists() {
        const actions = [
            { key: "up", label: "Accelerate Forward" },
            { key: "down", label: "Reverse / Brake" },
            { key: "left", label: "Steer Left" },
            { key: "right", label: "Steer Right" },
            { key: "drift", label: "Handbrake Drift" }
        ];
        ["p1", "p2"].forEach(player => {
            const container = document.getElementById(`${player}-keybind-list`);
            container.innerHTML = "";
            actions.forEach(act => {
                const row = document.createElement("div");
                row.className = "keybind-row";
                row.innerHTML = `<span>${act.label}</span><button class="keybind-btn">${InputManager.formatKeyName(InputManager.bindings[player][act.key])}</button>`;
                const btn = row.querySelector(".keybind-btn");
                btn.addEventListener("click", () => {
                    SoundEngine.playUIClick();
                    document.querySelectorAll(".keybind-btn").forEach(b => b.classList.remove("listening"));
                    btn.classList.add("listening");
                    btn.textContent = "PRESS KEY...";
                    InputManager.listeningTarget = { player, action: act.key, callback: () => this.renderKeybindLists() };
                });
                container.appendChild(row);
            });
        });
    },

    bindPauseAndResults() {
        document.getElementById("btn-hud-cam").addEventListener("click", () => CameraController.cycleMode());
        document.getElementById("btn-hud-pause").addEventListener("click", () => Game.togglePause());
        document.getElementById("btn-pause-resume").addEventListener("click", () => Game.togglePause());
        document.getElementById("btn-pause-restart").addEventListener("click", () => {
            document.getElementById("modal-pause").classList.add("hidden");
            Game.startConfiguredMatch();
        });
        document.getElementById("btn-pause-menu").addEventListener("click", () => {
            document.getElementById("modal-pause").classList.add("hidden");
            Game.returnToMainMenu();
        });
        document.getElementById("btn-result-rematch").addEventListener("click", () => {
            document.getElementById("modal-results").classList.add("hidden");
            Game.startConfiguredMatch();
        });
        document.getElementById("btn-result-menu").addEventListener("click", () => {
            document.getElementById("modal-results").classList.add("hidden");
            Game.returnToMainMenu();
        });
    },

    bindSpectatorControls() {
        const nextBtn = document.getElementById("btn-spec-next");
        const leaveBtn = document.getElementById("btn-spec-leave");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                CameraController.cycleSpectateTarget(Game.cars);
            });
        }
        if (leaveBtn) {
            leaveBtn.addEventListener("click", () => {
                Game.leaveSpectatorEarly();
            });
        }
    },

    updateHUD(cars) {
        const strip = document.getElementById("hud-score-strip");
        if (!strip) return;

        const timerBox = document.getElementById("hud-timer-box");
        if (MatchConfig.timedMode && MatchConfig.mode !== "story") {
            timerBox.classList.remove("hidden");
            const totalSec = Math.max(0, Math.ceil(TimedSiegeMode.timeRemaining));
            const mins = Math.floor(totalSec / 60), secs = totalSec % 60;
            document.getElementById("hud-timer-val").textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
            timerBox.classList.toggle("timer-urgent", totalSec <= 20);
        } else {
            timerBox.classList.add("hidden");
        }

        if (MatchConfig.mode === "story" && typeof StoryMode !== "undefined") {
            const p1 = cars.find(c => c.playerSlot === "p1");
            const p2 = cars.find(c => c.playerSlot === "p2");
            const enemiesLeft = cars.filter(c => c.team === "ENEMIES" && !c.dead).length;
            const guardsAlive = cars.filter(c => c.isBodyguard && !c.dead).length;
            const ab1Charge = p1 ? Math.floor(p1.abilityCharge || 0) : 0;
            const ab1Txt = ab1Charge >= 200 ? "200% (2X READY [E])" : (ab1Charge >= 100 ? `${ab1Charge}% (1X READY [E])` : `${ab1Charge}% / 200%`);
            const ab1Col = ab1Charge >= 200 ? "#fbbf24" : (ab1Charge >= 100 ? "#00e676" : "#38bdf8");
            const formIdx = p1 ? (p1.botFormation || 0) : 0;
            const formSpec = StoryMode.formationSpecs[formIdx] || StoryMode.formationSpecs[0];
            let p2Tag = "";
            if (p2) {
                const ab2Charge = Math.floor(p2.abilityCharge || 0);
                const ab2Txt = ab2Charge >= 200 ? "200% (2X [ENTER])" : (ab2Charge >= 100 ? `${ab2Charge}% (1X [ENTER])` : `${ab2Charge}%`);
                const ab2Col = ab2Charge >= 100 ? "#00e676" : "#38bdf8";
                p2Tag = `<div class="hud-mini-tag" style="border-color:#4ade80">P2: <span style="color:${ab2Col}">${ab2Txt}</span></div>`;
            }
            const flagStateTxt = StoryMode.stageFlag ? (StoryMode.stageFlag.state === "UNLOCKED" ? "KEY UNLOCKED" : "GET KEY FLAG") : "FINAL STAGE";
            const p1Hp = p1 && !p1.dead ? `${Math.ceil(p1.hp)} HP` : "RESPAWN";
            strip.innerHTML = `
                <div class="hud-mini-tag" style="border-color:#4ade80">${p1 ? p1.label : "P1"}: <span style="color:#4ade80">${p1Hp}</span> &bull; LIVES: <span style="color:#00e676">${StoryMode.lives}</span></div>
                <div class="hud-mini-tag" style="border-color:#38bdf8;pointer-events:auto;cursor:pointer;" onclick="if(typeof StoryMode!==\x27undefined\x27){const c=Game.cars.find(x=>x.playerSlot===\x27p1\x27);if(c)StoryMode.triggerPrimaryAbility(c);}">ABILITY: <span style="color:${ab1Col}">${ab1Txt}</span></div>
                ${p2Tag}
                <div class="hud-mini-tag" style="border-color:#c084fc;pointer-events:auto;cursor:pointer;" onclick="if(typeof StoryMode!==\x27undefined\x27){const c=Game.cars.find(x=>x.playerSlot===\x27p1\x27);if(c)StoryMode.cyclePlayerBotFormation(c,1);}">BOTS: <span style="color:#c084fc">${guardsAlive}/4</span> &bull; <span style="color:#fde047">${formSpec.shortLabel}</span></div>
                <div class="hud-mini-tag" style="border-color:#fbbf24">${flagStateTxt} &bull; ENEMIES: <span style="color:#ff4d6d">${enemiesLeft}</span></div>
            `;
            return;
        }

        if (MatchConfig.mode === "single" && MatchConfig.spSubMode === "team") {
            const p1 = cars.find(c => c.playerSlot === "p1");
            const allyKills = cars.filter(c => c.team === "ALLIES").reduce((s, c) => s + c.kills, 0);
            const enemyKills = cars.filter(c => c.team === "ENEMIES").reduce((s, c) => s + c.kills, 0);
            const alliesAlive = cars.filter(c => c.team === "ALLIES" && !c.dead).length;
            const enemiesAlive = cars.filter(c => c.team === "ENEMIES" && !c.dead).length;
            strip.innerHTML = MatchConfig.timedMode ? `
                <div class="hud-mini-tag" style="border-color:${p1 ? p1.mainColor : "#38bdf8"}">
                    ${p1 ? p1.label : "P1"}: <span style="color:${p1 ? p1.lightColor : "#fff"}">${p1 && !p1.dead ? Math.ceil(p1.hp) + " HP" : "RESPAWNING..."}</span>
                </div>
                <div class="hud-mini-tag">YOUR SQUAD KILLS: <span style="color:#00e676">${allyKills}</span></div>
                <div class="hud-mini-tag">ENEMY KILLS: <span style="color:#ff4d6d">${enemyKills}</span></div>
            ` : `
                <div class="hud-mini-tag" style="border-color:${p1 ? p1.mainColor : "#38bdf8"}">
                    ${p1 ? p1.label : "P1"}: <span style="color:${p1 ? p1.lightColor : "#fff"}">${p1 ? Math.ceil(p1.hp) : 0} HP</span>
                </div>
                <div class="hud-mini-tag">YOUR SQUAD ALIVE: <span style="color:#38bdf8">${alliesAlive}</span></div>
                <div class="hud-mini-tag">ENEMY SQUAD ALIVE: <span style="color:#ff4d6d">${enemiesAlive}</span></div>
            `;
        } else if (MatchConfig.mode === "single") {
            const p1 = cars.find(c => c.playerSlot === "p1");
            const botsAlive = cars.filter(c => c.isAI && !c.dead).length;
            strip.innerHTML = MatchConfig.timedMode ? `
                <div class="hud-mini-tag" style="border-color:${p1 ? p1.mainColor : "#38bdf8"}">
                    ${p1 ? p1.label : "P1"}: <span style="color:${p1 ? p1.lightColor : "#fff"}">${p1 && !p1.dead ? Math.ceil(p1.hp) + " HP" : "RESPAWNING..."}</span>
                </div>
                <div class="hud-mini-tag">YOUR KILLS: <span style="color:#fbbf24">${p1 ? p1.kills : 0}</span></div>
            ` : `
                <div class="hud-mini-tag" style="border-color:${p1 ? p1.mainColor : "#38bdf8"}">
                    ${p1 ? p1.label : "P1"}: <span style="color:${p1 ? p1.lightColor : "#fff"}">${p1 ? Math.ceil(p1.hp) : 0} HP</span>
                </div>
                <div class="hud-mini-tag">OPPONENTS LEFT: <span style="color:#4ade80">${botsAlive}</span></div>
            `;
        } else if (MatchConfig.mode === "1v1") {
            const p1 = cars.find(c => c.playerSlot === "p1"), p2 = cars.find(c => c.playerSlot === "p2");
            strip.innerHTML = MatchConfig.timedMode ? `
                <div class="hud-mini-tag" style="border-color:${p1.mainColor}">${p1.label}: <span style="color:${p1.lightColor}">${p1.kills} KILLS</span> (${p1.dead ? "RESPAWN" : Math.ceil(p1.hp) + " HP"})</div>
                <div class="hud-mini-tag" style="border-color:${p2.mainColor}">${p2.label}: <span style="color:${p2.lightColor}">${p2.kills} KILLS</span> (${p2.dead ? "RESPAWN" : Math.ceil(p2.hp) + " HP"})</div>
            ` : `
                <div class="hud-mini-tag" style="border-color:${p1.mainColor}">${p1.label}: <span style="color:${p1.lightColor}">${Math.ceil(p1.hp)} HP</span></div>
                <div class="hud-mini-tag" style="border-color:${p2.mainColor}">${p2.label}: <span style="color:${p2.lightColor}">${Math.ceil(p2.hp)} HP</span></div>
            `;
        } else if (MatchConfig.mode === "coop") {
            const allyKills = cars.filter(c => c.team === "ALLIES").reduce((s, c) => s + c.kills, 0);
            const enemyKills = cars.filter(c => c.team === "ENEMIES").reduce((s, c) => s + c.kills, 0);
            const blueAlive = cars.filter(c => c.team === "ALLIES" && !c.dead).length;
            const redAlive = cars.filter(c => c.team === "ENEMIES" && !c.dead).length;
            strip.innerHTML = MatchConfig.timedMode ? `
                <div class="hud-mini-tag">ALLIED KILLS: <span style="color:#00e676">${allyKills}</span></div>
                <div class="hud-mini-tag">ENEMY KILLS: <span style="color:#ff4d6d">${enemyKills}</span></div>
            ` : `
                <div class="hud-mini-tag">ALLIES ALIVE: <span style="color:#38bdf8">${blueAlive}</span></div>
                <div class="hud-mini-tag">ENEMIES ALIVE: <span style="color:#ff4d6d">${redAlive}</span></div>
            `;
        } else if (MatchConfig.mode === "ctf" && typeof CaptureFlagMode !== "undefined" && CaptureFlagMode.flags.length === 2) {
            const f1 = CaptureFlagMode.flags[0], f2 = CaptureFlagMode.flags[1];
            const c1 = CaptureFlagMode.team1Captures || 0;
            const c2 = CaptureFlagMode.team2Captures || 0;
            const st1 = f1.state === "AT_BASE" ? "AT BASE" : (f1.state === "DROPPED" ? "DROPPED" : "TAKEN");
            const st2 = f2.state === "AT_BASE" ? "AT BASE" : (f2.state === "DROPPED" ? "DROPPED" : "TAKEN");
            strip.innerHTML = `
                <div class="hud-mini-tag" style="border-color:${f1.mainColor}">\uD83C\uDFF3\uFE0F ${f1.teamName}: <span style="color:#00e676">${c1} FLAGS</span> <small>(${st1})</small></div>
                <div class="hud-mini-tag" style="border-color:${f2.mainColor}">\uD83C\uDFF3\uFE0F ${f2.teamName}: <span style="color:#fbbf24">${c2} FLAGS</span> <small>(${st2})</small></div>
            `;
        } else if (MatchConfig.mode === "team_vs") {
            const t1Kills = cars.filter(c => c.team === "P1_SQUAD").reduce((s, c) => s + c.kills, 0);
            const t2Kills = cars.filter(c => c.team === "P2_SQUAD").reduce((s, c) => s + c.kills, 0);
            const t1Alive = cars.filter(c => c.team === "P1_SQUAD" && !c.dead).length;
            const t2Alive = cars.filter(c => c.team === "P2_SQUAD" && !c.dead).length;
            const p1Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color], p2Pal = CAR_COLOR_PALETTES[MatchConfig.p2Color];
            strip.innerHTML = MatchConfig.timedMode ? `
                <div class="hud-mini-tag" style="border-color:${p1Pal.main}">${MatchConfig.p1Name} KILLS: <span style="color:${p1Pal.light}">${t1Kills}</span></div>
                <div class="hud-mini-tag" style="border-color:${p2Pal.main}">${MatchConfig.p2Name} KILLS: <span style="color:${p2Pal.light}">${t2Kills}</span></div>
            ` : `
                <div class="hud-mini-tag" style="border-color:${p1Pal.main}">${MatchConfig.p1Name} SQUAD: <span style="color:${p1Pal.light}">${t1Alive}</span></div>
                <div class="hud-mini-tag" style="border-color:${p2Pal.main}">${MatchConfig.p2Name} SQUAD: <span style="color:${p2Pal.light}">${t2Alive}</span></div>
            `;
        }
    },

    showMatchResults(outcome) {
        const modal = document.getElementById("modal-results");
        document.getElementById("result-badge").textContent = outcome.badge;
        const title = document.getElementById("result-title");
        title.textContent = outcome.title; title.style.color = outcome.color;
        document.getElementById("result-subtitle").textContent = outcome.subtitle;

        const teamSummary = document.getElementById("result-team-summary");
        if (outcome.teamStats) {
            teamSummary.classList.remove("hidden");
            const t1 = outcome.teamStats.team1, t2 = outcome.teamStats.team2;
            const c1Line = t1.captures !== undefined ? `<div style="margin-top:4px;color:#fde047;">Flags Captured: <b>${t1.captures}</b></div>` : "";
            const c2Line = t2.captures !== undefined ? `<div style="margin-top:4px;color:#fde047;">Flags Captured: <b>${t2.captures}</b></div>` : "";
            teamSummary.innerHTML = `
                <div class="team-stat-card" style="border-color:${t1.color}">
                    <strong style="color:${t1.color};font-size:14px;">${t1.name}</strong>
                    ${c1Line}
                    <div style="margin-top:4px;">Cars Destroyed: <b>${t1.kills}</b></div>
                    <div>Total Car Damage Dealt: <b>${t1.damage} DMG</b></div>
                </div>
                <div class="team-stat-card" style="border-color:${t2.color}">
                    <strong style="color:${t2.color};font-size:14px;">${t2.name}</strong>
                    ${c2Line}
                    <div style="margin-top:4px;">Cars Destroyed: <b>${t2.kills}</b></div>
                    <div>Total Car Damage Dealt: <b>${t2.damage} DMG</b></div>
                </div>
            `;
        } else {
            teamSummary.classList.add("hidden");
        }

        document.getElementById("result-stats-table").innerHTML = Game.cars.map(c => {
            const statusHtml = c.dead ? `<em style="color:#ff4d6d">WRECKED</em>` : `<strong style="color:#00e676">${Math.ceil(c.hp)} HP LEFT</strong>`;
            return `
                <div class="result-row">
                    <span><strong style="color:${c.lightColor}">${c.label}</strong></span>
                    <span>${statusHtml} &bull; Kills: <b>${c.kills}</b> &bull; Damage: <b>${c.damageDealt}</b></span>
                </div>
            `;
        }).join("");

                const rematchBtn = document.getElementById("btn-result-rematch");
        if (rematchBtn) {
            rematchBtn.textContent = outcome.nextEpisodeAvailable ? "CONTINUE TO EPISODE 2 ->" : "REMATCH";
        }
        modal.classList.remove("hidden");
    }
};