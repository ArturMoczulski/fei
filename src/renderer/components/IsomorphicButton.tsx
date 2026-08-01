import React from 'react';

interface IsomorphicButtonProps {
  note: string;
  octave: number;
  isBlack: boolean;
  isPressed: boolean;
  keyHint: string;
}

function IsomorphicButton({ note, octave, isBlack, isPressed, keyHint }: IsomorphicButtonProps) {
  return (
    <button className={`key-button ${isBlack ? 'black' : 'white'} ${isPressed ? 'pressed' : ''}`}>
      <span className="note">{note}</span>
      <span className="octave">{octave}</span>
      {keyHint && <span className="key-hint">{keyHint}</span>}
    </button>
  );
}

export default IsomorphicButton;
