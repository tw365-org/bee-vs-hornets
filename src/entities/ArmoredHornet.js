import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export class ArmoredHornet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hornet_armored');
    this.hp = GAME_CONFIG.ENEMIES.ARMORED.hp;
    this.scoreValue = GAME_CONFIG.ENEMIES.ARMORED.score;
    this.shootTimer = 0;
  }

  spawn(x, y) {
    this.enableBody(true, x, y, true, true);
    this.hp = GAME_CONFIG.ENEMIES.ARMORED.hp;
    this.setVelocity(Phaser.Math.Between(-40, 40), GAME_CONFIG.ENEMIES.ARMORED.speed);
    this.shootTimer = Phaser.Math.Between(1000, 2500);
    this.alpha = 1;
  }

  update(time, delta) {
    if (!this.active) return;

    // 動態讀取物理世界邊界
    const bounds = this.scene.physics.world.bounds;

    // 碰壁反彈
    if (this.x < bounds.x + 30) {
      this.setVelocityX(Math.abs(this.body.velocity.x) || 40);
    } else if (this.x > bounds.width - 30) {
      this.setVelocityX(-Math.abs(this.body.velocity.x) || -40);
    }

    // 抵達底部重回頂端
    if (this.y > bounds.height + 30) {
      this.y = bounds.y - 30;
      this.x = Phaser.Math.Between(bounds.x + 40, bounds.width - 40);
    }

    // 定期發射三向毒針
    this.shootTimer -= delta;
    if (this.shootTimer <= 0) {
      this.shootTimer = Phaser.Math.Between(2200, 3500);
      this.fireSpread();
    }
  }

  fireSpread() {
    if (!this.active || this.y < 30 || this.y > 550) return;
    const angles = [Math.PI / 2 - 0.35, Math.PI / 2, Math.PI / 2 + 0.35];
    angles.forEach(rad => {
      this.scene.spawnEnemyBullet(this.x, this.y + 15, rad, 240);
    });
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.scene.showHitFlash(this);
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    soundManager.playExplosion(false);
    this.scene.onEnemyKilled(this);
    this.destroy();
  }
}
