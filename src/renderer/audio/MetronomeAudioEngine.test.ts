import { describe, it, expect } from 'vitest';

import { metronomeAudioEngine } from '../../renderer/audio/MetronomeAudioEngine';
import type { TimeSignature } from '../../renderer/audio/MetronomeAudioEngine';

describe('MetronomeAudioEngine', () => {
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
});
