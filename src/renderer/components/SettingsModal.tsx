import React from 'react';
import type { KeyboardLayout } from '@shared/types';

interface SettingsModalProps {
  keyboardLayout: KeyboardLayout;
  volume: number;
  onLayoutChange: (layout: KeyboardLayout) => void;
  onVolumeChange: (volume: number) => void;
  onPanic: () => void;
  onClose: () => void;
}

function SettingsModal({
  keyboardLayout,
  volume,
  onLayoutChange,
  onVolumeChange,
  onPanic,
  onClose,
}: SettingsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Settings</h2>

        <div className="modal-section">
          <div className="modal-section-title">Keyboard</div>
          <div className="modal-row">
            <span>Layout</span>
            <select
              className="settings-select"
              value={keyboardLayout}
              onChange={(e) => onLayoutChange(e.target.value as KeyboardLayout)}
            >
              <option value="qwerty">QWERTY</option>
              <option value="dvorak">Dvorak</option>
            </select>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">Audio</div>
          <div className="modal-row">
            <span>Master Volume</span>
            <div className="volume-control">
              <input
                type="range"
                className="volume-slider"
                min="-40"
                max="0"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
              />
              <span style={{ fontSize: '12px', minWidth: '40px' }}>{volume}dB</span>
            </div>
          </div>
          <div className="modal-row">
            <span>Panic (Stop All)</span>
            <button className="panic-settings-btn" onClick={onPanic}>
              ■
            </button>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">About</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Fei is an isomorphic split keyboard instrument. Use your computer keyboard
            to play musical notes. The keyboard is split into left and right hand zones,
            each with independent octave control.
          </div>
        </div>

        <button className="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
