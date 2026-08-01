import * as Tone from 'tone';

class AudioEngine {
  private synths: Map<string, Tone.PolySynth> = new Map();
  private masterVolume: number = -6;
  private initialized: boolean = false;
  private activeNotes: Map<string, Set<number>> = new Map();

  async init(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    const leftSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
      },
      maxPolyphony: 128,
    }).toDestination();

    const rightSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
      },
      maxPolyphony: 128,
    }).toDestination();

    leftSynth.volume.value = this.masterVolume;
    rightSynth.volume.value = this.masterVolume;

    this.synths.set('left', leftSynth);
    this.synths.set('right', rightSynth);
    this.activeNotes.set('left', new Set());
    this.activeNotes.set('right', new Set());

    this.initialized = true;
  }

  playNote(frequency: number, hand: 'left' | 'right'): void {
    if (!this.initialized) return;

    const synth = this.synths.get(hand);
    const notes = this.activeNotes.get(hand);
    if (!synth || !notes) return;

    if (notes.has(frequency)) {
      synth.triggerRelease(frequency);
      notes.delete(frequency);
    }

    synth.triggerAttack(frequency);
    notes.add(frequency);
  }

  stopNote(frequency: number, hand: 'left' | 'right'): void {
    if (!this.initialized) return;

    const synth = this.synths.get(hand);
    const notes = this.activeNotes.get(hand);
    if (!synth || !notes) return;

    if (!notes.has(frequency)) return;

    synth.triggerRelease(frequency);
    notes.delete(frequency);
  }

  stopAllNotes(): void {
    this.synths.forEach((synth, hand) => {
      synth.releaseAll();
    });
    this.activeNotes.forEach(notes => notes.clear());
  }

  panic(): void {
    this.synths.forEach((synth) => {
      try {
        synth.releaseAll();
        synth.reset();
      } catch (e) {
        // Ignore errors
      }
    });
    this.activeNotes.forEach(notes => notes.clear());
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    } catch (e) {
      // Ignore errors
    }
  }

  setVolume(value: number): void {
    this.masterVolume = value;
    this.synths.forEach(synth => {
      synth.volume.value = value;
    });
  }

  getVolume(): number {
    return this.masterVolume;
  }

  dispose(): void {
    this.stopAllNotes();
    this.synths.forEach(synth => synth.dispose());
    this.synths.clear();
    this.activeNotes.clear();
    this.initialized = false;
  }
}

export const audioEngine = new AudioEngine();
