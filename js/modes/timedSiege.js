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

    buildTimeUpResult(stats) {
        const t1 = stats.team1;
        const t2 = stats.team2;

        if (t1.kills > t2.kills || (t1.kills === t2.kills && t1.damage > t2.damage)) {
            return {
                badge: 'TIMED RESPAWN BLITZ • FINAL SCORE',
                title: `${t1.name} WINS!`,
                color: t1.color,
                subtitle: `${t1.name} won on score with ${t1.kills} Kills (${t1.damage} DMG) vs ${t2.kills} Kills (${t2.damage} DMG)!`,
                teamStats: stats
            };
        }
        if (t2.kills > t1.kills || (t2.kills === t1.kills && t2.damage > t1.damage)) {
            return {
                badge: 'TIMED RESPAWN BLITZ • FINAL SCORE',
                title: `${t2.name} WINS!`,
                color: t2.color,
                subtitle: `${t2.name} won on score with ${t2.kills} Kills (${t2.damage} DMG) vs ${t1.kills} Kills (${t1.damage} DMG)!`,
                teamStats: stats
            };
        }

        return {
            badge: 'TIMED RESPAWN BLITZ • TIME EXPIRED',
            title: 'EXACT SCORE DRAW!',
            color: '#fbbf24',
            subtitle: `Both sides tied with ${t1.kills} Kills and ${t1.damage} Damage!`,
            teamStats: stats
        };
    },

    buildTimeUpDrawResult(stats) {
        return this.buildTimeUpResult(stats);
    },

    // Draws Left & Right Rectangular Team Base Sections near the poles!
    drawRespawnBases(ctx, arena, cars) {
        const isTeamOrDuel = (
            MatchConfig.mode === 'coop' ||
            MatchConfig.mode === 'team_vs' ||
            MatchConfig.mode === '1v1' || MatchConfig.mode === 'ctf' ||
            (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'team')
        );
        if (!MatchConfig.timedMode && !isTeamOrDuel) return;

        const now = performance.now();
        const pulse = 0.55 + Math.sin(now * 0.004) * 0.15;

        const drawRectangularBase = (rect, color, label, isLeft) => {
            ctx.save();
            ctx.translate(rect.cx, rect.cy);

            // 1. Translucent Rectangular Base Floor
            ctx.fillStyle = 'rgba(15, 23, 42, 0.36)';
            ctx.beginPath();
            ctx.roundRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, 16);
            ctx.fill();

            // 2. Crisp Glowing Rectangular Outer Border
            ctx.strokeStyle = color;
            ctx.globalAlpha = pulse;
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.roundRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, 16);
            ctx.stroke();

            // 3. Dashed Inner Tactical Bay Border
            ctx.globalAlpha = 0.45;
            ctx.lineWidth = 2;
            ctx.setLineDash([16, 10]);
            ctx.beginPath();
            ctx.roundRect(-rect.w / 2 + 12, -rect.h / 2 + 12, rect.w - 24, rect.h - 24, 10);
            ctx.stroke();
            ctx.setLineDash([]);

            // 4. Internal Horizontal Bay Divider Lines & Launch Chevrons
            ctx.globalAlpha = 0.22;
            ctx.lineWidth = 2;
            for (let y = -rect.h / 2 + 115; y < rect.h / 2 - 60; y += 115) {
                ctx.beginPath();
                ctx.moveTo(-rect.w / 2 + 20, y);
                ctx.lineTo(rect.w / 2 - 20, y);
                ctx.stroke();
            }

            // Forward Launch Direction Chevrons inside the Rectangle
            const dir = isLeft ? 1 : -1;
            ctx.globalAlpha = 0.32;
            ctx.lineWidth = 3.5;
            for (let row = -1; row <= 1; row++) {
                const cyOff = row * 180;
                ctx.beginPath();
                ctx.moveTo(-18 * dir, cyOff - 22);
                ctx.lineTo(12 * dir, cyOff);
                ctx.lineTo(-18 * dir, cyOff + 22);
                ctx.stroke();
            }

            ctx.restore();

            // 5. Rectangular Base Header Label
            ctx.save();
            ctx.font = '900 14px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.lineWidth = 3.5;
            ctx.strokeText(label, rect.cx, rect.yMin - 12);
            ctx.fillStyle = color;
            ctx.fillText(label, rect.cx, rect.yMin - 12);
            ctx.restore();
        };

        const p1Pal = CAR_COLOR_PALETTES[MatchConfig.p1Color] || CAR_COLOR_PALETTES.blue;
        const p2Pal = CAR_COLOR_PALETTES[MatchConfig.p2Color] || CAR_COLOR_PALETTES.green;

        if (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'ffa') {
            // Individual Rectangular Spawn Pads for Solo FFA Timed Respawn
            cars.forEach(c => {
                if (!c.baseRect) return;
                drawRectangularBase(c.baseRect, c.lightColor, `${c.label} BASE`, c.spawnX < arena.width / 2);
            });
        } else {
            const { leftRect, rightRect } = PhysicsEngine.getTeamBaseRects(arena);
            const t1Label = MatchConfig.mode === 'coop'
                ? 'ALLIED BASE SECTION'
                : `${(MatchConfig.p1Name || 'P1').toUpperCase()} BASE SECTION`;
            const t2Label = (MatchConfig.mode === 'coop' || (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'team'))
                ? 'ENEMY BASE SECTION'
                : `${(MatchConfig.p2Name || 'P2').toUpperCase()} BASE SECTION`;
            const t2Color = (MatchConfig.mode === 'coop' || (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'team'))
                ? '#ff4d6d'
                : p2Pal.light;

            drawRectangularBase(leftRect, p1Pal.light, t1Label, true);
            drawRectangularBase(rightRect, t2Color, t2Label, false);
        }
    }
};