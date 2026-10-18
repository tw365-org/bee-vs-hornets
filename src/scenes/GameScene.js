import { GAME_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Hornet } from '../entities/Hornet.js';
import { ArmoredHornet } from '../entities/ArmoredHornet.js';
import { QueenBoss } from '../entities/QueenBoss.js';
import { WeaponSystem } from '../weapons/WeaponSystem.js';
import { HUD } from '../ui/HUD.js';
import { soundManager } from '../audio/SoundManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    this.wave = 1;
    this.bossActive = false;
    this.currentBoss = null;
    this.stars = [];

    // 1. 動態視差星空背景
    this.createStarfield();

    // 2. 玩家實體
    this.player = new Player(this, 240, 560);

    // 3. 重武器系統
    this.weaponSystem = new WeaponSystem(this);

    // 4. 敵機與子彈群組（子彈啟用物件池 maxSize 與回收機制）
    this.enemyGroup = this.physics.add.group({ runChildUpdate: true });
    this.enemyBulletGroup = this.physics.add.group({
      maxSize: 80,
      runChildUpdate: false
    });

    // 5. 原生高性能粒子發射器（零 GC 浪費）
    this.sparkParticles = this.add.particles(0, 0, 'particle_spark', {
      speed: { min: -120, max: 120 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 250, max: 450 },
      emitting: false
    }).setDepth(150);

    this.pollenParticles = this.add.particles(0, 0, 'particle_pollen', {
      speed: { min: -180, max: 180 },
      scale: { start: 2.2, end: 0.2 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 500, max: 1000 },
      emitting: false
    }).setDepth(210);

    // 6. 抬頭顯示器 HUD
    this.hud = new HUD(this);
    this.hud.updateScore(this.score);
    this.hud.updateWeapon(this.weaponSystem.getCurrentWeaponConfig());
    this.hud.updateHp(this.player.hp, this.player.maxHp);
    this.hud.updateBombs(this.player.bombs);

    // 6. 物理碰撞監聽
    this.physics.add.overlap(
      this.weaponSystem.bullets,
      this.enemyGroup,
      this.handleBulletHitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemyGroup,
      this.handlePlayerHitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemyBulletGroup,
      this.handlePlayerHitBullet,
      null,
      this
    );

    // 7. 啟動波次敵人生成器
    this.spawnNextWave();
  }

  createStarfield() {
    for (let i = 0; i < 50; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, 480),
        Phaser.Math.Between(0, 640),
        Phaser.Math.Between(1, 2),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Math.random() * 0.8 + 0.2
      );
      star.speed = Phaser.Math.Between(30, 140);
      this.stars.push(star);
    }
  }

  update(time, delta) {
    // 捲動星空
    this.stars.forEach(s => {
      s.y += (s.speed * delta) / 1000;
      if (s.y > 640) {
        s.y = 0;
        s.x = Phaser.Math.Between(0, 480);
      }
    });

    // 更新玩家
    if (this.player && this.player.active) {
      this.player.update(time, delta);
      this.hud.updateHp(this.player.hp, this.player.maxHp);
    }

    // 清理越界的敵方子彈（回收進物件池，零 GC 負擔）
    const bounds = this.physics.world.bounds;
    this.enemyBulletGroup.getChildren().forEach(b => {
      if (b.active && (b.y > bounds.height + 30 || b.y < bounds.y - 30 || b.x < bounds.x - 30 || b.x > bounds.width + 30)) {
        b.setActive(false);
        b.setVisible(false);
        b.body.stop();
      }
    });

    // 檢查波次敵人是否已清空
    if (!this.bossActive && this.enemyGroup.countActive(true) === 0) {
      this.wave++;
      this.spawnNextWave();
    }
  }

  spawnNextWave() {
    // 依波次遞增難度
    if (this.wave % 3 === 0) {
      // 每 3 波出現一次女王 Boss
      this.spawnQueenBoss();
    } else {
      // 標準群蜂編隊 (5 ~ 12 隻)
      const count = Math.min(12, 4 + this.wave * 2);
      for (let i = 0; i < count; i++) {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x = 70 + col * 68;
        const y = 80 + row * 55;

        // 第 2 波之後加入裝甲蜂
        if (this.wave > 1 && i % 3 === 0) {
          const armored = new ArmoredHornet(this, x, y);
          this.enemyGroup.add(armored, true);
          armored.spawn(x, y);
        } else {
          const hornet = new Hornet(this, x, y);
          this.enemyGroup.add(hornet, true);
          hornet.spawn(x, y);
        }
      }
    }
  }

  spawnQueenBoss() {
    this.bossActive = true;
    this.currentBoss = new QueenBoss(this, 240, 110);
    this.enemyGroup.add(this.currentBoss, true);
    this.currentBoss.spawn(240, 110);
    this.hud.showBossHp(true, this.currentBoss.hp, this.currentBoss.maxHp);
  }

  spawnHornetMinion(x, y) {
    const minion = new Hornet(this, x, y);
    this.enemyGroup.add(minion, true);
    minion.spawn(x, y);
  }

  spawnEnemyBullet(x, y, angle, speed = 200) {
    let bullet = this.enemyBulletGroup.get(x, y, 'bullet_enemy');
    if (bullet) {
      bullet.enableBody(true, x, y, true, true);
      this.physics.velocityFromRotation(angle, speed, bullet.body.velocity);
      bullet.rotation = angle - Math.PI / 2;
    }
  }

  // 命中敵機
  handleBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    if (bullet.piercing) {
      if (bullet.hitTargets.has(enemy)) return;
      bullet.hitTargets.add(enemy);
    } else {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.stop();
    }

    soundManager.playHit();
    enemy.takeDamage(bullet.damage);

    // 如果是 Boss，更新 Boss 血條
    if (this.bossActive && enemy === this.currentBoss) {
      this.hud.showBossHp(true, enemy.hp, enemy.maxHp);
    }
  }

  // 玩家撞擊敵機
  handlePlayerHitEnemy(player, enemy) {
    if (!player.active || !enemy.active || player.isInvulnerable) return;
    player.takeDamage(25);
    enemy.takeDamage(40);
  }

  // 玩家被敵彈擊中
  handlePlayerHitBullet(player, bullet) {
    if (!player.active || !bullet.active || player.isInvulnerable) return;
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();
    player.takeDamage(20);
  }

  // 擊殺敵機後給分與升級檢查
  onEnemyKilled(enemy) {
    this.addScore(enemy.scoreValue || 100);
    this.createExplosionParticles(enemy.x, enemy.y, 0xff5500);
  }

  onQueenDefeated(boss) {
    this.addScore(boss.scoreValue || 2500);
    this.bossActive = false;
    this.currentBoss = null;
    this.hud.showBossHp(false);
    this.createExplosionParticles(boss.x, boss.y, 0xff00ff, 35);

    // 獎勵全場加分與回血
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
    if (this.player.bombs < GAME_CONFIG.PLAYER.MAX_BOMBS) {
      this.player.bombs++;
      this.hud.updateBombs(this.player.bombs);
    }
  }

  addScore(points) {
    this.score += points;
    this.hud.updateScore(this.score);

    // 檢查武器升級里程碑
    const upgraded = this.weaponSystem.checkUpgrade(this.score);
    if (upgraded) {
      this.hud.updateWeapon(upgraded);
      this.hud.showUpgradeBanner(upgraded);
    }
  }

  // 花粉必殺技核爆
  triggerPollenSupernova() {
    this.hud.updateBombs(this.player.bombs);

    // 全屏白閃
    const flash = this.add.rectangle(240, 320, 480, 640, 0xffffff, 0.9).setDepth(300);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 350,
      onComplete: () => flash.destroy()
    });

    // 透過原生粒子發射器爆發金色花粉暴風（零 GC 物件建立開銷）
    for (let i = 0; i < 8; i++) {
      const px = Phaser.Math.Between(40, 440);
      const py = Phaser.Math.Between(100, 550);
      this.pollenParticles.emitParticleAt(px, py, 6);
    }

    // 清除全屏敵彈（回收進物件池，而非 destroy）
    this.enemyBulletGroup.getChildren().forEach(b => {
      if (b.active) {
        b.setActive(false);
        b.setVisible(false);
        b.body.stop();
      }
    });

    // 重創或秒殺場上所有普通敵蜂
    this.enemyGroup.getChildren().forEach(enemy => {
      if (enemy.active) {
        if (enemy === this.currentBoss) {
          enemy.takeDamage(200);
          if (this.bossActive && this.currentBoss) {
            this.hud.showBossHp(true, this.currentBoss.hp, this.currentBoss.maxHp);
          }
        } else {
          enemy.takeDamage(120);
        }
      }
    });
  }

  showHitFlash(sprite) {
    sprite.setTint(0xffffff);
    this.time.delayedCall(60, () => {
      if (!sprite.active) return;
      if (sprite.isEnraged) {
        sprite.setTint(0xff3333);
      } else {
        sprite.clearTint();
      }
    });
  }

  createExplosionParticles(x, y, color = 0xffaa00, count = 12) {
    // 改用原生高效發射器，零 Allocation
    this.sparkParticles.emitParticleAt(x, y, count);
  }

  onPlayerDied() {
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { score: this.score, wave: this.wave });
    });
  }
}
