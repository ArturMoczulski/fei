import { create } from 'zustand';

export interface TransportState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  bpm: number;
  timeSignature: { numerator: number; denominator: number };
  position: { bars: number; beats: number; ticks: number };
}

interface TransportActions {
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (ts: { numerator: number; denominator: number }) => void;
  updatePosition: () => void;
}

type TransportStore = TransportState & TransportActions;

function timeToPosition(time: number, bpm: number, numerator: number): { bars: number; beats: number; ticks: number } {
  const beatsPerSecond = bpm / 60;
  const totalBeats = time * beatsPerSecond;
  const beatsPerBar = numerator;

  const bars = Math.floor(totalBeats / beatsPerBar) + 1;
  const beats = Math.floor(totalBeats % beatsPerBar) + 1;
  const tickFraction = (totalBeats % 1) * 1000;
  const ticks = Math.floor(tickFraction);

  return { bars, beats, ticks };
}

export const useTransportStore = create<TransportStore>((set, get) => ({
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  bpm: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  position: { bars: 1, beats: 1, ticks: 0 },

  play: () => set({ isPlaying: true, isPaused: false }),

  pause: () => set({ isPlaying: false, isPaused: true }),

  stop: () => set({ isPlaying: false, isPaused: false, currentTime: 0, position: { bars: 1, beats: 1, ticks: 0 } }),

  togglePlayPause: () => {
    const { isPlaying, isPaused, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  setCurrentTime: (time: number) => {
    const { bpm, timeSignature } = get();
    set({
      currentTime: time,
      position: timeToPosition(time, bpm, timeSignature.numerator)
    });
  },

  setBpm: (bpm: number) => set({ bpm }),

  setTimeSignature: (ts: { numerator: number; denominator: number }) => set({ timeSignature: ts }),

  updatePosition: () => {
    const { currentTime, bpm, timeSignature } = get();
    set({
      position: timeToPosition(currentTime, bpm, timeSignature.numerator)
    });
  },
}));

let animationFrameId: number | null = null;
let lastTimestamp: number | null = null;

function tick(timestamp: number) {
  const state = useTransportStore.getState();

  if (!state.isPlaying) {
    animationFrameId = null;
    lastTimestamp = null;
    return;
  }

  if (lastTimestamp !== null) {
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    const newTime = state.currentTime + deltaTime;
    const { bpm, timeSignature } = state;
    useTransportStore.setState({
      currentTime: newTime,
      position: timeToPosition(newTime, bpm, timeSignature.numerator)
    });
  }

  lastTimestamp = timestamp;
  animationFrameId = requestAnimationFrame(tick);
}

export function startTimeUpdate() {
  if (animationFrameId !== null) return;
  lastTimestamp = null;
  animationFrameId = requestAnimationFrame(tick);
}

export function stopTimeUpdate() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    lastTimestamp = null;
  }
}
