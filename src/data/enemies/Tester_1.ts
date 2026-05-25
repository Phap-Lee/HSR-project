import { EnemyBase } from "../../models/enemy.model";

export class Tester implements EnemyBase {
    id: string = 'tester_01';
    name: string = 'Tester Enemy';
    level: 80 | 90 = 80;
    hp: number = 10000;
    atk: number = 100;
    def: number = 3000;
    spd: number = 135;
}