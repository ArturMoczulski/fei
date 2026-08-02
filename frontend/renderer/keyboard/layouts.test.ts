import { describe, it, expect } from 'vitest';
import {
  getLayout,
  getNoteWithOctave,
  isBlackKey,
  semitoneToNote,
  semitoneToMidiNote,
  getKeyDisplayKey,
} from '../../renderer/keyboard/layouts';
import type { KeyboardLayout, KeyMapping } from '@shared/types';

describe('layouts', () => {
  describe('getLayout', () => {
    it('should return a non-empty array for dvorak layout', () => {
      const layout = getLayout('dvorak');
      expect(layout.length).toBeGreaterThan(0);
    });

    it('should return a non-empty array for qwerty layout', () => {
      const layout = getLayout('qwerty');
      expect(layout.length).toBeGreaterThan(0);
    });

    it('should include sound actions for both hands', () => {
      const layout = getLayout('dvorak');
      const leftSounds = layout.filter(m => m.hand === 'left' && m.action.startsWith('left_hand_sound'));
      const rightSounds = layout.filter(m => m.hand === 'right' && m.action.startsWith('right_hand_sound'));
      expect(leftSounds.length).toBe(12);
      expect(rightSounds.length).toBe(12);
    });

    it('should include octave controls for both hands', () => {
      const layout = getLayout('dvorak');
      const octaveActions = layout.filter(m => m.action.includes('octave'));
      expect(octaveActions.length).toBe(4);
    });

    it('should include global settings actions', () => {
      const layout = getLayout('dvorak');
      const settingsActions = layout.filter(m =>
        m.action === 'open_settings' || m.action === 'toggle_actions_list' || m.action === 'panic_stop' || m.action === 'toggle_metronome' || m.action === 'toggle_autoplay'
      );
      expect(settingsActions.length).toBe(5);
    });

    it('should include toggle_autoplay action in both layouts', () => {
      const dvorakLayout = getLayout('dvorak');
      const qwertyLayout = getLayout('qwerty');

      const dvorakAutoplay = dvorakLayout.find(m => m.action === 'toggle_autoplay');
      const qwertyAutoplay = qwertyLayout.find(m => m.action === 'toggle_autoplay');

      expect(dvorakAutoplay).toBeDefined();
      expect(qwertyAutoplay).toBeDefined();
    });

    it('should map space key to toggle_autoplay in both layouts', () => {
      const dvorakLayout = getLayout('dvorak');
      const qwertyLayout = getLayout('qwerty');

      const dvorakSpace = dvorakLayout.find(m => m.key === ' ');
      const qwertySpace = qwertyLayout.find(m => m.key === ' ');

      expect(dvorakSpace?.action).toBe('toggle_autoplay');
      expect(qwertySpace?.action).toBe('toggle_autoplay');
    });

    it('should return KeyMapping objects with required properties', () => {
      const layout = getLayout('dvorak');
      layout.forEach((mapping: KeyMapping) => {
        expect(mapping).toHaveProperty('key');
        expect(mapping).toHaveProperty('semitone');
        expect(mapping).toHaveProperty('hand');
        expect(mapping).toHaveProperty('action');
      });
    });

    it('should have correct semitone values for right hand', () => {
      const layout = getLayout('dvorak');
      const rightHandSounds = layout.filter(m => m.hand === 'right' && m.action.startsWith('right_hand_sound'));

      const upperRow = rightHandSounds.filter(m => m.row === 'upper');
      expect(upperRow.length).toBe(4);

      const sortedByCol = [...upperRow].sort((a, b) => {
        const aKey = a.action.split('_').pop();
        const bKey = b.action.split('_').pop();
        const order = ['index', 'middle', 'ring', 'pinky'];
        return order.indexOf(aKey) - order.indexOf(bKey);
      });

      expect(sortedByCol[0].semitone).toBe(3);
      expect(sortedByCol[3].semitone).toBe(0);
    });

    it('should have semitone values 0-11 for sounds', () => {
      const layout = getLayout('dvorak');
      const sounds = layout.filter(m => m.action.includes('_sound_'));
      sounds.forEach((m: KeyMapping) => {
        expect(m.semitone).toBeGreaterThanOrEqual(0);
        expect(m.semitone).toBeLessThanOrEqual(11);
      });
    });
  });

  describe('getNoteWithOctave', () => {
    it('should return correct frequency for A4', () => {
      const result = getNoteWithOctave('A', 4);
      expect(result.frequency).toBeCloseTo(440, 1);
    });

    it('should return correct frequency for C4', () => {
      const result = getNoteWithOctave('C', 4);
      expect(result.frequency).toBeCloseTo(261.63, 1);
    });

    it('should return the input note', () => {
      const result = getNoteWithOctave('F#', 3);
      expect(result.note).toBe('F#');
      expect(result.octave).toBe(3);
    });

    it('should handle invalid note gracefully', () => {
      const result = getNoteWithOctave('X', 4);
      expect(result.note).toBe('X');
      expect(result.frequency).toBe(440);
    });
  });

  describe('isBlackKey', () => {
    it('should return true for sharp notes', () => {
      expect(isBlackKey('C#')).toBe(true);
      expect(isBlackKey('F#')).toBe(true);
      expect(isBlackKey('A#')).toBe(true);
    });

    it('should return false for natural notes', () => {
      expect(isBlackKey('C')).toBe(false);
      expect(isBlackKey('F')).toBe(false);
      expect(isBlackKey('A')).toBe(false);
    });
  });

  describe('semitoneToNote', () => {
    it('should return correct notes for C key', () => {
      expect(semitoneToNote(0, 0)).toBe('C');
      expect(semitoneToNote(1, 0)).toBe('C#');
      expect(semitoneToNote(2, 0)).toBe('D');
      expect(semitoneToNote(11, 0)).toBe('B');
    });

    it('should return correct notes for G key (key index 7)', () => {
      expect(semitoneToNote(0, 7)).toBe('G');
      expect(semitoneToNote(1, 7)).toBe('G#');
      expect(semitoneToNote(2, 7)).toBe('A');
    });

    it('should wrap around after B', () => {
      expect(semitoneToNote(12, 0)).toBe('C');
      expect(semitoneToNote(13, 0)).toBe('C#');
    });

    it('should handle D key (key index 2)', () => {
      expect(semitoneToNote(0, 2)).toBe('D');
      expect(semitoneToNote(2, 2)).toBe('E');
      expect(semitoneToNote(5, 2)).toBe('G');
    });
  });

  describe('semitoneToMidiNote', () => {
    it('should return correct MIDI number for C4', () => {
      expect(semitoneToMidiNote(0, 4, 0)).toBe(60);
    });

    it('should return correct MIDI number for A4', () => {
      expect(semitoneToMidiNote(9, 4, 0)).toBe(69);
    });

    it('should account for key transposition', () => {
      expect(semitoneToMidiNote(0, 4, 2)).toBe(62);
    });

    it('should handle octave wrap', () => {
      expect(semitoneToMidiNote(0, 4, 10)).toBe(70);
    });
  });

  describe('getKeyDisplayKey', () => {
    it('should return uppercase key', () => {
      const layout = getLayout('dvorak');
      const mapping = layout.find((m: KeyMapping) => m.action === 'right_hand_sound_upper_index');
      if (mapping) {
        expect(getKeyDisplayKey(mapping, 'dvorak')).toBe('G');
      }
    });
  });

  describe('layout differences', () => {
    it('should have different keys for dvorak vs qwerty', () => {
      const dvorakLayout = getLayout('dvorak');
      const qwertyLayout = getLayout('qwerty');

      const dvorakKeys = new Set(dvorakLayout.map(m => m.key));
      const qwertyKeys = new Set(qwertyLayout.map(m => m.key));

      let commonKeys = 0;
      dvorakKeys.forEach(key => {
        if (qwertyKeys.has(key)) commonKeys++;
      });

      expect(commonKeys).toBeLessThan(dvorakLayout.length);
    });
  });

  describe('getLayout with rearrange flags', () => {
    it('should return 12 sound mappings per hand', () => {
      const layout = getLayout('dvorak', 'major', 'major', true, true);

      const leftSounds = layout.filter(m => m.hand === 'left' && m.action.startsWith('left_hand_sound'));
      const rightSounds = layout.filter(m => m.hand === 'right' && m.action.startsWith('right_hand_sound'));

      expect(leftSounds.length).toBe(12);
      expect(rightSounds.length).toBe(12);
    });

    it('should have semitones in valid range 0-11', () => {
      const layout = getLayout('dvorak', 'major', 'major', true, true);

      const leftSounds = layout.filter(m => m.hand === 'left' && m.action.startsWith('left_hand_sound'));
      leftSounds.forEach((m: KeyMapping) => {
        expect(m.semitone).toBeGreaterThanOrEqual(0);
        expect(m.semitone).toBeLessThanOrEqual(11);
      });
    });

    it('should include octave controls', () => {
      const layout = getLayout('dvorak', 'major', 'major', true, true);

      const octaveActions = layout.filter(m => m.action.includes('octave'));
      expect(octaveActions.length).toBe(4);
    });
  });
});
