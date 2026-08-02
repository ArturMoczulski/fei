import React from 'react';
import { useTransportStore } from '../hooks/useTransport';

function Transport() {
  const {
    isPlaying,
    isPaused,
    bpm,
    timeSignature,
    position,
    togglePlayPause,
    stop,
  } = useTransportStore();

  const formatPosition = () => {
    const { bars, beats, ticks } = position;
    return `${String(bars).padStart(3, '0')}:${beats}:${String(ticks).padStart(3, '0')}`;
  };

  return (
    <div className="transport">
      <button
        className={`transport-btn ${isPlaying && !isPaused ? 'playing' : ''}`}
        onClick={togglePlayPause}
        title={isPlaying && !isPaused ? 'Pause' : 'Play'}
      >
        {isPlaying && !isPaused ? '⏸' : '▶'}
      </button>

      <button
        className="transport-btn"
        onClick={stop}
        title="Stop"
      >
        ⏹
      </button>

      <span className="transport-bpm">{bpm} BPM</span>

      <span className="transport-time-sig">
        {timeSignature.numerator}/{timeSignature.denominator}
      </span>

      <span className="transport-position">{formatPosition()}</span>
    </div>
  );
}

export default Transport;
