const PhysicsEngine = {
    areTeammates(c1, c2) {
        if (!c1 || !c2) return false;
        if (!c1.team || !c2.team || c1.team === 'FFA' || c2.team === 'FFA') return false;
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
            return;
        }

        const spec = car.spec;
        const hpRatio = car.hp / car.maxHp;
        car.isBraking = !!(input.down || input.drift);
        car.isAccelerating = !!input.up;

        const wobble = hpRatio < 0.28 ? Math.sin(performance.now() * 0.04) * 0.07 : 0;
        car.wheelAngle += ((input.steer * 0.42 + wobble) - car.wheelAngle) * 0.25;

        const fx = Math.cos(car.angle), fy = Math.sin(car.angle);
        const rx = -fy, ry = fx;

        let forwardVel = car.vx * fx + car.vy * fy;
        let lateralVel = car.vx * rx + car.vy * ry;

        // Strictly cap throttle between 0.55 and 1.00 so no AI car ever exceeds constant maxSpeed!
        const throttle = Math.min(1.0, Math.max(0.55, (input.throttle !== undefined) ? input.throttle : 1.0));

        if (input.up) forwardVel += spec.accel * throttle * dt;
        if (input.down) {
            if (forwardVel > 0.6) forwardVel *= Math.pow(0.89, dt);
            else forwardVel -= spec.reverseAccel * dt;
        }
        if (input.drift) forwardVel *= Math.pow(0.985, dt);

        // Strict Constant Speed Ceiling (spec.maxSpeed is never exceeded by any bot)
        const maxAllowedSpeed = spec.maxSpeed * throttle;
        if (forwardVel > maxAllowedSpeed) forwardVel = maxAllowedSpeed;
        if (forwardVel < -spec.maxReverse) forwardVel = -spec.maxReverse;

        const speedMag = Math.hypot(car.vx, car.vy);
        if (speedMag > 0.15) {
            const dir = forwardVel >= -0.15 ? 1 : -1;
            const speedFactor = Math.min(speedMag / 4.0, 1.0);
            const driftBoost = input.drift ? 1.32 : 1.0;
            car.angle += input.steer * spec.steerRate * speedFactor * dir * driftBoost * dt;
        }

        car.angle += car.angVel * dt;
        car.angVel *= Math.pow(0.86, dt);

        const grip = input.drift ? spec.handbrakeGrip : spec.normalGrip;
        lateralVel *= Math.pow(grip, dt);

        car.vx = (fx * forwardVel + rx * lateralVel) * Math.pow(0.982, dt);
        car.vy = (fy * forwardVel + ry * lateralVel) * Math.pow(0.982, dt);
        car.x += car.vx * dt;
        car.y += car.vy * dt;

        const pad = arena.wallPad + car.radius * 0.4;
        let hitWall = false;
        if (car.x < pad) { car.x = pad; car.vx = Math.abs(car.vx) * 0.65; hitWall = true; }
        if (car.x > arena.width - pad) { car.x = arena.width - pad; car.vx = -Math.abs(car.vx) * 0.65; hitWall = true; }
        if (car.y < pad) { car.y = pad; car.vy = Math.abs(car.vy) * 0.65; hitWall = true; }
        if (car.y > arena.height - pad) { car.y = arena.height - pad; car.vy = -Math.abs(car.vy) * 0.65; hitWall = true; }

        if (hitWall && speedMag > 6.5) {
            SoundEngine.playCrash(0.32);
            Game.spawnSparks(car.x, car.y, 6);
        }
        if (Math.abs(lateralVel) > 1.85 || (input.drift && speedMag > 3.4)) {
            Game.addTireTrack(car, fx, fy, rx, ry);
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
                Game.shockwaves.push({ x: hitX, y: hitY, r: 8, maxR: 52 + impactSpeed * 4, alpha: 0.85, color: '#fde047' });
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

        let multiplier = 1.0, zone = 'FRONT', badgeText = '1.0x FRONT HIT', badgeColor = '#e2e8f0';

        if (forwardDot < -0.45) {
            multiplier = victim.spec.rearDamagePenalty || 1.55;
            zone = 'REAR'; badgeText = `${multiplier}x REAR CRUSH!`; badgeColor = '#ff4d6d';
        } else if (Math.abs(sideDot) >= 0.45) {
            multiplier = 1.20;
            zone = sideDot < 0 ? 'LEFT' : 'RIGHT'; badgeText = '1.2x SIDE SMASH!'; badgeColor = '#fbbf24';
            victim.angVel += (sideDot < 0 ? 1 : -1) * (ramPower * 0.025);
        }

        let aiDiffMult = 1.0;
        if (attacker.isAI && !victim.isAI) {
            if (MatchConfig.difficulty === 'easy') aiDiffMult = 0.65;
            if (MatchConfig.difficulty === 'hard') aiDiffMult = 1.25;
        }

        // Sudden-Death Bot Fury: When human player is spectating remaining bots, bots deal 2.2x damage to each other so the match finishes fast!
        if (Game.isSpectating && attacker.isAI && victim.isAI) {
            aiDiffMult = 2.25;
        }

        const finalDamage = ramPower * 1.95 * aiDiffMult * multiplier;
        victim.applyDirectionalDamage(finalDamage, zone, hitX, hitY, attacker);

        if (finalDamage > 5.5) {
            Game.floatingTexts.push({ x: hitX, y: hitY - 18, text: badgeText, color: badgeColor, life: 0.95 });
        }
    },

    generateSpawnPositions(count, arena) {
        const spawns = [];
        const cx = arena.width / 2, cy = arena.height / 2;
        const rx = (arena.width / 2) - 420, ry = (arena.height / 2) - 340;
        for (let i = 0; i < count; i++) {
            const theta = (i / count) * Math.PI * 2;
            const x = cx + Math.cos(theta) * rx, y = cy + Math.sin(theta) * ry;
            spawns.push({ x, y, angle: Math.atan2(cy - y, cx - x) });
        }
        return spawns;
    }
};
