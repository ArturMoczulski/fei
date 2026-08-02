import { describe, it, expect } from 'vitest';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function parseKeySignature(keySignature: string | null): number | null {
  return keySignature
    ? NOTE_NAMES.indexOf(keySignature.replace('m', ''))
    : null;
}

describe('MidiSettingsModal key signature parsing', () => {
  describe('parseKeySignature', () => {
    it('should return null for null key signature', () => {
      expect(parseKeySignature(null)).toBeNull();
    });

    it('should parse C major key signature', () => {
      expect(parseKeySignature('C')).toBe(0);
    });

    it('should parse A minor key signature (removes m, returns A index)', () => {
      expect(parseKeySignature('Am')).toBe(9);
    });

    it('should parse G major key signature', () => {
      expect(parseKeySignature('G')).toBe(7);
    });

    it('should parse F# major key signature', () => {
      expect(parseKeySignature('F#')).toBe(6);
    });

    it('should parse D minor key signature', () => {
      expect(parseKeySignature('Dm')).toBe(2);
    });

    it('should parse E major key signature', () => {
      expect(parseKeySignature('E')).toBe(4);
    });

    it('should parse all chromatic notes', () => {
      NOTE_NAMES.forEach((note, index) => {
        expect(parseKeySignature(note)).toBe(index);
      });
    });

    it('should handle sharp notes without m suffix', () => {
      expect(parseKeySignature('C#')).toBe(1);
      expect(parseKeySignature('D#')).toBe(3);
      expect(parseKeySignature('F#')).toBe(6);
      expect(parseKeySignature('G#')).toBe(8);
      expect(parseKeySignature('A#')).toBe(10);
    });

    it('should handle minor keys with sharps', () => {
      expect(parseKeySignature('A#m')).toBe(10);
    });

    it('should return -1 (via indexOf) for unrecognized keys', () => {
      expect(parseKeySignature('Bb')).toBe(-1);
    });
  });
});
