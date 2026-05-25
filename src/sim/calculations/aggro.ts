//src\sim\calculations\aggro.ts

import { CharacterBase } from "../../models/character.model";

export function ChangeTauntMulti(unit: CharacterBase, multi: number) {
    unit.taunt_multi += multi
}

export function NewTauntValue(unit: CharacterBase) {
    unit.taunt = unit.base_taunt * (1 + (unit.taunt_multi / 100))
}