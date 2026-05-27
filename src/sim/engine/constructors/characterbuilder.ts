//src\sim\engine\characterbuilder.ts

import { CharacterBase } from "../../../models/character.model";
import { LightCone } from "../../../models/lightcone.model";

type CharacterConstructor = new (
    level?: number,
    lc?: LightCone
) => CharacterBase;

export function CharacterFactory(
    characterclass: CharacterConstructor,
    level: number,
    lc?: LightCone
): CharacterBase {
    return new characterclass(level, lc);
}