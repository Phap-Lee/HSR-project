import { useState } from 'react';
import { createCharacterFromRegistry } from './data/characters/character.registry';
import { Adversarial, Arrows, DartingArrow } from './data/lightcones/Hunt';
import type { LightCone } from './models/lightcone.model';
import type { Modifier } from './models/modifier.model';
import type { EnemyBase } from './models/enemy.model';
import { EnemyBuilder } from './sim/engine/constructors/enemybuilder';
import { FullDamage } from './sim/calculations/damage/damage.normal';

const lightconeConstructors: Record<string, new () => LightCone> = {
  Adversarial,
  Arrows,
  DartingArrow,
};

function buildEnemy(level: 80 | 90): EnemyBase {
  return new EnemyBuilder()
    .setBasics('tester_01', 'Tester Enemy', level)
    .setBaseStats(10000, 100, 300, level === 90 ? 140 : 135)
    .setToughness(100)
    .setWeakness(['Physical', 'Quantum', 'Lightning'])
    .build();
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

type CharacterSlot = {
  id: string;
  characterId: string;
  lightCone: string;
  buffs: Modifier[];
};

function App() {
  const [enemyTeam, setEnemyTeam] = useState<EnemyBase[]>(() => [buildEnemy(80)]);
  const [characterTeam, setCharacterTeam] = useState<CharacterSlot[]>(() => [
    { id: 'slot_0', characterId: 'dan_heng', lightCone: '', buffs: [] }
  ]);
  const [selectedCharacterSlot, setSelectedCharacterSlot] = useState(0);
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState(0);
  const [actionLog, setActionLog] = useState<string[]>([]);

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
    const enemy = enemyTeam[selectedEnemyIndex];
    const basicAbility = character.abilities?.[0];

    if (!basicAbility) return;

    const damage = FullDamage(
      character,
      enemy,
      'Atk',
      basicAbility,
      0,
      basicAbility.total_multi ?? 0
    );

    const toughnessDamage = basicAbility.total_toughnessDmg ?? 0;
    const actualDamage = Math.round(damage);

    setEnemyTeam((prev) => {
      const updated = [...prev];
      updated[selectedEnemyIndex] = {
        ...updated[selectedEnemyIndex],
        toughness: Math.max(0, (updated[selectedEnemyIndex].toughness ?? 0) - toughnessDamage),
        hp: Math.max(0, (updated[selectedEnemyIndex].hp ?? 0) - actualDamage),
      };
      return updated;
    });

    setActionLog((previous) => [
      `${character.name} used ${basicAbility.type.join(' / ')} for ${actualDamage} damage`,
      ...previous,
    ].slice(0, 8));
  };

  const getCharacterDisplay = (slot: CharacterSlot) => {
    return buildCharacter(slot.characterId, slot.lightCone, slot.buffs);
  };

  const currentCharacter = getCharacterDisplay(characterTeam[selectedCharacterSlot]);
  const currentEnemy = enemyTeam[selectedEnemyIndex];

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#111827', minHeight: '100vh', color: '#f9fafb' }}>
      <h1>HSR Combat Simulator</h1>
      <p style={{ color: '#d1d5db' }}>Build your team and battle!</p>

      {/* Enemy Team Row */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Enemy Team</h2>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {enemyTeam.map((enemy, index) => (
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
          ))}
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

        {/* Combat Log */}
        <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#1f2937', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)' }}>
          <h3 style={{ marginTop: 0 }}>Combat Log</h3>
          {actionLog.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No actions yet.</p>
          ) : (
            <ul style={{ paddingLeft: '1.2rem', color: '#e5e7eb', margin: 0, fontSize: '0.9rem' }}>
              {actionLog.map((entry, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>{entry}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
