const Duel1v1Mode = {
    spawn(cars, spawns) {
        document.getElementById('hud-mode-pill').textContent = '1V1 SOLO DUEL';
        const n1 = (MatchConfig.p1Name || 'PLAYER 1').trim().toUpperCase();
        const n2 = (MatchConfig.p2Name || 'PLAYER 2').trim().toUpperCase();

        // Ensure P1 is always on the Left spawn and P2 is always on the Right spawn
        const sortedByX = [...spawns].sort((a, b) => a.x - b.x);
        const leftSpawn = sortedByX[0];
        const rightSpawn = sortedByX[sortedByX.length - 1];

        cars.push(new BattleCar({
            id: 1, label: n1, team: 'P1',
            isAI: false, playerSlot: 'p1', colorKey: MatchConfig.p1Color,
            x: leftSpawn.x, y: leftSpawn.y, angle: leftSpawn.angle
        }));

        cars.push(new BattleCar({
            id: 2, label: n2, team: 'P2',
            isAI: false, playerSlot: 'p2', colorKey: MatchConfig.p2Color,
            x: rightSpawn.x, y: rightSpawn.y, angle: rightSpawn.angle
        }));
    },

    checkResult(cars) {
        const p1 = cars.find(c => c.playerSlot === 'p1');
        const p2 = cars.find(c => c.playerSlot === 'p2');

        if (p1.dead && p2.dead) {
            return {
                badge: '1V1 DUEL RESULT', title: 'DOUBLE KNOCKOUT DRAW!',
                subtitle: 'Both cars were destroyed in the final impact!', color: '#fbbf24'
            };
        }
        if (p2.dead) {
            return {
                badge: '1V1 DUEL RESULT', title: `${p1.label} WINS!`,
                subtitle: `${p1.label} takes the 1v1 Championship!`, color: p1.lightColor
            };
        }
        if (p1.dead) {
            return {
                badge: '1V1 DUEL RESULT', title: `${p2.label} WINS!`,
                subtitle: `${p2.label} takes the 1v1 Championship!`, color: p2.lightColor
            };
        }
        return null;
    }
};