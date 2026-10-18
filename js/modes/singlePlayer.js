const SinglePlayerMode = {
    spawn(cars, spawns) {
        document.getElementById('hud-mode-pill').textContent =
            `SINGLE PLAYER • ${AI_DIFFICULTY_PROFILES[MatchConfig.difficulty].label}`;

        let sIdx = 0;
        const pSpawn = spawns[sIdx++];
        const cleanName = (MatchConfig.p1Name || 'PLAYER 1').trim().toUpperCase();
        cars.push(new BattleCar({
            id: 1, label: cleanName, team: 'PLAYER_1',
            isAI: false, playerSlot: 'p1', colorKey: MatchConfig.p1Color,
            x: pSpawn.x, y: pSpawn.y, angle: pSpawn.angle
        }));

        const allKeys = Object.keys(CAR_COLOR_PALETTES).filter(k => k !== MatchConfig.p1Color);
        for (let i = 0; i < MatchConfig.enemyBotCount; i++) {
            const bSpawn = spawns[sIdx++];
            cars.push(new BattleCar({
                id: i + 2, label: `BOT ${i + 1}`, team: `BOT_FFA_${i + 1}`,
                isAI: true, colorKey: allKeys[i % allKeys.length],
                x: bSpawn.x, y: bSpawn.y, angle: bSpawn.angle
            }));
        }
    },

    checkResult(cars) {
        if (KillAnnouncer.slowMoActive) return null;

        const p1 = cars.find(c => c.playerSlot === 'p1');
        const aliveCars = cars.filter(c => !c.dead);
        const aliveBots = cars.filter(c => c.isAI && !c.dead);

        if (p1 && !p1.dead && aliveBots.length === 0) {
            Game.setSpectating(false);
            const outcome = {
                badge: 'SINGLE PLAYER VICTORY',
                title: `${p1.label} WINS!`,
                subtitle: 'You demolished all opposing vehicles and survived as the last car standing!',
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
                badge: 'SINGLE PLAYER RESULT',
                title: `${winner.label} WINS!`,
                subtitle: `${p1.label} was wrecked earlier. ${winner.label} survived as the last car standing!`,
                color: '#ff4d6d'
            } : {
                badge: 'SINGLE PLAYER RESULT',
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
