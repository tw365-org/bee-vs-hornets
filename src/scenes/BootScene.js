import { TextureGenerator } from '../gfx/TextureGenerator.js';
import { soundManager } from '../audio/SoundManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // 1. 動態生成所有像素紋理
    TextureGenerator.generateAll(this);

    // 2. 初始化音效系統 (於使用者第一次點擊時解鎖音效上下文)
    this.input.keyboard.on('keydown', () => {
      soundManager.init();
    });
    this.input.on('pointerdown', () => {
      soundManager.init();
    });

    // 3. 進入標題選單
    this.scene.start('MenuScene');
  }
}
