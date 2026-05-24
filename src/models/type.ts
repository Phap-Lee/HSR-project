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

// Stats Types
export type StatKey =
| 'Hp' | 'Atk' | 'Def'
| 'Spd' | 'Cr' | 'Cdmg'
| 'Ehr' | 'Er' | 'Be'
| 'Err'
| 'Fire_DMG_Bonus' | 'Ice_DMG_Bonus' | 'Imaginary_DMG_Bonus' | 'Physical_DMG_Bonus' | 'Quantum_DMG_Bonus' | 'Lightning_DMG_Bonus' | 'Wind_DMG_Bonus'
| 'Basic_DMG_Bonus' | 'Skill_DMG_Bonus' | 'Ultimate_DMG_Bonus' | 'Fua_DMG_Bonus'
| 'All_DMG_Bonus'
| 'Fire_Res_Pen' | 'Ice_Res_Pen' | 'Imaginary_Res_Pen' | 'Physical_Res_Pen' | 'Quantam_Res_Pen' | 'Lightning_Res_Pen' | 'Wind_Res_Pen'
| 'Basic_Res_Pen' | 'Skill_Res_Pen' | 'Ultimate_Res_Pen' | 'Fua_Res_Pen'
| 'All_Res_Pen';

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

// Level Stats
export type LevelStats = {
    hp: number;
    atk: number;
    def: number
};

// Ability Types
export type AbilityType = 'Basic' | 'Skill' | 'Ultimate' | 'Fua' | 'Technique' | 'Talent';