const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const TILE_SIZE = 32;
const GRID_WIDTH = 13;
const GRID_HEIGHT = 13;
const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 448;
const BULLET_SPEED = 0.4;
const TANK_SPEED = 0.15;

// Game State
let lastTime = 0;
let gameLoopId;
let bullets = [];
let enemies = [];
let spawnTimer = 0;

// Map Data (Level 1)
// 0: Empty, 1: Brick, 2: Steel, 3: Water, 4: Forest, 5: Base
const LEVEL_1 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0]
];

// Sprite Generator
const Sprites = {
    brick: null, steel: null, water: null, forest: null, base: null, player: null, enemy: null,

    init() {
        this.brick = this.createPattern('#a03200', '#fff', 'brick');
        this.steel = this.createPattern('#c0c0c0', '#fff', 'steel');
        this.water = this.createPattern('#004058', '#fff', 'water');
        this.forest = this.createPattern('#005000', '#000', 'forest');
        this.base = this.createBase();
        this.player = this.createTank('#f8b800');
        this.enemy = this.createTank('#c0c0c0');
    },

    createPattern(color1, color2, type) {
        const c = document.createElement('canvas');
        c.width = TILE_SIZE; c.height = TILE_SIZE;
        const x = c.getContext('2d');
        x.fillStyle = color1; x.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        if (type === 'brick') {
            x.fillStyle = '#000';
            x.fillRect(0, TILE_SIZE / 2 - 2, TILE_SIZE, 4);
            x.fillRect(TILE_SIZE / 2 - 2, 0, 4, TILE_SIZE / 2);
            x.fillRect(TILE_SIZE / 4 - 2, TILE_SIZE / 2, 4, TILE_SIZE / 2);
            x.fillRect(3 * TILE_SIZE / 4 - 2, TILE_SIZE / 2, 4, TILE_SIZE / 2);
        } else if (type === 'steel') {
            x.fillStyle = '#fff';
            x.fillRect(TILE_SIZE / 4, TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2);
            x.fillStyle = color1;
            x.fillRect(TILE_SIZE / 4 + 4, TILE_SIZE / 4 + 4, TILE_SIZE / 2 - 8, TILE_SIZE / 2 - 8);
        } else if (type === 'water') {
            x.fillStyle = '#88c0f8';
            x.fillRect(0, TILE_SIZE / 4, TILE_SIZE, TILE_SIZE / 4);
            x.fillRect(0, 3 * TILE_SIZE / 4, TILE_SIZE, TILE_SIZE / 4);
        } else if (type === 'forest') {
            x.fillStyle = '#000'; x.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            x.fillStyle = color1; x.beginPath();
            x.arc(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0, Math.PI * 2); x.fill();
        }
        return c;
    },

    createBase() {
        const c = document.createElement('canvas');
        c.width = TILE_SIZE; c.height = TILE_SIZE;
        const x = c.getContext('2d');
        x.fillStyle = '#000'; x.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        x.fillStyle = '#ccc'; x.beginPath();
        x.moveTo(2, TILE_SIZE - 2); x.lineTo(TILE_SIZE / 2, 2); x.lineTo(TILE_SIZE - 2, TILE_SIZE - 2); x.fill();
        x.fillStyle = '#f00'; x.fillRect(TILE_SIZE / 2 - 4, TILE_SIZE / 2, 8, 8);
        return c;
    },

    createTank(color) {
        const c = document.createElement('canvas');
        c.width = TILE_SIZE; c.height = TILE_SIZE;
        const x = c.getContext('2d');
        x.fillStyle = color; x.fillRect(4, 4, 24, 24);
        x.fillRect(2, 4, 4, 24); x.fillRect(26, 4, 4, 24);
        x.fillStyle = '#000'; x.fillRect(14, 0, 4, 14);
        x.fillStyle = color; x.fillRect(10, 10, 12, 12);
        return c;
    }
};

// Input
const Input = {
    keys: {},
    lastSpace: false,
    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    },
    isJustPressed(code) {
        if (code === 'Space') {
            if (this.keys[code] && !this.lastSpace) {
                this.lastSpace = true;
                return true;
            }
            if (!this.keys[code]) this.lastSpace = false;
            return false;
        }
        return false;
    }
};

// Map
const Map = {
    grid: [],
    offsetX: 48, offsetY: 16,
    init() { this.grid = JSON.parse(JSON.stringify(LEVEL_1)); },
    draw() {
        for (let r = 0; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
                const cell = this.grid[r][c];
                const x = this.offsetX + c * TILE_SIZE;
                const y = this.offsetY + r * TILE_SIZE;
                if (cell === 1) ctx.drawImage(Sprites.brick, x, y);
                else if (cell === 2) ctx.drawImage(Sprites.steel, x, y);
                else if (cell === 3) ctx.drawImage(Sprites.water, x, y);
                else if (cell === 5) ctx.drawImage(Sprites.base, x, y);
            }
        }
        ctx.drawImage(Sprites.base, this.offsetX + 6 * TILE_SIZE, this.offsetY + 12 * TILE_SIZE);
        for (let r = 0; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
                if (this.grid[r][c] === 4) {
                    ctx.drawImage(Sprites.forest, this.offsetX + c * TILE_SIZE, this.offsetY + r * TILE_SIZE);
                }
            }
        }
    },
    isSolid(rect) {
        const corners = [
            { x: rect.x, y: rect.y }, { x: rect.x + rect.w - 1, y: rect.y },
            { x: rect.x, y: rect.y + rect.h - 1 }, { x: rect.x + rect.w - 1, y: rect.y + rect.h - 1 }
        ];
        for (let p of corners) {
            const mapX = p.x - this.offsetX;
            const mapY = p.y - this.offsetY;
            if (mapX < 0 || mapX >= GRID_WIDTH * TILE_SIZE || mapY < 0 || mapY >= GRID_HEIGHT * TILE_SIZE) return true;
            const col = Math.floor(mapX / TILE_SIZE);
            const row = Math.floor(mapY / TILE_SIZE);
            if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
                const tile = this.grid[row][col];
                if (tile === 1 || tile === 2 || tile === 3) return true;
                if (row === 12 && col === 6) return true;
            }
        }
        return false;
    },
    destroyBlock(rect) {
        const cx = rect.x + rect.w / 2 - this.offsetX;
        const cy = rect.y + rect.h / 2 - this.offsetY;
        const col = Math.floor(cx / TILE_SIZE);
        const row = Math.floor(cy / TILE_SIZE);
        if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
            const tile = this.grid[row][col];
            if (tile === 1) { this.grid[row][col] = 0; return true; }
            else if (tile === 2) { return true; }
        }
        return false;
    }
};

// Bullet
class Bullet {
    constructor(x, y, dir, owner) {
        this.x = x; this.y = y; this.dir = dir;
        this.owner = owner;
        this.speed = BULLET_SPEED;
        this.width = 4; this.height = 4;
        this.active = true;
    }
    update(dt) {
        if (!this.active) return;
        let dx = 0, dy = 0;
        if (this.dir === 0) dy = -1;
        else if (this.dir === 1) dx = 1;
        else if (this.dir === 2) dy = 1;
        else if (this.dir === 3) dx = -1;
        this.x += dx * this.speed * dt;
        this.y += dy * this.speed * dt;
        const rect = { x: this.x, y: this.y, w: this.width, h: this.height };
        if (Map.isSolid(rect)) {
            Map.destroyBlock(rect);
            this.active = false;
        }
    }
    draw() {
        if (!this.active) return;
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Collision Helper
function checkRectOverlap(r1, r2) {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}

// Enemy
class Enemy {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.width = 28; this.height = 28;
        this.direction = 2;
        this.speed = 0.1;
        this.moveTimer = 0;
        this.shootTimer = 0;
        this.active = true;
    }
    update(dt) {
        if (!this.active) return;
        this.moveTimer -= dt;
        if (this.moveTimer <= 0) {
            this.moveTimer = 1000 + Math.random() * 2000;
            if (Math.random() < 0.2) this.direction = Math.floor(Math.random() * 4);
        }
        let dx = 0, dy = 0;
        if (this.direction === 0) dy = -1;
        else if (this.direction === 1) dx = 1;
        else if (this.direction === 2) dy = 1;
        else if (this.direction === 3) dx = -1;

        const nextX = this.x + dx * this.speed * dt;
        const nextY = this.y + dy * this.speed * dt;
        const nextRect = { x: nextX + 2, y: nextY + 2, w: this.width, h: this.height };

        // Check Map Collision
        let collided = Map.isSolid(nextRect);

        // Check Player Collision
        if (!collided && Player.active) {
            const pRect = { x: Player.x, y: Player.y, w: Player.width, h: Player.height };
            if (checkRectOverlap(nextRect, pRect)) collided = true;
        }

        // Check Other Enemies Collision
        if (!collided) {
            for (let other of enemies) {
                if (other !== this && other.active) {
                    const oRect = { x: other.x, y: other.y, w: other.width, h: other.height };
                    if (checkRectOverlap(nextRect, oRect)) {
                        collided = true;
                        break;
                    }
                }
            }
        }

        if (!collided) { this.x = nextX; this.y = nextY; }
        else { this.direction = Math.floor(Math.random() * 4); }

        this.shootTimer -= dt;
        if (this.shootTimer <= 0) {
            this.shootTimer = 2000 + Math.random() * 3000;
            this.shoot();
        }
    }
    shoot() {
        let bx = this.x + 14, by = this.y + 14;
        if (this.direction === 0) by -= 16;
        if (this.direction === 1) bx += 16;
        if (this.direction === 2) by += 16;
        if (this.direction === 3) bx -= 16;
        bullets.push(new Bullet(bx - 2, by - 2, this.direction, 'enemy'));
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + 16, this.y + 16);
        ctx.rotate(this.direction * Math.PI / 2);
        ctx.drawImage(Sprites.enemy, -16, -16);
        ctx.restore();
    }
}

// Player
const Player = {
    x: 48 + 4 * TILE_SIZE, y: 16 + 12 * TILE_SIZE,
    width: 28, height: 28,
    direction: 0,
    active: true,

    update(dt) {
        if (!this.active) return;
        let dx = 0, dy = 0, moving = false;
        if (Input.keys['ArrowUp']) { dy = -1; this.direction = 0; moving = true; }
        else if (Input.keys['ArrowRight']) { dx = 1; this.direction = 1; moving = true; }
        else if (Input.keys['ArrowDown']) { dy = 1; this.direction = 2; moving = true; }
        else if (Input.keys['ArrowLeft']) { dx = -1; this.direction = 3; moving = true; }
        if (moving) {
            const nextX = this.x + dx * TANK_SPEED * dt;
            const nextY = this.y + dy * TANK_SPEED * dt;
            const nextRect = { x: nextX + 2, y: nextY + 2, w: this.width, h: this.height };

            // Check Map Collision
            let collided = Map.isSolid(nextRect);

            // Check Enemy Collision
            if (!collided) {
                for (let e of enemies) {
                    if (e.active) {
                        const eRect = { x: e.x, y: e.y, w: e.width, h: e.height };
                        if (checkRectOverlap(nextRect, eRect)) {
                            collided = true;
                            break;
                        }
                    }
                }
            }

            if (!collided) {
                this.x = nextX; this.y = nextY;
            } else {
                // Slide logic simplified: just stop
                if (dx !== 0) {
                    const rectX = { x: nextX + 2, y: this.y + 2, w: this.width, h: this.height };
                    let colX = Map.isSolid(rectX);
                    if (!colX) {
                        for (let e of enemies) {
                            if (e.active) {
                                const eRect = { x: e.x, y: e.y, w: e.width, h: e.height };
                                if (checkRectOverlap(rectX, eRect)) { colX = true; break; }
                            }
                        }
                    }
                    if (!colX) this.x = nextX;
                }
                if (dy !== 0) {
                    const rectY = { x: this.x + 2, y: nextY + 2, w: this.width, h: this.height };
                    let colY = Map.isSolid(rectY);
                    if (!colY) {
                        for (let e of enemies) {
                            if (e.active) {
                                const eRect = { x: e.x, y: e.y, w: e.width, h: e.height };
                                if (checkRectOverlap(rectY, eRect)) { colY = true; break; }
                            }
                        }
                    }
                    if (!colY) this.y = nextY;
                }
            }
        }
        if (Input.isJustPressed('Space')) { this.shoot(); }
    },
    shoot() {
        let bx = this.x + 14, by = this.y + 14;
        if (this.direction === 0) by -= 16;
        if (this.direction === 1) bx += 16;
        if (this.direction === 2) by += 16;
        if (this.direction === 3) bx -= 16;
        bullets.push(new Bullet(bx - 2, by - 2, this.direction, 'player'));
    },
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + 16, this.y + 16);
        ctx.rotate(this.direction * Math.PI / 2);
        ctx.drawImage(Sprites.player, -16, -16);
        ctx.restore();
    }
};

function gameLoop(timestamp) {
    const dt = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;

    Player.update(dt);

    if (enemies.length < 4) {
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
            spawnTimer = 3000;
            const positions = [0, 6, 12];
            const pos = positions[Math.floor(Math.random() * 3)];
            enemies.push(new Enemy(48 + pos * TILE_SIZE, 16));
        }
    }

    enemies.forEach(e => e.update(dt));
    bullets.forEach(b => b.update(dt));

    bullets.forEach(b => {
        if (!b.active) return;

        // Bullet vs Enemy
        if (b.owner === 'player') {
            enemies.forEach(e => {
                if (!e.active) return;
                if (checkRectOverlap({ x: b.x, y: b.y, w: b.width, h: b.height }, { x: e.x, y: e.y, w: e.width, h: e.height })) {
                    e.active = false; b.active = false;
                }
            });
        }

        // Bullet vs Player
        if (b.owner === 'enemy') {
            if (Player.active && checkRectOverlap({ x: b.x, y: b.y, w: b.width, h: b.height }, { x: Player.x, y: Player.y, w: Player.width, h: Player.height })) {
                Player.active = false; b.active = false;
            }
        }
    });

    bullets = bullets.filter(b => b.active);
    enemies = enemies.filter(e => e.active);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    Map.draw();
    Player.draw();
    enemies.forEach(e => e.draw());
    bullets.forEach(b => b.draw());

    if (!Player.active) {
        ctx.fillStyle = '#f00';
        ctx.font = '40px "Press Start 2P"';
        ctx.fillText("GAME OVER", SCREEN_WIDTH / 2 - 140, SCREEN_HEIGHT / 2);
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

function init() {
    Input.init(); Sprites.init(); Map.init();
    gameLoopId = requestAnimationFrame(gameLoop);
}

init();
