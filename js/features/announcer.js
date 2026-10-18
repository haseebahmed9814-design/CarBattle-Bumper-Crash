const KillAnnouncer = {
    bannerTimer: 0,
    bannerTitle: '',
    bannerSub: '',
    bannerColor: '#fbbf24',

    slowMoActive: false,
    slowMoTimer: 0,
    pendingOutcome: null,
    focusX: 0,
    focusY: 0,

    reset() {
        this.bannerTimer = 0;
        this.slowMoActive = false;
        this.slowMoTimer = 0;
        this.pendingOutcome = null;
        if (typeof Game !== 'undefined') Game.timeScale = 1.0;
    },

    onCarKilled(attacker, victim) {
        // Only run arcade kill-streak callouts in Single Player mode
        if (MatchConfig.mode !== 'single') return;
        if (!attacker || attacker.isAI) return;

        const streakMap = [
            { kills: 1, title: 'FIRST CRUSH!',          sub: `${victim.label} Eliminated`,      color: '#38bdf8' },
            { kills: 2, title: 'DOUBLE WRECK!',         sub: '2 Opponents Demolished!',         color: '#00e676' },
            { kills: 3, title: 'TRIPLE DEMOLITION!',    sub: '3 Cars Turned to Scrap!',         color: '#fbbf24' },
            { kills: 4, title: 'ULTRA SMASH!',          sub: '4 Knockouts — Arena Dominator!',  color: '#f97316' },
            { kills: 5, title: 'UNSTOPPABLE RAMPAGE!',  sub: `${attacker.kills} Total Wrecks!`, color: '#ff1e42' }
        ];

        const entry = streakMap[Math.min(attacker.kills, 5) - 1];
        if (entry) {
            this.showBanner(entry.title, entry.sub, entry.color, 115);
            this.playFanfare(attacker.kills);
        }
    },

    showBanner(title, sub, color, durationFrames = 110) {
        this.bannerTitle = title;
        this.bannerSub = sub;
        this.bannerColor = color || '#fbbf24';
        this.bannerTimer = durationFrames;
    },

    // Triggers 0.22x Slow-Motion & Zoom on the final Single Player knockout!
    triggerFinalKnockout(winnerCar, lastVictim, outcome) {
        if (this.slowMoActive) return;
        this.slowMoActive = true;
        this.slowMoTimer = 85; // ~1.4 seconds of real-time slow motion
        this.pendingOutcome = outcome;

        this.focusX = lastVictim ? lastVictim.x : (winnerCar ? winnerCar.x : Game.arena.width / 2);
        this.focusY = lastVictim ? lastVictim.y : (winnerCar ? winnerCar.y : Game.arena.height / 2);

        Game.timeScale = 0.22;
        this.showBanner('FINAL KNOCKOUT!', `${winnerCar ? winnerCar.label : 'WINNER'} — LAST CAR STANDING!`, '#00e676', 95);
        this.playFanfare(5);
    },

    update(realDt) {
        if (this.bannerTimer > 0) {
            this.bannerTimer -= realDt;
        }

        if (this.slowMoActive) {
            this.slowMoTimer -= realDt;
            // Smoothly pull camera toward the final knockout impact
            CameraController.x += (this.focusX - CameraController.x) * 0.14;
            CameraController.y += (this.focusY - CameraController.y) * 0.14;
            CameraController.zoom += (0.85 - CameraController.zoom) * 0.10;

            if (this.slowMoTimer <= 0) {
                this.slowMoActive = false;
                Game.timeScale = 1.0;
                const finalOut = this.pendingOutcome;
                this.pendingOutcome = null;
                if (finalOut) Game.finishMatch(finalOut);
            }
        }
    },

    drawOverlay(ctx, canvas) {
        if (this.bannerTimer <= 0 && !this.slowMoActive) return;

        ctx.save();
        // Cinematic letterbox bars during Final Knockout Slow-Motion
        if (this.slowMoActive) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, 48);
            ctx.fillRect(0, canvas.height - 48, canvas.width, 48);
        }

        if (this.bannerTimer > 0) {
            const alpha = Math.min(1, this.bannerTimer / 20);
            ctx.globalAlpha = alpha;
            const cx = canvas.width / 2;
            const cy = 108;

            ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
            ctx.strokeStyle = this.bannerColor;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(cx - 230, cy - 36, 460, 68, 14);
            ctx.fill();
            ctx.stroke();

            ctx.font = '900 26px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.bannerColor;
            ctx.fillText(this.bannerTitle, cx, cy - 4);

            ctx.font = '700 13px "Segoe UI", sans-serif';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(this.bannerSub, cx, cy + 19);
        }
        ctx.restore();
    },

    playFanfare(level = 1) {
        SoundEngine.init();
        if (!SoundEngine.ctx) return;
        const vol = SoundEngine.getGain() * 0.28;
        if (vol <= 0.001) return;

        const now = SoundEngine.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            const osc = SoundEngine.ctx.createOscillator();
            const gain = SoundEngine.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq * (1 + (level - 1) * 0.05), now + idx * 0.055);
            gain.gain.setValueAtTime(vol, now + idx * 0.055);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.22);
            osc.connect(gain);
            gain.connect(SoundEngine.ctx.destination);
            osc.start(now + idx * 0.055);
            osc.stop(now + idx * 0.055 + 0.24);
        });
    }
};
