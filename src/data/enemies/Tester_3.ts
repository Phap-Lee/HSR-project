import { EnemyBase } from "../../models/enemy.model";
import { EnemyBuilder } from "../../sim/engine/constructors/enemybuilder";

export class Tester3 {
    static create(): EnemyBase {
        return new EnemyBuilder()
            .setBasics('tester_03', 'Tester Enemy 3', 80)
            .setBaseStats(6000, 80, 250, 130)
            .setToughness(80)
            .setWeakness(['Ice', 'Lightning', 'Quantum'])
            .build();
    }
}

// Export instance for convenience
export const testerEnemy3: EnemyBase = Tester3.create();
