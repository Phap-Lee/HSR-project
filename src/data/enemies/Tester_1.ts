import { CharacterBase } from "../../models/character.model";
import { EnemyBase } from "../../models/enemy.model";
import { Modifier } from "../../models/modifier.model";
import { Elements, ResistanceGroup, VulnerabilityGroup } from "../../models/type";
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
    base_def: number = 300;
    def: number = 0;
    base_spd: number = 135;
    spd: number = 0;
    spd_multi: number = 0;
    base_av: number = 0;
    current_av: number = 0;

    resistances?: ResistanceGroup | undefined;
    vulnerability?: VulnerabilityGroup | undefined;

    ehr: number = 0;
    er: number = 0;

    weakness: Elements[] = [
        'Physical',
        'Quantum',
        'Lightning'
    ];
    migigations: [] = [];
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

        const allElements: Elements[] = ['Fire','Ice','Imaginary','Physical','Quantum','Lightning','Wind'];
        const elementRes: Partial<Record<Elements, number>> = {};
        for (const el of allElements) elementRes[el] = this.weakness.includes(el) ? 0 : 20;
        this.resistances = { all: 0, element: elementRes };

        const elementVul: Partial<Record<Elements, number>> = {};
        for (const el of allElements) {
            elementVul[el] = 0;
        }
        this.vulnerability = {
            all: 0,
            basic: 0,
            skill: 0,
            ultimate: 0,
            fua: 0,
            element: elementVul
        }

        this.toughness = this.base_toughness;
    }
}