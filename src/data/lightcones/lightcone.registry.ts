import * as HuntLightcones from './Hunt';

export const huntLightconeRegistry = {
  ...HuntLightcones,
};

export const lightconeRegistry = {
  ...HuntLightcones,
  // ...OtherRarities (add more categories as needed)
};

export type LightConeName = keyof typeof lightconeRegistry;
export type LightConeClass = typeof lightconeRegistry[LightConeName];
export type HuntLightConeName = keyof typeof huntLightconeRegistry;
export type HuntLightConeClass = typeof huntLightconeRegistry[HuntLightConeName];

export function getLightCone(name: LightConeName) {
  return lightconeRegistry[name];
}

export function getHuntLightCone(name: HuntLightConeName) {
  return huntLightconeRegistry[name];
}

// Export organized namespaces for direct access
export { HuntLightcones };

