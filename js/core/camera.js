const CameraController = {
    x: 1700,
    y: 1050,
    zoom: 0.65,
    spectateIndex: 0,

    resetToArena(arena, canvas) {
        this.x = arena.width / 2;
        this.y = arena.height / 2;
        this.zoom = Math.min(canvas.width / arena.width, canvas.height / arena.height) * 1.35;
        this.spectateIndex = 0;
    },

    cycleMode() {
        UserSettings.cameraMode = UserSettings.cameraMode === 'moving_wide' ? 'fixed_full' : 'moving_wide';
        SoundEngine.playUIClick();
        if (typeof UIManager !== 'undefined') UIManager.syncCameraModeUI();
    },

    cycleSpectateTarget(cars) {
        const alive = cars.filter(c => !c.dead);
        if (alive.length > 0) {
            this.spectateIndex = (this.spectateIndex + 1) % alive.length;
            SoundEngine.playUIClick();
        }
    },

    update(cars, arena, canvas, gameState) {
        const fullZoom = Math.min(
            (canvas.width * 0.96) / arena.width,
            (canvas.height * 0.94) / arena.height
        );

        // Fixed Full Stadium Camera
        if (gameState === 'MENU_BG' || UserSettings.cameraMode === 'fixed_full') {
            this.x += (arena.width / 2 - this.x) * 0.12;
            this.y += (arena.height / 2 - this.y) * 0.12;
            this.zoom += (fullZoom - this.zoom) * 0.12;
            return;
        }

        // Dynamic Follow Camera: Zooms in 1.75x closer than full stadium so vehicles and health bars are clearly visible!
        const actionZoom = fullZoom * 1.75;
        let focusCars = cars.filter(c => !c.isAI && !c.dead);

        // If human player is wrecked and spectating remaining bots, follow the selected living bot
        if (focusCars.length === 0) {
            const aliveBots = cars.filter(c => !c.dead);
            if (aliveBots.length > 0) {
                const targetBot = aliveBots[this.spectateIndex % aliveBots.length];
                focusCars = [targetBot];
            } else {
                focusCars = cars;
            }
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        focusCars.forEach(c => {
            if (c.x < minX) minX = c.x;
            if (c.x > maxX) maxX = c.x;
            if (c.y < minY) minY = c.y;
            if (c.y > maxY) maxY = c.y;
        });

        let targetX = (minX + maxX) / 2;
        let targetY = (minY + maxY) / 2;

        // If 2 human players are far apart, smoothly zoom out just enough to keep both on screen
        let targetZoom = actionZoom;
        if (focusCars.length > 1) {
            const spanX = (maxX - minX) + 900;
            const spanY = (maxY - minY) + 650;
            const fitZoom = Math.min(canvas.width / spanX, canvas.height / spanY);
            targetZoom = Math.max(fullZoom * 1.05, Math.min(actionZoom, fitZoom));
        }

        const halfViewW = (canvas.width / 2) / targetZoom;
        const halfViewH = (canvas.height / 2) / targetZoom;

        targetX = halfViewW < arena.width / 2
            ? Math.max(halfViewW, Math.min(arena.width - halfViewW, targetX))
            : arena.width / 2;

        targetY = halfViewH < arena.height / 2
            ? Math.max(halfViewH, Math.min(arena.height - halfViewH, targetY))
            : arena.height / 2;

        this.x += (targetX - this.x) * 0.12;
        this.y += (targetY - this.y) * 0.12;
        this.zoom += (targetZoom - this.zoom) * 0.10;
    }
};
