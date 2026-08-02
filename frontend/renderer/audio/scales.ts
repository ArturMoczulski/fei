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
  return value !== undefined && value >= 0 ? value : 0;
}

export function isSemitoneMapped(
  scaleArrangement: ScaleArrangement,
  hand: 'left' | 'right',
  action: string
): boolean {
  const arrangement = SCALE_ARRANGEMENTS[scaleArrangement];
  const handData = hand === 'left' ? arrangement.leftHand : arrangement.rightHand;
  const value = (handData as Record<string, number>)[action];
  return value !== undefined && value >= 0;
}
