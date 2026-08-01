import { describe, it, expect } from 'vitest';
import { getKeyBindingForAction, getActionForKey } from '../../renderer/keyboard/keyBindings';

describe('keyBindings', () => {
  describe('getKeyBindingForAction', () => {
    it('should return the correct key for right_hand_sound_upper_index on dvorak', () => {
      const key = getKeyBindingForAction('right_hand_sound_upper_index', 'dvorak');
      expect(key).toBe('G');
    });

    it('should return the correct key for right_hand_sound_upper_index on qwerty', () => {
      const key = getKeyBindingForAction('right_hand_sound_upper_index', 'qwerty');
      expect(key).toBe('U');
    });

    it('should return the correct key for left_hand_sound_lower_pinky on dvorak', () => {
      const key = getKeyBindingForAction('left_hand_sound_lower_pinky', 'dvorak');
      expect(key).toBe(';');
    });

    it('should return the correct key for left_hand_sound_lower_pinky on qwerty', () => {
      const key = getKeyBindingForAction('left_hand_sound_lower_pinky', 'qwerty');
      expect(key).toBe('Z');
    });

    it('should return null for non-existent action', () => {
      const key = getKeyBindingForAction('non_existent_action', 'dvorak');
      expect(key).toBeNull();
    });

    it('should return correct keys for octave actions on dvorak', () => {
      expect(getKeyBindingForAction('right_hand_increase_octave', 'dvorak')).toBe('7');
      expect(getKeyBindingForAction('right_hand_decrease_octave', 'dvorak')).toBe('8');
      expect(getKeyBindingForAction('left_hand_increase_octave', 'dvorak')).toBe('4');
      expect(getKeyBindingForAction('left_hand_decrease_octave', 'dvorak')).toBe('3');
    });

    it('should return correct keys for settings actions', () => {
      expect(getKeyBindingForAction('open_settings', 'dvorak')).toBe('ESCAPE');
      expect(getKeyBindingForAction('toggle_actions_list', 'dvorak')).toBe(']');
    });

    it('should return correct keys for transport actions on dvorak', () => {
      expect(getKeyBindingForAction('panic_stop', 'dvorak')).toBe('\\');
      expect(getKeyBindingForAction('toggle_metronome', 'dvorak')).toBe('/');
    });

    it('should return correct keys for transport actions on qwerty', () => {
      expect(getKeyBindingForAction('panic_stop', 'qwerty')).toBe('\\');
      expect(getKeyBindingForAction('toggle_metronome', 'qwerty')).toBe("'");
    });
  });

  describe('getActionForKey', () => {
    it('should return the correct action for G key on dvorak', () => {
      const action = getActionForKey('g', 'dvorak');
      expect(action).toBe('right_hand_sound_upper_index');
    });

    it('should return the correct action for U key on qwerty', () => {
      const action = getActionForKey('u', 'qwerty');
      expect(action).toBe('right_hand_sound_upper_index');
    });

    it('should return the correct action for ; key on dvorak (left hand)', () => {
      const action = getActionForKey(';', 'dvorak');
      expect(action).toBe('left_hand_sound_lower_pinky');
    });

    it('should return the correct action for 7 on dvorak (right octave increase)', () => {
      const action = getActionForKey('7', 'dvorak');
      expect(action).toBe('right_hand_increase_octave');
    });

    it('should return the correct action for Escape on dvorak', () => {
      const action = getActionForKey('Escape', 'dvorak');
      expect(action).toBe('open_settings');
    });

    it('should return null for non-existent key', () => {
      const action = getActionForKey('1', 'dvorak');
      expect(action).toBeNull();
    });

    it('should be case insensitive for letter keys', () => {
      expect(getActionForKey('G', 'dvorak')).toBe('right_hand_sound_upper_index');
      expect(getActionForKey('g', 'dvorak')).toBe('right_hand_sound_upper_index');
    });
  });

  describe('round trip', () => {
    it('should round trip correctly for all dvorak sound actions', () => {
      const actions = [
        'right_hand_sound_upper_index',
        'right_hand_sound_upper_middle',
        'right_hand_sound_upper_ring',
        'right_hand_sound_upper_pinky',
        'right_hand_sound_home_index',
        'right_hand_sound_home_middle',
        'right_hand_sound_home_ring',
        'right_hand_sound_home_pinky',
        'right_hand_sound_lower_index',
        'right_hand_sound_lower_middle',
        'right_hand_sound_lower_ring',
        'right_hand_sound_lower_pinky',
        'left_hand_sound_upper_pinky',
        'left_hand_sound_upper_ring',
        'left_hand_sound_upper_middle',
        'left_hand_sound_upper_index',
        'left_hand_sound_home_pinky',
        'left_hand_sound_home_ring',
        'left_hand_sound_home_middle',
        'left_hand_sound_home_index',
        'left_hand_sound_lower_pinky',
        'left_hand_sound_lower_ring',
        'left_hand_sound_lower_middle',
        'left_hand_sound_lower_index',
      ];

      actions.forEach(action => {
        const key = getKeyBindingForAction(action, 'dvorak');
        expect(key).not.toBeNull();
        const roundTrippedAction = getActionForKey(key!, 'dvorak');
        expect(roundTrippedAction).toBe(action);
      });
    });
  });
});
