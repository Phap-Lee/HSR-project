import { type Paths, type Elements, type Level, type StatKey, type StatType, type LevelStats, PathsEnum } from '../../../../../models/type'
import { CharacterBase, type TraceEntry } from "../../../../../models/character.model";
import { LightCone } from '../../../../../models/lightcone.model';

export const LEVEL_STATS: Record<Level, LevelStats> = {
    1: {hp: 120, atk: 774, def: 54},
    20: {hp: 234, atk: 145, def: 105},
    '20+': {hp: 282, atk: 174, def: 126},
    30: {hp: 342, atk: 212, def: 153},
    '30+': {hp: 390, atk: 241, def: 175},
    40: {hp: 450, atk: 279, def: 202},
    '40+': {hp: 498, atk: 308, def: 224},
    50: {hp: 558, atk: 345, def: 251},
    '50+': {hp: 606, atk: 375, def: 272},
    60: {hp: 666, atk: 412, def: 299},
    '60+': {hp: 714, atk: 442, def: 321},
    70: {hp: 774, atk: 479, def: 348},
    '70+': {hp: 822, atk: 509, def: 369},
    80: {hp: 882, atk: 546, def: 396}
}

export class Dan_Heng implements CharacterBase {
    id: string = 'dan_heng_01';
    name: string = 'Dan Heng';
    stars: 4 | 5 = 4;
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
    err: number = 0;
    traces: TraceEntry[] = [
        { key: 'Atk', type: 'percent', value: 18 },
        { key: 'Def', type: 'percent', value: 12.5 },
        { key: 'Wind_DMG_Bonus', type: 'percent', value: 22.4 }
    ]

    lc?: LightCone;

    constructor(level: Level = 1, lc?: LightCone) {
        this.level = level;
        const stats = LEVEL_STATS[level];
        this.lc = lc;

        this.hp = stats.hp + (this.lc?.hp ?? 0);
        this.atk = stats.atk + (this.lc?.atk ?? 0);
        this.def = stats.def + (this.lc?.def ?? 0);
        this.currentEnergy = this.maxEnergy / 2;


    }
}