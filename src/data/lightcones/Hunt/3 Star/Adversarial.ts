import { type StatKey, type StatType } from "../../../../models/type";
import { LightCone } from "../../../../models/lightcone.model";
import { Modifier } from "../../../../models/modifier.model";

export class Adversarial implements LightCone {
    hp: number = 741;
    atk: number = 370;
    def: number = 265;

    onKill(characterId: string): Modifier {
    return {
      caster: characterId,
      target: characterId,
      buffid: 'Adversarial',
      stat: 'Spd',
      type: 'percent',
      value: 10,
      turns: 2,
      new: true,
    };
  }
}