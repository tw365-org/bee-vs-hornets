/**
 * 快照範圍傷害純函式 (防止迭代中 splice 漏殺)
 * @param {Array} targets
 * @param {number} damage
 * @param {Function} isActive
 * @param {Function} applyDamage
 * @returns {number} 實際受到傷害的目標數
 */
export function applyAreaDamage(targets, damage, isActive, applyDamage) {
  let count = 0;
  // 透過 slice() 快照，安全避開迭代中 splice 造成索引位移漏殺
  targets.slice().forEach(target => {
    if (isActive(target)) {
      applyDamage(target, damage);
      count++;
    }
  });
  return count;
}
