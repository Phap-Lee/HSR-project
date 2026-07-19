import { EnemyBase } from "../../models/enemy.model";
import { EnemyBuilder } from "../../sim/engine/constructors/enemybuilder";

export class Tester2 {
    static create(): EnemyBase {
        return new EnemyBuilder()
            .setBasics('tester_02', 'Tester Enemy 2', 90)
            .setBaseStats(1000, 120, 350, 140)
            .setToughness(120)
            .setWeakness(['Fire', 'Wind', 'Imaginary'])
            .setResistances(['Fire', 'Wind', 'Imaginary'])
            .build();
    }
}

// Export instance for convenience
export const testerEnemy2: EnemyBase = Tester2.create();
