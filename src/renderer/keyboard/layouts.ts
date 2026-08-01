import type { KeyboardLayout, KeyMapping, KeyboardMapping } from '@shared/types';
import qwertyMapping from '../../../mappings/qwerty.json';
import dvorakMapping from '../../../mappings/dvorak.json';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const mappings: Record<KeyboardLayout, KeyboardMapping> = {
  qwerty: qwertyMapping as KeyboardMapping,
  dvorak: dvorakMapping as KeyboardMapping,
};

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

export function getLayout(type: KeyboardLayout): KeyMapping[] {
  const mapping = mappings[type];
  const result: KeyMapping[] = [];

  mapping.rightHand.forEach(entry => {
    result.push({ key: entry.key, semitone: entry.semitone, hand: 'right' });
  });

  mapping.leftHand.forEach(entry => {
    result.push({ key: entry.key, semitone: entry.semitone, hand: 'left' });
  });

  return result;
}

export function getKeyDisplayKey(mapping: KeyMapping, layout: KeyboardLayout): string {
  return mapping.key.toUpperCase();
}

export function semitoneToNote(semitone: number, keyNoteIndex: number): string {
  const noteIndex = (keyNoteIndex + semitone) % 12;
  return NOTES[noteIndex];
}
