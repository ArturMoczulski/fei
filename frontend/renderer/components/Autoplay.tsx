import React, { useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { autoplayAudioEngine, AutoplayNote } from '../audio/AutoplayAudioEngine';
import { getLayout } from '../keyboard/layouts';
import { useKeyboardEvents } from '../hooks/useKeyboardEvents';

function Autoplay() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    autoplayFile,
    autoplayNotes,
    autoplayIsPlaying,
    autoplayIsPaused,
    setAutoplayFile,
    setAutoplayNotes,
    setAutoplayIsPlaying,
    setAutoplayIsPaused,
    keyboardLayout,
    leftOctave,
    rightOctave,
    leftScaleArrangement,
    rightScaleArrangement,
    rearrangeKeysLeft,
    rearrangeKeysRight,
    selectedKey,
  } = useAppStore();

  const layout = getLayout(keyboardLayout, leftScaleArrangement, rightScaleArrangement, rearrangeKeysLeft, rearrangeKeysRight);

  const frequencyToKey = (frequency: number): { key: string; hand: 'left' | 'right' } | null => {
    const noteIndex = Math.round(12 * Math.log2(frequency / 440)) + 69;
    const octave = Math.floor(noteIndex / 12) - 1;
    const noteInOctave = noteIndex % 12;

    const leftOctaveOffset = octave - leftOctave;
    const rightOctaveOffset = octave - rightOctave;

    const findMapping = (targetOctaveOffset: number) => {
      for (const mapping of layout) {
        if (mapping.hand === 'left' && mapping.action.startsWith('left_hand_sound')) {
          const semitone = mapping.semitone + (targetOctaveOffset * 12);
          if (semitone === noteInOctave + (targetOctaveOffset * 12)) {
            return mapping;
          }
        }
      }
      return null;
    };

    if (Math.abs(leftOctaveOffset) <= Math.abs(rightOctaveOffset)) {
      const mapping = layout.find(m =>
        m.hand === 'left' &&
        m.action.startsWith('left_hand_sound') &&
        m.semitone === noteInOctave
      );
      if (mapping) {
        return { key: mapping.key, hand: 'left' };
      }
    }

    const mapping = layout.find(m =>
      m.hand === 'right' &&
      m.action.startsWith('right_hand_sound') &&
      m.semitone === noteInOctave
    );
    if (mapping) {
      return { key: mapping.key, hand: 'right' };
    }

    const leftMapping = layout.find(m =>
      m.hand === 'left' &&
      m.action.startsWith('left_hand_sound') &&
      m.semitone === noteInOctave
    );
    if (leftMapping) {
      return { key: leftMapping.key, hand: 'left' };
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAutoplayFile(file);
    const { notes } = await autoplayAudioEngine.loadMidi(file);
    setAutoplayNotes(notes);
  };

  const handlePlay = async () => {
    alert('Play button clicked!');
    if (autoplayNotes.length === 0) return;

    if (autoplayIsPlaying) {
      if (autoplayIsPaused) {
        await autoplayAudioEngine.resume();
        setAutoplayIsPaused(false);
      } else {
        autoplayAudioEngine.pause();
        setAutoplayIsPaused(true);
      }
    } else {
      await autoplayAudioEngine.play(autoplayNotes, frequencyToKey);
      setAutoplayIsPlaying(true);
      setAutoplayIsPaused(false);
    }
  };

  const handleStop = () => {
    autoplayAudioEngine.stop();
    setAutoplayIsPlaying(false);
    setAutoplayIsPaused(false);
  };

  return (
    <div className="autoplay">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mid,.midi"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <button
        className="autoplay-btn"
        onClick={() => fileInputRef.current?.click()}
        title="Load MIDI file"
      >
        📁
      </button>

      {autoplayFile && (
        <span className="autoplay-filename">
          {autoplayFile.name}
        </span>
      )}

      {autoplayNotes.length > 0 && (
        <>
          <button
            className={`autoplay-btn ${autoplayIsPlaying && !autoplayIsPaused ? 'playing' : ''}`}
            onClick={handlePlay}
            title={autoplayIsPlaying && !autoplayIsPaused ? 'Pause' : 'Play'}
          >
            {autoplayIsPlaying && !autoplayIsPaused ? '⏸' : '▶'}
          </button>

          {autoplayIsPlaying && (
            <button
              className="autoplay-btn"
              onClick={handleStop}
              title="Stop"
            >
              ⏹
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Autoplay;
