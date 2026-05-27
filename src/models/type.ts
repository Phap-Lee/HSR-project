// src\models\type.ts

// Paths
export const PathsEnum = {
    Hunt: 'The Hunt',
    Preservation: 'The Preservation',
    Erudition: 'The Erudition',
    Abundance: 'The Abundance',
    Harmony: 'The Harmony',
    Nihility: 'The Nihility',
    Destruction: 'The Destruction',
    Rememberance: 'The Rememberance',
    Elation: 'The Elation'
} as const;

export type Paths = typeof PathsEnum[keyof typeof PathsEnum];

// Elements
export type Elements =
| 'Fire' | 'Ice' | 'Imaginary' | 'Physical' | 'Quantum' | 'Lightning' | 'Wind';

export type ElementMap<T> = Partial<Record<Elements, T>>;

// Stats Types
export type StatKey =
// Basic Stats
| 'Hp' | 'Atk' | 'Def'
| 'Spd' | 'Cr' | 'Cdmg'
| 'Ehr' | 'Er' | 'Dr'
| 'Be' | 'Err'
// All Damage Bonuses
| 'Fire_DMG_Bonus' | 'Ice_DMG_Bonus' | 'Imaginary_DMG_Bonus' | 'Physical_DMG_Bonus' | 'Quantum_DMG_Bonus' | 'Lightning_DMG_Bonus' | 'Wind_DMG_Bonus'
| 'Basic_DMG_Bonus' | 'Skill_DMG_Bonus' | 'Ultimate_DMG_Bonus' | 'Fua_DMG_Bonus' | 'Break_DMG_Bonus'
| 'All_DMG_Bonus'
// All Res Pens
| 'Fire_Res_Pen' | 'Ice_Res_Pen' | 'Imaginary_Res_Pen' | 'Physical_Res_Pen' | 'Quantam_Res_Pen' | 'Lightning_Res_Pen' | 'Wind_Res_Pen'
| 'Basic_Res_Pen' | 'Skill_Res_Pen' | 'Ultimate_Res_Pen' | 'Fua_Res_Pen' | 'Break_Res_Pen'
| 'All_Res_Pen'
// All Defence Ignore
| 'Fire_Ignore' | 'Ice_Ignore' | 'Imaginary_Ignore' | 'Physical_Ignore' | 'Quantam_Ignore' | 'Lightning_Ignore' | 'Wind_Ignore'
| 'Basic_Ignore' | 'Skill_Ignore' | 'Ultimate_Ignore' | 'Fua_Ignore' | 'Break_Ignore'
| 'All_Ignore'
// All Resistances
| 'Fire_Res' | 'Ice_Res' | 'Imaginary_Res' | 'Physical_Res' | 'Quantam_Res' | 'Lightning_Res' | 'Wind_Res'
| 'All_Res' | 'Dmg_Mitigation'
// Debuffs
| 'Fire_Vulnerability' | 'Ice_Vulnerability' | 'Imaginary_Vulnerability' | 'Physical_Vulnerability' | 'Quantam_Vulnerability' | 'Lightning_Vulnerability' | 'Wind_Vulnerability'
| 'Basic_Vulnerability' | 'Skill_Vulnerability' | 'Ultimate_Vulnerability' | 'Fua_Vulnerability' | 'Break_Vulnerability'
| 'All_Vulnerability'
| 'Weaken' | 'Def_Down';

export interface DamageBonusGroup {
    all?: number;
    basic?: number;
    skill?: number;
    ultimate?: number;
    fua?: number;
    dot?: number;
    element?: ElementMap<number>;
}

export interface ResPenGroup {
    all?: number;
    basic?: number;
    skill?: number;
    ultimate?: number;
    fua?: number;
    dot?: number;
    element?: ElementMap<number>;
}

export interface ResistanceGroup {
    all?: number;
    element?: ElementMap<number>;
}

export interface DefenceIgnoreGroup {
    all?: number;
    basic?: number;
    skill?: number;
    ultimate?: number;
    fua?: number;
    dot?: number;
    element?: ElementMap<number>;  
}

export interface VulnerabilityGroup {
    all?: number;
    basic?: number;
    skill?: number;
    ultimate?: number;
    fua?: number;
    dot?: number;
    element?: ElementMap<number>; 
}

// Flat Stat or Percent Stat
export type StatType = 'flat' | 'percent';

// Level Incriments
export type Level =
1 | 20
| '20+' | 30
| '30+' | 40
| '40+' | 50
| '50+' | 60
| '60+' | 70
| '70+' | 80;

export type AbilityLevel =
1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Level Stats
export type LevelStats = {
    hp: number;
    atk: number;
    def: number
};

// Ability Types
export type AbilityType = 'Basic' | 'Skill' | 'Ultimate' | 'Fua' | 'Technique' | 'Talent' | 'Dot' | 'Break' | 'Extra' | 'True';
export type AbilityTarget = 'Single' | 'Blast' | 'Aoe'