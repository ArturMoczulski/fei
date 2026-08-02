import type { ScaleArrangement } from '../../shared/types';
import major from '../../mappings/scale-arrangements/major.json';
import natural_minor from '../../mappings/scale-arrangements/natural_minor.json';
import harmonic_minor from '../../mappings/scale-arrangements/harmonic_minor.json';
import pentatonic_major from '../../mappings/scale-arrangements/pentatonic_major.json';
import pentatonic_minor from '../../mappings/scale-arrangements/pentatonic_minor.json';

export const SCALE_ARRANGEMENTS: Record<ScaleArrangement, typeof major> = {
  major,
  natural_minor,
  harmonic_minor,
  pentatonic_major,
  pentatonic_minor,
};

export const SCALE_NOTES: Record<ScaleArrangement, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
};

export function getChromaticSemitoneForAction(
  hand: 'left' | 'right',
  action: string
): number {
  const chromaticMapping: Record<string, Record<string, number>> = {
    left: {
      left_hand_sound_upper_pinky: 0,
      left_hand_sound_upper_ring: 1,
      left_hand_sound_upper_middle: 2,
      left_hand_sound_upper_index: 3,
      left_hand_sound_home_pinky: 4,
      left_hand_sound_home_ring: 5,
      left_hand_sound_home_middle: 6,
      left_hand_sound_home_index: 7,
      left_hand_sound_lower_pinky: 8,
      left_hand_sound_lower_ring: 9,
      left_hand_sound_lower_middle: 10,
      left_hand_sound_lower_index: 11,
    },
    right: {
      right_hand_sound_upper_pinky: 0,
      right_hand_sound_upper_ring: 1,
      right_hand_sound_upper_middle: 2,
      right_hand_sound_upper_index: 3,
      right_hand_sound_home_pinky: 4,
      right_hand_sound_home_ring: 5,
      right_hand_sound_home_middle: 6,
      right_hand_sound_home_index: 7,
      right_hand_sound_lower_pinky: 8,
      right_hand_sound_lower_ring: 9,
      right_hand_sound_lower_middle: 10,
      right_hand_sound_lower_index: 11,
    },
  };
  const value = chromaticMapping[hand]?.[action];
  return value !== undefined ? value : 0;
}

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

export function isInScale(semitone: number, scaleArrangement: ScaleArrangement): boolean {
  return SCALE_NOTES[scaleArrangement].includes(semitone);
}
