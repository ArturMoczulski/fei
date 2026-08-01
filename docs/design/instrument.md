# Fei Instrument Design

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
| Upper | G/U | C/I | R/E | L/P |
| Home | H/J | T/K | N/L | S/; |
| Lower | M/M | W/, | V/. | Z// |

### Left Hand (mirror of right, lowest to highest pitch)

| Row | Position 1 | Position 2 | Position 3 | Position 4 |
|-----|------------|------------|------------|------------|
| Upper | ;/' | ,/[ | ./] | '/= |
| Home | A/- | O/Tab | E/Esc | U/Bksp |
| Lower | Q/Z | J/X | K/C | ;/V |

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
- **Right hand**: O+/O- (QWERTY: 7/8)
- **Left hand**: O+/O- (QWERTY: 4/3)

## Key Transposition

The **Key Selector** determines the root note of the scale. This transposes all notes while maintaining their interv relationships.

For example, if Key = C:
- The upper-left button plays C

If Key = D:
- The upper-left button plays D

The **interval** (semitone offset) shown on each button remains constant regardless of the Key setting. This allows players to think in intervals rather than absolute notes.

## Sound Buttons

Each grid position corresponds to a specific **interval** (semitone offset) from the root:

| Position | Upper Row | Home Row | Lower Row |
|----------|-----------|----------|-----------|
| 1 (lowest) | +9 semitones | +5 semitones | +1 semitone |
| 2 | +10 semitones | +6 semitones | +2 semitones |
| 3 | +11 semitones | +7 semitones | +3 semitones |
| 4 (highest) | +12 semitones | +8 semitones | +4 semitones |

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
- **Key label**: The physical key to press (e.g., G for DVORAK, U for QWERTY)
- **Note name**: The musical note at current octave and key setting (e.g., C, D#, F#)
- **Interval**: Semitone offset from the lowest note (+0 to +11)
- **Frequency**: The actual Hz value of the note at current settings
