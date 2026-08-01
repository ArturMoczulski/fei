import { create } from 'zustand';
import type { KeyboardLayout } from '@shared/types';

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
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
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
    get().saveSettings();
  },

  setVolume: (volume) => {
    set({ volume });
    get().saveSettings();
  },

  setLeftOctave: (octave) => {
    set({ leftOctave: octave });
    get().saveSettings();
  },

  setRightOctave: (octave) => {
    set({ rightOctave: octave });
    get().saveSettings();
  },

  setSelectedKey: (key) => {
    set({ selectedKey: key });
    get().saveSettings();
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

  loadSettings: async () => {
    if (!window.electronAPI) return;

    try {
      const layout = await window.electronAPI.settings.get('keyboardLayout') as KeyboardLayout;
      const vol = await window.electronAPI.settings.get('volume') as number;
      const leftOct = await window.electronAPI.settings.get('leftOctave') as number;
      const rightOct = await window.electronAPI.settings.get('rightOctave') as number;
      const key = await window.electronAPI.settings.get('selectedKey') as number;

      set({
        keyboardLayout: layout || 'dvorak',
        volume: vol !== undefined ? vol : -6,
        leftOctave: leftOct !== undefined ? leftOct : 3,
        rightOctave: rightOct !== undefined ? rightOct : 4,
        selectedKey: key !== undefined ? key : 0,
      });
    } catch (e) {
      console.log('Using defaults');
    }
  },

  saveSettings: async () => {
    if (!window.electronAPI) return;

    const state = get();
    await window.electronAPI.settings.set('keyboardLayout', state.keyboardLayout);
    await window.electronAPI.settings.set('volume', state.volume);
    await window.electronAPI.settings.set('leftOctave', state.leftOctave);
    await window.electronAPI.settings.set('rightOctave', state.rightOctave);
    await window.electronAPI.settings.set('selectedKey', state.selectedKey);
  },
}));
