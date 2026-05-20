## Plan: HSR Combat Simulator Web App

Build a new React + TypeScript web app in the current workspace that simulates Honkai Star Rail combat, supports 4-character team gear and custom enemy lineups, and provides a detailed turn-by-turn battle log with buff/status tracking.

**Steps**
1. Initialize the project scaffold in the workspace.
   - Create package.json, tsconfig.json, vite.config.ts, index.html, and public assets.
   - Use Vite + React + TypeScript as the frontend framework.
   - Add dev dependencies for React, TypeScript, Vite, and optionally Vitest for unit tests.
2. Design the simulation domain model.
   - Define core simulation types in `src/types/sim.ts` for characters, stats, gear, enemies, skills, buffs, turn actions, and results.
   - Implement simulation engine functions in `src/sim/engine.ts` with accurate combat flow, damage calculation, buff application, and turn resolution.
   - Support a 4-character team, custom enemy lineups, and configurable stats/gear.
3. Build sample data and loadouts.
   - Create starter data files in `src/data/` for characters, gear sets, and enemy templates.
   - Provide sample teams and enemy compositions to validate the sim.
4. Create application state and UI.
   - Implement application shell in `src/App.tsx` with route/state layout.
   - Build components: TeamBuilder, GearEditor, EnemyLineupEditor, SimulationControls, BattleLog, TurnSummary, BuffPanel, and TeamComparison.
   - Use React state or context (`src/context/SimulationContext.tsx`) to manage team setup, enemy lineup, simulation config, and results.
5. Implement battle reporting and comparison.
   - Display detailed simulation results: per-turn actions, damage breakdown, buff/debuff status, skill usage, and final metrics.
   - Add comparison views for teammate setups and damage output across alternate teams.
6. Add validation and test coverage.
   - Add unit tests for simulation engine functions and core stat calculations.
   - Confirm the app renders team editor, enemy lineup editor, and result panels.

**Verification**
1. Run `npm install` and `npm run dev` to verify the new app starts successfully.
2. Create a sample 4-character team and custom enemy lineup in the UI.
3. Run a simulation and verify the battle log shows per-turn actions, damage, buffs, and character details.
4. Validate the simulator with unit tests for damage calculation and turn resolution.

**Decisions**
- Use React + TypeScript with Vite for a clean, modern client-side web app.
- Focus on client-side simulation now; backend/API can be added later once the core sim is complete.
- Build a modular engine and UI so team comparison and export features can be added incrementally.
