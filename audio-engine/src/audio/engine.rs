use super::synth::{Voice, VoiceState};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::SampleFormat;
use log::{error, info};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::Mutex;
use std::thread;
use std::sync::Arc;
use std::time::Duration;

const MAX_POLYPHONY: usize = 128;
const METRONOME_FREQUENCY: f32 = 1000.0;
const METRONOME_ACCENT_FREQUENCY: f32 = 1500.0;

pub enum AudioCommand {
    NoteOn { frequency: f32 },
    NoteOff { frequency: f32 },
    SetVolume(f32),
    StopAll,
    Panic,
    MetronomeTick { frequency: f32, is_downbeat: bool },
}

pub struct AudioEngine {
    command_tx: Option<Sender<AudioCommand>>,
    initialized: AtomicBool,
    volume: f32,
    metronome_running: Arc<AtomicBool>,
    metronome_thread: Mutex<Option<std::thread::JoinHandle<()>>>,
}

impl AudioEngine {
    pub fn new() -> Self {
        Self {
            command_tx: None,
            initialized: AtomicBool::new(false),
            volume: 0.5,
            metronome_running: Arc::new(AtomicBool::new(false)),
            metronome_thread: Mutex::new(None),
        }
    }

    pub fn init(&mut self) -> Result<(), String> {
        if self.initialized.load(Ordering::SeqCst) {
            return Err("Already initialized".to_string());
        }

        let host = cpal::default_host();
        let device = host
            .default_output_device()
            .ok_or("No output device available")?;

        info!("Audio device: {}", device.name().unwrap_or_default());

        let config = device
            .default_output_config()
            .map_err(|e| format!("Failed to get default output config: {}", e))?;

        info!("Sample rate: {}, Channels: {}", config.sample_rate().0, config.channels());

        let stream_config = cpal::StreamConfig {
            channels: config.channels(),
            sample_rate: config.sample_rate(),
            buffer_size: cpal::BufferSize::Fixed(128),
        };

        info!("Buffer size: 128 samples (low latency mode)");

        let (command_tx, command_rx): (Sender<AudioCommand>, Receiver<AudioCommand>) = channel();

        let voices = Arc::new(std::sync::Mutex::new(vec![Voice::new(); MAX_POLYPHONY]));
        let freqs = Arc::new(std::sync::Mutex::new(vec![0.0f32; MAX_POLYPHONY]));
        let volume = Arc::new(std::sync::Mutex::new(0.5f32));
        let stop_all_flag = Arc::new(AtomicBool::new(false));
        let panic_flag = Arc::new(AtomicBool::new(false));
        let metronome_voice = Arc::new(std::sync::Mutex::new(Voice::new()));

        let voices_cmd = voices.clone();
        let freqs_cmd = freqs.clone();
        let stop_all_cmd = stop_all_flag.clone();
        let panic_cmd = panic_flag.clone();
        let volume_cmd = volume.clone();
        let metronome_voice_cmd = metronome_voice.clone();

        thread::spawn(move || {
            while let Ok(cmd) = command_rx.recv() {
                match cmd {
                    AudioCommand::NoteOn { frequency } => {
                        let mut voices = voices_cmd.lock().unwrap();
                        let mut freqs = freqs_cmd.lock().unwrap();
                        for i in 0..MAX_POLYPHONY {
                            if voices[i].state == VoiceState::Off {
                                voices[i].trigger(frequency);
                                freqs[i] = frequency;
                                break;
                            }
                        }
                    }
                    AudioCommand::NoteOff { frequency } => {
                        let mut voices = voices_cmd.lock().unwrap();
                        let mut freqs = freqs_cmd.lock().unwrap();
                        for i in 0..MAX_POLYPHONY {
                            if (freqs[i] - frequency).abs() < 0.1 {
                                voices[i].release();
                                freqs[i] = 0.0;
                                break;
                            }
                        }
                    }
                    AudioCommand::SetVolume(vol) => {
                        *volume_cmd.lock().unwrap() = vol;
                    }
                    AudioCommand::StopAll => {
                        stop_all_cmd.store(true, Ordering::SeqCst);
                    }
                    AudioCommand::Panic => {
                        panic_cmd.store(true, Ordering::SeqCst);
                    }
                    AudioCommand::MetronomeTick { frequency, is_downbeat: _ } => {
                        let mut metro = metronome_voice_cmd.lock().unwrap();
                        metro.trigger_click(frequency);
                    }
                }
            }
        });

        match config.sample_format() {
            SampleFormat::F32 => {
                let voices_audio = voices.clone();
                let freqs_audio = freqs.clone();
                let vol_audio = volume.clone();
                let stop_all_audio = stop_all_flag.clone();
                let panic_audio = panic_flag.clone();
                let metronome_audio = metronome_voice.clone();

                let _stream = device.build_output_stream(
                    &stream_config,
                    move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                        let num_samples = data.len() / 2;
                        let current_volume = *vol_audio.lock().unwrap();

                        if stop_all_audio.load(Ordering::SeqCst) {
                            stop_all_audio.store(false, Ordering::SeqCst);
                            for i in 0..MAX_POLYPHONY {
                                voices_audio.lock().unwrap()[i] = Voice::new();
                            }
                            for i in 0..MAX_POLYPHONY {
                                freqs_audio.lock().unwrap()[i] = 0.0;
                            }
                            *metronome_audio.lock().unwrap() = Voice::new();
                        }

                        if panic_audio.load(Ordering::SeqCst) {
                            panic_audio.store(false, Ordering::SeqCst);
                            for i in 0..MAX_POLYPHONY {
                                voices_audio.lock().unwrap()[i] = Voice::new();
                            }
                            for i in 0..MAX_POLYPHONY {
                                freqs_audio.lock().unwrap()[i] = 0.0;
                            }
                            *metronome_audio.lock().unwrap() = Voice::new();
                        }

                        for i in 0..num_samples {
                            let mut mixed_sample = 0.0f32;

                            {
                                let mut voices = voices_audio.lock().unwrap();
                                for j in 0..MAX_POLYPHONY {
                                    if voices[j].state != VoiceState::Off {
                                        mixed_sample += voices[j].process();
                                    }
                                }
                            }

                            {
                                let mut metro = metronome_audio.lock().unwrap();
                                if metro.state != VoiceState::Off {
                                    mixed_sample += metro.process();
                                }
                            }

                            let sample = mixed_sample * current_volume * 0.3;
                            let clipped = sample.max(-1.0).min(1.0);
                            data[i * 2] = clipped;
                            data[i * 2 + 1] = clipped;
                        }
                    },
                    |err| error!("Audio stream error: {}", err),
                    None,
                ).map_err(|e| format!("Failed to build stream: {}", e))?;

                _stream.play().map_err(|e| format!("Failed to start stream: {}", e))?;

                Box::leak(Box::new(_stream));
            }
            _ => return Err("Unsupported sample format".to_string()),
        }

        self.command_tx = Some(command_tx);
        self.initialized.store(true, Ordering::SeqCst);
        info!("Audio engine initialized with low-latency cpal audio thread");

        Ok(())
    }

    pub fn play_note(&self, frequency: f32) {
        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if let Some(ref tx) = self.command_tx {
            let _ = tx.send(AudioCommand::NoteOn { frequency });
        }
    }

    pub fn stop_note(&self, frequency: f32) {
        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if let Some(ref tx) = self.command_tx {
            let _ = tx.send(AudioCommand::NoteOff { frequency });
        }
    }

    pub fn stop_all(&self) {
        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if let Some(ref tx) = self.command_tx {
            let _ = tx.send(AudioCommand::StopAll);
        }
    }

    pub fn panic(&self) {
        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if let Some(ref tx) = self.command_tx {
            let _ = tx.send(AudioCommand::Panic);
        }
    }

    pub fn set_volume(&mut self, value: f32) {
        self.volume = value;

        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if let Some(ref tx) = self.command_tx {
            let _ = tx.send(AudioCommand::SetVolume(value));
        }
    }

    pub fn get_volume(&self) -> f32 {
        self.volume
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized.load(Ordering::SeqCst)
    }

    pub fn metronome_start(&self, bpm: u32, numerator: u32) {
        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if self.metronome_running.load(Ordering::SeqCst) {
            return;
        }

        let tx = match self.command_tx {
            Some(ref tx) => tx.clone(),
            None => return,
        };

        let metronome_freq = METRONOME_FREQUENCY;
        let metronome_accent_freq = METRONOME_ACCENT_FREQUENCY;
        let interval_ms = (60000.0 / bpm as f64) as u64;

        let running_flag = self.metronome_running.clone();
        self.metronome_running.store(true, Ordering::SeqCst);

        let handle = std::thread::spawn(move || {
            let mut beat: u32 = 0;
            loop {
                if !running_flag.load(Ordering::SeqCst) {
                    break;
                }
                std::thread::sleep(Duration::from_millis(interval_ms));
                if !running_flag.load(Ordering::SeqCst) {
                    break;
                }
                beat = (beat % numerator) + 1;
                let is_downbeat = beat == 1;
                let freq = if is_downbeat { metronome_accent_freq } else { metronome_freq };
                if tx.send(AudioCommand::MetronomeTick { frequency: freq, is_downbeat }).is_err() {
                    break;
                }
            }
        });

        *self.metronome_thread.lock().unwrap() = Some(handle);
    }

    pub fn metronome_stop(&self) {
        self.metronome_running.store(false, Ordering::SeqCst);
        if let Some(handle) = self.metronome_thread.lock().unwrap().take() {
            let _ = handle.join();
        }
    }
}

impl Default for AudioEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audio_command_note_on() {
        let cmd = AudioCommand::NoteOn { frequency: 440.0 };
        match cmd {
            AudioCommand::NoteOn { frequency } => assert_eq!(frequency, 440.0),
            _ => panic!("Expected NoteOn"),
        }
    }

    #[test]
    fn test_audio_command_note_off() {
        let cmd = AudioCommand::NoteOff { frequency: 440.0 };
        match cmd {
            AudioCommand::NoteOff { frequency } => assert_eq!(frequency, 440.0),
            _ => panic!("Expected NoteOff"),
        }
    }

    #[test]
    fn test_audio_command_set_volume() {
        let cmd = AudioCommand::SetVolume(0.8);
        match cmd {
            AudioCommand::SetVolume(vol) => assert_eq!(vol, 0.8),
            _ => panic!("Expected SetVolume"),
        }
    }

    #[test]
    fn test_audio_command_metronome_tick() {
        let cmd = AudioCommand::MetronomeTick { frequency: 1000.0, is_downbeat: true };
        match cmd {
            AudioCommand::MetronomeTick { frequency, is_downbeat } => {
                assert_eq!(frequency, 1000.0);
                assert!(is_downbeat);
            }
            _ => panic!("Expected MetronomeTick"),
        }
    }

    #[test]
    fn test_audio_engine_new() {
        let engine = AudioEngine::new();
        assert!(!engine.is_initialized());
        assert_eq!(engine.get_volume(), 0.5);
    }

    #[test]
    fn test_audio_engine_set_volume() {
        let mut engine = AudioEngine::new();
        engine.set_volume(0.8);
        assert_eq!(engine.get_volume(), 0.8);
    }

    #[test]
    fn test_metronome_stop_flag_initial_state() {
        let engine = AudioEngine::new();
        assert!(!engine.is_initialized());
    }

    #[test]
    fn test_metronome_start_sets_running_flag() {
        let mut engine = AudioEngine::new();
        engine.initialized.store(true, Ordering::SeqCst);
        let (tx, _rx) = std::sync::mpsc::channel();
        engine.command_tx = Some(tx);
        engine.metronome_start(120, 4);
        assert!(engine.metronome_running.load(Ordering::SeqCst));
        engine.metronome_stop();
        assert!(!engine.metronome_running.load(Ordering::SeqCst));
    }

    #[test]
    fn test_metronome_start_when_already_running_returns_early() {
        let mut engine = AudioEngine::new();
        engine.initialized.store(true, Ordering::SeqCst);
        let (tx, _rx) = std::sync::mpsc::channel();
        engine.command_tx = Some(tx);
        engine.metronome_start(120, 4);
        assert!(engine.metronome_running.load(Ordering::SeqCst));
        engine.metronome_start(60, 4);
        assert!(engine.metronome_running.load(Ordering::SeqCst));
        engine.metronome_stop();
    }

    #[test]
    fn test_metronome_stop_prevents_ticks() {
        let mut engine = AudioEngine::new();
        engine.initialized.store(true, Ordering::SeqCst);
        let (tx, rx) = std::sync::mpsc::channel();
        let original_tx = engine.command_tx.take();
        engine.command_tx = Some(tx);

        engine.metronome_start(600, 4);
        std::thread::sleep(Duration::from_millis(50));
        engine.metronome_stop();
        std::thread::sleep(Duration::from_millis(50));

        engine.command_tx = original_tx;

        if let Ok(AudioCommand::MetronomeTick { .. }) = rx.try_recv() {
            panic!("Expected no ticks after stop");
        }
    }
}
