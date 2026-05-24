//src\models\character.model.ts

import type { Paths, Elements, Level, StatKey, StatType } from './type'
import { LightCone } from './lightcone.model';

// Base character interface
export interface CharacterBase {
    id: string;
    name: string;
    stars: 4 | 5;
    path: Paths;
    element: Elements;
    level: Level;
    hp: number;
    atk: number;
    def: number;
    spd: number;
    taunt: number;
    maxEnergy: number;
    currentEnergy: number;
    err: number;
    traces: TraceEntry[];

    lc?: LightCone;

    
}

// Trace entry interface
export type TraceEntry = {
    key: StatKey;
    type: StatType;
    value: number;
};