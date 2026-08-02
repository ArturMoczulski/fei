import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutoplayNote } from '../../renderer/audio/AutoplayAudioEngine';

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

describe('AutoplayAudioEngine helpers', () => {
  describe('midiToFrequency', () => {
    it('should return 440 for MIDI note 69 (A4)', () => {
      expect(midiToFrequency(69)).toBeCloseTo(440, 1);
    });

    it('should return 880 for MIDI note 81 (A5)', () => {
      expect(midiToFrequency(81)).toBeCloseTo(880, 1);
    });

    it('should return 220 for MIDI note 57 (A3)', () => {
      expect(midiToFrequency(57)).toBeCloseTo(220, 1);
    });

    it('should return 261.63 for MIDI note 60 (C4)', () => {
      expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
    });

    it('should return correct frequency for various notes', () => {
      expect(midiToFrequency(60)).toBeCloseTo(261.625565, 2);
      expect(midiToFrequency(72)).toBeCloseTo(523.25, 2);
      expect(midiToFrequency(48)).toBeCloseTo(130.81, 2);
    });
  });
});

describe('AutoplayNote interface', () => {
  it('should accept valid note structure', () => {
    const note: AutoplayNote = {
      key: 'a',
      hand: 'right',
      time: 0,
      duration: 1,
      frequency: 440,
    };
    expect(note.key).toBe('a');
    expect(note.hand).toBe('right');
    expect(note.time).toBe(0);
    expect(note.duration).toBe(1);
    expect(note.frequency).toBe(440);
  });

  it('should accept note with optional midi property', () => {
    const note: AutoplayNote = {
      key: 'a',
      hand: 'right',
      time: 0,
      duration: 1,
      frequency: 440,
      midi: 69,
    };
    expect(note.midi).toBe(69);
  });

  it('should allow empty key for unloaded notes', () => {
    const note: AutoplayNote = {
      key: '',
      hand: 'right',
      time: 0,
      duration: 1,
      frequency: 440,
    };
    expect(note.key).toBe('');
  });
});

describe('AutoplayNote sorting', () => {
  it('should sort notes by time', () => {
    const notes: AutoplayNote[] = [
      { key: 'a', hand: 'right', time: 2, duration: 1, frequency: 440 },
      { key: 'b', hand: 'right', time: 0, duration: 1, frequency: 523 },
      { key: 'c', hand: 'right', time: 1, duration: 1, frequency: 587 },
    ];

    const sorted = [...notes].sort((a, b) => a.time - b.time);

    expect(sorted[0].key).toBe('b');
    expect(sorted[1].key).toBe('c');
    expect(sorted[2].key).toBe('a');
  });
});

describe('Frequency to key mapping logic', () => {
  it('should calculate MIDI note from frequency', () => {
    const frequencyToMidi = (freq: number) => Math.round(12 * Math.log2(freq / 440)) + 69;

    expect(frequencyToMidi(440)).toBe(69);
    expect(frequencyToMidi(880)).toBe(81);
    expect(frequencyToMidi(261.63)).toBe(60);
  });

  it('should extract octave from MIDI note', () => {
    const midiToOctave = (midi: number) => Math.floor(midi / 12) - 1;

    expect(midiToOctave(60)).toBe(4);
    expect(midiToOctave(69)).toBe(4);
    expect(midiToOctave(72)).toBe(5);
    expect(midiToOctave(48)).toBe(3);
  });

  it('should extract note within octave from MIDI note', () => {
    const midiToNoteInOctave = (midi: number) => midi % 12;

    expect(midiToNoteInOctave(60)).toBe(0);
    expect(midiToNoteInOctave(69)).toBe(9);
    expect(midiToNoteInOctave(72)).toBe(0);
    expect(midiToNoteInOctave(74)).toBe(2);
  });
});
