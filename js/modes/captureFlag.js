const CaptureFlagMode = {
    flags: [],
    team1Captures: 0,
    team2Captures: 0,
    standRadius: 95,
    pickupHoldFrames: 180,
    captureHoldFrames: 150,
    dropReturnFrames: 180,

    spawn(cars, spawns) {
        this.flags = [];
        this.team1Captures = 0;
        this.team2Captures = 0;

        MatchConfig.timedMode = true;
        TimedSiegeMode.initTimer();

        const n1 = (MatchConfig.p1Name || "PLAYER 1").trim().toUpperCase();
        const n2 = (MatchConfig.p2Name || "PLAYER 2").trim().toUpperCase();
        const p1Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color] || CAR_COLOR_PALETTES.blue;
        const p2Pal = CAR_COLOR_PALETTES[MatchConfig.p2Color] || CAR_COLOR_PALETTES.green;

        let t1Count = 1, t2Count = 1;
        let t1TeamId = "TEAM_1", t2TeamId = "TEAM_2";
        let t1Name = `${n1} SQUAD`, t2Name = "ENEMY SQUAD";
        let t1Pal = p1Pal;
        let enemyColorKey = (MatchConfig.p1Color !== "red" && MatchConfig.p2Color !== "red") ? "red" : "purple";
        let t2Pal = CAR_COLOR_PALETTES[enemyColorKey];

        if (MatchConfig.ctfType === "solo") {
            document.getElementById("hud-mode-pill").textContent = `CAPTURE THE FLAG (${MatchConfig.timeLimitMinutes}M) \u2022 SOLO`;
            t1Count = 1 + MatchConfig.ctfSpAllyBots;
            t2Count = MatchConfig.ctfSpEnemyBots;
            t2Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color !== "red" ? "red" : "purple"];
        } else if (MatchConfig.ctfType === "coop") {
            document.getElementById("hud-mode-pill").textContent = `CAPTURE THE FLAG (${MatchConfig.timeLimitMinutes}M) \u2022 CO-OP`;
            t1Count = 2 + MatchConfig.ctfMpP1Bots;
            t2Count = MatchConfig.ctfMpP2Bots;
            t1Name = "ALLIED SQUAD";
            t2Name = "ENEMY AI SQUAD";
        } else {
            document.getElementById("hud-mode-pill").textContent = `CAPTURE THE FLAG (${MatchConfig.timeLimitMinutes}M) \u2022 2P SQUADS`;
            t1Count = 1 + MatchConfig.ctfMpP1Bots;
            t2Count = 1 + MatchConfig.ctfMpP2Bots;
            t1Name = `${n1} SQUAD`;
            t2Name = `${n2} SQUAD`;
            t2Pal = p2Pal;
            enemyColorKey = MatchConfig.p2Color;
        }

        const { team1Spawns, team2Spawns } = PhysicsEngine.generateTeamSpawnPositions(t1Count, t2Count, Game.arena);
        const { leftRect, rightRect } = PhysicsEngine.getTeamBaseRects(Game.arena);

        let s1 = 0;
        const p1Sp = team1Spawns[s1++];
        cars.push(new BattleCar({
            id: 1, label: n1, team: t1TeamId,
            isAI: false, playerSlot: "p1", colorKey: MatchConfig.p1Color,
            x: p1Sp.x, y: p1Sp.y, angle: p1Sp.angle, baseRect: leftRect
        }));

        if (MatchConfig.ctfType === "coop") {
            const p2Sp = team1Spawns[s1++] || team1Spawns[0];
            cars.push(new BattleCar({
                id: 2, label: n2, team: t1TeamId,
                isAI: false, playerSlot: "p2", colorKey: MatchConfig.p2Color,
                x: p2Sp.x, y: p2Sp.y, angle: p2Sp.angle, baseRect: leftRect
            }));
        }

        const t1BotTotal = MatchConfig.ctfType === "solo" ? MatchConfig.ctfSpAllyBots : MatchConfig.ctfMpP1Bots;
        for (let i = 0; i < t1BotTotal; i++) {
            const bSp = team1Spawns[s1++] || team1Spawns[0];
            cars.push(new BattleCar({
                id: 10 + i, label: `ALLY ${i + 1}`, team: t1TeamId,
                isAI: true, colorKey: MatchConfig.p1Color,
                x: bSp.x, y: bSp.y, angle: bSp.angle, baseRect: leftRect
            }));
        }

        let s2 = 0;
        if (MatchConfig.ctfType === "versus") {
            const p2Sp = team2Spawns[s2++];
            cars.push(new BattleCar({
                id: 2, label: n2, team: t2TeamId,
                isAI: false, playerSlot: "p2", colorKey: MatchConfig.p2Color,
                x: p2Sp.x, y: p2Sp.y, angle: p2Sp.angle, baseRect: rightRect
            }));
        }

        const t2BotTotal = MatchConfig.ctfType === "solo" ? MatchConfig.ctfSpEnemyBots : MatchConfig.ctfMpP2Bots;
        for (let i = 0; i < t2BotTotal; i++) {
            const bSp = team2Spawns[s2++] || team2Spawns[0];
            const labelPrefix = MatchConfig.ctfType === "versus" ? "P2 BOT" : "ENEMY";
            cars.push(new BattleCar({
                id: 30 + i, label: `${labelPrefix} ${i + 1}`, team: t2TeamId,
                isAI: true, colorKey: enemyColorKey,
                x: bSp.x, y: bSp.y, angle: bSp.angle, baseRect: rightRect
            }));
        }

        this.assignSquadRoles(cars, t1TeamId);
        this.assignSquadRoles(cars, t2TeamId);

        this.flags = [
            {
                id: "FLAG_1", ownerTeam: t1TeamId, teamName: t1Name,
                mainColor: t1Pal.main, lightColor: t1Pal.light,
                homeX: leftRect.cx, homeY: leftRect.cy, x: leftRect.cx, y: leftRect.cy,
                state: "AT_BASE", carrier: null, stealProgress: 0, stealerCar: null,
                dropTimer: 0, captureProgress: 0, lastPassTime: 0
            },
            {
                id: "FLAG_2", ownerTeam: t2TeamId, teamName: t2Name,
                mainColor: t2Pal.main, lightColor: t2Pal.light,
                homeX: rightRect.cx, homeY: rightRect.cy, x: rightRect.cx, y: rightRect.cy,
                state: "AT_BASE", carrier: null, stealProgress: 0, stealerCar: null,
                dropTimer: 0, captureProgress: 0, lastPassTime: 0
            }
        ];
    },

    assignSquadRoles(cars, teamId) {
        const teamCars = cars.filter(c => c.team === teamId);
        const bots = teamCars.filter(c => c.isAI);
        let defenderCount = 0;
        if (teamCars.length >= 5) defenderCount = 2;
        else if (teamCars.length >= 3 && bots.length >= 2) defenderCount = 1;
        bots.forEach((b, idx) => {
            b.ctfRole = idx < defenderCount ? "DEFENDER" : "ATTACKER";
        });
    },

    onCarDestroyed(car) {
        if (MatchConfig.mode !== "ctf") return;
        for (const flag of this.flags) {
            if (flag.carrier === car) {
                flag.carrier = null;
                flag.state = "DROPPED";
                flag.x = car.x;
                flag.y = car.y;
                flag.dropTimer = this.dropReturnFrames;
                flag.captureProgress = 0;
                car.carryingFlag = null;
                Game.floatingTexts.push({
                    x: flag.x, y: flag.y - 35,
                    text: "\uD83C\uDFF3\uFE0F FLAG DROPPED! (3.0s TO RETURN)",
                    color: "#fbbf24", life: 1.4
                });
                if (typeof KillAnnouncer !== "undefined" && !KillAnnouncer.slowMoActive) {
                    KillAnnouncer.showBanner("FLAG DROPPED!", `${car.label} was wrecked! Flag returns to base in 3 seconds!`, "#fbbf24", 80);
                }
            }
        }
    },

    buildTimeExpiredCTFOutcome(cars) {
        const f1 = this.flags[0];
        const f2 = this.flags[1];
        const stats = TimedSiegeMode.computeTeamSummary(
            cars, f1.ownerTeam, f1.teamName, f1.lightColor, f2.ownerTeam, f2.teamName, f2.lightColor
        );
        stats.team1.captures = this.team1Captures;
        stats.team2.captures = this.team2Captures;

        if (this.team1Captures > this.team2Captures) {
            return {
                badge: "CAPTURE THE FLAG \u2022 TIME EXPIRED",
                title: `${f1.teamName} WINS!`,
                color: f1.lightColor,
                subtitle: `${f1.teamName} won by capturing ${this.team1Captures} ${this.team1Captures === 1 ? "Flag" : "Flags"} vs ${this.team2Captures}!`,
                teamStats: stats
            };
        }
        if (this.team2Captures > this.team1Captures) {
            return {
                badge: "CAPTURE THE FLAG \u2022 TIME EXPIRED",
                title: `${f2.teamName} WINS!`,
                color: f2.lightColor,
                subtitle: `${f2.teamName} won by capturing ${this.team2Captures} ${this.team2Captures === 1 ? "Flag" : "Flags"} vs ${this.team1Captures}!`,
                teamStats: stats
            };
        }
        if (stats.team1.kills !== stats.team2.kills) {
            const w = stats.team1.kills > stats.team2.kills ? stats.team1 : stats.team2;
            return {
                badge: "CAPTURE THE FLAG \u2022 TIE-BREAKER VICTORY",
                title: `${w.name} WINS!`,
                color: w.color,
                subtitle: `Tied at ${this.team1Captures} Flags each \u2014 ${w.name} won on Kills Tie-Breaker (${stats.team1.kills} vs ${stats.team2.kills})!`,
                teamStats: stats
            };
        }
        return {
            badge: "CAPTURE THE FLAG \u2022 TIME EXPIRED",
            title: "FLAG CAPTURE DRAW!",
            color: "#fbbf24",
            subtitle: `Both squads finished tied with ${this.team1Captures} Flag Captures each!`,
            teamStats: stats
        };
    },

    checkResult(cars, dt) {
        if (KillAnnouncer.slowMoActive) return null;
        const timeExpired = TimedSiegeMode.tick(dt);
        if (timeExpired) {
            return this.buildTimeExpiredCTFOutcome(cars);
        }

        const now = performance.now();
        for (let fIdx = 0; fIdx < this.flags.length; fIdx++) {
            const flag = this.flags[fIdx];
            const otherFlag = this.flags[1 - fIdx];

            if (flag.state === "AT_BASE") {
                flag.x = flag.homeX;
                flag.y = flag.homeY;
                flag.captureProgress = 0;

                const enemiesInZone = cars.filter(c =>
                    !c.dead && c.team !== flag.ownerTeam &&
                    Math.hypot(c.x - flag.homeX, c.y - flag.homeY) <= this.standRadius + c.radius * 0.5
                );

                if (enemiesInZone.length > 0) {
                    enemiesInZone.sort((a, b) => b.hp - a.hp);
                    const stealer = enemiesInZone[0];
                    flag.stealerCar = stealer;
                    flag.stealProgress = Math.min(this.pickupHoldFrames, flag.stealProgress + dt);

                    if (flag.stealProgress >= this.pickupHoldFrames) {
                        flag.state = "CARRIED";
                        flag.carrier = stealer;
                        flag.stealProgress = 0;
                        flag.lastPassTime = now;
                        stealer.carryingFlag = flag;
                        SoundEngine.playPowerupPickup(false, false);
                        Game.shockwaves.push({ x: flag.x, y: flag.y, r: 12, maxR: 150, alpha: 1, color: flag.lightColor });
                        Game.floatingTexts.push({
                            x: stealer.x, y: stealer.y - 40,
                            text: `\uD83C\uDFF3\uFE0F ${stealer.label} STOLE THE FLAG!`,
                            color: flag.lightColor, life: 1.5
                        });
                        if (typeof KillAnnouncer !== "undefined" && !KillAnnouncer.slowMoActive) {
                            KillAnnouncer.showBanner("FLAG STOLEN!", `${stealer.label} took ${flag.teamName} Flag! Bring it to Base!`, flag.lightColor, 85);
                        }
                    }
                } else {
                    flag.stealerCar = null;
                    flag.stealProgress = Math.max(0, flag.stealProgress - dt * 1.5);
                }
            } else if (flag.state === "DROPPED") {
                flag.dropTimer -= dt;
                let handled = false;
                for (const c of cars) {
                    if (c.dead) continue;
                    const dist = Math.hypot(c.x - flag.x, c.y - flag.y);
                    if (dist <= c.radius + 42) {
                        if (c.team !== flag.ownerTeam) {
                            flag.state = "CARRIED";
                            flag.carrier = c;
                            flag.dropTimer = 0;
                            flag.lastPassTime = now;
                            c.carryingFlag = flag;
                            SoundEngine.playPowerupPickup(false, false);
                            Game.floatingTexts.push({
                                x: c.x, y: c.y - 36,
                                text: `\uD83C\uDFF3\uFE0F ${c.label} PICKED UP THE FLAG!`,
                                color: flag.lightColor, life: 1.3
                            });
                            handled = true;
                            break;
                        } else {
                            flag.state = "AT_BASE";
                            flag.x = flag.homeX; flag.y = flag.homeY;
                            flag.dropTimer = 0; flag.stealProgress = 0;
                            SoundEngine.playPowerupPickup(true, false);
                            Game.shockwaves.push({ x: flag.homeX, y: flag.homeY, r: 10, maxR: 130, alpha: 0.9, color: flag.lightColor });
                            Game.floatingTexts.push({
                                x: c.x, y: c.y - 36,
                                text: `\uD83C\uDFF3\uFE0F ${c.label} RETURNED THE FLAG!`,
                                color: flag.lightColor, life: 1.3
                            });
                            handled = true;
                            break;
                        }
                    }
                }
                if (!handled && flag.dropTimer <= 0) {
                    flag.state = "AT_BASE";
                    flag.x = flag.homeX; flag.y = flag.homeY;
                    flag.dropTimer = 0; flag.stealProgress = 0;
                    SoundEngine.playUIClick();
                    Game.shockwaves.push({ x: flag.homeX, y: flag.homeY, r: 10, maxR: 130, alpha: 0.9, color: flag.lightColor });
                    Game.floatingTexts.push({
                        x: flag.homeX, y: flag.homeY - 36,
                        text: "\uD83C\uDFF3\uFE0F FLAG AUTO-RETURNED TO BASE!",
                        color: flag.lightColor, life: 1.3
                    });
                }
            } else if (flag.state === "CARRIED" && flag.carrier) {
                const carrier = flag.carrier;
                if (carrier.dead) {
                    this.onCarDestroyed(carrier);
                    continue;
                }
                flag.x = carrier.x; flag.y = carrier.y;

                if (now - flag.lastPassTime > 2000) {
                    let healthierAlly = null;
                    let bestHp = carrier.hp + 15;
                    for (const ally of cars) {
                        if (ally === carrier || ally.dead || ally.team !== carrier.team) continue;
                        if (ally.hp > bestHp && Math.hypot(ally.x - carrier.x, ally.y - carrier.y) <= carrier.radius + ally.radius + 45) {
                            bestHp = ally.hp;
                            healthierAlly = ally;
                        }
                    }
                    if (healthierAlly) {
                        carrier.carryingFlag = null;
                        flag.carrier = healthierAlly;
                        healthierAlly.carryingFlag = flag;
                        flag.lastPassTime = now;
                        SoundEngine.playUIClick();
                        Game.floatingTexts.push({
                            x: healthierAlly.x, y: healthierAlly.y - 42,
                            text: `\uD83E\uDD1D FLAG PASSED TO ${healthierAlly.label} (${Math.ceil(healthierAlly.hp)} HP)!`,
                            color: "#00e676", life: 1.35
                        });
                    }
                }

                const activeCarrier = flag.carrier;
                const distToOwnStand = Math.hypot(activeCarrier.x - otherFlag.homeX, activeCarrier.y - otherFlag.homeY);
                if (distToOwnStand <= this.standRadius + activeCarrier.radius * 0.65) {
                    flag.captureProgress = Math.min(this.captureHoldFrames, flag.captureProgress + dt);
                    if (flag.captureProgress >= this.captureHoldFrames) {
                        if (fIdx === 1) this.team1Captures += 1;
                        else this.team2Captures += 1;
                        activeCarrier.kills += 1;

                        activeCarrier.carryingFlag = null;
                        flag.carrier = null;
                        flag.state = "AT_BASE";
                        flag.x = flag.homeX; flag.y = flag.homeY;
                        flag.captureProgress = 0; flag.stealProgress = 0;

                        if (typeof KillAnnouncer !== "undefined") {
                            KillAnnouncer.playFanfare(4);
                            KillAnnouncer.showBanner(
                                "\uD83C\uDFF3\uFE0F FLAG CAPTURED! (+1 POINT)",
                                `${activeCarrier.label} scored for ${otherFlag.teamName}! Score: ${this.team1Captures} - ${this.team2Captures}`,
                                otherFlag.lightColor, 105
                            );
                        }
                        Game.shockwaves.push({ x: otherFlag.homeX, y: otherFlag.homeY, r: 15, maxR: 220, alpha: 1.0, color: "#00e676" });
                        Game.floatingTexts.push({
                            x: activeCarrier.x, y: activeCarrier.y - 48,
                            text: `\uD83C\uDFC6 +1 FLAG CAPTURED! (${this.team1Captures} - ${this.team2Captures})`,
                            color: "#00e676", life: 1.65
                        });
                    }
                } else {
                    flag.captureProgress = Math.max(0, flag.captureProgress - dt * 1.5);
                }
            }
        }
        return null;
    },

    drawFlagGraphic(ctx, x, y, mainColor, lightColor, scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        const wave = Math.sin(performance.now() * 0.01) * 5;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(3, 6); ctx.lineTo(3, -38); ctx.stroke();
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -42); ctx.stroke();
        ctx.fillStyle = mainColor;
        ctx.strokeStyle = lightColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.quadraticCurveTo(18, -44 + wave, 36, -34 + wave * 0.6);
        ctx.lineTo(30, -24 + wave * 0.5);
        ctx.lineTo(36, -16 + wave * 0.6);
        ctx.quadraticCurveTo(18, -12 + wave, 0, -18);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath(); ctx.arc(0, -43, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },

    drawFlagsAndStands(ctx) {
        if (MatchConfig.mode !== "ctf" || this.flags.length === 0) return;
        const now = performance.now();
        for (let i = 0; i < this.flags.length; i++) {
            const flag = this.flags[i];
            const otherFlag = this.flags[1 - i];
            ctx.save();
            ctx.translate(flag.homeX, flag.homeY);
            ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
            ctx.strokeStyle = flag.lightColor;
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.arc(0, 0, this.standRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
            ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);

            if (flag.state === "AT_BASE" && flag.stealProgress > 0) {
                const ratio = flag.stealProgress / this.pickupHoldFrames;
                ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 7;
                ctx.beginPath(); ctx.arc(0, 0, this.standRadius - 6, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2); ctx.stroke();
                const secLeft = Math.max(0, (this.pickupHoldFrames - flag.stealProgress) / 60).toFixed(1);
                ctx.font = "900 14px Segoe UI, sans-serif"; ctx.textAlign = "center";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
                ctx.strokeText(`STEALING FLAG: ${secLeft}s`, 0, -this.standRadius - 14);
                ctx.fillStyle = "#fde047"; ctx.fillText(`STEALING FLAG: ${secLeft}s`, 0, -this.standRadius - 14);
            }
            if (otherFlag.state === "CARRIED" && otherFlag.captureProgress > 0) {
                const ratio = otherFlag.captureProgress / this.captureHoldFrames;
                ctx.strokeStyle = "#00e676"; ctx.lineWidth = 8;
                ctx.beginPath(); ctx.arc(0, 0, this.standRadius - 6, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2); ctx.stroke();
                const secLeft = Math.max(0, (this.captureHoldFrames - otherFlag.captureProgress) / 60).toFixed(1);
                ctx.font = "900 15px Segoe UI, sans-serif"; ctx.textAlign = "center";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
                ctx.strokeText(`SCORING FLAG: ${secLeft}s!`, 0, -this.standRadius - 14);
                ctx.fillStyle = "#00e676"; ctx.fillText(`SCORING FLAG: ${secLeft}s!`, 0, -this.standRadius - 14);
            }
            ctx.font = "900 12px Segoe UI, sans-serif"; ctx.textAlign = "center";
            ctx.fillStyle = flag.lightColor;
            ctx.fillText(flag.state === "AT_BASE" ? `${flag.teamName} FLAG STAND` : "FLAG TAKEN!", 0, this.standRadius - 14);
            ctx.restore();

            if (flag.state === "AT_BASE") {
                this.drawFlagGraphic(ctx, flag.homeX, flag.homeY, flag.mainColor, flag.lightColor, 1.15);
            } else if (flag.state === "DROPPED") {
                const ratio = Math.max(0, flag.dropTimer / this.dropReturnFrames);
                const secLeft = Math.max(0, flag.dropTimer / 60).toFixed(1);
                ctx.save(); ctx.translate(flag.x, flag.y);
                ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
                ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 5;
                ctx.beginPath(); ctx.arc(0, 0, 52, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2); ctx.stroke();
                ctx.font = "900 13px Segoe UI, sans-serif"; ctx.textAlign = "center";
                ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
                ctx.strokeText(`FLAG RETURNS IN ${secLeft}s`, 0, -62);
                ctx.fillStyle = "#fde047"; ctx.fillText(`FLAG RETURNS IN ${secLeft}s`, 0, -62);
                ctx.restore();
                this.drawFlagGraphic(ctx, flag.x, flag.y, flag.mainColor, flag.lightColor, 1.1);
            } else if (flag.state === "CARRIED" && flag.carrier && !flag.carrier.dead) {
                const c = flag.carrier;
                ctx.save(); ctx.translate(c.x, c.y);
                ctx.strokeStyle = flag.lightColor; ctx.lineWidth = 3.5; ctx.setLineDash([10, 6]);
                ctx.beginPath(); ctx.arc(0, 0, c.radius + 18 + Math.sin(now * 0.02) * 4, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
                this.drawFlagGraphic(ctx, c.x, c.y - 12, flag.mainColor, flag.lightColor, 1.05);
            }
        }
    }
};