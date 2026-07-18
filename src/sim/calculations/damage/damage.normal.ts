//src\sim\calculations\damage\damage.normal.ts

import { Ability } from "../../../models/abiltiy.model";
import { CharacterBase } from "../../../models/character.model";
import { EnemyBase } from "../../../models/enemy.model";
import { StatKey } from "../../../models/type";
import { UnitBase } from "../../../models/unit.model";
import { getLevelNumber, getTotalsForStat, getEffectiveStat } from "../../utils/utils";
import { isBroken } from "./damage.toughness";

export function BaseDamage(unit: UnitBase, stat: StatKey, ability_mult: number, extra_dmg = 0): number {
    let baseValue = 0;
    switch (stat) {
        case 'Hp':
            baseValue = unit.base_hp;
            break;
        case 'Atk':
            baseValue = unit.base_atk;
            break;
        case 'Def':
            baseValue = unit.base_def;
            break;
        default:
            return 0;
    }

    const effective = getEffectiveStat(unit, stat, baseValue);
    return effective * ability_mult / 100 + extra_dmg;
}

export function DamageBonusFinder(unit: CharacterBase, ability: Ability):number {
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
            case 'Dot':
                return sum + (damageBonuses.dot ?? 0);
            default:
                return sum;
        }
    }, 0);

    return 1 + typeDmg + elemDmg + allDmg;
}

export function rollCrit(critRate: number): boolean {
    const random = Math.random() * 100;
    return random < critRate;
}

export function getCritMultiplier(canCrit: boolean, critDmg: number, rollCrit: boolean): number {
    if (canCrit && rollCrit) {
        return 1 + (critDmg / 100);
    }
    return 1;
}

export function getWeaknessMultiplier(unit: UnitBase): number {
    const weakenModifiers = unit.modifiers.filter(
        (modifier) => modifier.stat === 'Weaken'
    );
    const weakenMult = weakenModifiers.reduce(
        (sum, modifier) => sum + modifier.value, 0
    );

    return weakenMult;
}

export function getDefenceDownTotal(unit: UnitBase): number {
    const defdownModifiers = unit.modifiers.filter(
        (modifier) => modifier.stat === 'Def_Down'
    );
    const defdownMult = defdownModifiers.reduce(
        (sum, modifier) => sum + modifier.value, 0
    );

    return defdownMult;
}

export function getDefIgnoreTotal(unit: CharacterBase, ability: Ability): number {
    const defIgnores = unit.defIgnore ?? {};
    const elemIgore = defIgnores.element?.[unit.element] ?? 0;
    const allDefIgnore = defIgnores.all ?? 0;

    const typeIgnore = ability.type.reduce((sum, type) => {
        switch (type) {
            case 'Basic':
                return sum + (defIgnores.basic ?? 0);
            case 'Skill':
                return sum + (defIgnores.skill ?? 0);
            case 'Ultimate':
                return sum + (defIgnores.ultimate ?? 0);
            case 'Fua':
                return sum + (defIgnores.fua ?? 0);
            case 'Dot':
                return sum + (defIgnores.dot ?? 0)
            default:
                return sum;
        }
    }, 0);

    return typeIgnore + elemIgore + allDefIgnore;
}

export function getDefMult(attacker: CharacterBase, ability: Ability, target: EnemyBase): number {
    const targetDefense = getEffectiveStat(target, 'Def', target.base_def);
    const defDown = getDefenceDownTotal(target) / 100;
    const defIgnore = getDefIgnoreTotal(attacker, ability) / 100;
    const effectiveDefense = Math.max(0, targetDefense * (1 - defDown - defIgnore));
    
    const defMult = (getLevelNumber(attacker.level) + 20) / (getLevelNumber(attacker.level) + 20 + effectiveDefense);

    return defMult;
}

export function getResistanceMultiplier(attacker: CharacterBase, target: EnemyBase, ability: Ability): number {
    const resistances = target.resistances ?? {};
    const elemRes = resistances.element?.[attacker.element] ?? 0;
    const allRes = resistances.all ?? 0;

    const resistanceIgnores = attacker.resPen ?? {};
    const elemResPen = resistanceIgnores.element?.[attacker.element] ?? 0;
    const allResPen = resistanceIgnores.all ?? 0;

    return 1 - (((allRes + elemRes) / 100) - ((allResPen + elemResPen) / 100));
}

export function getVulnerabilityMultiplier(attacker: CharacterBase, target: EnemyBase, ability: Ability): number {
    const vulnerabilities = target.vulnerability ?? {};
    const elemVul = vulnerabilities.element?.[attacker.element] ?? 0;
    const allVul = vulnerabilities.all ?? 0;

    const typeVul = ability.type.reduce((sum, type) => {
        switch (type) {
            case "Basic":
                return sum + (vulnerabilities.basic ?? 0);
            case "Skill":
                return sum + (vulnerabilities.skill ?? 0);
            case "Ultimate":
                return sum + (vulnerabilities.ultimate ?? 0);
            case "Fua":
                return sum + (vulnerabilities.fua ?? 0);
            case "Dot":
                return sum + (vulnerabilities.dot ?? 0);
            default:
                return sum;
        }
    }, 0);

    return 1 + (typeVul / 100) + (elemVul / 100) + (allVul / 100);
}

export interface DamageCalculationResult {
    damage: number;
    didCrit: boolean;
    critMultiplier: number;
}

export function FullDamage(
    attacker: CharacterBase,
    target: EnemyBase,
    stat: StatKey,
    abiltiy: Ability,
    extra_dmg = 0,
): DamageCalculationResult { // <-- Change return type from 'number' to your interface
    const canCrit = !abiltiy.type.includes('Dot');
    const migigations = target.migigations;
    const baseDmg = BaseDamage(attacker, stat, abiltiy.total_multi ?? 0, extra_dmg);
    
    // Roll crit ONCE and capture the boolean value
    const critRolled = rollCrit(attacker.cr); 
    const critMult = getCritMultiplier(canCrit, attacker.cdmg, critRolled);
    
    const dmgBoost = DamageBonusFinder(attacker, abiltiy);
    const weakenMult = 1 - (getWeaknessMultiplier(attacker) / 100);
    
    const targetDefense = getEffectiveStat(target, 'Def', target.base_def);
    const defDown = getDefenceDownTotal(target) / 100;
    const defIgnore = getDefIgnoreTotal(attacker, abiltiy) / 100;
    const effectiveDefense = Math.max(0, targetDefense * (1 - defDown - defIgnore));
    
    const defMult = (getLevelNumber(attacker.level) + 20) / (getLevelNumber(attacker.level) + 20 + effectiveDefense);
    const resMult = getResistanceMultiplier(attacker, target, abiltiy);
    const vulMult = getVulnerabilityMultiplier(attacker, target, abiltiy);
    const mitiMult = migigations.reduce((prod, percent) => prod * (1 - percent / 100), 1);
    
    let brokenMult = 0.9;
    if (isBroken(target)) {
        brokenMult = 1.0;
    }

    // Compute final damage using the rolled multiplier
    const finalDamage = baseDmg * critMult * dmgBoost * weakenMult * defMult * resMult * vulMult * mitiMult * brokenMult;

    // Return the detailed data payload
    return {
        damage: finalDamage,
        didCrit: canCrit && critRolled,
        critMultiplier: critMult
    };
}