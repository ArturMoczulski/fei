import type { KeyMapping } from '@shared/types';
import { audioEngine } from './AudioEngine';

export interface ActionContext {
  pressedKeys: Set<string>;
  activeFrequencies: Map<string, number>;
  selectedKey: number;
  leftOctave: number;
  rightOctave: number;
  onLeftOctaveChange?: (oct: number) => void;
  onRightOctaveChange?: (oct: number) => void;
  onPanic?: () => void;
  onToggleMetronome?: () => void;
  onOpenSettings?: () => void;
}

export function executeAction(action: string, mapping: KeyMapping, context: ActionContext): void {
  if (action.startsWith('left_hand_sound_') || action.startsWith('right_hand_sound_')) {
    executeSoundAction(mapping, context);
  } else if (action === 'left_hand_increase_octave') {
    if (context.onLeftOctaveChange) {
      context.onLeftOctaveChange(context.leftOctave + 1);
    }
  } else if (action === 'left_hand_decrease_octave') {
    if (context.onLeftOctaveChange) {
      context.onLeftOctaveChange(context.leftOctave - 1);
    }
  } else if (action === 'right_hand_increase_octave') {
    if (context.onRightOctaveChange) {
      context.onRightOctaveChange(context.rightOctave + 1);
    }
  } else if (action === 'right_hand_decrease_octave') {
    if (context.onRightOctaveChange) {
      context.onRightOctaveChange(context.rightOctave - 1);
    }
  } else if (action === 'panic_stop') {
    if (context.onPanic) {
      context.onPanic();
    }
  } else if (action === 'toggle_metronome') {
    if (context.onToggleMetronome) {
      context.onToggleMetronome();
    }
  } else if (action === 'open_settings') {
    if (context.onOpenSettings) {
      context.onOpenSettings();
    }
  }
}

function executeSoundAction(mapping: KeyMapping, context: ActionContext): void {
  const octave = mapping.hand === 'left' ? context.leftOctave : context.rightOctave;

  const note = semitoneToNote(context.selectedKey, mapping.semitone);
  const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
  const totalSemitones = context.selectedKey + mapping.semitone;
  const octaveOffset = Math.floor(totalSemitones / 12);
  const midiNumber = (octave + octaveOffset + 1) * 12 + noteIndex;
  const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

  context.activeFrequencies.set(mapping.action, frequency);
  audioEngine.playNote(frequency, mapping.hand);
}

export function stopAction(action: string, mapping: KeyMapping, context: ActionContext): void {
  if (!action.startsWith('left_hand_sound_') && !action.startsWith('right_hand_sound_')) {
    return;
  }

  const frequency = context.activeFrequencies.get(action);
  if (frequency !== undefined) {
    audioEngine.stopNote(frequency, mapping.hand);
    context.activeFrequencies.delete(action);
  }
}

function semitoneToNote(keyNoteIndex: number, semitone: number): string {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = (keyNoteIndex + semitone) % 12;
  return NOTES[noteIndex];
}

export function isSoundAction(action: string): boolean {
  return action.startsWith('left_hand_sound_') || action.startsWith('right_hand_sound_');
}
