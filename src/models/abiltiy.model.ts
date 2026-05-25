import { Modifier } from "./modifier.model";
import { type AbilityType } from "./type";

export interface Ability {
    type: AbilityType[];
    hits: AbilityHits[];
    total_multi: number;
    modifier?: Modifier;
}

export interface AbilityHits {
    value: number;
    multi: number;
}