//src\data\characters\Wind\4 Star\DanHeng\DanHeng.basic.ts

import { Ability, AbilityHits } from "../../../../../models/abiltiy.model";
import { AbilityType } from "../../../../../models/type";

export class Dan_Heng_Basic implements Ability {
    type: AbilityType[] = ['Basic'];
    hits: AbilityHits[] = [
        { value: 45, multi: 0, toughnessDmg: 0, energy: 0 },
        { value: 55, multi: 0, toughnessDmg: 0, energy: 0 }
    ];
    total_multi: number = 100;
    total_toughnessDmg: number = 10;
    total_energy: number = 20;

    constructor() {
        const totalValue = this.hits.reduce((sum, hit) => sum + hit.value, 0);
        
        for (const hit of this.hits) {
            hit.multi = (hit.value / totalValue) * this.total_multi;
            hit.toughnessDmg = (hit.value / totalValue) * this.total_toughnessDmg;
            hit.energy = (hit.value / totalValue) * this.total_energy;
        }
    }
}