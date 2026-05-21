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

export type Elements =
| 'Fire' | 'Ice' | 'Imaginary' | 'Physical' | 'Quantum' | 'Lightning' | 'Wind';

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

export type StatType = 'flat' | 'percent';

export type Level =
1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
| '10+' | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
| '20+' | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
| '30+' | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
| '40+' | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50
| '50+' | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60
| '60+' | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70
| '70+' | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80;

export type LevelStats = {
    hp: number;
    atk: number;
    def: number
};

export type AbilityType = 'Basic' | 'Skill' | 'Ultimate' | 'Fua' | 'Technique' | 'Talent';