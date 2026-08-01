# Fei - Isomorphic Split Keyboard Instrument

## Overview
A desktop application that transforms a standard keyboard into an isomorphic music instrument. Each hand plays independently with configurable octave ranges. Supports QWERTY/Dvorak layout mapping.

## Architecture

### Stack
- **Framework**: Electron (main process + renderer)
- **UI**: React with TypeScript
- **Audio**: Web Audio API (Tone.js for synthesis)
- **Build**: electron-builder

### Window Configuration
- Single main window (1200x800 default)
- Frameless window with custom title bar
- Minimize, maximize, close controls

## UI Design

### Color Palette
- Background: `#0a0a0f` (deep navy black)
- Surface: `#14141f` (dark purple-grey)
- Primary: `#7c3aed` (violet)
- Secondary: `#06b6d4` (cyan)
- Accent Left: `#f472b6` (pink)
- Accent Right: `#34d399` (emerald)
- Text Primary: `#f8fafc`
- Text Muted: `#94a3b8`

### Typography
- Font: "JetBrains Mono", monospace
- Headings: 24px/20px/16px
- Body: 14px
- Small: 12px

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Fei              [Settings] [─] [□] [×]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐   ┌─────────────────────┐     │
│  │    LEFT HAND        │   │    RIGHT HAND       │     │
│  │                     │   │                     │     │
│  │  3x4 Isomorphic     │   │  3x4 Isomorphic     │     │
│  │  Button Grid        │   │  Button Grid         │     │
│  │                     │   │                     │     │
│  │  Octave: C3         │   │  Octave: C4          │     │
│  │  [▼] [↑]            │   │  [▼] [↑]             │     │
│  └─────────────────────┘   └─────────────────────┘     │
│                                                         │
│  [Key Selector ▼] [Metronome ▶ 120 BPM ▼] [Vol: ───] │
└─────────────────────────────────────────────────────────┘
```

## Isomorphic Keyboard Layout

### Layout Pattern (Wicki-Hayden inspired)
```
Row 1: C   D   E   F   G   A   B
Row 2: C#  D#  F#  G#  A#  C#  D#
Row 3: D#  F#  G#  A#  C#  D#  F#
```

### Button Grid (3 rows x 7 columns per hand)
Each button represents a note. The layout is the same for both hands but offset by octave.

### Split Point
The keyboard is split at a central point (around the J/K keys for QWERTY). Keys to the left trigger the left hand, keys to the right trigger the right hand.

## Keyboard Mapping

### QWERTY Layout
```
Left Hand (Z row and below):
Z=C3, X=D3, C=E3, V=F3, B=G3, N=A3, M=B3
A=C#3, S=D#3, D=F#3, F=G#3, G=A#3, H=C#4
Q=D#3, W=F#3, E=G#3, R=A#3, T=C#4, Y=D#4, U=F#4

Right Hand (J row and above):
Y=C4, U=D4, I=E4, O=F4, P=G4, [=A4, ]=B4
7=C#4, 8=D#4, 9=F#4, 0=G#4, -=A#4
6=C#5, 7=D#5, 8=F#5, 9=G#5, 0=A#5
```

### Dvorak Layout
```
Left Hand:
'=C3, ,=D3, .=E3, P=F3, Y=G3, G=A3, C=B3
A=C#3, O=D#3, E=F#3, U=G#3, D=A#3, H=C#4
;=D#3, Q=F#3, J=G#3, K=A#3, X=C#4, S=D#4, L=F#4

Right Hand:
L=C4, M=D4, Y=E4, N=F4, W=G4, V=A4, Z=B4
6=C#4, 7=D#4, 8=F#4, 9=G#4, 0=A#4
R=C#5, S=D#5, T=F#5, N=G#5, O=A#5
```

## Functionality Specification

### Core Features

1. **Key Press Detection**
   - Capture keyboard events system-wide (when focused)
   - Map physical keys to musical notes based on configured layout
   - Support simultaneous key presses (polyphony)

2. **Sound Generation**
   - Web Audio API oscillator-based synthesis
   - Sine wave base with subtle harmonics for piano-like tone
   - ADSR envelope: Attack 10ms, Decay 100ms, Sustain 0.7, Release 300ms
   - Note-off triggers release phase

3. **Octave Control**
   - Each hand independently adjustable octave
   - Range: C1 to C7
   - Increment/decrement buttons on UI
   - Display current octave note (e.g., "C3")

4. **Visual Feedback**
   - Pressed keys highlighted in real-time
   - Button color intensity based on velocity/pressure (simulated)
   - Smooth CSS transitions

5. **Settings Panel**
   - Keyboard layout selector (QWERTY/Dvorak)
   - Audio output device selector
   - Master volume control
   - Note duration/reverb optional

6. **Metronome**
   - Tempo range: 20-240 BPM
   - Preset tempos: Largo (50), Adagio (70), Andante (90), Moderato (110), Allegro (130), Presto (160), Prestissimo (180)
   - Accented first beat
   - Visual feedback when running
   - Independent of main audio engine

### User Interactions

- **Key Press**: Play corresponding note, highlight button
- **Key Release**: Stop note (release envelope), unhighlight button
- **Octave Up/Down**: Shift pitch range for hand
- **Settings Gear**: Open settings modal
- **Metronome Toggle**: Start/stop metronome
- **Tempo Preset**: Select tempo from dropdown (Largo to Prestissimo)
- **Custom BPM**: Input specific BPM value

### Data Handling
- Settings persisted in electron-store (JSON)
- No external API calls

### Edge Cases
- Ignore modifier keys (Shift, Ctrl, Alt, Meta) except when combined
- Handle key repeat (ignore repeated keydown events)
- Graceful audio context initialization on first interaction
- Handle rapid key press/release sequences without artifacts

## Technical Specification

### File Structure
```
fei/
├── package.json
├── electron-builder.json
├── tsconfig.json
├── vite.config.ts
├── mappings/
│   ├── qwerty.json
│   └── dvorak.json
├── src/
│   ├── main/
│   │   ├── index.ts          # Main process entry
│   │   ├── window.ts         # Window management
│   │   └── ipc.ts            # IPC handlers
│   ├── preload/
│   │   └── index.ts          # Preload script
│   ├── renderer/
│   │   ├── index.html
│   │   ├── main.tsx          # React entry
│   │   ├── App.tsx           # Main app component
│   │   ├── components/
│   │   │   ├── TitleBar.tsx
│   │   │   ├── KeyboardHand.tsx
│   │   │   ├── IsomorphicButton.tsx
│   │   │   ├── OctaveControl.tsx
│   │   │   ├── KeySelector.tsx
│   │   │   ├── Metronome.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── hooks/
│   │   │   ├── useAudio.ts
│   │   │   ├── useKeyboard.ts
│   │   │   └── useSettings.ts
│   │   ├── audio/
│   │   │   ├── AudioEngine.ts
│   │   │   └── MetronomeAudioEngine.ts
│   │   ├── keyboard/
│   │   │   ├── layouts.ts
│   │   │   └── mapping.ts
│   │   └── styles/
│   │       └── index.css
│   └── shared/
│       └── types.ts
└── resources/
    └── icon.png
```

### Dependencies
- electron: ^28.0.0
- react: ^18.2.0
- react-dom: ^18.2.0
- tone: ^14.7.77
- electron-store: ^8.1.0
- electron-builder: ^24.9.1
- vite: ^5.0.0
- @vitejs/plugin-react: ^4.2.0
- typescript: ^5.3.0

## Acceptance Criteria

1. ✅ Application launches without errors
2. ✅ Two distinct button grids visible (left/right hand)
3. ✅ Pressing QWERTY keys produces corresponding notes
4. ✅ Left-hand keys play notes for left hand at configured octave
5. ✅ Right-hand keys play notes for right hand at configured octave
6. ✅ Octave controls change pitch for respective hand
7. ✅ Settings modal allows switching between QWERTY and Dvorak
8. ✅ Layout switch immediately updates key mappings
9. ✅ Sound plays immediately on key press (no noticeable delay)
10. ✅ Visual feedback shows pressed keys
11. ✅ Multiple simultaneous key presses work (polyphonic)
12. ✅ Window controls (minimize, maximize, close) function correctly
13. ✅ Metronome plays click sound at correct tempo
14. ✅ Tempo preset dropdown changes metronome speed
15. ✅ Metronome can be started and stopped independently
