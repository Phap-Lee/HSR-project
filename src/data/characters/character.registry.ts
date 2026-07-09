import type { Level } from "../../models/type";
import type { CharacterBase } from "../../models/character.model";
import type { LightCone } from "../../models/lightcone.model";
import { createDanHengCharacter } from "./Wind/4 Star/DanHeng/DanHeng.base";

export type CharacterDefinition = {
    id: string;
    name: string;
    create: (level?: Level, lc?: LightCone) => CharacterBase;
};

export const characterRegistry: Record<string, CharacterDefinition> = {
    dan_heng: {
        id: "dan_heng",
        name: "Dan Heng",
        create: createDanHengCharacter,
    },
};

export function registerCharacter(definition: CharacterDefinition): void {
    characterRegistry[definition.id] = definition;
}

export function createCharacterFromRegistry(
    id: string,
    level: Level = 1,
    lc?: LightCone
): CharacterBase {
    const definition = characterRegistry[id];

    if (!definition) {
        throw new Error(`Unknown character id: ${id}`);
    }

    return definition.create(level, lc);
}

export function getCharacterIds(): string[] {
    return Object.keys(characterRegistry);
}
