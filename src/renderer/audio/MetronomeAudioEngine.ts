import * as Tone from 'tone';

export type TimeSignature = {
  numerator: number;
  denominator: number;
};

class MetronomeAudioEngine {
  private clickSynth: Tone.Synth | null = null;
  private accentSynth: Tone.Synth | null = null;
  private sequence: Tone.Sequence | null = null;
  private isRunning: boolean = false;
  private bpm: number = 120;
  private timeSignature: TimeSignature = { numerator: 4, denominator: 4 };
  private currentBeat: number = 0;

  async init(): Promise<void> {
    if (this.clickSynth) return;

    this.clickSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();
    this.clickSynth.volume.value = -10;

    this.accentSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();
    this.accentSynth.volume.value = -5;
  }

  start(bpm: number, timeSignature?: TimeSignature): void {
    if (this.isRunning) return;
    this.bpm = Math.max(20, bpm);
    if (timeSignature) {
      this.timeSignature = timeSignature;
    }
    this.currentBeat = 0;

    try {
      Tone.Transport.cancel();
    } catch (e) {
      // Ignore
    }

    Tone.Transport.bpm.value = this.bpm;

    const beats = Array.from({ length: this.timeSignature.numerator }, (_, i) => i);

    this.sequence = new Tone.Sequence(
      (time, beat) => {
        if (beat === 0) {
          this.accentSynth?.triggerAttackRelease('C5', '32n', time);
        } else {
          this.clickSynth?.triggerAttackRelease('C4', '32n', time);
        }
      },
      beats,
      '16n'
    );

    this.sequence.start(0);
    Tone.Transport.start();
    this.isRunning = true;
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    try {
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop(Tone.now(), true);
      }
    } catch (e) {
      // Ignore transport errors
    }

    try {
      Tone.Transport.cancel();
    } catch (e) {
      // Ignore cancel errors
    }

    if (this.sequence) {
      try {
        this.sequence.stop();
      } catch (e) {
        // Ignore stop errors
      }
      try {
        this.sequence.dispose();
      } catch (e) {
        // Ignore dispose errors
      }
      this.sequence = null;
    }
    this.currentBeat = 0;
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(0.1, bpm);
    Tone.Transport.bpm.value = this.bpm;
  }

  setTimeSignature(timeSignature: TimeSignature): void {
    this.timeSignature = timeSignature;
    if (this.isRunning) {
      this.stop();
      this.start(this.bpm, this.timeSignature);
    }
  }

  getBpm(): number {
    return this.bpm;
  }

  getTimeSignature(): TimeSignature {
    return this.timeSignature;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  dispose(): void {
    this.stop();
    this.clickSynth?.dispose();
    this.accentSynth?.dispose();
    this.clickSynth = null;
    this.accentSynth = null;
  }
}

export const metronomeAudioEngine = new MetronomeAudioEngine();
