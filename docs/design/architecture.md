# Architecture

## Overview

Fei is built with Tauri (Rust) + React + TypeScript. The audio engine runs in native Rust via cpal, completely bypassing the webview for low-latency performance. React handles UI and state management via Zustand.

## Directory Structure

```
fei/
├── audio-engine/                   # Rust/Tauri audio engine
│   ├── src/
│   │   ├── main.rs                # Tauri commands, entry point
│   │   ├── lib.rs                 # Module exports
│   │   └── audio/
│   │       ├── engine.rs          # cpal audio engine, voice management
│   │       ├── synth.rs           # Triangle wave synth with ADSR
│   │       └── mod.rs             # Audio module exports
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── frontend/                       # React application
│   ├── src/
│   │   ├── renderer/
│   │   │   ├── App.tsx            # Root component
│   │   │   ├── main.tsx           # Entry point
│   │   │   ├── audio/
│   │   │   │   ├── AudioEngine.ts # Tauri IPC interface
│   │   │   │   └── actions.ts    # Action executor
│   │   │   ├── components/
│   │   │   │   ├── AppUI.tsx
│   │   │   │   ├── KeyboardHand.tsx
│   │   │   │   ├── OctaveControl.tsx
│   │   │   │   ├── KeyBindingTooltip.tsx
│   │   │   │   ├── ActionsListModal.tsx
│   │   │   │   ├── KeySelector.tsx
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   ├── Metronome.tsx
│   │   │   │   └── TitleBar.tsx
│   │   │   ├── keyboard/
│   │   │   │   ├── layouts.ts
│   │   │   │   └── keyBindings.ts
│   │   │   ├── hooks/
│   │   │   │   └── useKeyboardEvents.ts
│   │   │   └── store/
│   │   │       └── appStore.ts
│   │   ├── shared/
│   │   │   └── types.ts
│   │   └── mappings/
│   │       ├── actions.json
│   │       ├── dvorak-device.json
│   │       ├── dvorak-semitones.json
│   │       ├── qwerty-device.json
│   │       └── qwerty-semitones.json
│   └── index.html
│
└── docs/
```

## Key Modules

### Rust Audio Engine

Located in `audio-engine/src/audio/`:

**engine.rs** - Main audio engine using cpal:
- Initializes cpal output stream with 128-sample buffer (low latency)
- Command channel for receiving note commands from Tauri IPC
- 128-voice polyphony per hand (256 total)
- Real-time audio callback writes directly to DAC

**synth.rs** - Voice synthesis:
- Triangle wave oscillator with phase accumulation
- ADSR envelope (Attack: 1ms, Decay: 100ms, Sustain: 70%, Release: 300ms)
- Voice state machine: Off → Attack → Decay → Sustain → Release → Off

### Frontend Audio Interface

Located in `frontend/src/renderer/audio/AudioEngine.ts`:

Thin wrapper exposing Tauri IPC commands:
- `playNote(frequency, hand)` - Trigger note
- `stopNote(frequency, hand)` - Release note
- `setVolume(volume)` - Set master volume
- `panic()` - Emergency stop

### Actions System

Action definitions stored in `/mappings/actions.json`:
- **sound**: Trigger notes per hand (12 notes per hand)
- **octave**: Octave control per hand
- **transport**: Play/pause/stop
- **settings**: UI toggles

### Keyboard Resolution

Two-layer lookup for key events:

1. **Layout Resolution** (`layouts.ts`): Determine active layout (DVORAK/QWERTY)
2. **Key Binding Lookup** (`keyBindings.ts`): Map device key → action

Files:
- `*-device.json`: Physical key positions by finger/row
- `*-semitones.json`: Finger ID → semitone interval mapping

### State Management

Zustand store (`frontend/src/renderer/store/appStore.ts`) owns all UI state. Rust has no duplicate state - all settings, octave values, and pressed keys are managed in React.

## Data Flow

### Note Triggering

```
KeyDown Event
    ↓
useKeyboardEvents.ts (hook)
    ↓
layouts.ts resolves key → action
    ↓
calculateFrequency(semitone, octave, selectedKey)
    ↓
AudioEngine.playNote(frequency, hand)
    ↓
Tauri invoke (cmd_play_note_raw)
    ↓
Rust command thread receives command
    ↓
Audio thread processes (next buffer cycle)
    ↓
DAC outputs audio (~3ms total latency)
```

## Audio Thread Architecture

```
┌─────────────────────────────────────────┐
│           Command Thread                 │
│  (receives IPC, sends to audio thread)  │
└─────────────────┬───────────────────────┘
                  │ mpsc channel
                  ▼
┌─────────────────────────────────────────┐
│           Audio Thread                  │
│  (cpal callback, real-time priority)    │
│                                          │
│  For each buffer:                        │
│    1. Check command channel             │
│    2. Update voice states              │
│    3. Mix voices to output buffer       │
└─────────────────────────────────────────┘
```

## State Management

React Zustand store:
- `keyboardLayout` - 'dvorak' | 'qwerty'
- `leftOctave`, `rightOctave` - 1-8
- `selectedKey` - 0-11 (C-B)
- `volume` - in dB
- `showSettings`, `showActions` - boolean
- `audioReady` - boolean
- `pressedKeys` - Set<string>

## Styling

CSS with custom properties for theming. Component styles colocated. Keyboard hand uses CSS Grid for 3×4 button layout.
