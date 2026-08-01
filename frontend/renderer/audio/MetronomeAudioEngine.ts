import { invoke } from '@tauri-apps/api/core';
import { audioEngine } from './AudioEngine';

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

  async start(bpm: number, timeSignature?: TimeSignature): Promise<void> {
    if (this.isRunning) return;
    this.bpm = Math.max(20, bpm);
    if (timeSignature) {
      this.timeSignature = timeSignature;
    }
    this.isRunning = true;
    try {
      await invoke('cmd_metronome_start', { bpm: this.bpm });
    } catch (e) {
      console.error('invoke cmd_metronome_start failed:', e);
    }
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    try {
      invoke('cmd_metronome_stop');
    } catch (e) {
      console.error('invoke cmd_metronome_stop failed:', e);
    }
  }

  async setBpm(bpm: number): Promise<void> {
    this.bpm = Math.max(20, bpm);
    if (this.isRunning) {
      this.stop();
      await this.start(this.bpm, this.timeSignature);
    }
  }

  async setTimeSignature(timeSignature: TimeSignature): Promise<void> {
    this.timeSignature = timeSignature;
    if (this.isRunning) {
      this.stop();
      await this.start(this.bpm, this.timeSignature);
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
