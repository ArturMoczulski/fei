import { describe, it, expect, vi } from 'vitest';
import { calculateFrequency, isSoundAction } from '../../renderer/audio/actions';

describe('actions', () => {
  describe('calculateFrequency', () => {
    it('should return 440Hz for A4 (semitone 9, octave 4, key C)', () => {
      const freq = calculateFrequency(9, 4, 0);
      expect(freq).toBeCloseTo(440, 2);
    });

    it('should return ~261.63Hz for C4', () => {
      const freq = calculateFrequency(0, 4, 0);
      expect(freq).toBeCloseTo(261.63, 1);
    });

    it('should return ~523.25Hz for C5', () => {
      const freq = calculateFrequency(0, 5, 0);
      expect(freq).toBeCloseTo(523.25, 1);
    });

    it('should return ~130.81Hz for C3', () => {
      const freq = calculateFrequency(0, 3, 0);
      expect(freq).toBeCloseTo(130.81, 1);
    });

    it('should account for key transposition', () => {
      const freqG4 = calculateFrequency(7, 4, 0);
      const freqC4 = calculateFrequency(0, 4, 7);
      expect(freqG4).toBeCloseTo(freqC4, 1);
    });

    it('should handle F# key (key index 6) semitone 0', () => {
      const freq = calculateFrequency(0, 4, 6);
      expect(freq).toBeCloseTo(369.99, 1);
    });

    it('should be within audible range for octaves 1-8', () => {
      for (let octave = 1; octave <= 8; octave++) {
        for (let semitone = 0; semitone <= 11; semitone++) {
          const freq = calculateFrequency(semitone, octave, 0);
          expect(freq).toBeGreaterThan(20);
          expect(freq).toBeLessThan(20000);
        }
      }
    });

    it('should return higher frequency for higher octave', () => {
      const c3 = calculateFrequency(0, 3, 0);
      const c4 = calculateFrequency(0, 4, 0);
      const c5 = calculateFrequency(0, 5, 0);
      expect(c4).toBeGreaterThan(c3);
      expect(c5).toBeGreaterThan(c4);
    });

    it('should return higher frequency for higher semitone', () => {
      const c0 = calculateFrequency(0, 4, 0);
      const d0 = calculateFrequency(2, 4, 0);
      const e0 = calculateFrequency(4, 4, 0);
      expect(d0).toBeGreaterThan(c0);
      expect(e0).toBeGreaterThan(d0);
    });
  });

  describe('isSoundAction', () => {
    it('should return true for left hand sound actions', () => {
      expect(isSoundAction('left_hand_sound_upper_pinky')).toBe(true);
      expect(isSoundAction('left_hand_sound_home_index')).toBe(true);
      expect(isSoundAction('left_hand_sound_lower_middle')).toBe(true);
    });

    it('should return true for right hand sound actions', () => {
      expect(isSoundAction('right_hand_sound_upper_index')).toBe(true);
      expect(isSoundAction('right_hand_sound_home_pinky')).toBe(true);
      expect(isSoundAction('right_hand_sound_lower_ring')).toBe(true);
    });

    it('should return false for octave actions', () => {
      expect(isSoundAction('left_hand_increase_octave')).toBe(false);
      expect(isSoundAction('right_hand_decrease_octave')).toBe(false);
    });

    it('should return false for transport actions', () => {
      expect(isSoundAction('panic_stop')).toBe(false);
      expect(isSoundAction('toggle_metronome')).toBe(false);
      expect(isSoundAction('toggle_autoplay')).toBe(false);
    });

    it('should return false for settings actions', () => {
      expect(isSoundAction('open_settings')).toBe(false);
      expect(isSoundAction('toggle_actions_list')).toBe(false);
    });

    it('should return false for non-sound strings', () => {
      expect(isSoundAction('something_else')).toBe(false);
      expect(isSoundAction('')).toBe(false);
      expect(isSoundAction('left_hand')).toBe(false);
    });
  });
});
