//src\sim\calculations\energy.ts

import { Ability } from "../../models/abiltiy.model";
import { CharacterBase } from "../../models/character.model";

export function GainEnergy(unit: CharacterBase, ability: Ability) {
    const energyGained = ability.total_energy * (unit.err / 100)

    unit.currentEnergy = Math.min(unit.maxEnergy, unit.currentEnergy += energyGained);
}