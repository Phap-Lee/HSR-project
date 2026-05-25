//src\sim\calculations\actionvalue.ts

import { UnitBase } from "../../models/unit.model";

export function ActionValueSetter(unit: UnitBase) {
    return 10000 / unit.spd
}

export function SpeedModified(unit: UnitBase, oldSpeed: number, newSpeed: number) {
    const oldAV = unit.current_av;
    const newAV = oldAV * (oldSpeed / newSpeed);

    return newAV
}

export function ActionValueModified(unit: UnitBase, advance?: number | 0, delay?: number | 0) {
    const oldAV = unit.current_av;
    const baseAV = unit.base_av;
    const newAV = Math.max(0, oldAV - baseAV * ((advance ?? 0 / 100) - (delay ?? 0 / 100)));

    return newAV
}