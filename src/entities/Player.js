import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_bee_1');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    // 物理引擎核心防空區約束：上方不超過 220px，下方不超過 585px (避免遮蓋 614px 血條 HUD)
    this.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 220, 480, 365));
    this.setSize(24, 24);
    this.setOffset(4, 4);

    this.hp = GAME_CONFIG.PLAYER.MAX_HP;
    this.maxHp = GAME_CONFIG.PLAYER.MAX_HP;
    this.bombs = GAME_CONFIG.PLAYER.START_BOMBS;
    this.isInvulnerable = false;
    this.wingTimer = 0;
    this.wingFrame = 1;

    // 按鍵映射
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyB = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
  }

  update(time, delta) {
    if (!this.active) return;

    // 拍翅動畫 (每 100ms 切換影格)
    this.wingTimer += delta;
    if (this.wingTimer > 90) {
      this.wingTimer = 0;
      this.wingFrame = this.wingFrame === 1 ? 2 : 1;
      this.setTexture(`player_bee_${this.wingFrame}`);
    }

    // 移動控制 (支援箭頭鍵與 WASD)
    let vx = 0;
    let vy = 0;
    const speed = GAME_CONFIG.PLAYER.SPEED;

    if (this.cursors.left.isDown || this.keyA.isDown) {
      vx -= speed;
    }
    if (this.cursors.right.isDown || this.keyD.isDown) {
      vx += speed;
    }
    if (this.cursors.up.isDown || this.keyW.isDown) {
      vy -= speed;
    }
    if (this.cursors.down.isDown || this.keyS.isDown) {
      vy += speed;
    }

    this.setVelocity(vx, vy);

    // 限制玩家活動範圍：上方不超過 220px，下方不超過 585px (保持在 614px 血條上方安全防空區)
    if (this.y < 220) this.y = 220;
    if (this.y > 585) this.y = 585;

    // 自動微傾斜感
    if (vx < 0) {
      this.setAngle(-12);
    } else if (vx > 0) {
      this.setAngle(12);
    } else {
      this.setAngle(0);
    }

    // 發射主武器
    if (this.keySpace.isDown) {
      this.scene.weaponSystem.fire(this.x, this.y, time);
    }

    // 發動必殺技 (花粉核爆)
    if (Phaser.Input.Keyboard.JustDown(this.keyX) || Phaser.Input.Keyboard.JustDown(this.keyB)) {
      this.useBomb();
    }
  }

  takeDamage(amount) {
    if (this.isInvulnerable || !this.active) return false;

    this.hp -= amount;
    soundManager.playHit();

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return true;
    }

    // 進入短暫無敵狀態並閃爍
    this.isInvulnerable = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        this.alpha = 1;
        this.isInvulnerable = false;
      }
    });

    return false;
  }

  useBomb() {
    if (this.bombs <= 0) return;
    this.bombs--;
    soundManager.playBomb();
    this.scene.triggerPollenSupernova();
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
    soundManager.playExplosion(true);
    this.scene.onPlayerDied();
  }
}
