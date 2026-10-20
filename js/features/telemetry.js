const TelemetryTracker = {
    storageKey: 'bumper_crash_telemetry_v26',

    getStats() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (!parsed.players) parsed.players = {};
                return parsed;
            }
        } catch (e) {}
        return {
            totalPlays: 0,
            modes: {
                single: 0,
                single_team_timed: 0,
                single_team_elim: 0,
                '1v1': 0,
                coop_timed: 0,
                coop_elim: 0,
                team_vs_timed: 0,
                team_vs_elim: 0
            },
            players: {}
        };
    },

    recordMatchStart() {
        const stats = this.getStats();
        stats.totalPlays = (stats.totalPlays || 0) + 1;

        let modeKey = MatchConfig.mode;
        if (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'team') {
            modeKey = MatchConfig.timedMode ? 'single_team_timed' : 'single_team_elim';
        } else if (MatchConfig.mode === 'coop') {
            modeKey = MatchConfig.timedMode ? 'coop_timed' : 'coop_elim';
        } else if (MatchConfig.mode === 'team_vs') {
            modeKey = MatchConfig.timedMode ? 'team_vs_timed' : 'team_vs_elim';
        }

        stats.modes[modeKey] = (stats.modes[modeKey] || 0) + 1;
        try { localStorage.setItem(this.storageKey, JSON.stringify(stats)); } catch (e) {}

        try { window.history.replaceState(null, '', `#/play/${modeKey}`); } catch (e) {}

        if (typeof window.va === 'function') {
            window.va('event', { name: 'match_start', data: { mode: modeKey, map: MatchConfig.arenaKey } });
        }
        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
            window.goatcounter.count({ path: `play/${modeKey}`, title: `Mode Played: ${modeKey}`, event: true });
        }
    },

    recordPlayerMatchStats(cars, outcome) {
        const stats = this.getStats();
        if (!stats.players) stats.players = {};

        const titleUpper = (outcome && outcome.title ? outcome.title : '').toUpperCase();
        const badgeUpper = (outcome && outcome.badge ? outcome.badge : '').toUpperCase();

        cars.filter(c => !c.isAI).forEach(humanCar => {
            const name = (humanCar.label || 'PLAYER').toUpperCase();
            if (!stats.players[name]) {
                stats.players[name] = { matches: 0, wins: 0, kills: 0, damage: 0 };
            }
            const p = stats.players[name];
            p.matches += 1;
            p.kills += (humanCar.kills || 0);
            p.damage += (humanCar.damageDealt || 0);

            const wonSoloFFA = (MatchConfig.mode === 'single' && MatchConfig.spSubMode !== 'team' && !humanCar.dead && titleUpper.includes('WINS'));
            const wonSoloTeam = (MatchConfig.mode === 'single' && MatchConfig.spSubMode === 'team' && badgeUpper.includes('VICTORY'));
            const wonDuel = (MatchConfig.mode === '1v1' && !humanCar.dead && titleUpper.includes(name));
            const wonCoop = (MatchConfig.mode === 'coop' && titleUpper.includes('VICTORY'));
            const wonSquad = (MatchConfig.mode === 'team_vs' && titleUpper.includes(name));

            if (wonSoloFFA || wonSoloTeam || wonDuel || wonCoop || wonSquad) {
                p.wins += 1;
            }
        });

        try { localStorage.setItem(this.storageKey, JSON.stringify(stats)); } catch (e) {}
    },

    getSummaryString() {
        const s = this.getStats();
        return `Version: ${GAME_VERSION} | Total Plays: ${s.totalPlays} | Solo FFA: ${s.modes.single || 0} | Solo Team: ${(s.modes.single_team_timed || 0) + (s.modes.single_team_elim || 0)} | 1v1: ${s.modes['1v1'] || 0}`;
    },

    renderAnalyticsDashboard() {
        const s = this.getStats();
        const total = s.totalPlays || 0;

        const modeMeta = [
            { key: 'single',            label: 'Single Player: Solo Free-For-All',   color: '#00a8ff', count: s.modes.single || 0 },
            { key: 'single_team_timed', label: 'Single Player: Team (Timed Siege)',  color: '#38bdf8', count: s.modes.single_team_timed || 0 },
            { key: 'single_team_elim',  label: 'Single Player: Team (Knockout)',     color: '#0284c7', count: s.modes.single_team_elim || 0 },
            { key: '1v1',               label: 'Two Players: 1v1 Solo Duel',         color: '#ffb703', count: s.modes['1v1'] || 0 },
            { key: 'coop_timed',        label: 'Co-op Alliance (Timed Siege)',       color: '#00e676', count: s.modes.coop_timed || 0 },
            { key: 'coop_elim',         label: 'Co-op Alliance (Knockout)',          color: '#10b981', count: s.modes.coop_elim || 0 },
            { key: 'team_vs_timed',     label: 'P1 vs P2 Squad (Timed Siege)',       color: '#ff1e42', count: s.modes.team_vs_timed || 0 },
            { key: 'team_vs_elim',      label: 'P1 vs P2 Squad (Knockout)',          color: '#b5179e', count: s.modes.team_vs_elim || 0 }
        ];

        let topMode = 'None Yet', maxCount = 0;
        modeMeta.forEach(m => { if (m.count > maxCount) { maxCount = m.count; topMode = m.label; } });

        const spCount = (s.modes.single || 0) + (s.modes.single_team_timed || 0) + (s.modes.single_team_elim || 0);
        const mpCount = Math.max(0, total - spCount);

        const totalEl = document.getElementById('an-total-plays');
        const topEl = document.getElementById('an-top-mode');
        const splitEl = document.getElementById('an-mode-split');
        const chartEl = document.getElementById('an-bars-container');
        const playerTableEl = document.getElementById('an-player-career-list');

        if (totalEl) totalEl.textContent = total;
        if (topEl) topEl.textContent = topMode;
        if (splitEl) splitEl.textContent = `${spCount} Solo / ${mpCount} Two-Player`;

        if (chartEl) {
            const denom = Math.max(1, maxCount);
            chartEl.innerHTML = modeMeta.map(m => {
                const pctWidth = Math.round((m.count / denom) * 100);
                const sharePct = total > 0 ? Math.round((m.count / total) * 100) : 0;
                return `
                    <div class="an-bar-row">
                        <div class="an-bar-header">
                            <span>${m.label}</span>
                            <span><strong>${m.count}</strong> plays (${sharePct}%)</span>
                        </div>
                        <div class="an-bar-track">
                            <div class="an-bar-fill" style="width:${pctWidth}%;background:${m.color}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (playerTableEl) {
            const entries = Object.entries(s.players || {});
            if (entries.length === 0) {
                playerTableEl.innerHTML = `<div class="helper-note">Finish a match to record career stats for each player name!</div>`;
            } else {
                playerTableEl.innerHTML = entries.map(([name, st]) => `
                    <div class="result-row">
                        <span><strong style="color:#38bdf8">${name}</strong></span>
                        <span>Matches: <b>${st.matches}</b> &bull; Wins: <b style="color:#00e676">${st.wins}</b> &bull; Kills: <b style="color:#fbbf24">${st.kills}</b> &bull; Total Damage: <b>${st.damage}</b></span>
                    </div>
                `).join('');
            }
        }
    }
};