import { describe, it, expect, beforeEach, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { audioEngine } from '../../renderer/audio/AudioEngine';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('AudioEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should not be initialized initially', () => {
      expect(audioEngine.isInitialized()).toBe(false);
    });

    it('should have default volume of 0.5', () => {
      expect(audioEngine.getVolume()).toBe(0.5);
    });
  });

  describe('setVolume', () => {
    it('should call invoke with cmd_set_volume regardless of init state', () => {
      audioEngine.setVolume(-12);
      expect(invoke).toHaveBeenCalledWith('cmd_set_volume', { volume: -12 });
    });
  });

  describe('playNote', () => {
    it('should not call invoke when not initialized', () => {
      audioEngine.playNote(440, 'left');
      expect(invoke).not.toHaveBeenCalled();
    });
  });

  describe('stopNote', () => {
    it('should not call invoke when not initialized', () => {
      audioEngine.stopNote(440, 'left');
      expect(invoke).not.toHaveBeenCalled();
    });
  });

  describe('stopAllNotes', () => {
    it('should not call invoke when not initialized', () => {
      audioEngine.stopAllNotes();
      expect(invoke).not.toHaveBeenCalled();
    });
  });

  describe('panic', () => {
    it('should call invoke with cmd_panic regardless of init state', () => {
      audioEngine.panic();
      expect(invoke).toHaveBeenCalledWith('cmd_panic');
    });
  });
});
