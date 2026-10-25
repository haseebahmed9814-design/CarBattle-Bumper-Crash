const PhysicsEngine = {
    areTeammates(c1, c2) {
        if (!c1 || !c2) return false;
        if (!c1.team || !c2.team || c1.team === "FFA" || c2.team === "FFA") return false;
        return c1.team === c2.team;
    },

    updateCarMovement(car, input, dt, arena) {
        if (car.dead) {
            car.vx *= Math.pow(0.92, dt);
            car.vy *= Math.pow(0.92, dt);
            car.x += car.vx * dt;
            car.y += car.vy * dt;
            if (Math.random() < 0.35) {
                Game.spawnSmoke(car.x + (Math.random() - 0.5) * 20, car.y + (Math.random() - 0.5) * 20, true);
            }
            if ((MatchConfig.timedMode || MatchConfig.mode === "ctf") && Game.state === "PLAYING" && car.respawnTimer > 0) {
                car.respawnTimer -= dt;
                if (car.respawnTimer <= 0) {
                    car.respawnAtBase(arena);
                }
            }
            return;
        }

        const now = performance.now();

        if (car.spawnShieldTimer > 0) {
            car.spawnShieldTimer = Math.max(0, car.spawnShieldTimer - dt);
        }

        if (car.trapAnimTimer > 0) {
            car.trapAnimTimer = Math.max(0, car.trapAnimTimer - dt);
            if (car.trapAnimType === "tire_puncture" && Math.random() < 0.65) {
                const fx = Math.cos(car.angle), fy = Math.sin(car.angle);
                const rx = -fy, ry = fx;
                const wx = car.x + fx * (car.length * 0.29) - rx * (car.width * 0.49);
                const wy = car.y + fy * (car.length * 0.29) - ry * (car.width * 0.49);
                Game.particles.push({
                    x: wx, y: wy,
                    vx: (Math.random() - 0.5) * 3.2, vy: (Math.random() - 0.5) * 3.2,
                    size: 3 + Math.random() * 3,
                    color: Math.random() < 0.5 ? "#1e293b" : "#f87171",
                    alpha: 0.95, decay: 0.035
                });
            } else if (car.trapAnimType === "sabotage_bomb" && Math.random() < 0.70) {
                Game.spawnSmoke(car.x + (Math.random() - 0.5) * 28, car.y + (Math.random() - 0.5) * 28, true);
            } else if (car.trapAnimType === "steering_glitch" && Math.random() < 0.55) {
                Game.particles.push({
                    x: car.x + (Math.random() - 0.5) * 34,
                    y: car.y + (Math.random() - 0.5) * 34,
                    vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                    size: 2.8,
                    color: Math.random() < 0.5 ? "#38bdf8" : "#fde047",
                    alpha: 1, decay: 0.05
                });
            }
        }

        if (car.activePowerup && car.powerupTimer > 0) {
            car.powerupTimer -= dt;
            if (car.activePowerup === "inferno_ram" && Math.random() < 0.55) {
                Game.spawnSmoke(car.x + (Math.random() - 0.5) * 32, car.y + (Math.random() - 0.5) * 32, true);
            } else if (car.activePowerup === "tire_puncture" && Math.hypot(car.vx, car.vy) > 2.0 && Math.random() < 0.45) {
                Game.spawnSparks(car.x, car.y, 1);
            }
            if (car.powerupTimer <= 0) {
                car.activePowerup = null;
                car.powerupTimer = 0;
                car.powerupMeta = null;
            }
        }

        if (car.burningTimer > 0) {
            car.burningTimer -= dt;
            if (Math.random() < 0.70) {
                Game.spawnSmoke(car.x + (Math.random() - 0.5) * 26, car.y + (Math.random() - 0.5) * 26, true);
            }
            const burnDmg = 0.10 * dt;
            car.hp = Math.max(0, car.hp - burnDmg);
            if (car.burnAttacker && car.burnAttacker !== car) {
                car.burnAttacker.damageDealt += burnDmg;
            }
            if (car.hp <= 0 && !car.dead) {
                car.dead = true;
                car.deaths = (car.deaths || 0) + 1;
                car.activePowerup = null;
                car.burningTimer = 0;
                if (MatchConfig.mode === "ctf") car.respawnTimer = 540;
                else if (MatchConfig.timedMode) car.respawnTimer = 150;
                if (MatchConfig.mode === "ctf" && typeof CaptureFlagMode !== "undefined") CaptureFlagMode.onCarDestroyed(car);
                if (car.burnAttacker && car.burnAttacker !== car) car.burnAttacker.kills++;
                SoundEngine.playExplosion();
                Game.triggerExplosion(car);
                return;
            }
        }

        const spec = car.spec;
        const hpRatio = car.hp / car.maxHp;
        const hasPuncture = car.activePowerup === "tire_puncture";
        const hasGlitch = car.activePowerup === "steering_glitch";
        car.isBraking = !!(input.down || input.drift);
        car.isAccelerating = !!input.up;

        const wobble = (hpRatio < 0.28 || hasPuncture) ? Math.sin(now * 0.055) * (hasPuncture ? 0.18 : 0.07) : 0;
        car.wheelAngle += ((input.steer * 0.42 + wobble) - car.wheelAngle) * 0.25;

        const fx = Math.cos(car.angle), fy = Math.sin(car.angle);
        const rx = -fy, ry = fx;

        let forwardVel = car.vx * fx + car.vy * fy;
        let lateralVel = car.vx * rx + car.vy * ry;

        const throttle = Math.min(1.0, Math.max(0.55, (input.throttle !== undefined) ? input.throttle : 1.0));
        const isHyper = car.activePowerup === "hyper_nitro";

        let accelMult = isHyper ? 1.45 : (car.activePowerup === "inferno_ram" ? 1.15 : 1.0);
        let topSpeedMult = isHyper ? 1.28 : (car.activePowerup === "inferno_ram" ? 1.08 : 1.0);
        if (hasPuncture) {
            accelMult = 0.62;
            topSpeedMult = 0.58;
            forwardVel *= Math.pow(0.968, dt);
        }

        if (input.up) forwardVel += spec.accel * accelMult * throttle * dt;
        if (input.down) {
            if (forwardVel > 0.6) forwardVel *= Math.pow(0.89, dt);
            else forwardVel -= spec.reverseAccel * (hasPuncture ? 0.65 : 1.0) * dt;
        }
        if (input.drift) forwardVel *= Math.pow(0.985, dt);

        const maxAllowedSpeed = spec.maxSpeed * throttle * topSpeedMult;
        if (forwardVel > maxAllowedSpeed) forwardVel = maxAllowedSpeed;
        if (forwardVel < -spec.maxReverse * topSpeedMult) forwardVel = -spec.maxReverse * topSpeedMult;

        const speedMag = Math.hypot(car.vx, car.vy);
        if (speedMag > 0.15) {
            const dir = forwardVel >= -0.15 ? 1 : -1;
            const speedFactor = Math.min(speedMag / 4.0, 1.0);
            const driftBoost = input.drift ? 1.32 : 1.0;

            if (hasPuncture) {
                const pullBias = (car.puncturePullDir || 1) * 0.016;
                car.angle += (input.steer * spec.steerRate * 0.48 * dir + pullBias) * speedFactor * dt;
                lateralVel += (car.puncturePullDir || 1) * 0.28 * speedFactor * dt;
            } else if (hasGlitch) {
                const glitchWave = Math.sin(now * 0.015 + car.id) * 0.025;
                car.angle += (-input.steer * spec.steerRate * 0.85 * dir + glitchWave) * speedFactor * dt;
            } else {
                car.angle += input.steer * spec.steerRate * speedFactor * dir * driftBoost * dt;
            }
        }

        car.angle += car.angVel * dt;
        car.angVel *= Math.pow(0.86, dt);

        const grip = hasPuncture ? 0.965 : (input.drift ? spec.handbrakeGrip : spec.normalGrip);
        lateralVel *= Math.pow(grip, dt);

        car.vx = (fx * forwardVel + rx * lateralVel) * Math.pow(0.982, dt);
        car.vy = (fy * forwardVel + ry * lateralVel) * Math.pow(0.982, dt);
        car.x += car.vx * dt;
        car.y += car.vy * dt;

        const pad = arena.wallPad + car.radius * 0.45;
        let hitWall = false;

        if (arena.isCircular) {
            const cx = arena.width / 2, cy = arena.height / 2;
            const maxR = (arena.radius || (arena.width / 2 - 40)) - car.radius * 0.55;
            const dx = car.x - cx, dy = car.y - cy;
            const dist = Math.hypot(dx, dy);
            if (dist > maxR && dist > 0.001) {
                const nx = dx / dist, ny = dy / dist;
                car.x = cx + nx * maxR;
                car.y = cy + ny * maxR;
                const dot = car.vx * nx + car.vy * ny;
                if (dot > 0) {
                    car.vx -= 1.65 * dot * nx;
                    car.vy -= 1.65 * dot * ny;
                }
                hitWall = true;
            }
        } else {
            if (car.x < pad) { car.x = pad; car.vx = Math.abs(car.vx) * 0.65; hitWall = true; }
            if (car.x > arena.width - pad) { car.x = arena.width - pad; car.vx = -Math.abs(car.vx) * 0.65; hitWall = true; }
            if (car.y < pad) { car.y = pad; car.vy = Math.abs(car.vy) * 0.65; hitWall = true; }
            if (car.y > arena.height - pad) { car.y = arena.height - pad; car.vy = -Math.abs(car.vy) * 0.65; hitWall = true; }
        }

        if (hitWall && speedMag > 6.5) {
            SoundEngine.playCrash(0.32);
            Game.spawnSparks(car.x, car.y, 6);
        }
        if (hasPuncture || Math.abs(lateralVel) > 1.85 || (input.drift && speedMag > 3.4)) {
            Game.addTireTrack(car, fx, fy, rx, ry);
        }

        if (speedMag > 4.2 && Game.state === "PLAYING" && Math.random() < 0.42) {
            const rearX = car.x - fx * (car.length * 0.42) + (Math.random() - 0.5) * 20;
            const rearY = car.y - fy * (car.length * 0.42) + (Math.random() - 0.5) * 20;
            if (arena.id === "desert_dunes") {
                Game.particles.push({
                    x: rearX, y: rearY,
                    vx: -fx * 1.1 + (Math.random() - 0.5) * 1.4,
                    vy: -fy * 1.1 + (Math.random() - 0.5) * 1.4,
                    size: 6 + Math.random() * 6,
                    color: Math.random() < 0.5 ? "rgba(217, 119, 6, 0.55)" : "rgba(245, 158, 11, 0.45)",
                    alpha: 0.60, decay: 0.024
                });
            } else if (arena.id === "ice_rink") {
                Game.particles.push({
                    x: rearX, y: rearY,
                    vx: -fx * 1.1 + (Math.random() - 0.5) * 1.4,
                    vy: -fy * 1.1 + (Math.random() - 0.5) * 1.4,
                    size: 5.5 + Math.random() * 5.5,
                    color: Math.random() < 0.5 ? "rgba(56, 189, 248, 0.55)" : "rgba(186, 230, 253, 0.75)",
                    alpha: 0.65, decay: 0.026
                });
            }
        }

        if (hpRatio < 0.62 && Math.random() < (1 - hpRatio) * 0.42) {
            Game.spawnSmoke(car.x + fx * (car.length * 0.25), car.y + fy * (car.length * 0.25), hpRatio < 0.28);
        }
    },

    resolveAllCollisions(cars) {
        for (let i = 0; i < cars.length; i++) {
            for (let j = i + 1; j < cars.length; j++) {
                this.handlePairCollision(cars[i], cars[j]);
            }
        }
    },

    handlePairCollision(c1, c2) {
        const dx = c2.x - c1.x, dy = c2.y - c1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = c1.radius + c2.radius;

        if (dist < minDist && dist > 0.001) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = (minDist - dist) * 0.58;
            c1.x -= nx * overlap; c1.y -= ny * overlap;
            c2.x += nx * overlap; c2.y += ny * overlap;

            const rvx = c1.vx - c2.vx, rvy = c1.vy - c2.vy;
            const impactSpeed = rvx * nx + rvy * ny;

            const pairKey = c1.id < c2.id ? `${c1.id}_${c2.id}` : `${c2.id}_${c1.id}`;
            const now = performance.now();
            const lastHit = Game.pairCooldowns.get(pairKey) || 0;

            if (impactSpeed > 0.5 && now - lastHit > 130) {
                Game.pairCooldowns.set(pairKey, now);

                if (this.areTeammates(c1, c2)) {
                    const softBounce = Math.max(2.0, impactSpeed * 0.45);
                    c1.vx -= nx * softBounce * 0.5; c1.vy -= ny * softBounce * 0.5;
                    c2.vx += nx * softBounce * 0.5; c2.vy += ny * softBounce * 0.5;
                    return;
                }

                const c1AttackSpeed = Math.max(0, c1.vx * nx + c1.vy * ny);
                const c2AttackSpeed = Math.max(0, -(c2.vx * nx + c2.vy * ny));

                const bounce = Math.max(4.5, impactSpeed * 1.16);
                c1.vx -= nx * bounce * 0.85; c1.vy -= ny * bounce * 0.85;
                c2.vx += nx * bounce * 0.85; c2.vy += ny * bounce * 0.85;

                const hitX = (c1.x + c2.x) * 0.5, hitY = (c1.y + c2.y) * 0.5;

                if (c1AttackSpeed > 2.1 && !c1.dead) this.evaluateDirectionalHit(c1, c2, c1AttackSpeed, hitX, hitY);
                if (c2AttackSpeed > 2.1 && !c2.dead) this.evaluateDirectionalHit(c2, c1, c2AttackSpeed, hitX, hitY);

                SoundEngine.playCrash(Math.min(1, impactSpeed / 12));
                Game.screenShake = Math.min(16, impactSpeed * 1.25);
                Game.spawnSparks(hitX, hitY, Math.floor(7 + impactSpeed * 1.8));
                Game.shockwaves.push({ x: hitX, y: hitY, r: 8, maxR: 52 + impactSpeed * 4, alpha: 0.85, color: "#fde047" });
            }
        }
    },

    evaluateDirectionalHit(attacker, victim, ramPower, hitX, hitY) {
        if (this.areTeammates(attacker, victim)) return;

        const toHitX = hitX - victim.x, toHitY = hitY - victim.y;
        const len = Math.hypot(toHitX, toHitY) || 1;
        const hx = toHitX / len, hy = toHitY / len;

        const vFx = Math.cos(victim.angle), vFy = Math.sin(victim.angle);
        const vRx = -vFy, vRy = vFx;

        const forwardDot = hx * vFx + hy * vFy;
        const sideDot = hx * vRx + hy * vRy;

        let multiplier = 1.0, zone = "FRONT", badgeText = "1.0x FRONT HIT", badgeColor = "#e2e8f0";

        if (forwardDot < -0.45) {
            multiplier = victim.spec.rearDamagePenalty || 1.55;
            zone = "REAR"; badgeText = `${multiplier}x REAR CRUSH!`; badgeColor = "#ff4d6d";
        } else if (Math.abs(sideDot) >= 0.45) {
            multiplier = 1.20;
            zone = sideDot < 0 ? "LEFT" : "RIGHT"; badgeText = "1.2x SIDE SMASH!"; badgeColor = "#fbbf24";
            victim.angVel += (sideDot < 0 ? 1 : -1) * (ramPower * 0.025);
        }

        let powerupDamageMult = 1.0;
        if (attacker.activePowerup === "inferno_ram") {
            powerupDamageMult = 1.80;
            victim.burningTimer = 60;
            victim.burnAttacker = attacker;
            badgeText = "\uD83D\uDD25 1.8x INFERNO FIRE HIT!";
            badgeColor = "#f97316";
            Game.spawnSparks(hitX, hitY, 22);
        } else if (attacker.activePowerup === "hyper_nitro") {
            powerupDamageMult = 1.35;
            badgeText = "\u26A1 TURBO SPEED HIT!";
            badgeColor = "#fde047";
        }

        let victimShieldMult = 1.0;
        if (victim.activePowerup === "titan_shield") {
            victimShieldMult = 0.30;
            badgeText = "\uD83D\uDEE1\uFE0F SHIELD BLOCKED!";
            badgeColor = "#c084fc";
        }

        let aiDiffMult = 1.0;
        if (attacker.isAI && !victim.isAI) {
            if (MatchConfig.difficulty === "easy") aiDiffMult = 0.65;
            if (MatchConfig.difficulty === "hard") aiDiffMult = 1.25;
        }
        if (MatchConfig.mode === "story") {
            if (attacker.team === "ENEMIES") {
                aiDiffMult = attacker.isFinalBoss ? 1.65 : (attacker.isStoryBoss ? 1.40 : 1.18);
                if (victim.isBodyguard && !victim.isViperCompanion) aiDiffMult *= 1.25;
            } else if (attacker.isBodyguard && !attacker.isViperCompanion) {
                aiDiffMult = 0.72;
            }
        }

        if (Game.isSpectating && attacker.isAI && victim.isAI) {
            aiDiffMult = 2.25;
        }

        const finalDamage = ramPower * 1.95 * aiDiffMult * multiplier * powerupDamageMult * victimShieldMult;
        victim.applyDirectionalDamage(finalDamage, zone, hitX, hitY, attacker);

        if (finalDamage > 4.5 || victim.activePowerup === "titan_shield") {
            Game.floatingTexts.push({ x: hitX, y: hitY - 18, text: badgeText, color: badgeColor, life: 0.95 });
        }
    },

    generateSpawnPositions(count, arena) {
        const spawns = [];
        const cx = arena.width / 2, cy = arena.height / 2;
        if (arena.isCircular) {
            const spawnR = (arena.radius || 1130) - 290;
            for (let i = 0; i < count; i++) {
                const theta = Math.PI + (i / count) * Math.PI * 2;
                const x = cx + Math.cos(theta) * spawnR, y = cy + Math.sin(theta) * spawnR;
                spawns.push({ x, y, angle: Math.atan2(cy - y, cx - x) });
            }
        } else {
            const rx = (arena.width / 2) - 420, ry = (arena.height / 2) - 340;
            for (let i = 0; i < count; i++) {
                const theta = Math.PI + (i / count) * Math.PI * 2;
                const x = cx + Math.cos(theta) * rx, y = cy + Math.sin(theta) * ry;
                spawns.push({ x, y, angle: Math.atan2(cy - y, cx - x) });
            }
        }
        return spawns;
    },

    getTeamBaseRects(arena) {
        const cx = arena.width / 2, cy = arena.height / 2;
        if (arena.isCircular) {
            const boxW = 200;
            const boxH = 540;
            const leftX = cx - 720;
            const rightX = cx + 720;
            return {
                leftRect:  { cx: leftX,  cy: cy, w: boxW, h: boxH, xMin: leftX - boxW/2,  xMax: leftX + boxW/2,  yMin: cy - boxH/2, yMax: cy + boxH/2, angle: 0 },
                rightRect: { cx: rightX, cy: cy, w: boxW, h: boxH, xMin: rightX - boxW/2, xMax: rightX + boxW/2, yMin: cy - boxH/2, yMax: cy + boxH/2, angle: Math.PI }
            };
        }
        const boxW = 240;
        const boxH = 680;
        const leftCenterX = 240;
        const rightCenterX = arena.width - 240;
        return {
            leftRect:  { cx: leftCenterX,  cy: cy, w: boxW, h: boxH, xMin: leftCenterX - boxW/2,  xMax: leftCenterX + boxW/2,  yMin: cy - boxH/2, yMax: cy + boxH/2, angle: 0 },
            rightRect: { cx: rightCenterX, cy: cy, w: boxW, h: boxH, xMin: rightCenterX - boxW/2, xMax: rightCenterX + boxW/2, yMin: cy - boxH/2, yMax: cy + boxH/2, angle: Math.PI }
        };
    },

    generateTeamSpawnPositions(team1Count, team2Count, arena) {
        const { leftRect, rightRect } = this.getTeamBaseRects(arena);

        const buildRectLineup = (count, rect, isLeftTeam) => {
            const list = [];
            if (count <= 0) return list;

            const usableH = rect.h - 110;
            const stepY = count > 1 ? Math.min(105, usableH / (count - 1)) : 0;

            const orderOffsets = [0];
            for (let k = 1; orderOffsets.length < count; k++) {
                orderOffsets.push(-k);
                if (offsetsLengthCheck(orderOffsets, count)) orderOffsets.push(k);
            }

            function offsetsLengthCheck(arr, max) { return arr.length < max; }

            for (let i = 0; i < count; i++) {
                let y;
                if (count === 1) {
                    y = rect.cy;
                } else if (count % 2 === 1) {
                    y = rect.cy + orderOffsets[i] * stepY;
                } else {
                    const slotIndex = i === 0 ? 0 : (i % 2 === 1 ? -Math.ceil(i / 2) : Math.ceil(i / 2));
                    y = rect.cy + slotIndex * (stepY * 0.82);
                }

                y = Math.max(rect.yMin + 50, Math.min(rect.yMax - 50, y));
                const staggerX = (i === 0) ? (isLeftTeam ? 20 : -20) : ((i % 2 === 0) ? (isLeftTeam ? -18 : 18) : 0);
                const x = rect.cx + staggerX;

                list.push({
                    x,
                    y,
                    angle: rect.angle,
                    baseRect: rect
                });
            }
            return list;
        };

        return {
            team1Spawns: buildRectLineup(team1Count, leftRect, true),
            team2Spawns: buildRectLineup(team2Count, rightRect, false)
        };
    }
};