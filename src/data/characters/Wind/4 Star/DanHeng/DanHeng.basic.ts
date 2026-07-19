//src\data\characters\Wind\4 Star\DanHeng\DanHeng.basic.ts

import { Ability, AbilityHits } from "../../../../../models/abiltiy.model";
import { AbilityLevel, AbilityTarget, AbilityType } from "../../../../../models/type";

const LEVEL_MULT: Partial<Record<AbilityLevel, number>> = {
    1: 50,
    2: 60,
    3: 70,
    4: 80,
    5: 90,
    6: 100,
    7: 110
}

export class Dan_Heng_Basic implements Ability {
    type: AbilityType[] = ['Basic'];
    target: AbilityTarget = 'Single';
    level: AbilityLevel = 1;
    hits: AbilityHits[] = [
        { value: 45, multi: 0, toughnessDmg: 0, energy: 0 },
        { value: 55, multi: 0, toughnessDmg: 0, energy: 0 }
    ];
    total_multi: number = 50;
    total_toughnessDmg: number = 10;
    total_energy: number = 20;
    spGain: number = 1;

    constructor(level: AbilityLevel = 1) {
        this.level = level;
        this.total_multi = LEVEL_MULT[level] ?? 50;

        const totalValue = this.hits.reduce((sum, hit) => sum + hit.value, 0);
        
        this.hits = this.hits.map(hit => ({
            ...hit,
            multi: (hit.value / totalValue) * this.total_multi,
            toughnessDmg: (hit.value / totalValue) * this.total_toughnessDmg!,
            energy: (hit.value / totalValue) * this.total_energy
        }));
    }
}