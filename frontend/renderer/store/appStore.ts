import { create } from 'zustand';
import type { KeyboardLayout, ScaleArrangement } from '@shared/types';
import { invoke } from '@tauri-apps/api/core';

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
}

export const useAppStore = create<AppState>((set, get) => ({
  keyboardLayout: 'dvorak',
  volume: -6,
  leftOctave: 3,
  rightOctave: 4,
  leftScaleArrangement: 'major',
  rightScaleArrangement: 'major',
  rearrangeKeysLeft: false,
  rearrangeKeysRight: false,
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
}));
