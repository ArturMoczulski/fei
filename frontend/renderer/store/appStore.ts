import { create } from 'zustand';
import type { KeyboardLayout } from '@shared/types';
import { invoke } from '@tauri-apps/api/core';

interface AppState {
  keyboardLayout: KeyboardLayout;
  volume: number;
  leftOctave: number;
  rightOctave: number;
  selectedKey: number;
  showSettings: boolean;
  showActions: boolean;
  audioReady: boolean;
  pressedKeys: Set<string>;

  setKeyboardLayout: (layout: KeyboardLayout) => void;
  setVolume: (volume: number) => void;
  setLeftOctave: (octave: number) => void;
  setRightOctave: (octave: number) => void;
  setSelectedKey: (key: number) => void;
  toggleSettings: () => void;
  toggleActions: () => void;
  setAudioReady: (ready: boolean) => void;
  addPressedKey: (key: string) => void;
  removePressedKey: (key: string) => void;
  isPressed: (key: string) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  keyboardLayout: 'dvorak',
  volume: -6,
  leftOctave: 3,
  rightOctave: 4,
  selectedKey: 0,
  showSettings: false,
  showActions: false,
  audioReady: false,
  pressedKeys: new Set(),

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
}));
