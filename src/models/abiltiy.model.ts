//src\models\abiltiy.model.ts

import { Modifier } from "./modifier.model";
import { type AbilityType } from "./type";

export interface Ability {
    type: AbilityType[];
    hits?: AbilityHits[];
    total_multi?: number;
    total_toughnessDmg?: number;
    total_energy: number;
    modifier?: Modifier;
    spCost?: number;
    spGain?: number;
}

export interface AbilityHits {
    value: number;
    multi: number;
    toughnessDmg: number;
    energy: number;
}