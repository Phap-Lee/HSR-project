//src\sim\engine\characterbuilder.ts

import { CharacterBase } from "../../../models/character.model";
import { LightCone } from "../../../models/lightcone.model";

type CharacterConstructor = new (
    level?: number,
    lc?: LightCone
) => CharacterBase;

export class CharacterBuilder {
    private characterClass?: CharacterConstructor;
    private level?: number;
    private lc?: LightCone;

    setCharacterClass(characterClass: CharacterConstructor): this {
        this.characterClass = characterClass;
        return this;
    }

    setLevel(level: number): this {
        this.level = level;
        return this;
    }

    setLightCone(lc: LightCone | undefined): this {
        this.lc = lc;
        return this;
    }

    build(): CharacterBase {
        if (!this.characterClass) {
            throw new Error('Must set the character class before building');
        }
        return new this.characterClass(this.level, this.lc);
    }
}

export function CharacterFactory(
    characterclass: CharacterConstructor,
    level: number,
    lc?: LightCone
): CharacterBase {
    return new CharacterBuilder()
        .setCharacterClass(characterclass)
        .setLevel(level)
        .setLightCone(lc)
        .build();
}