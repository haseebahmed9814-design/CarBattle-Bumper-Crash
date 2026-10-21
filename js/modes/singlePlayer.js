const SinglePlayerMode = {
    spawn(cars, spawns) {
        const cleanName = (MatchConfig.p1Name || 'PLAYER 1').trim().toUpperCase();

        // MODE B: STADIUM SQUAD SIEGE (Solo Team Battle — Rectangular Left & Right Bases)
        if (MatchConfig.spSubMode === 'team') {
            const ruleTag = MatchConfig.timedMode ? `RESPAWN BLITZ (${MatchConfig.timeLimitMinutes}M)` : 'KNOCKOUT';
            document.getElementById('hud-mode-pill').textContent = `STADIUM SQUAD SIEGE • ${ruleTag}`;

            const totalAllies = 1 + MatchConfig.spAllyBots;
            const totalEnemies = MatchConfig.spEnemyBots;
            const { team1Spawns, team2Spawns } = PhysicsEngine.generateTeamSpawnPositions(totalAllies, totalEnemies, Game.arena);

            const p1Spawn = team1Spawns[0];
            cars.push(new BattleCar({
                id: 1, label: cleanName, team: 'ALLIES',
                isAI: false, playerSlot: 'p1', colorKey: MatchConfig.p1Color,
                x: p1Spawn.x, y: p1Spawn.y, angle: p1Spawn.angle, baseRect: p1Spawn.baseRect
            }));

            for (let i = 0; i < MatchConfig.spAllyBots; i++) {
                const bSpawn = team1Spawns[i + 1];
                cars.push(new BattleCar({
                    id: 10 + i, label: `ALLY ${i + 1}`, team: 'ALLIES',
                    isAI: true, colorKey: MatchConfig.p1Color,
                    x: bSpawn.x, y: bSpawn.y, angle: bSpawn.angle, baseRect: bSpawn.baseRect
                }));
            }

            const enemyColor = MatchConfig.p1Color !== 'red' ? 'red' : 'purple';
            for (let i = 0; i < MatchConfig.spEnemyBots; i++) {
                const eSpawn = team2Spawns[i];
                cars.push(new BattleCar({
                    id: 30 + i, label: `ENEMY ${i + 1}`, team: 'ENEMIES',
                    isAI: true, colorKey: enemyColor,
                    x: eSpawn.x, y: eSpawn.y, angle: eSpawn.angle, baseRect: eSpawn.baseRect
                }));
            }
            return;
        }

        // MODE A: KING OF THE RING (Solo Free-For-All)
        const ruleLabel = MatchConfig.timedMode ? `RESPAWN BLITZ (${MatchConfig.timeLimitMinutes}M)` : AI_DIFFICULTY_PROFILES[MatchConfig.difficulty].label;
        document.getElementById('hud-mode-pill').textContent = `KING OF THE RING • ${ruleLabel}`;

        let sIdx = 0;
        const pSpawn = spawns[sIdx++];
        const makeIndRect = (sp) => ({
            cx: sp.x, cy: sp.y, w: 150, h: 110,
            xMin: sp.x - 75, xMax: sp.x + 75,
            yMin: sp.y - 55, yMax: sp.y + 55,
            angle: sp.angle
        });

        cars.push(new BattleCar({
            id: 1, label: cleanName, team: 'PLAYER_1',
            isAI: false, playerSlot: 'p1', colorKey: MatchConfig.p1Color,
            x: pSpawn.x, y: pSpawn.y, angle: pSpawn.angle,
            baseRect: MatchConfig.timedMode ? makeIndRect(pSpawn) : null
        }));

        const allKeys = Object.keys(CAR_COLOR_PALETTES).filter(k => k !== MatchConfig.p1Color);
        for (let i = 0; i < MatchConfig.enemyBotCount; i++) {
            const bSpawn = spawns[sIdx++];
            cars.push(new BattleCar({
                id: i + 2, label: `BOT ${i + 1}`, team: `BOT_FFA_${i + 1}`,
                isAI: true, colorKey: allKeys[i % allKeys.length],
                x: bSpawn.x, y: bSpawn.y, angle: bSpawn.angle,
                baseRect: MatchConfig.timedMode ? makeIndRect(bSpawn) : null
            }));
        }
    },

    checkResult(cars, dt) {
        if (KillAnnouncer.slowMoActive) return null;

        if (MatchConfig.spSubMode === 'team') {
            const timeExpired = TimedSiegeMode.tick(dt);
            const p1 = cars.find(c => c.playerSlot === 'p1');
            const p1Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color];
            const stats = TimedSiegeMode.computeTeamSummary(
                cars, 'ALLIES', `${p1 ? p1.label : 'P1'} SQUAD`, p1Pal.light, 'ENEMIES', 'ENEMY AI SQUAD', '#ff4d6d'
            );

            if (MatchConfig.timedMode) {
                Game.setSpectating(false);
                if (timeExpired) {
                    return TimedSiegeMode.buildTimeUpResult(stats);
                }
                return null;
            }

            if (stats.team2.alive === 0 && stats.team1.alive === 0) {
                Game.setSpectating(false);
                return {
                    badge: 'STADIUM SQUAD SIEGE', title: 'MUTUAL WIPEOUT DRAW!',
                    subtitle: 'Both squads were eliminated at the exact same moment!', color: '#fbbf24', teamStats: stats
                };
            }
            if (stats.team2.alive === 0) {
                Game.setSpectating(false);
                const outcome = {
                    badge: 'SOLO TEAM VICTORY', title: `${p1 ? p1.label : 'ALLIED'} SQUAD WINS!`,
                    subtitle: 'Your squad completely wiped out the Enemy AI Team!', color: '#00e676', teamStats: stats
                };
                const winnerCar = (p1 && !p1.dead) ? p1 : cars.find(c => c.team === 'ALLIES' && !c.dead);
                KillAnnouncer.triggerFinalKnockout(winnerCar, Game.lastWreckedCar, outcome);
                return null;
            }
            if (stats.team1.alive === 0) {
                Game.setSpectating(false);
                const outcome = {
                    badge: 'SOLO TEAM DEFEAT', title: 'ENEMY SQUAD WINS!',
                    subtitle: 'All Allied squad vehicles were destroyed.', color: '#ff4d6d', teamStats: stats
                };
                const winnerCar = cars.find(c => c.team === 'ENEMIES' && !c.dead);
                KillAnnouncer.triggerFinalKnockout(winnerCar, Game.lastWreckedCar, outcome);
                return null;
            }
            if (p1 && p1.dead) {
                const remainingAlive = cars.filter(c => !c.dead).length;
                Game.setSpectating(true, remainingAlive);
            }
            return null;
        }

        if (MatchConfig.timedMode) {
            Game.setSpectating(false);
            const timeExpired = TimedSiegeMode.tick(dt);
            if (timeExpired) {
                const sorted = [...cars].sort((a, b) => (b.kills - a.kills) || (b.damageDealt - a.damageDealt));
                const winner = sorted[0];
                return {
                    badge: 'KING OF THE RING • TIMED RESPAWN BLITZ',
                    title: `${winner.label} WINS!`,
                    subtitle: `${winner.label} topped the leaderboard with ${winner.kills} Kills and ${winner.damageDealt} Damage!`,
                    color: winner.isAI ? '#ff4d6d' : '#00e676'
                };
            }
            return null;
        }

        const p1 = cars.find(c => c.playerSlot === 'p1');
        const aliveCars = cars.filter(c => !c.dead);
        const aliveBots = cars.filter(c => c.isAI && !c.dead);

        if (p1 && !p1.dead && aliveBots.length === 0) {
            Game.setSpectating(false);
            const outcome = {
                badge: 'KING OF THE RING VICTORY',
                title: `${p1.label} WINS!`,
                subtitle: 'You demolished all opposing vehicles and survived as the King of the Ring!',
                color: '#00e676'
            };
            KillAnnouncer.triggerFinalKnockout(p1, Game.lastWreckedCar, outcome);
            return null;
        }

        if (p1 && p1.dead) {
            if (aliveCars.length > 1) {
                Game.setSpectating(true, aliveCars.length);
                return null;
            }

            Game.setSpectating(false);
            const winner = aliveCars[0];
            const outcome = winner ? {
                badge: 'KING OF THE RING RESULT',
                title: `${winner.label} WINS!`,
                subtitle: `${p1.label} was wrecked earlier. ${winner.label} survived as the last car standing!`,
                color: '#ff4d6d'
            } : {
                badge: 'KING OF THE RING RESULT',
                title: 'ALL CARS WRECKED!',
                subtitle: 'Every vehicle in the arena was destroyed in a mutual knockout!',
                color: '#fbbf24'
            };
            KillAnnouncer.triggerFinalKnockout(winner, Game.lastWreckedCar, outcome);
            return null;
        }

        return null;
    }
};