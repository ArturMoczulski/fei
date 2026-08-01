import React, { useState, useEffect } from 'react';
import { metronomeAudioEngine, TimeSignature } from '../audio/MetronomeAudioEngine';

interface MetronomeProps {
  visible: boolean;
}

const TEMPO_PRESETS = [
  { label: 'Largo', value: 50 },
  { label: 'Adagio', value: 70 },
  { label: 'Andante', value: 90 },
  { label: 'Moderato', value: 110 },
  { label: 'Allegro', value: 130 },
  { label: 'Vivace', value: 145 },
  { label: 'Presto', value: 170 },
  { label: 'Prestissimo', value: 200 },
];

const TIME_SIGNATURES: TimeSignature[] = [
  { numerator: 2, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 4, denominator: 4 },
  { numerator: 5, denominator: 4 },
  { numerator: 6, denominator: 8 },
  { numerator: 7, denominator: 8 },
  { numerator: 9, denominator: 8 },
  { numerator: 12, denominator: 8 },
];

function Metronome({ visible }: MetronomeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [bpm, setBpm] = useState(110);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({ numerator: 4, denominator: 4 });

  useEffect(() => {
    metronomeAudioEngine.init();
  }, []);

  const toggleMetronome = async () => {
    if (isRunning) {
      metronomeAudioEngine.stop();
      setIsRunning(false);
    } else {
      await metronomeAudioEngine.start(bpm, timeSignature);
      setIsRunning(true);
    }
  };

  const handleTempoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBpm = Number(e.target.value);
    setBpm(newBpm);
    await metronomeAudioEngine.setBpm(newBpm);
  };

  const handleBpmInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Math.min(240, Math.max(20, Number(e.target.value)));
    setBpm(newBpm);
    await metronomeAudioEngine.setBpm(newBpm);
  };

  const handleTimeSignatureChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [num, denom] = e.target.value.split('/').map(Number);
    const newTimeSignature: TimeSignature = { numerator: num, denominator: denom };
    setTimeSignature(newTimeSignature);
    await metronomeAudioEngine.setTimeSignature(newTimeSignature);
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

      <select
        className="metronome-time-signature-select"
        value={`${timeSignature.numerator}/${timeSignature.denominator}`}
        onChange={handleTimeSignatureChange}
      >
        {TIME_SIGNATURES.map(ts => (
          <option key={`${ts.numerator}/${ts.denominator}`} value={`${ts.numerator}/${ts.denominator}`}>
            {ts.numerator}/{ts.denominator}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Metronome;
