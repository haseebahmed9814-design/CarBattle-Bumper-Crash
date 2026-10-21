<div align="center">

<h1>🏎️ BUMPER CRASH</h1>

<p><strong>2D Top-Down Car Combat Arena · Demolition Derby · Tactical AI Battle · Capture the Flag</strong></p>

<img src="screenshots/Screenshot 2026-10-18 222812.png" alt="Bumper Crash Main Menu" width="850"/>

<br/>

[![Version](https://img.shields.io/badge/Version-v5.0.0-orange?style=for-the-badge)](https://github.com)
[![Language](https://img.shields.io/badge/Built%20With-Vanilla%20JS%20%2B%20HTML5%20Canvas-blue?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)](https://github.com)

> **High-Impact Demolition Derby, Tactical Arena Combat & Capture the Flag** — a fully browser-based 2D top-down car battle game with tactical AI, real-time physics, multi-mode multiplayer, procedurally generated combat effects, a live Power-Up Supply Drop system, and a full **Capture the Flag** objective mode. No dependencies. No frameworks. Pure HTML5 Canvas + Vanilla JavaScript.

</div>

---

## 📖 Table of Contents

- [🎮 About the Game](#-about-the-game)
- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🕹️ Game Modes](#️-game-modes)
- [🚩 Capture the Flag Mode](#-capture-the-flag-mode)
- [⚡ Power-Up Supply Drop System](#-power-up-supply-drop-system)
- [🎯 Controls](#-controls)
- [⚙️ Settings & Customisation](#️-settings--customisation)
- [🧠 AI System](#-ai-system)
- [🗺️ Arena Maps](#️-arena-maps)
- [🏗️ Project Structure](#️-project-structure)
- [🚀 How to Run](#-how-to-run)
- [🔧 Technical Architecture](#-technical-architecture)
- [📊 Telemetry & Analytics](#-telemetry--analytics)
- [🗺️ Roadmap](#️-roadmap)
- [👨‍💻 Developer](#-developer)

---

## 🎮 About the Game

**Bumper Crash** is a browser-based **2D top-down demolition derby** game built entirely from scratch with **Vanilla JavaScript and HTML5 Canvas** — no game engine, no external libraries, no build tools required.

Players choose from multiple game modes: Solo Free-For-All (King of the Ring) against AI, Solo Team Battle (Stadium Squad Siege), head-to-head 1v1 duels, cooperative team battles, full squad vs squad wars, or the all-new **Capture the Flag** objective mode. Each car features a detailed damage model, real-time physics, and tactical AI opponents that flank, drift, and ram with intent.

Starting at v3.1.0, every arena features a live **Power-Up Supply Drop System** — glowing 3D orbs drop from above every 30 seconds carrying Repair Kits, Mega Medkits, Inferno Fire RAM, Titan Armor Shield, or Turbo Speed Boost abilities.

**New in v5.0.0:** A full **Capture the Flag** game mode with animated flag graphics, flag stands, steal/capture progress bars, flag passing between allies, auto-return mechanics — plus **2 brand-new arenas**: Desert Dunes and Frostbite Ice Rink (circular).

The game runs entirely in the browser at 60 FPS and requires no installation.

---

## ✨ Features

### 🚗 Vehicle & Combat System
- **Fully custom 2D physics** — top-down arcade driving with momentum, angular velocity, grip, and drift mechanics
- **Directional damage model** — Front, Rear, Left, Right hit zones each with distinct damage multipliers
- **Progressive car deformation** — dents grow visually as HP decreases; parts fly off mid-battle:
  - Front bumper detaches
  - Rear spoiler & bumper break off
  - Left/right fenders crumple
  - Hood pops open at critical HP
- **Dual exhaust nitro flames** — animated, color-matched to each car's paint scheme (amplified during power-ups)
- **Health bars** — color-coded from green → amber → red with 25% segment tick marks
- **Power-up duration bar** — appears below HP bar while a timed ability is active
- **Floating damage text** — "WRECKED!", "1.2x SIDE SMASH!", "🔥 1.8x INFERNO FIRE HIT!", "🛡️ SHIELD BLOCKED!" and more
- **Shockwave explosions** on car destruction and on supply drop landing

### 🚩 Capture the Flag *(New in v5.0.0)*
- **Full CTF objective mode** with 3 play styles: Solo (1P + allies vs AI), Co-op (2P + allies vs AI), Versus (P1 Squad vs P2 Squad)
- **Animated flag graphics** with waving cloth simulation, gold finial, team-colored fabric
- **Flag stands** — glowing team-colored base circles with steal/capture progress arcs
- **Steal mechanic** — enemies must hold position for 3 seconds to pick up a flag; progress bar shows countdown
- **Capture mechanic** — carrier brings enemy flag to their own base; 2.5s capture arc shows scoring progress
- **Flag passing** — carrier auto-passes to a healthier nearby ally (2-second cooldown between passes)
- **Flag drop & auto-return** — flag dropped on carrier death; returns to base in 3 seconds if unclaimed
- **AI squad roles** — bots automatically assigned ATTACKER or DEFENDER roles based on team size
- **CTF scoring** — captures are tallied live on the Kill Announcer banner; kills are the tiebreaker
- **Minimap integration** — flags and stands appear on the minimap as pulsing icons

### ⚡ Power-Up Supply Drop System *(Added in v3.1.0)*
- **Every 30 seconds** a 3D glowing orb drops from above into the arena (max 3 active at once)
- **5 distinct power-ups** with fully unique 3D rendered logos:
  - 🟢 **Repair Kit** — Instant +65 HP heal + partial dent reduction
  - 🔵 **Mega Medkit** — Full HP restore + all parts repaired + dents cleared
  - 🔥 **Inferno Fire RAM (12s)** — 1.8× damage on hits + 1-second fire singe on victims + orange flame aura + boosted exhaust
  - 🛡️ **Titan Armor Shield (10s)** — Blocks 70% of incoming damage + purple shield aura
  - ⚡ **Turbo Speed Boost (10s)** — 1.45× acceleration + 1.28× top speed + yellow spinning dash aura
- Orbs animate with rotating orbital rings, 3D radial gradient spheres, and a specular glass highlight
- **Kill Announcer banner** alerts all players when a supply drop lands
- Power-up orbs appear on the **minimap** as pulsing colored dots
- Supply drops spawn on **all 4 arena maps**

### 🎨 Visual Effects
- Persistent **tire tracks** (up to 650 in high-detail mode)
- **Spark particle system** on collisions
- **Smoke plumes** — dark or fiery depending on speed and active power-up
- **Flying detached parts** with angular velocity and friction
- **Expanding shockwave rings** on destruction and supply drop impact
- **Floating text** for kill events, power-up pickups, CTF flag events, and announcements
- **Screen shake** scaled to impact force
- **Headlight beam gradients** — per car
- **Slow-motion kill replay** via KillAnnouncer system
- **Power-up visual aura** — flame halo (Inferno), shield bubble (Titan), spinning dashes (Turbo)

### 🎵 Audio (Procedural Web Audio API)
- **No audio files required** — all sounds synthesized at runtime using the Web Audio API
- Countdown beep tones
- Crash impact sounds
- UI click feedback
- Explosion sounds
- **Power-up pickup sounds** — distinct tones for heal vs timed ability pickups

### 🎛️ UI & Menus
- 10+ distinct menu screens with smooth transitions
- **Live car preview canvas** — renders your car in real-time as you pick colors
- **Live arena map preview canvas** — shows selected arena layout on the setup screen
- **Vehicle stat bars** — Top Speed, Drift & Grip, Chassis Armor
- **Player keybind remapper** — remap all controls from the Controls screen
- Match results modal with full per-driver stats
- Integrated **Player Feedback Form** (Web3Forms backend)
- Pause menu with Resume / Restart / Main Menu
- **Spectator Mode** — if your car is wrecked, keep watching remaining bots fight it out
- **Stadium Squad Siege** setup screen with ally/enemy bot count pickers, match rule selector, and time limit pills
- **CTF setup screen** with ally/enemy bot count pickers, CTF type selector, and time limit pills

### 📡 Analytics
- Session telemetry tracked locally in `localStorage`
- Per-mode play count breakdown with visual bar chart
- Player career stats (wins, kills, damage) saved by driver name
- Game Stats screen with lifetime totals

---

## 📸 Screenshots

### 🏠 Main Menu
<img src="screenshots/Screenshot 2026-10-18 222812.png" alt="Main Menu — Bumper Crash v5.0.0" width="100%"/>

> The main menu features animated background AI cars driving and crashing on the Park Ground arena while you browse. Buttons lead to Single Player (King of the Ring & Stadium Squad Siege), Two Players (with 3 sub-modes), Capture the Flag (Solo / Co-op / Versus), a Coming Soon Online Multiplayer mode, Controls, Settings, Game Stats, Credits, and a Feedback form.

---

### ⚙️ Single Player Configuration
<img src="screenshots/Screenshot 2026-10-18 222825.png" alt="Single Player Config — Driver Name, Color Picker, AI Difficulty, Arena Map" width="100%"/>

> Configure your Driver Name, pick from 5 vehicle colors (Electric Blue, Hyper Red, Emerald Green, Cyber Gold, Plasma Purple), set the number of AI opponents (1–8), choose AI Difficulty (Easy / Normal / Hard), and select the Arena Map. A live car preview canvas and live arena map preview render in real-time.

---

### ⚔️ Gameplay — Football Ground (5 AI Opponents)
<img src="screenshots/Screenshot 2026-10-18 222949.png" alt="Gameplay — Single Player Normal, Football Ground, 5 Bots" width="100%"/>

> Active gameplay on the **Football Ground** arena. The player (blue, "PLAYER 1 — 91 HP") battles 5 AI bots simultaneously. The HUD shows mode, player HP, opponent count, camera mode toggle, and pause button. AI cars have tactical rings indicating their team. Tire tracks, headlight beams, and directional hit text are visible. The minimap in the bottom-right shows all active cars and power-up drop positions as colored dots.

---

### 💥 Gameplay — Detached Parts & Critical Damage
<img src="screenshots/Screenshot 2026-10-18 223010.png" alt="Gameplay — Critical Damage, Detached Parts Flying, Tire Tracks" width="100%"/>

> Mid-match chaos: The player is at **44 HP** (amber health bar), surrounded by 4 remaining bots. Detached car parts (bumpers, fenders, spoilers) are visibly flying across the arena. Tire track trails from previous maneuvers crisscross the pitch.

---

### 🏁 Squad War — Countdown & Full Stadium View
<img src="screenshots/Screenshot 2026-10-18 223942.png" alt="Squad War — Timed Siege, 3-Minute Match, 2 Teams of 3, Countdown" width="100%"/>

> **Squad War (Timed Siege)** mode at the countdown stage — "1, START YOUR ENGINES!". Two squads of 3 spawn on opposite ends of the Football Ground. The HUD shows "Player 1 Squad: 3 | Player 2 Squad: 3" with a 3:00 minute timer. The camera is in **Full Stadium view**, revealing the entire arena.

---

## 🕹️ Game Modes

### 1. 🧍 Single Player — King of the Ring *(Classic FFA)*
Battle 1 to 8 AI opponents in a full-circle knockout derby. Supports Easy / Normal / Hard AI difficulty and all 4 arena maps. Cars spawn evenly around the stadium ring with Player 1 always on the left side.

**Win condition:** Destroy every AI opponent. Last car surviving wins.

---

### 2. 🏟️ Single Player — Stadium Squad Siege
Lead your allied squad against an AI enemy squad. Player 1 commands the Left Stadium Arc team. Configure:
- 0–4 allied AI bots on your team
- 1–6 enemy AI bots
- Match Rule: Timed Siege (1–5 min) or Knockout
- AI Difficulty: Easy / Normal / Hard

**HUD shows:** Your HP, Your Squad Alive, Enemy Squad Alive, and timer (Timed Siege).  
**Win condition (Knockout):** Wipe out the entire enemy squad.  
**Win condition (Timed Siege):** Destroy the most enemy squad cars before time expires.

---

### 3. 👥 Two Players (Local Split-Keyboard)

#### ⚔️ 1v1 Duel
Pure head-to-head: Player 1 vs Player 2. No AI. Each player picks their name and car color. The player who destroys the other wins.

**Controls:**
- **Player 1:** `W A S D` + `Space` (drift)
- **Player 2:** `↑ ↓ ← →` + `Right Shift / Enter / Numpad 0` (drift)

#### 🤝 Co-op Alliance (P1 + P2 vs AI)
Both human players form a team and fight an enemy AI squad. Configurable:
- 0–4 allied AI bots on your team
- 1–6 enemy AI bots
- Match Rule: Timed Siege (1–5 min) or Knockout
- AI Difficulty: Easy / Normal / Hard

#### 🏴 Squad War (P1 Team vs P2 Team)
Player 1 commands Squad 1. Player 2 commands Squad 2. Each squad has 1–5 AI bots fighting alongside them.

**Win condition (Timed Siege):** Destroy the most enemy squad cars before the timer hits 00:00.  
**Win condition (Knockout):** Wipe out the entire opposing squad.

---

### 4. 🚩 Capture the Flag *(New in v5.0.0)*

A full objective-based mode where teams steal the enemy's flag and bring it back to their base. See the full [Capture the Flag section](#-capture-the-flag-mode) below.

Three sub-modes:
- **Solo CTF** — Player + ally bots vs Enemy AI squad
- **Co-op CTF** — P1 + P2 + ally bots vs Enemy AI squad
- **Versus CTF** — P1 Squad vs P2 Squad

---

### 5. 🌐 Online Multiplayer *(Coming Soon)*
Real-time online rooms, friend invite codes, and global demolition derby leaderboards — currently in development.

---

## 🚩 Capture the Flag Mode

A full team-based objective mode added in **v5.0.0**. Each team has a **Flag Stand** at opposite ends of the arena. The goal: steal the enemy flag and bring it to your base while protecting your own.

### Flag States
| State | Description |
|---|---|
| **AT_BASE** | Flag is resting at its home stand |
| **CARRIED** | An enemy car has picked it up and is running |
| **DROPPED** | Carrier was destroyed; flag sits on the ground for 3s before auto-return |

### CTF Mechanics
| Mechanic | Detail |
|---|---|
| **Steal** | Enemy must hold position within the stand radius for **3 seconds** to pick up the flag |
| **Carry** | Carrier moves with the flag displayed above their car |
| **Flag Pass** | Carrier automatically passes to a healthier nearby teammate (2s cooldown) |
| **Capture** | Carrier must reach the enemy's own base stand and hold for **2.5 seconds** |
| **Drop** | If carrier is destroyed, flag drops at their location |
| **Auto-Return** | Dropped flag auto-returns to base after **3 seconds** if unclaimed |
| **Friendly Retrieval** | A teammate who touches a dropped own-flag instantly returns it |

### CTF Win Conditions
- **Time expires:** Team with more flag captures wins. If tied, the team with more kills wins. If still tied → Draw.
- **Match duration:** 1–5 minutes (configurable)

### CTF HUD
- **Score banner** shows `P1 SQUAD: 2 — ENEMY SQUAD: 1` live
- **Steal progress arc** appears around the flag stand when an enemy is stealing
- **Capture progress arc** appears at the friendly base as carrier scores
- **Flag icon on minimap** — pulsing team-colored dot for each flag
- **Floating texts** — "🏳️ FLAG STOLEN!", "🏳️ FLAG PASSED TO ALLY 2 (178 HP)!", "🏆 +1 FLAG CAPTURED! (2 - 1)"

---

## ⚡ Power-Up Supply Drop System

Every **30 seconds** during a match, a glowing 3D orb drops from the sky into a safe spot in the arena. Up to **3 orbs** can be active simultaneously. Picking up an orb applies its effect instantly.

| Power-Up | Type | Effect |
|---|---|---|
| 🟢 **Repair Kit (+65 HP)** | Instant Heal | Restores 65 HP + partially reduces dents |
| 🔵 **Mega Medkit (100% HP)** | Instant Heal | Full HP + all parts repaired + dents cleared |
| 🔥 **Inferno Fire RAM (12s)** | Timed Ability | 1.8× hit damage + 1s fire singe on victims |
| 🛡️ **Titan Armor Shield (10s)** | Timed Ability | Blocks 70% of incoming damage |
| ⚡ **Turbo Speed Boost (10s)** | Timed Ability | 1.45× acceleration + 1.28× top speed |

- The **Kill Announcer** banner alerts all players when a supply drop lands with the drop's name.
- Active power-up orbs appear on the **minimap** as pulsing colored dots for quick navigation.
- A **duration bar** appears under your HP bar while a timed ability is active, depleting in real-time.
- All 4 arenas support supply drops.

---

## 🎯 Controls

| Action | Player 1 | Player 2 |
|---|---|---|
| **Accelerate** | `W` | `↑ Arrow` |
| **Reverse / Brake** | `S` | `↓ Arrow` |
| **Steer Left** | `A` | `← Arrow` |
| **Steer Right** | `D` | `→ Arrow` |
| **Drift / Handbrake** | `Space` | `Right Shift` / `Enter` / `Numpad 0` |
| **Pause / Resume** | `Escape` / `P` | — |
| **Cycle Camera View** | `C` | `C` |

> 💡 All Player 1 and Player 2 keybinds are **fully remappable** in the **Controls** screen from the main menu. Press `RESET DEFAULTS` to restore original keys.

---

## ⚙️ Settings & Customisation

| Setting | Options | Default |
|---|---|---|
| **Camera View Mode** | Follow Zoom / Full Stadium | Follow Zoom |
| **Master Volume** | 0–100% | 80% |
| **Effects Volume** | 0–100% | 90% |
| **Visual Detail** | Performance / High Detail | High Detail |

**High Detail mode** enables:
- Up to 650 persistent tire tracks
- Full spark particle count
- Smoke and debris density at 100%

**Performance mode** reduces particle count by ~55% for smoother play on lower-end machines.

---

## 🧠 AI System

The game uses a custom `TacticalAIBrain` class (`js/entities/ai.js`) with three configurable difficulty profiles:

### AI Difficulty Profiles

| Stat | Easy | Normal | Hard |
|---|---|---|---|
| Decision Interval | 42 frames | 15 frames | 4 frames |
| Aim Jitter | High (0.68) | Low (0.16) | None (0.0) |
| Lead Prediction | None | 4.8 units | 10.5 units |
| Drift Turns | ❌ | ✅ | ✅ |
| Evasive Maneuvers | ❌ | ❌ | ✅ |
| Throttle Factor | 65% | 94% | 100% |
| Hesitation Chance | 28% | 4% | 0% |

### AI States
- **`FLANK_APPROACH`** — positions to an optimal attack angle using one of 5 pre-defined attack slots (REAR_CRUSH, LEFT_TBONE, RIGHT_TBONE, REAR_LEFT, REAR_RIGHT)
- **`RAM_STRIKE`** — switches to direct ramming when aligned within ~250 units with velocity lead prediction
- **`REPOSITION`** — triggered after getting stuck or taking flank damage; retreats to a random waypoint before re-engaging

### CTF AI Roles *(New in v5.0.0)*
In Capture the Flag mode, AI bots are automatically assigned squad roles:
- **ATTACKER** — targets the enemy flag stand; tries to steal and run it back to base
- **DEFENDER** — stays near the friendly flag stand; intercepts enemies who enter the steal zone

| Team Size | Defenders Assigned |
|---|---|
| 1–2 bots | 0 defenders |
| 3–4 bots | 1 defender |
| 5+ bots | 2 defenders |

### Target Selection Scoring
AI evaluates every opponent and scores by:
- Proximity (prefers closer targets)
- Angular alignment (prefers targets ahead)
- Revenge bonus (targets attacker who last hit them)
- Low HP priority (finishes weakened cars faster)
- Hard mode human priority (specifically hunts human players)
- Crowd avoidance (distributes targeting across the field)

> 🔥 AI cars can also pick up power-up supply drops, making Hard mode bots significantly more dangerous mid-match!

---

## 🗺️ Arena Maps

### 🟩 Football Ground (Open Pitch)
A large open arena styled as a football stadium with:
- Alternating green pitch stripes
- White pitch markings — boundary, halfway line, center circle, penalty boxes, goal boxes
- Outer dirt track border with amber safety wall
- **No static obstacles** — full open-field combat
- **Power-Up Supply Drops** every 30 seconds
- Arena size: **3400 × 2100 units**

### 🌳 Park Ground (Trees & Benches)
A realistic park setting with:
- Natural lawn color variation
- Sandy cross-shaped walkways and circular center plaza
- **14 Trees** — solid collision obstacles that stop and damage cars
- **10 Benches** — smaller solid obstacles across inner plaza and outer lanes
- Both are visible on the minimap as colored dots (green = trees, amber = benches)
- Obstacles slow and damage cars without killing them
- **Power-Up Supply Drops** every 30 seconds
- Arena size: **3400 × 2100 units**

### 🏜️ Desert Dunes *(New in v5.0.0)*
A scorching desert combat zone with:
- Sandy dune terrain with warm amber and ochre ground tones
- Scattered rock and cactus obstacles
- Wide open lanes for high-speed ramming
- **Power-Up Supply Drops** every 30 seconds
- Arena size: **3400 × 2100 units**

### ❄️ Frostbite Ice Rink *(New in v5.0.0)*
A circular frozen arena with:
- Circular boundary wall (radius 1130 units) — replaces the standard rectangle
- Icy blue-white ground with reduced grip simulation
- Compact arena size for intense close-range combat
- **Power-Up Supply Drops** every 30 seconds
- Arena size: **2400 × 2400 units (circular)**

---

## 🏗️ Project Structure

```
MyGame_CarBattle_V2/
│
├── index.html               # Main HTML — all 10+ menu screens, HUD overlays, modals
│
├── css/
│   └── style.css            # All styles — dark theme, animations, responsive layout
│
├── js/
│   ├── main.js              # Game loop, world state, rendering pipeline, canvas draw
│   │
│   ├── core/
│   │   ├── config.js        # Game version, car color palettes, vehicle archetypes,
│   │   │                    #   AI difficulty profiles, arena presets, match config
│   │   ├── audio.js         # Procedural Web Audio API sound engine
│   │   ├── input.js         # Keyboard input manager + keybind remapper
│   │   ├── camera.js        # Follow-zoom & full-stadium camera controllers
│   │   ├── secrets.js       # API keys — gitignored, copy from secrets.example.js
│   │   └── secrets.example.js  # Template for secrets.js
│   │
│   ├── entities/
│   │   ├── car.js           # BattleCar class — drawing, physics properties, damage model,
│   │   │                    #   deformation, detached parts, health bar, power-up auras
│   │   ├── physics.js       # PhysicsEngine — movement, wall bounce, car-car collision,
│   │   │                    #   spawn generation, team arc spawns, power-up physics effects
│   │   └── ai.js            # TacticalAIBrain — FSM, target scoring, flanking, drift turns,
│   │                        #   CTF role assignment (ATTACKER / DEFENDER)
│   │
│   ├── modes/
│   │   ├── singlePlayer.js  # King of the Ring (FFA) & Stadium Squad Siege — spawn & win logic
│   │   ├── duel1v1.js       # 1v1 Duel mode — spawn logic & win condition
│   │   ├── coopTeam.js      # Co-op Team mode — allied/enemy spawn & win condition
│   │   ├── squadWar.js      # Squad War mode — P1 team vs P2 team spawn & scoring
│   │   ├── timedSiege.js    # Timed Siege overlay logic — countdown timer HUD
│   │   └── captureFlag.js   # CaptureFlagMode — flag state machine, steal/carry/capture
│   │                        #   mechanics, flag passing, auto-return, CTF HUD, minimap
│   │
│   ├── features/
│   │   ├── hazards.js       # ArenaHazards — tree/bench/rock generation, collision,
│   │   │                    #   minimap draw, Power-Up Supply Drop system, 5 orb types,
│   │   │                    #   Desert Dunes & Frostbite Ice arena generation
│   │   ├── announcer.js     # KillAnnouncer — floating kill banners, slow-motion replay,
│   │   │                    #   CTF capture fanfare
│   │   ├── telemetry.js     # TelemetryTracker — localStorage stats, match records
│   │   └── feedback.js      # Player feedback form — Web3Forms integration
│   │
│   └── ui/
│       └── uiManager.js     # UIManager — screen routing, HUD updates, match results,
│                            #   color pickers, keybind UI, settings sync, analytics view,
│                            #   CTF setup screen, Stadium Squad Siege config,
│                            #   live arena map preview
│
└── screenshots/
    ├── Screenshot 2026-10-18 222812.png   # Main Menu
    ├── Screenshot 2026-10-18 222825.png   # Single Player Configuration
    ├── Screenshot 2026-10-18 222949.png   # Gameplay — Football Ground (5 Bots)
    ├── Screenshot 2026-10-18 223010.png   # Gameplay — Detached Parts & Critical Damage
    └── Screenshot 2026-10-18 223942.png   # Squad War — Countdown, Full Stadium View
```

---

## 🚀 How to Run

### Method 1 — Open Directly in Browser *(Simplest)*
1. Download or clone the repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
3. No installation, no build step, no server required

```bash
# Clone the repository
git clone https://github.com/haseebahmed9814-design/CarBattle-Bumper-Crash.git

# Open the game
cd CarBattle-Bumper-Crash
start index.html      # Windows
open index.html       # macOS
xdg-open index.html   # Linux
```

### Method 2 — Local Dev Server *(Recommended for development)*

If you want live-reload while editing:

```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server . -p 8080

# Using VS Code
# Install "Live Server" extension → Right-click index.html → "Open with Live Server"
```

Then visit: `http://localhost:8080`

> ⚠️ **Note:** Web3Forms feedback form requires an internet connection. Power-up supply drops, Capture the Flag, and all game features are fully playable offline.

---

## 🔧 Technical Architecture

### Rendering Pipeline (60 FPS Canvas)
Each frame in `Game.loop()` executes in order:
1. Compute `dt` (delta time, capped at 2.2× to prevent tunneling)
2. Tick AI brains for all cars
3. Apply physics — movement, friction, wall bounce; tick active power-up timers & burn effects
4. Resolve car–car collisions (with power-up damage multipliers applied)
5. Update arena hazards — tree/bench/rock collisions + supply drop spawner tick + orb pickup detection
6. Update CTF flag state machine — steal/carry/capture/drop/auto-return logic
7. Check mode win condition
8. **Draw arena ground** (pitch stripes, lines, desert terrain, or park walkways / ice surface)
9. **Draw ground hazard elements** (tree bases, bench pads, rocks, CTF flag stands, power-up orbs)
10. **Draw CTF flags** — AT_BASE, DROPPED (with return timer arc), or CARRIED (above carrier)
11. **Draw world effects** (tire tracks, detached parts, shockwaves, particles, floating texts)
12. **Draw all cars** (shadow, wheels, body, damage dents, headlights, exhaust flames, power-up aura, health bar, power-up duration bar, name tag)
13. **Draw tree canopies** (on top of cars for depth layering)
14. Draw kill announcer overlay
15. Draw minimap (cars + trees + benches + power-up orbs + CTF flag icons)

### Physics Engine (`js/entities/physics.js`)
- **Arcade top-down driving** — velocity decomposed into forward/lateral components
- **Grip model** — normal traction vs handbrake slip controlled by `normalGrip` / `handbrakeGrip`
- **Power-up speed modifiers** — Hyper Nitro: 1.45× accel / 1.28× top speed; Inferno RAM: 1.15× accel / 1.08× speed
- **Burn damage ticking** — 1-second fire singe on Inferno RAM victims (~6 HP total, never lethal alone)
- **Deceleration** — drag applied per frame, with separate braking deceleration
- **Wall bounce** — elastic wall reflection with position correction and impulse; circular boundary for Ice Rink
- **Car–car collision** — circle-vs-circle detection with impulse resolution scaled by mass ratio and relative velocity
- **Power-up collision multipliers** — Inferno RAM: 1.8× damage; Titan Shield: 0.30× incoming damage
- **Directional hit zone detection** — dot product of collision normal vs car forward vector assigns FRONT/REAR/LEFT/RIGHT damage zones
- **Spawn position generator** — ring-based spawning with Player 1 always anchored on the left; adaptive arc for team modes
- **Team base rect helper** — `getTeamBaseRects()` returns left/right base zone centers used as CTF flag stand positions

### Camera System (`js/core/camera.js`)
| Mode | Behavior |
|---|---|
| **Follow Zoom** (`moving_wide`) | Smoothly follows the player car with lerp; zoom scales with speed |
| **Full Stadium** (`fixed_full`) | Static top-down overview of the entire arena |

### Team Spawn Arc System (`js/entities/physics.js`)
The `generateTeamSpawnPositions()` function distributes teams along opposing stadium arcs:
- **Team 1** spawns along the **Left Arc** (180° / π radians)
- **Team 2** spawns along the **Right Arc** (0° radians)
- Angular spread widens automatically as team size grows (max ~155° arc)
- Human commander always spawns at the **center slot** of their team's arc

---

## 📊 Telemetry & Analytics

All analytics are stored in **`localStorage`** — no server, fully private.

Tracked data:
- Total matches played
- Per-mode play counts (Single Player, 1v1, Co-op, Squad War, CTF)
- Per-player career stats by driver name: matches, wins, kills, damage dealt
- Session event log for feedback form prefill

View all stats in-game via **GAME STATS** from the main menu.

---

## 🗺️ Roadmap

| Status | Feature |
|---|---|
| ✅ Done | Single Player — King of the Ring vs AI (1–8 bots) |
| ✅ Done | Single Player — Stadium Squad Siege (Solo Team Battle) |
| ✅ Done | 1v1 Duel (local split-keyboard) |
| ✅ Done | Co-op Team (P1+P2 vs AI) |
| ✅ Done | Squad War (P1 Team vs P2 Team) |
| ✅ Done | Timed Siege match rule (1–5 min) |
| ✅ Done | Tactical AI (Easy / Normal / Hard) |
| ✅ Done | Procedural Web Audio (no audio files) |
| ✅ Done | Directional damage model & deformation |
| ✅ Done | Detached car parts physics |
| ✅ Done | Park Ground arena with 14 trees & 10 benches |
| ✅ Done | Minimap with hazard & power-up icons |
| ✅ Done | Kill Announcer + slow-motion replay |
| ✅ Done | Player keybind remapper |
| ✅ Done | LocalStorage analytics & career stats |
| ✅ Done | Player feedback form (Web3Forms) |
| ✅ Done | Spectator mode |
| ✅ Done | Power-Up Supply Drop System (5 orb types, every 30s) |
| ✅ Done | Inferno Fire RAM — 1.8× damage + fire singe |
| ✅ Done | Titan Armor Shield — 70% damage block |
| ✅ Done | Turbo Speed Boost — 1.45× accel + 1.28× top speed |
| ✅ Done | Live arena map preview canvas on setup screens |
| ✅ Done | Adaptive team arc spawn system |
| ✅ Done | **🚩 Capture the Flag Mode (Solo / Co-op / Versus)** |
| ✅ Done | **CTF AI roles — Attacker / Defender assignment** |
| ✅ Done | **Animated flag graphics with waving cloth simulation** |
| ✅ Done | **Flag steal / carry / capture / pass / auto-return mechanics** |
| ✅ Done | **Desert Dunes arena** |
| ✅ Done | **Frostbite Ice Rink (circular arena)** |
| 🔄 In Progress | Online multiplayer — rooms & matchmaking |
| 📋 Planned | Ranked global leaderboard |
| 📋 Planned | Additional arena maps |
| 📋 Planned | Mobile touch controls |

---

## 🚗 Vehicle — APEX GT

There is currently one vehicle archetype: **APEX GT** — a balanced, well-rounded racer.

| Stat | Value |
|---|---|
| Max HP | 200 |
| Top Speed | 11.8 units/frame |
| Reverse Speed | 5.8 units/frame |
| Acceleration | 0.45 |
| Steering Rate | 0.068 rad/frame |
| Normal Grip | 0.90 |
| Handbrake Grip | 0.955 |
| Rear Damage Penalty | 1.55× |

> ⚡ With **Turbo Speed Boost** active: Top Speed → ~15.1 u/f, Acceleration → ~0.65
> 🔥 With **Inferno Fire RAM** active: Hit damage → 1.8×, Exhaust flames turn orange

### Car Color Palettes
| Name | Main Color |
|---|---|
| ⚡ Electric Blue | `#00a8ff` |
| 🔴 Hyper Red | `#ff1e42` |
| 💚 Emerald Green | `#00e676` |
| 🌟 Cyber Gold | `#ffb703` |
| 💜 Plasma Purple | `#b5179e` |

---

## 👨‍💻 Developer

<div align="center">

**Muhammad Haseeb Ahmed**

*Lead Game Developer · Gameplay Programmer · AI & UI Architect*

| Role | Description |
|---|---|
| 🎮 Game Design & Direction | Full game concept, mode design, and UX flow |
| ⚙️ 2D Physics & Deformation Engine | Custom arcade physics, damage model, detached parts |
| 🧠 Tactical Combat AI System | FSM-based AI with flanking, drift, evasion, CTF roles |
| 🎨 UI/UX Architecture | 10+ screen menu system, HUD, results, analytics |
| 🎵 Procedural Web Audio | All sounds synthesized — zero audio files |
| ⚡ Power-Up Supply Drop System | 5-type orb system, 3D rendering, pickup physics |
| 🚩 Capture the Flag Engine | Full CTF state machine, flag passing, AI role assignment |
| 🏜️❄️ New Arena Design | Desert Dunes & Frostbite Ice Rink (circular boundary) |

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Bumper Crash v5.0.0** · Developed by **Muhammad Haseeb Ahmed**

*"The last car driving wins — unless someone captures your flag first."*

⭐ Star this repo if you enjoyed the game!

</div>
