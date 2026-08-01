import React from 'react';
import { useAppStore } from '../store/appStore';
import { audioEngine } from '../audio/AudioEngine';

function SettingsModal() {
  const keyboardLayout = useAppStore(state => state.keyboardLayout);
  const volume = useAppStore(state => state.volume);
  const showSettings = useAppStore(state => state.showSettings);
  const setKeyboardLayout = useAppStore(state => state.setKeyboardLayout);
  const setVolume = useAppStore(state => state.setVolume);
  const toggleSettings = useAppStore(state => state.toggleSettings);

  if (!showSettings) return null;

  return (
    <div className="modal-overlay" onClick={toggleSettings}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Settings</h2>

        <div className="modal-section">
          <div className="modal-section-title">Keyboard</div>
          <div className="modal-row">
            <span>Layout</span>
            <select
              className="settings-select"
              value={keyboardLayout}
              onChange={(e) => setKeyboardLayout(e.target.value as 'qwerty' | 'dvorak')}
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
                onChange={(e) => setVolume(Number(e.target.value))}
              />
              <span style={{ fontSize: '12px', minWidth: '40px' }}>{volume}dB</span>
            </div>
          </div>
          <div className="modal-row">
            <span>Panic (Stop All)</span>
            <button className="panic-settings-btn" onClick={() => audioEngine.panic()}>
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

        <button className="modal-close" onClick={toggleSettings}>
          Close
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
