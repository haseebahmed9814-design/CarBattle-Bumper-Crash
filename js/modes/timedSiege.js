const TimedSiegeMode = {
    timeRemaining: 180,

    initTimer() {
        const mins = Math.max(1, Math.min(5, MatchConfig.timeLimitMinutes || 3));
        MatchConfig.timeLimitMinutes = mins;
        this.timeRemaining = mins * 60;
    },

    tick(dt) {
        if (!MatchConfig.timedMode) return false;
        this.timeRemaining -= (dt * 16.666) / 1000;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            return true;
        }
        return false;
    },

    computeTeamSummary(cars, team1Id, team1Name, team1Color, team2Id, team2Name, team2Color) {
        const t1Cars = cars.filter(c => c.team === team1Id);
        const t2Cars = cars.filter(c => c.team === team2Id);
        return {
            team1: {
                name: team1Name, color: team1Color,
                kills: t1Cars.reduce((s, c) => s + c.kills, 0),
                damage: t1Cars.reduce((s, c) => s + c.damageDealt, 0),
                alive: t1Cars.filter(c => !c.dead).length
            },
            team2: {
                name: team2Name, color: team2Color,
                kills: t2Cars.reduce((s, c) => s + c.kills, 0),
                damage: t2Cars.reduce((s, c) => s + c.damageDealt, 0),
                alive: t2Cars.filter(c => !c.dead).length
            }
        };
    },

    buildTimeUpDrawResult(stats) {
        let domText = 'Exact tie on Kills and Car Damage!';
        if (stats.team1.kills !== stats.team2.kills) {
            domText = stats.team1.kills > stats.team2.kills
                ? `${stats.team1.name} led with ${stats.team1.kills} Cars Destroyed (${stats.team1.damage} DMG)!`
                : `${stats.team2.name} led with ${stats.team2.kills} Cars Destroyed (${stats.team2.damage} DMG)!`;
        } else if (stats.team1.damage !== stats.team2.damage) {
            domText = stats.team1.damage > stats.team2.damage
                ? `${stats.team1.name} led on Car Damage (${stats.team1.damage} DMG vs ${stats.team2.damage} DMG)!`
                : `${stats.team2.name} led on Car Damage (${stats.team2.damage} DMG vs ${stats.team1.damage} DMG)!`;
        }

        return {
            badge: 'TIMED BLITZ SIEGE • TIME EXPIRED',
            title: 'TIME-UP DRAW!',
            color: '#fbbf24',
            subtitle: `Neither team was fully wiped out before 00:00! ${domText}`,
            teamStats: stats
        };
    }
};
