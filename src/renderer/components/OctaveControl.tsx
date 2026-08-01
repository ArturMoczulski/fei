import React from 'react';

interface OctaveControlProps {
  octave: number;
  onChange: (octave: number) => void;
  hand: 'left' | 'right';
}

function OctaveControl({ octave, onChange, hand }: OctaveControlProps) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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
      <button
        className="octave-btn"
        onClick={decrementOctave}
        disabled={octave <= 1}
      >
        ▼
      </button>
      <span className="octave-display">C{octave}</span>
      <button
        className="octave-btn"
        onClick={incrementOctave}
        disabled={octave >= 7}
      >
        ▲
      </button>
    </div>
  );
}

export default OctaveControl;
