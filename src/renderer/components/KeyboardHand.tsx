import React from 'react';
import OctaveControl from './OctaveControl';
import type { KeyboardLayout, KeyMapping } from '@shared/types';
import { getLayout, getKeyDisplayKey, semitoneToNote } from '../keyboard/layouts';

interface KeyboardHandProps {
  hand: 'left' | 'right';
  baseOctave: number;
  onOctaveChange: (octave: number) => void;
  pressedKeys: Set<string>;
  keyboardLayout: KeyboardLayout;
  activeNotes: { note: string; octave: number; key: string }[];
  selectedKey: number;
}

function KeyboardHand({
  hand,
  baseOctave,
  onOctaveChange,
  pressedKeys,
  keyboardLayout,
  activeNotes,
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

  return (
    <div className={`hand-panel ${hand}`}>
      <div className="hand-label">{hand === 'left' ? 'Left Hand' : 'Right Hand'}</div>

      <div className="keymouse-grid">
        {[0, 1, 2].map(row => (
          <div key={row} className="keymouse-row">
            {[0, 1, 2, 3].map(col => {
              const mapping = getMappingAt(row, col);
              if (!mapping) return null;
              const pressed = isPressed(mapping.key);
              const noteName = semitoneToNote(mapping.semitone, selectedKey);
              return (
                <button
                  key={mapping.key}
                  className={`key-button ${pressed ? 'pressed' : ''}`}
                >
                  <span className="key-hint">{getKeyDisplayKey(mapping, keyboardLayout)}</span>
                  <span className="note-name">{noteName}</span>
                  <span className="interval">+{mapping.semitone}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <OctaveControl
        octave={baseOctave}
        onChange={onOctaveChange}
        hand={hand}
      />
    </div>
  );
}

export default KeyboardHand;
