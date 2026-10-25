const MobileControls = {
    isTouchDevice: false,
    overlayEl: null,
    maxRadius: 38,

    state: {
        p1: { active: false, touchId: null, baseX: 0, baseY: 0, dx: 0, dy: 0, lastTap: 0, lastAngle: null },
        p2: { active: false, touchId: null, baseX: 0, baseY: 0, dx: 0, dy: 0, lastTap: 0, lastAngle: null }
    },

    init() {
        this.isTouchDevice = (
            ("ontouchstart" in window) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
            (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
        );

        // Default Controls tab to Joystick on mobile devices, Keyboard on PC
        UserSettings.controlsTab = this.isTouchDevice ? "joystick" : "keyboard";

        this.injectStyles();
        this.buildOverlayDOM();
        this.bindStructuredUI();
        this.hookInputManager();
        this.bindTouchAndMouseListeners();

        setInterval(() => this.syncVisibility(), 160);
    },

    isEnabled() {
        if (UserSettings.controlMode === "touch") return true;
        if (UserSettings.controlMode === "keyboard") return false;
        return this.isTouchDevice;
    },

    isTwoPlayerMatch() {
        if (MatchConfig.mode === "1v1" || MatchConfig.mode === "coop" || MatchConfig.mode === "team_vs") return true;
        if (MatchConfig.mode === "ctf" && MatchConfig.ctfType !== "solo") return true;
        if (MatchConfig.mode === "story" && MatchConfig.storyCoop) return true;
        return false;
    },

    resetToDefaults() {
        UserSettings.controlMode = "auto";
        UserSettings.spJoystickPos = "dynamic";
        UserSettings.hideJoystickVisual = false;
        UserSettings.cameraMode = "moving_wide";
        UserSettings.gfxQuality = "high";
        UserSettings.masterVolume = 0.80;
        UserSettings.sfxVolume = 0.90;

        const mSlider = document.getElementById("set-master-vol");
        const sSlider = document.getElementById("set-sfx-vol");
        const mLbl = document.getElementById("lbl-master-vol");
        const sLbl = document.getElementById("lbl-sfx-vol");
        if (mSlider) mSlider.value = 80;
        if (sSlider) sSlider.value = 90;
        if (mLbl) mLbl.textContent = "80%";
        if (sLbl) sLbl.textContent = "90%";

        const gfxRow = document.getElementById("set-gfx-quality");
        if (gfxRow) {
            gfxRow.querySelectorAll(".seg-btn").forEach(b => b.classList.toggle("active", b.dataset.gfx === "high"));
        }
        if (typeof UIManager !== "undefined") UIManager.syncCameraModeUI();

        this.syncSettingsUI();
        this.resetJoystickAnchors();
        this.syncVisibility();
    },

    injectStyles() {
        const existing = document.getElementById("mobile-controls-styles");
        if (existing) existing.remove();

        const style = document.createElement("style");
        style.id = "mobile-controls-styles";
        style.textContent = [
            "#mobile-controls-overlay { position: fixed; inset: 0; z-index: 16; pointer-events: none; user-select: none; -webkit-user-select: none; touch-action: none; }",
            ".mc-touch-zone { position: absolute; pointer-events: auto; touch-action: none; }",
            "#mc-zone-p1.single-dynamic { left: 0; bottom: 0; width: 100vw; height: 78vh; }",
            "#mc-zone-p1.single-left { left: 0; bottom: 0; width: 50vw; height: 72vh; }",
            "#mc-zone-p1.single-center { left: 20vw; bottom: 0; width: 60vw; height: 68vh; }",
            "#mc-zone-p1.split-2p { left: 0; bottom: 0; width: 48vw; height: 78vh; }",
            "#mc-zone-p2.split-2p { right: 0; bottom: 0; width: 48vw; height: 78vh; }",
            ".mc-joy-base { position: absolute; width: 90px; height: 90px; margin-left: -45px; margin-top: -45px; border-radius: 50%; background: rgba(15, 23, 42, 0.46); border: 2.5px solid rgba(56, 189, 248, 0.80); box-shadow: 0 4px 18px rgba(0, 0, 0, 0.50); display: flex; align-items: center; justify-content: center; pointer-events: none; transition: opacity 0.14s ease; }",
            ".mc-joy-base.p2-joy { border-color: rgba(74, 222, 128, 0.82); }",
            ".mc-joy-base.joy-stealth-hidden { opacity: 0 !important; }",
            ".mc-joy-ring { width: 54px; height: 54px; border-radius: 50%; border: 1.5px dashed rgba(255, 255, 255, 0.28); position: absolute; }",
            ".mc-joy-knob { position: absolute; width: 38px; height: 38px; margin-left: -19px; margin-top: -19px; left: 50%; top: 50%; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #60efff, #0284c7); border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.65); pointer-events: none; }",
            ".mc-joy-base.p2-joy .mc-joy-knob { background: radial-gradient(circle at 35% 35%, #69f0ae, #15803d); }",
            ".mc-joy-label { position: absolute; bottom: -18px; font-size: 9.5px; font-weight: 900; letter-spacing: 0.6px; color: rgba(226, 232, 240, 0.82); text-shadow: 0 1px 3px #000; white-space: nowrap; }",
            ".ctrl-main-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }",
            ".ctrl-tab-btn { background: rgba(15, 23, 42, 0.88); border: 2px solid rgba(148, 163, 184, 0.30); border-radius: 12px; padding: 12px 16px; color: #cbd5e1; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; transition: all 0.14s ease; }",
            ".ctrl-tab-btn small { font-size: 11px; font-weight: 600; color: #94a3b8; }",
            ".ctrl-tab-btn.active { background: linear-gradient(135deg, rgba(2, 132, 199, 0.32), rgba(15, 23, 42, 0.95)); border-color: #38bdf8; color: #ffffff; box-shadow: 0 6px 20px rgba(2, 132, 199, 0.28); }",
            ".ctrl-tab-btn.active small { color: #bae6fd; }",
            "@media (max-width: 640px) { .mc-joy-base { width: 80px; height: 80px; margin-left: -40px; margin-top: -40px; } .mc-joy-ring { width: 46px; height: 46px; } .mc-joy-knob { width: 32px; height: 32px; margin-left: -16px; margin-top: -16px; } .ctrl-main-tabs { grid-template-columns: 1fr; } }" 
        ].join("\n");
        document.head.appendChild(style);
    },

    buildOverlayDOM() {
        const old = document.getElementById("mobile-controls-overlay");
        if (old) old.remove();

        const overlay = document.createElement("div");
        overlay.id = "mobile-controls-overlay";
        overlay.className = "hidden";
        overlay.innerHTML = `
            <div id="mc-zone-p1" class="mc-touch-zone single-dynamic">
                <div id="mc-joy-base-p1" class="mc-joy-base">
                    <div class="mc-joy-ring"></div>
                    <div id="mc-joy-knob-p1" class="mc-joy-knob"></div>
                    <span id="mc-joy-lbl-p1" class="mc-joy-label">P1 360 STICK</span>
                </div>
            </div>

            <div id="mc-zone-p2" class="mc-touch-zone split-2p hidden">
                <div id="mc-joy-base-p2" class="mc-joy-base p2-joy">
                    <div class="mc-joy-ring"></div>
                    <div id="mc-joy-knob-p2" class="mc-joy-knob"></div>
                    <span id="mc-joy-lbl-p2" class="mc-joy-label">P2 360 STICK</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlayEl = overlay;
    },

    bindStructuredUI() {
        // 1. Clean HUD Hide/Show Stick Pill (Only visible when Joystick is active)
        const hudRight = document.querySelector(".hud-right-group");
        if (hudRight) {
            const oldTouchBtn = document.getElementById("btn-hud-touch");
            if (oldTouchBtn) oldTouchBtn.remove();
            const oldHideBtn = document.getElementById("btn-hud-hide-stick");
            if (oldHideBtn) oldHideBtn.remove();

            const hideBtn = document.createElement("button");
            hideBtn.id = "btn-hud-hide-stick";
            hideBtn.className = "hud-btn hidden";
            hideBtn.title = "Hide or Show Joystick Circle on Screen";
            hideBtn.addEventListener("click", () => {
                SoundEngine.playUIClick();
                UserSettings.hideJoystickVisual = !UserSettings.hideJoystickVisual;
                this.syncSettingsUI();
                this.applyStealthVisualState();
            });
            hudRight.insertBefore(hideBtn, hudRight.firstChild);
        }

        // 2. Bind Controls Screen Top Tabs: 1. KEYBOARD (PC) vs 2. JOYSTICK (MOBILE)
        document.querySelectorAll("[data-ctrl-tab]").forEach(tabBtn => {
            tabBtn.onclick = () => {
                SoundEngine.playUIClick();
                UserSettings.controlsTab = tabBtn.dataset.ctrlTab;
                if (UserSettings.controlsTab === "joystick" && UserSettings.controlMode === "keyboard") {
                    UserSettings.controlMode = "touch";
                } else if (UserSettings.controlsTab === "keyboard" && UserSettings.controlMode === "touch") {
                    UserSettings.controlMode = "keyboard";
                }
                this.syncSettingsUI();
                this.syncVisibility();
            };
        });

        // 3. Bind Control Device Mode buttons (AUTO / KEYBOARD / JOYSTICK)
        document.querySelectorAll("[data-ctrl]").forEach(btn => {
            btn.onclick = () => {
                SoundEngine.playUIClick();
                UserSettings.controlMode = btn.dataset.ctrl;
                if (UserSettings.controlMode === "touch") UserSettings.controlsTab = "joystick";
                if (UserSettings.controlMode === "keyboard") UserSettings.controlsTab = "keyboard";
                this.syncSettingsUI();
                this.syncVisibility();
            };
        });

        // 4. Bind Single-Player Joystick Placement buttons (TAP ANYWHERE / LEFT / MIDDLE)
        document.querySelectorAll("[data-jpos]").forEach(btn => {
            btn.onclick = () => {
                SoundEngine.playUIClick();
                UserSettings.spJoystickPos = btn.dataset.jpos;
                this.syncSettingsUI();
                this.resetJoystickAnchors();
            };
        });

        // 5. Bind Joystick Visibility buttons (SHOW / HIDE)
        document.querySelectorAll("[data-jvis]").forEach(btn => {
            btn.onclick = () => {
                SoundEngine.playUIClick();
                UserSettings.hideJoystickVisual = (btn.dataset.jvis === "hide");
                this.syncSettingsUI();
                this.applyStealthVisualState();
            };
        });

        this.syncSettingsUI();
    },

    applyStealthVisualState() {
        ["p1", "p2"].forEach(pk => {
            const baseEl = document.getElementById(`mc-joy-base-${pk}`);
            if (baseEl) baseEl.classList.toggle("joy-stealth-hidden", !!UserSettings.hideJoystickVisual);
        });
    },

    syncSettingsUI() {
        // Sync Keyboard vs Joystick Tabs in #screen-controls
        document.querySelectorAll("[data-ctrl-tab]").forEach(b => {
            b.classList.toggle("active", b.dataset.ctrlTab === UserSettings.controlsTab);
        });
        const kbPanel = document.getElementById("controls-tab-keyboard");
        const joyPanel = document.getElementById("controls-tab-joystick");
        if (kbPanel && joyPanel) {
            kbPanel.classList.toggle("hidden", UserSettings.controlsTab !== "keyboard");
            joyPanel.classList.toggle("hidden", UserSettings.controlsTab !== "joystick");
        }

        document.querySelectorAll("[data-ctrl]").forEach(b => {
            b.classList.toggle("active", b.dataset.ctrl === UserSettings.controlMode);
        });
        document.querySelectorAll("[data-jpos]").forEach(b => {
            b.classList.toggle("active", b.dataset.jpos === UserSettings.spJoystickPos);
        });
        document.querySelectorAll("[data-jvis]").forEach(b => {
            const isHideBtn = (b.dataset.jvis === "hide");
            b.classList.toggle("active", isHideBtn === !!UserSettings.hideJoystickVisual);
        });

        const hudHideBtn = document.getElementById("btn-hud-hide-stick");
        if (hudHideBtn) {
            hudHideBtn.classList.toggle("hidden", !this.isEnabled());
            hudHideBtn.textContent = UserSettings.hideJoystickVisual ? "SHOW STICK" : "HIDE STICK";
            hudHideBtn.style.borderColor = UserSettings.hideJoystickVisual ? "#fbbf24" : "#38bdf8";
        }

        const badge = document.getElementById("ctrl-detect-badge");
        if (badge) {
            const activeTxt = this.isEnabled() ? "JOYSTICK ACTIVE" : "KEYBOARD ACTIVE";
            badge.textContent = `${this.isTouchDevice ? "MOBILE SCREEN" : "PC SCREEN"} (${activeTxt})`;
        }
        this.applyStealthVisualState();
    },

    resetJoystickAnchors() {
        const is2P = this.isTwoPlayerMatch();
        const zoneP1 = document.getElementById("mc-zone-p1");
        const zoneP2 = document.getElementById("mc-zone-p2");
        if (!zoneP1 || !zoneP2) return;

        if (is2P) {
            zoneP1.className = "mc-touch-zone split-2p";
            zoneP2.className = "mc-touch-zone split-2p";
            this.setJoystickHome("p1", 76, zoneP1.clientHeight - 76);
            this.setJoystickHome("p2", zoneP2.clientWidth - 76, zoneP2.clientHeight - 76);
        } else {
            zoneP2.className = "mc-touch-zone split-2p hidden";
            if (UserSettings.spJoystickPos === "left") {
                zoneP1.className = "mc-touch-zone single-left";
                this.setJoystickHome("p1", 82, zoneP1.clientHeight - 82);
            } else if (UserSettings.spJoystickPos === "center") {
                zoneP1.className = "mc-touch-zone single-center";
                this.setJoystickHome("p1", zoneP1.clientWidth / 2, zoneP1.clientHeight - 82);
            } else {
                zoneP1.className = "mc-touch-zone single-dynamic";
                this.setJoystickHome("p1", 92, zoneP1.clientHeight - 82);
            }
        }
        this.applyStealthVisualState();
    },

    setJoystickHome(playerKey, localX, localY) {
        const st = this.state[playerKey];
        if (!st.active) {
            st.baseX = localX;
            st.baseY = localY;
            st.dx = 0;
            st.dy = 0;
            this.renderJoystickDOM(playerKey);
        }
    },

    renderJoystickDOM(playerKey) {
        const st = this.state[playerKey];
        const baseEl = document.getElementById(`mc-joy-base-${playerKey}`);
        const knobEl = document.getElementById(`mc-joy-knob-${playerKey}`);
        if (!baseEl || !knobEl) return;
        baseEl.style.left = `${st.baseX}px`;
        baseEl.style.top = `${st.baseY}px`;
        knobEl.style.transform = `translate(${st.dx}px, ${st.dy}px)`;
    },

    syncVisibility() {
        if (!this.overlayEl || typeof Game === "undefined") return;
        const shouldShow = this.isEnabled() && (Game.state === "PLAYING" || Game.state === "COUNTDOWN") && !Game.isSpectating;
        const wasHidden = this.overlayEl.classList.contains("hidden");
        this.overlayEl.classList.toggle("hidden", !shouldShow);
        this.syncSettingsUI();
        if (shouldShow && wasHidden) {
            this.resetJoystickAnchors();
        }
    },

    bindTouchAndMouseListeners() {
        ["p1", "p2"].forEach(playerKey => {
            const zone = document.getElementById(`mc-zone-${playerKey}`);
            if (!zone) return;

            const startStick = (id, clientX, clientY) => {
                const rect = zone.getBoundingClientRect();
                const lx = clientX - rect.left;
                const ly = clientY - rect.top;
                const st = this.state[playerKey];

                const now = performance.now();
                if (now - (st.lastTap || 0) < 280 && MatchConfig.mode === "story" && typeof StoryMode !== "undefined") {
                    const car = Game.cars.find(c => c.playerSlot === playerKey);
                    if (car) StoryMode.triggerPrimaryAbility(car);
                }
                st.lastTap = now;

                st.active = true;
                st.touchId = id;

                if (!this.isTwoPlayerMatch() && playerKey === "p1" && UserSettings.spJoystickPos === "dynamic") {
                    st.baseX = Math.max(52, Math.min(rect.width - 52, lx));
                    st.baseY = Math.max(52, Math.min(rect.height - 52, ly));
                }
                this.moveStick(playerKey, lx, ly);
            };

            zone.addEventListener("touchstart", (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (!this.state[playerKey].active) {
                        startStick(t.identifier, t.clientX, t.clientY);
                        break;
                    }
                }
            }, { passive: false });

            zone.addEventListener("touchmove", (e) => {
                e.preventDefault();
                const st = this.state[playerKey];
                if (!st.active) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === st.touchId) {
                        const rect = zone.getBoundingClientRect();
                        this.moveStick(playerKey, t.clientX - rect.left, t.clientY - rect.top);
                        break;
                    }
                }
            }, { passive: false });

            const endTouch = (e) => {
                const st = this.state[playerKey];
                if (!st.active) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === st.touchId) {
                        st.active = false;
                        st.touchId = null;
                        st.dx = 0;
                        st.dy = 0;
                        st.lastAngle = null;
                        this.renderJoystickDOM(playerKey);
                        break;
                    }
                }
            };
            zone.addEventListener("touchend", endTouch, { passive: false });
            zone.addEventListener("touchcancel", endTouch, { passive: false });

            zone.addEventListener("mousedown", (e) => {
                e.preventDefault();
                startStick("mouse", e.clientX, e.clientY);
            });
            window.addEventListener("mousemove", (e) => {
                const st = this.state[playerKey];
                if (st.active && st.touchId === "mouse") {
                    const rect = zone.getBoundingClientRect();
                    this.moveStick(playerKey, e.clientX - rect.left, e.clientY - rect.top);
                }
            });
            window.addEventListener("mouseup", () => {
                const st = this.state[playerKey];
                if (st.active && st.touchId === "mouse") {
                    st.active = false;
                    st.touchId = null;
                    st.dx = 0;
                    st.dy = 0;
                    st.lastAngle = null;
                    this.renderJoystickDOM(playerKey);
                }
            });
        });

        window.addEventListener("resize", () => this.resetJoystickAnchors());
    },

    moveStick(playerKey, lx, ly) {
        const st = this.state[playerKey];
        let vx = lx - st.baseX;
        let vy = ly - st.baseY;
        const dist = Math.hypot(vx, vy);
        if (dist > this.maxRadius) {
            vx = (vx / dist) * this.maxRadius;
            vy = (vy / dist) * this.maxRadius;
        }
        st.dx = vx;
        st.dy = vy;
        this.renderJoystickDOM(playerKey);
    },

    normalizeAngle(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
    },

    computeTouchInput(playerKey) {
        const st = this.state[playerKey];
        const dist = Math.hypot(st.dx, st.dy);
        if (!st.active || dist <= 4) return null;

        const car = (typeof Game !== "undefined" && Game.cars) ? Game.cars.find(c => c.playerSlot === playerKey) : null;
        if (!car || car.dead) {
            return {
                up: true,
                down: false,
                steer: Math.max(-1, Math.min(1, st.dx / (this.maxRadius * 0.6))),
                drift: false,
                throttle: 1.0
            };
        }

        // SUPER-FAST 360-DEGREE REFLEX JOYSTICK ENGINE:
        // - Instant 180-degree Snap-Turn when flicking from Right to Left (or any opposite direction)!
        // - Redirects momentum immediately so mobile players never get stuck in a slow, wide circle!
        const targetAngle = Math.atan2(st.dy, st.dx);
        const diff = this.normalizeAngle(targetAngle - car.angle);
        const absDiff = Math.abs(diff);
        const speed = Math.hypot(car.vx, car.vy);

        if (absDiff > 1.25) {
            // Player flicked the joystick to the opposite direction (e.g., Right -> Left):
            // Instantly whip the nose around and transfer momentum into the new direction!
            car.angle = this.normalizeAngle(car.angle + diff * 0.42);
            const burstSpd = Math.max(6.2, speed * 0.92);
            car.vx = Math.cos(car.angle) * burstSpd;
            car.vy = Math.sin(car.angle) * burstSpd;
        } else if (absDiff > 0.08) {
            // Fast, responsive angular tracking for medium & fine turns
            car.angle = this.normalizeAngle(car.angle + diff * 0.24);
        }

        const remainingDiff = this.normalizeAngle(targetAngle - car.angle);
        const steer = Math.max(-1, Math.min(1, remainingDiff * 3.8));
        const drift = Math.abs(remainingDiff) > 0.42 && speed > 3.5;

        return {
            up: true,
            down: false,
            steer,
            drift,
            throttle: 1.0
        };
    },

    hookInputManager() {
        if (typeof InputManager === "undefined" || InputManager._mobileHooked) return;
        InputManager._mobileHooked = true;
        const origGetInput = InputManager.getPlayerInput.bind(InputManager);

        InputManager.getPlayerInput = (playerKey) => {
            const kb = origGetInput(playerKey);
            if (!this.isEnabled() || !InputManager.gameplayActive) return kb;

            const touchIn = this.computeTouchInput(playerKey);
            if (!touchIn) return kb;

            return {
                up: kb.up || touchIn.up,
                down: kb.down || touchIn.down,
                steer: Math.abs(touchIn.steer) > 0.02 ? touchIn.steer : kb.steer,
                drift: kb.drift || touchIn.drift,
                throttle: 1.0
            };
        };
    }
};

window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => MobileControls.init(), 60);
});