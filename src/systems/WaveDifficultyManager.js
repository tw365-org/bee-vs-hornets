/**
 * WaveDifficultyManager.js
 * 獨立波次難度與虎頭蜂 AI 行為管理器
 *
 * 職責：
 * 1. 計算各波次難度曲線（敵機速度、敵彈速度、射擊率、血量倍率）
 * 2. 控制虎頭蜂「越位急停回馬槍 (Turn-around Backstab)」解鎖與觸發機率
 * 3. 生成波次編隊結構與兵種配置
 */

export class WaveDifficultyManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * 根據波次 wave 取得當前難度配置參數
   * @param {number} wave 當前波次 (從 1 開始)
   * @returns {Object} 難度數值包
   */
  getDifficulty(wave) {
    const isBossWave = wave % 3 === 0;

    // 1. 速度倍率：前兩波 1.0，第 3 波起每波提升 5%~8%
    const speedMultiplier = 1.0 + Math.max(0, wave - 1) * 0.06;

    // 2. 敵彈速度倍率
    const bulletSpeedMultiplier = 1.0 + Math.max(0, wave - 1) * 0.08;

    // 3. 俯衝瞬間射擊機率 (基礎 0.4，隨波次逐步上升至上限 0.85)
    const shootChance = Math.min(0.85, 0.4 + (wave - 1) * 0.08);

    // 4. 越位急停回馬槍 (Turn-around Attack) 機率
    // 波次 1~2 為 0% (新手暖身)，第 3 波開始 30%，往後每波 +15%，上限 75%
    let turnAroundChance = 0;
    if (wave >= 3) {
      turnAroundChance = Math.min(0.75, 0.3 + (wave - 3) * 0.15);
    }

    // 5. 敵機血量加成 (第 4 波開始每波微幅增加基礎 HP，讓高階武器有用武之地)
    const hpBonus = wave >= 4 ? Math.floor((wave - 3) / 2) : 0;

    // 6. 普通波次的敵機生成數量
    const enemyCount = Math.min(14, 5 + wave * 2);

    return {
      wave,
      isBossWave,
      speedMultiplier,
      bulletSpeedMultiplier,
      shootChance,
      turnAroundChance,
      hpBonus,
      enemyCount,
    };
  }

  /**
   * 取得特定波次的編隊陣型配置
   * @param {number} wave 
   * @returns {Array<{type: 'HORNET'|'ARMORED', x: number, y: number}>}
   */
  getWaveFormation(wave) {
    const diff = this.getDifficulty(wave);
    const formation = [];
    const count = diff.enemyCount;

    for (let i = 0; i < count; i++) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = 70 + col * 68;
      const y = 80 + row * 55;

      // 第 2 波之後交錯配置裝甲蜂
      let type = 'HORNET';
      if (wave >= 2 && i % 3 === 0) {
        type = 'ARMORED';
      }

      formation.push({ type, x, y });
    }

    return formation;
  }
}
