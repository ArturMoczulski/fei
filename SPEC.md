# Fei - Isomorphic Split Keyboard Instrument

## Overview
A desktop application that transforms a standard keyboard into an isomorphic music instrument. Each hand plays independently with configurable octave ranges. Supports QWERTY/Dvorak layout mapping. Features a track-based timeline system where MIDI files and metronome play in sync.

## Architecture

### Stack
- **Framework**: Tauri 2.x (Rust backend + WebView)
- **UI**: React with TypeScript
- **Audio**: Rust/cpal for low-latency audio (sub-10ms)
- **Build**: Cargo + Vite

### Window Configuration
- Single main window (1200x800 default)
- Native window decorations
- Maximized by default

## Core Concepts

### Track-Based Timeline System
All audio playback (MIDI files and metronome) occurs on a shared timeline called the **Transport**. This ensures:
- MIDI files and metronome play in perfect sync
- Single source of truth for playback state (playing, paused, stopped)
- Precise timing for all events

### Transport
The transport controls global playback:
- **Play**: Start timeline from current position
- **Pause**: Pause timeline at current position
- **Stop**: Stop timeline and reset to beginning
- **Position**: Current time in the timeline (measures, beats, time)

### Tracks
A track is a container for audio/MIDI data:
- **MIDI Track**: Loads and plays MIDI files
- **Metronome Track**: Generates click sounds on beat boundaries
- Each track has its own data (MIDI notes or metronome pattern)
- All tracks are synchronized to the transport timeline

### Timeline/Transport View
Visual representation of the transport:
- Horizontal timeline showing bars and beats
- Playhead indicator (10% from left when stopped)
- Width matches combined hand width
- Height: ~150px

### Piano Roll View (per MIDI track)
2D visualization of MIDI note data:
- **Horizontal axis**: Time (bars, beats)
- **Vertical axis**: Pitch (semitones, matching keyboard layout colors)
- Color coding matches device button colors
- Shows note on/off as rectangles

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
│  ┌─────────────────────────────────────────────────┐  │
│  │  TRANSPORT BAR                                  │  │
│  │  [◀][▶][⏹] | 120 BPM | 4/4 | 001:01:000      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  TRACK VIEW (Piano Roll)                       │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │  ══════════════════════════════════════════════ │  │
│  │  │ ▼ Playhead (10% from left when stopped)  │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────┐   ┌─────────────────────┐     │
│  │    LEFT HAND        │   │    RIGHT HAND       │     │
│  │                     │   │                     │     │
│  │  3x4 Isomorphic    │   │  3x4 Isomorphic    │     │
│  │  Button Grid       │   │  Button Grid       │     │
│  │  (smaller height)  │   │  (smaller height)  │     │
│  │                     │   │                     │     │
│  └─────────────────────┘   └─────────────────────┘     │
│                                                         │
│  [Key Selector ▼] [Metronome ▶ 120 BPM ▼] [Vol: ───] │
└─────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Transport Bar
- Play/Pause button (single toggle)
- Stop button
- BPM display (non-editable, shows current tempo)
- Time signature display
- Position display (bars:beats:ticks)

#### Track View
- Height: ~150px
- Width: matches combined hand width
- Horizontal grid lines at each bar
- Vertical grid lines at each beat
- Piano roll shows notes as colored rectangles
- Colors match hand colors (pink for left, emerald for right)
- Playhead: vertical line, 10% from left when stopped

#### Hands Display
- Reduced height from current
- Maintains same button grid (3x4 per hand)
- Octave controls remain

## Isomorphic Keyboard Layout

### Layout Pattern (Wicki-Hayden inspired)
```
Row 1: C   D   E   F   G   A   B
Row 2: C#  D#  F#  G#  A#  C#  D#
Row 3: D#  F#  G#  A#  C#  D#  F#
```

### Button Grid (3 rows x 4 columns per hand)
Each button represents a note. The layout is the same for both hands but offset by octave.

## Functionality Specification

### Core Features

1. **Track-Based Playback**
   - Single transport controls all playback
   - MIDI track loads .mid/.midi files
   - Metronome track generates clicks based on BPM/time signature
   - All tracks sync to transport timeline

2. **Transport Controls**
   - Play/Pause: Toggle playback (spacebar)
   - Stop: Stop and reset to beginning
   - Timeline position tracked in bars:beats:ticks

3. **MIDI Track**
   - Load MIDI file via file picker
   - Display piano roll visualization
   - Color-coded by hand (left=pink, right=emerald)
   - Playback synced to transport

4. **Metronome Track**
   - Always synced to transport
   - Plays click on each beat
   - Accented click on downbeat
   - Uses audio engine's metronome voice

5. **Key Press Detection**
   - Capture keyboard events system-wide
   - Map physical keys to musical notes
   - Support polyphony (simultaneous key presses)

6. **Sound Generation**
   - Rust/cpal audio engine for low latency
   - Triangle wave oscillator with ADSR envelope
   - Note-on triggers attack, note-off triggers release

7. **Octave Control**
   - Each hand independently adjustable
   - Range: C1 to C8
   - Keyboard shortcuts (number keys)

### User Interactions

- **Spacebar**: Toggle transport play/pause
- **Backslash (\)**: Stop transport
- **Key Press**: Play corresponding note, highlight button
- **Key Release**: Stop note (release envelope), unhighlight button
- **Octave Up/Down**: Shift pitch range for hand

### Data Handling
- No persistence required for MVP
- Settings can be added later

### Edge Cases
- Ignore modifier keys (Shift, Ctrl, Alt, Meta)
- Handle key repeat (ignore repeated keydown events)
- Graceful audio context initialization on first interaction

## Technical Specification

### File Structure
```
fei/
├── audio-engine/
│   ├── src/
│   │   ├── main.rs
│   │   ├── audio/
│   │   │   ├── mod.rs
│   │   │   ├── engine.rs    # cpal audio engine
│   │   │   └── synth.rs     # Voice, ADSR
│   │   └── commands.rs      # IPC commands
│   └── tauri.conf.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── TitleBar.tsx
│   │   │   ├── Transport.tsx      # NEW: Transport bar
│   │   │   ├── TrackView.tsx      # NEW: Piano roll
│   │   │   ├── KeyboardHand.tsx
│   │   │   ├── IsomorphicButton.tsx
│   │   │   ├── OctaveControl.tsx
│   │   │   ├── KeySelector.tsx
│   │   │   ├── Metronome.tsx
│   │   │   ├── Autoplay.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── audio/
│   │   │   ├── AudioEngine.ts
│   │   │   ├── MetronomeAudioEngine.ts
│   │   │   ├── AutoplayAudioEngine.ts
│   │   │   └── actions.ts
│   │   ├── hooks/
│   │   │   ├── useKeyboardEvents.ts
│   │   │   └── useTransport.ts      # NEW: Transport state
│   │   ├── store/
│   │   │   └── appStore.ts
│   │   └── styles/
│   │       └── index.css
│   └── mappings/
│       ├── dvorak-device.json
│       └── qwerty-device.json
├── SPEC.md
└── Makefile
```

### Dependencies (Frontend)
- react: ^18.2.0
- react-dom: ^18.2.0
- @tauri-apps/api: ^2.0.0
- @tonejs/midi: ^2.0.28
- zustand: ^5.0.14

## Acceptance Criteria

1. ✅ Application launches without errors
2. ✅ Transport bar visible with play/pause/stop
3. ✅ Track view shows piano roll for loaded MIDI
4. ✅ Spacebar toggles play/pause
5. ✅ Metronome and MIDI play in sync
6. ✅ Two distinct button grids visible (left/right hand)
7. ✅ Pressing keys produces corresponding notes
8. ✅ Left-hand keys play notes for left hand at configured octave
9. ✅ Right-hand keys play notes for right hand at configured octave
10. ✅ Octave controls change pitch for respective hand
11. ✅ Sound plays immediately on key press (sub-10ms latency)
12. ✅ Visual feedback shows pressed keys
13. ✅ Multiple simultaneous key presses work (polyphonic)
14. ✅ Metronome plays click sound at correct tempo
