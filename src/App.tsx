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

const lightconeConstructors: Record<string, new () => LightCone> = {
  Adversarial,
  Arrows,
  DartingArrow,
};

function buildEnemy(id: string, level: 80 | 90 = 80): EnemyBase {
  return createEnemyFromRegistry(id, level);
}

function buildCharacter(id: string, selectedLightCone: string, buffs: Modifier[]) {
  const lightCone = selectedLightCone
    ? new lightconeConstructors[selectedLightCone]()
    : undefined;

  const character = createCharacterFromRegistry(id, 80, lightCone);
  
  // Apply all buffs to the character so damage calculations pick them up
  if (!character.modifiers) character.modifiers = [];
  character.modifiers.push(...buffs);

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
};

interface LogEntry {
  id: string;
  summary: string;
  math: {
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
  totalDamage: number;
}

function App() {
  // Helper to initialize an enemy slot with base stats
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
    { id: 'slot_0', characterId: 'dan_heng', lightCone: '', buffs: [] }
  ]);
  const [selectedCharacterSlot, setSelectedCharacterSlot] = useState(0);
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState(0);
  const [actionLog, setActionLog] = useState<LogEntry[]>([]);

  const handleAddBuff = () => {
    const slot = characterTeam[selectedCharacterSlot];
    const newBuff: Modifier = {
      caster: 'Player',
      target: 'char_0',
      stat: 'Atk',
      type: 'percent',
      value: 20,
      turns: 2,
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
    const slot = characterTeam[selectedCharacterSlot];
    const character = buildCharacter(slot.characterId, slot.lightCone, slot.buffs);
    const enemySlot = enemyTeam[selectedEnemyIndex];
    const enemy = getEnemyDisplay(enemySlot);
    const basicAbility = character.abilities?.[0];

    if (!basicAbility) return;

    const dmgResult = DamageCalc.FullDamage(character, enemy, 'Atk', basicAbility, 0);

    const toughnessDamage = basicAbility.total_toughnessDmg ?? 0;
    const actualDamage = Math.round(dmgResult.damage);

    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      summary: `${character.name} used ${basicAbility.type.join(' / ')} for ${actualDamage} damage`,
      totalDamage: actualDamage,
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

    setEnemyTeam((prev) => {
      const updated = [...prev];
      updated[selectedEnemyIndex] = {
        ...updated[selectedEnemyIndex],
        toughness: Math.max(0, (updated[selectedEnemyIndex].toughness ?? 0) - toughnessDamage),
        hp: Math.max(0, (updated[selectedEnemyIndex].hp ?? 0) - actualDamage),
      };
      return updated;
    });

    setActionLog((previous) => [newEntry, ...previous].slice(0, 8));
  };

  const getCharacterDisplay = (slot: CharacterSlot) => {
    return buildCharacter(slot.characterId, slot.lightCone, slot.buffs);
  };

  const getEnemyDisplay = (slot: EnemySlot) => {
    const baseEnemy = buildEnemy(slot.enemyId, slot.level);
    return {
      ...baseEnemy,
      hp: slot.hp ?? baseEnemy.hp,
      toughness: slot.toughness ?? baseEnemy.toughness,
    };
  };

  const currentCharacter = getCharacterDisplay(characterTeam[selectedCharacterSlot]);
  const currentEnemy = getEnemyDisplay(enemyTeam[selectedEnemyIndex]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#111827', minHeight: '100vh', color: '#f9fafb' }}>
      <h1>HSR Combat Simulator</h1>
      <p style={{ color: '#d1d5db' }}>Build your team and battle!</p>

      {/* Enemy Team Row */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Enemy Team</h2>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {enemyTeam.map((slot, index) => {
            const enemy = getEnemyDisplay(slot);
            return (
              <div
                key={index}
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
                  <div><span style={{ color: '#9ca3af' }}>Weak:</span> {enemy.weakness[0]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Team Row */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Character Team</h2>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {characterTeam.map((slot, index) => {
            const char = getCharacterDisplay(slot);
            return (
              <div
                key={index}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><span style={{ color: '#9ca3af' }}>HP:</span> {Math.round(char.hp)}</div>
                  <div><span style={{ color: '#9ca3af' }}>ATK:</span> {Math.round(char.atk)}</div>
                  <div><span style={{ color: '#9ca3af' }}>DEF:</span> {Math.round(char.def)}</div>
                  <div><span style={{ color: '#9ca3af' }}>SPD:</span> {Math.round(char.spd)}</div>
                  <div><span style={{ color: '#9ca3af' }}>CR:</span> {char.cr}%</div>
                  <div><span style={{ color: '#9ca3af' }}>CD:</span> {char.cdmg}%</div>
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
            onClick={handleBasicAttack}
            style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', fontWeight: 700, width: '100%' }}
          >
            Use Basic Attack
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
                          (<span style={{ color: '#fbbf24' }}>{entry.math.atk} ATK</span> × <span style={{ fontWeight: 'bold' }}>{(entry.math.multiplier)}%</span>)
                          × <span style={{ color: entry.math.didCrit ? '#f43f5e' : '#e5e7eb', fontWeight: entry.math.didCrit ? 'bold' : 'normal' }}>
                            {entry.math.critMultiplier.toFixed(2)}CRIT
                          </span> x 
                          (1 + <span style={{ color: '#34d399' }}>{(entry.math.bonus).toFixed(1)}% BONUS</span>) × <span style={{ color: '#f59e0b' }}>{(entry.math.def * 100)} DEF</span> × <span style={{ color: '#22d3ee' }}>{(entry.math.res * 100)}% RES</span> × <span style={{ color: '#f87171' }}>{(entry.math.vul * 100)}% VUL</span> × <span style={{ color: '#a78bfa' }}>{(entry.math.broken * 100)}% BROKEN</span>
                        </div>
                        
                        {/* Specific Stat Display */}
                        <div style={{ marginTop: '8px', color: '#fbbf24', fontSize: '0.8rem' }}>
                          {entry.damageBonusType}: {(entry.math.bonus).toFixed(1)}%
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
