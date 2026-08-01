import React, { useState, useEffect, useCallback, useRef } from 'react';
import TitleBar from './components/TitleBar';
import KeyboardHand from './components/KeyboardHand';
import SettingsModal from './components/SettingsModal';
import KeySelector from './components/KeySelector';
import Metronome from './components/Metronome';
import { KeyBindingTooltip } from './components/KeyBindingTooltip';
import { audioEngine } from './audio/AudioEngine';
import { isSoundAction } from './audio/actions';
import { getLayout, getKeyDisplayKey, semitoneToNote } from './keyboard/layouts';
import type { KeyboardLayout, KeyMapping } from '@shared/types';

const DEFAULT_LEFT_OCTAVE = 3;
const DEFAULT_RIGHT_OCTAVE = 4;
const DEFAULT_KEY = 0;

function App() {
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('dvorak');
  const [volume, setVolume] = useState(-6);
  const [leftOctave, setLeftOctave] = useState(DEFAULT_LEFT_OCTAVE);
  const [rightOctave, setRightOctave] = useState(DEFAULT_RIGHT_OCTAVE);
  const [selectedKey, setSelectedKey] = useState(DEFAULT_KEY);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [activeFrequencies] = useState<Map<string, number>>(new Map());
  const isInitialKeyChange = useRef(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (window.electronAPI) {
          const layout = await window.electronAPI.settings.get('keyboardLayout');
          const vol = await window.electronAPI.settings.get('volume');
          const leftOct = await window.electronAPI.settings.get('leftOctave');
          const rightOct = await window.electronAPI.settings.get('rightOctave');
          const key = await window.electronAPI.settings.get('selectedKey');

          if (layout) setKeyboardLayout(layout as KeyboardLayout);
          if (vol !== undefined) setVolume(vol as number);
          if (leftOct !== undefined) setLeftOctave(leftOct as number);
          if (rightOct !== undefined) setRightOctave(rightOct as number);
          if (key !== undefined) setSelectedKey(key as number);
        }
      } catch (e) {
        console.log('Using defaults');
      }
    };
    loadSettings();
  }, []);

  const initAudio = useCallback(async () => {
    await audioEngine.init();
    setAudioReady(true);
  }, []);

  const handleLeftOctaveChange = async (oct: number) => {
    setLeftOctave(oct);
    if (window.electronAPI) {
      await window.electronAPI.settings.set('leftOctave', oct);
    }
  };

  const handleRightOctaveChange = async (oct: number) => {
    setRightOctave(oct);
    if (window.electronAPI) {
      await window.electronAPI.settings.set('rightOctave', oct);
    }
  };

  const getActiveNotes = useCallback((hand: 'left' | 'right') => {
    const layout = getLayout(keyboardLayout);
    const octave = hand === 'left' ? leftOctave : rightOctave;
    const activeNotes: { note: string; octave: number; key: string }[] = [];

    layout.forEach((mapping: KeyMapping) => {
      if (mapping.hand === hand && pressedKeys.has(mapping.key)) {
        const note = semitoneToNote(mapping.semitone, selectedKey);
        activeNotes.push({ note, octave, key: mapping.key });
      }
    });

    return activeNotes;
  }, [keyboardLayout, pressedKeys, leftOctave, rightOctave, selectedKey]);

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (showSettings) return;

    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }

    const key = e.key.toLowerCase();
    const layout = getLayout(keyboardLayout);
    const mapping = layout.find((m: KeyMapping) => m.key === key);

    if (mapping) {
      setPressedKeys(prev => new Set(prev).add(key));

      if (isSoundAction(mapping.action)) {
        const octave = mapping.hand === 'left' ? leftOctave : rightOctave;
        const note = semitoneToNote(mapping.semitone, selectedKey);
        const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
        const totalSemitones = selectedKey + mapping.semitone;
        const octaveOffset = Math.floor(totalSemitones / 12);
        const midiNumber = (octave + octaveOffset + 1) * 12 + noteIndex;
        const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

        activeFrequencies.set(key, frequency);
        audioEngine.playNote(frequency, mapping.hand);
      } else if (mapping.action === 'left_hand_increase_octave') {
        if (leftOctave < 8) handleLeftOctaveChange(leftOctave + 1);
      } else if (mapping.action === 'left_hand_decrease_octave') {
        if (leftOctave > 1) handleLeftOctaveChange(leftOctave - 1);
      } else if (mapping.action === 'right_hand_increase_octave') {
        if (rightOctave < 8) handleRightOctaveChange(rightOctave + 1);
      } else if (mapping.action === 'right_hand_decrease_octave') {
        if (rightOctave > 1) handleRightOctaveChange(rightOctave - 1);
      }
    }
  }, [keyboardLayout, leftOctave, rightOctave, selectedKey, audioReady, showSettings, initAudio, activeFrequencies, handleLeftOctaveChange, handleRightOctaveChange]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const layout = getLayout(keyboardLayout);
    const mapping = layout.find((m: KeyMapping) => m.key === key);

    if (mapping) {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      if (isSoundAction(mapping.action)) {
        const frequency = activeFrequencies.get(key);
        if (frequency !== undefined) {
          audioEngine.stopNote(frequency, mapping.hand);
          activeFrequencies.delete(key);
        }
      }
    }
  }, [keyboardLayout, activeFrequencies, pressedKeys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (isInitialKeyChange.current) {
      isInitialKeyChange.current = false;
      return;
    }

    if (pressedKeys.size > 0 && audioReady) {
      const layout = getLayout(keyboardLayout);
      audioEngine.stopAllNotes();
      activeFrequencies.clear();

      pressedKeys.forEach(key => {
        const mapping = layout.find((m: KeyMapping) => m.key === key);
        if (mapping && isSoundAction(mapping.action)) {
          const octave = mapping.hand === 'left' ? leftOctave : rightOctave;
          const note = semitoneToNote(mapping.semitone, selectedKey);
          const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
          const totalSemitones = selectedKey + mapping.semitone;
          const octaveOffset = Math.floor(totalSemitones / 12);
          const midiNumber = (octave + octaveOffset + 1) * 12 + noteIndex;
          const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);

          activeFrequencies.set(key, frequency);
          audioEngine.playNote(frequency, mapping.hand);
        }
      });
    }
  }, [selectedKey, keyboardLayout, leftOctave, rightOctave]);

  const handleLayoutChange = async (layout: KeyboardLayout) => {
    setKeyboardLayout(layout);
    if (window.electronAPI) {
      await window.electronAPI.settings.set('keyboardLayout', layout);
    }
  };

  const handleVolumeChange = async (vol: number) => {
    setVolume(vol);
    audioEngine.setVolume(vol);
    if (window.electronAPI) {
      await window.electronAPI.settings.set('volume', vol);
    }
  };

  const handleKeyChange = async (key: number) => {
    setSelectedKey(key);
    if (window.electronAPI) {
      await window.electronAPI.settings.set('selectedKey', key);
    }
  };

  return (
    <div className="app">
      <TitleBar onSettingsClick={() => setShowSettings(true)} keyboardLayout={keyboardLayout} />

      <div className="main-content">
        <div className="hands-container">
          <KeyboardHand
            hand="left"
            baseOctave={leftOctave}
            onOctaveChange={handleLeftOctaveChange}
            pressedKeys={pressedKeys}
            keyboardLayout={keyboardLayout}
            activeNotes={getActiveNotes('left')}
            selectedKey={selectedKey}
          />

          <KeyboardHand
            hand="right"
            baseOctave={rightOctave}
            onOctaveChange={handleRightOctaveChange}
            pressedKeys={pressedKeys}
            keyboardLayout={keyboardLayout}
            activeNotes={getActiveNotes('right')}
            selectedKey={selectedKey}
          />
        </div>
      </div>

      <div className="footer">
        <KeySelector selectedKey={selectedKey} onKeyChange={handleKeyChange} />

        <Metronome visible={true} />

        <div className="settings-row">
          <span className="settings-label">Volume:</span>
          <div className="volume-control">
            <input
              type="range"
              className="volume-slider"
              min="-40"
              max="0"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
            />
            <span style={{ fontSize: '12px', minWidth: '30px' }}>{volume}dB</span>
          </div>
        </div>

        <KeyBindingTooltip actions={['panic_stop']} keyboardLayout={keyboardLayout}>
          <button
            className="panic-btn"
            onClick={() => audioEngine.panic()}
            title="Stop all sounds"
          >
            ■
          </button>
        </KeyBindingTooltip>
      </div>

      <div className="status-bar">
        <span className="status-dot" />
        <span>{audioReady ? 'Audio Ready' : 'Click any key to enable audio'}</span>
      </div>

      {showSettings && (
        <SettingsModal
          keyboardLayout={keyboardLayout}
          volume={volume}
          onLayoutChange={handleLayoutChange}
          onVolumeChange={handleVolumeChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
