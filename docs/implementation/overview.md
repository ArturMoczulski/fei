# Fei Implementation Guide

## Overview

Fei is a platform-independent isomorphic keyboard instrument using Rust/Tauri for audio synthesis and React for UI. Audio runs in a native Rust thread via cpal, bypassing the webview entirely for low-latency performance.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Tauri Application                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   React Frontend    │    │   Rust Audio Engine        │ │
│  │   (WebView/WKWebView)   │   │   (cpal + native thread)  │ │
│  │                     │    │                             │ │
│  │  ┌───────────────┐ │    │  ┌───────────────────────┐ │ │
│  │  │  Zustand     │ │    │  │  Triangle Wave Synth  │ │ │
│  │  │  Store       │ │    │  │  + ADSR Envelope      │ │ │
│  │  └───────────────┘ │    │  │  (128 voices)         │ │ │
│  │         │         │    │  └───────────────────────┘ │ │
│  │         │ IPC     │    │            │               │ │
│  │         ▼         │    │            ▼               │ │
│  │  ┌───────────────┐ │    │  ┌───────────────────────┐ │ │
│  │  │  AudioEngine │ │    │  │  cpal Output Stream   │ │ │
│  │  │  (invoke)    │─┼────┼──│  (44.1kHz, 128 buf)   │ │ │
│  │  └───────────────┘ │    │  └───────────────────────┘ │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   System Audio      │
                    │   (CoreAudio/ALSA)  │
                    └─────────────────────┘
```

## Directory Structure

```
fei/
├── audio-engine/           # Rust/Tauri audio engine
│   ├── src/
│   │   ├── main.rs        # Tauri commands, entry point
│   │   ├── lib.rs         # Module exports
│   │   └── audio/
│   │       ├── engine.rs  # cpal audio engine, voice management
│   │       ├── synth.rs   # Triangle wave synth with ADSR
│   │       └── mod.rs     # Audio module exports
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── frontend/               # React frontend (self-contained)
│   ├── src/
│   │   ├── renderer/
│   │   │   ├── App.tsx        # Root component
│   │   │   ├── main.tsx       # React entry point
│   │   │   ├── audio/
│   │   │   │   ├── AudioEngine.ts     # Tauri IPC interface
│   │   │   │   └── actions.ts         # Action execution
│   │   │   ├── components/
│   │   │   │   ├── AppUI.tsx          # Main layout
│   │   │   │   ├── KeyboardHand.tsx   # Hand panel
│   │   │   │   ├── KeyBindingTooltip.tsx
│   │   │   │   ├── KeySelector.tsx
│   │   │   │   ├── Metronome.tsx
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   ├── ActionsListModal.tsx
│   │   │   │   └── TitleBar.tsx
│   │   │   ├── keyboard/
│   │   │   │   ├── layouts.ts     # Layout resolution
│   │   │   │   └── keyBindings.ts
│   │   │   ├── hooks/
│   │   │   │   └── useKeyboardEvents.ts
│   │   │   └── store/
│   │   │       └── appStore.ts    # Zustand state
│   │   ├── shared/
│   │   │   └── types.ts
│   │   └── mappings/              # Keyboard layout definitions
│   │       ├── actions.json
│   │       ├── dvorak-device.json
│   │       ├── dvorak-semitones.json
│   │       ├── qwerty-device.json
│   │       └── qwerty-semitones.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── docs/                   # Documentation
└── SPEC.md                 # Project specification
```

## Key Modules

### Rust Audio Engine (`audio-engine/src/audio/engine.rs`)

Real-time audio synthesis using cpal with a dedicated audio thread:

- `AudioEngine::init()` - Initializes cpal output stream
- `AudioEngine::play_note(frequency, hand)` - Triggers a note
- `AudioEngine::stop_note(frequency, hand)` - Releases a note
- `AudioEngine::set_volume(volume)` - Sets master volume
- `AudioEngine::panic()` - Stops all notes immediately

Voice management:
- 128-voice polyphony per hand (256 total)
- Triangle wave oscillator with phase accumulation
- ADSR envelope (Attack: 1ms, Decay: 100ms, Sustain: 70%, Release: 300ms)

Command flow:
```
Frontend (invoke) → Tauri Command → Channel → Audio Thread → cpal buffer
```

### Frontend Audio Interface (`frontend/src/renderer/audio/AudioEngine.ts`)

Thin wrapper around Tauri IPC commands:

```typescript
playNote(frequency: number, hand: 'left' | 'right')
stopNote(frequency: number, hand: 'left' | 'right')
setVolume(value: number)
panic()
```

### Keyboard Event Flow

```
KeyDown event
    ↓
useKeyboardEvents.ts (hook)
    ↓
layouts.ts → getLayout() builds KeyMapping[] for current layout
    ↓
Find mapping where m.key === e.key.toLowerCase()
    ↓
calculateFrequency(semitone, octave, selectedKey) → audioEngine.playNote()
```

### State Management (`frontend/src/renderer/store/appStore.ts`)

Zustand store owning all UI state (Rust has no duplicate state):

- `keyboardLayout` - Current layout ('dvorak' | 'qwerty')
- `leftOctave`, `rightOctave` - Per-hand octave (1-8)
- `selectedKey` - Transposition key (0-11 for C-B)
- `volume` - Master volume in dB
- `showSettings`, `showActions` - Modal visibility
- `audioReady` - Whether audio engine is initialized
- `pressedKeys` - Currently held keys

## Tauri IPC Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `cmd_init_audio` | - | Initialize audio engine |
| `cmd_play_note` | semitone, octave, hand, selected_key | Calculate freq and play |
| `cmd_play_note_raw` | frequency, hand | Play with precalculated freq |
| `cmd_stop_note` | semitone, octave, hand, selected_key | Calculate freq and stop |
| `cmd_stop_note_raw` | frequency, hand | Stop with precalculated freq |
| `cmd_stop_all` | - | Stop all notes |
| `cmd_panic` | - | Emergency stop all |
| `cmd_set_volume` | volume | Set master volume |
| `cmd_get_volume` | - | Get current volume |
| `cmd_is_audio_ready` | - | Check if audio initialized |

## Note Calculation

```typescript
MIDI = (octave + 1) * 12 + noteIndex
Frequency = 440 × 2^((MIDI - 69) / 12)
```

Where `noteIndex` is derived from `selectedKey + semitone` (mod 12).

## Key Mappings

Actions defined in `mappings/actions.json`:
- `left_sound` / `right_sound` - 12 notes per hand
- `octave` - 4 actions (increase/decrease per hand)
- `transport` - panic_stop, toggle_metronome
- `settings` - open_settings, toggle_actions_list

## Latency Characteristics

- Buffer size: 128 samples (2.9ms at 44.1kHz)
- IPC overhead: ~0.5-1ms (Tauri invoke)
- Audio thread command processing: ~0.1ms
- Total key-to-sound: ~3-5ms perceived latency

## Building and Running

```bash
# Build frontend
cd frontend && npm run build

# Build audio engine (Rust/Tauri)
cd audio-engine && cargo build

# Run in development
cd audio-engine && cargo run
```
