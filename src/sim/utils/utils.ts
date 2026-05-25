//src\sim\utils\ultils.ts

import { UnitBase } from "../../models/unit.model";
import { type StatKey } from "../../models/type";
import { EnemyBase } from "../../models/enemy.model";

type Totals = { flat: number; percent: number };

export function getTotalsForStat(unit: UnitBase, stat: StatKey): Totals {
  const mods = unit.modifiers.filter((mod) => mod.stat === stat);
  const traces = (unit.traces ?? []).filter((trace) => trace.key === stat);

  return [...mods, ...traces].reduce(
    (acc, item) => {
      if (item.type === 'flat') acc.flat += item.value;
      else acc.percent += item.value;
      return acc;
    },
    { flat: 0, percent: 0 }
  );
}

export function getEffectiveStat(unit: UnitBase, stat: StatKey, baseValue: number) {
  const { flat, percent } = getTotalsForStat(unit, stat);
  return Math.max(0, baseValue * (1 + percent / 100) + flat);
}

export function isBroken(enemy: EnemyBase) {
    return enemy.toughness <= 0
}