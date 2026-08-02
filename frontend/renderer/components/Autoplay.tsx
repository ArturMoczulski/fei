import React, { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { useTransportStore } from '../hooks/useTransport';
import { autoplayAudioEngine } from '../audio/AutoplayAudioEngine';
import { getLayout } from '../keyboard/layouts';

function Autoplay() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    autoplayFile,
    autoplayNotes,
    setAutoplayFile,
    setAutoplayNotes,
    setShowMidiSettings,
    setMidiMetadata,
    keyboardLayout,
    leftOctave,
    rightOctave,
    leftScaleArrangement,
    rightScaleArrangement,
    rearrangeKeysLeft,
    rearrangeKeysRight,
    selectedKey,
  } = useAppStore();

  const { isPlaying, isPaused, currentTime } = useTransportStore();
  const activeKeysRef = useRef<Set<string>>(new Set());
  const scheduledTimeoutsRef = useRef<Map<string, number>>(new Map());
  const triggeredNotesRef = useRef<Set<number>>(new Set());
  const pendingNotesRef = useRef<Set<number>>(new Set());

  const dispatchKeyDown = useCallback((key: string) => {
    if (activeKeysRef.current.has(key)) return;
    activeKeysRef.current.add(key);

    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, []);

  const dispatchKeyUp = useCallback((key: string) => {
    if (!activeKeysRef.current.has(key)) return;
    activeKeysRef.current.delete(key);

    const event = new KeyboardEvent('keyup', {
      key: key,
      code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, []);

  const scheduleTimeout = useCallback((key: string, delay: number, callback: () => void) => {
    const existing = scheduledTimeoutsRef.current.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    const id = window.setTimeout(() => {
      callback();
      scheduledTimeoutsRef.current.delete(key);
    }, delay);
    scheduledTimeoutsRef.current.set(key, id);
  }, []);

  const cleanupAllKeys = useCallback(() => {
    activeKeysRef.current.forEach(key => {
      const event = new KeyboardEvent('keyup', {
        key: key,
        bubbles: true,
      });
      window.dispatchEvent(event);
    });
    activeKeysRef.current.clear();
    scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
    scheduledTimeoutsRef.current.clear();
  }, []);

  useEffect(() => {
    if (!isPlaying || isPaused) {
      cleanupAllKeys();
      triggeredNotesRef.current.clear();
      pendingNotesRef.current.clear();
      return;
    }

    if (autoplayNotes.length === 0) return;

    const layout = getLayout(keyboardLayout, leftScaleArrangement, rightScaleArrangement, rearrangeKeysLeft, rearrangeKeysRight);

    const getNoteInfo = (frequency: number) => {
      const midiNote = Math.round(12 * Math.log2(frequency / 440)) + 69;
      const octave = Math.floor(midiNote / 12) - 1;
      const noteInOctave = midiNote % 12;
      return { octave, noteInOctave };
    };

    const playNote = (frequency: number, duration: number, noteIndex: number) => {
      if (triggeredNotesRef.current.has(noteIndex)) return;
      if (pendingNotesRef.current.has(noteIndex)) return;

      triggeredNotesRef.current.add(noteIndex);
      pendingNotesRef.current.add(noteIndex);

      const { octave, noteInOctave } = getNoteInfo(frequency);

      const leftOctaveDiff = Math.abs(octave - leftOctave);
      const rightOctaveDiff = Math.abs(octave - rightOctave);

      let hand: 'left' | 'right';
      let currentOctave: number;
      let octaveKey: string;

      if (leftOctaveDiff <= rightOctaveDiff) {
        hand = 'left';
        currentOctave = leftOctave;
        octaveKey = octave > currentOctave ? '4' : '3';
      } else {
        hand = 'right';
        currentOctave = rightOctave;
        octaveKey = octave > currentOctave ? '7' : '8';
      }

      const soundMappings = layout.filter(m =>
        m.hand === hand &&
        m.action.startsWith(`${hand}_hand_sound`) &&
        m.semitone === noteInOctave
      );

      if (soundMappings.length === 0) {
        pendingNotesRef.current.delete(noteIndex);
        return;
      }

      const soundMapping = soundMappings[0];
      const notesToShift = octave - currentOctave;

      const uniqueKey = `note-${noteIndex}`;
      let delay = 0;
      const keyDelay = 40;
      const noteDuration = Math.max(duration * 1000 - 100, 80);

      const finalizeNote = () => {
        pendingNotesRef.current.delete(noteIndex);
      };

      if (notesToShift !== 0) {
        for (let i = 0; i < Math.abs(notesToShift); i++) {
          const stepKey = `${uniqueKey}-oct-${i}`;
          dispatchKeyDown(octaveKey);
          scheduleTimeout(stepKey, delay + keyDelay, () => {
            dispatchKeyUp(octaveKey);
          });
          delay += keyDelay * 2;
        }
      }

      const noteKey = `${uniqueKey}-sound`;
      dispatchKeyDown(soundMapping.key);
      scheduleTimeout(noteKey, delay + noteDuration, () => {
        dispatchKeyUp(soundMapping.key);
        finalizeNote();
      });
    };

    const timeWindow = 0.15;
    autoplayNotes.forEach((note, index) => {
      if (note.time >= currentTime && note.time < currentTime + timeWindow) {
        playNote(note.frequency, note.duration, index);
      }
    });
  }, [isPlaying, isPaused, currentTime, autoplayNotes, keyboardLayout, leftOctave, rightOctave, leftScaleArrangement, rightScaleArrangement, rearrangeKeysLeft, rearrangeKeysRight, cleanupAllKeys, dispatchKeyDown, dispatchKeyUp, scheduleTimeout]);

  useEffect(() => {
    return () => {
      cleanupAllKeys();
    };
  }, [cleanupAllKeys]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAutoplayFile(file);
    const { notes } = await autoplayAudioEngine.loadMidi(file);
    setAutoplayNotes(notes);

    const metadata = await autoplayAudioEngine.loadMidiMetadata(file);
    setMidiMetadata(metadata);
    setShowMidiSettings(true);
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
    </div>
  );
}

export default Autoplay;
