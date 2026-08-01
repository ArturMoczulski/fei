import React from 'react';
import { KeyBindingTooltip } from './KeyBindingTooltip';
import type { KeyboardLayout, KeyMapping } from '@shared/types';
import { getLayout, getKeyDisplayKey, semitoneToNote } from '../keyboard/layouts';

interface KeyboardHandProps {
  hand: 'left' | 'right';
  baseOctave: number;
  onOctaveChange: (octave: number) => void;
  pressedKeys: Set<string>;
  keyboardLayout: KeyboardLayout;
  selectedKey: number;
}

function KeyboardHand({
  hand,
  baseOctave,
  onOctaveChange,
  pressedKeys,
  keyboardLayout,
  selectedKey,
}: KeyboardHandProps) {
  const layout = getLayout(keyboardLayout);
  const handMappings = layout.filter(m => m.hand === hand);

  const isPressed = (key: string) => {
    return pressedKeys.has(key);
  };

  const getMappingAt = (row: number, col: number) => {
    return handMappings[row * 4 + col];
  };

  const decreaseAction = hand === 'left' ? 'left_hand_decrease_octave' : 'right_hand_decrease_octave';
  const increaseAction = hand === 'left' ? 'left_hand_increase_octave' : 'right_hand_increase_octave';

  const handleDecrement = () => {
    if (baseOctave > 1) {
      onOctaveChange(baseOctave - 1);
    }
  };

  const handleIncrement = () => {
    if (baseOctave < 8) {
      onOctaveChange(baseOctave + 1);
    }
  };

  const calculateFrequency = (semitone: number, octave: number): number => {
    const note = semitoneToNote(semitone, selectedKey);
    const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(note);
    const totalSemitones = selectedKey + semitone;
    const octaveOffset = Math.floor(totalSemitones / 12);
    const midiNumber = (octave + octaveOffset + 1) * 12 + noteIndex;
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  };

  return (
    <div className={`hand-panel ${hand}`}>
      <div className="keymouse-header">
        {hand === 'left' ? (
          <div className="octave-controls-inline">
            <span className="octave-display-inline">Octave {baseOctave}</span>
            <KeyBindingTooltip actions={[decreaseAction]} keyboardLayout={keyboardLayout}>
              <button
                className="octave-btn-small"
                onClick={handleDecrement}
                disabled={baseOctave <= 1}
              >
                O-
              </button>
            </KeyBindingTooltip>
            <KeyBindingTooltip actions={[increaseAction]} keyboardLayout={keyboardLayout}>
              <button
                className="octave-btn-small"
                onClick={handleIncrement}
                disabled={baseOctave >= 8}
              >
                O+
              </button>
            </KeyBindingTooltip>
          </div>
        ) : (
          <div className="octave-controls-inline">
            <KeyBindingTooltip actions={[increaseAction]} keyboardLayout={keyboardLayout}>
              <button
                className="octave-btn-small"
                onClick={handleIncrement}
                disabled={baseOctave >= 8}
              >
                O+
              </button>
            </KeyBindingTooltip>
            <KeyBindingTooltip actions={[decreaseAction]} keyboardLayout={keyboardLayout}>
              <button
                className="octave-btn-small"
                onClick={handleDecrement}
                disabled={baseOctave <= 1}
              >
                O-
              </button>
            </KeyBindingTooltip>
            <span className="octave-display-inline">Octave {baseOctave}</span>
          </div>
        )}
      </div>

      <div className="keymouse-grid">
        {[0, 1, 2].map(row => (
          <div key={row} className="keymouse-row">
            {[0, 1, 2, 3].map(col => {
              const mapping = getMappingAt(row, col);
              if (!mapping) return null;
              const pressed = isPressed(mapping.key);
              const noteName = semitoneToNote(mapping.semitone, selectedKey);
              const frequency = calculateFrequency(mapping.semitone, baseOctave);
              return (
                <button
                  key={mapping.key}
                  className={`key-button ${pressed ? 'pressed' : ''}`}
                >
                  <div className="key-button-grid">
                    <div className="key-info note-name">{noteName}</div>
                    <div className="key-info interval">+{mapping.semitone}</div>
                    <div className="key-info frequency">{frequency.toFixed(0)}Hz</div>
                    <div className="key-center">
                      <span className="key-hint">{getKeyDisplayKey(mapping, keyboardLayout)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KeyboardHand;
