import React, { useState, useEffect } from 'react';
import { metronomeAudioEngine, TimeSignature } from '../audio/MetronomeAudioEngine';
import { useAppStore } from '../store/appStore';

interface MetronomeProps {
  visible: boolean;
}

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
  const bpm = useAppStore(state => state.metronomeBpm);
  const timeSignature = useAppStore(state => state.metronomeTimeSignature);
  const setMetronomeBpm = useAppStore(state => state.setMetronomeBpm);
  const setMetronomeTimeSignature = useAppStore(state => state.setMetronomeTimeSignature);

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

  const handleBpmInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Math.min(240, Math.max(20, Number(e.target.value)));
    setMetronomeBpm(newBpm);
    await metronomeAudioEngine.setBpm(newBpm);
  };

  const handleTimeSignatureChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [num, denom] = e.target.value.split('/').map(Number);
    const newTimeSignature: TimeSignature = { numerator: num, denominator: denom };
    setMetronomeTimeSignature(newTimeSignature);
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
