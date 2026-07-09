import type { CharacterBase } from "../../../models/character.model";
import type { LightCone } from "../../../models/lightcone.model";
import type { Elements, Level, LevelStats, StatKey } from "../../../models/type";
import * as utils from "../../utils/utils";
import * as avHandler from "../../calculations/actionvalue";

export type CharacterInitializationConfig = {
    levelStats: Record<Level, LevelStats>;
};

function getElementDamageBonusStatKey(element: Elements): StatKey {
    switch (element) {
        case "Fire":
            return "Fire_DMG_Bonus";
        case "Ice":
            return "Ice_DMG_Bonus";
        case "Imaginary":
            return "Imaginary_DMG_Bonus";
        case "Physical":
            return "Physical_DMG_Bonus";
        case "Quantum":
            return "Quantum_DMG_Bonus";
        case "Lightning":
            return "Lightning_DMG_Bonus";
        case "Wind":
        default:
            return "Wind_DMG_Bonus";
    }
}

export function initializeCharacter(
    character: CharacterBase,
    level: Level,
    lc: LightCone | undefined,
    config: CharacterInitializationConfig
): void {
    character.level = level;
    const stats = config.levelStats[level];
    character.lc = lc;

    character.base_hp = stats.hp + (lc?.hp ?? 0);
    character.hp = utils.getEffectiveStat(character, "Hp", character.base_hp);

    character.base_atk = stats.atk + (lc?.atk ?? 0);
    character.atk = utils.getEffectiveStat(character, "Atk", character.base_atk);

    character.base_def = stats.def + (lc?.def ?? 0);
    character.def = utils.getEffectiveStat(character, "Def", character.base_def);

    character.spd = utils.getEffectiveStat(character, "Spd", character.base_spd);
    character.base_av = avHandler.ActionValueSetter(character);
    character.current_av = character.base_av;

    const damageBonusStat = getElementDamageBonusStatKey(character.element);
    const elementBonus = utils.getTotalsForStat(character, damageBonusStat).percent;

    character.damageBonuses = {
        all: 0,
        basic: 0,
        skill: 0,
        ultimate: 0,
        fua: 0,
        dot: 0,
        element: { [character.element]: elementBonus },
    };

    character.resPen = {
        all: 0,
        element: { [character.element]: 0 },
    };

    character.defIgnore = {
        all: 0,
        basic: 0,
        skill: 0,
        ultimate: 0,
        fua: 0,
        dot: 0,
        element: { [character.element]: 0 },
    };

    character.taunt = character.base_taunt * (1 + character.taunt_multi / 100);
    character.currentEnergy = character.maxEnergy / 2;
}
