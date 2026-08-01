import React, { useState, useEffect } from 'react';
import { metronomeAudioEngine } from '../audio/MetronomeAudioEngine';

interface MetronomeProps {
  visible: boolean;
}

const TEMPO_PRESETS = [
  { label: 'Largo', value: 50 },
  { label: 'Adagio', value: 70 },
  { label: 'Andante', value: 90 },
  { label: 'Moderato', value: 110 },
  { label: 'Allegro', value: 130 },
  { label: 'Presto', value: 160 },
  { label: 'Prestissimo', value: 180 },
];

function Metronome({ visible }: MetronomeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [bpm, setBpm] = useState(120);

  useEffect(() => {
    metronomeAudioEngine.init();
  }, []);

  const toggleMetronome = async () => {
    await metronomeAudioEngine.init();
    if (isRunning) {
      metronomeAudioEngine.stop();
      setIsRunning(false);
    } else {
      metronomeAudioEngine.start(bpm);
      setIsRunning(true);
    }
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBpm = Number(e.target.value);
    setBpm(newBpm);
    metronomeAudioEngine.setBpm(newBpm);
    if (isRunning) {
      metronomeAudioEngine.stop();
      metronomeAudioEngine.start(newBpm);
    }
  };

  const handleBpmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Math.min(240, Math.max(20, Number(e.target.value)));
    setBpm(newBpm);
    metronomeAudioEngine.setBpm(newBpm);
  };

  if (!visible) return null;

  return (
    <div className="metronome">
      <button
        className={`metronome-btn ${isRunning ? 'running' : ''}`}
        onClick={toggleMetronome}
        title={isRunning ? 'Stop Metronome' : 'Start Metronome'}
      >
        ♩
      </button>

      <select
        className="metronome-preset-select"
        value={bpm}
        onChange={handleTempoChange}
      >
        {TEMPO_PRESETS.map(preset => (
          <option key={preset.value} value={preset.value}>
            {preset.label} ({preset.value})
          </option>
        ))}
      </select>

      <input
        type="number"
        className="metronome-bpm-input"
        value={bpm}
        onChange={handleBpmInput}
        min={20}
        max={240}
      />
      <span className="metronome-bpm-label">BPM</span>
    </div>
  );
}

export default Metronome;
