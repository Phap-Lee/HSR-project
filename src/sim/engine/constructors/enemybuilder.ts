//src\sim\engine\constructors\enemybuilder.ts

import { EnemyBase } from "../../../models/enemy.model";
import { Modifier } from "../../../models/modifier.model";
import { CharacterBase } from "../../../models/character.model";
import { Elements, ResistanceGroup, VulnerabilityGroup } from "../../../models/type";
import * as utils from "../../utils/utils";
import * as avHandler from "../../calculations/actionvalue";

export class EnemyBuilder {
  private enemy: Partial<EnemyBase> = {};

  setBasics(id: string, name: string, level: 80 | 90): this {
    this.enemy.id = id;
    this.enemy.name = name;
    this.enemy.level = level;
    this.enemy.spd_multi = level === 90 ? 32 : 20;
    return this;
  }

  setBaseStats(baseHp: number, baseAtk: number, baseDef: number, baseSpd: number): this {
    this.enemy.base_hp = baseHp;
    this.enemy.hp = baseHp;
    this.enemy.base_atk = baseAtk;
    this.enemy.atk = baseAtk;
    this.enemy.base_def = baseDef;
    this.enemy.def = baseDef;
    this.enemy.base_spd = baseSpd;
    this.enemy.spd = baseSpd;
    return this;
  }

  setToughness(baseToughness: number): this {
    this.enemy.base_toughness = baseToughness;
    this.enemy.toughness = baseToughness;
    return this;
  }

  setWeakness(weakness: Elements[]): this {
    this.enemy.weakness = weakness;
    return this;
  }

  setResistances(weakness: Elements[]): this {
    // Set all non-weak elements to 20% resistance
    const allElements: Elements[] = ['Fire', 'Ice', 'Imaginary', 'Physical', 'Quantum', 'Lightning', 'Wind'];
    const resistantElements = allElements.filter(elem => !weakness.includes(elem));
    
    if (!this.enemy.resistances) {
      this.enemy.resistances = { all: 0, element: {} };
    }
    
    if (!this.enemy.resistances.element) {
      this.enemy.resistances.element = {};
    }
    
    resistantElements.forEach(elem => {
      this.enemy.resistances!.element![elem] = 20;
    });

    return this;
  }

  setVulnerability(vulnerability: VulnerabilityGroup): this {
    this.enemy.vulnerability = vulnerability;
    return this;
  }

  addModifier(modifier: Modifier<EnemyBase | CharacterBase, EnemyBase | CharacterBase>): this {
    if (!this.enemy.modifiers) this.enemy.modifiers = [];
    this.enemy.modifiers.push(modifier);
    return this;
  }

  build(): EnemyBase {
    if (!this.enemy.id || !this.enemy.name || !this.enemy.level) {
      throw new Error('Must set basic enemy properties (id, name, level) before building');
    }

    if (this.enemy.spd_multi === undefined) {
      throw new Error('Must set speed multiplier by calling setBasics() before building');
    }
    if (this.enemy.base_spd === undefined) {
      throw new Error('Must set base stats (including baseSpd) before building');
    }

    const spdMulti = this.enemy.spd_multi;
    const baseSpd = this.enemy.base_spd;

    // Initialize defaults if not set
    if (!this.enemy.modifiers) this.enemy.modifiers = [];
    if (!this.enemy.migigations) this.enemy.migigations = [];
    if (!this.enemy.resistances) {
      this.enemy.resistances = { all: 0, element: {} };
    }
    if (!this.enemy.vulnerability) {
      this.enemy.vulnerability = { all: 0, basic: 0, skill: 0, ultimate: 0, fua: 0, element: {} };
    }

    // Apply speed modifier based on level
    this.enemy.modifiers.push({
      caster: this.enemy.id,
      target: this.enemy.id,
      buffid: 'enemy_speed_modifier',
      stat: 'Spd',
      type: 'percent',
      value: spdMulti,
      turns: 99999
    });

    // Calculate effective stats
    this.enemy.spd = utils.getEffectiveStat(this.enemy as EnemyBase, 'Spd', baseSpd);
    this.enemy.base_av = avHandler.ActionValueSetter(this.enemy as EnemyBase);
    this.enemy.current_av = this.enemy.base_av;
    this.enemy.ehr = this.enemy.ehr || 0;
    this.enemy.er = this.enemy.er || 0;

    return this.enemy as EnemyBase;
  }
}

// Simple factory function for quick creation
export function createEnemy(
  id: string,
  name: string,
  level: 80 | 90,
  baseHp: number,
  baseAtk: number,
  baseDef: number,
  baseSpd: number,
  baseToughness: number,
  weakness: Elements[]
): EnemyBase {
  return new EnemyBuilder()
    .setBasics(id, name, level)
    .setBaseStats(baseHp, baseAtk, baseDef, baseSpd)
    .setToughness(baseToughness)
    .setWeakness(weakness)  
    .setResistances(weakness)
    .build();
}
