import React, { useMemo, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { useTransportStore } from '../hooks/useTransport';
import { getLayout } from '../keyboard/layouts';
import type { KeyMapping } from '@shared/types';

function TrackView() {
  const {
    autoplayNotes,
    keyboardLayout,
    leftOctave,
    rightOctave,
    leftScaleArrangement,
    rightScaleArrangement,
    rearrangeKeysLeft,
    rearrangeKeysRight,
  } = useAppStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const layout = getLayout(
    keyboardLayout,
    leftScaleArrangement,
    rightScaleArrangement,
    rearrangeKeysLeft,
    rearrangeKeysRight
  );

  const soundMappings = useMemo(() => {
    return layout.filter((m: KeyMapping) =>
      m.action.startsWith('left_hand_sound_') || m.action.startsWith('right_hand_sound_')
    );
  }, [layout, leftScaleArrangement, rightScaleArrangement, rearrangeKeysLeft, rearrangeKeysRight]);

  const getMidiFromFrequency = (freq: number): number => {
    return Math.round(12 * Math.log2(freq / 440)) + 69;
  };

  const { minMidi, maxMidi, duration, displayNotes } = useMemo(() => {
    if (autoplayNotes.length === 0) {
      return { minMidi: 48, maxMidi: 72, duration: 10, displayNotes: [] as any[] };
    }

    const notesWithMidi = autoplayNotes.map(n => ({
      ...n,
      midi: n.midi ?? getMidiFromFrequency(n.frequency)
    }));

    const midis = notesWithMidi.map(n => n.midi);
    const min = Math.min(...midis);
    const max = Math.max(...midis);
    const maxTime = Math.max(...notesWithMidi.map(n => n.time + n.duration));

    const padding = 2;
    const displayMinMidi = Math.max(0, min - padding);
    const displayMaxMidi = max + padding;

    const notesForDisplay = notesWithMidi.map(note => {
      const noteInOctave = note.midi % 12;
      const octave = Math.floor(note.midi / 12) - 1;

      const leftMapping = soundMappings.find(m =>
        m.hand === 'left' && m.semitone === noteInOctave
      );
      const rightMapping = soundMappings.find(m =>
        m.hand === 'right' && m.semitone === noteInOctave
      );

      const leftOctaveOffset = octave - leftOctave;
      const rightOctaveOffset = octave - rightOctave;

      let hand: 'left' | 'right' = 'right';
      let matchedKey = '';
      let matchedSemitone = noteInOctave;

      if (leftMapping && rightMapping) {
        if (Math.abs(leftOctaveOffset) <= Math.abs(rightOctaveOffset)) {
          hand = 'left';
          matchedKey = leftMapping.key;
          matchedSemitone = leftMapping.semitone;
        } else {
          hand = 'right';
          matchedKey = rightMapping.key;
          matchedSemitone = rightMapping.semitone;
        }
      } else if (leftMapping) {
        hand = 'left';
        matchedKey = leftMapping.key;
        matchedSemitone = leftMapping.semitone;
      } else if (rightMapping) {
        hand = 'right';
        matchedKey = rightMapping.key;
        matchedSemitone = rightMapping.semitone;
      }

      return {
        ...note,
        hand,
        key: matchedKey,
        semitone: matchedSemitone
      };
    });

    return {
      minMidi: displayMinMidi,
      maxMidi: displayMaxMidi,
      duration: Math.min(maxTime + 2, 60),
      displayNotes: notesForDisplay
    };
  }, [autoplayNotes, soundMappings, leftOctave, rightOctave]);

  const midiRange = maxMidi - minMidi + 1;
  const pixelsPerSecond = 40;
  const pixelsPerMidi = 8;
  const trackWidth = Math.max(600, duration * pixelsPerSecond);
  const trackHeight = Math.max(200, midiRange * pixelsPerMidi);

  const midiToY = (midi: number): number => {
    return (maxMidi - midi) * pixelsPerMidi;
  };

  const getNoteColor = (hand: 'left' | 'right'): string => {
    return hand === 'left' ? '#f472b6' : '#34d399';
  };

  const renderGrid = () => {
    const elements: React.ReactNode[] = [];
    const beatsPerBar = 4;
    const secondsPerBeat = 60 / 120;
    const secondsPerBar = secondsPerBeat * beatsPerBar;

    for (let midi = minMidi; midi <= maxMidi; midi++) {
      const y = midiToY(midi);
      const noteIndex = midi % 12;
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const noteName = noteNames[noteIndex];
      const isOctave = noteIndex === 0;
      const isBlack = noteName.includes('#');

      elements.push(
        <line
          key={`h-${midi}`}
          x1="0"
          y1={y}
          x2={trackWidth}
          y2={y}
          stroke={isOctave ? '#444' : '#222'}
          strokeWidth={isOctave ? 1.5 : 0.5}
        />
      );

      if (isOctave || noteIndex === 0) {
        elements.push(
          <text
            key={`label-${midi}`}
            x="3"
            y={y + 3}
            fill={isBlack ? '#555' : '#888'}
            fontSize="7"
            fontFamily="monospace"
          >
            {noteName}{Math.floor(midi / 12) - 1}
          </text>
        );
      }
    }

    const bars = Math.ceil(duration / secondsPerBar) + 1;
    for (let bar = 0; bar <= bars; bar++) {
      const x = bar * secondsPerBar * pixelsPerSecond;
      elements.push(
        <line
          key={`bar-${bar}`}
          x1={x}
          y1="0"
          x2={x}
          y2={trackHeight}
          stroke="#555"
          strokeWidth="1"
        />
      );
      elements.push(
        <text
          key={`bar-label-${bar}`}
          x={x + 2}
          y="10"
          fill="#777"
          fontSize="8"
          fontFamily="monospace"
        >
          {bar + 1}
        </text>
      );
    }

    const totalBeats = Math.ceil(duration / secondsPerBeat);
    for (let beat = 0; beat <= totalBeats; beat++) {
      const x = beat * secondsPerBeat * pixelsPerSecond;
      if (beat % beatsPerBar === 0) continue;

      elements.push(
        <line
          key={`beat-${beat}`}
          x1={x}
          y1="0"
          x2={x}
          y2={trackHeight}
          stroke="#333"
          strokeWidth="0.5"
        />
      );
    }

    return elements;
  };

  const renderNote = (note: any, index: number) => {
    const x = note.time * pixelsPerSecond;
    const y = midiToY(note.midi);
    const width = Math.max(note.duration * pixelsPerSecond, 3);
    const height = pixelsPerMidi - 1;
    const color = getNoteColor(note.hand);

    return (
      <rect
        key={`note-${note.midi}-${note.time}-${index}`}
        x={x}
        y={y + 1}
        width={width}
        height={height}
        fill={color}
        opacity="0.85"
      />
    );
  };

  const { currentTime } = useTransportStore();

  const playheadX = currentTime * pixelsPerSecond;

  return (
    <div className="track-view-container" style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      <div
        ref={containerRef}
        className="track-view"
        style={{
          width: trackWidth,
          minWidth: '100%',
          height: trackHeight,
          background: '#0a0a0f'
        }}
      >
        <svg
          width={trackWidth}
          height={trackHeight}
          style={{ display: 'block' }}
        >
          {renderGrid()}
          {displayNotes.map((note, i) => renderNote(note, i))}
          <line
            x1={playheadX}
            y1="0"
            x2={playheadX}
            y2={trackHeight}
            stroke="#ff4444"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

export default TrackView;
