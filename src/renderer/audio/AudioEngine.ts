import * as Tone from 'tone';

class AudioEngine {
  private synths: Map<string, Tone.PolySynth> = new Map();
  private masterVolume: number = -6;
  private initialized: boolean = false;

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
      maxPolyphony: 32,
    }).toDestination();

    const rightSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
      },
      maxPolyphony: 32,
    }).toDestination();

    leftSynth.volume.value = this.masterVolume;
    rightSynth.volume.value = this.masterVolume;

    this.synths.set('left', leftSynth);
    this.synths.set('right', rightSynth);

    this.initialized = true;
  }

  playNote(frequency: number, hand: 'left' | 'right'): void {
    if (!this.initialized) return;

    const synth = this.synths.get(hand);
    if (synth) {
      synth.triggerAttack(frequency);
    }
  }

  stopNote(frequency: number, hand: 'left' | 'right'): void {
    if (!this.initialized) return;

    const synth = this.synths.get(hand);
    if (synth) {
      synth.triggerRelease(frequency);
    }
  }

  stopAllNotes(): void {
    this.synths.forEach(synth => {
      synth.releaseAll();
    });
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
    this.synths.forEach(synth => synth.dispose());
    this.synths.clear();
    this.initialized = false;
  }
}

export const audioEngine = new AudioEngine();
