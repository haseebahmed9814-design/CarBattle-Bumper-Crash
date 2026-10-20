const SquadWarMode = {
    spawn(cars, spawns) {
        const ruleTag = MatchConfig.timedMode ? `TIMED SIEGE (${MatchConfig.timeLimitMinutes}M)` : 'KNOCKOUT';
        document.getElementById('hud-mode-pill').textContent = `SQUAD WAR • ${ruleTag}`;

        const n1 = (MatchConfig.p1Name || 'PLAYER 1').trim().toUpperCase();
        const n2 = (MatchConfig.p2Name || 'PLAYER 2').trim().toUpperCase();

        const totalT1 = 1 + MatchConfig.p1TeamBots;
        const totalT2 = 1 + MatchConfig.p2TeamBots;
        const { team1Spawns, team2Spawns } = PhysicsEngine.generateTeamSpawnPositions(totalT1, totalT2, Game.arena);

        // P1 Commander + P1 Bots on the Left Stadium Curve
        const p1Spawn = team1Spawns[0];
        cars.push(new BattleCar({
            id: 1, label: n1, team: 'P1_SQUAD',
            isAI: false, playerSlot: 'p1', colorKey: MatchConfig.p1Color,
            x: p1Spawn.x, y: p1Spawn.y, angle: p1Spawn.angle
        }));

        for (let i = 0; i < MatchConfig.p1TeamBots; i++) {
            const bSpawn = team1Spawns[i + 1];
            cars.push(new BattleCar({
                id: 10 + i, label: `P1 BOT ${i + 1}`, team: 'P1_SQUAD',
                isAI: true, colorKey: MatchConfig.p1Color,
                x: bSpawn.x, y: bSpawn.y, angle: bSpawn.angle
            }));
        }

        // P2 Commander + P2 Bots on the Right Stadium Curve
        const p2Spawn = team2Spawns[0];
        cars.push(new BattleCar({
            id: 2, label: n2, team: 'P2_SQUAD',
            isAI: false, playerSlot: 'p2', colorKey: MatchConfig.p2Color,
            x: p2Spawn.x, y: p2Spawn.y, angle: p2Spawn.angle
        }));

        for (let i = 0; i < MatchConfig.p2TeamBots; i++) {
            const bSpawn = team2Spawns[i + 1];
            cars.push(new BattleCar({
                id: 30 + i, label: `P2 BOT ${i + 1}`, team: 'P2_SQUAD',
                isAI: true, colorKey: MatchConfig.p2Color,
                x: bSpawn.x, y: bSpawn.y, angle: bSpawn.angle
            }));
        }
    },

    checkResult(cars, dt) {
        const timeExpired = TimedSiegeMode.tick(dt);
        const n1 = (MatchConfig.p1Name || 'PLAYER 1').trim().toUpperCase();
        const n2 = (MatchConfig.p2Name || 'PLAYER 2').trim().toUpperCase();
        const p1Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color];
        const p2Pal = CAR_COLOR_PALETTES[MatchConfig.p2Color];
        const stats = TimedSiegeMode.computeTeamSummary(
            cars, 'P1_SQUAD', `${n1} SQUAD`, p1Pal.light, 'P2_SQUAD', `${n2} SQUAD`, p2Pal.light
        );

        if (stats.team1.alive === 0 && stats.team2.alive === 0) {
            return {
                badge: 'SQUAD WAR RESULT', title: 'MUTUAL WIPEOUT DRAW!',
                color: '#fbbf24', subtitle: 'Both squads were eliminated simultaneously!', teamStats: stats
            };
        }
        if (stats.team2.alive === 0) {
            return {
                badge: 'SQUAD WAR VICTORY', title: `${n1} SQUAD WINS!`,
                color: p1Pal.light, subtitle: `${n1} Squad completely wiped out ${n2} Squad!`, teamStats: stats
            };
        }
        if (stats.team1.alive === 0) {
            return {
                badge: 'SQUAD WAR VICTORY', title: `${n2} SQUAD WINS!`,
                color: p2Pal.light, subtitle: `${n2} Squad completely wiped out ${n1} Squad!`, teamStats: stats
            };
        }
        if (timeExpired) {
            return TimedSiegeMode.buildTimeUpDrawResult(stats);
        }
        return null;
    }
};