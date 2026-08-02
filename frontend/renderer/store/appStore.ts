import { create } from 'zustand';
import type { KeyboardLayout, ScaleArrangement } from '@shared/types';
import { invoke } from '@tauri-apps/api/core';

interface MidiMetadata {
  name: string;
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  keySignature: string | null;
  duration: number;
  trackCount: number;
}

interface AppState {
  keyboardLayout: KeyboardLayout;
  volume: number;
  leftOctave: number;
  rightOctave: number;
  leftScaleArrangement: ScaleArrangement;
  rightScaleArrangement: ScaleArrangement;
  rearrangeKeysLeft: boolean;
  rearrangeKeysRight: boolean;
  selectedKey: number;
  showSettings: boolean;
  showActions: boolean;
  audioReady: boolean;
  pressedKeys: Set<string>;
  autoplayFile: File | null;
  autoplayNotes: { key: string; hand: 'left' | 'right'; time: number; duration: number; frequency: number; midi?: number }[];
  autoplayIsPlaying: boolean;
  autoplayIsPaused: boolean;
  showMidiSettings: boolean;
  midiMetadata: MidiMetadata | null;
  metronomeBpm: number;
  metronomeTimeSignature: { numerator: number; denominator: number };
  octaveIndicator: { left: 'none' | 'lower' | 'higher'; right: 'none' | 'lower' | 'higher' };

  setKeyboardLayout: (layout: KeyboardLayout) => void;
  setVolume: (volume: number) => void;
  setLeftOctave: (octave: number) => void;
  setRightOctave: (octave: number) => void;
  setLeftScaleArrangement: (scale: ScaleArrangement) => void;
  setRightScaleArrangement: (scale: ScaleArrangement) => void;
  setRearrangeKeysLeft: (rearrange: boolean) => void;
  setRearrangeKeysRight: (rearrange: boolean) => void;
  setSelectedKey: (key: number) => void;
  toggleSettings: () => void;
  toggleActions: () => void;
  setAudioReady: (ready: boolean) => void;
  addPressedKey: (key: string) => void;
  removePressedKey: (key: string) => void;
  isPressed: (key: string) => boolean;
  setAutoplayFile: (file: File | null) => void;
  setAutoplayNotes: (notes: { key: string; hand: 'left' | 'right'; time: number; duration: number; frequency: number; midi?: number }[]) => void;
  setAutoplayIsPlaying: (playing: boolean) => void;
  setAutoplayIsPaused: (paused: boolean) => void;
  setShowMidiSettings: (show: boolean) => void;
  setMidiMetadata: (metadata: MidiMetadata | null) => void;
  setMetronomeBpm: (bpm: number) => void;
  setMetronomeTimeSignature: (ts: { numerator: number; denominator: number }) => void;
  setOctaveIndicator: (indicator: { left: 'none' | 'lower' | 'higher'; right: 'none' | 'lower' | 'higher' }) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  keyboardLayout: 'dvorak',
  volume: -6,
  leftOctave: 3,
  rightOctave: 4,
  leftScaleArrangement: 'major',
  rightScaleArrangement: 'major',
  rearrangeKeysLeft: true,
  rearrangeKeysRight: true,
  selectedKey: 0,
  showSettings: false,
  showActions: false,
  audioReady: false,
  pressedKeys: new Set(),
  autoplayFile: null,
  autoplayNotes: [],
  autoplayIsPlaying: false,
  autoplayIsPaused: false,
  showMidiSettings: false,
  midiMetadata: null,
  metronomeBpm: 110,
  metronomeTimeSignature: { numerator: 4, denominator: 4 },
  octaveIndicator: { left: 'none', right: 'none' },

  setKeyboardLayout: (layout) => {
    set({ keyboardLayout: layout });
  },

  setVolume: (volume) => {
    set({ volume });
  },

  setLeftOctave: (octave) => {
    set({ leftOctave: octave });
  },

  setRightOctave: (octave) => {
    set({ rightOctave: octave });
  },

  setLeftScaleArrangement: (scale) => {
    set({ leftScaleArrangement: scale });
  },

  setRightScaleArrangement: (scale) => {
    set({ rightScaleArrangement: scale });
  },

  setRearrangeKeysLeft: (rearrange) => {
    set({ rearrangeKeysLeft: rearrange });
  },

  setRearrangeKeysRight: (rearrange) => {
    set({ rearrangeKeysRight: rearrange });
  },

  setSelectedKey: (key) => {
    set({ selectedKey: key });
  },

  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  toggleActions: () => set((state) => ({ showActions: !state.showActions })),
  setAudioReady: (ready) => set({ audioReady: ready }),

  addPressedKey: (key) => set((state) => {
    const newSet = new Set(state.pressedKeys);
    newSet.add(key);
    return { pressedKeys: newSet };
  }),

  removePressedKey: (key) => set((state) => {
    const newSet = new Set(state.pressedKeys);
    newSet.delete(key);
    return { pressedKeys: newSet };
  }),

  isPressed: (key) => get().pressedKeys.has(key),

  setAutoplayFile: (file) => set({ autoplayFile: file }),
  setAutoplayNotes: (notes) => set({ autoplayNotes: notes }),
  setAutoplayIsPlaying: (playing) => set({ autoplayIsPlaying: playing }),
  setAutoplayIsPaused: (paused) => set({ autoplayIsPaused: paused }),
  setShowMidiSettings: (show) => set({ showMidiSettings: show }),
  setMidiMetadata: (metadata) => set({ midiMetadata: metadata }),
  setMetronomeBpm: (bpm) => set({ metronomeBpm: bpm }),
  setMetronomeTimeSignature: (ts) => set({ metronomeTimeSignature: ts }),
  setOctaveIndicator: (indicator) => set({ octaveIndicator: indicator }),
}));
