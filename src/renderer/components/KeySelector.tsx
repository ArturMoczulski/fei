import React from 'react';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface KeySelectorProps {
  selectedKey: number;
  onKeyChange: (keyIndex: number) => void;
}

function KeySelector({ selectedKey, onKeyChange }: KeySelectorProps) {
  return (
    <div className="key-selector">
      <span className="key-selector-label">Key:</span>
      <div className="key-selector-grid">
        {NOTES.map((note, i) => (
          <button
            key={note}
            className={`key-selector-btn ${selectedKey === i ? 'selected' : ''}`}
            onClick={() => onKeyChange(i)}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}

export default KeySelector;
