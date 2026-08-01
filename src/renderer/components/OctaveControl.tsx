import React from 'react';
import { KeyBindingTooltip } from './KeyBindingTooltip';
import type { KeyboardLayout } from '@shared/types';

interface OctaveControlProps {
  octave: number;
  onChange: (octave: number) => void;
  hand: 'left' | 'right';
  keyboardLayout: KeyboardLayout;
}

function OctaveControl({ octave, onChange, hand, keyboardLayout }: OctaveControlProps) {
  const decreaseAction = hand === 'left' ? 'left_hand_decrease_octave' : 'right_hand_decrease_octave';
  const increaseAction = hand === 'left' ? 'left_hand_increase_octave' : 'right_hand_increase_octave';

  const decrementOctave = () => {
    if (octave > 1) {
      onChange(octave - 1);
    }
  };

  const incrementOctave = () => {
    if (octave < 7) {
      onChange(octave + 1);
    }
  };

  return (
    <div className="octave-control">
      <KeyBindingTooltip actions={[decreaseAction]} keyboardLayout={keyboardLayout}>
        <button
          className="octave-btn"
          onClick={decrementOctave}
          disabled={octave <= 1}
        >
          ▼
        </button>
      </KeyBindingTooltip>
      <span className="octave-display">C{octave}</span>
      <KeyBindingTooltip actions={[increaseAction]} keyboardLayout={keyboardLayout}>
        <button
          className="octave-btn"
          onClick={incrementOctave}
          disabled={octave >= 7}
        >
          ▲
        </button>
      </KeyBindingTooltip>
    </div>
  );
}

export default OctaveControl;
