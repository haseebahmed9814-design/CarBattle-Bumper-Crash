const CoopTeamMode = {
    spawn(cars, spawns) {
        const ruleTag = MatchConfig.timedMode ? `TIMED SIEGE (${MatchConfig.timeLimitMinutes}M)` : 'KNOCKOUT';
        document.getElementById('hud-mode-pill').textContent = `CO-OP ALLIANCE • ${ruleTag}`;

        const n1 = (MatchConfig.p1Name || 'PLAYER 1').trim().toUpperCase();
        const n2 = (MatchConfig.p2Name || 'PLAYER 2').trim().toUpperCase();

        let sIdx = 0;
        const p1Spawn = spawns[sIdx++];
        cars.push(new BattleCar({
            id: 1, label: n1, team: 'ALLIES',
            isAI: false, playerSlot: 'p1', colorKey: MatchConfig.p1Color,
            x: p1Spawn.x, y: p1Spawn.y, angle: p1Spawn.angle
        }));

        const p2Spawn = spawns[sIdx++];
        cars.push(new BattleCar({
            id: 2, label: n2, team: 'ALLIES',
            isAI: false, playerSlot: 'p2', colorKey: MatchConfig.p2Color,
            x: p2Spawn.x, y: p2Spawn.y, angle: p2Spawn.angle
        }));

        for (let i = 0; i < MatchConfig.allyBotCount; i++) {
            const aSpawn = spawns[sIdx++];
            cars.push(new BattleCar({
                id: 10 + i, label: `ALLY ${i + 1}`, team: 'ALLIES',
                isAI: true, colorKey: MatchConfig.p1Color,
                x: aSpawn.x, y: aSpawn.y, angle: aSpawn.angle
            }));
        }

        const enemyColor = (MatchConfig.p1Color !== 'red' && MatchConfig.p2Color !== 'red') ? 'red' : 'purple';
        for (let i = 0; i < MatchConfig.enemyBotCount; i++) {
            const eSpawn = spawns[sIdx++];
            cars.push(new BattleCar({
                id: 30 + i, label: `ENEMY ${i + 1}`, team: 'ENEMIES',
                isAI: true, colorKey: enemyColor,
                x: eSpawn.x, y: eSpawn.y, angle: eSpawn.angle
            }));
        }
    },

    checkResult(cars, dt) {
        const timeExpired = TimedSiegeMode.tick(dt);
        const p1Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color];
        const stats = TimedSiegeMode.computeTeamSummary(
            cars, 'ALLIES', 'ALLIED SQUAD', p1Pal.light, 'ENEMIES', 'ENEMY AI SQUAD', '#ff4d6d'
        );

        if (stats.team2.alive === 0) {
            return {
                badge: 'CO-OP TEAM VICTORY', title: 'ALLIED TEAM VICTORY!',
                subtitle: 'Your team completely destroyed the Enemy AI Squad!', color: '#00e676', teamStats: stats
            };
        }
        if (stats.team1.alive === 0) {
            return {
                badge: 'CO-OP TEAM DEFEAT', title: 'TEAM DEFEAT!',
                subtitle: 'All Allied vehicles were eliminated.', color: '#ff4d6d', teamStats: stats
            };
        }
        if (timeExpired) {
            return TimedSiegeMode.buildTimeUpDrawResult(stats);
        }
        return null;
    }
};
