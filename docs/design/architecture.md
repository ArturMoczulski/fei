# Architecture

## Overview

Fei is built with Electron + React + TypeScript for the renderer, with Tone.js handling audio synthesis. The application uses a modular architecture separating concerns across keyboard layout resolution, audio engine, action system, and UI components.

## Directory Structure

```
fei/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts              # Entry point, window creation
│   │   └── preload.ts           # Secure IPC bridge
│   └── renderer/                # React application
│       ├── App.tsx              # Root component, keyboard event handling
│       ├── audio/
│       │   ├── AudioEngine.ts   # Tone.js PolySynth wrapper
│       │   ├── actions.ts       # Action executor
│       │   └── metronome.ts     # Metronome with Tone.js Transport
│       ├── components/
│       │   ├── KeyboardHand.tsx # Hand panel with sound buttons
│       │   ├── OctaveControl.tsx# Octave up/down buttons
│       │   ├── KeyBindingTooltip.tsx  # Key display overlay
│       │   ├── ActionsListModal.tsx    # All actions list
│       │   ├── MetronomeControls.tsx   # Tempo, time signature
│       │   ├── KeySelector.tsx        # Transposition dropdown
│       │   ├── SettingsModal.tsx       # Settings panel
│       │   └── TitleBar.tsx           # Window controls
│       ├── keyboard/
│       │   ├── layouts.ts       # Layout resolution
│       │   └── keyBindings.ts   # Device key → action lookup
│       ├── hooks/
│       │   └── useAudioEngine.ts# Audio engine React hook
│       └── styles/
│           └── globals.css       # Global styles
├── mappings/
│   ├── actions.json             # All action definitions
│   ├── dvorak-device.json       # DVORAK physical key positions
│   ├── dvorak-semitones.json    # DVORAK finger → semitone
│   ├── qwerty-device.json       # QWERTY physical key positions
│   └── qwerty-semitones.json    # QWERTY finger → semitone
└── docs/
    ├── bootstrap.md              # Getting started
    ├── keymouse_device.md        # Hardware description
    └── design/
        └── instrument.md        # Instrument usage guide
```

## Key Modules

### AudioEngine

Singleton class wrapping Tone.js PolySynth:
- 128-voice polyphony for chords
- Per-voice ADSR envelope (attack: 0.01s, decay: 0.1s, sustain: 0.3, release: 0.5s)
- Per-hand volume control
- Note tracking for sustain pedal (panic)
- Triangle wave oscillator

```typescript
class AudioEngine {
  private engine: Tone.PolySynth;
  private leftHandNotes: Map<number, Note>;
  private rightHandNotes: Map<number, Note>;

  triggerAttack(note: Note): void;
  triggerRelease(note: Note): void;
  setLeftHandVolume(db: number): void;
  setRightHandVolume(db: number): void;
  panic(): void;
}
```

### Actions System

Action definitions stored in `/mappings/actions.json` with categories:
- **sound**: Trigger notes (indexed by finger position)
- **octave**: Octave control per hand
- **transport**: Play/pause/stop
- **settings**: UI toggles

Action executor (`actions.ts`) dispatches to AudioEngine or UI state.

### Keyboard Resolution

Two-layer lookup for key events:

1. **Layout Resolution** (`layouts.ts`): Determine active layout (DVORAK/QWERTY) from device or settings
2. **Key Binding Lookup** (`keyBindings.ts`): Map device keycode → action

The key binding files are organized by:
- `*-device.json`: Physical key positions by finger/row (which key produces which finger ID)
- `*-semitones.json`: Finger ID → semitone interval mapping

This separation allows the same semitone logic to work across different keyboard layouts.

### Main Process

Electron main process handles:
- Window creation and management
- Application menu
- IPC for native features
- MIDI output (future)

### Preload Script

Secure bridge exposing limited APIs to renderer:
- `window.api.send(channel, data)`
- `window.api.on(channel, handler)`

## Data Flow

### Note Triggering

```
KeyDown Event
    ↓
App.tsx handles event
    ↓
keyBindings.ts resolves device key → action
    ↓
actions.ts executes action
    ↓
AudioEngine.triggerAttack(note)
    ↓
Tone.js synthesizes audio
```

### Configuration

```
User selects setting
    ↓
App.tsx updates state
    ↓
Components re-render with new context
    ↓
AudioEngine applies settings (volume, etc.)
```

## MIDI Integration

MIDI output is planned but not yet implemented. The architecture should support:
- Sending note on/off via Web MIDI API
- Configurable MIDI channel per hand
- Pitch bend support for expression

## State Management

React Context for global state:
- `AudioContext`: AudioEngine instance
- `KeyboardContext`: Layout, octave settings, active notes
- `SettingsContext`: Volume, key selector, metronome

Local component state for UI-only concerns (modal visibility, hover states).

## Styling

Global CSS with CSS custom properties for theming. Component-specific styles are colocated or in a single stylesheet depending on complexity.

The keyboard hand uses CSS Grid for the 3×4 button layout, with responsive sizing based on viewport.
