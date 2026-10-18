const ArenaHazards = {
    trees: [],
    benches: [],
    bushes: [],
    pillars: [],

    initForArena(arena) {
        this.trees = [];
        this.benches = [];
        this.bushes = [];
        this.pillars = [];

        if (!arena.hasHazards) return;

        const cx = arena.width / 2;
        const cy = arena.height / 2;

        this.trees = [
            { x: cx - 680, y: cy - 420, r: 42, shake: 0 },
            { x: cx + 680, y: cy - 420, r: 42, shake: 0 },
            { x: cx - 680, y: cy + 420, r: 42, shake: 0 },
            { x: cx + 680, y: cy + 420, r: 42, shake: 0 },
            { x: cx,       y: cy - 560, r: 38, shake: 0 },
            { x: cx,       y: cy + 560, r: 38, shake: 0 },
            { x: cx - 1080, y: cy,      r: 44, shake: 0 },
            { x: cx + 1080, y: cy,      r: 44, shake: 0 }
        ];

        this.benches = [
            { x: cx - 340, y: cy - 260, w: 120, h: 34, hitTimer: 0 },
            { x: cx + 340, y: cy - 260, w: 120, h: 34, hitTimer: 0 },
            { x: cx - 340, y: cy + 260, w: 120, h: 34, hitTimer: 0 },
            { x: cx + 340, y: cy + 260, w: 120, h: 34, hitTimer: 0 },
            { x: cx - 520, y: cy,       w: 34,  h: 120, hitTimer: 0 },
            { x: cx + 520, y: cy,       w: 34,  h: 120, hitTimer: 0 }
        ];

        this.bushes = [
            { x: cx - 260, y: cy,       r: 52 },
            { x: cx + 260, y: cy,       r: 52 },
            { x: cx - 860, y: cy - 240, r: 48 },
            { x: cx + 860, y: cy - 240, r: 48 },
            { x: cx - 860, y: cy + 240, r: 48 },
            { x: cx + 860, y: cy + 240, r: 48 }
        ];
    },

    updateAndCollide(cars, dt) {
        if (this.trees.length === 0 && this.benches.length === 0) return;

        // 1. Soft Bushes: Slow down slightly, zero sticking
        for (const bush of this.bushes) {
            for (const car of cars) {
                if (car.dead) continue;
                const d = Math.hypot(car.x - bush.x, car.y - bush.y);
                if (d < bush.r + car.radius * 0.6) {
                    car.vx *= Math.pow(0.93, dt);
                    car.vy *= Math.pow(0.93, dt);
                }
            }
        }

        // 2. Little Trees: Clean push-out and bounce off (ZERO sticking, ZERO damage)
        for (const tree of this.trees) {
            if (tree.shake > 0) tree.shake = Math.max(0, tree.shake - 0.08 * dt);

            for (const car of cars) {
                const dx = car.x - tree.x;
                const dy = car.y - tree.y;
                const dist = Math.hypot(dx, dy);
                const minDist = car.radius + tree.r * 0.65;

                if (dist < minDist && dist > 0.001) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    
                    // Push car completely outside the collision radius instantly so it never sticks
                    const overlap = minDist - dist + 1.5;
                    car.x += nx * overlap;
                    car.y += ny * overlap;

                    // Clean elastic reflection off the tree trunk without pinning the car
                    const dot = car.vx * nx + car.vy * ny;
                    if (dot < 0) {
                        car.vx -= 1.35 * dot * nx;
                        car.vy -= 1.35 * dot * ny;
                    }
                    car.vx *= 0.72;
                    car.vy *= 0.72;

                    if (tree.shake <= 0.1) {
                        tree.shake = 1.0;
                        SoundEngine.playCrash(0.20);
                        this.spawnLeafParticles(tree.x + nx * tree.r * 0.5, tree.y + ny * tree.r * 0.5, 6, '#16a34a');
                    }
                }
            }
        }

        // 3. Wooden Park Benches: Clean push-out and bounce off (ZERO sticking, ZERO damage)
        for (const b of this.benches) {
            if (b.hitTimer > 0) b.hitTimer = Math.max(0, b.hitTimer - 0.08 * dt);

            const halfW = b.w / 2;
            const halfH = b.h / 2;

            for (const car of cars) {
                const closestX = Math.max(b.x - halfW, Math.min(car.x, b.x + halfW));
                const closestY = Math.max(b.y - halfH, Math.min(car.y, b.y + halfH));

                const dx = car.x - closestX;
                const dy = car.y - closestY;
                const dist = Math.hypot(dx, dy);

                if (dist < car.radius) {
                    let nx = 0, ny = -1;
                    if (dist > 0.001) {
                        nx = dx / dist;
                        ny = dy / dist;
                    } else {
                        // Fallback normal if car center is exactly on bench center
                        nx = car.x >= b.x ? 1 : -1;
                        ny = 0;
                    }

                    // Instant separation push-out so the car slides right off the bench
                    const overlap = car.radius - dist + 1.5;
                    car.x += nx * overlap;
                    car.y += ny * overlap;

                    const dot = car.vx * nx + car.vy * ny;
                    if (dot < 0) {
                        car.vx -= 1.30 * dot * nx;
                        car.vy -= 1.30 * dot * ny;
                    }
                    car.vx *= 0.68;
                    car.vy *= 0.68;

                    if (b.hitTimer <= 0.1) {
                        b.hitTimer = 1.0;
                        SoundEngine.playCrash(0.22);
                        this.spawnLeafParticles(closestX, closestY, 5, '#d97706');
                    }
                }
            }
        }
    },

    spawnLeafParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 1.2 + Math.random() * 3.8;
            Game.particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 3.5 + Math.random() * 4,
                color: color,
                alpha: 0.9,
                decay: 0.025
            });
        }
    },

    drawGroundElements(ctx) {
        if (this.trees.length === 0 && this.benches.length === 0) return;

        for (const bush of this.bushes) {
            ctx.save();
            ctx.translate(bush.x, bush.y);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath(); ctx.arc(4, 5, bush.r, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#15803d';
            ctx.beginPath(); ctx.arc(0, 0, bush.r, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#22c55e';
            ctx.beginPath(); ctx.arc(-bush.r * 0.25, -bush.r * 0.2, bush.r * 0.55, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(bush.r * 0.28, bush.r * 0.18, bush.r * 0.48, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        for (const b of this.benches) {
            ctx.save();
            const shakeX = b.hitTimer > 0 ? (Math.random() - 0.5) * 3 : 0;
            const shakeY = b.hitTimer > 0 ? (Math.random() - 0.5) * 3 : 0;
            ctx.translate(b.x + shakeX, b.y + shakeY);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.beginPath();
            ctx.roundRect(-b.w / 2 + 4, -b.h / 2 + 5, b.w, b.h, 5);
            ctx.fill();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 5);
            ctx.fill();

            ctx.fillStyle = '#b45309';
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;

            if (b.w > b.h) {
                ctx.fillRect(-b.w / 2 + 6, -b.h / 2 + 3, b.w - 12, 8);
                ctx.fillStyle = '#d97706';
                ctx.fillRect(-b.w / 2 + 6, -2, b.w - 12, 8);
                ctx.fillRect(-b.w / 2 + 6, b.h / 2 - 10, b.w - 12, 7);
                ctx.fillStyle = '#334155';
                ctx.fillRect(-b.w / 2 + 2, -b.h / 2 + 2, 5, b.h - 4);
                ctx.fillRect(b.w / 2 - 7, -b.h / 2 + 2, 5, b.h - 4);
            } else {
                ctx.fillRect(-b.w / 2 + 3, -b.h / 2 + 6, 8, b.h - 12);
                ctx.fillStyle = '#d97706';
                ctx.fillRect(-2, -b.h / 2 + 6, 8, b.h - 12);
                ctx.fillRect(b.w / 2 - 10, -b.h / 2 + 6, 7, b.h - 12);
                ctx.fillStyle = '#334155';
                ctx.fillRect(-b.w / 2 + 2, -b.h / 2 + 2, b.w - 4, 5);
                ctx.fillRect(-b.w / 2 + 2, b.h / 2 - 7, b.w - 4, 5);
            }

            ctx.restore();
        }
    },

    drawTreeCanopies(ctx) {
        if (this.trees.length === 0) return;

        for (const t of this.trees) {
            ctx.save();
            const sx = t.shake > 0 ? Math.sin(performance.now() * 0.06) * 3 * t.shake : 0;
            const sy = t.shake > 0 ? Math.cos(performance.now() * 0.06) * 3 * t.shake : 0;
            ctx.translate(t.x + sx, t.y + sy);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
            ctx.beginPath();
            ctx.arc(7, 8, t.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#5c3a21';
            ctx.beginPath();
            ctx.arc(0, 0, t.r * 0.38, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#14532d';
            ctx.strokeStyle = '#052e16';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, t.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.arc(-t.r * 0.25, -t.r * 0.22, t.r * 0.62, 0, Math.PI * 2);
            ctx.arc(t.r * 0.28, -t.r * 0.12, t.r * 0.55, 0, Math.PI * 2);
            ctx.arc(0, t.r * 0.26, t.r * 0.58, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(-t.r * 0.18, -t.r * 0.24, t.r * 0.35, 0, Math.PI * 2);
            ctx.arc(t.r * 0.18, t.r * 0.12, t.r * 0.28, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
};
