import test from 'node:test';
import assert from 'node:assert/strict';

import { applyAreaDamage } from '../src/logic/areaDamage.js';
import { createOnceHitTracker } from '../src/logic/onceHitTracker.js';
import { shouldSummonMinions } from '../src/logic/minionCap.js';
import { getDifficulty } from '../src/logic/difficulty.js';

test('1. applyAreaDamage: 7 隻工蜂(HP 20) 核爆120 後，應 100% 全部被處理 (無漏殺)', () => {
  class MockGroup {
    constructor() {
      this.entries = [];
    }
    add(item) {
      this.entries.push(item);
    }
    delete(item) {
      const idx = this.entries.indexOf(item);
      if (idx > -1) this.entries.splice(idx, 1);
    }
  }

  const group = new MockGroup();
  for (let i = 0; i < 7; i++) {
    group.add({ id: i, hp: 20, active: true });
  }

  const processed = applyAreaDamage(
    group.entries,
    120,
    target => target.active,
    (target, dmg) => {
      target.hp -= dmg;
      if (target.hp <= 0) {
        target.active = false;
        group.delete(target);
      }
    }
  );

  assert.equal(processed, 7, '應處理全部 7 隻工蜂');
  assert.equal(group.entries.length, 0, '所有工蜂皆應被消滅，無遺漏殘留');
});

test('2. onceHitTracker: 單一目標第二次 tryHit 應回傳 false，不同目標互不影響', () => {
  const tracker = createOnceHitTracker();
  const enemyA = { name: 'Hornet-A' };
  const enemyB = { name: 'Hornet-B' };

  assert.equal(tracker.tryHit(enemyA), true, '第一下命中應為 true');
  assert.equal(tracker.tryHit(enemyA), false, '同一目標第二幀命中應為 false');
  assert.equal(tracker.tryHit(enemyB), true, '不同目標 B 第一下命中應為 true');
  assert.equal(tracker.tryHit(enemyB), false, '目標 B 重複判定應為 false');
});

test('3. shouldSummonMinions: 活躍護衛 <= 4 時允許召喚，5 以上禁止召喚', () => {
  assert.equal(shouldSummonMinions(0), true);
  assert.equal(shouldSummonMinions(4), true);
  assert.equal(shouldSummonMinions(5), false);
  assert.equal(shouldSummonMinions(6), false);
});

test('4. getDifficulty: 驗證難度數值公式與 Boss 波次判定', () => {
  const w1 = getDifficulty(1);
  assert.equal(w1.speedMultiplier, 1.0);
  assert.equal(w1.isBossWave, false);
  assert.equal(w1.turnAroundChance, 0);

  const w2 = getDifficulty(2);
  assert.equal(Math.round(w2.speedMultiplier * 100) / 100, 1.06);
  assert.equal(w2.isBossWave, false);

  const w3 = getDifficulty(3);
  assert.equal(Math.round(w3.speedMultiplier * 100) / 100, 1.12);
  assert.equal(w3.isBossWave, true, '第 3 波應為 Boss 戰');
  assert.equal(w3.turnAroundChance, 0.3, '第 3 波起解鎖回馬槍 (30%)');

  const w6 = getDifficulty(6);
  assert.equal(w6.isBossWave, true, '第 6 波應為 Boss 戰');
});
