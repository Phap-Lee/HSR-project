import type { Paths, Elements, Level, StatKey, StatType } from './type'
import { LightCone } from './lightcone.model';

export interface CharacterBase {
    id: string;
    name: string;
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
    traces: Record<StatKey, Record<StatType, number>>[];

    lc: LightCone;

    
}