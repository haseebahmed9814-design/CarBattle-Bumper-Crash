<div align="center">

<h1>🏎️ BUMPER CRASH</h1>

<p><strong>2D Top-Down Car Combat Arena · Demolition Derby · Tactical AI Battle</strong></p>

<img src="screenshots/Screenshot 2026-10-18 222812.png" alt="Bumper Crash Main Menu" width="850"/>

<br/>

[![Version](https://img.shields.io/badge/Version-v2.7.0-orange?style=for-the-badge)](https://github.com)
[![Language](https://img.shields.io/badge/Built%20With-Vanilla%20JS%20%2B%20HTML5%20Canvas-blue?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)](https://github.com)

> **High-Impact Demolition Derby & Tactical Arena Combat** — a fully browser-based 2D top-down car battle game with tactical AI, real-time physics, multi-mode multiplayer, and procedurally generated combat effects. No dependencies. No frameworks. Pure HTML5 Canvas + Vanilla JavaScript.

</div>

---

## 📖 Table of Contents

- [🎮 About the Game](#-about-the-game)
- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🕹️ Game Modes](#️-game-modes)
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

Players choose from multiple game modes: Solo against AI, head-to-head 1v1 duels, cooperative team battles, or full squad vs squad wars. Each car features a detailed damage model, real-time physics, and tactical AI opponents that flank, drift, and ram with intent.

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
- **Dual exhaust nitro flames** — animated, color-matched to each car's paint scheme
- **Health bars** — color-coded from green → amber → red with 25% segment tick marks
- **Floating damage text** — "WRECKED!", "1.2x SIDE SMASH!" and more appear in-game
- **Shockwave explosions** on car destruction

### 🎨 Visual Effects
- Persistent **tire tracks** (up to 650 in high-detail mode)
- **Spark particle system** on collisions
- **Smoke plumes** — dark or fiery depending on speed
- **Flying detached parts** with angular velocity and friction
- **Expanding shockwave rings** on destruction
- **Floating text** for kill events and announcements
- **Screen shake** scaled to impact force
- **Headlight beam gradients** — per car
- **Slow-motion kill replay** via KillAnnouncer system

### 🎵 Audio (Procedural Web Audio API)
- **No audio files required** — all sounds synthesized at runtime using the Web Audio API
- Countdown beep tones
- Crash impact sounds
- UI click feedback
- Explosion sounds

### 🎛️ UI & Menus
- 10 distinct menu screens with smooth transitions
- **Live car preview canvas** — renders your car in real-time as you pick colors
- **Vehicle stat bars** — Top Speed, Drift & Grip, Chassis Armor
- **Player keybind remapper** — remap all controls from the Controls screen
- Match results modal with full per-driver stats
- Integrated **Player Feedback Form** (Formspree backend)
- Pause menu with Resume / Restart / Main Menu
- **Spectator Mode** — if your car is wrecked, keep watching remaining bots fight it out

### 📡 Analytics
- Session telemetry tracked locally in `localStorage`
- Per-mode play count breakdown with visual bar chart
- Player career stats (wins, kills, damage) saved by driver name
- Game Stats screen with lifetime totals

---

## 📸 Screenshots

### 🏠 Main Menu
<img src="screenshots/Screenshot 2026-10-18 222812.png" alt="Main Menu — Bumper Crash v2.7.0" width="100%"/>

> The main menu features animated background AI cars driving and crashing on the Park Ground arena while you browse. Buttons lead to Single Player, Two Players (with 3 sub-modes), a Coming Soon Multiplayer mode, Controls, Settings, Game Stats, Credits, and a Feedback form.

---

### ⚙️ Single Player Configuration
<img src="screenshots/Screenshot 2026-10-18 222825.png" alt="Single Player Config — Driver Name, Color Picker, AI Difficulty, Arena Map" width="100%"/>

> Configure your Driver Name, pick from 5 vehicle colors (Electric Blue, Hyper Red, Emerald Green, Cyber Gold, Plasma Purple), set the number of AI opponents (1–8), choose AI Difficulty (Easy / Normal / Hard), and select the Arena Map. A live car preview canvas renders your vehicle with headlights and nitro flames.

---

### ⚔️ Gameplay — Football Ground (5 AI Opponents)
<img src="screenshots/Screenshot 2026-10-18 222949.png" alt="Gameplay — Single Player Normal, Football Ground, 5 Bots" width="100%"/>

> Active gameplay on the **Football Ground** arena. The player (blue, "PLAYER 1 — 91 HP") battles 5 AI bots simultaneously. The HUD shows mode, player HP, opponent count, camera mode toggle, and pause button. AI cars have tactical rings indicating their team. Tire tracks, headlight beams, and directional hit text ("1.2x SIDE SMASH!") are visible. The minimap in the bottom-right shows all active cars as colored dots.

---

### 💥 Gameplay — Detached Parts & Critical Damage
<img src="screenshots/Screenshot 2026-10-18 223010.png" alt="Gameplay — Critical Damage, Detached Parts Flying, Tire Tracks" width="100%"/>

> Mid-match chaos: The player is at **44 HP** (amber health bar), surrounded by 4 remaining bots. Detached car parts (bumpers, fenders, spoilers) are visibly flying across the arena. Tire track trails from previous maneuvers crisscross the pitch. The minimap shows positions of all surviving cars.

---

### 🏁 Squad War — Countdown & Full Stadium View
<img src="screenshots/Screenshot 2026-10-18 223942.png" alt="Squad War — Timed Siege, 3-Minute Match, 2 Teams of 3, Countdown" width="100%"/>

> **Squad War (Timed Siege)** mode at the countdown stage — "1, START YOUR ENGINES!". Two squads of 3 spawn on opposite ends of the Football Ground. The HUD shows "Player 1 Squad: 3 | Player 2 Squad: 3" with a 3:00 minute timer. The camera is in **Full Stadium view**, revealing the entire arena. The minimap shows team color separation across both flanks.

---

## 🕹️ Game Modes

### 1. 🧍 Single Player — Solo Free-For-All
Battle 1 to 8 AI opponents in a knockout derby. Last car surviving wins. Supports Easy / Normal / Hard AI difficulty and 2 arena maps.

**Win condition:** Destroy every AI opponent.

---

### 2. 👥 Two Players (Local Split-Keyboard)

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

### 3. 🌐 Online Multiplayer *(Coming Soon)*
Real-time online rooms, friend invite codes, and global demolition derby leaderboards — currently in development.

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

### Target Selection Scoring
AI evaluates every opponent and scores by:
- Proximity (prefers closer targets)
- Angular alignment (prefers targets ahead)
- Revenge bonus (targets attacker who last hit them)
- Low HP priority (finishes weakened cars faster)
- Hard mode human priority (specifically hunts human players)
- Crowd avoidance (distributes targeting across the field)

---

## 🗺️ Arena Maps

### 🟩 Football Ground (Open Pitch)
A large open arena styled as a football stadium with:
- Alternating green pitch stripes
- White pitch markings — boundary, halfway line, center circle, penalty boxes, goal boxes
- Outer dirt track border with amber safety wall
- **No obstacles** — full open-field combat
- Arena size: **3400 × 2100 units**

### 🌳 Park Ground (Trees & Benches)
A realistic park setting with:
- Natural lawn color variation
- Sandy cross-shaped walkways and circular center plaza
- **Trees** — solid collision obstacles that stop and damage cars
- **Benches** — smaller solid obstacles
- Both are visible on the minimap as colored dots (green = trees, amber = benches)
- Obstacles slow and damage cars without killing them
- Arena size: **3400 × 2100 units**

---

## 🏗️ Project Structure

```
MyGame_CarBattle_V2/
│
├── index.html               # Main HTML — all 10 menu screens, HUD overlays, modals
│
├── css/
│   └── style.css            # All styles — dark theme, animations, responsive layout (17 KB)
│
├── js/
│   ├── main.js              # Game loop, world state, rendering pipeline, canvas draw
│   │
│   ├── core/
│   │   ├── config.js        # Game version, car color palettes, vehicle archetypes,
│   │   │                    #   AI difficulty profiles, arena presets, match config
│   │   ├── audio.js         # Procedural Web Audio API sound engine
│   │   ├── input.js         # Keyboard input manager + keybind remapper
│   │   └── camera.js        # Follow-zoom & full-stadium camera controllers
│   │
│   ├── entities/
│   │   ├── car.js           # BattleCar class — drawing, physics properties, damage model,
│   │   │                    #   deformation, detached parts, health bar rendering
│   │   ├── physics.js       # PhysicsEngine — movement, wall bounce, car-car collision,
│   │   │                    #   spawn generation, teammate detection
│   │   └── ai.js            # TacticalAIBrain — FSM, target scoring, flanking, drift turns
│   │
│   ├── modes/
│   │   ├── singlePlayer.js  # Single Player mode — spawn logic & win condition
│   │   ├── duel1v1.js       # 1v1 Duel mode — spawn logic & win condition
│   │   ├── coopTeam.js      # Co-op Team mode — allied/enemy spawn & win condition
│   │   ├── squadWar.js      # Squad War mode — P1 team vs P2 team spawn & scoring
│   │   └── timedSiege.js    # Timed Siege overlay logic — countdown timer HUD
│   │
│   ├── features/
│   │   ├── hazards.js       # ArenaHazards — tree/bench generation, collision, minimap draw
│   │   ├── announcer.js     # KillAnnouncer — floating kill banners, slow-motion replay
│   │   ├── telemetry.js     # TelemetryTracker — localStorage stats, match records
│   │   └── feedback.js      # Player feedback form — Formspree integration
│   │
│   └── ui/
│       └── uiManager.js     # UIManager — screen routing, HUD updates, match results,
│                            #   color pickers, keybind UI, settings sync, analytics view
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
git clone https://github.com/YOUR_USERNAME/MyGame_CarBattle_V2.git

# Open the game
cd MyGame_CarBattle_V2
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

> ⚠️ **Note:** GoatCounter analytics and Formspree feedback require an internet connection. The game itself is fully playable offline.

---

## 🔧 Technical Architecture

### Rendering Pipeline (60 FPS Canvas)
Each frame in `Game.loop()` executes in order:
1. Compute `dt` (delta time, capped at 2.2× to prevent tunneling)
2. Tick AI brains for all cars
3. Apply physics — movement, friction, wall bounce
4. Resolve car–car collisions
5. Update arena hazards (tree/bench collisions)
6. Check mode win condition
7. **Draw arena ground** (pitch stripes, lines, or park walkways)
8. **Draw ground hazard elements** (tree bases, bench pads)
9. **Draw world effects** (tire tracks, detached parts, shockwaves, particles, floating texts)
10. **Draw all cars** (shadow, wheels, body, damage dents, headlights, exhaust flames, health bar, name tag)
11. **Draw tree canopies** (on top of cars for depth layering)
12. Draw kill announcer overlay
13. Draw minimap

### Physics Engine (`js/entities/physics.js`)
- **Arcade top-down driving** — velocity decomposed into forward/lateral components
- **Grip model** — normal traction vs handbrake slip controlled by `normalGrip` / `handbrakeGrip`
- **Deceleration** — drag applied per frame, with separate braking deceleration
- **Wall bounce** — elastic wall reflection with position correction and impulse
- **Car–car collision** — circle-vs-circle detection with impulse resolution scaled by mass ratio and relative velocity
- **Directional hit zone detection** — dot product of collision normal vs car forward vector assigns FRONT/REAR/LEFT/RIGHT damage zones
- **Spawn position generator** — guarantees no cars spawn within radius of each other or wall bounds

### Camera System (`js/core/camera.js`)
| Mode | Behavior |
|---|---|
| **Follow Zoom** (`moving_wide`) | Smoothly follows the player car with lerp; zoom scales with speed |
| **Full Stadium** (`fixed_full`) | Static top-down overview of the entire arena |

---

## 📊 Telemetry & Analytics

All analytics are stored in **`localStorage`** — no server, fully private.

Tracked data:
- Total matches played
- Per-mode play counts (Single Player, 1v1, Co-op, Squad War)
- Per-player career stats by driver name: matches, wins, kills, damage dealt
- Session event log for feedback form prefill

View all stats in-game via **GAME STATS** from the main menu.

---

## 🗺️ Roadmap

| Status | Feature |
|---|---|
| ✅ Done | Single Player vs AI (1–8 bots) |
| ✅ Done | 1v1 Duel (local split-keyboard) |
| ✅ Done | Co-op Team (P1+P2 vs AI) |
| ✅ Done | Squad War (P1 Team vs P2 Team) |
| ✅ Done | Timed Siege match rule (1–5 min) |
| ✅ Done | Tactical AI (Easy / Normal / Hard) |
| ✅ Done | Procedural Web Audio (no audio files) |
| ✅ Done | Directional damage model & deformation |
| ✅ Done | Detached car parts physics |
| ✅ Done | Park Ground arena with trees & benches |
| ✅ Done | Minimap with hazard icons |
| ✅ Done | Kill Announcer + slow-motion replay |
| ✅ Done | Player keybind remapper |
| ✅ Done | LocalStorage analytics & career stats |
| ✅ Done | Player feedback form (Formspree) |
| ✅ Done | Spectator mode |
| 🔄 In Progress | Online multiplayer — rooms & matchmaking |
| 📋 Planned | Ranked global leaderboard |
| 📋 Planned | Additional arena maps |
| 📋 Planned | Power-ups & hazard items |
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
| 🧠 Tactical Combat AI System | FSM-based AI with flanking, drift, evasion |
| 🎨 UI/UX Architecture | 10-screen menu system, HUD, results, analytics |
| 🎵 Procedural Web Audio | All sounds synthesized — zero audio files |

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Bumper Crash v2.7.0** · Developed by **Muhammad Haseeb Ahmed**

*"The last car driving wins."*

⭐ Star this repo if you enjoyed the game!

</div>
