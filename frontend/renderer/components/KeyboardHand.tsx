import React from 'react';
import { KeyBindingTooltip } from './KeyBindingTooltip';
import { useAppStore } from '../store/appStore';
import type { KeyboardLayout, ScaleArrangement } from '@shared/types';
import { SCALE_ARRANGEMENT_DISPLAY } from '@shared/types';
import { getLayout, getKeyDisplayKey, semitoneToNote } from '../keyboard/layouts';

interface KeyboardHandProps {
  hand: 'left' | 'right';
  baseOctave: number;
  keyboardLayout: KeyboardLayout;
  activeNotes: { note: string; octave: number; key: string }[];
  selectedKey: number;
}

function KeyboardHand({
  hand,
  baseOctave,
  keyboardLayout,
  selectedKey,
}: KeyboardHandProps) {
  const leftScaleArrangement = useAppStore(state => state.leftScaleArrangement);
  const rightScaleArrangement = useAppStore(state => state.rightScaleArrangement);
  const setLeftScaleArrangement = useAppStore(state => state.setLeftScaleArrangement);
  const setRightScaleArrangement = useAppStore(state => state.setRightScaleArrangement);
  const layout = getLayout(keyboardLayout, leftScaleArrangement, rightScaleArrangement);
  const handMappings = layout.filter(m => m.hand === hand);
  const { setLeftOctave, setRightOctave, isPressed } = useAppStore();

  const currentScale = hand === 'left' ? leftScaleArrangement : rightScaleArrangement;
  const setScale = hand === 'left' ? setLeftScaleArrangement : setRightScaleArrangement;

  const rows = ['upper', 'home', 'lower'] as const;
  const rowMappings = rows.map(row => handMappings.filter(m => m.row === row));

  const getMappingAt = (row: number, col: number) => {
    const rowKeys = rowMappings[row];
    return rowKeys[col] || null;
  };

  const decreaseAction = hand === 'left' ? 'left_hand_decrease_octave' : 'right_hand_decrease_octave';
  const increaseAction = hand === 'left' ? 'left_hand_increase_octave' : 'right_hand_increase_octave';

  const handleDecrement = () => {
    if (hand === 'left') {
      setLeftOctave(Math.max(1, baseOctave - 1));
    } else {
      setRightOctave(Math.max(1, baseOctave - 1));
    }
  };

  const handleIncrement = () => {
    if (hand === 'left') {
      setLeftOctave(Math.min(8, baseOctave + 1));
    } else {
      setRightOctave(Math.min(8, baseOctave + 1));
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
            <select
              className="scale-select-small"
              value={currentScale}
              onChange={(e) => setScale(e.target.value as ScaleArrangement)}
            >
              {Object.entries(SCALE_ARRANGEMENT_DISPLAY).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
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
            <select
              className="scale-select-small"
              value={currentScale}
              onChange={(e) => setScale(e.target.value as ScaleArrangement)}
            >
              {Object.entries(SCALE_ARRANGEMENT_DISPLAY).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="keymouse-grid">
        {[0, 1, 2].map(row => (
          <div key={row} className="keymouse-row">
            {[0, 1, 2, 3].map(col => {
              const mapping = getMappingAt(row, col);
              if (!mapping) return null;
              const pressed = isPressed(mapping.key.toLowerCase());
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
