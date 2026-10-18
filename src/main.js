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
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

// 實例化遊戲
window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(phaserConfig);
});
