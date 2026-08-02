import type { ScaleArrangement } from '../../shared/types';
import chromatic from '../../mappings/scale-arrangements/chromatic.json';
import major from '../../mappings/scale-arrangements/major.json';
import natural_minor from '../../mappings/scale-arrangements/natural_minor.json';
import harmonic_minor from '../../mappings/scale-arrangements/harmonic_minor.json';
import pentatonic_major from '../../mappings/scale-arrangements/pentatonic_major.json';
import pentatonic_minor from '../../mappings/scale-arrangements/pentatonic_minor.json';

export const SCALE_ARRANGEMENTS: Record<ScaleArrangement, typeof chromatic> = {
  chromatic,
  major,
  natural_minor,
  harmonic_minor,
  pentatonic_major,
  pentatonic_minor,
};

export function getScaleArrangement(scaleArrangement: ScaleArrangement) {
  return SCALE_ARRANGEMENTS[scaleArrangement];
}

export function getSemitoneForAction(
  scaleArrangement: ScaleArrangement,
  hand: 'left' | 'right',
  action: string
): number {
  const arrangement = SCALE_ARRANGEMENTS[scaleArrangement];
  const handData = hand === 'left' ? arrangement.leftHand : arrangement.rightHand;
  const value = (handData as Record<string, number>)[action];
  return value !== undefined ? value : 0;
}

export function semitonesToInterval(semitones: number): string {
  if (semitones === 0) return '';
  if (semitones === 1) return 'H';
  if (semitones === 2) return 'W';
  if (semitones === 3) return 'W+H';
  if (semitones === 4) return 'WW';
  if (semitones === 5) return 'WW+H';
  if (semitones === 6) return 'WWW';
  if (semitones === 7) return 'WWW+H';
  if (semitones === 8) return 'WWWW';
  if (semitones === 9) return 'WWWW+H';
  if (semitones === 10) return 'WWWWW';
  if (semitones === 11) return 'WWWWW+H';
  return `${semitones}`;
}
