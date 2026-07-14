import { EnemyBase } from "../../models/enemy.model";
import { EnemyBuilder } from "../../sim/engine/constructors/enemybuilder";

export class Tester {
    static create(): EnemyBase {
        return new EnemyBuilder()
            .setBasics('tester_01', 'Tester Enemy', 80)
            .setBaseStats(10000, 100, 1000, 135)
            .setToughness(100)
            .setWeakness(['Physical', 'Quantum', 'Lightning'])
            .setResistances(['Physical', 'Quantum', 'Lightning'])
            .build();
    }
}

// Export instance for convenience
export const testerEnemy: EnemyBase = Tester.create();