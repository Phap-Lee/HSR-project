//src\models\modifier.model.ts

import { CharacterBase } from "./character.model";
import { EnemyBase } from "./enemy.model";
import { type StatType, type StatKey } from "./type";


export interface Modifier<T1 extends CharacterBase | EnemyBase = CharacterBase | EnemyBase, T2 extends CharacterBase | EnemyBase = CharacterBase | EnemyBase> {
    caster: string;
    target: string;
    stat: StatKey;
    type: StatType;
    value: number;
    turns: number;
}