import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { audioEngine } from '../audio/AudioEngine';
import { calculateFrequency } from '../audio/actions';
import { getLayout } from '../keyboard/layouts';
import type { KeyMapping } from '@shared/types';
import { isSoundAction } from '../audio/actions';

export function useKeyboardEvents() {
  const {
    keyboardLayout,
    leftOctave,
    rightOctave,
    selectedKey,
    showSettings,
    audioReady,
    setAudioReady,
    toggleSettings,
    toggleActions,
    setLeftOctave,
    setRightOctave,
    addPressedKey,
    removePressedKey,
  } = useAppStore();

  const activeFrequenciesRef = useRef<Map<string, number>>(new Map());

  const initAudio = useCallback(async () => {
    await audioEngine.init();
    setAudioReady(true);
  }, [setAudioReady]);

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (e.repeat) return;

    const key = e.key.toLowerCase();
    const layout = getLayout(keyboardLayout);
    const mapping = layout.find((m: KeyMapping) => m.key.toLowerCase() === key);

    if (!mapping) return;

    console.log(`[KeyDown] key=${key}, action=${mapping.action}`);

    if (mapping.action === 'toggle_actions_list') {
      toggleActions();
      return;
    }

    if (mapping.action === 'open_settings') {
      toggleSettings();
      return;
    }

    if (showSettings) return;

    if (!audioReady) {
      console.log('[KeyDown] Audio not ready, initializing...');
      await initAudio();
    }

    if (isSoundAction(mapping.action)) {
      const t0 = performance.now();
      addPressedKey(key);
      const octave = mapping.hand === 'left' ? leftOctave : rightOctave;
      const frequency = calculateFrequency(mapping.semitone, octave, selectedKey);
      const t1 = performance.now();
      activeFrequenciesRef.current.set(key, frequency);
      audioEngine.playNote(frequency, mapping.hand);
      const t2 = performance.now();
      console.log(`[KeyDown] calculateFrequency: ${t1-t0}ms, playNote: ${t2-t1}ms`);
    } else if (mapping.action === 'left_hand_increase_octave') {
      setLeftOctave(Math.min(8, leftOctave + 1));
    } else if (mapping.action === 'left_hand_decrease_octave') {
      setLeftOctave(Math.max(1, leftOctave - 1));
    } else if (mapping.action === 'right_hand_increase_octave') {
      setRightOctave(Math.min(8, rightOctave + 1));
    } else if (mapping.action === 'right_hand_decrease_octave') {
      setRightOctave(Math.max(1, rightOctave - 1));
    }
  }, [
    keyboardLayout,
    showSettings,
    audioReady,
    initAudio,
    toggleSettings,
    toggleActions,
    leftOctave,
    rightOctave,
    selectedKey,
    setLeftOctave,
    setRightOctave,
    addPressedKey,
  ]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const layout = getLayout(keyboardLayout);
    const mapping = layout.find((m: KeyMapping) => m.key.toLowerCase() === key);

    if (mapping && isSoundAction(mapping.action)) {
      removePressedKey(key);
      const frequency = activeFrequenciesRef.current.get(key);
      if (frequency !== undefined) {
        audioEngine.stopNote(frequency, mapping.hand);
        activeFrequenciesRef.current.delete(key);
      }
    }
  }, [keyboardLayout, removePressedKey]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { initAudio };
}
