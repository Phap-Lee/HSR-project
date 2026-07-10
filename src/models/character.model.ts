//src\models\character.model.ts

import type { Paths, Elements, Level, StatKey, StatType } from './type'
import type { Ability } from './abiltiy.model';
import { LightCone } from './lightcone.model';
import { UnitBase } from './unit.model';

// Base character interface
export interface CharacterBase extends UnitBase {
    stars: 4 | 5;
    path: Paths;
    element: Elements;
    level: Level;
    base_taunt: number;
    taunt_multi: number;
    taunt: number;
    maxEnergy: number;
    currentEnergy: number;
    err: number;
    cr: number;
    cdmg: number;

    abilities?: Ability[];
    lc?: LightCone;
}

// Trace entry interface
export type TraceEntry = {
    key: StatKey;
    type: StatType;
    value: number;
};