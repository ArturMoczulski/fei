import type { ScaleArrangement } from '../../shared/types';

export const SCALE_INTERVALS: Record<ScaleArrangement, number[]> = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11, 0, 1, 3, 6, 8, 10],
  natural_minor: [0, 2, 3, 5, 7, 8, 10, 0, 1, 4, 6, 9, 11],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11, 0, 1, 4, 6, 9, 10],
  pentatonic_major: [0, 2, 4, 7, 9, 0, 1, 3, 5, 6, 8, 10, 11],
  pentatonic_minor: [0, 3, 5, 7, 10, 0, 1, 2, 4, 6, 8, 9, 11],
};

export function getConsonanceOrder(scaleArrangement: ScaleArrangement): number[] {
  return SCALE_INTERVALS[scaleArrangement];
}

export function arrangeSemitonesByConsonance(baseSemitones: number[], scaleArrangement: ScaleArrangement): number[] {
  if (scaleArrangement === 'chromatic') {
    return [...baseSemitones].sort((a, b) => b - a);
  }

  const consonanceOrder = getConsonanceOrder(scaleArrangement);
  const remaining = [...baseSemitones];
  const result: number[] = [];

  for (const interval of consonanceOrder) {
    const index = remaining.indexOf(interval);
    if (index !== -1) {
      result.push(interval);
      remaining.splice(index, 1);
    }
  }

  for (const interval of remaining) {
    result.push(interval);
  }

  return result;
}

export function getScaleNotes(rootNote: number, scaleArrangement: ScaleArrangement): number[] {
  const intervals = SCALE_INTERVALS[scaleArrangement];
  const scaleNotes: number[] = [];

  for (let octave = 0; octave <= 2; octave++) {
    for (const interval of intervals) {
      if (interval <= 11 || scaleNotes.length < 12) {
        const note = (rootNote + interval) % 12;
        if (!scaleNotes.includes(note)) {
          scaleNotes.push(note);
        }
        if (scaleNotes.length >= 12) break;
      }
    }
    if (scaleNotes.length >= 12) break;
  }

  return scaleNotes.slice(0, 12);
}
