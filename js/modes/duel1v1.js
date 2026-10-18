const Duel1v1Mode = {
    spawn(cars, spawns) {
        document.getElementById('hud-mode-pill').textContent = '1V1 SOLO DUEL';
        const n1 = (MatchConfig.p1Name || 'PLAYER 1').trim().toUpperCase();
        const n2 = (MatchConfig.p2Name || 'PLAYER 2').trim().toUpperCase();

        cars.push(new BattleCar({
            id: 1, label: n1, team: 'P1',
            isAI: false, playerSlot: 'p1', colorKey: MatchConfig.p1Color,
            x: spawns[0].x, y: spawns[0].y, angle: spawns[0].angle
        }));

        cars.push(new BattleCar({
            id: 2, label: n2, team: 'P2',
            isAI: false, playerSlot: 'p2', colorKey: MatchConfig.p2Color,
            x: spawns[1].x, y: spawns[1].y, angle: spawns[1].angle
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
