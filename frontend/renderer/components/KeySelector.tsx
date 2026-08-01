import React from 'react';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface KeySelectorProps {
  selectedKey: number;
  onChange: (keyIndex: number) => void;
}

function KeySelector({ selectedKey, onChange }: KeySelectorProps) {
  return (
    <div className="key-selector">
      <span className="key-selector-label">Key:</span>
      <select
        className="key-selector-dropdown"
        value={selectedKey}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {NOTES.map((note, i) => (
          <option key={note} value={i}>
            {note}
          </option>
        ))}
      </select>
    </div>
  );
}

export default KeySelector;
