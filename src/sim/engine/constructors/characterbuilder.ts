import { CharacterBase } from "../../../models/character.model";
import { LightCone } from "../../../models/lightcone.model";
import type { Level, AbilityLevel } from "../../../models/type";
import { AbilityFactory } from "./abilitybuilder";
import * as utils from "../../utils/utils";

export type CharacterConstructor = new (
    level?: Level,
    lc?: LightCone
) => CharacterBase;

// Define a map to track the levels of different ability types
export type AbilityLevelMap = {
    basic?: AbilityLevel;
    skill?: AbilityLevel;
    ultimate?: AbilityLevel;
    talent?: AbilityLevel;
};

export class CharacterBuilder {
    private characterClass?: CharacterConstructor;
    private level?: Level;
    private lc?: LightCone;
    private abilityLevels?: AbilityLevelMap;

    setCharacterClass(characterClass: CharacterConstructor): this {
        this.characterClass = characterClass;
        return this;
    }

    setLevel(level: Level): this {
        this.level = level;
        return this;
    }

    setLightCone(lc: LightCone | undefined): this {
        this.lc = lc;
        return this;
    }

    // New method to accept the dynamic levels from your React state
    setAbilityLevels(levels?: AbilityLevelMap): this {
        this.abilityLevels = levels;
        return this;
    }

    build(): CharacterBase {
        if (!this.characterClass) {
            throw new Error('Must set the character class before building');
        }

        const character = new this.characterClass(this.level, this.lc);

        if (this.abilityLevels && character.abilities) {
            character.abilities = character.abilities.map((ability) => {
                const abilityTypeKey = ability.type[0].toLowerCase() as keyof AbilityLevelMap;
                const requestedLevel = this.abilityLevels![abilityTypeKey] ?? ability.level;
                const AbilityConstructorRef = ability.constructor as any;
                
                return AbilityFactory(AbilityConstructorRef, requestedLevel);
            });
        }

        return character;
    }
}

export function CharacterFactory(
    characterclass: CharacterConstructor,
    level: Level,
    lc?: LightCone,
    abilityLevels?: AbilityLevelMap
): CharacterBase {
    return new CharacterBuilder()
        .setCharacterClass(characterclass)
        .setLevel(level)
        .setLightCone(lc)
        .setAbilityLevels(abilityLevels)
        .build();
}