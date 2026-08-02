import React from 'react';
import { useAppStore } from '../store/appStore';
import { metronomeAudioEngine } from '../audio/MetronomeAudioEngine';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function MidiSettingsModal() {
  const {
    showMidiSettings,
    midiMetadata,
    setShowMidiSettings,
    setSelectedKey,
    setMetronomeBpm,
    setMetronomeTimeSignature,
  } = useAppStore();

  if (!showMidiSettings || !midiMetadata) return null;

  const keySignatureIndex = midiMetadata.keySignature
    ? NOTE_NAMES.indexOf(midiMetadata.keySignature.replace('m', ''))
    : null;

  const handleApply = async () => {
    if (keySignatureIndex !== null) {
      setSelectedKey(keySignatureIndex);
    }

    setMetronomeBpm(midiMetadata.tempo);
    setMetronomeTimeSignature(midiMetadata.timeSignature);
    await metronomeAudioEngine.setBpm(midiMetadata.tempo);
    await metronomeAudioEngine.setTimeSignature(midiMetadata.timeSignature);

    setShowMidiSettings(false);
  };

  const handleSkip = () => {
    setShowMidiSettings(false);
  };

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div className="modal midi-settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">MIDI File Loaded</h2>

        <div className="midi-info">
          <div className="midi-info-name">{midiMetadata.name}</div>

          <div className="midi-info-row">
            <span className="midi-info-label">Tempo:</span>
            <span className="midi-info-value">{midiMetadata.tempo} BPM</span>
          </div>

          <div className="midi-info-row">
            <span className="midi-info-label">Time Signature:</span>
            <span className="midi-info-value">
              {midiMetadata.timeSignature.numerator}/{midiMetadata.timeSignature.denominator}
            </span>
          </div>

          {midiMetadata.keySignature && (
            <div className="midi-info-row">
              <span className="midi-info-label">Key:</span>
              <span className="midi-info-value">{midiMetadata.keySignature}</span>
            </div>
          )}

          <div className="midi-info-row">
            <span className="midi-info-label">Duration:</span>
            <span className="midi-info-value">{midiMetadata.duration.toFixed(1)}s</span>
          </div>

          <div className="midi-info-row">
            <span className="midi-info-label">Tracks:</span>
            <span className="midi-info-value">{midiMetadata.trackCount}</span>
          </div>
        </div>

        <div className="midi-settings-actions">
          <button className="midi-settings-btn apply" onClick={handleApply}>
            Apply Settings
          </button>
          <button className="midi-settings-btn skip" onClick={handleSkip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export default MidiSettingsModal;
