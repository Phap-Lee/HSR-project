import { useMemo, useState } from 'react';
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

function App() {
  const [selectedLightCone, setSelectedLightCone] = useState('');
  const [buffs, setBuffs] = useState<Modifier[]>([]);
  const [enemyLevel, setEnemyLevel] = useState<80 | 90>(80);
  const [enemy, setEnemy] = useState<EnemyBase>(() => buildEnemy(80));
  const [actionLog, setActionLog] = useState<string[]>([]);

  const danHeng = useMemo(() => {
    const lightCone = selectedLightCone
      ? new lightconeConstructors[selectedLightCone]()
      : undefined;

    return createCharacterFromRegistry('dan_heng', 80, lightCone);
  }, [selectedLightCone]);

  const handleAddBuff = () => {
    const newBuff: Modifier = {
      caster: 'Player',
      target: danHeng.id,
      stat: 'Atk',
      type: 'percent',
      value: 20,
      turns: 2,
    };

    // Add buff to local UI state
    setBuffs((previous) => [...previous, newBuff]);

    // Also register it on the character so calculations pick it up
    if (!danHeng.modifiers) danHeng.modifiers = [];
    danHeng.modifiers.push(newBuff as any);
  };

  const handleBasicAttack = () => {
    const basicAbility = danHeng.abilities?.[0];

    if (!basicAbility) {
      return;
    }

    const damage = FullDamage(
      danHeng,
      enemy,
      'Atk',
      basicAbility,
      0,
      basicAbility.total_multi ?? 0
    );

    const toughnessDamage = basicAbility.total_toughnessDmg ?? 0;

    const actualDamage = Math.round(damage);

    setEnemy((previous) => ({
      ...previous,
      toughness: Math.max(0, (previous.toughness ?? 0) - toughnessDamage),
      hp: Math.max(0, (previous.hp ?? 0) - actualDamage),
    }));

    setActionLog((previous) => [
      `Dan Heng used ${basicAbility.type.join(' / ')} for ${actualDamage} damage (enemy HP: ${Math.max(0, Math.round(enemy.hp) - actualDamage)})`,
      ...previous,
    ].slice(0, 5));
  };

  const totalAtkBuffPercent = buffs
    .filter((buff) => buff.stat === 'Atk' && buff.type === 'percent')
    .reduce((total, buff) => total + buff.value, 0);

  const statRows = [
    { label: 'HP', value: Math.round(danHeng.hp) },
    { label: 'ATK', value: Math.round(danHeng.atk * (1 + totalAtkBuffPercent / 100)) },
    { label: 'DEF', value: Math.round(danHeng.def) },
    { label: 'SPD', value: Math.round(danHeng.spd) },
    { label: 'CR', value: `${danHeng.cr}%` },
    { label: 'CDMG', value: `${danHeng.cdmg}%` },
  ];

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#111827', minHeight: '100vh', color: '#f9fafb' }}>
      <h1>HSR Combat Simulator</h1>
      <p style={{ color: '#d1d5db' }}>Dan Heng and a test enemy can now be built and inspected in the app.</p>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: '1.5rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#1f2937', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: '0.25rem' }}>{danHeng.name}</h2>
              <p style={{ marginTop: 0, color: '#93c5fd' }}>{danHeng.path} • {danHeng.element}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                Light Cone
                <select
                  value={selectedLightCone}
                  onChange={(event) => setSelectedLightCone(event.target.value)}
                  style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #4b5563', background: '#111827', color: 'white' }}
                >
                  <option value="">None</option>
                  <option value="Adversarial">Adversarial</option>
                  <option value="Arrows">Arrows</option>
                  <option value="DartingArrow">DartingArrow</option>
                </select>
              </label>
              <button
                onClick={handleAddBuff}
                style={{ padding: '0.75rem 1rem', borderRadius: '999px', border: 'none', background: '#60a5fa', color: 'white', cursor: 'pointer', fontWeight: 700 }}
              >
                Add ATK Buff
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            {statRows.map((stat) => (
              <div key={stat.label} style={{ padding: '0.75rem', borderRadius: '12px', background: '#374151' }}>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{stat.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Active Buffs</h3>
            {buffs.length === 0 ? (
              <p style={{ color: '#9ca3af', margin: 0 }}>No buffs applied yet.</p>
            ) : (
              <ul style={{ paddingLeft: '1.2rem', color: '#e5e7eb', margin: 0 }}>
                {buffs.map((buff, index) => (
                  <li key={`${buff.stat}-${index}`}>
                    {buff.stat} +{buff.value}% for {buff.turns} turn(s)
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Abilities</h3>
            {(danHeng.abilities ?? []).map((ability, index) => (
              <div key={`${ability.type.join('-')}-${index}`} style={{ padding: '0.75rem', borderRadius: '10px', background: '#374151', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700 }}>{ability.type.join(' / ')}</div>
                <div style={{ color: '#d1d5db', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                  Target: {ability.target} • SP Gain: {ability.spGain ?? 0}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Multi: {ability.total_multi ?? 0}% • Toughness: {ability.total_toughnessDmg ?? 0} • Energy: {ability.total_energy}
                </div>
              </div>
            ))}
            <button
              onClick={handleBasicAttack}
              style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', borderRadius: '999px', border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', fontWeight: 700 }}
            >
              Use Basic Attack
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Combat Log</h3>
            {actionLog.length === 0 ? (
              <p style={{ color: '#9ca3af', margin: 0 }}>No actions taken yet.</p>
            ) : (
              <ul style={{ paddingLeft: '1.2rem', color: '#e5e7eb', margin: 0 }}>
                {actionLog.map((entry, index) => (
                  <li key={`${entry}-${index}`}>{entry}</li>
                ))}
              </ul>
            )}
          </div>

          <h3 style={{ marginBottom: '0.5rem' }}>Traces</h3>
          <ul style={{ paddingLeft: '1.2rem', color: '#e5e7eb' }}>
            {(danHeng.traces ?? []).map((trace) => (
              <li key={`${trace.key}-${trace.type}`}>
                {trace.key}: {trace.value}% {trace.type}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#1f2937', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: '0.25rem' }}>{enemy.name}</h2>
              <p style={{ marginTop: 0, color: '#93c5fd' }}>Level {enemy.level} • {enemy.weakness.join(', ')}</p>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: '#d1d5db' }}>
              Enemy Level
              <select
                value={enemyLevel}
                onChange={(event) => {
                  const nextLevel = Number(event.target.value) as 80 | 90;
                  setEnemyLevel(nextLevel);
                  setEnemy(buildEnemy(nextLevel));
                }}
                style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #4b5563', background: '#111827', color: 'white' }}
              >
                <option value={80}>80</option>
                <option value={90}>90</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { label: 'HP', value: Math.round(enemy.hp) },
              { label: 'ATK', value: Math.round(enemy.atk) },
              { label: 'DEF', value: Math.round(enemy.def) },
              { label: 'SPD', value: Math.round(enemy.spd) },
              { label: 'Toughness', value: Math.round(enemy.toughness) },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: '0.75rem', borderRadius: '12px', background: '#374151' }}>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{stat.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: '0.5rem' }}>Weaknesses</h3>
          <p style={{ color: '#e5e7eb', margin: 0 }}>{enemy.weakness.join(', ')}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
