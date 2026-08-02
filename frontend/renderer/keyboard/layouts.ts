import type { KeyboardLayout, KeyMapping, ScaleArrangement } from '@shared/types';
import qwertyDevice from '../../mappings/qwerty-device.json';
import dvorakDevice from '../../mappings/dvorak-device.json';
import { getSemitoneForAction, getChromaticSemitoneForAction } from '../audio/scales';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getNoteWithOctave(baseNote: string, octave: number): { note: string; octave: number; frequency: number } {
  const noteIndex = NOTES.indexOf(baseNote);
  if (noteIndex === -1) {
    return { note: baseNote, octave, frequency: 440 };
  }

  const midiNumber = (octave + 1) * 12 + noteIndex;
  const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

  return { note: baseNote, octave, frequency };
}

export function isBlackKey(note: string): boolean {
  return note.includes('#');
}

export function getLayout(
  type: KeyboardLayout,
  leftScaleArrangement: ScaleArrangement = 'major',
  rightScaleArrangement: ScaleArrangement = 'major',
  rearrangeLeft: boolean = false,
  rearrangeRight: boolean = false
): KeyMapping[] {
  const device = type === 'dvorak' ? dvorakDevice : qwertyDevice;
  const result: KeyMapping[] = [];

  const rows = ['upper', 'home', 'lower'] as const;

  for (const hand of ['leftHand', 'rightHand'] as const) {
    const handData = device[hand];
    const handName = hand === 'leftHand' ? 'left' : 'right';
    const shouldRearrange = hand === 'leftHand' ? rearrangeLeft : rearrangeRight;

    for (const row of rows) {
      const rowKeys = handData.soundButtons[row];
      for (const keyData of rowKeys) {
        let semitone: number;
        if (shouldRearrange) {
          const scaleArrangement = hand === 'leftHand' ? leftScaleArrangement : rightScaleArrangement;
          semitone = getSemitoneForAction(scaleArrangement, handName, keyData.action);
        } else {
          semitone = getChromaticSemitoneForAction(handName, keyData.action);
        }
        result.push({
          key: keyData.key,
          semitone,
          hand: handName,
          row,
          action: keyData.action,
        });
      }
    }

    const octaveButtons = handData.octaveButtons;
    for (const btn of ['increase', 'decrease'] as const) {
      const keyData = octaveButtons[btn];
      if (keyData) {
        result.push({
          key: keyData.key,
          semitone: 0,
          hand: handName,
          row: btn as 'upper' | 'home' | 'lower',
          action: keyData.action,
        });
      }
    }
  }

  const globalActions = device.global;
  for (const section of ['settings', 'playback'] as const) {
    const actions = globalActions[section];
    for (const keyData of actions) {
      result.push({
        key: keyData.key,
        semitone: 0,
        hand: 'left' as const,
        row: section as 'upper' | 'home' | 'lower',
        action: keyData.action,
      });
    }
  }

  return result;
}

export function getKeyDisplayKey(mapping: KeyMapping, layout: KeyboardLayout): string {
  return mapping.key.toUpperCase();
}

export function semitoneToNote(semitone: number, keyNoteIndex: number): string {
  const noteIndex = (keyNoteIndex + semitone) % 12;
  return NOTES[noteIndex];
}

export function semitoneToMidiNote(semitone: number, octave: number, keyNoteIndex: number): number {
  const noteIndex = (keyNoteIndex + semitone) % 12;
  const midiNumber = (octave + 1) * 12 + noteIndex;
  return midiNumber;
}
