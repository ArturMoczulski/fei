use super::synth::{Voice, VoiceState};

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::SampleFormat;
use log::{error, info};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::thread;
use std::sync::Arc;

const MAX_POLYPHONY: usize = 128;

pub enum AudioCommand {
    NoteOn { frequency: f32 },
    NoteOff { frequency: f32 },
    SetVolume(f32),
    StopAll,
    Panic,
}

pub struct AudioEngine {
    command_tx: Option<Sender<AudioCommand>>,
    initialized: AtomicBool,
    volume: f32,
}

impl AudioEngine {
    pub fn new() -> Self {
        Self {
            command_tx: None,
            initialized: AtomicBool::new(false),
            volume: 0.5,
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

        let voices_cmd = voices.clone();
        let freqs_cmd = freqs.clone();
        let stop_all_cmd = stop_all_flag.clone();
        let panic_cmd = panic_flag.clone();
        let volume_cmd = volume.clone();

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
                        }

                        if panic_audio.load(Ordering::SeqCst) {
                            panic_audio.store(false, Ordering::SeqCst);
                            for i in 0..MAX_POLYPHONY {
                                voices_audio.lock().unwrap()[i] = Voice::new();
                            }
                            for i in 0..MAX_POLYPHONY {
                                freqs_audio.lock().unwrap()[i] = 0.0;
                            }
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
}

impl Default for AudioEngine {
    fn default() -> Self {
        Self::new()
    }
}
