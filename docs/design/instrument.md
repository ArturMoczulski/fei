# Fei Instrument Design

## Key Notation

When listing keys, we use the format: **QWERTY / DVORAK**

For example: `U / G` means press the U key on a QWERTY keyboard or the G key on a DVORAK keyboard to trigger the same action.

---

## Overview

Fei is an isomorphic split keyboard instrument that transforms a computer keyboard into a musical instrument. The instrument is designed to be played with two independent hands, each controlling a separate pitch range, with octave control per hand.

## Isomorphic Layout

Unlike traditional piano keyboards where white and black keys form an irregular pattern, Fei uses an **isomorphic layout** — a regular grid where each key represents a consecutive semitone. This design offers several advantages:

- **Mirror symmetry**: The left and right hands are mirror images of each other
- **Transposition-friendly**: Any scale or chord pattern can be played at any position with the same fingering
- **Consistent muscle memory**: One hand position works across all keys

## Hand Organization

Each hand has access to **12 consecutive semitones** (one full chromatic octave), arranged in a 3×4 grid:

### Right Hand (lowest to highest pitch)

| Row | Position 1 | Position 2 | Position 3 | Position 4 |
|-----|------------|------------|------------|------------|
| Upper | `U / G` | `I / C` | `E / R` | `P / L` |
| Home | `J / H` | `K / T` | `L / N` | `; / S` |
| Lower | `M / M` | `, / W` | `. / V` | `/ / Z` |

### Left Hand (mirror of right, lowest to highest pitch)

| Row | Position 1 | Position 2 | Position 3 | Position 4 |
|-----|------------|------------|------------|------------|
| Upper | `/ / ;` | `. / ,` | `, / .` | `' / '` |
| Home | `- / A` | `Tab / O` | `Esc / E` | `Bksp / U` |
| Lower | `Z / Q` | `X / J` | `C / K` | `V / ;` |

## Pitch Organization

### Semitone Grid

Within each hand, the 12 semitones are arranged so that:

- **Pitch increases left to right**: Each column is a higher semitone
- **Pitch increases top to bottom**: Each row is a higher semitone

The highest note (11 semitones from the base) is in the upper-right corner. The lowest note (0 semitones) is in the lower-left corner.

### Left Hand Mirror

The left hand is a **mirror reflection** of the right hand. This means:
- When both hands play the same relative finger pattern, they produce the same interval
- Symmetrical chords (like thirds, fifths, octaves) can be played with identical hand positions
- Scales can be practiced in one hand and transferred to the other

## Octave System

Each hand has **independent octave control**, allowing:
- Different octaves for each hand simultaneously
- Playing melody in one octave while accompaniment plays in another
- Full range coverage without hand repositioning

The octave buttons are mapped to keyboard keys:

| Hand | Increase | Decrease |
|------|----------|----------|
| Right | `7 / O+` | `8 / O-` |
| Left | `4 / O+` | `3 / O-` |

## Key Transposition

The **Key Selector** determines the root note of the scale. This transposes all notes while maintaining their interval relationships.

For example, if Key = C:
- The upper-left button plays C

If Key = D:
- The upper-left button plays D

The **interval** (semitone offset) shown on each button remains constant regardless of the Key setting. This allows players to think in intervals rather than absolute notes.

## Sound Buttons

Each grid position corresponds to a specific **interval** (semitone offset) from the root:

| Position | Upper Row | Home Row | Lower Row |
|----------|-----------|----------|-----------|
| 1 (lowest) | +9 | +5 | +1 |
| 2 | +10 | +6 | +2 |
| 3 | +11 | +7 | +3 |
| 4 (highest) | +12 | +8 | +4 |

The interval values (e.g., +7) represent the semitone distance from the lowest note in that hand's octave.

## Playing Techniques

### Single Notes
Press any sound button to produce a note at that pitch. The pitch depends on:
1. The button's interval (0-11)
2. The hand's octave setting (1-8)
3. The Key Selector (0-11 for C-B)

### Intervals
To play an interval (like a fifth at +7 semitones):
- Find the same relative position in both hands
- Both hands produce the same interval relative to their octaves

### Scales
Scales are played by moving across the grid. For example, a C major scale in the right hand:
- C (0) → D (2) → E (4) → F (5) → G (7) → A (9) → B (11)

### Chords
Chords are formed by pressing multiple buttons simultaneously. Because the layout is isomorphic, chord shapes can be learned once and transposed anywhere.

## Keyboard Layouts

### DVORAK Layout (Primary)
The primary layout, optimized for the KeyMouse device:
- Sound buttons use letter positions from the DVORAK keyboard layout
- Octave and transport controls use number keys

### QWERTY Layout (Alternative)
A fallback layout for standard keyboards:
- Sound buttons use corresponding QWERTY positions
- Octave and transport controls use number keys

Both layouts produce identical musical output — only the physical key positions differ.

## Metronome

The built-in metronome provides:
- Tempo presets: Largo (50 BPM), Adagio (70 BPM), Andante (90 BPM), Moderato (110 BPM), Allegro (130 BPM), Presto (160 BPM), Prestissimo (180 BPM)
- Custom BPM input (20-240 range)
- Time signatures: 2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8

## Display Information

Each sound button displays:
- **Key label**: The physical keys to press (`QWERTY / DVORAK`)
- **Note name**: The musical note at current octave and key setting (e.g., C, D#, F#)
- **Semantic label**: Functional role of the interval in the melody (e.g., Key, Pass, Warm, Color, Tense, Conson, Bright, Resolve)
- **Interval**: Semitone offset from the lowest note (+0 to +11)
- **Frequency**: The actual Hz value of the note at current settings

## Semantic Labels

Each semitone in a scale has a **semantic label** that describes its musical function in melody:

| Label | Meaning |
|-------|---------|
| **Key** | The tonal center/root of the scale |
| **Pass** | Passing tone, used for movement between stable notes |
| **Warm** | Adds warmth and color to the melody |
| **Color** | Gives character and distinctiveness |
| **Tense** | Creates tension, wants to resolve |
| **Conson** | Stable, consonant interval |
| **Bright** | Adds brightness and energy |
| **Resolve** | Strong tension that wants to resolve to the root |

### Major Scale Labels
- 0 (Key), 2 (Pass), 4 (Bright), 5 (Color), 7 (Tense), 9 (Conson), 11 (Warm), 12/0 (Resolve)

### Minor Scale Labels
- 0 (Key), 2 (Pass), 3 (Warm), 5 (Conson), 7 (Tense), 8 (Bright), 10 (Resolve)

### Pentatonic Scales
Pentatonic scales have fewer notes and simpler label patterns focused on the most consonant intervals.

## Scale Arrangement

### Default (Chromatic)
When no scale rearrangement is applied, keys map sequentially (0-11) regardless of scale selection. The scale selection only affects **highlighting** of notes that are within the chosen scale.

### Rearranged (Scale Lock Enabled)
When the **Scale Lock** is enabled (🔒), keys are rearranged according to the selected scale's ergonomics, placing scale notes in more natural hand positions.

This separation allows:
- **Visual feedback**: See which keys are "in scale" via green highlighting
- **Flexible playing**: Use chromatic mapping for maximum range or scale mapping for ergonomic patterns
