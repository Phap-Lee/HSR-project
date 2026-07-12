import type { EnemyBase } from "../../models/enemy.model";
import { Tester } from "./Tester_1";
import { Tester2 } from "./Tester_2";
import { Tester3 } from "./Tester_3";

export type EnemyDefinition = {
    id: string;
    name: string;
    create: (level?: 80 | 90) => EnemyBase;
};

export const enemyRegistry: Record<string, EnemyDefinition> = {
    tester_1: {
        id: "tester_1",
        name: "Tester Enemy 1",
        create: Tester.create,
    },
    tester_2: {
        id: "tester_2",
        name: "Tester Enemy 2",
        create: Tester2.create,
    },
    tester_3: {
        id: "tester_3",
        name: "Tester Enemy 3",
        create: Tester3.create,
    },
};

export function registerEnemy(definition: EnemyDefinition): void {
    enemyRegistry[definition.id] = definition;
}

export function createEnemyFromRegistry(
    id: string,
    level: 80 | 90 = 80
): EnemyBase {
    const definition = enemyRegistry[id];
    if (!definition) throw new Error(`Unknown enemy: ${id}`);
    return definition.create(level);
}
