const ATTACK_SLOTS = [
    { name: "REAR_CRUSH",  angleOffset:  Math.PI,        dist: 115 },
    { name: "LEFT_TBONE",  angleOffset:  Math.PI * 0.55, dist: 135 },
    { name: "RIGHT_TBONE", angleOffset: -Math.PI * 0.55, dist: 135 },
    { name: "REAR_LEFT",   angleOffset:  Math.PI * 0.82, dist: 120 },
    { name: "REAR_RIGHT",  angleOffset: -Math.PI * 0.82, dist: 120 }
];

class TacticalAIBrain {
    constructor(car) {
        this.car = car;
        this.state = "FLANK_APPROACH";
        this.target = null;
        this.slotIndex = Math.floor(Math.random() * ATTACK_SLOTS.length);
        this.decisionTimer = Math.floor(Math.random() * 12);
        this.chaseFrames = 0;
        this.cumulativeTurn = 0;
        this.lastAngle = car.angle;
        this.repositionWaypoint = null;
        this.repositionTimer = 0;
        this.stuckFrames = 0;
        this.reverseTimer = 0;
        this.reverseSteer = 1;
        this.hesitating = false;
        this.jukeSide = Math.random() < 0.5 ? 1 : -1;
        this.jukeSwitchTimer = 60 + Math.floor(Math.random() * 60);
    }

    onTakeDamage(attacker, zone) {
        const profile = AI_DIFFICULTY_PROFILES[MatchConfig.difficulty] || AI_DIFFICULTY_PROFILES.normal;
        if (attacker && !PhysicsEngine.areTeammates(this.car, attacker) && !attacker.dead) {
            if (Math.random() < (profile.id === "hard" ? 0.92 : (profile.id === "normal" ? 0.55 : 0.20))) {
                this.target = attacker;
            }
        }
        if (zone === "REAR" || zone === "LEFT" || zone === "RIGHT") {
            this.slotIndex = (this.slotIndex + 1) % ATTACK_SLOTS.length;
            this.jukeSide *= -1;
            if (profile.evadeIncoming && Math.random() < 0.75) this.triggerReposition(Game.arena);
        }
    }

    triggerReposition(arena) {
        this.state = "REPOSITION";
        this.repositionTimer = 45 + Math.floor(Math.random() * 35);
        this.chaseFrames = 0;
        this.cumulativeTurn = 0;
        this.slotIndex = (this.slotIndex + 1) % ATTACK_SLOTS.length;
        const angle = this.car.angle + (Math.random() < 0.5 ? 1 : -1) * (Math.PI * 0.65);
        const dist = 360 + Math.random() * 240;
        const margin = arena.wallPad + 160;
        this.repositionWaypoint = {
            x: Math.max(margin, Math.min(arena.width - margin, this.car.x + Math.cos(angle) * dist)),
            y: Math.max(margin, Math.min(arena.height - margin, this.car.y + Math.sin(angle) * dist))
        };
    }

    selectBestTarget(allCars, profile) {
        const myCar = this.car;
        let bestTarget = null, bestScore = -Infinity;
        const targetCounts = new Map();
        for (const c of allCars) {
            if (c.isAI && c !== myCar && !c.dead && c.aiBrain && c.aiBrain.target) {
                const tId = c.aiBrain.target.id;
                targetCounts.set(tId, (targetCounts.get(tId) || 0) + 1);
            }
        }
        for (const candidate of allCars) {
            if (candidate === myCar || candidate.dead || PhysicsEngine.areTeammates(myCar, candidate)) continue;
            const dx = candidate.x - myCar.x, dy = candidate.y - myCar.y;
            const dist = Math.hypot(dx, dy);
            let score = 2200 - dist;
            const angleDiff = Math.abs(this.normalizeAngle(Math.atan2(dy, dx) - myCar.angle));
            if (angleDiff < 0.8) score += 260;
            if (myCar.lastAttacker === candidate) score += 300;
            score += (1 - candidate.hp / candidate.maxHp) * 280;
            if (candidate.carryingFlag) score += 5000;
            if (profile.id === "hard" && !candidate.isAI) score += 220;
            score -= (targetCounts.get(candidate.id) || 0) * (profile.id === "hard" ? 240 : 420);
            if (score > bestScore) { bestScore = score; bestTarget = candidate; }
        }
        return bestTarget;
    }

    computeEvasiveCarrierRoute(goalX, goalY, allCars, arena, profile) {
        const myCar = this.car;
        const hpRatio = myCar.hp / myCar.maxHp;

        this.jukeSwitchTimer -= 1;
        if (this.jukeSwitchTimer <= 0) {
            this.jukeSwitchTimer = 55 + Math.floor(Math.random() * 55);
            if (Math.random() < 0.35) this.jukeSide *= -1;
        }

        let nearbyEnemies = 0;
        for (const c of allCars) {
            if (c.dead || PhysicsEngine.areTeammates(myCar, c)) continue;
            if (Math.hypot(c.x - myCar.x, c.y - myCar.y) < 420) nearbyEnemies++;
        }

        if (hpRatio < 0.65 || (nearbyEnemies >= 2 && hpRatio < 0.85)) {
            let bestAlly = null, bestAllyScore = -Infinity;
            for (const ally of allCars) {
                if (ally === myCar || ally.dead || !PhysicsEngine.areTeammates(myCar, ally)) continue;
                if (ally.hp <= myCar.hp + 20) continue;
                const dAlly = Math.hypot(ally.x - myCar.x, ally.y - myCar.y);
                const dAllyToBase = Math.hypot(ally.x - goalX, ally.y - goalY);
                const myDistToBase = Math.hypot(myCar.x - goalX, myCar.y - goalY);
                if (dAlly < 680 && dAllyToBase < myDistToBase + 260) {
                    const s = (ally.hp - myCar.hp) * 3 - dAlly;
                    if (s > bestAllyScore) {
                        bestAllyScore = s;
                        bestAlly = ally;
                    }
                }
            }
            if (bestAlly) {
                goalX = bestAlly.x + bestAlly.vx * 4;
                goalY = bestAlly.y + bestAlly.vy * 4;
            }
        }

        if (hpRatio < 0.55 && typeof ArenaHazards !== "undefined" && ArenaHazards.powerups.length > 0) {
            for (const orb of ArenaHazards.powerups) {
                if (orb.dropProgress < 0.85) continue;
                const dOrb = Math.hypot(orb.x - myCar.x, orb.y - myCar.y);
                if (dOrb < 460) {
                    goalX = orb.x;
                    goalY = orb.y;
                    break;
                }
            }
        }

        const toGoalX = goalX - myCar.x;
        const toGoalY = goalY - myCar.y;
        const distToGoal = Math.hypot(toGoalX, toGoalY) || 1;
        let dirX = toGoalX / distToGoal;
        let dirY = toGoalY / distToGoal;

        if (distToGoal > 185) {
            let dodgeX = 0, dodgeY = 0;
            for (const enemy of allCars) {
                if (enemy.dead || PhysicsEngine.areTeammates(myCar, enemy)) continue;
                const predEx = enemy.x + enemy.vx * 10;
                const predEy = enemy.y + enemy.vy * 10;
                const rx = predEx - myCar.x;
                const ry = predEy - myCar.y;
                const dist = Math.hypot(rx, ry) || 1;

                if (dist < 560) {
                    const nx = rx / dist, ny = ry / dist;
                    const aheadDot = nx * dirX + ny * dirY;
                    const urgency = Math.pow((560 - dist) / 560, 1.35);

                    if (aheadDot > 0.15) {
                        const perpX = -ny, perpY = nx;
                        const cross = dirX * ny - dirY * nx;
                        let side = cross >= 0 ? -1 : 1;

                        const testX = myCar.x + perpX * side * 220;
                        const testY = myCar.y + perpY * side * 220;
                        const pad = arena.wallPad + 150;
                        if (arena.isCircular) {
                            if (Math.hypot(testX - arena.width / 2, testY - arena.height / 2) > (arena.radius || 1130) - 140) {
                                side *= -1;
                            }
                        } else {
                            if (testX < pad || testX > arena.width - pad || testY < pad || testY > arena.height - pad) {
                                side *= -1;
                            }
                        }

                        const swerveWeight = (2.1 + (1 - hpRatio) * 1.1) * urgency;
                        dodgeX += perpX * side * swerveWeight - nx * urgency * 1.05;
                        dodgeY += perpY * side * swerveWeight - ny * urgency * 1.05;
                    } else if (dist < 250) {
                        dodgeX -= nx * urgency * 1.45;
                        dodgeY -= ny * urgency * 1.45;
                    }
                }
            }

            dirX += dodgeX;
            dirY += dodgeY;
            const finalLen = Math.hypot(dirX, dirY) || 1;
            dirX /= finalLen;
            dirY /= finalLen;

            const lookAhead = Math.min(distToGoal, 380);
            goalX = myCar.x + dirX * lookAhead;
            goalY = myCar.y + dirY * lookAhead;
        }

        return this.steerTowardPoint(goalX, goalY, allCars, arena, profile);
    }

    updateCTFBehavior(allCars, arena, profile) {
        const myCar = this.car;
        const flags = CaptureFlagMode.flags;
        if (!flags || flags.length < 2) return null;

        const ourFlag = flags.find(f => f.ownerTeam === myCar.team);
        const enemyFlag = flags.find(f => f.ownerTeam !== myCar.team);
        if (!ourFlag || !enemyFlag) return null;

        if (enemyFlag.carrier === myCar) {
            const distHome = Math.hypot(ourFlag.homeX - myCar.x, ourFlag.homeY - myCar.y);
            if (distHome < CaptureFlagMode.standRadius * 0.65) {
                let imminentDanger = null, minDangerDist = 230;
                for (const c of allCars) {
                    if (c.dead || PhysicsEngine.areTeammates(myCar, c)) continue;
                    const d = Math.hypot(c.x - myCar.x, c.y - myCar.y);
                    const spd = Math.hypot(c.vx, c.vy);
                    if (d < minDangerDist && spd > 4.8 && myCar.hp < 85) {
                        minDangerDist = d;
                        imminentDanger = c;
                    }
                }
                if (imminentDanger) {
                    const jukeAng = Math.atan2(imminentDanger.y - myCar.y, imminentDanger.x - myCar.x) + (Math.PI * 0.55 * this.jukeSide);
                    const jx = ourFlag.homeX + Math.cos(jukeAng) * (CaptureFlagMode.standRadius * 0.72);
                    const jy = ourFlag.homeY + Math.sin(jukeAng) * (CaptureFlagMode.standRadius * 0.72);
                    return this.steerTowardPoint(jx, jy, allCars, arena, profile);
                }
                return { up: false, down: false, steer: 0, drift: true, throttle: 0 };
            }
            return this.computeEvasiveCarrierRoute(ourFlag.homeX, ourFlag.homeY, allCars, arena, profile);
        }

        if (ourFlag.state === "CARRIED" && ourFlag.carrier && !ourFlag.carrier.dead) {
            this.target = ourFlag.carrier;
            const c = ourFlag.carrier;
            return this.steerTowardPoint(
                c.x + c.vx * profile.leadPrediction,
                c.y + c.vy * profile.leadPrediction,
                allCars, arena, profile
            );
        }

        if (ourFlag.state === "DROPPED") {
            return this.steerTowardPoint(ourFlag.x, ourFlag.y, allCars, arena, profile);
        }

        if (enemyFlag.state === "DROPPED") {
            return this.steerTowardPoint(enemyFlag.x, enemyFlag.y, allCars, arena, profile);
        }

        if (myCar.ctfRole === "DEFENDER") {
            let nearestIntruder = null, minDist = 780;
            for (const c of allCars) {
                if (c.dead || PhysicsEngine.areTeammates(myCar, c)) continue;
                const d = Math.hypot(c.x - ourFlag.homeX, c.y - ourFlag.homeY);
                if (d < minDist) {
                    minDist = d;
                    nearestIntruder = c;
                }
            }
            if (nearestIntruder) {
                this.target = nearestIntruder;
                return this.steerTowardPoint(
                    nearestIntruder.x + nearestIntruder.vx * profile.leadPrediction,
                    nearestIntruder.y + nearestIntruder.vy * profile.leadPrediction,
                    allCars, arena, profile
                );
            }
            const patrolAng = performance.now() * 0.0012 + myCar.id;
            const px = ourFlag.homeX + Math.cos(patrolAng) * 145;
            const py = ourFlag.homeY + Math.sin(patrolAng) * 145;
            return this.steerTowardPoint(px, py, allCars, arena, profile);
        }

        if (enemyFlag.state === "AT_BASE") {
            const distEnemyStand = Math.hypot(enemyFlag.homeX - myCar.x, enemyFlag.homeY - myCar.y);
            if (distEnemyStand < CaptureFlagMode.standRadius * 0.65) {
                return { up: false, down: false, steer: 0, drift: true, throttle: 0 };
            }
            return this.computeEvasiveCarrierRoute(enemyFlag.homeX, enemyFlag.homeY, allCars, arena, profile);
        }

        return null;
    }

    update(allCars, arena, dt) {
        const myCar = this.car;
        if (myCar.dead) return { up: false, down: false, steer: 0, drift: false, throttle: 0 };

        const profile = AI_DIFFICULTY_PROFILES[MatchConfig.difficulty] || AI_DIFFICULTY_PROFILES.normal;
        const speed = Math.hypot(myCar.vx, myCar.vy);
        this.cumulativeTurn = this.cumulativeTurn * 0.985 + Math.abs(this.normalizeAngle(myCar.angle - this.lastAngle));
        this.lastAngle = myCar.angle;

        if (speed < 1.3) {
            this.stuckFrames += dt;
            if (this.stuckFrames > (profile.id === "easy" ? 42 : 24)) {
                this.reverseTimer = 34; this.stuckFrames = 0;
                this.reverseSteer = Math.random() < 0.5 ? -1 : 1;
            }
        } else {
            this.stuckFrames = 0;
        }

        const noseX = myCar.x + Math.cos(myCar.angle) * 80, noseY = myCar.y + Math.sin(myCar.angle) * 80;
        const wallLimit = arena.wallPad + 38;
        const nearWall = arena.isCircular
            ? (Math.hypot(noseX - arena.width / 2, noseY - arena.height / 2) > (arena.radius || 1130) - 45)
            : (noseX < wallLimit || noseX > arena.width - wallLimit || noseY < wallLimit || noseY > arena.height - wallLimit);
        if (nearWall && speed < 4.2) {
            this.reverseTimer = Math.max(this.reverseTimer, 25);
        }
        if (this.reverseTimer > 0) {
            this.reverseTimer -= dt;
            return { up: false, down: true, steer: this.reverseSteer, drift: false, throttle: 1.0 };
        }

        if (MatchConfig.mode === "ctf" && typeof CaptureFlagMode !== "undefined") {
            const ctfOrder = this.updateCTFBehavior(allCars, arena, profile);
            if (ctfOrder) return ctfOrder;
        }

        if (this.state === "REPOSITION" && this.repositionWaypoint) {
            this.repositionTimer -= dt;
            const distToWp = Math.hypot(this.repositionWaypoint.x - myCar.x, this.repositionWaypoint.y - myCar.y);
            if (this.repositionTimer <= 0 || distToWp < 120) this.state = "FLANK_APPROACH";
            else return this.steerTowardPoint(this.repositionWaypoint.x, this.repositionWaypoint.y, allCars, arena, profile);
        }

        this.decisionTimer -= dt;
        if (this.decisionTimer <= 0 || !this.target || this.target.dead || PhysicsEngine.areTeammates(myCar, this.target)) {
            this.decisionTimer = profile.decisionInterval;
            this.target = this.selectBestTarget(allCars, profile);
            this.hesitating = Math.random() < profile.hesitationChance;
            if (profile.id === "hard") this.slotIndex = Math.random() < 0.55 ? 0 : (1 + Math.floor(Math.random() * 2));
            else if (Math.random() < 0.3) this.slotIndex = (this.slotIndex + 1) % ATTACK_SLOTS.length;
        }

        if (typeof ArenaHazards !== "undefined" && ArenaHazards.powerups.length > 0 && profile.id !== "easy") {
            let bestOrb = null, bestOrbDist = Infinity;
            for (const orb of ArenaHazards.powerups) {
                if (orb.dropProgress < 0.85) continue;
                const d = Math.hypot(orb.x - myCar.x, orb.y - myCar.y);
                const wantsHeal = (myCar.hp < myCar.maxHp * 0.65 && orb.spec.isInstantHeal);
                const maxSeekRange = wantsHeal ? 1350 : 680;
                if (d < maxSeekRange && d < bestOrbDist) {
                    bestOrbDist = d;
                    bestOrb = orb;
                }
            }
            if (bestOrb) {
                return this.steerTowardPoint(bestOrb.x, bestOrb.y, allCars, arena, profile);
            }
        }

        if (!this.target) return this.steerTowardPoint(arena.width / 2, arena.height / 2, allCars, arena, profile);

        const t = this.target;
        const distToTarget = Math.hypot(t.x - myCar.x, t.y - myCar.y);

        if (distToTarget < 270) {
            this.chaseFrames += dt;
            if (this.chaseFrames > profile.maxChaseFrames || this.cumulativeTurn > Math.PI * 1.65) {
                this.triggerReposition(arena);
                return this.steerTowardPoint(this.repositionWaypoint.x, this.repositionWaypoint.y, allCars, arena, profile);
            }
        } else {
            this.chaseFrames = Math.max(0, this.chaseFrames - dt * 0.5);
        }

        const slot = ATTACK_SLOTS[this.slotIndex];
        const alignment = Math.abs(this.normalizeAngle(Math.atan2(t.y - myCar.y, t.x - myCar.x) - myCar.angle));
        let aimX = t.x, aimY = t.y;

        if (distToTarget < 250 && alignment < 0.58) {
            this.state = "RAM_STRIKE";
            aimX = t.x + t.vx * profile.leadPrediction;
            aimY = t.y + t.vy * profile.leadPrediction;
        } else {
            this.state = "FLANK_APPROACH";
            const slotWorldAngle = t.angle + slot.angleOffset;
            const offsetDist = Math.min(distToTarget * 0.65, profile.flankDistance);
            aimX = t.x + Math.cos(slotWorldAngle) * offsetDist + t.vx * (profile.leadPrediction * 0.5);
            aimY = t.y + Math.sin(slotWorldAngle) * offsetDist + t.vy * (profile.leadPrediction * 0.5);
        }

        if (profile.aimJitter > 0) {
            aimX += Math.sin(performance.now() * 0.0028 + myCar.id * 2) * (profile.aimJitter * 220);
            aimY += Math.cos(performance.now() * 0.0028 + myCar.id * 2) * (profile.aimJitter * 220);
        }

        return this.steerTowardPoint(aimX, aimY, allCars, arena, profile);
    }

    steerTowardPoint(aimX, aimY, allCars, arena, profile) {
        const myCar = this.car;
        const safeMargin = arena.wallPad + 110;
        aimX = Math.max(safeMargin, Math.min(arena.width - safeMargin, aimX));
        aimY = Math.max(safeMargin, Math.min(arena.height - safeMargin, aimY));

        let desiredVecX = aimX - myCar.x, desiredVecY = aimY - myCar.y;
        const dLen = Math.hypot(desiredVecX, desiredVecY) || 1;
        desiredVecX /= dLen; desiredVecY /= dLen;

        for (const other of allCars) {
            if (other === myCar || other.dead) continue;
            const dx = myCar.x - other.x, dy = myCar.y - other.y;
            const dist = Math.hypot(dx, dy) || 1;
            const isAlly = PhysicsEngine.areTeammates(myCar, other);
            const sepRadius = isAlly ? 185 : (myCar.carryingFlag ? 245 : 120);
            if (dist < sepRadius && (isAlly || other !== this.target || myCar.carryingFlag)) {
                const pushStrength = ((sepRadius - dist) / sepRadius) * (isAlly ? 1.35 : (myCar.carryingFlag ? 1.75 : 0.85));
                desiredVecX += (dx / dist) * pushStrength;
                desiredVecY += (dy / dist) * pushStrength;
            }
        }

        const wDist = profile.wallSenseDist;
        if (myCar.x < wDist) desiredVecX += ((wDist - myCar.x) / wDist) * 1.4;
        if (myCar.x > arena.width - wDist) desiredVecX -= ((myCar.x - (arena.width - wDist)) / wDist) * 1.4;
        if (myCar.y < wDist) desiredVecY += ((wDist - myCar.y) / wDist) * 1.4;
        if (myCar.y > arena.height - wDist) desiredVecY -= ((myCar.y - (arena.height - wDist)) / wDist) * 1.4;

        const angleDiff = this.normalizeAngle(Math.atan2(desiredVecY, desiredVecX) - myCar.angle);
        const steerResponsiveness = profile.id === "easy" ? 1.35 : (profile.id === "hard" ? 3.2 : 2.5);
        const steer = Math.max(-1, Math.min(1, angleDiff * steerResponsiveness));
        const speed = Math.hypot(myCar.vx, myCar.vy);
        const shouldDrift = profile.useDriftTurn && Math.abs(angleDiff) > 0.72 && speed > 5.5;

        return { up: !this.hesitating, down: false, steer, drift: shouldDrift, throttle: profile.throttleFactor };
    }

    normalizeAngle(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
    }
}