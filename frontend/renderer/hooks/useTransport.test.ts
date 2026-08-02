import { describe, it, expect, beforeEach } from 'vitest';
import { useTransportStore } from './useTransport';

describe('useTransport', () => {
  beforeEach(() => {
    useTransportStore.getState().stop();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useTransportStore.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentTime).toBe(0);
      expect(state.bpm).toBe(120);
      expect(state.timeSignature).toEqual({ numerator: 4, denominator: 4 });
      expect(state.position).toEqual({ bars: 1, beats: 1, ticks: 0 });
    });
  });

  describe('play', () => {
    it('should set isPlaying to true', () => {
      const { play } = useTransportStore.getState();
      play();
      expect(useTransportStore.getState().isPlaying).toBe(true);
      expect(useTransportStore.getState().isPaused).toBe(false);
    });
  });

  describe('pause', () => {
    it('should set isPlaying to false and isPaused to true', () => {
      const { play, pause } = useTransportStore.getState();
      play();
      pause();
      expect(useTransportStore.getState().isPlaying).toBe(false);
      expect(useTransportStore.getState().isPaused).toBe(true);
    });
  });

  describe('stop', () => {
    it('should reset all state', () => {
      const { play, setCurrentTime, stop } = useTransportStore.getState();
      play();
      setCurrentTime(10);
      stop();
      expect(useTransportStore.getState().isPlaying).toBe(false);
      expect(useTransportStore.getState().isPaused).toBe(false);
      expect(useTransportStore.getState().currentTime).toBe(0);
      expect(useTransportStore.getState().position).toEqual({ bars: 1, beats: 1, ticks: 0 });
    });
  });

  describe('togglePlayPause', () => {
    it('should play when stopped', () => {
      const { togglePlayPause } = useTransportStore.getState();
      togglePlayPause();
      expect(useTransportStore.getState().isPlaying).toBe(true);
    });

    it('should pause when playing', () => {
      const { play, togglePlayPause } = useTransportStore.getState();
      play();
      togglePlayPause();
      expect(useTransportStore.getState().isPlaying).toBe(false);
      expect(useTransportStore.getState().isPaused).toBe(true);
    });

    it('should resume when paused', () => {
      const { play, pause, togglePlayPause } = useTransportStore.getState();
      play();
      pause();
      togglePlayPause();
      expect(useTransportStore.getState().isPlaying).toBe(true);
      expect(useTransportStore.getState().isPaused).toBe(false);
    });
  });

  describe('setCurrentTime', () => {
    it('should update currentTime and position', () => {
      const { setCurrentTime } = useTransportStore.getState();
      setCurrentTime(5);
      const state = useTransportStore.getState();
      expect(state.currentTime).toBe(5);
      expect(state.position.bars).toBeGreaterThan(1);
    });
  });

  describe('setBpm', () => {
    it('should update bpm', () => {
      const { setBpm } = useTransportStore.getState();
      setBpm(140);
      expect(useTransportStore.getState().bpm).toBe(140);
    });
  });

  describe('setTimeSignature', () => {
    it('should update timeSignature', () => {
      const { setTimeSignature } = useTransportStore.getState();
      setTimeSignature({ numerator: 3, denominator: 4 });
      expect(useTransportStore.getState().timeSignature).toEqual({ numerator: 3, denominator: 4 });
    });
  });

  describe('position calculation', () => {
    it('should calculate position correctly at 120 BPM 4/4', () => {
      const { setBpm, setTimeSignature, setCurrentTime } = useTransportStore.getState();
      setBpm(120);
      setTimeSignature({ numerator: 4, denominator: 4 });
      setCurrentTime(0);
      expect(useTransportStore.getState().position).toEqual({ bars: 1, beats: 1, ticks: 0 });

      setCurrentTime(0.5);
      const pos1 = useTransportStore.getState().position;
      expect(pos1.bars).toBe(1);
      expect(pos1.beats).toBe(2);
    });

    it('should calculate position correctly at different time signatures', () => {
      const { setBpm, setTimeSignature, setCurrentTime } = useTransportStore.getState();
      setBpm(120);
      setTimeSignature({ numerator: 3, denominator: 4 });
      setCurrentTime(0);
      expect(useTransportStore.getState().position.bars).toBe(1);
      expect(useTransportStore.getState().position.beats).toBe(1);
    });
  });
});
