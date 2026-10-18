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

    // 4. 敵機與子彈群組
    this.enemyGroup = this.physics.add.group({ runChildUpdate: true });
    this.enemyBulletGroup = this.physics.add.group();

    // 5. 抬頭顯示器 HUD
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

    // 清理越界的敵方子彈
    this.enemyBulletGroup.getChildren().forEach(b => {
      if (b.active && (b.y > 660 || b.y < -20 || b.x < -20 || b.x > 500)) {
        b.destroy();
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
    const bullet = this.physics.add.sprite(x, y, 'bullet_enemy');
    this.enemyBulletGroup.add(bullet);
    this.physics.velocityFromRotation(angle, speed, bullet.body.velocity);
    bullet.rotation = angle - Math.PI / 2;
  }

  // 命中敵機
  handleBulletHitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;

    if (!bullet.piercing) {
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
    bullet.destroy();
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

    // 產生大量金色花粉粒子
    for (let i = 0; i < 45; i++) {
      const p = this.add.sprite(
        Phaser.Math.Between(20, 460),
        Phaser.Math.Between(50, 600),
        'particle_pollen'
      ).setDepth(210);
      this.tweens.add({
        targets: p,
        scale: { from: 2.5, to: 0.2 },
        alpha: { from: 1, to: 0 },
        y: p.y - Phaser.Math.Between(40, 100),
        duration: Phaser.Math.Between(600, 1200),
        onComplete: () => p.destroy()
      });
    }

    // 清除全屏敵彈
    this.enemyBulletGroup.clear(true, true);

    // 重創或秒殺場上所有普通敵蜂
    this.enemyGroup.getChildren().forEach(enemy => {
      if (enemy.active) {
        if (enemy === this.currentBoss) {
          enemy.takeDamage(200);
        } else {
          enemy.takeDamage(120);
        }
      }
    });
  }

  showHitFlash(sprite) {
    sprite.setTint(0xffffff);
    this.time.delayedCall(60, () => {
      if (sprite.active) sprite.clearTint();
    });
  }

  createExplosionParticles(x, y, color = 0xffaa00, count = 12) {
    for (let i = 0; i < count; i++) {
      const p = this.add.rectangle(x, y, 4, 4, color).setDepth(150);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.FloatBetween(20, 60);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(250, 450),
        onComplete: () => p.destroy()
      });
    }
  }

  onPlayerDied() {
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { score: this.score, wave: this.wave });
    });
  }
}
