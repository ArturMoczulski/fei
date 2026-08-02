export type KeyboardLayout = 'qwerty' | 'dvorak';

export type ScaleArrangement = 'chromatic' | 'major' | 'natural_minor' | 'harmonic_minor' | 'pentatonic_major' | 'pentatonic_minor';

export const SCALE_ARRANGEMENT_DISPLAY: Record<ScaleArrangement, string> = {
  chromatic: 'Chromatic (Sequential)',
  major: 'Major (Consonant)',
  natural_minor: 'Natural Minor',
  harmonic_minor: 'Harmonic Minor',
  pentatonic_major: 'Pentatonic Major',
  pentatonic_minor: 'Pentatonic Minor',
};

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
  row?: 'upper' | 'home' | 'lower';
  action: string;
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
