const InputManager = {
    defaultBindings: {
        p1: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', drift: 'Space' },
        p2: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', drift: 'ShiftRight' }
    },
    bindings: null,
    pressedCodes: new Set(),
    listeningTarget: null,
    gameplayActive: false,

    init() {
        this.resetToDefaults();
        window.addEventListener('keydown', (e) => {
            const activeTag = document.activeElement ? document.activeElement.tagName : '';
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

            if (this.listeningTarget) {
                e.preventDefault();
                if (e.code !== 'Escape') this.setBinding(this.listeningTarget.player, this.listeningTarget.action, e.code);
                const cb = this.listeningTarget.callback;
                this.listeningTarget = null;
                if (cb) cb();
                return;
            }
            if ((e.code === 'Escape' || e.code === 'KeyP') && typeof Game !== 'undefined') {
                if (Game.state === 'PLAYING' || Game.state === 'PAUSED') {
                    e.preventDefault();
                    Game.togglePause();
                    return;
                }
            }
            if (e.code === 'KeyC' && typeof CameraController !== 'undefined' && Game.state === 'PLAYING') {
                e.preventDefault();
                CameraController.cycleMode();
                return;
            }
            if (this.gameplayActive) {
                if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.code)) e.preventDefault();
                this.pressedCodes.add(e.code);
            }
        });
        window.addEventListener('keyup', (e) => this.pressedCodes.delete(e.code));
        window.addEventListener('blur', () => this.clearKeys());
    },
    resetToDefaults() { this.bindings = JSON.parse(JSON.stringify(this.defaultBindings)); },
    clearKeys() { this.pressedCodes.clear(); },
    setBinding(player, action, newCode) {
        ['p1', 'p2'].forEach(p => {
            Object.keys(this.bindings[p]).forEach(act => {
                if (this.bindings[p][act] === newCode) this.bindings[p][act] = this.bindings[player][action];
            });
        });
        this.bindings[player][action] = newCode;
    },
    formatKeyName(code) {
        if (!code) return 'NONE';
        if (code === 'ShiftRight') return 'R-SHIFT / ENTER / NUM0';
        return code.replace('Key', '').replace('Arrow', 'ARROW ').replace('ShiftLeft', 'L-SHIFT').replace('Space', 'SPACE').replace('Digit', '');
    },
    getPlayerInput(playerKey) {
        if (!this.gameplayActive) return { up: false, down: false, steer: 0, drift: false };
        const map = this.bindings[playerKey];
        const up = this.pressedCodes.has(map.up);
        const down = this.pressedCodes.has(map.down);
        const left = this.pressedCodes.has(map.left);
        const right = this.pressedCodes.has(map.right);
        const drift = this.pressedCodes.has(map.drift) ||
            (playerKey === 'p2' && map.drift === 'ShiftRight' && (
                this.pressedCodes.has('Enter') || this.pressedCodes.has('Numpad0') ||
                this.pressedCodes.has('NumpadEnter') || this.pressedCodes.has('Slash')
            ));
        return { up, down, steer: (left ? -1 : 0) + (right ? 1 : 0), drift };
    }
};
