import { useState } from 'react';
import './App.css';
import { createCharacterFromRegistry } from './data/characters/character.registry';
import { createEnemyFromRegistry } from './data/enemies/enemy.registry';
import { Adversarial, Arrows, DartingArrow } from './data/lightcones/Hunt';
import type { LightCone } from './models/lightcone.model';
import type { Modifier } from './models/modifier.model';
import type { EnemyBase } from './models/enemy.model';
import * as DamageCalc from './sim/calculations/damage/damage.normal';
import { isBroken } from './sim/calculations/damage/damage.toughness';
import { AbilityLevel } from './models/type';
import * as utils from './sim/utils/utils';

const lightconeConstructors: Record<string, new () => LightCone> = {
  Adversarial,
  Arrows,
  DartingArrow,
};

function buildEnemy(id: string, level: 80 | 90 = 80): EnemyBase {
  return createEnemyFromRegistry(id, level);
}

function buildCharacter(id: string, selectedLightCone: string, buffs: Modifier[], abilityLevels?: { basic: AbilityLevel }) {
  const lightCone = selectedLightCone
    ? new lightconeConstructors[selectedLightCone]()
    : undefined;

  const character = createCharacterFromRegistry(id, 80, lightCone);
  
  if (character.abilities && character.abilities[0] && abilityLevels) {
    const BasicAbilityClass = character.abilities[0].constructor as new (lvl: AbilityLevel) => any;
    character.abilities[0] = new BasicAbilityClass(abilityLevels.basic);
  }

  if (!character.modifiers) character.modifiers = [];
  character.modifiers.push(...buffs);

  const bonuses: Record<string, { percent: number; flat: number }> = {};

  character.modifiers.forEach(buff => {
    if (!bonuses[buff.stat]) {
      bonuses[buff.stat] = { percent: 0, flat: 0 };
    }
    if (buff.type === 'percent') {
      bonuses[buff.stat].percent += buff.value;
    } else if (buff.type === 'flat') {
      bonuses[buff.stat].flat += buff.value;
    }
  });

  character.atk = utils.getEffectiveStat(character, 'Atk', character.base_atk);
  character.spd = utils.getEffectiveStat(character, 'Spd', character.base_spd);
  character.def = utils.getEffectiveStat(character, 'Def', character.base_def);
  character.hp = utils.getEffectiveStat(character, 'Hp', character.base_hp);

  character.cr = utils.getEffectiveStat(character, 'Cr', character.cr);
  character.cdmg = utils.getEffectiveStat(character, 'Cdmg', character.cdmg);

  return character;
}

type EnemySlot = {
  id: string;
  enemyId: string;
  level: 80 | 90;
  hp?: number;
  toughness?: number;
};

type CharacterSlot = {
  id: string;
  characterId: string;
  lightCone: string;
  buffs: Modifier[];
  abilityLevels: {
    basic: AbilityLevel;
    skill: AbilityLevel;
    ultimate: AbilityLevel;
  }
};

interface LogEntry {
  id: string;
  summary: string;
  math?: {
    atk: number;
    multiplier: number;
    bonus: number;
    def: number;
    res: number;
    vul: number;
    broken: number;
    didCrit: boolean;
    critMultiplier: number;
  };
  damageBonusType: string;
  totalDamage?: number;
  hitSplit?: {
    name: string;
    damage: number;
    percent: number;
  }[];
}

type CombatUnit = {
  uid: string;
  name: string;
  isEnemy: boolean;
  teamIndex: number;
  speed: number;
  baseAV: number;
  currentAV: number;
};

const StatRow = ({ label, baseStat, finalStat, isPercent = false }: { label: string, baseStat: number, finalStat: number, isPercent?: boolean }) => {
  // Guard against undefined base stats just in case
  const safeBase = baseStat || 0;
  const safeFinal = finalStat || 0;
  const bonus = Math.round(safeFinal - safeBase);
  const suffix = isPercent ? '%' : '';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{ color: '#9ca3af' }}>{label}:</span>
      <div>
        <span>{Math.round(safeBase)}{suffix}</span>
        {bonus > 0 && (
          <span style={{ color: '#4ade80', marginLeft: '6px', fontWeight: 'bold' }}>
            (+{bonus}{suffix})
          </span>
        )}
        {bonus < 0 && (
          <span style={{ color: '#f87171', marginLeft: '6px', fontWeight: 'bold' }}>
            ({bonus}{suffix})
          </span>
        )}
      </div>
    </div>
  );
};

function App() {
  const createEnemySlot = (enemyId: string, level: 80 | 90 = 80): EnemySlot => {
    const enemy = buildEnemy(enemyId, level);
    return {
      id: `enemy_${Math.random()}`,
      enemyId,
      level,
      hp: enemy.hp,
      toughness: enemy.toughness,
    };
  };

  const [enemyTeam, setEnemyTeam] = useState<EnemySlot[]>(() => [
    createEnemySlot('tester_1', 80),
    createEnemySlot('tester_2', 90),
    createEnemySlot('tester_3', 80),
  ]);
  const [characterTeam, setCharacterTeam] = useState<CharacterSlot[]>(() => [
    { 
      id: 'char_0', // Base ID matches to combat unit uid cleanly
      characterId: 'dan_heng', 
      lightCone: '', 
      buffs: [],
      abilityLevels: { basic: 1, skill: 1, ultimate: 1 } 
    }
  ]);
  const [selectedCharacterSlot, setSelectedCharacterSlot] = useState(0);
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState(0);
  const [actionLog, setActionLog] = useState<LogEntry[]>([]);

  const [battleStarted, setBattleStarted] = useState(false);
  const [timeline, setTimeline] = useState<CombatUnit[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  const getCharacterDisplay = (slot: CharacterSlot) => {
    return buildCharacter(slot.characterId, slot.lightCone, slot.buffs, slot.abilityLevels);
  };

  const getEnemyDisplay = (slot: EnemySlot) => {
    const baseEnemy = buildEnemy(slot.enemyId, slot.level);
    return {
      ...baseEnemy,
      hp: slot.hp ?? baseEnemy.hp,
      toughness: slot.toughness ?? baseEnemy.toughness,
    };
  };

  const startBattle = () => {
    const allUnits: CombatUnit[] = [];

    characterTeam.forEach((charSlot, index) => {
      const char = getCharacterDisplay(charSlot);
      const baseAV = 10000 / char.spd;
      allUnits.push({
        uid: charSlot.id, // Now using the unique string ID!
        name: char.name,
        isEnemy: false,
        teamIndex: index,
        speed: char.spd,
        baseAV: baseAV,
        currentAV: baseAV,
      });
    });

    enemyTeam.forEach((enemySlot, index) => {
      const enemy = getEnemyDisplay(enemySlot);
      const baseAV = 10000 / enemy.spd;
      allUnits.push({
        uid: enemySlot.id, // Now using the unique string ID!
        name: enemy.name,
        isEnemy: true,
        teamIndex: index,
        speed: enemy.spd,
        baseAV: baseAV,
        currentAV: baseAV,
      });
    });

    allUnits.sort((a, b) => a.currentAV - b.currentAV);

    if (allUnits.length > 0) {
      const firstUnit = allUnits[0];
      const timeToAdvance = firstUnit.currentAV;
      
      const startedQueue = allUnits.map(unit => ({
        ...unit,
        currentAV: Math.max(0, unit.currentAV - timeToAdvance)
      }));

      setTimeline(startedQueue);
      setActiveUnitId(startedQueue[0].uid);
    }
    setBattleStarted(true);
  };

  // Modified to handle unit deaths dynamically
  const endTurn = (actingUnitUid: string, deadUnitUid?: string | null) => {
    setTimeline((prevTimeline) => {
      let currentQueue = prevTimeline;
      
      // 0. Intercept and completely remove the dead unit from the timeline queue
      if (deadUnitUid) {
        currentQueue = currentQueue.filter(unit => unit.uid !== deadUnitUid);
      }

      // 1. Reset the AV of the unit that just acted
      let updatedQueue = currentQueue.map(unit => {
        if (unit.uid === actingUnitUid) {
          return { ...unit, currentAV: unit.baseAV }; 
        }
        return unit;
      });

      // Break safely if battle is over
      if (updatedQueue.length === 0) {
        setActiveUnitId(null);
        return updatedQueue;
      }

      // 2. Sort to find who is next
      updatedQueue.sort((a, b) => a.currentAV - b.currentAV);
      const nextUnit = updatedQueue[0];
      
      // 3. Find out how much time needs to pass for the next unit to act
      const timeToAdvance = nextUnit.currentAV;

      // 4. Subtract that time from EVERYONE's clock
      updatedQueue = updatedQueue.map(unit => ({
        ...unit,
        currentAV: Math.max(0, unit.currentAV - timeToAdvance)
      }));

      setActiveUnitId(nextUnit.uid);
      return updatedQueue;
    });
  };

  const handleAddBuff = () => {
    const slot = characterTeam[selectedCharacterSlot];
    const newBuff: Modifier = {
      caster: 'Player',
      target: 'char_0',
      buffid: 'tester_buff',
      stat: 'Atk',
      type: 'percent',
      value: 20,
      turns: 2,
      new: true,
    };

    setCharacterTeam((prev) => {
      const updated = [...prev];
      updated[selectedCharacterSlot] = {
        ...slot,
        buffs: [...slot.buffs, newBuff],
      };
      return updated;
    });
  };

  const handleBasicAttack = () => {
    if (!battleStarted) return;
    const slot = characterTeam[selectedCharacterSlot];
    if (activeUnitId !== slot.id) return;

    const enemySlot = enemyTeam[selectedEnemyIndex];
    if (!enemySlot) return; // Prevent crashes if clicked with 0 enemies
    
    const character = buildCharacter(slot.characterId, slot.lightCone, slot.buffs, slot.abilityLevels);
    const enemy = getEnemyDisplay(enemySlot);
    const basicAbility = character.abilities?.[0];

    if (!basicAbility) return;

    const dmgResult = DamageCalc.FullDamage(character, enemy, 'Atk', basicAbility, 0);

    const toughnessDamage = basicAbility.total_toughnessDmg ?? 0;
    const actualDamage = Math.round(dmgResult.damage);

    const hitSplitData = (basicAbility.hits ?? []).map((hit, idx) => {
      const totalWeight = (basicAbility.hits ?? []).reduce((s, h) => s + h.value, 0);
      const percentage = (hit.value / totalWeight);
      return {
        name: `Hit ${idx + 1}`,
        damage: Math.round(actualDamage * percentage),
        percent: Math.round(percentage * 100)
    };

    
  });

    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      summary: `${character.name} used ${basicAbility.type.join(' / ')} for ${actualDamage} damage`,
      totalDamage: actualDamage,
      hitSplit: hitSplitData,
      damageBonusType: `${character.element} DMG Bonus`,
      math: {
        atk: character.atk,
        multiplier: basicAbility.total_multi ?? 0,
        bonus: character.damageBonuses?.element?.[character.element] ?? 0,
        def: DamageCalc.getDefMult(character, basicAbility, enemy),
        res: DamageCalc.getResistanceMultiplier(character, enemy, basicAbility),
        vul: DamageCalc.getVulnerabilityMultiplier(character, enemy, basicAbility),
        broken: isBroken(enemy) ? 1 : 0.9,
        didCrit: dmgResult.didCrit,
        critMultiplier: dmgResult.critMultiplier,
      }
    };

    // --- NEW: Calculate Death States ---
    const finalHp = Math.max(0, (enemySlot.hp ?? 0) - actualDamage);
    const finalToughness = Math.max(0, (enemySlot.toughness ?? 0) - toughnessDamage);
    const targetDied = finalHp <= 0;

    // Apply the damage & conditionally filter out the enemy row
    setEnemyTeam((prev) => {
      const updated = [...prev];
      updated[selectedEnemyIndex] = {
        ...updated[selectedEnemyIndex],
        toughness: finalToughness,
        hp: finalHp,
      };
      return updated.filter(e => (e.hp ?? 0) > 0);
    });

    if (targetDied && character.lc && typeof character.lc.onKill === 'function') {
      // Generate the buff payload from the Light Cone
      const killBuff = character.lc.onKill(character.id);

      // Apply the buff to the active character's state array
      setCharacterTeam((prev) => {
        const updated = [...prev];
        const activeChar = updated[selectedCharacterSlot];
        
        // 1. Look for an existing buff with the exact same buffid
        const existingBuffIndex = activeChar.buffs.findIndex(b => b.buffid === killBuff.buffid);
        
        let newBuffs;
        
        if (existingBuffIndex >= 0) {
          // 2a. Buff exists! Copy the array and overwrite the existing buff 
          // to refresh its duration (turns) to the maximum
          newBuffs = [...activeChar.buffs];
          newBuffs[existingBuffIndex] = {
            ...newBuffs[existingBuffIndex],
            turns: killBuff.turns, // Resets the duration
            new: true,
          };
        } else {
          // 2b. Buff does not exist! Append it normally
          newBuffs = [...activeChar.buffs, killBuff];
        }

        updated[selectedCharacterSlot] = {
          ...activeChar,
          buffs: newBuffs
        };
        
        return updated;
      });

      setActionLog((previous) => [{
        id: `buff_${Date.now()}`,
        summary: `${character.name}'s Adversarial triggered! SPD increased by 10% for 2 turns.`,
        damageBonusType: 'Buff',
      }, ...previous].slice(0, 8));
    }

    // Reset the target index to 0 so the UI selector doesn't break
    if (targetDied) {
      setSelectedEnemyIndex(0);
    }

    setActionLog((previous) => [newEntry, ...previous].slice(0, 8));

    setCharacterTeam((prev) => {
      const updated = [...prev];
      const activeChar = updated[selectedCharacterSlot];
      
      if (activeChar.buffs && activeChar.buffs.length > 0) {
        // 1. Process the tick downs
        const processedBuffs = activeChar.buffs.map(buff => {
          if (buff.new) {
            // It was applied THIS turn. Remove the 'new' flag, keep turns the same.
            return { ...buff, new: false };
          }
          // It was applied on a previous turn. Tick it down!
          return { ...buff, turns: buff.turns - 1 };
        });

        // 2. Filter out expired buffs (turns <= 0)
        const survivingBuffs = processedBuffs.filter(buff => buff.turns > 0);

        updated[selectedCharacterSlot] = {
          ...activeChar,
          buffs: survivingBuffs
        };
      }
      return updated;
    });
    
    // Pass the dead unit's ID to endTurn so it drops from the timeline tracking
    endTurn(activeUnitId, targetDied ? enemySlot.id : null);
  };

  const currentCharacter = getCharacterDisplay(characterTeam[selectedCharacterSlot]);
  const currentEnemy = enemyTeam.length > 0 ? getEnemyDisplay(enemyTeam[selectedEnemyIndex]) : null;

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#111827', minHeight: '100vh', color: '#f9fafb' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>HSR Combat Simulator</h1>
          <p style={{ color: '#d1d5db', marginTop: '0.5rem' }}>Speed-Based Action Value Edition</p>
        </div>
        {!battleStarted && (
          <button onClick={startBattle} style={{ padding: '1rem 2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
            Enter Battle
          </button>
        )}
      </div>

      {/* Action Order Timeline */}
      {battleStarted && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1f2937', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Action Order</h3>
            {activeUnitId?.startsWith('enemy_') && (
              <button 
                onClick={() => endTurn(activeUnitId)} 
                style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Skip Enemy Turn (Simulate AI)
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {timeline.map((unit) => (
              <div key={unit.uid} style={{
                padding: '0.75rem 1rem',
                background: activeUnitId === unit.uid ? '#f59e0b' : '#374151',
                color: activeUnitId === unit.uid ? '#111827' : '#f3f4f6',
                borderRadius: '12px',
                minWidth: '130px',
                textAlign: 'center',
                border: activeUnitId === unit.uid ? '2px solid #fbbf24' : '2px solid transparent',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{unit.name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>AV: {Math.round(unit.currentAV)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enemy Team Row */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Enemy Team</h2>
        {enemyTeam.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#064e3b', color: '#34d399', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Victory! All enemies defeated.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {enemyTeam.map((slot, index) => {
              const enemy = getEnemyDisplay(slot);
              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedEnemyIndex(index)}
                  style={{
                    minWidth: '280px',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: selectedEnemyIndex === index ? '#374151' : '#1f2937',
                    border: selectedEnemyIndex === index ? '2px solid #60a5fa' : '1px solid #4b5563',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{enemy.name}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                    Lvl {enemy.level}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div><span style={{ color: '#9ca3af' }}>HP:</span> {Math.round(enemy.hp)}</div>
                    <div><span style={{ color: '#9ca3af' }}>ATK:</span> {Math.round(enemy.atk)}</div>
                    <div><span style={{ color: '#9ca3af' }}>DEF:</span> {Math.round(enemy.def)}</div>
                    <div><span style={{ color: '#9ca3af' }}>SPD:</span> {Math.round(enemy.spd)}</div>
                    <div><span style={{ color: '#9ca3af' }}>Tough:</span> {Math.round(enemy.toughness)}</div>
                    <div><span style={{ color: '#9ca3af' }}>Weak:</span> {enemy.weakness.join(', ')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Character Team Row */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Character Team</h2>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {characterTeam.map((slot, index) => {
            const char = getCharacterDisplay(slot);
            return (
              <div
                key={slot.id}
                onClick={() => setSelectedCharacterSlot(index)}
                style={{
                  minWidth: '280px',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: selectedCharacterSlot === index ? '#374151' : '#1f2937',
                  border: selectedCharacterSlot === index ? '2px solid #60a5fa' : '1px solid #4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{char.name}</h3>
                <div style={{ fontSize: '0.9rem', color: '#93c5fd', marginBottom: '0.75rem' }}>
                  {char.element} • {char.path}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <StatRow label="HP" baseStat={char.base_hp} finalStat={char.hp} />
                  <StatRow label="ATK" baseStat={char.base_atk} finalStat={char.atk} />
                  <StatRow label="DEF" baseStat={char.base_def} finalStat={char.def} />
                  <StatRow label="SPD" baseStat={char.base_spd} finalStat={char.spd} />
                  
                  {/* Keeping CR/CD static unless you add base_cr and base_cdmg to your models later */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ color: '#9ca3af' }}>CR:</span>
                    <span>{char.cr}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ color: '#9ca3af' }}>CD:</span>
                    <span>{char.cdmg}%</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Active Character Details & Controls */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Character Detail Panel */}
        <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#1f2937', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)' }}>
          <h3 style={{ marginTop: 0 }}>Character</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#d1d5db' }}>
              Light Cone
              <select
                value={characterTeam[selectedCharacterSlot].lightCone}
                onChange={(event) => {
                  setCharacterTeam((prev) => {
                    const updated = [...prev];
                    updated[selectedCharacterSlot] = {
                      ...updated[selectedCharacterSlot],
                      lightCone: event.target.value,
                    };
                    return updated;
                  });
                }}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #4b5563', background: '#111827', color: 'white' }}
              >
                <option value="">None</option>
                <option value="Adversarial">Adversarial</option>
                <option value="Arrows">Arrows</option>
                <option value="DartingArrow">DartingArrow</option>
              </select>
            </label>
          </div>

          {/* Ability Level Select Dropdown */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#d1d5db' }}>
              Basic Attack Level
              <select
                value={characterTeam[selectedCharacterSlot].abilityLevels?.basic ?? 1}
                onChange={(event) => {
                  const newLevel = Number(event.target.value) as AbilityLevel;
                  setCharacterTeam((prev) => {
                    const updated = [...prev];
                    updated[selectedCharacterSlot] = {
                      ...updated[selectedCharacterSlot],
                      abilityLevels: {
                        ...updated[selectedCharacterSlot].abilityLevels,
                        basic: newLevel,
                      },
                    };
                    return updated;
                  });
                }}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #4b5563', background: '#111827', color: 'white' }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Lv. {lvl}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={handleAddBuff}
            style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: '#60a5fa', color: 'white', cursor: 'pointer', fontWeight: 700, width: '100%' }}
          >
            Add ATK Buff
          </button>

          <h4>Buffs ({characterTeam[selectedCharacterSlot].buffs.length})</h4>
          {characterTeam[selectedCharacterSlot].buffs.length === 0 ? (
            <p style={{ color: '#9ca3af', margin: 0 }}>None</p>
          ) : (
            <ul style={{ paddingLeft: '1.2rem', color: '#e5e7eb', margin: 0 }}>
              {characterTeam[selectedCharacterSlot].buffs.map((buff, i) => (
                <li key={i}>{buff.stat} +{buff.value}%</li>
              ))}
            </ul>
          )}

          <h4 style={{ marginTop: '1rem' }}>Abilities</h4>
          {(currentCharacter.abilities ?? []).map((ability, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#d1d5db' }}>
              <div style={{ fontWeight: 700 }}>{ability.type.join(' / ')}</div>
              <div style={{ color: '#9ca3af' }}>DMG: {ability.total_multi}% • Tough: {ability.total_toughnessDmg}</div>
            </div>
          ))}

          <button
            disabled={!battleStarted || enemyTeam.length === 0 || activeUnitId !== characterTeam[selectedCharacterSlot].id}
            onClick={handleBasicAttack}
            style={{ 
              marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', 
              background: (!battleStarted || enemyTeam.length === 0 || activeUnitId !== characterTeam[selectedCharacterSlot].id) ? '#4b5563' : '#f59e0b', 
              color: 'white', 
              cursor: (!battleStarted || enemyTeam.length === 0 || activeUnitId !== characterTeam[selectedCharacterSlot].id) ? 'not-allowed' : 'pointer', 
              fontWeight: 700, width: '100%',
              transition: 'background 0.3s'
            }}
          >
            {!battleStarted ? 'Start Battle to Attack' : (enemyTeam.length === 0 ? 'Battle Complete' : (activeUnitId !== characterTeam[selectedCharacterSlot].id ? 'Waiting for Turn...' : 'Use Basic Attack'))}
          </button>
        </div>

        {/* Combat Log Container */}
        <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#1f2937', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)', color: '#e5e7eb' }}>
          <h3 style={{ marginTop: 0 }}>Combat Log</h3>
          {actionLog.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No actions yet.</p>
          ) : (
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
              {actionLog.map((entry) => (
                <li key={entry.id} style={{ marginBottom: '0.8rem', position: 'relative' }}>
                  
                  {/* Main Log Entry with Hover Trigger */}
                  <span className="log-summary">
                    {entry.summary.split(String(entry.totalDamage))[0]}
                    
                    {/* The interactive damage number */}
                    <span className="dmg-trigger" style={{ color: '#f87171', fontWeight: 'bold', cursor: 'help', borderBottom: '1px dashed #f87171' }}>
                      {entry.totalDamage}
                      
                      {/* Tooltip Card contents */}
                      <div className="dmg-tooltip">
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #374151', paddingBottom: '4px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>Single Target</span>
                          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Normal DMG • Basic ATK</span>
                        </div>
                        
                        {/* Formula breakdown */}
                        <div style={{ fontFamily: 'monospace', lineHeight: '1.6', fontSize: '0.85rem' }}>
                          <span style={{ color: '#f87171', fontWeight: 'bold' }}>{entry.totalDamage}</span> = 
                          (<span style={{ color: '#fbbf24' }}>{entry.math?.atk} ATK</span> × <span style={{ fontWeight: 'bold' }}>{(entry.math?.multiplier)}%</span>)
                          × <span style={{ color: entry.math?.didCrit ? '#f43f5e' : '#e5e7eb', fontWeight: entry.math?.didCrit ? 'bold' : 'normal' }}>
                            {entry.math?.critMultiplier.toFixed(2)}CRIT
                          </span> x 
                          (1 + <span style={{ color: '#34d399' }}>{(entry.math?.bonus.toFixed(1))}% BONUS</span>) × <span style={{ color: '#f59e0b' }}>{(entry.math?.def.toFixed(0))}% DEF</span> × <span style={{ color: '#22d3ee' }}>{(entry.math?.res.toFixed(0))}% RES</span> × <span style={{ color: '#f87171' }}>{(entry.math?.vul.toFixed(0))}% VUL</span> × <span style={{ color: '#a78bfa' }}>{(entry.math?.broken.toFixed(0))}% BROKEN</span>
                        </div>

                        {/* Hit Split Box Rendering */}
                        <div style={{ marginTop: '12px', borderTop: '1px dashed #374151', paddingTop: '8px' }}>
                          <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '4px' }}>
                            Hit Split - {entry.hitSplit?.length} Hit(s)
                          </div>
                          {entry.hitSplit?.map((hit, idx) => (
                            <div key={idx} style={{ fontSize: '0.85rem', paddingLeft: '8px' }}>
                              ✦ <span style={{ color: '#9ca3af' }}>{hit.name} - </span>
                              <span style={{ color: '#f87171', fontWeight: 'bold' }}>{hit.damage}</span> 
                              <span style={{ color: '#9ca3af' }}> [{hit.percent}%]</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Specific Stat Display */}
                        <div style={{ marginTop: '8px', color: '#fbbf24', fontSize: '0.8rem' }}>
                          {entry.damageBonusType}: {entry.math?.bonus.toFixed(1)}%
                        </div>
                      </div>

                    </span>
                    {entry.summary.split(String(entry.totalDamage))[1]}
                  </span>
                  
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;