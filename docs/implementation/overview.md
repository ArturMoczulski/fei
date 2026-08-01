# Fei Implementation Guide

## Overview

Fei is an Electron application with a React renderer that uses Tone.js for audio synthesis. The application transforms a computer keyboard into a musical instrument with two independent hands, each controlling a separate pitch range.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  src/main/index.ts - Electron window, IPC handlers          │
│  src/main/preload.ts - Secure context bridge                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ contextBridge (IPC)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                          │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  React UI    │    │ Audio Engine │    │   Store      │  │
│  │  Components  │    │  (Tone.js)   │    │  (Zustand)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│          │                   │                   │           │
│          └───────────────────┴───────────────────┘           │
│                              │                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Keyboard Event Handler                       ││
│  │  useKeyboardEvents.ts → layouts.ts → actions.ts         ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── main/
│   ├── index.ts       # Electron main process entry point
│   └── preload.ts     # Context bridge for secure IPC
├── renderer/
│   ├── App.tsx        # Root component, initializes audio
│   ├── main.tsx       # React entry point
│   ├── audio/
│   │   ├── AudioEngine.ts         # Main Tone.js synth
│   │   ├── MetronomeAudioEngine.ts# Metronome with Tone.Transport
│   │   └── actions.ts             # Action execution logic
│   ├── components/
│   │   ├── AppUI.tsx              # Main layout container
│   │   ├── KeyboardHand.tsx       # Hand panel with sound buttons
│   │   ├── KeyBindingTooltip.tsx  # Key label overlay
│   │   ├── KeySelector.tsx        # Transposition dropdown
│   │   ├── Metronome.tsx          # Metronome controls
│   │   ├── SettingsModal.tsx      # Settings panel
│   │   ├── ActionsListModal.tsx   # All actions reference
│   │   └── TitleBar.tsx           # Window title bar
│   ├── keyboard/
│   │   ├── layouts.ts      # Layout resolution, key→action mapping
│   │   └── keyBindings.ts # Helpers for key/action lookup
│   ├── hooks/
│   │   └── useKeyboardEvents.ts  # Keyboard event handling hook
│   └── store/
│       └── appStore.ts    # Zustand global state
└── shared/
    └── types.ts           # Shared TypeScript types
```

## Key Modules

### AudioEngine (`src/renderer/audio/AudioEngine.ts`)

Singleton class wrapping Tone.js PolySynth. Manages two independent synths (left/right hand) with 128-voice polyphony each.

- `init()` - Initializes Tone.js context and creates synths
- `playNote(frequency, hand)` - Triggers a note on the specified hand's synth
- `stopNote(frequency, hand)` - Releases a specific note
- `panic()` - Stops all notes and resets transport

### Keyboard Event Flow

```
KeyDown event
    ↓
useKeyboardEvents.ts (hook)
    ↓
layouts.ts → getLayout() builds KeyMapping[] for current keyboard layout
    ↓
Find mapping where m.key === e.key.toLowerCase()
    ↓
If sound action: calculateFrequency() → audioEngine.playNote()
If octave action: update store
If settings action: toggle modal
```

### Layout Resolution (`src/renderer/keyboard/layouts.ts`)

The `getLayout()` function builds a complete key mapping by combining two JSON files:

1. `*-device.json` - Physical key positions (which key produces which action)
2. `*-semitones.json` - Semitone intervals for each action

This separation allows the same note logic to work across different keyboard layouts (DVORAK/QWERTY).

### State Management (`src/renderer/store/appStore.ts`)

Zustand store holding:
- `keyboardLayout` - Current layout ('dvorak' | 'qwerty')
- `leftOctave`, `rightOctave` - Per-hand octave (1-8)
- `selectedKey` - Transposition key (0-11 for C-B)
- `volume` - Master volume in dB
- `showSettings`, `showActions` - Modal visibility
- `audioReady` - Whether Tone.js is initialized
- `pressedKeys` - Currently held keys

Settings are persisted to electron-store via IPC.

### Metronome (`src/renderer/audio/MetronomeAudioEngine.ts`)

Uses Tone.js Transport for timing. Creates a Sequence that triggers click sounds on each beat. Accent on beat 1, normal click on other beats.

## Key Mappings

Actions are defined in `mappings/actions.json` with categories:
- `left_sound` / `right_sound` - 12 notes per hand
- `octave` - 4 actions (increase/decrease per hand)
- `transport` - panic_stop, toggle_metronome
- `settings` - open_settings, toggle_actions_list

## Note Calculation

```
MIDI = (octave + 1) * 12 + noteIndex
Frequency = 440 × 2^((MIDI - 69) / 12)
```

Where `noteIndex` is derived from `selectedKey + semitone` (mod 12).

## Electron IPC

Main process exposes two namespaces via preload:

- `window.electronAPI.window` - minimize, maximize, close, isMaximized
- `window.electronAPI.settings` - get, set, getAll (backed by electron-store)

## UI Components

The main UI is composed in `AppUI.tsx`:
- Two `KeyboardHand` components (left/right) showing the 3×4 button grid
- Each button displays: note name, interval (+N), frequency (Hz), key binding
- Footer contains KeySelector, Metronome, and volume control
- Modals for Settings and ActionsList
