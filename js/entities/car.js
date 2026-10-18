class BattleCar {
    constructor(opts) {
        this.id = opts.id;
        this.label = opts.label || 'CAR';
        this.team = opts.team || 'FFA';
        this.isAI = !!opts.isAI;
        this.playerSlot = opts.playerSlot || null;
        this.spec = VEHICLE_ARCHETYPES.classic;

        const pal = CAR_COLOR_PALETTES[opts.colorKey] || CAR_COLOR_PALETTES.blue;
        this.colorKey = pal.id;
        this.mainColor = opts.mainColor || pal.main;
        this.lightColor = opts.lightColor || pal.light;
        this.darkColor = opts.darkColor || pal.dark;
        this.glowColor = opts.glowColor || pal.glow;
        this.teamRingColor = opts.teamRingColor || this.glowColor;

        this.length = this.spec.length;
        this.width = this.spec.width;
        this.radius = this.spec.radius;
        this.mass = this.spec.mass;
        this.maxHp = this.spec.maxHp;

        this.spawnX = opts.x || 500;
        this.spawnY = opts.y || 500;
        this.spawnAngle = opts.angle || 0;
        this.reset();
    }

    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.angle = this.spawnAngle;
        this.angVel = 0;
        this.wheelAngle = 0;
        this.hp = this.maxHp;
        this.dead = false;
        this.isBraking = false;
        this.isAccelerating = false;
        this.kills = 0;
        this.damageDealt = 0;
        this.lastAttacker = null;

        this.dentFront = 0;
        this.dentRear = 0;
        this.dentLeft = 0;
        this.dentRight = 0;

        this.parts = {
            frontBumper: true, rearBumper: true, rearSpoiler: true,
            leftFender: true, rightFender: true, hood: true
        };

        if (this.isAI && typeof TacticalAIBrain !== 'undefined') {
            this.aiBrain = new TacticalAIBrain(this);
        }
    }

    applyDirectionalDamage(amount, zone, hitX, hitY, attacker) {
        if (this.dead) return;
        this.hp = Math.max(0, this.hp - amount);
        if (attacker && attacker !== this) {
            this.lastAttacker = attacker;
            attacker.damageDealt += Math.round(amount);
        }

        if (zone === 'REAR') {
            this.dentRear = Math.min(16, this.dentRear + amount * 0.24);
            if (this.dentRear > 4.5 && this.parts.rearSpoiler) {
                this.parts.rearSpoiler = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle + Math.PI / 2, 36, 6, '#0f172a');
            }
            if (this.dentRear > 8.5 && this.parts.rearBumper) {
                this.parts.rearBumper = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle + Math.PI / 2, 32, 7, '#1e293b');
            }
        } else if (zone === 'LEFT') {
            this.dentLeft = Math.min(12, this.dentLeft + amount * 0.22);
            if (this.dentLeft > 5.5 && this.parts.leftFender) {
                this.parts.leftFender = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle, 34, 6, this.mainColor);
            }
        } else if (zone === 'RIGHT') {
            this.dentRight = Math.min(12, this.dentRight + amount * 0.22);
            if (this.dentRight > 5.5 && this.parts.rightFender) {
                this.parts.rightFender = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle, 34, 6, this.mainColor);
            }
        } else {
            this.dentFront = Math.min(15, this.dentFront + amount * 0.21);
            if (this.dentFront > 6.5 && this.parts.frontBumper) {
                this.parts.frontBumper = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle + Math.PI / 2, 32, 7, '#1e293b');
            }
            if (this.hp < this.maxHp * 0.40 && this.parts.hood) {
                this.parts.hood = false;
                Game.spawnDetachedPart(this.x, this.y, this.angle, 22, 26, this.darkColor);
            }
        }

        if (this.isAI && this.aiBrain) this.aiBrain.onTakeDamage(attacker, zone);

        if (this.hp <= 0 && !this.dead) {
            this.dead = true;
            if (attacker && attacker !== this) attacker.kills++;
            SoundEngine.playExplosion();
            Game.triggerExplosion(this);
        }
    }

    draw(ctx, showIndicator = true) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const L = this.length;
        const W = this.width;
        const hpRatio = Math.max(0, this.hp / this.maxHp);

        if (!this.dead && showIndicator) {
            ctx.save();
            ctx.strokeStyle = this.teamRingColor;
            ctx.globalAlpha = this.isAI ? 0.42 : 0.85;
            ctx.lineWidth = this.isAI ? 3 : 4.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.rotate(this.angle);

        const fX = L / 2 - this.dentFront;
        const rX = -L / 2 + this.dentRear;
        const topY = -W / 2 + this.dentLeft;
        const botY = W / 2 - this.dentRight;

        // Unified Dual Exhaust Nitro Flame (Always matches the car's paint color!)
        if (!this.dead) {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(rX - 5, -W * 0.25, 5, 4.5);
            ctx.fillRect(rX - 5, W * 0.25 - 4.5, 5, 4.5);

            if (this.isAccelerating) {
                const pulse = 10 + Math.sin(performance.now() * 0.035 + this.id) * 3.5;
                ctx.save();
                ctx.shadowColor = this.glowColor;
                ctx.shadowBlur = 10;

                // Outer Car-Colored Flame Cone
                ctx.fillStyle = this.mainColor;
                ctx.beginPath();
                ctx.moveTo(rX - 5, -W * 0.25 - 0.5);
                ctx.lineTo(rX - 5 - pulse, -W * 0.25 + 2.2);
                ctx.lineTo(rX - 5, -W * 0.25 + 5);
                ctx.moveTo(rX - 5, W * 0.25 - 5);
                ctx.lineTo(rX - 5 - pulse, W * 0.25 - 2.2);
                ctx.lineTo(rX - 5, W * 0.25 + 0.5);
                ctx.fill();

                // Inner Bright Core Matching Car Tint
                ctx.fillStyle = this.lightColor;
                ctx.beginPath();
                ctx.moveTo(rX - 5, -W * 0.25 + 0.8);
                ctx.lineTo(rX - 5 - pulse * 0.55, -W * 0.25 + 2.2);
                ctx.lineTo(rX - 5, -W * 0.25 + 3.6);
                ctx.moveTo(rX - 5, W * 0.25 - 3.6);
                ctx.lineTo(rX - 5 - pulse * 0.55, W * 0.25 - 2.2);
                ctx.lineTo(rX - 5, W * 0.25 - 0.8);
                ctx.fill();
                ctx.restore();
            }

            const beamGrad = ctx.createLinearGradient(L * 0.4, 0, L * 2.4, 0);
            beamGrad.addColorStop(0, 'rgba(224, 242, 254, 0.24)');
            beamGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(fX, -W * 0.36);
            ctx.lineTo(L * 2.4, -W * 1.15);
            ctx.lineTo(L * 2.4, W * 1.15);
            ctx.lineTo(fX, W * 0.36);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.shadowColor = this.dead ? 'transparent' : this.glowColor;
        ctx.shadowBlur = this.dead ? 0 : 14;
        ctx.beginPath();
        ctx.roundRect(-L / 2 - 2, -W / 2 + 3, L + 4, W - 2, 14);
        ctx.fill();
        ctx.shadowBlur = 0;

        const wheelPositions = [
            { x: L * 0.29, y: -W * 0.49, front: true },
            { x: L * 0.29, y: W * 0.49, front: true },
            { x: -L * 0.29, y: -W * 0.49, front: false },
            { x: -L * 0.29, y: W * 0.49, front: false }
        ];
        wheelPositions.forEach((w, idx) => {
            ctx.save();
            ctx.translate(w.x, w.y);
            if (w.front) ctx.rotate(this.wheelAngle);
            if (hpRatio < 0.30 && idx === 0) ctx.rotate(0.22);
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.roundRect(-11, -6, 22, 12, 3.5);
            ctx.fill();
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-6, -2.2, 12, 4.4);
            ctx.fillStyle = this.lightColor;
            ctx.fillRect(-1.5, -1.5, 3, 3);
            ctx.restore();
        });

        ctx.fillStyle = '#111827';
        ctx.fillRect(0, -W * 0.34, L * 0.38, W * 0.68);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(L * 0.08, -W * 0.22, 15, W * 0.44);

        if (this.dead) {
            ctx.fillStyle = '#27272a';
        } else {
            const bodyGrad = ctx.createLinearGradient(rX, topY, fX, botY);
            bodyGrad.addColorStop(0, this.darkColor);
            bodyGrad.addColorStop(0.45, this.mainColor);
            bodyGrad.addColorStop(0.80, this.lightColor);
            bodyGrad.addColorStop(1, this.mainColor);
            ctx.fillStyle = bodyGrad;
        }

        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(rX, topY + 6);
        ctx.lineTo(-L * 0.14, topY);
        ctx.lineTo(0, topY + 2.5);
        ctx.lineTo(L * 0.24, topY);
        ctx.lineTo(fX, topY + 7);
        ctx.lineTo(fX + 4, 0);
        ctx.lineTo(fX, botY - 7);
        ctx.lineTo(L * 0.24, botY);
        ctx.lineTo(0, botY - 2.5);
        ctx.lineTo(-L * 0.14, botY);
        ctx.lineTo(rX, botY - 6);
        ctx.lineTo(rX - 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (!this.dead) {
            ctx.fillStyle = this.mainColor;
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.roundRect(L * 0.04, topY - 4, 7, 4, 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.roundRect(L * 0.04, botY, 7, 4, 2); ctx.fill(); ctx.stroke();
        }

        if (!this.dead && this.parts.hood) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
            ctx.fillRect(rX + 6, -4.5, (fX - rX) - 12, 3);
            ctx.fillRect(rX + 6, 1.5, (fX - rX) - 12, 3);

            ctx.fillStyle = 'rgba(9, 13, 22, 0.8)';
            ctx.fillRect(L * 0.15, -W * 0.27, 10, 5);
            ctx.fillRect(L * 0.15, W * 0.27 - 5, 10, 5);

            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#090d16';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(L * 0.34, 0);
            ctx.lineTo(L * 0.28, -4.5);
            ctx.lineTo(L * 0.25, 0);
            ctx.lineTo(L * 0.28, 4.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        if (this.parts.frontBumper && !this.dead) {
            ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.roundRect(fX - 1, -W * 0.44, 6, W * 0.88, 3); ctx.fill(); ctx.stroke();
        }
        if (this.parts.rearBumper && !this.dead) {
            ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.roundRect(rX - 4, -W * 0.44, 6, W * 0.88, 3); ctx.fill(); ctx.stroke();
        }
        if (this.parts.rearSpoiler && !this.dead) {
            ctx.fillStyle = '#090d16'; ctx.strokeStyle = this.lightColor; ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(rX + 2, -W * 0.46, 8, W * 0.92, 2); ctx.fill(); ctx.stroke();
        }

        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(-L * 0.24, topY * 0.72, L * 0.46, (botY - topY) * 0.72, 8);
        ctx.fill();

        if (!this.dead) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
            ctx.beginPath();
            ctx.moveTo(L * 0.06, -W * 0.24);
            ctx.lineTo(L * 0.19, -W * 0.18);
            ctx.lineTo(L * 0.02, W * 0.22);
            ctx.lineTo(-L * 0.06, W * 0.16);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = this.darkColor;
            ctx.beginPath();
            ctx.roundRect(-L * 0.18, topY * 0.50, L * 0.23, (botY - topY) * 0.50, 4);
            ctx.fill();
        }

        if (hpRatio < 0.75) {
            ctx.strokeStyle = 'rgba(241, 245, 249, 0.85)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(2, -6); ctx.lineTo(13, 0); ctx.lineTo(6, 7);
            if (hpRatio < 0.42) { ctx.moveTo(13, 0); ctx.lineTo(-5, 9); }
            ctx.stroke();
        }

        if (!this.dead) {
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(fX - 2, -W * 0.37, 4, 8);
            ctx.fillRect(fX - 2, W * 0.37 - 8, 4, 8);

            ctx.fillStyle = this.isBraking ? '#ff1744' : '#9f1239';
            ctx.fillRect(rX - 1, -W * 0.37, 4, 8);
            ctx.fillRect(rX - 1, W * 0.37 - 8, 4, 8);
        }

        ctx.restore();

        // LARGER, HIGH-VISIBILITY OVERHEAD HEALTH BAR & NAME TAG
        if (showIndicator && !this.dead) {
            ctx.save();
            ctx.translate(this.x, this.y - this.radius - 28);
            const isHuman = !this.isAI;
            const bw = isHuman ? 88 : 74;
            const bh = isHuman ? 11 : 9;

            ctx.font = isHuman ? '900 14px "Segoe UI", sans-serif' : '800 12px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.92)';
            ctx.lineWidth = 4;
            const labelText = `${this.label} (${Math.ceil(this.hp)})`;
            ctx.strokeText(labelText, 0, -5);
            ctx.fillStyle = isHuman ? this.lightColor : '#ffffff';
            ctx.fillText(labelText, 0, -5);

            // Outer High-Contrast Bar Frame
            ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
            ctx.strokeStyle = isHuman ? '#ffffff' : this.lightColor;
            ctx.lineWidth = isHuman ? 1.8 : 1.3;
            ctx.beginPath();
            ctx.roundRect(-bw / 2, 1, bw, bh, 4);
            ctx.fill();
            ctx.stroke();

            // Health Fill
            const fillColor = hpRatio > 0.55 ? '#00e676' : (hpRatio > 0.28 ? '#ffb703' : '#ff1e42');
            ctx.fillStyle = fillColor;
            const fillW = Math.max(0, (bw - 4) * hpRatio);
            if (fillW > 0) {
                ctx.beginPath();
                ctx.roundRect(-bw / 2 + 2, 3, fillW, bh - 4, 2.5);
                ctx.fill();
            }

            // 25% Segment Tick Marks for easy reading in Team Battles
            ctx.strokeStyle = 'rgba(9, 13, 22, 0.65)';
            ctx.lineWidth = 1;
            for (let s = 1; s <= 3; s++) {
                const tx = -bw / 2 + (bw * s) / 4;
                ctx.beginPath();
                ctx.moveTo(tx, 2);
                ctx.lineTo(tx, bh);
                ctx.stroke();
            }

            ctx.restore();
        }
    }
}

function renderCarPreviewCanvas(canvasId, colorKey) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const pCtx = c.getContext('2d');
    pCtx.clearRect(0, 0, c.width, c.height);
    pCtx.fillStyle = '#1f6f38'; pCtx.fillRect(0, 0, c.width, c.height);
    pCtx.fillStyle = '#247a3f'; pCtx.fillRect(c.width * 0.25, 0, c.width * 0.5, c.height);

    const dummy = new BattleCar({
        id: 'preview', colorKey: colorKey || 'blue',
        x: c.width / 2, y: c.height / 2, angle: -0.20
    });
    dummy.wheelAngle = 0.26;
    dummy.isAccelerating = true;
    dummy.draw(pCtx, false);
}
