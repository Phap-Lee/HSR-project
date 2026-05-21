import { type Paths, type Elements, type Level, type StatKey, type StatType, type LevelStats, PathsEnum } from '../../../models/type'
import { CharacterBase } from "../../../models/character.model";
import { LightCone } from '../../../models/lightcone.model';
import { Percent } from 'lucide-react';

export const LEVEL_STATS: Record<Level, LevelStats> = {
    1: {hp: 120, atk: 774, def: 54},
    2: {}
}

export class Dan_Heng implements CharacterBase {
    id: string = 'dan_heng_01';
    name: string = 'Dan Heng';
    path: Paths = PathsEnum.Hunt;
    element: Elements = 'Wind';
    level: Level = 1;
    hp: number = 0;
    atk: number = 0;
    def: number = 0;
    spd: number = 110;
    taunt: number = 75;
    maxEnergy: number = 100;
    currentEnergy: number = 0;
    traces: Record<StatKey, Record<StatType, number>>[] = [
        'Atk': 'percent': 18;
    ];
}