//src\models\unit.model.ts

import { Modifier } from './modifier.model';
import { TraceEntry } from './character.model';

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

    dmg_bonus?: number;
    all_bonus?: number;
    fire_bonus?: number;
    ice_bonus?: number;
    imaginary_bonus?: number;
    physical_bonus?: number;
    quantum_bonus?: number;
    lightning_bonus?: number;
    wind_bonus?: number;
    basic_bonus?: number;
    skill_bonus?: number;
    ult_bonus?: number;
    fua_bonus?: number;

    res_pen?: number;
    all_pen?: number;
    fire_pen?: number;
    ice_pen?: number;
    imaginary_pen?: number;
    physical_pen?: number;
    quantum_pen?: number;
    lightning_pen?: number;
    wind_pen?: number;
    basic_pen?: number;
    skill_pen?: number;
    ult_pen?: number;
    fua_pen?: number;

    res?: number;
    all_res?: number;
    fire_res?: number;
    ice_res?: number;
    imaginary_res?: number;
    physical_res?: number;
    quantum_res?: number;
    lightning_res?: number;
    wind_res?: number;

    ehr: number;
    er: number;

    modifiers: Modifier[];
    traces?: TraceEntry[];
}

