//src\data\characters\Wind\4 Star\DanHeng\DanHeng.base.ts

import { type Paths, type Elements, type Level, type LevelStats, PathsEnum, DamageBonusGroup, ResPenGroup, DefenceIgnoreGroup } from '../../../../../models/type'
import { CharacterBase, type TraceEntry } from "../../../../../models/character.model";
import { LightCone } from '../../../../../models/lightcone.model';
import { EnemyBase } from '../../../../../models/enemy.model';
import { Modifier } from '../../../../../models/modifier.model';
import { initializeCharacter } from '../../../../../sim/engine/constructors/characterinitializer';

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

export function createDanHengCharacter(level: Level = 1, lc?: LightCone): CharacterBase {
    return new Dan_Heng(level, lc);
}

export class Dan_Heng implements CharacterBase {
    id: string = 'dan_heng_01';
    name: string = 'Dan Heng';
    stars: 4 | 5 = 4;
    path: Paths = PathsEnum.Hunt;
    element: Elements = 'Wind';
    level: Level = 1;
    base_hp: number = 0;
    hp: number = 0;
    base_atk: number = 0;
    atk: number = 0;
    base_def: number = 0;
    def: number = 0;
    base_spd: number = 110;
    spd: number = 0;
    base_av: number = 0;
    current_av: number = 0;

    cr: number = 5;
    cdmg: number = 50;

    damageBonuses?: DamageBonusGroup | undefined;
    resPen?: ResPenGroup | undefined;
    defIgnore?: DefenceIgnoreGroup | undefined;

    base_taunt: number = 3;
    taunt_multi: number = 0;
    taunt: number = 0;
    maxEnergy: number = 100;
    currentEnergy: number = 0;
    err: number = 0;

    ehr: number = 0;
    er: number = 0;

    traces: TraceEntry[] = [
        { key: 'Atk', type: 'percent', value: 18 },
        { key: 'Def', type: 'percent', value: 12.5 },
        { key: 'Wind_DMG_Bonus', type: 'percent', value: 22.4 }
    ];
    modifiers: Modifier<CharacterBase | EnemyBase, CharacterBase | EnemyBase>[] = [];

    lc: LightCone | undefined;

    constructor(level: Level = 1, lc?: LightCone) {
        initializeCharacter(this, level, lc, { levelStats: LEVEL_STATS });
    }
}