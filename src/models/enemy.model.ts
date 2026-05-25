//src\models\enemy.model.ts

import { type Elements } from "./type";
import { UnitBase } from "./unit.model";

export interface EnemyBase extends UnitBase {
    level: 80 | 90;
    weakness: Elements[];
    base_toughness: number;
    toughness: number;
    spd_multi: number;
}