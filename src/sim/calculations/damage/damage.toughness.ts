//src\sim\calculations\damage\damage.toughness.ts

import { EnemyBase } from "../../../models/enemy.model";

export function isBroken(enemy: EnemyBase) {
    return enemy.toughness <= 0
}