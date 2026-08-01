import { describe, it, expect, beforeEach, vi } from 'vitest';
import { metronomeAudioEngine, TimeSignature } from '../../renderer/audio/MetronomeAudioEngine';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('MetronomeAudioEngine', () => {
  beforeEach(() => {
    metronomeAudioEngine.stop();
    metronomeAudioEngine.setBpm(120);
    metronomeAudioEngine.setTimeSignature({ numerator: 4, denominator: 4 });
  });

  describe('getBpm', () => {
    it('should return default BPM of 120', () => {
      expect(metronomeAudioEngine.getBpm()).toBe(120);
    });
  });

  describe('getTimeSignature', () => {
    it('should return default time signature of 4/4', () => {
      const sig = metronomeAudioEngine.getTimeSignature();
      expect(sig.numerator).toBe(4);
      expect(sig.denominator).toBe(4);
    });
  });

  describe('getIsRunning', () => {
    it('should return false initially', () => {
      expect(metronomeAudioEngine.getIsRunning()).toBe(false);
    });
  });

  describe('setBpm', () => {
    it('should set BPM', () => {
      metronomeAudioEngine.setBpm(100);
      expect(metronomeAudioEngine.getBpm()).toBe(100);
    });

    it('should clamp negative BPM to positive', () => {
      metronomeAudioEngine.setBpm(-50);
      expect(metronomeAudioEngine.getBpm()).toBeGreaterThan(0);
    });

    it('should not restart metronome when not running', () => {
      metronomeAudioEngine.setBpm(100);
      expect(metronomeAudioEngine.getIsRunning()).toBe(false);
    });
  });

  describe('setTimeSignature', () => {
    it('should set time signature', () => {
      const signature: TimeSignature = { numerator: 3, denominator: 4 };
      metronomeAudioEngine.setTimeSignature(signature);
      expect(metronomeAudioEngine.getTimeSignature().numerator).toBe(3);
      expect(metronomeAudioEngine.getTimeSignature().denominator).toBe(4);
    });

    it('should handle 6/8 time signature', () => {
      const signature: TimeSignature = { numerator: 6, denominator: 8 };
      metronomeAudioEngine.setTimeSignature(signature);
      expect(metronomeAudioEngine.getTimeSignature().numerator).toBe(6);
      expect(metronomeAudioEngine.getTimeSignature().denominator).toBe(8);
    });
  });

  describe('start', () => {
    it('should set isRunning to true', () => {
      metronomeAudioEngine.start(120);
      expect(metronomeAudioEngine.getIsRunning()).toBe(true);
    });

    it('should not start if already running', () => {
      metronomeAudioEngine.start(120);
      metronomeAudioEngine.start(100);
      expect(metronomeAudioEngine.getBpm()).toBe(120);
    });

    it('should clamp BPM to minimum of 20', () => {
      metronomeAudioEngine.start(10);
      expect(metronomeAudioEngine.getBpm()).toBe(20);
    });
  });

  describe('stop', () => {
    it('should set isRunning to false', () => {
      metronomeAudioEngine.start(120);
      metronomeAudioEngine.stop();
      expect(metronomeAudioEngine.getIsRunning()).toBe(false);
    });

    it('should do nothing if not running', () => {
      expect(() => metronomeAudioEngine.stop()).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('should stop the metronome', () => {
      metronomeAudioEngine.start(120);
      metronomeAudioEngine.dispose();
      expect(metronomeAudioEngine.getIsRunning()).toBe(false);
    });
  });
});
