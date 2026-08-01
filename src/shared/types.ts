export type KeyboardLayout = 'qwerty' | 'dvorak';

export interface Settings {
  keyboardLayout: KeyboardLayout;
  masterVolume: number;
}

export interface KeyMappingEntry {
  key: string;
  semitone: number;
}

export interface KeyboardMapping {
  name: string;
  description: string;
  rightHand: KeyMappingEntry[];
  leftHand: KeyMappingEntry[];
}

export interface LoadedKeyMapping {
  key: string;
  semitone: number;
  hand: 'left' | 'right';
}

export interface NoteInfo {
  note: string;
  octave: number;
  frequency: number;
  hand: 'left' | 'right';
}

export interface KeyMapping {
  key: string;
  semitone: number;
  hand: 'left' | 'right';
}

declare global {
  interface Window {
    electronAPI: {
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
        onMaximizeChange: (callback: (isMaximized: boolean) => void) => void;
      };
      settings: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<void>;
        getAll: () => Promise<Record<string, unknown>>;
      };
    };
  }
}
