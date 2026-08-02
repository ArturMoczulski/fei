import { describe, it, expect } from 'vitest';
import {
  isInScale,
  getSemitoneLabel,
  semitonesToInterval,
  getSemitoneForAction,
  getChromaticSemitoneForAction,
  SCALE_NOTES,
} from '../../renderer/audio/scales';

describe('scales', () => {
  describe('isInScale', () => {
    it('should return true for notes in major scale', () => {
      expect(isInScale(0, 'major')).toBe(true);
      expect(isInScale(2, 'major')).toBe(true);
      expect(isInScale(4, 'major')).toBe(true);
      expect(isInScale(5, 'major')).toBe(true);
      expect(isInScale(7, 'major')).toBe(true);
      expect(isInScale(9, 'major')).toBe(true);
      expect(isInScale(11, 'major')).toBe(true);
    });

    it('should return false for notes not in major scale', () => {
      expect(isInScale(1, 'major')).toBe(false);
      expect(isInScale(3, 'major')).toBe(false);
      expect(isInScale(6, 'major')).toBe(false);
      expect(isInScale(8, 'major')).toBe(false);
      expect(isInScale(10, 'major')).toBe(false);
    });

    it('should return true for notes in natural minor scale', () => {
      expect(isInScale(0, 'natural_minor')).toBe(true);
      expect(isInScale(2, 'natural_minor')).toBe(true);
      expect(isInScale(3, 'natural_minor')).toBe(true);
      expect(isInScale(5, 'natural_minor')).toBe(true);
      expect(isInScale(7, 'natural_minor')).toBe(true);
      expect(isInScale(8, 'natural_minor')).toBe(true);
      expect(isInScale(10, 'natural_minor')).toBe(true);
    });

    it('should return false for notes not in natural minor scale', () => {
      expect(isInScale(1, 'natural_minor')).toBe(false);
      expect(isInScale(4, 'natural_minor')).toBe(false);
      expect(isInScale(6, 'natural_minor')).toBe(false);
      expect(isInScale(9, 'natural_minor')).toBe(false);
      expect(isInScale(11, 'natural_minor')).toBe(false);
    });

    it('should return true for notes in pentatonic major scale', () => {
      expect(isInScale(0, 'pentatonic_major')).toBe(true);
      expect(isInScale(2, 'pentatonic_major')).toBe(true);
      expect(isInScale(4, 'pentatonic_major')).toBe(true);
      expect(isInScale(7, 'pentatonic_major')).toBe(true);
      expect(isInScale(9, 'pentatonic_major')).toBe(true);
    });

    it('should return false for notes not in pentatonic major scale', () => {
      expect(isInScale(1, 'pentatonic_major')).toBe(false);
      expect(isInScale(3, 'pentatonic_major')).toBe(false);
      expect(isInScale(5, 'pentatonic_major')).toBe(false);
      expect(isInScale(6, 'pentatonic_major')).toBe(false);
      expect(isInScale(8, 'pentatonic_major')).toBe(false);
      expect(isInScale(10, 'pentatonic_major')).toBe(false);
      expect(isInScale(11, 'pentatonic_major')).toBe(false);
    });

    it('should return true for notes in pentatonic minor scale', () => {
      expect(isInScale(0, 'pentatonic_minor')).toBe(true);
      expect(isInScale(3, 'pentatonic_minor')).toBe(true);
      expect(isInScale(5, 'pentatonic_minor')).toBe(true);
      expect(isInScale(7, 'pentatonic_minor')).toBe(true);
      expect(isInScale(10, 'pentatonic_minor')).toBe(true);
    });
  });

  describe('getSemitoneLabel', () => {
    it('should return "Key" for root note in major scale', () => {
      expect(getSemitoneLabel(0, 'major')).toBe('Key');
    });

    it('should return correct labels for major scale notes', () => {
      expect(getSemitoneLabel(0, 'major')).toBe('Key');
      expect(getSemitoneLabel(2, 'major')).toBe('Pass');
      expect(getSemitoneLabel(4, 'major')).toBe('Bright');
      expect(getSemitoneLabel(5, 'major')).toBe('Conson');
      expect(getSemitoneLabel(7, 'major')).toBe('Conson');
      expect(getSemitoneLabel(9, 'major')).toBe('Bright');
      expect(getSemitoneLabel(11, 'major')).toBe('Warm');
    });

    it('should return empty string for notes not in major scale', () => {
      expect(getSemitoneLabel(1, 'major')).toBe('');
      expect(getSemitoneLabel(3, 'major')).toBe('');
      expect(getSemitoneLabel(6, 'major')).toBe('');
      expect(getSemitoneLabel(8, 'major')).toBe('');
      expect(getSemitoneLabel(10, 'major')).toBe('');
    });

    it('should return correct labels for natural minor scale', () => {
      expect(getSemitoneLabel(0, 'natural_minor')).toBe('Key');
      expect(getSemitoneLabel(3, 'natural_minor')).toBe('Warm');
      expect(getSemitoneLabel(7, 'natural_minor')).toBe('Tense');
      expect(getSemitoneLabel(8, 'natural_minor')).toBe('Bright');
      expect(getSemitoneLabel(10, 'natural_minor')).toBe('Resolve');
    });

    it('should return correct labels for pentatonic major scale', () => {
      expect(getSemitoneLabel(0, 'pentatonic_major')).toBe('Key');
      expect(getSemitoneLabel(2, 'pentatonic_major')).toBe('Pass');
      expect(getSemitoneLabel(4, 'pentatonic_major')).toBe('Warm');
      expect(getSemitoneLabel(7, 'pentatonic_major')).toBe('Conson');
      expect(getSemitoneLabel(9, 'pentatonic_major')).toBe('Bright');
    });

    it('should return empty string for notes not in pentatonic scales', () => {
      expect(getSemitoneLabel(1, 'pentatonic_major')).toBe('');
      expect(getSemitoneLabel(5, 'pentatonic_major')).toBe('');
    });
  });

  describe('semitonesToInterval', () => {
    it('should return empty string for 0 semitones', () => {
      expect(semitonesToInterval(0)).toBe('');
    });

    it('should return H for 1 semitone', () => {
      expect(semitonesToInterval(1)).toBe('H');
    });

    it('should return W for 2 semitones', () => {
      expect(semitonesToInterval(2)).toBe('W');
    });

    it('should return W+H for 3 semitones', () => {
      expect(semitonesToInterval(3)).toBe('W+H');
    });

    it('should return WW for 4 semitones', () => {
      expect(semitonesToInterval(4)).toBe('WW');
    });

    it('should return WW+H for 5 semitones', () => {
      expect(semitonesToInterval(5)).toBe('WW+H');
    });

    it('should return WWW for 6 semitones', () => {
      expect(semitonesToInterval(6)).toBe('WWW');
    });

    it('should return WWW+H for 7 semitones', () => {
      expect(semitonesToInterval(7)).toBe('WWW+H');
    });

    it('should return WWWW for 8 semitones', () => {
      expect(semitonesToInterval(8)).toBe('WWWW');
    });

    it('should return WWWW+H for 9 semitones', () => {
      expect(semitonesToInterval(9)).toBe('WWWW+H');
    });

    it('should return WWWWW for 10 semitones', () => {
      expect(semitonesToInterval(10)).toBe('WWWWW');
    });

    it('should return WWWWW+H for 11 semitones', () => {
      expect(semitonesToInterval(11)).toBe('WWWWW+H');
    });
  });

  describe('getChromaticSemitoneForAction', () => {
    it('should return correct semitones for left hand actions', () => {
      expect(getChromaticSemitoneForAction('left', 'left_hand_sound_upper_pinky')).toBe(0);
      expect(getChromaticSemitoneForAction('left', 'left_hand_sound_upper_ring')).toBe(1);
      expect(getChromaticSemitoneForAction('left', 'left_hand_sound_upper_middle')).toBe(2);
      expect(getChromaticSemitoneForAction('left', 'left_hand_sound_upper_index')).toBe(3);
      expect(getChromaticSemitoneForAction('left', 'left_hand_sound_home_index')).toBe(7);
      expect(getChromaticSemitoneForAction('left', 'left_hand_sound_lower_index')).toBe(11);
    });

    it('should return correct semitones for right hand actions', () => {
      expect(getChromaticSemitoneForAction('right', 'right_hand_sound_upper_pinky')).toBe(0);
      expect(getChromaticSemitoneForAction('right', 'right_hand_sound_upper_ring')).toBe(1);
      expect(getChromaticSemitoneForAction('right', 'right_hand_sound_upper_middle')).toBe(2);
      expect(getChromaticSemitoneForAction('right', 'right_hand_sound_upper_index')).toBe(3);
      expect(getChromaticSemitoneForAction('right', 'right_hand_sound_home_index')).toBe(7);
      expect(getChromaticSemitoneForAction('right', 'right_hand_sound_lower_index')).toBe(11);
    });

    it('should return 0 for unknown action', () => {
      expect(getChromaticSemitoneForAction('left', 'unknown_action')).toBe(0);
      expect(getChromaticSemitoneForAction('right', 'unknown_action')).toBe(0);
    });
  });

  describe('getSemitoneForAction', () => {
    it('should return rearranged semitones when using scale arrangement', () => {
      const semitone = getSemitoneForAction('major', 'left', 'left_hand_sound_home_index');
      expect(semitone).toBe(0);
    });

    it('should return different semitone for same action in different scales', () => {
      const majorSemitone = getSemitoneForAction('major', 'left', 'left_hand_sound_home_pinky');
      const minorSemitone = getSemitoneForAction('natural_minor', 'left', 'left_hand_sound_home_pinky');
      expect(majorSemitone).not.toBe(minorSemitone);
    });
  });

  describe('SCALE_NOTES', () => {
    it('should have correct notes for major scale', () => {
      expect(SCALE_NOTES.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have correct notes for natural minor scale', () => {
      expect(SCALE_NOTES.natural_minor).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it('should have correct notes for harmonic minor scale', () => {
      expect(SCALE_NOTES.harmonic_minor).toEqual([0, 2, 3, 5, 7, 8, 11]);
    });

    it('should have correct notes for pentatonic major scale', () => {
      expect(SCALE_NOTES.pentatonic_major).toEqual([0, 2, 4, 7, 9]);
    });

    it('should have correct notes for pentatonic minor scale', () => {
      expect(SCALE_NOTES.pentatonic_minor).toEqual([0, 3, 5, 7, 10]);
    });
  });
});
