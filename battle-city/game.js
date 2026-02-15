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
    brick: null, steel: null, water: null, forest: null, base: null, player: null,

    init() {
        this.brick = this.createPattern('#a03200', '#fff', 'brick');
        this.steel = this.createPattern('#c0c0c0', '#fff', 'steel');
        this.water = this.createPattern('#004058', '#fff', 'water');
        this.forest = this.createPattern('#005000', '#000', 'forest');
        this.base = this.createBase();
        this.player = this.createTank('#f8b800');
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
                else if (cell === 5) ctx.drawImage(Sprites.base, x, y); // Base destroyed?
            }
        }
        ctx.drawImage(Sprites.base, this.offsetX + 6 * TILE_SIZE, this.offsetY + 12 * TILE_SIZE);
        // Draw forest on top
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
        // Simple center point check for bullet
        const cx = rect.x + rect.w / 2 - this.offsetX;
        const cy = rect.y + rect.h / 2 - this.offsetY;
        const col = Math.floor(cx / TILE_SIZE);
        const row = Math.floor(cy / TILE_SIZE);

        if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
            const tile = this.grid[row][col];
            if (tile === 1) { // Brick
                this.grid[row][col] = 0;
                return true;
            } else if (tile === 2) { // Steel
                return true; // Hit but don't destroy
            }
        }
        return false;
    }
};

// Bullet
class Bullet {
    constructor(x, y, dir) {
        this.x = x; this.y = y; this.dir = dir;
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

        // Collision
        const rect = { x: this.x, y: this.y, w: this.width, h: this.height };
        if (Map.isSolid(rect)) {
            Map.destroyBlock(rect);
            this.active = false;
        }
    }
    draw() {
        if (!this.active) return;
        Input.init(); Sprites.init(); Map.init();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    init();
