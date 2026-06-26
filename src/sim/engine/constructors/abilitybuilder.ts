import { Ability } from "../../../models/abiltiy.model";
import { AbilityLevel } from "../../../models/type";

type AbilityConstructor = new (level?: AbilityLevel) => Ability;

export class AbilityBuilder {
    private abilityClass?: AbilityConstructor;
    private level: AbilityLevel = 1;

    setAbilityClass(abilityClass: AbilityConstructor): this {
        this.abilityClass = abilityClass;
        return this;
    }

    setLevel(level: AbilityLevel): this {
        this.level = level;
        return this;
    }

    build(): Ability {
        if (!this.abilityClass) {
            throw new Error('Must set the ability class before building');
        }
        return new this.abilityClass(this.level);
    }
}

export function AbilityFactory(
    AbilityClass: AbilityConstructor,
    level: AbilityLevel = 1
): Ability {
    return new AbilityBuilder().setAbilityClass(AbilityClass).setLevel(level).build();
}