import { CharacterBase } from "./character.model";
import { EnemyBase } from "./enemy.model";
import { type StatType, type StatKey } from "./type";


export interface modifier<T1 extends CharacterBase | EnemyBase = CharacterBase | EnemyBase, T2 extends CharacterBase | EnemyBase = CharacterBase | EnemyBase> {
    caster: T1;
    target: T2;
    stat: StatKey;
    type: StatType;
    value: number;
    turns: number;
}