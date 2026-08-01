import { invoke } from '@tauri-apps/api/core';

class AudioEngine {
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    await invoke('cmd_init_audio');
    this.initialized = true;
  }

  playNote(frequency: number, hand: 'left' | 'right'): void {
    if (!this.initialized) return;
    invoke('cmd_play_note_raw', { frequency, hand });
  }

  stopNote(frequency: number, hand: 'left' | 'right'): void {
    if (!this.initialized) return;
    invoke('cmd_stop_note_raw', { frequency, hand });
  }

  stopAllNotes(): void {
    if (!this.initialized) return;
    invoke('cmd_stop_all');
  }

  panic(): void {
    invoke('cmd_panic');
  }

  setVolume(value: number): void {
    invoke('cmd_set_volume', { volume: value });
  }

  getVolume(): number {
    return 0.5;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const audioEngine = new AudioEngine();
