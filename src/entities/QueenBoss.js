import { GAME_CONFIG } from '../config.js';
import { soundManager } from '../audio/SoundManager.js';

export class QueenBoss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hornet_queen');
    this.maxHp = GAME_CONFIG.ENEMIES.QUEEN.hp;
    this.hp = this.maxHp;
    this.scoreValue = GAME_CONFIG.ENEMIES.QUEEN.score;
    this.patternTimer = 0;
    this.spiralAngle = 0;
    this.isEnraged = false;
  }

  spawn(x, y) {
    this.enableBody(true, x, y, true, true);
    this.maxHp = GAME_CONFIG.ENEMIES.QUEEN.hp;
    this.hp = this.maxHp;
    this.isEnraged = false;
    this.setVelocity(80, 0);
    this.patternTimer = 1000;
    this.alpha = 1;
    this.setScale(1.2);
  }

  update(time, delta) {
    if (!this.active) return;

    // 左右來回移動
    if (this.x < 80) {
      this.setVelocityX(this.isEnraged ? 140 : 80);
    } else if (this.x > 400) {
      this.setVelocityX(this.isEnraged ? -140 : -80);
    }

    // 狂暴判斷 (HP < 40%)
    if (!this.isEnraged && this.hp < this.maxHp * 0.4) {
      this.isEnraged = true;
      this.setTint(0xff3333);
      soundManager.playUpgrade();
    }

    // 招式輪迴
    this.patternTimer -= delta;
    if (this.patternTimer <= 0) {
      this.patternTimer = this.isEnraged ? 1200 : 2000;
      this.castSkill();
    }
  }

  castSkill() {
    if (!this.active) return;
    const rnd = Math.random();

    if (rnd < 0.5) {
      // 招式 1: 8 方向螺旋擴散彈幕
      for (let i = 0; i < 8; i++) {
        const rad = this.spiralAngle + (i * Math.PI) / 4;
        this.scene.spawnEnemyBullet(this.x, this.y + 20, rad, 180);
      }
      this.spiralAngle += 0.25;
    } else if (rnd < 0.8) {
      // 招式 2: 直衝玩家的扇形追蹤尾針
      if (this.scene.player && this.scene.player.active) {
        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        [-0.2, 0, 0.2].forEach(offset => {
          this.scene.spawnEnemyBullet(this.x, this.y + 20, baseAngle + offset, 260);
        });
      }
    } else {
      // 招式 3: 召喚兩隻工蜂護衛
      this.scene.spawnHornetMinion(this.x - 40, this.y);
      this.scene.spawnHornetMinion(this.x + 40, this.y);
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
    soundManager.playExplosion(true);
    this.scene.onQueenDefeated(this);
    this.destroy();
  }
}
