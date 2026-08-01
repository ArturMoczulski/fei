export type TimeSignature = {
  numerator: number;
  denominator: number;
};

class MetronomeAudioEngine {
  private isRunning: boolean = false;
  private bpm: number = 120;
  private timeSignature: TimeSignature = { numerator: 4, denominator: 4 };

  async init(): Promise<void> {
  }

  start(bpm: number, timeSignature?: TimeSignature): void {
    if (this.isRunning) return;
    this.bpm = Math.max(20, bpm);
    if (timeSignature) {
      this.timeSignature = timeSignature;
    }
    this.isRunning = true;
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(0.1, bpm);
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
  }
}

export const metronomeAudioEngine = new MetronomeAudioEngine();
