const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, WorldScene, BattleScene]
};

const game = new Phaser.Game(config);

// =========================
// BOOT SCENE
// =========================
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.image('tiles', 'https://labs.phaser.io/assets/games/rpg/tiles.png');
    this.load.tilemapTiledJSON('map', {
      "height": 100, "width": 100, "tileheight": 16, "tilewidth": 16,
      "layers": [{ "data": Array(10000).fill(0), "height": 100, "width": 100, "name": "Ground", "type": "tilelayer", "visible": true, "x": 0, "y": 0 }],
      "tilesets": [{ "firstgid": 1, "source": "" }]
    });
    this.load.spritesheet('hero', 'https://i.imgur.com/5Iuf6jD.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('slime', 'https://i.imgur.com/5Iuf6jD.png');
    this.load.image('goblin', 'https://i.imgur.com/5Iuf6jD.png');
    this.load.image('dragon', 'https://i.imgur.com/5Iuf6jD.png');
  }
  create() { this.scene.start('World'); }
}

// =========================
// WORLD SCENE
// =========================
class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }
  create() {
    this.player = { x: 50, y: 50, level: 1, hp: 30, maxHp: 30, xp: 0, gold: 0, spells: [], inventory: [] };
    this.cameras.main.setZoom(2);
    this.cameras.main.centerOn(this.player.x * 16, this.player.y * 16);

    const map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
    const tileset = map.addTilesetImage('tiles');
    const layer = map.createLayer(0, tileset, 0, 0);
    this.createRegions(layer);

    this.hero = this.add.sprite(this.player.x * 16 + 8, this.player.y * 16 + 8, 'hero').setDepth(10);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.mathInput = document.getElementById('math-input');
    this.mathInput.style.display = 'none';

    this.saveGame();
  }

  createRegions(layer) {
    this.regions = [
      { name: "Meadow",  color: 0x90EE90, difficulty: 1, x: 0,  y: 0,  w: 40, h: 40 },
      { name: "Forest",  color: 0x228B22, difficulty: 2, x: 40, y: 0,  w: 40, h: 40 },
      { name: "Mountain",color: 0x808080, difficulty: 3, x: 0,  y: 40, w: 40, h: 40 },
      { name: "Volcano", color: 0x8B0000, difficulty: 4, x: 60, y: 60, w: 40, h: 40 }
    ];
    const gfx = this.add.graphics();
    this.regions.forEach(r => {
      gfx.fillStyle(r.color, 0.2);
      gfx.fillRect(r.x * 16, r.y * 16, r.w * 16, r.h * 16);
    });
  }

  getRegionAt(x, y) {
    return this.regions.find(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) || this.regions[0];
  }

  update() {
    const speed = 1;
    if (this.moving) return;
    let moved = false;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) { this.player.x--; moved = true; }
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) { this.player.x++; moved = true; }
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) { this.player.y--; moved = true; }
    else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) { this.player.y++; moved = true; }

    if (moved) {
      this.player.x = Phaser.Math.Clamp(this.player.x, 0, 99);
      this.player.y = Phaser.Math.Clamp(this.player.y, 0, 99);
      this.hero.x = this.player.x * 16 + 8;
      this.hero.y = this.player.y * 16 + 8;
      this.cameras.main.centerOn(this.hero.x, this.hero.y);
      this.moving = true;
      this.time.delayedCall(200, () => { this.moving = false; this.checkEncounter(); });
    }
  }

  checkEncounter() {
    const region = this.getRegionAt(this.player.x, this.player.y);
    const chance = region.difficulty * 0.05;
    if (Math.random() < chance) {
      const enemy = this.generateEnemy(region.difficulty);
      this.scene.start('Battle', { player: this.player, enemy, world: this });
    }
  }

  generateEnemy(diff) {
    const types = [
      { name: "Slime", hp: 10, atk: 3, xp: 10, img: 'slime', diff: 1 },
      { name: "Goblin", hp: 20, atk: 6, xp: 25, img: 'goblin', diff: 2 },
      { name: "Orc", hp: 35, atk: 10, xp: 50, img: 'goblin', diff: 3 },
      { name: "Dragon", hp: 60, atk: 15, xp: 100, img: 'dragon', diff: 4 }
    ];
    const pool = types.filter(t => t.diff <= diff);
    return Phaser.Utils.Array.GetRandom(pool);
  }

  saveGame() {
    localStorage.setItem('mathquest_save', JSON.stringify(this.player));
  }
}

// =========================
// BATTLE SCENE
// =========================
class BattleScene extends Phaser.Scene {
  constructor() { super('Battle'); }
  init(data) {
    this.player = data.player;
    this.enemy = data.enemy;
    this.world = data.world;
    this.correctAnswer = null;
    this.currentQuestion = null;
  }

  create() {
    this.add.text(400, 50, `VS ${this.enemy.name}!`, { font: '32px Arial', color: '#fff' }).setOrigin(0.5);
    this.add.sprite(200, 200, this.enemy.img).setScale(3);
    this.add.sprite(600, 300, 'hero').setScale(3);

    this.playerHpText = this.add.text(550, 400, `HP: ${this.player.hp}/${this.player.maxHp}`, { font: '20px Arial' });
    this.enemyHpText = this.add.text(150, 150, `HP: ${this.enemy.hp}`, { font: '20px Arial' });

    this.menu = this.add.text(400, 500, '1. Attack  2. Spell  3. Item  4. Flee', { font: '20px Arial', color: '#ff0' }).setOrigin(0.5);
    this.input.keyboard.on('keydown-ONE', () => this.playerAction('attack'));
    this.input.keyboard.on('keydown-TWO', () => this.playerAction('spell'));
    this.input.keyboard.on('keydown-THREE', () => this.playerAction('item'));
    this.input.keyboard.on('keydown-FOUR', () => this.playerAction('flee'));

    this.askMathQuestion();
  }

  askMathQuestion() {
    const diff = this.enemy.diff || 1;
    const ops = ['+', '-', '*', '/'];
    const op = Phaser.Utils.Array.GetRandom(ops.slice(0, Math.min(diff, 4)));
    let a, b, q, ans;

    if (op === '+') { a = Phaser.Math.Between(1, 5 * diff); b = Phaser.Math.Between(1, 5 * diff); q = `${a} + ${b}`; ans = a + b; }
    else if (op === '-') { a = Phaser.Math.Between(5, 10 * diff); b = Phaser.Math.Between(1, a-1); q = `${a} - ${b}`; ans = a - b; }
    else if (op === '*') { a = Phaser.Math.Between(1, Math.min(12, 3 + diff*2)); b = Phaser.Math.Between(1, Math.min(12, 3 + diff*2)); q = `${a} × ${b}`; ans = a * b; }
    else if (op === '/') { b = Phaser.Math.Between(1, 12); a = b * Phaser.Math.Between(1, Math.min(12, 3 + diff)); q = `${a} ÷ ${b}`; ans = a / b; }

    this.currentQuestion = q;
    this.correctAnswer = ans;
    this.mathInput.style.display = 'block';
    this.mathInput.value = '';
    this.mathInput.focus();

    this.mathInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const input = parseInt(this.mathInput.value);
        this.mathInput.style.display = 'none';
        if (input === this.correctAnswer) {
          this.add.text(400, 300, 'CORRECT!', { font: '28px Arial', color: '#0f0' }).setOrigin(0.5).setDepth(100);
          this.time.delayedCall(800, () => this.resolvePlayerAction());
        } else {
          this.add.text(400, 300, 'WRONG!', { font: '28px Arial', color: '#f00' }).setOrigin(0.5).setDepth(100);
          this.time.delayedCall(800, () => this.enemyTurn());
        }
      }
    };
  }

  playerAction(type) {
    if (this.resolving) return;
    this.actionType = type;
    this.askMathQuestion();
  }

  resolvePlayerAction() {
    if (this.actionType === 'attack') {
      const dmg = Phaser.Math.Between(5, 10) + this.player.level * 2;
      this.enemy.hp -= dmg;
      this.enemyHpText.setText(`HP: ${this.enemy.hp}`);
      this.add.text(200, 180, `-${dmg}`, { color: '#fff', font: '20px Arial' });
    } else if (this.actionType === 'flee') {
      if (Math.random() < 0.7) {
        this.add.text(400, 300, 'Fled successfully!', { color: '#0f0' }).setOrigin(0.5);
        this.time.delayedCall(1000, () => this.scene.start('World', { player: this.player }));
        return;
      } else {
        this.add.text(400, 300, 'Failed to flee!', { color: '#f00' }).setOrigin(0.5);
      }
    }

    if (this.enemy.hp <= 0) {
      this.victory();
    } else {
      this.time.delayedCall(800, () => this.enemyTurn());
    }
  }

  enemyTurn() {
    const dmg = Phaser.Math.Between(this.enemy.atk - 2, this.enemy.atk + 2);
    this.player.hp -= dmg;
    this.playerHpText.setText(`HP: ${this.player.hp}/${this.player.maxHp}`);
    this.add.text(600, 280, `-${dmg}`, { color: '#f00', font: '20px Arial' });

    if (this.player.hp <= 0) {
      this.gameOver();
    } else {
      this.time.delayedCall(800, () => this.askMathQuestion());
    }
  }

  victory() {
    this.player.xp += this.enemy.xp;
    this.player.gold += Phaser.Math.Between(5, 15);
    this.checkLevelUp();
    this.add.text(400, 300, `Victory! +${this.enemy.xp} XP`, { color: '#0f0', font: '28px Arial' }).setOrigin(0.5);
    this.world.saveGame();
    this.time.delayedCall(1500, () => this.scene.start('World', { player: this.player }));
  }

  checkLevelUp() {
    const thresholds = [0, 50, 150, 300, 600, 1000];
    const newLevel = thresholds.findIndex(t => this.player.xp < t);
    if (newLevel > this.player.level) {
      this.player.level = newLevel;
      this.player.maxHp += 15;
      this.player.hp = this.player.maxHp;
      this.player.spells = this.player.level >= 2 ? ['Calculate'] : [];
      if (this.player.level >= 3) this.player.spells.push('Heal');
      if (this.player.level >= 4) this.player.spells.push('Compute');
      if (this.player.level >= 5) this.player.spells.push('Light');
      this.add.text(400, 350, `LEVEL UP! Level ${this.player.level}`, { color: '#ff0', font: '24px Arial' }).setOrigin(0.5);
    }
  }

  gameOver() {
    this.add.text(400, 300, 'GAME OVER', { font: '40px Arial', color: '#f00' }).setOrigin(0.5);
    this.time.delayedCall(2000, () => location.reload());
  }
}