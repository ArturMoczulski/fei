import * as Tone from 'tone';

class MetronomeAudioEngine {
  private clickSynth: Tone.Synth | null = null;
  private accentSynth: Tone.Synth | null = null;
  private sequence: Tone.Sequence | null = null;
  private isRunning: boolean = false;
  private bpm: number = 120;
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

  start(bpm: number): void {
    if (this.isRunning) return;
    this.bpm = bpm;
    this.currentBeat = 0;

    Tone.Transport.bpm.value = bpm;

    this.sequence = new Tone.Sequence(
      (time, beat) => {
        if (beat === 0) {
          this.accentSynth?.triggerAttackRelease('C5', '32n', time);
        } else {
          this.clickSynth?.triggerAttackRelease('C4', '32n', time);
        }
      },
      [0, 1, 2, 3],
      '16n'
    );

    this.sequence.start(0);
    Tone.Transport.start();
    this.isRunning = true;
  }

  stop(): void {
    if (!this.isRunning) return;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    if (this.sequence) {
      this.sequence.stop();
      this.sequence.dispose();
      this.sequence = null;
    }
    this.isRunning = false;
    this.currentBeat = 0;
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
    Tone.Transport.bpm.value = bpm;
  }

  getBpm(): number {
    return this.bpm;
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
