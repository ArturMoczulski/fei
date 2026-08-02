import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { audioEngine } from '../audio/AudioEngine';
import { metronomeAudioEngine } from '../audio/MetronomeAudioEngine';
import { calculateFrequency } from '../audio/actions';
import { getLayout } from '../keyboard/layouts';
import type { KeyMapping } from '@shared/types';
import { isSoundAction } from '../audio/actions';

export function useKeyboardEvents() {
  const {
    keyboardLayout,
    leftOctave,
    rightOctave,
    leftScaleArrangement,
    rightScaleArrangement,
    rearrangeKeysLeft,
    rearrangeKeysRight,
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
    const layout = getLayout(keyboardLayout, leftScaleArrangement, rightScaleArrangement, rearrangeKeysLeft, rearrangeKeysRight);
    const mapping = layout.find((m: KeyMapping) => m.key.toLowerCase() === key);

    if (!mapping) return;

    if (mapping.action === 'toggle_actions_list') {
      toggleActions();
      return;
    }

    if (mapping.action === 'open_settings') {
      toggleSettings();
      return;
    }

    if (mapping.action === 'panic_stop') {
      audioEngine.panic();
      return;
    }

    if (mapping.action === 'toggle_metronome') {
      if (metronomeAudioEngine.getIsRunning()) {
        metronomeAudioEngine.stop();
      } else {
        await metronomeAudioEngine.start(metronomeAudioEngine.getBpm(), metronomeAudioEngine.getTimeSignature());
      }
      return;
    }

    if (showSettings) return;

    if (!audioReady) {
      await initAudio();
    }

    if (isSoundAction(mapping.action)) {
      addPressedKey(key);
      const octave = mapping.hand === 'left' ? leftOctave : rightOctave;
      const frequency = calculateFrequency(mapping.semitone, octave, selectedKey);
      activeFrequenciesRef.current.set(key, frequency);
      audioEngine.playNote(frequency, mapping.hand);
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
    leftScaleArrangement,
    rightScaleArrangement,
    rearrangeKeysLeft,
    rearrangeKeysRight,
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
    const layout = getLayout(keyboardLayout, leftScaleArrangement, rightScaleArrangement, rearrangeKeysLeft, rearrangeKeysRight);
    const mapping = layout.find((m: KeyMapping) => m.key.toLowerCase() === key);

    if (mapping && isSoundAction(mapping.action)) {
      removePressedKey(key);
      const frequency = activeFrequenciesRef.current.get(key);
      if (frequency !== undefined) {
        audioEngine.stopNote(frequency, mapping.hand);
        activeFrequenciesRef.current.delete(key);
      }
    }
  }, [keyboardLayout, leftScaleArrangement, rightScaleArrangement, rearrangeKeysLeft, rearrangeKeysRight, removePressedKey]);

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
