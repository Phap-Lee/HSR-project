//src\data\characters\Wind\4 Star\DanHeng\DanHeng.basic.ts

import { Ability, AbilityHits } from "../../../../../models/abiltiy.model";
import { AbilityType } from "../../../../../models/type";

export class Dan_Heng_Basic implements Ability {
    type: AbilityType[] = ['Basic'];
    hits: AbilityHits[] = [
        { value: 45, multi: 0 },
        { value: 55, multi: 0 }
    ];
    total_multi: number = 100;

    constructor() {
        const totalValue = this.hits.reduce((sum, hit) => sum + hit.value, 0);
        
        for (const hit of this.hits) {
            hit.multi = (hit.value / totalValue) * this.total_multi;
        }
    }
}