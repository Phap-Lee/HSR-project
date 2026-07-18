import { Ability } from "../../../models/abiltiy.model";
import { CharacterBase } from "../../../models/character.model";
import { EnemyBase } from "../../../models/enemy.model";
import { Level, StatKey } from "../../../models/type";
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
    return (effective * ability_mult / 100) + extra_dmg;
}

export function DamageBonusFinder(unit: CharacterBase, ability: Ability): number {
    const damageBonuses = unit.damageBonuses ?? {};
    const elemDmg = damageBonuses.element?.[unit.element] ?? 0;
    const allDmg = damageBonuses.all ?? 0;

    const typeDmg = ability.type.reduce((sum, type) => {
        switch (type) {
            case 'Basic': return sum + (damageBonuses.basic ?? 0);
            case 'Skill': return sum + (damageBonuses.skill ?? 0);
            case 'Ultimate': return sum + (damageBonuses.ultimate ?? 0);
            case 'Fua': return sum + (damageBonuses.fua ?? 0);
            case 'Dot': return sum + (damageBonuses.dot ?? 0);
            default: return sum;
        }
    }, 0);

    // Converts e.g. 50% bonus to a 1.50x multiplier
    return 1 + ((typeDmg + elemDmg + allDmg) / 100);
}

export function rollCrit(critRate: number): boolean {
    return (Math.random() * 100) < critRate;
}

export function getCritMultiplier(canCrit: boolean, critDmg: number, rollCrit: boolean): number {
    if (canCrit && rollCrit) {
        return 1 + (critDmg / 100);
    }
    return 1;
}

export function getWeaknessMultiplier(unit: UnitBase): number {
    const weakenModifiers = unit.modifiers.filter(m => m.stat === 'Weaken');
    return weakenModifiers.reduce((sum, m) => sum + m.value, 0);
}

export function getDefenceDownTotal(unit: UnitBase): number {
    const defdownModifiers = unit.modifiers.filter(m => m.stat === 'Def_Down');
    return defdownModifiers.reduce((sum, m) => sum + m.value, 0);
}

export function getDefIgnoreTotal(unit: CharacterBase, ability: Ability): number {
    const defIgnores = unit.defIgnore ?? {};
    const elemIgnore = defIgnores.element?.[unit.element] ?? 0;
    const allDefIgnore = defIgnores.all ?? 0;

    const typeIgnore = ability.type.reduce((sum, type) => {
        switch (type) {
            case 'Basic': return sum + (defIgnores.basic ?? 0);
            case 'Skill': return sum + (defIgnores.skill ?? 0);
            case 'Ultimate': return sum + (defIgnores.ultimate ?? 0);
            case 'Fua': return sum + (defIgnores.fua ?? 0);
            case 'Dot': return sum + (defIgnores.dot ?? 0);
            default: return sum;
        }
    }, 0);

    return typeIgnore + elemIgnore + allDefIgnore;
}

export function getDefMult(attacker: CharacterBase, ability: Ability, target: EnemyBase): number {
    const attackerLevelFactor = getLevelNumber(attacker.level) + 20;
    const enemyLevelFactor = getLevelNumber(target.level as Level) + 20;

    const defDown = getDefenceDownTotal(target) / 100;
    const defIgnore = getDefIgnoreTotal(attacker, ability) / 100;
    
    const modifierScale = Math.max(0, 1 - defDown - defIgnore);
    return attackerLevelFactor / ((enemyLevelFactor * modifierScale) + attackerLevelFactor);
}

export function getResistanceMultiplier(attacker: CharacterBase, target: EnemyBase, ability: Ability): number {
    const resistances = target.resistances ?? {};
    const elemRes = resistances.element?.[attacker.element] ?? 0;
    const allRes = resistances.all ?? 0;

    const resistanceIgnores = attacker.resPen ?? {};
    const elemResPen = resistanceIgnores.element?.[attacker.element] ?? 0;
    const allResPen = resistanceIgnores.all ?? 0;

    const finalRes = (allRes + elemRes) / 100;
    const finalPen = (allResPen + elemResPen) / 100;

    // HSR Wiki standard formatting: 1 - Res + Pen
    return 1 - finalRes + finalPen;
}

export function getVulnerabilityMultiplier(attacker: CharacterBase, target: EnemyBase, ability: Ability): number {
    const vulnerabilities = target.vulnerability ?? {};
    const elemVul = vulnerabilities.element?.[attacker.element] ?? 0;
    const allVul = vulnerabilities.all ?? 0;

    const typeVul = ability.type.reduce((sum, type) => {
        switch (type) {
            case "Basic": return sum + (vulnerabilities.basic ?? 0);
            case "Skill": return sum + (vulnerabilities.skill ?? 0);
            case "Ultimate": return sum + (vulnerabilities.ultimate ?? 0);
            case "Fua": return sum + (vulnerabilities.fua ?? 0);
            case "Dot": return sum + (vulnerabilities.dot ?? 0);
            default: return sum;
        }
    }, 0);

    // 💡 Weaken belongs natively inside the vulnerability multiplier equation layer
    const weakenDebuff = getWeaknessMultiplier(attacker) / 100;

    return Math.max(0, 1 + ((typeVul + elemVul + allVul) / 100) - weakenDebuff);
}

export function getMitigationMultiplier(target: EnemyBase): number {
    const mitigations = target.migigations ?? [];
    // Starts with a true baseline value of 1.0
    return mitigations.reduce((prod, percent) => prod * (1 - percent / 100), 1.0);
}

export function getDamageReceivedMultiplier(target: EnemyBase): number {
    // Standard baseline is 1.0 unless specific boss mechanics state otherwise
    return 1.0; 
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
    ability: Ability,
    extra_dmg = 0,
): DamageCalculationResult {
    const canCrit = !ability.type.includes('Dot');
    
    // 1. Base Damage Block
    const baseDmg = BaseDamage(attacker, stat, ability.total_multi ?? 0, extra_dmg);
    
    // 2. Critical Block
    const critRolled = rollCrit(attacker.cr); 
    const critMult = getCritMultiplier(canCrit, attacker.cdmg, critRolled);
    
    // 3. Multiplier Layers aligned with HSR Wiki standards
    const dmgBoost = DamageBonusFinder(attacker, ability);
    const defMult = getDefMult(attacker, ability, target); 
    const resMult = getResistanceMultiplier(attacker, target, ability);
    const vulMult = getVulnerabilityMultiplier(attacker, target, ability);
    const mitiMult = getMitigationMultiplier(target);
    const dmgReceivedMult = getDamageReceivedMultiplier(target);
    
    // 4. Weakness Break Multiplier Layer
    let brokenMult = 0.9; // 10% damage penalty while enemy is shielded
    if (isBroken(target)) {
        brokenMult = 1.0;
    }

    // 5. Final Output Evaluation
    const finalDamage = baseDmg * critMult * dmgBoost * defMult * resMult * vulMult * mitiMult * dmgReceivedMult * brokenMult;

    return {
        damage: Math.max(0, finalDamage),
        didCrit: canCrit && critRolled,
        critMultiplier: critMult
    };
}