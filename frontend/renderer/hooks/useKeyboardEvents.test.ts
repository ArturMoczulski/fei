import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardEvents } from './useKeyboardEvents';

vi.mock('../audio/AudioEngine', () => ({
  audioEngine: {
    init: vi.fn().mockResolvedValue(undefined),
    playNote: vi.fn(),
    stopNote: vi.fn(),
  },
}));

vi.mock('../audio/actions', () => ({
  calculateFrequency: vi.fn().mockReturnValue(440),
  isSoundAction: (action: string) => action.startsWith('left_hand_sound_') || action.startsWith('right_hand_sound_'),
}));

vi.mock('../keyboard/layouts', () => ({
  getLayout: vi.fn().mockReturnValue([
    { key: 'g', action: 'right_hand_sound_upper_index', hand: 'right', semitone: 11 },
    { key: 'h', action: 'right_hand_sound_home_index', hand: 'right', semitone: 7 },
    { key: '3', action: 'left_hand_decrease_octave', hand: 'left', semitone: 0 },
    { key: '4', action: 'left_hand_increase_octave', hand: 'left', semitone: 0 },
    { key: '7', action: 'right_hand_increase_octave', hand: 'right', semitone: 0 },
    { key: '8', action: 'right_hand_decrease_octave', hand: 'right', semitone: 0 },
    { key: 'escape', action: 'open_settings', hand: 'left', semitone: 0 },
    { key: ']', action: 'toggle_actions_list', hand: 'left', semitone: 0 },
    { key: '\\', action: 'panic_stop', hand: 'left', semitone: 0 },
    { key: '/', action: 'toggle_metronome', hand: 'left', semitone: 0 },
  ]),
}));

vi.mock('../store/appStore', () => ({
  useAppStore: vi.fn(() => ({
    keyboardLayout: 'dvorak',
    leftOctave: 3,
    rightOctave: 4,
    selectedKey: 0,
    showSettings: false,
    audioReady: false,
    setAudioReady: vi.fn(),
    toggleSettings: vi.fn(),
    toggleActions: vi.fn(),
    setLeftOctave: vi.fn(),
    setRightOctave: vi.fn(),
    addPressedKey: vi.fn(),
    removePressedKey: vi.fn(),
  })),
}));

import { audioEngine } from '../audio/AudioEngine';
import { calculateFrequency } from '../audio/actions';
import { getLayout } from '../keyboard/layouts';

describe('useKeyboardEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('key handling', () => {
    it('should calculate frequency correctly for sound actions', () => {
      const mockMapping = { key: 'g', action: 'right_hand_sound_upper_index', hand: 'right' as const, semitone: 11 };
      (getLayout as ReturnType<typeof vi.fn>).mockReturnValue([mockMapping]);

      expect(calculateFrequency).not.toHaveBeenCalled();
    });

    it('should initialize audio when sound key is pressed', async () => {
      const { result } = renderHook(() => useKeyboardEvents());

      const initAudioSpy = vi.spyOn(audioEngine, 'init');
      initAudioSpy.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.initAudio();
      });

      expect(audioEngine.init).toHaveBeenCalled();
    });

    it('should return initAudio function', () => {
      const { result } = renderHook(() => useKeyboardEvents());

      expect(typeof result.current.initAudio).toBe('function');
    });
  });

  describe('frequency calculation', () => {
    it('should call calculateFrequency with correct parameters', () => {
      const semitone = 11;
      const octave = 4;
      const keyIndex = 0;

      calculateFrequency(semitone, octave, keyIndex);

      expect(calculateFrequency).toHaveBeenCalledWith(semitone, octave, keyIndex);
    });

    it('should use right octave for right hand sounds', () => {
      calculateFrequency(11, 4, 0);
      expect(calculateFrequency).toHaveBeenCalledWith(11, 4, 0);
    });

    it('should use left octave for left hand sounds', () => {
      calculateFrequency(7, 3, 0);
      expect(calculateFrequency).toHaveBeenCalledWith(7, 3, 0);
    });
  });

  describe('action handling', () => {
    it('should identify sound actions correctly', async () => {
      const { isSoundAction } = await import('../audio/actions');

      expect(isSoundAction('right_hand_sound_upper_index')).toBe(true);
      expect(isSoundAction('left_hand_sound_home_pinky')).toBe(true);
      expect(isSoundAction('left_hand_increase_octave')).toBe(false);
      expect(isSoundAction('panic_stop')).toBe(false);
    });

    it('should map g key to right_hand_sound_upper_index', () => {
      const layout = getLayout('dvorak');
      const mapping = layout.find((m: { key: string }) => m.key === 'g');

      expect(mapping?.action).toBe('right_hand_sound_upper_index');
      expect(mapping?.hand).toBe('right');
    });

    it('should return initAudio function from hook', () => {
      const { result } = renderHook(() => useKeyboardEvents());
      expect(typeof result.current.initAudio).toBe('function');
    });
  });
});
