import { CharacterBase } from "../../models/character.model";
import { EnemyBase } from "../../models/enemy.model";
import { Modifier } from "../../models/modifier.model";
import { Elements } from "../../models/type";
import * as utils from "../../sim/utils/utils";
import * as avHandler from "../../sim/calculations/actionvalue";

export class Tester implements EnemyBase {
    id: string = 'tester_01';
    name: string = 'Tester Enemy';
    level: 80 | 90 = 80;
    base_hp: number = 10000;
    hp: number = 0;
    base_atk: number = 100;
    atk: number = 0;
    base_def: number = 3000;
    def: number = 0;
    base_spd: number = 135;
    spd: number = 0;
    spd_multi: number = 0;
    base_av: number = 0;
    current_av: number = 0;

    res: number = 0;
    all_res: number = 0;
    fire_res: number = 0;
    ice_res: number = 0;
    imaginary_res: number = 0;
    physical_res: number = 0;
    quantum_res: number = 0;
    lightning_res: number = 0;
    wind_res: number = 0;

    ehr: number = 0;
    er: number = 0;

    weakness: Elements[] = [
        'Physical',
        'Quantum',
        'Lightning'
    ];
    modifiers: Modifier<EnemyBase | CharacterBase, EnemyBase | CharacterBase>[] = [];

    base_toughness: number = 100;
    toughness: number = 0;

    constructor() {
        this.spd_multi = this.level === 90? 32 : 20;
        this.modifiers.push({
            caster: this.id,
            target: this.id,
            stat: 'Spd',
            type: 'percent',
            value: this.spd_multi,
            turns: 99999
        });
        this.spd = utils.getEffectiveStat(this, 'Spd', this.base_spd);
        this.base_av = avHandler.ActionValueSetter(this);
        this.current_av = this.base_av;

        const allElements: Elements[] = ['Fire', 'Ice', 'Imaginary', 'Physical', 'Quantum', 'Lightning', 'Wind'];
        const resMap = {
            Fire: 'fire_res',
            Ice: 'ice_res',
            Imaginary: 'imaginary_res',
            Physical: 'physical_res',
            Quantum: 'quantum_res',
            Lightning: 'lightning_res',
            Wind: 'wind_res'
        } as const;

        for (const element of allElements) {
            if (!this.weakness.includes(element)) {
                this[resMap[element]] = 20;
            }
        };
        this.toughness = this.base_toughness;
    }
}