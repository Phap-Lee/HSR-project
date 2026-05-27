import { Ability } from "../../../models/abiltiy.model";
import { AbilityLevel } from "../../../models/type";

type AbilityConstructor = new (level?: AbilityLevel) => Ability;

export function AbilityFactory(
    AbilityClass: AbilityConstructor,
    level: AbilityLevel = 1
): Ability {
    return new AbilityClass(level);
}