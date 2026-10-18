import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export class Hornet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hornet_normal');
    this.hp = GAME_CONFIG.ENEMIES.HORNET.hp;
    this.scoreValue = GAME_CONFIG.ENEMIES.HORNET.score;
    this.state = 'FLYING'; // 'FLYING', 'DIVING', 'RETURNING'
    this.diveTimer = 0;
    this.initialX = x;
    this.initialY = y;
    this.patrolTimer = Math.random() * 100;
  }

  spawn(x, y) {
    this.enableBody(true, x, y, true, true);
    this.hp = GAME_CONFIG.ENEMIES.HORNET.hp;
    this.state = 'FLYING';
    this.initialX = x;
    this.initialY = y;
    this.diveTimer = Phaser.Math.Between(2000, 6000);
    this.patrolTimer = Math.random() * 100;
    this.setVelocity(0, 0);
    this.rotation = 0;
    this.alpha = 1;
  }

  update(time, delta) {
    if (!this.active) return;

    if (this.state === 'FLYING') {
      this.patrolTimer += delta * 0.003;
      // 左右小幅編隊飄移
      this.x = this.initialX + Math.sin(this.patrolTimer) * 45;
      this.y = this.initialY + Math.cos(this.patrolTimer * 0.8) * 15;

      this.diveTimer -= delta;
      if (this.diveTimer <= 0) {
        this.startDive();
      }
    } else if (this.state === 'DIVING') {
      // 俯衝超出版面則由頂端重新歸隊
      if (this.y > 660) {
        this.y = -20;
        this.x = this.initialX;
        this.setVelocity(0, 80);
      } else if (this.y < this.initialY && this.body.velocity.y > 0) {
        // 回到初始高度
        this.state = 'FLYING';
        this.diveTimer = Phaser.Math.Between(3000, 7000);
        this.setVelocity(0, 0);
        this.rotation = 0;
      }
    }
  }

  startDive() {
    this.state = 'DIVING';
    const player = this.scene.player;
    if (player && player.active) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.rotation = angle - Math.PI / 2;
      this.scene.physics.velocityFromRotation(angle, GAME_CONFIG.ENEMIES.HORNET.speed * 1.5, this.body.velocity);
      
      // 俯衝瞬間有 50% 機率射出一發尾針
      if (Math.random() < 0.5) {
        this.scene.spawnEnemyBullet(this.x, this.y + 10, angle);
      }
    } else {
      this.setVelocity(0, GAME_CONFIG.ENEMIES.HORNET.speed);
    }
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
