import { GAME_CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const phaserConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: GAME_CONFIG.PARENT,
  pixelArt: true, // 啟用像素銳利渲染，關閉雙線性過濾
  backgroundColor: '#0a0a10',
  input: {
    gamepad: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

// 等待 Web Fonts 載入就緒後再啟動 Phaser，防止以 fallback 字型繪製被快取
window.addEventListener('DOMContentLoaded', async () => {
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check bypassed:', e);
    }
  }
  new Phaser.Game(phaserConfig);
});
