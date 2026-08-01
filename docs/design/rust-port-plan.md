# Fei Rust Port - Refactor Plan

## Overview

Port Fei from Electron/React/Tone.js to **Rust + Tauri + cpal** for platform-independent, low-latency audio synthesis.

**Why Rust/Tauri:**
- `cpal` provides cross-platform audio I/O (Core Audio on macOS, ALSA on Linux, ASIO on Windows) with 1-5ms latency
- Tauri provides native windowing with a Rust backend
- No Electron overhead, smaller binary, faster startup
- Rust's memory safety and concurrency model is ideal for real-time audio

## Current Architecture (Electron)

```
┌─────────────────────────────────────────────────────────────┐
│                        Electron Main                         │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  electron-store │  │  Window Mgmt    │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            │ IPC
┌─────────────────────────────────────────────────────────────┐
│                     Electron Renderer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │   Zustand    │  │  Tone.js     │      │
│  │              │←→│   Store      │  │  (Web Audio) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**Latency Problem:** Tone.js uses Web Audio API which has 10-50ms inherent latency due to browser audio buffer scheduling.

## Target Architecture (Rust/Tauri)

```
┌─────────────────────────────────────────────────────────────┐
│                        Tauri Backend                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Settings      │  │  Audio Engine   │  │   MIDI      │ │
│  │   (JSON file)   │  │  (cpal + synth) │  │   Out       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                              ↓ Audio Stream (1-5ms latency)  │
└─────────────────────────────────────────────────────────────┘
                            │ IPC + Events
┌─────────────────────────────────────────────────────────────┐
│                        Tauri Frontend                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              React UI (same components)                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Key Rust Crates

| Crate | Purpose |
|-------|---------|
| `tauri` | Window management, IPC, native integration |
| `cpal` | Cross-platform audio I/O with low latency |
| `rodio` | Higher-level audio (optional, simpler than cpal) |
| `serde` / `serde_json` | Settings persistence |
| `rusqlite` or `serde_json` | Settings storage |
| `tokio` | Async runtime for non-blocking operations |
| `log` / `env_logger` | Logging |

## Implementation Phases

### Phase 1: Project Setup

- [ ] Initialize Tauri project with React template
- [ ] Add dependencies: cpal, serde, log
- [ ] Verify native window opens and audio device enumeration works
- [ ] Set up logging infrastructure

### Phase 2: Audio Engine (Rust)

- [ ] Implement `AudioEngine` struct with cpal
  - [ ] Enumerate audio output devices
  - [ ] Create audio stream with configurable sample rate (44.1kHz/48kHz)
  - [ ] Implement triangle wave oscillator with ADSR envelope
  - [ ] Support 128-voice polyphony
  - [ ] Implement `play_note(frequency, hand)`, `stop_note(frequency, hand)`, `panic()`
- [ ] Expose audio engine via Tauri commands
- [ ] Verify latency with oscilloscope or audio test

### Phase 3: Metronome (Rust)

- [ ] Implement `MetronomeEngine` in Rust
  - [ ] Accurate timing using audio clock (not system sleep)
  - [ ] Click synthesis with accent on beat 1
  - [ ] BPM and time signature control
- [ ] Expose via Tauri commands

### Phase 4: State Management

- [ ] Implement `AppState` in Rust (mirrors Zustand store)
  - [ ] keyboardLayout, volume, leftOctave, rightOctave, selectedKey
  - [ ] pressedKeys tracking
- [ ] Settings persistence (JSON file in app data directory)
- [ ] Emit state changes to frontend via events

### Phase 5: IPC Commands

- [ ] Audio: `init`, `play_note`, `stop_note`, `stop_all`, `panic`, `set_volume`
- [ ] Metronome: `start`, `stop`, `set_bpm`, `set_time_signature`
- [ ] Settings: `load_settings`, `save_settings`, `get_settings`, `update_setting`
- [ ] Window: `minimize`, `maximize`, `close`, `is_maximized`

### Phase 6: Frontend Refactor

- [ ] Remove Tone.js, Zustand dependencies
- [ ] Replace `useAppStore` with Tauri invoke/event pattern
- [ ] Refactor `AudioEngine` calls to use `invoke()`
- [ ] Keep React components largely unchanged (same UI)
- [ ] Update `useKeyboardEvents` hook to use Tauri commands

### Phase 7: Feature Parity

- [ ] Dvorak/QWERTY keyboard layouts (reuse JSON mappings)
- [ ] Octave control for both hands
- [ ] Key selector (12 root notes)
- [ ] Volume control
- [ ] Settings modal
- [ ] Actions list modal
- [ ] Metronome with presets and custom BPM
- [ ] Title bar with minimize/maximize/close

### Phase 8: Testing

- [ ] Unit tests for audio engine (frequency calculations, envelope)
- [ ] Unit tests for state management
- [ ] Integration tests for IPC commands
- [ ] Latency verification

## File Structure

```
fei-rust/
├── src/
│   ├── main.rs              # Tauri entry point
│   ├── audio/
│   │   ├── mod.rs
│   │   ├── engine.rs        # AudioEngine with cpal
│   │   ├── synth.rs         # Triangle wave synth with ADSR
│   │   ├── metronome.rs     # Metronome engine
│   │   └── notes.rs         # Frequency/midi calculations
│   ├── state/
│   │   ├── mod.rs
│   │   └── app_state.rs     # AppState struct
│   ├── settings/
│   │   ├── mod.rs
│   │   └── store.rs         # Settings persistence
│   └── commands/
│       ├── mod.rs
│       ├── audio.rs         # Audio IPC commands
│       ├── metronome.rs     # Metronome IPC commands
│       └── settings.rs      # Settings IPC commands
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── icons/
├── src-ui/                  # React frontend (moved from src/renderer)
│   ├── components/
│   ├── keyboard/
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── mappings/                # Shared JSON mappings (unchanged)
│   ├── dvorak-device.json
│   ├── dvorak-semitones.json
│   ├── qwerty-device.json
│   ├── qwerty-semitones.json
│   └── actions.json
└── SPEC.md
```

## Data Types (Rust)

```rust
#[derive(Clone, Copy, PartialEq)]
pub enum Hand {
    Left,
    Right,
}

#[derive(Clone, Copy, Debug)]
pub struct Envelope {
    pub attack: f32,
    pub decay: f32,
    pub sustain: f32,
    pub release: f32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppSettings {
    pub keyboard_layout: String,  // "dvorak" | "qwerty"
    pub volume: f32,
    pub left_octave: i32,
    pub right_octave: i32,
    pub selected_key: i32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KeyMapping {
    pub key: String,
    pub semitone: i32,
    pub hand: Hand,
    pub action: String,
}
```

## Synthesizer Design

Triangle wave with ADSR envelope, implemented in Rust for real-time audio:

```rust
struct Voice {
    frequency: f32,
    phase: f32,
    envelope: Envelope,
    state: VoiceState,  // Attack, Decay, Sustain, Release, Off
    age: f32,           // Time since note started
}

impl Voice {
    fn process(&mut self, sample_rate: f32) -> f32 {
        // Triangle wave
        let sample = 2.0 * (self.phase * 2.0 - 1.0).abs() - 1.0;

        // Apply envelope based on state
        let envelope_value = match self.state {
            VoiceState::Attack => self.age / self.envelope.attack,
            VoiceState::Decay => 1.0 - (1.0 - self.envelope.sustain) * (self.age / self.envelope.decay),
            VoiceState::Sustain => self.envelope.sustain,
            VoiceState::Release => self.envelope.sustain * (1.0 - self.age / self.envelope.release),
            VoiceState::Off => 0.0,
        };

        self.phase += self.frequency / sample_rate;
        if self.phase >= 1.0 { self.phase -= 1.0; }

        sample * envelope_value
    }
}
```

## Latency Comparison

| Platform | Latency | Notes |
|----------|---------|-------|
| Electron/Tone.js | 10-50ms | Browser audio buffer limitation |
| Rust/cpal | 1-5ms | Direct Core Audio/JACK/ASIO access |

## Testing Latency

```rust
// In audio engine, after playing a note, record timestamp
let play_time = Instant::now();
// On audio thread, compare with buffer presentation time
// Report latency via event to frontend
```

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Real-time audio thread safety | Use lock-free ring buffer for command queue |
| Audio dropouts | Pre-allocate voice pool, avoid allocations in audio callback |
| Cross-platform audio differences | Abstract device enumeration, test on all platforms |
| React state sync with Rust | Use Tauri events for state push, not polling |

## Next Steps

1. Create new Tauri project: `cargo create-tauri-app fei --template react-ts`
2. Add audio dependencies to `Cargo.toml`
3. Implement Phase 2 (Audio Engine) first - this is the critical path
4. Verify latency is acceptable before continuing

## Unchanged from Current Implementation

- **Keyboard layouts**: JSON files in `mappings/` directory
- **UI components**: React components largely unchanged
- **Key concepts**: Isomorphic keyboard, split hands, octave control, Dvorak/QWERTY
- **Feature set**: Same features, just with lower latency
