import { describe, it, expect, beforeEach } from 'vitest';

import { audioEngine } from '../../renderer/audio/AudioEngine';

describe('AudioEngine', () => {
  beforeEach(() => {
    audioEngine.dispose();
  });

  describe('initial state', () => {
    it('should not be initialized initially', () => {
      expect(audioEngine.isInitialized()).toBe(false);
    });

    it('should have default volume of -6', () => {
      expect(audioEngine.getVolume()).toBe(-6);
    });
  });

  describe('volume', () => {
    it('should set volume', () => {
      audioEngine.setVolume(-12);
      expect(audioEngine.getVolume()).toBe(-12);
    });

    it('should set volume to 0', () => {
      audioEngine.setVolume(0);
      expect(audioEngine.getVolume()).toBe(0);
    });

    it('should set volume to -40', () => {
      audioEngine.setVolume(-40);
      expect(audioEngine.getVolume()).toBe(-40);
    });

    it('should set positive volume', () => {
      audioEngine.setVolume(-3);
      expect(audioEngine.getVolume()).toBe(-3);
    });
  });

  describe('dispose', () => {
    it('should reset initialized state', () => {
      expect(audioEngine.isInitialized()).toBe(false);
      audioEngine.dispose();
      expect(audioEngine.isInitialized()).toBe(false);
    });
  });
});
