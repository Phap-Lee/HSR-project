//src\models\unit.model.ts

import { Modifier } from './modifier.model';
import { TraceEntry } from './character.model';
import { DamageBonusGroup, ResPenGroup, ResistanceGroup } from './type';

export interface UnitBase {
    id: string;
    name: string;
    base_hp: number;
    hp: number;
    base_atk: number;
    atk: number;
    base_def: number;
    def: number;
    base_spd: number;
    spd: number;
    base_av: number;
    current_av: number;
    cr?: number;
    cdmg?: number;

    damageBonuses?: DamageBonusGroup;
    resPen?: ResPenGroup;
    resistances?: ResistanceGroup;

    ehr: number;
    er: number;

    modifiers: Modifier[];
    traces?: TraceEntry[];
}

