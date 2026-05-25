//src\sim\calculations\effectchances.ts

import { UnitBase } from "../../models/unit.model";

export function EffectHitChance(attacker: UnitBase, target: UnitBase, base: number) {
    return base * (1 + (attacker.ehr / 100)) * (1 - (target.er / 100))
}