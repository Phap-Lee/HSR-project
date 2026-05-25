//src\sim\calculations\damage\damage.normal.ts

import { StatKey } from "../../../models/type";
import { UnitBase } from "../../../models/unit.model";

export function BaseDamage(unit: UnitBase, stat: StatKey, ability_mult: number, extra_dmg = 0) {
    switch (stat) {
        case 'Hp':
            return unit.base_hp * ability_mult + extra_dmg;
        case 'Atk':
            return unit.base_atk * ability_mult + extra_dmg;
        case 'Def':
            return unit.base_def * ability_mult + extra_dmg;
        default:
            return 0;
    }
}

export function FullDamage(attacker: UnitBase, target: UnitBase, stat: StatKey, ability_mult: number, extra_dmg = 0) {
    
}