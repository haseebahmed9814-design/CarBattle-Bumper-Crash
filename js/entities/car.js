class BattleCar {
    constructor(opts) {
        this.id = opts.id;
        this.label = opts.label || "CAR";
        this.team = opts.team || "FFA";
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
        this.baseRect = opts.baseRect || null;
        this.kills = 0;
        this.deaths = 0;
        this.damageDealt = 0;
        this.reset(true);
    }

    reset(resetScore = true) {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.angle = this.spawnAngle;
        this.angVel = 0;
        this.wheelAngle = 0;
        this.hp = this.maxHp;
        this.dead = false;
        this.respawnTimer = 0;
        this.spawnShieldTimer = 0;
        this.isBraking = false;
        this.isAccelerating = false;
        if (resetScore) {
            this.kills = 0;
            this.deaths = 0;
            this.damageDealt = 0;
        }
        this.lastAttacker = null;
        this.carryingFlag = null;

        this.activePowerup = null;
        this.powerupTimer = 0;
        this.powerupMaxTimer = 0;
        this.powerupMeta = null;

        this.trapAnimType = null;
        this.trapAnimTimer = 0;
        this.trapAnimMaxTimer = 150;

        this.burningTimer = 0;
        this.burnAttacker = null;

        this.dentFront = 0;
        this.dentRear = 0;
        this.dentLeft = 0;
        this.dentRight = 0;

        this.parts = {
            frontBumper: true, rearBumper: true, rearSpoiler: true,
            leftFender: true, rightFender: true, hood: true
        };

        if (this.isAI && typeof TacticalAIBrain !== "undefined") {
            this.aiBrain = new TacticalAIBrain(this);
        }
    }

    respawnAtBase(arena) {
        let rx = this.spawnX;
        let ry = this.spawnY;

        if (typeof Game !== "undefined" && Game.cars) {
            if (this.baseRect) {
                const r = this.baseRect;
                const candidateYOffsets = [0, -95, 95, -190, 190, -275, 275];
                const candidateXOffsets = [0, -36, 36];
                let foundSpot = false;

                for (const xo of candidateXOffsets) {
                    for (const yo of candidateYOffsets) {
                        const testX = Math.max(r.xMin + 52, Math.min(r.xMax - 52, this.spawnX + xo));
                        const testY = Math.max(r.yMin + 52, Math.min(r.yMax - 52, this.spawnY + yo));
                        const clash = Game.cars.some(other => other !== this && !other.dead && Math.hypot(other.x - testX, other.y - testY) < this.radius * 2.15);
                        if (!clash) {
                            rx = testX;
                            ry = testY;
                            foundSpot = true;
                            break;
                        }
                    }
                    if (foundSpot) break;
                }
            } else {
                for (let attempt = 0; attempt < 6; attempt++) {
                    const clash = Game.cars.some(other => other !== this && !other.dead && Math.hypot(other.x - rx, other.y - ry) < this.radius * 2.15);
                    if (!clash) break;
                    const offset = (attempt % 2 === 0 ? 1 : -1) * Math.ceil(attempt / 2) * 45;
                    rx = Math.max(arena.wallPad + 110, Math.min(arena.width - arena.wallPad - 110, this.spawnX + offset));
                }
            }
        }

        this.reset(false);
        this.x = rx;
        this.y = ry;
        this.angle = this.spawnAngle;
        this.spawnShieldTimer = 120;

        if (typeof Game !== "undefined") {
            Game.shockwaves.push({ x: this.x, y: this.y, r: 10, maxR: 135, alpha: 0.95, color: this.lightColor });
            Game.floatingTexts.push({
                x: this.x, y: this.y - 36,
                text: `${this.label} RESPAWNED IN BASE!`,
                color: this.lightColor, life: 1.15
            });
        }
        if (typeof SoundEngine !== "undefined") {
            SoundEngine.playPowerupPickup(true, false);
        }
    }

    triggerTrapAnimation(trapId) {
        this.trapAnimType = trapId;
        this.trapAnimTimer = 150;
        this.trapAnimMaxTimer = 150;
    }

    applyDirectionalDamage(amount, zone, hitX, hitY, attacker) {
        if (this.dead) return;
        if (this.spawnShieldTimer > 0) return;

        this.hp = Math.max(0, this.hp - amount);
        if (attacker && attacker !== this) {
            this.lastAttacker = attacker;
            attacker.damageDealt += Math.round(amount);
        }

        if (zone === "REAR") {
            this.dentRear = Math.min(16, this.dentRear + amount * 0.24);
            if (this.dentRear > 4.5 && this.parts.rearSpoiler) {
                this.parts.rearSpoiler = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle + Math.PI / 2, 36, 6, "#0f172a");
            }
            if (this.dentRear > 8.5 && this.parts.rearBumper) {
                this.parts.rearBumper = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle + Math.PI / 2, 32, 7, "#1e293b");
            }
        } else if (zone === "LEFT") {
            this.dentLeft = Math.min(12, this.dentLeft + amount * 0.22);
            if (this.dentLeft > 5.5 && this.parts.leftFender) {
                this.parts.leftFender = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle, 34, 6, this.mainColor);
            }
        } else if (zone === "RIGHT") {
            this.dentRight = Math.min(12, this.dentRight + amount * 0.22);
            if (this.dentRight > 5.5 && this.parts.rightFender) {
                this.parts.rightFender = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle, 34, 6, this.mainColor);
            }
        } else {
            this.dentFront = Math.min(15, this.dentFront + amount * 0.21);
            if (this.dentFront > 6.5 && this.parts.frontBumper) {
                this.parts.frontBumper = false;
                Game.spawnDetachedPart(hitX, hitY, this.angle + Math.PI / 2, 32, 7, "#1e293b");
            }
            if (this.hp < this.maxHp * 0.40 && this.parts.hood) {
                this.parts.hood = false;
                Game.spawnDetachedPart(this.x, this.y, this.angle, 22, 26, this.darkColor);
            }
        }

        if (this.isAI && this.aiBrain) this.aiBrain.onTakeDamage(attacker, zone);

        if (this.hp <= 0 && !this.dead) {
            this.dead = true;
            this.deaths = (this.deaths || 0) + 1;
            this.activePowerup = null;
            this.trapAnimTimer = 0;
            this.burningTimer = 0;
            if (MatchConfig.mode === "ctf") {
                this.respawnTimer = 540;
            } else if (MatchConfig.timedMode) {
                this.respawnTimer = 150;
            }
            if (MatchConfig.mode === "ctf" && typeof CaptureFlagMode !== "undefined") {
                CaptureFlagMode.onCarDestroyed(this);
            }
            if (attacker && attacker !== this) attacker.kills++;
            SoundEngine.playExplosion();
            Game.triggerExplosion(this);
        }
    }

    drawOnCarTrapEffect(ctx, L, W, now) {
        if (this.trapAnimTimer <= 0 || !this.trapAnimType) return;
        const progress = 1 - (this.trapAnimTimer / this.trapAnimMaxTimer);
        const alpha = Math.min(1, (this.trapAnimTimer / 35));

        ctx.save();
        ctx.globalAlpha = alpha;

        if (this.trapAnimType === "tire_puncture") {
            const wx = L * 0.29, wy = -W * 0.49;
            const burstR = 8 + ((now * 0.08) % 28);
            ctx.strokeStyle = "#f87171";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(wx, wy, burstR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const a = (now * 0.02) + (i * Math.PI * 0.4);
                ctx.beginPath();
                ctx.moveTo(wx + Math.cos(a) * 6, wy + Math.sin(a) * 6);
                ctx.lineTo(wx + Math.cos(a) * 18, wy + Math.sin(a) * 18);
                ctx.stroke();
            }
        } else if (this.trapAnimType === "sabotage_bomb") {
            const blastR = 16 + Math.sin(now * 0.04) * 10 + progress * 18;
            const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, blastR);
            grad.addColorStop(0, "rgba(254, 240, 138, 0.85)");
            grad.addColorStop(0.5, "rgba(249, 115, 22, 0.65)");
            grad.addColorStop(1, "rgba(220, 38, 38, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, blastR, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.trapAnimType === "steering_glitch") {
            ctx.strokeStyle = (Math.floor(now / 50) % 2 === 0) ? "#38bdf8" : "#fde047";
            ctx.lineWidth = 2.6;
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 10;
            for (let b = 0; b < 3; b++) {
                ctx.beginPath();
                ctx.moveTo(-L * 0.1, (b - 1) * 10);
                ctx.lineTo(L * 0.1, (b - 1) * 10 + (Math.random() - 0.5) * 18);
                ctx.lineTo(L * 0.28, (b - 1) * 12 + (Math.random() - 0.5) * 18);
                ctx.lineTo(L * 0.40, (b - 1) * 8);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    draw(ctx, showIndicator = true) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const L = this.length;
        const W = this.width;
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        const now = performance.now();

        if (!this.dead && showIndicator && !this.isAI) {
            ctx.save();
            ctx.strokeStyle = this.teamRingColor;
            ctx.globalAlpha = 0.88;
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (!this.dead && this.spawnShieldTimer > 0) {
            ctx.save();
            ctx.strokeStyle = "#38bdf8";
            ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 14, now * 0.008, now * 0.008 + Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        if (!this.dead && (this.activePowerup || this.trapAnimTimer > 0)) {
            ctx.save();
            if (this.activePowerup === "inferno_ram") {
                const flameR = this.radius + 13 + Math.sin(now * 0.025) * 4;
                const fGrad = ctx.createRadialGradient(0, 0, this.radius * 0.4, 0, 0, flameR);
                fGrad.addColorStop(0, "rgba(251, 191, 36, 0.15)");
                fGrad.addColorStop(0.65, "rgba(249, 115, 22, 0.55)");
                fGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
                ctx.fillStyle = fGrad;
                ctx.beginPath();
                ctx.arc(0, 0, flameR, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.activePowerup === "titan_shield") {
                ctx.strokeStyle = "#c084fc";
                ctx.fillStyle = "rgba(139, 92, 246, 0.22)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else if (this.activePowerup === "hyper_nitro") {
                ctx.strokeStyle = "#fde047";
                ctx.lineWidth = 2.5;
                ctx.setLineDash([10, 6]);
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + 11, now * 0.01, now * 0.01 + Math.PI * 2);
                ctx.stroke();
            } else if (this.activePowerup === "tire_puncture" || this.activePowerup === "steering_glitch" || this.trapAnimTimer > 0) {
                const pulseHazard = Math.sin(now * 0.03) * 3;
                ctx.strokeStyle = "#ff1e42";
                ctx.fillStyle = "rgba(255, 30, 66, 0.14)";
                ctx.lineWidth = 3;
                ctx.setLineDash([7, 5]);
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + 12 + pulseHazard, -now * 0.015, -now * 0.015 + Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.rotate(this.angle);

        const fX = L / 2 - this.dentFront;
        const rX = -L / 2 + this.dentRear;
        const topY = -W / 2 + this.dentLeft;
        const botY = W / 2 - this.dentRight;

        if (!this.dead) {
            ctx.fillStyle = "#64748b";
            ctx.fillRect(rX - 5, -W * 0.25, 5, 4.5);
            ctx.fillRect(rX - 5, W * 0.25 - 4.5, 5, 4.5);

            if (this.isAccelerating) {
                const boostMult = this.activePowerup === "hyper_nitro" ? 1.75 : (this.activePowerup === "inferno_ram" ? 1.55 : 1.0);
                const pulse = (10 + Math.sin(now * 0.035 + this.id) * 3.5) * boostMult;
                ctx.save();
                ctx.shadowColor = this.activePowerup === "inferno_ram" ? "#f97316" : this.glowColor;
                ctx.shadowBlur = 10;

                ctx.fillStyle = this.activePowerup === "inferno_ram" ? "#f97316" : this.mainColor;
                ctx.beginPath();
                ctx.moveTo(rX - 5, -W * 0.25 - 0.5);
                ctx.lineTo(rX - 5 - pulse, -W * 0.25 + 2.2);
                ctx.lineTo(rX - 5, -W * 0.25 + 5);
                ctx.moveTo(rX - 5, W * 0.25 - 5);
                ctx.lineTo(rX - 5 - pulse, W * 0.25 - 2.2);
                ctx.lineTo(rX - 5, W * 0.25 + 0.5);
                ctx.fill();

                ctx.fillStyle = this.activePowerup === "inferno_ram" ? "#fef08a" : this.lightColor;
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
            beamGrad.addColorStop(0, "rgba(224, 242, 254, 0.24)");
            beamGrad.addColorStop(1, "rgba(224, 242, 254, 0)");
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(fX, -W * 0.36);
            ctx.lineTo(L * 2.4, -W * 1.15);
            ctx.lineTo(L * 2.4, W * 1.15);
            ctx.lineTo(fX, W * 0.36);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
        ctx.shadowColor = this.dead ? "transparent" : this.glowColor;
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
            const isPuncturedWheel = (this.activePowerup === "tire_puncture" && idx === 0);
            if ((hpRatio < 0.30 || isPuncturedWheel) && idx === 0) {
                ctx.rotate(0.36 * Math.sin(now * 0.055));
            }
            ctx.fillStyle = isPuncturedWheel ? "#7f1d1d" : "#090d16";
            ctx.beginPath();
            ctx.roundRect(-11, -6, 22, 12, 3.5);
            ctx.fill();
            ctx.fillStyle = isPuncturedWheel ? "#f87171" : "#cbd5e1";
            ctx.fillRect(-6, -2.2, 12, 4.4);
            ctx.fillStyle = this.lightColor;
            ctx.fillRect(-1.5, -1.5, 3, 3);
            ctx.restore();
        });

        ctx.fillStyle = "#111827";
        ctx.fillRect(0, -W * 0.34, L * 0.38, W * 0.68);
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(L * 0.08, -W * 0.22, 15, W * 0.44);

        if (this.dead) {
            ctx.fillStyle = "#27272a";
        } else {
            const bodyGrad = ctx.createLinearGradient(rX, topY, fX, botY);
            bodyGrad.addColorStop(0, this.darkColor);
            bodyGrad.addColorStop(0.45, this.mainColor);
            bodyGrad.addColorStop(0.80, this.lightColor);
            bodyGrad.addColorStop(1, this.mainColor);
            ctx.fillStyle = bodyGrad;
        }

        ctx.strokeStyle = "#090d16";
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
            ctx.strokeStyle = "#090d16";
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.roundRect(L * 0.04, topY - 4, 7, 4, 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.roundRect(L * 0.04, botY, 7, 4, 2); ctx.fill(); ctx.stroke();
        }

        if (!this.dead && this.parts.hood) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
            ctx.fillRect(rX + 6, -4.5, (fX - rX) - 12, 3);
            ctx.fillRect(rX + 6, 1.5, (fX - rX) - 12, 3);

            ctx.fillStyle = "rgba(9, 13, 22, 0.8)";
            ctx.fillRect(L * 0.15, -W * 0.27, 10, 5);
            ctx.fillRect(L * 0.15, W * 0.27 - 5, 10, 5);

            ctx.fillStyle = "#fbbf24";
            ctx.strokeStyle = "#090d16";
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
            ctx.fillStyle = this.activePowerup === "inferno_ram" ? "#f97316" : "#0f172a";
            ctx.strokeStyle = this.activePowerup === "inferno_ram" ? "#fef08a" : "#e2e8f0";
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.roundRect(fX - 1, -W * 0.44, 6, W * 0.88, 3); ctx.fill(); ctx.stroke();
        }
        if (this.parts.rearBumper && !this.dead) {
            ctx.fillStyle = "#0f172a"; ctx.strokeStyle = "#ff4d6d"; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.roundRect(rX - 4, -W * 0.44, 6, W * 0.88, 3); ctx.fill(); ctx.stroke();
        }
        if (this.parts.rearSpoiler && !this.dead) {
            ctx.fillStyle = "#090d16"; ctx.strokeStyle = this.lightColor; ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.roundRect(rX + 2, -W * 0.46, 8, W * 0.92, 2); ctx.fill(); ctx.stroke();
        }

        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.roundRect(-L * 0.24, topY * 0.72, L * 0.46, (botY - topY) * 0.72, 8);
        ctx.fill();

        if (!this.dead) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
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
            ctx.strokeStyle = "rgba(241, 245, 249, 0.85)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(2, -6); ctx.lineTo(13, 0); ctx.lineTo(6, 7);
            if (hpRatio < 0.42) { ctx.moveTo(13, 0); ctx.lineTo(-5, 9); }
            ctx.stroke();
        }

        if (!this.dead) {
            ctx.fillStyle = "#e0f2fe";
            ctx.fillRect(fX - 2, -W * 0.37, 4, 8);
            ctx.fillRect(fX - 2, W * 0.37 - 8, 4, 8);

            ctx.fillStyle = this.isBraking ? "#ff1744" : "#9f1239";
            ctx.fillRect(rX - 1, -W * 0.37, 4, 8);
            ctx.fillRect(rX - 1, W * 0.37 - 8, 4, 8);

            this.drawOnCarTrapEffect(ctx, L, W, now);
        }

        ctx.restore();

        if (this.dead && (MatchConfig.timedMode || MatchConfig.mode === "ctf") && this.respawnTimer > 0 && showIndicator) {
            ctx.save();
            ctx.translate(this.x, this.y - this.radius - 26);
            const secLeft = (this.respawnTimer / 60).toFixed(1);
            ctx.font = "900 13px \"Segoe UI\", sans-serif";
            ctx.textAlign = "center";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.94)";
            ctx.lineWidth = 4;
            const txt = `RESPAWN IN ${secLeft}s`;
            ctx.strokeText(txt, 0, 0);
            ctx.fillStyle = "#fbbf24";
            ctx.fillText(txt, 0, 0);
            ctx.restore();
        }

        if (showIndicator && !this.dead) {
            ctx.save();
            ctx.translate(this.x, this.y - this.radius - 28);
            const isHuman = !this.isAI;
            const bw = isHuman ? 88 : 74;
            const bh = isHuman ? 11 : 9;

            if (this.trapAnimTimer > 0 && Math.floor(now / 90) % 2 === 0) {
                const alertMap = {
                    tire_puncture: "\u26A0 FLAT TIRE!",
                    sabotage_bomb: "\uD83D\uDCA3 BOMB HIT!",
                    steering_glitch: "\u26A1 STEERING JAM!"
                };
                const alertTxt = alertMap[this.trapAnimType] || "\u26A0 TRAP!";
                ctx.font = "900 12px \"Segoe UI\", sans-serif";
                ctx.textAlign = "center";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3.5;
                ctx.strokeText(alertTxt, 0, -21);
                ctx.fillStyle = "#ff4d6d";
                ctx.fillText(alertTxt, 0, -21);
            }

            ctx.font = isHuman ? "900 14px \"Segoe UI\", sans-serif" : "800 12px \"Segoe UI\", sans-serif";
            ctx.textAlign = "center";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
            ctx.lineWidth = 4;
            const labelText = `${this.label} (${Math.ceil(this.hp)})`;
            ctx.strokeText(labelText, 0, -5);
            ctx.fillStyle = isHuman ? this.lightColor : "#ffffff";
            ctx.fillText(labelText, 0, -5);

            ctx.fillStyle = "rgba(9, 13, 22, 0.92)";
            ctx.strokeStyle = isHuman ? "#ffffff" : this.lightColor;
            ctx.lineWidth = isHuman ? 1.8 : 1.3;
            ctx.beginPath();
            ctx.roundRect(-bw / 2, 1, bw, bh, 4);
            ctx.fill();
            ctx.stroke();

            const fillColor = hpRatio > 0.55 ? "#00e676" : (hpRatio > 0.28 ? "#ffb703" : "#ff1e42");
            ctx.fillStyle = fillColor;
            const fillW = Math.max(0, (bw - 4) * hpRatio);
            if (fillW > 0) {
                ctx.beginPath();
                ctx.roundRect(-bw / 2 + 2, 3, fillW, bh - 4, 2.5);
                ctx.fill();
            }

            ctx.strokeStyle = "rgba(9, 13, 22, 0.65)";
            ctx.lineWidth = 1;
            for (let s = 1; s <= 3; s++) {
                const tx = -bw / 2 + (bw * s) / 4;
                ctx.beginPath();
                ctx.moveTo(tx, 2);
                ctx.lineTo(tx, bh);
                ctx.stroke();
            }

            if (this.activePowerup && this.powerupTimer > 0 && this.powerupMeta) {
                const pRatio = Math.max(0, this.powerupTimer / (this.powerupMaxTimer || 600));
                ctx.fillStyle = "rgba(9, 13, 22, 0.9)";
                ctx.fillRect(-bw / 2, bh + 3, bw, 4);
                ctx.fillStyle = this.powerupMeta.ringColor || "#fde047";
                ctx.fillRect(-bw / 2 + 1, bh + 3.5, (bw - 2) * pRatio, 3);
            }

            ctx.restore();
        }
    }
}

function renderCarPreviewCanvas(canvasId, colorKey) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const pCtx = c.getContext("2d");
    pCtx.clearRect(0, 0, c.width, c.height);
    pCtx.fillStyle = "#1f6f38"; pCtx.fillRect(0, 0, c.width, c.height);
    pCtx.fillStyle = "#247a3f"; pCtx.fillRect(c.width * 0.25, 0, c.width * 0.5, c.height);

    const dummy = new BattleCar({
        id: "preview", colorKey: colorKey || "blue",
        x: c.width / 2, y: c.height / 2, angle: -0.20
    });
    dummy.wheelAngle = 0.26;
    dummy.isAccelerating = true;
    dummy.draw(pCtx, false);
}