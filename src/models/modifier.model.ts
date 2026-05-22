import { CharacterBase } from "./character.model";
import { EnemyBase } from "./enemy.model";


export interface modifier<T1 extends CharacterBase | EnemyBase = CharacterBase | EnemyBase, T2 extends CharacterBase | EnemyBase = CharacterBase | EnemyBase> {
    caster: T1;
    target: T2;
}