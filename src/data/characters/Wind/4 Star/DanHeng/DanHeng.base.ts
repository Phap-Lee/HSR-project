//src\data\characters\Wind\4 Star\DanHeng\DanHeng.base.ts

import { type Paths, type Elements, type Level, type StatKey, type StatType, type LevelStats, PathsEnum } from '../../../../../models/type'
import { CharacterBase, type TraceEntry } from "../../../../../models/character.model";
import { LightCone } from '../../../../../models/lightcone.model';
import { EnemyBase } from '../../../../../models/enemy.model';
import { Modifier } from '../../../../../models/modifier.model';
import * as utils from '../../../../../sim/utils/utils';
import * as avHandler from '../../../../../sim/calculations/actionvalue';

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

    all_bonus: number = 0;
    wind_bonus: number = 0;
    basic_bonus: number = 0;
    skill_bonus: number = 0;
    ult_bonus: number = 0;

    all_pen: number = 0;
    wind_pen: number = 0;
    basic_pen: number = 0;
    skill_pen: number = 0;
    ult_pen: number = 0;

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
        this.level = level;
        const stats = LEVEL_STATS[level];
        this.lc = lc;

        this.base_hp = stats.hp + (this.lc?.hp ?? 0);
        this.hp = utils.getEffectiveStat(this, 'Hp', this.base_hp);
        this.base_atk = stats.atk + (this.lc?.atk ?? 0);
        this.atk = utils.getEffectiveStat(this, 'Atk', this.base_atk);
        this.base_def = stats.def + (this.lc?.def ?? 0);
        this.def = utils.getEffectiveStat(this, 'Def', this.base_def);
        this.spd = utils.getEffectiveStat(this, 'Spd', this.base_spd);
        this.base_av = avHandler.ActionValueSetter(this);
        this.current_av = this.base_av;

        this.all_bonus = utils.getTotalsForStat(this, 'All_DMG_Bonus').percent;
        this.wind_bonus = utils.getTotalsForStat(this, 'Wind_DMG_Bonus').percent + this.all_bonus;
        this.basic_bonus = utils.getTotalsForStat(this, 'Basic_DMG_Bonus').percent + this.all_bonus;
        this.skill_bonus = utils.getTotalsForStat(this, 'Skill_DMG_Bonus').percent + this.all_bonus;
        this.ult_bonus = utils.getTotalsForStat(this, 'Ultimate_DMG_Bonus').percent + this.all_bonus;

        this.all_pen = utils.getTotalsForStat(this, 'All_Res_Pen').percent;
        this.wind_pen = utils.getTotalsForStat(this, 'Wind_Res_Pen').percent + this.all_pen;
        this.basic_pen = utils.getTotalsForStat(this, 'Wind_Res_Pen').percent + this.all_pen;
        this.skill_pen = utils.getTotalsForStat(this, 'Skill_Res_Pen').percent + this.all_pen;
        this.ult_pen = utils.getTotalsForStat(this, 'Ultimate_Res_Pen').percent + this.all_pen;

        this.taunt = this.base_taunt  * (1 + (this.taunt_multi / 100));
        this.currentEnergy = this.maxEnergy / 2;
    }
}