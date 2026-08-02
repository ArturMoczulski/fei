import { Midi } from '@tonejs/midi';

export interface AutoplayNote {
  key: string;
  hand: 'left' | 'right';
  time: number;
  duration: number;
  frequency: number;
  midi?: number;
}

export interface MidiMetadata {
  name: string;
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  keySignature: string | null;
  duration: number;
  trackCount: number;
}

export interface AutoplayState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  notes: AutoplayNote[];
}

type AutoplayCallback = (notes: AutoplayNote[]) => void;

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface ScheduledNote {
  key: string;
  hand: 'left' | 'right';
  keyDownTimeoutId: number;
  keyUpTimeoutId: number;
  oscillator?: OscillatorNode;
  gainNode?: GainNode;
  startTime: number;
  duration: number;
  scheduledTime: number;
  originalNote: AutoplayNote;
}

class AutoplayAudioEngine {
  private midi: Midi | null = null;
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private isPaused = false;
  private startTime = 0;
  private pausedTime = 0;
  private scheduledNotes: ScheduledNote[] = [];
  private onNotesScheduled: AutoplayCallback | null = null;
  private pressedKeys: Set<string> = new Set();
  private allNotes: AutoplayNote[] = [];
  private keyMappingFn: ((frequency: number) => { key: string; hand: 'left' | 'right' } | null) | null = null;
  private metadata: MidiMetadata | null = null;
  private onPlayRequest: (() => void) | null = null;

  async loadMidiMetadata(file: File): Promise<MidiMetadata> {
    const arrayBuffer = await file.arrayBuffer();
    this.midi = new Midi(arrayBuffer);

    const header = this.midi.header;
    const tempo = header.tempos.length > 0 ? Math.round(header.tempos[0].bpm) : 120;
    const timeSignature = header.timeSignatures.length > 0
      ? { numerator: header.timeSignatures[0].timeSignature[0], denominator: header.timeSignatures[0].timeSignature[1] }
      : { numerator: 4, denominator: 4 };
    const keySignature = header.keySignatures.length > 0
      ? header.keySignatures[0].key
      : null;

    this.metadata = {
      name: this.midi.name || file.name,
      tempo,
      timeSignature,
      keySignature,
      duration: this.midi.duration,
      trackCount: this.midi.tracks.length,
    };

    return this.metadata;
  }

  getMetadata(): MidiMetadata | null {
    return this.metadata;
  }

  async loadMidi(file: File): Promise<{ duration: number; notes: AutoplayNote[] }> {
    const arrayBuffer = await file.arrayBuffer();
    this.midi = new Midi(arrayBuffer);

    const notes: AutoplayNote[] = [];
    const duration = this.midi.duration;

    for (const track of this.midi.tracks) {
      for (const note of track.notes) {
        notes.push({
          key: '',
          hand: 'right',
          time: note.time,
          duration: note.duration,
          frequency: midiToFrequency(note.midi),
          midi: note.midi,
        });
      }
    }

    notes.sort((a, b) => a.time - b.time);

    return { duration, notes };
  }

  setOnNotesScheduled(callback: AutoplayCallback | null) {
    this.onNotesScheduled = callback;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private dispatchKeyDown(key: string) {
    if (this.pressedKeys.has(key)) return;

    this.pressedKeys.add(key);
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  private dispatchKeyUp(key: string) {
    if (!this.pressedKeys.has(key)) return;

    this.pressedKeys.delete(key);
    const event = new KeyboardEvent('keyup', {
      key: key,
      code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  private scheduleNote(note: AutoplayNote, mapping: { key: string; hand: 'left' | 'right' }, offset: number) {
    const ctx = this.getAudioContext();
    const noteStartTime = this.startTime + (note.time - offset);
    const noteEndTime = noteStartTime + note.duration;

    if (noteEndTime <= ctx.currentTime) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(note.frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteEndTime);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(noteStartTime);
    oscillator.stop(noteEndTime);

    const keyDownTimeoutId = window.setTimeout(() => {
      this.dispatchKeyDown(mapping.key);
    }, (noteStartTime - ctx.currentTime) * 1000);

    const keyUpTimeoutId = window.setTimeout(() => {
      this.dispatchKeyUp(mapping.key);
    }, (noteEndTime - ctx.currentTime) * 1000);

    this.scheduledNotes.push({
      key: mapping.key,
      hand: mapping.hand,
      keyDownTimeoutId,
      keyUpTimeoutId,
      oscillator,
      gainNode,
      startTime: noteStartTime,
      duration: note.duration,
      scheduledTime: note.time,
      originalNote: note,
    });
  }

  async play(
    notes: AutoplayNote[],
    keyMapping: (frequency: number) => { key: string; hand: 'left' | 'right' } | null,
    startOffset = 0
  ) {
    if (this.isPlaying && !this.isPaused) {
      this.stop();
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.startTime = this.getAudioContext().currentTime;
    this.scheduledNotes = [];
    this.pressedKeys.clear();
    this.allNotes = notes;
    this.keyMappingFn = keyMapping;

    for (const note of notes) {
      const mapping = keyMapping(note.frequency);
      if (!mapping) continue;
      this.scheduleNote(note, mapping, startOffset);
    }

    const scheduledNotesWithKeys = this.scheduledNotes.map(sn => ({
      ...sn.originalNote,
      key: sn.key,
      hand: sn.hand,
    }));

    if (this.onNotesScheduled) {
      this.onNotesScheduled(scheduledNotesWithKeys);
    }
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;

    this.isPaused = true;
    this.pausedTime = this.getAudioContext().currentTime - this.startTime;

    for (const note of this.scheduledNotes) {
      clearTimeout(note.keyDownTimeoutId);
      clearTimeout(note.keyUpTimeoutId);

      if (note.oscillator) {
        note.oscillator.stop();
        note.oscillator.disconnect();
      }
      if (note.gainNode) {
        note.gainNode.disconnect();
      }
    }

    for (const key of this.pressedKeys) {
      this.dispatchKeyUp(key);
    }
    this.pressedKeys.clear();
    this.scheduledNotes = [];
  }

  async resume() {
    if (!this.isPlaying || !this.isPaused) return;

    this.isPaused = false;
    this.startTime = this.getAudioContext().currentTime - this.pausedTime;
    this.scheduledNotes = [];

    for (const note of this.allNotes) {
      if (note.time < this.pausedTime) continue;
      const mapping = this.keyMappingFn?.(note.frequency);
      if (!mapping) continue;
      this.scheduleNote(note, mapping, this.pausedTime);
    }

    for (const key of this.pressedKeys) {
      this.dispatchKeyUp(key);
    }
    this.pressedKeys.clear();
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.pausedTime = 0;

    for (const note of this.scheduledNotes) {
      clearTimeout(note.keyDownTimeoutId);
      clearTimeout(note.keyUpTimeoutId);

      if (note.oscillator) {
        try {
          note.oscillator.stop();
          note.oscillator.disconnect();
        } catch (e) {
        }
      }
      if (note.gainNode) {
        try {
          note.gainNode.disconnect();
        } catch (e) {
        }
      }
    }

    for (const key of this.pressedKeys) {
      this.dispatchKeyUp(key);
    }
    this.pressedKeys.clear();
    this.scheduledNotes = [];
    this.allNotes = [];
    this.keyMappingFn = null;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  getCurrentTime(): number {
    if (!this.isPlaying || !this.audioContext) {
      return 0;
    }
    if (this.isPaused) {
      return this.pausedTime;
    }
    return this.audioContext.currentTime - this.startTime;
  }

  togglePlayPause(): void {
    if (!this.isPlaying) {
      if (this.onPlayRequest) {
        this.onPlayRequest();
      }
      return;
    }
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  setOnPlayRequest(callback: () => void): void {
    this.onPlayRequest = callback;
  }
}

export const autoplayAudioEngine = new AutoplayAudioEngine();
