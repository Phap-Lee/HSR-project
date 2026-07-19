import type { StatType, StatKey } from "./type";
import { Modifier } from "./modifier.model";

export interface LightCone {
    hp: number;
    atk: number;
    def: number;

    onKill?: (characterId: string) =>Modifier;
}