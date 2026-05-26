//src\sim\calculations\damage\damage.normal.ts

import { Ability } from "../../../models/abiltiy.model";
import { CharacterBase } from "../../../models/character.model";
import { EnemyBase } from "../../../models/enemy.model";
import { StatKey } from "../../../models/type";
import { UnitBase } from "../../../models/unit.model";

function BaseDamage(unit: UnitBase, stat: StatKey, ability_mult: number, extra_dmg = 0): number {
    switch (stat) {
        case 'Hp':
            return unit.base_hp * ability_mult + extra_dmg;
        case 'Atk':
            return unit.base_atk * ability_mult + extra_dmg;
        case 'Def':
            return unit.base_def * ability_mult + extra_dmg;
        default:
            return 0;
    }
}

function DamageBonusFinder(unit: CharacterBase, ability: Ability) {
    const damageBonuses = unit.damageBonuses ?? {};
    const elemDmg = damageBonuses.element?.[unit.element] ?? 0;
    const allDmg = damageBonuses.all ?? 0;

    const typeDmg = ability.type.reduce((sum, type) => {
        switch (type) {
            case 'Basic':
                return sum + (damageBonuses.basic ?? 0);
            case 'Skill':
                return sum + (damageBonuses.skill ?? 0);
            case 'Ultimate':
                return sum + (damageBonuses.ultimate ?? 0);
            case 'Fua':
                return sum + (damageBonuses.fua ?? 0);
            default:
                return sum;
        }
    }, 0);

    return 1 + typeDmg + elemDmg + allDmg;
}

function rollCrit(critRate: number): boolean {
    const random = Math.random() * 100;
    return random < critRate;
}

function getCritMultiplier(canCrit: boolean, critDmg: number, rollCrit: boolean): number {
    if (canCrit && rollCrit) {
        return 1 + (critDmg / 100);
    }
    return 1;
}

export function FullDamage(
    attacker: CharacterBase | EnemyBase,
    target: CharacterBase | EnemyBase,
    stat: StatKey,
    abiltiy: Ability,
    extra_dmg = 0, 
    ogDmgMult = 0,
): number {
    const canCrit = !abiltiy.type.includes('Dot');
    const baseDmg = BaseDamage(attacker, stat, extra_dmg);
    if ('cr' in attacker && 'cdmg' in attacker) {
        const critMult = getCritMultiplier(
            canCrit,
            attacker.cdmg,
            rollCrit(attacker.cr)
        );
        const dmgBoost = DamageBonusFinder(attacker, abiltiy);
    } else {
        const critMult = 1;
        const dmgBoost = 1;
    }
}