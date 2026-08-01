# Fei - Isomorphic Split Keyboard Instrument

## Project Overview

Fei is a desktop application that transforms a computer keyboard into a musical instrument using the Web Audio API. It is specifically designed for the KeyMouse split keyboard/mouse hybrid device, enabling ergonomic music creation with two independent hands.

## Concept

The application embraces an **isomorphic layout** where keys are arranged in a way that facilitates playing scales, chords, and intervals without the limitations of a traditional piano keyboard. Each hand operates independently with its own octave control, allowing for mirror-symmetric playing techniques.

## Key Features

### Core Functionality
- **Isomorphic Keyboard Layout**: 3 rows × 4 columns per hand (12 semitones per octave)
- **Dual Hand Control**: Left and right hands play independently with configurable octaves
- **Key Transposition**: Select the musical key (C, C#, D, etc.) to transpose all notes
- **Polyphonic Audio**: Supports multiple simultaneous notes per hand
- **Metronome**: Built-in metronome with tempo presets and time signature support

### Keyboard Layouts
- **DVORAK**: Primary layout for KeyMouse device
  - Right hand: G-C-R-L (upper), H-T-N-S (home), M-W-V-Z (lower)
  - Left hand: P-.-,-' (upper), U-E-O-A (home), ;-Q-J-K (lower)
- **QWERTY**: Alternative mapping for standard keyboards
  - Right hand: U-I-O-P (upper), J-K-L-; (home), M-,.-./ (lower)
  - Left hand: R-E-W-Q (upper), F-D-S-A (home), Z-X-C-V (lower)

### Audio Engine
- Built on Tone.js for Web Audio synthesis
- Triangle wave oscillator with ADSR envelope
- Independent synth per hand for stereo separation
- Maximum 32-note polyphony per hand

### File Structure

```
fei/
├── mappings/                    # Keyboard layout mappings
│   ├── dvorak-device.json      # Physical key positions (finger/row)
│   ├── dvorak-semitones.json   # Finger IDs to semitone intervals
│   ├── qwerty-device.json
│   └── qwerty-semitones.json
├── src/
│   ├── main/                   # Electron main process
│   ├── renderer/               # React UI
│   │   ├── components/        # React components
│   │   │   ├── KeyboardHand.tsx
│   │   │   ├── Metronome.tsx
│   │   │   ├── KeySelector.tsx
│   │   │   ├── OctaveControl.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── audio/             # Audio engines
│   │   │   ├── AudioEngine.ts
│   │   │   └── MetronomeAudioEngine.ts
│   │   ├── keyboard/          # Layout logic
│   │   │   └── layouts.ts
│   │   └── styles/
│   └── shared/                 # Shared types
│       └── types.ts
├── docs/                       # Documentation
│   └── keymouse_device.md      # KeyMouse hardware details
└── SPEC.md                     # Full specification
```

## MIDI Support

**Future Enhancement**: MIDI output to enable integration with DAWs (GarageBand, Ableton, Logic Pro).

To implement MIDI output:
1. Use the Web MIDI API (`navigator.requestMIDIAccess()`)
2. Create a MIDI output port
3. Send `noteOn` and `noteOff` messages with note number, velocity, and channel
4. Consider sending pitch bend data for expression

## Development

### Running
```bash
npm run dev      # Development server
npm run build    # Production build
npm run dist     # Create distributable
```

### Key Technologies
- **Electron**: Desktop framework
- **React + TypeScript**: UI
- **Tone.js**: Audio synthesis
- **Vite**: Build tool
- **electron-store**: Settings persistence

## Musical Notation System

The instrument uses the **12-tone equal temperament** system where:
- Octaves are divided into 12 semitones
- Semitones 0-11 map to: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- The selected "Key" transposes all notes (e.g., Key=D means D=0, E=1, F#=2, etc.)

## Configuration Persistence

Settings are stored via electron-store:
- `keyboardLayout`: 'qwerty' | 'dvorak'
- `volume`: Master volume in dB
- `leftOctave`: Left hand base octave
- `rightOctave`: Right hand base octave
- `selectedKey`: Transposition key (0-11 for C-C#)
