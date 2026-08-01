# Fei Quick Reference

## Sound Buttons

### Right Hand (G/UC/IR/EP/L;)

| Row | 1 | 2 | 3 | 4 |
|-----|----|----|----|----|
| Upper | +9 | +10 | +11 | +12 |
| Home | +5 | +6 | +7 | +8 |
| Lower | +1 | +2 | +3 | +4 |

### Left Hand (;/'/,/[/./]/'/)

| Row | 1 | 2 | 3 | 4 |
|-----|----|----|----|----|
| Upper | +9 | +10 | +11 | +12 |
| Home | +5 | +6 | +7 | +8 |
| Lower | +1 | +2 | +3 | +4 |

## Octave Controls

| Hand | Increase | Decrease |
|------|----------|----------|
| Right | O+ (7) | O- (8) |
| Left | O+ (4) | O- (3) |

## Transport

| Action | Key |
|--------|-----|
| Toggle Metronome | / |
| Panic (Stop All) | \ |
| Open Settings | Escape |
| Toggle Actions List | ] |

## Settings

- **Key Selector**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- **Octave Range**: 1-8 per hand
- **Volume**: -40dB to 0dB

## Note Calculation

```
Frequency = 440 × 2^((MIDI - 69) / 12)
```

Where MIDI number = (Octave + 1) × 12 + NoteIndex + IntervalOffset
