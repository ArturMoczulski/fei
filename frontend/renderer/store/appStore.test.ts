import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../renderer/store/appStore';

describe('appStore', () => {
  beforeEach(() => {
    const store = useAppStore.getState();
    store.setKeyboardLayout('dvorak');
    store.setVolume(-6);
    store.setLeftOctave(3);
    store.setRightOctave(4);
    store.setSelectedKey(0);
  });

  describe('initial state', () => {
    it('should have default keyboard layout', () => {
      expect(useAppStore.getState().keyboardLayout).toBe('dvorak');
    });

    it('should have default volume', () => {
      expect(useAppStore.getState().volume).toBe(-6);
    });

    it('should have default left octave', () => {
      expect(useAppStore.getState().leftOctave).toBe(3);
    });

    it('should have default right octave', () => {
      expect(useAppStore.getState().rightOctave).toBe(4);
    });

    it('should have default selected key (C)', () => {
      expect(useAppStore.getState().selectedKey).toBe(0);
    });

    it('should not be audio ready initially', () => {
      expect(useAppStore.getState().audioReady).toBe(false);
    });

    it('should have empty pressed keys initially', () => {
      expect(useAppStore.getState().pressedKeys.size).toBe(0);
    });

    it('should have modals closed initially', () => {
      expect(useAppStore.getState().showSettings).toBe(false);
      expect(useAppStore.getState().showActions).toBe(false);
    });
  });

  describe('setKeyboardLayout', () => {
    it('should set keyboard layout to qwerty', () => {
      useAppStore.getState().setKeyboardLayout('qwerty');
      expect(useAppStore.getState().keyboardLayout).toBe('qwerty');
    });

    it('should set keyboard layout to dvorak', () => {
      useAppStore.getState().setKeyboardLayout('dvorak');
      expect(useAppStore.getState().keyboardLayout).toBe('dvorak');
    });
  });

  describe('setVolume', () => {
    it('should set volume', () => {
      useAppStore.getState().setVolume(-12);
      expect(useAppStore.getState().volume).toBe(-12);
    });

    it('should set volume to 0', () => {
      useAppStore.getState().setVolume(0);
      expect(useAppStore.getState().volume).toBe(0);
    });

    it('should set volume to -40', () => {
      useAppStore.getState().setVolume(-40);
      expect(useAppStore.getState().volume).toBe(-40);
    });
  });

  describe('setLeftOctave', () => {
    it('should set left octave', () => {
      useAppStore.getState().setLeftOctave(5);
      expect(useAppStore.getState().leftOctave).toBe(5);
    });

    it('should allow octave 1', () => {
      useAppStore.getState().setLeftOctave(1);
      expect(useAppStore.getState().leftOctave).toBe(1);
    });

    it('should allow octave 8', () => {
      useAppStore.getState().setLeftOctave(8);
      expect(useAppStore.getState().leftOctave).toBe(8);
    });
  });

  describe('setRightOctave', () => {
    it('should set right octave', () => {
      useAppStore.getState().setRightOctave(6);
      expect(useAppStore.getState().rightOctave).toBe(6);
    });
  });

  describe('setSelectedKey', () => {
    it('should set selected key', () => {
      useAppStore.getState().setSelectedKey(7);
      expect(useAppStore.getState().selectedKey).toBe(7);
    });

    it('should allow key 0 (C)', () => {
      useAppStore.getState().setSelectedKey(0);
      expect(useAppStore.getState().selectedKey).toBe(0);
    });

    it('should allow key 11 (B)', () => {
      useAppStore.getState().setSelectedKey(11);
      expect(useAppStore.getState().selectedKey).toBe(11);
    });
  });

  describe('toggleSettings', () => {
    it('should toggle settings modal', () => {
      expect(useAppStore.getState().showSettings).toBe(false);
      useAppStore.getState().toggleSettings();
      expect(useAppStore.getState().showSettings).toBe(true);
      useAppStore.getState().toggleSettings();
      expect(useAppStore.getState().showSettings).toBe(false);
    });
  });

  describe('toggleActions', () => {
    it('should toggle actions modal', () => {
      expect(useAppStore.getState().showActions).toBe(false);
      useAppStore.getState().toggleActions();
      expect(useAppStore.getState().showActions).toBe(true);
      useAppStore.getState().toggleActions();
      expect(useAppStore.getState().showActions).toBe(false);
    });
  });

  describe('setAudioReady', () => {
    it('should set audio ready', () => {
      useAppStore.getState().setAudioReady(true);
      expect(useAppStore.getState().audioReady).toBe(true);
    });

    it('should set audio not ready', () => {
      useAppStore.getState().setAudioReady(true);
      useAppStore.getState().setAudioReady(false);
      expect(useAppStore.getState().audioReady).toBe(false);
    });
  });

  describe('pressedKeys', () => {
    it('should add pressed key', () => {
      useAppStore.getState().addPressedKey('g');
      expect(useAppStore.getState().isPressed('g')).toBe(true);
    });

    it('should remove pressed key', () => {
      useAppStore.getState().addPressedKey('g');
      useAppStore.getState().removePressedKey('g');
      expect(useAppStore.getState().isPressed('g')).toBe(false);
    });

    it('should check if key is pressed', () => {
      expect(useAppStore.getState().isPressed('g')).toBe(false);
      useAppStore.getState().addPressedKey('g');
      expect(useAppStore.getState().isPressed('g')).toBe(true);
    });

    it('should handle multiple keys', () => {
      useAppStore.getState().addPressedKey('g');
      useAppStore.getState().addPressedKey('h');
      useAppStore.getState().addPressedKey('j');
      expect(useAppStore.getState().isPressed('g')).toBe(true);
      expect(useAppStore.getState().isPressed('h')).toBe(true);
      expect(useAppStore.getState().isPressed('j')).toBe(true);
      expect(useAppStore.getState().isPressed('k')).toBe(false);
    });

    it('should only remove specific key', () => {
      useAppStore.getState().addPressedKey('g');
      useAppStore.getState().addPressedKey('h');
      useAppStore.getState().removePressedKey('g');
      expect(useAppStore.getState().isPressed('g')).toBe(false);
      expect(useAppStore.getState().isPressed('h')).toBe(true);
    });
  });
});
