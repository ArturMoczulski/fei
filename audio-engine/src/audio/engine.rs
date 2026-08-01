use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::SampleFormat;
use log::{error, info};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::thread;
use std::sync::Arc;

const MAX_POLYPHONY: usize = 128;
const SAMPLE_RATE: f32 = 44100.0;

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum VoiceState {
    Off,
    Attack,
    Decay,
    Sustain,
    Release,
}

#[derive(Clone, Copy, Debug)]
pub struct Envelope {
    pub attack: f32,
    pub decay: f32,
    pub sustain: f32,
    pub release: f32,
}

#[derive(Clone)]
pub struct Voice {
    frequency: f32,
    phase: f32,
    envelope: Envelope,
    state: VoiceState,
    age: f32,
    release_start_amplitude: f32,
}

impl Voice {
    fn new() -> Self {
        Self {
            frequency: 0.0,
            phase: 0.0,
            envelope: Envelope {
                attack: 0.001,
                decay: 0.1,
                sustain: 0.7,
                release: 0.3,
            },
            state: VoiceState::Off,
            age: 0.0,
            release_start_amplitude: 0.0,
        }
    }

    fn trigger(&mut self, frequency: f32) {
        self.frequency = frequency;
        self.phase = 0.0;
        self.age = 0.0;
        self.state = VoiceState::Attack;
    }

    fn release(&mut self) {
        if self.state != VoiceState::Off {
            self.state = VoiceState::Release;
            self.age = 0.0;
            self.release_start_amplitude = self.current_amplitude();
        }
    }

    fn current_amplitude(&self) -> f32 {
        match self.state {
            VoiceState::Off => 0.0,
            VoiceState::Attack => {
                if self.envelope.attack > 0.0 {
                    (self.age / self.envelope.attack).min(1.0)
                } else {
                    1.0
                }
            }
            VoiceState::Decay => {
                let t = if self.envelope.decay > 0.0 {
                    (self.age / self.envelope.decay).min(1.0)
                } else {
                    1.0
                };
                1.0 - (1.0 - self.envelope.sustain) * t
            }
            VoiceState::Sustain => self.envelope.sustain,
            VoiceState::Release => {
                if self.envelope.release > 0.0 {
                    self.release_start_amplitude * (1.0 - self.age / self.envelope.release).max(0.0)
                } else {
                    0.0
                }
            }
        }
    }

    fn process(&mut self) -> f32 {
        if self.state == VoiceState::Off {
            return 0.0;
        }

        let triangle_wave = 2.0 * (self.phase * 2.0 - 1.0).abs() - 1.0;
        let amplitude = self.current_amplitude();

        self.phase += self.frequency / SAMPLE_RATE;
        while self.phase >= 1.0 {
            self.phase -= 1.0;
        }

        self.age += 1.0 / SAMPLE_RATE;

        match self.state {
            VoiceState::Off => {}
            VoiceState::Attack => {
                if self.age >= self.envelope.attack {
                    self.state = VoiceState::Decay;
                    self.age = 0.0;
                }
            }
            VoiceState::Decay => {
                if self.age >= self.envelope.decay {
                    self.state = VoiceState::Sustain;
                    self.age = 0.0;
                }
            }
            VoiceState::Release => {
                if self.age >= self.envelope.release {
                    self.state = VoiceState::Off;
                    self.age = 0.0;
                }
            }
            VoiceState::Sustain => {}
        }

        triangle_wave * amplitude
    }
}

pub enum AudioCommand {
    NoteOn { frequency: f32, hand: Hand },
    NoteOff { frequency: f32, hand: Hand },
    SetVolume(f32),
    StopAll,
    Panic,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Hand {
    Left,
    Right,
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

        // Create a low-latency config with smaller buffer
        let stream_config = cpal::StreamConfig {
            channels: config.channels(),
            sample_rate: config.sample_rate(),
            buffer_size: cpal::BufferSize::Fixed(128), // Small buffer for low latency
        };

        info!("Buffer size: 128 samples (low latency mode)");

        let (command_tx, command_rx): (Sender<AudioCommand>, Receiver<AudioCommand>) = channel();

        // Shared voice data protected by Mutex for command thread access
        let left_voices = Arc::new(std::sync::Mutex::new(vec![Voice::new(); MAX_POLYPHONY]));
        let right_voices = Arc::new(std::sync::Mutex::new(vec![Voice::new(); MAX_POLYPHONY]));
        let left_freqs = Arc::new(std::sync::Mutex::new(vec![0.0f32; MAX_POLYPHONY]));
        let right_freqs = Arc::new(std::sync::Mutex::new(vec![0.0f32; MAX_POLYPHONY]));
        let volume = Arc::new(std::sync::Mutex::new(0.5f32));
        let stop_all_flag = Arc::new(AtomicBool::new(false));
        let panic_flag = Arc::new(AtomicBool::new(false));

        // Clone arcs for command thread
        let left_voices_cmd = left_voices.clone();
        let right_voices_cmd = right_voices.clone();
        let left_freqs_cmd = left_freqs.clone();
        let right_freqs_cmd = right_freqs.clone();
        let stop_all_cmd = stop_all_flag.clone();
        let panic_cmd = panic_flag.clone();
        let volume_cmd = volume.clone();

        // Command processing thread
        thread::spawn(move || {
            while let Ok(cmd) = command_rx.recv() {
                match cmd {
                    AudioCommand::NoteOn { frequency, hand } => {
                        let voices = match hand {
                            Hand::Left => &left_voices_cmd,
                            Hand::Right => &right_voices_cmd,
                        };
                        let freqs = match hand {
                            Hand::Left => &left_freqs_cmd,
                            Hand::Right => &right_freqs_cmd,
                        };

                        let mut voices = voices.lock().unwrap();
                        let mut freqs = freqs.lock().unwrap();
                        for i in 0..MAX_POLYPHONY {
                            if voices[i].state == VoiceState::Off {
                                voices[i].trigger(frequency);
                                freqs[i] = frequency;
                                break;
                            }
                        }
                    }
                    AudioCommand::NoteOff { frequency, hand } => {
                        let voices = match hand {
                            Hand::Left => &left_voices_cmd,
                            Hand::Right => &right_voices_cmd,
                        };
                        let freqs = match hand {
                            Hand::Left => &left_freqs_cmd,
                            Hand::Right => &right_freqs_cmd,
                        };

                        let mut voices = voices.lock().unwrap();
                        let mut freqs = freqs.lock().unwrap();
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
                let lv = left_voices.clone();
                let rv = right_voices.clone();
                let lf = left_freqs.clone();
                let rf = right_freqs.clone();
                let vol = volume.clone();
                let stop_all = stop_all_flag.clone();
                let panic_f = panic_flag.clone();

                let _stream = device.build_output_stream(
                    &stream_config,
                    move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                        let num_samples = data.len() / 2;
                        let current_volume = *vol.lock().unwrap();

                        // Handle stop all
                        if stop_all.load(Ordering::SeqCst) {
                            stop_all.store(false, Ordering::SeqCst);
                            for i in 0..MAX_POLYPHONY {
                                lv.lock().unwrap()[i] = Voice::new();
                                rv.lock().unwrap()[i] = Voice::new();
                            }
                            for i in 0..MAX_POLYPHONY {
                                lf.lock().unwrap()[i] = 0.0;
                                rf.lock().unwrap()[i] = 0.0;
                            }
                        }

                        // Handle panic
                        if panic_f.load(Ordering::SeqCst) {
                            panic_f.store(false, Ordering::SeqCst);
                            for i in 0..MAX_POLYPHONY {
                                lv.lock().unwrap()[i] = Voice::new();
                                rv.lock().unwrap()[i] = Voice::new();
                            }
                            for i in 0..MAX_POLYPHONY {
                                lf.lock().unwrap()[i] = 0.0;
                                rf.lock().unwrap()[i] = 0.0;
                            }
                        }

                        for i in 0..num_samples {
                            let mut left_sample = 0.0f32;
                            let mut right_sample = 0.0f32;

                            // Process left hand voices
                            {
                                let mut voices = lv.lock().unwrap();
                                for j in 0..MAX_POLYPHONY {
                                    if voices[j].state != VoiceState::Off {
                                        left_sample += voices[j].process();
                                    }
                                }
                            }

                            // Process right hand voices
                            {
                                let mut voices = rv.lock().unwrap();
                                for j in 0..MAX_POLYPHONY {
                                    if voices[j].state != VoiceState::Off {
                                        right_sample += voices[j].process();
                                    }
                                }
                            }

                            let sample = (left_sample + right_sample) * current_volume * 0.3;
                            let clipped = sample.max(-1.0).min(1.0);
                            data[i * 2] = clipped;
                            data[i * 2 + 1] = clipped;
                        }
                    },
                    |err| error!("Audio stream error: {}", err),
                    None,
                ).map_err(|e| format!("Failed to build stream: {}", e))?;

                _stream.play().map_err(|e| format!("Failed to start stream: {}", e))?;

                // Leak the stream to keep it alive
                Box::leak(Box::new(_stream));
            }
            _ => return Err("Unsupported sample format".to_string()),
        }

        self.command_tx = Some(command_tx);
        self.initialized.store(true, Ordering::SeqCst);
        info!("Audio engine initialized with low-latency cpal audio thread");

        Ok(())
    }

    pub fn play_note(&self, frequency: f32, hand: &str) {
        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if let Some(ref tx) = self.command_tx {
            let h = if hand == "left" { Hand::Left } else { Hand::Right };
            let _ = tx.send(AudioCommand::NoteOn { frequency, hand: h });
        }
    }

    pub fn stop_note(&self, frequency: f32, hand: &str) {
        if !self.initialized.load(Ordering::SeqCst) {
            return;
        }

        if let Some(ref tx) = self.command_tx {
            let h = if hand == "left" { Hand::Left } else { Hand::Right };
            let _ = tx.send(AudioCommand::NoteOff { frequency, hand: h });
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_voice_initial_state() {
        let voice = Voice::new();
        assert_eq!(voice.state, VoiceState::Off);
        assert_eq!(voice.frequency, 0.0);
        assert_eq!(voice.phase, 0.0);
    }

    #[test]
    fn test_voice_trigger() {
        let mut voice = Voice::new();
        voice.trigger(440.0);
        assert_eq!(voice.state, VoiceState::Attack);
        assert_eq!(voice.frequency, 440.0);
        assert_eq!(voice.phase, 0.0);
        assert_eq!(voice.age, 0.0);
    }

    #[test]
    fn test_voice_release() {
        let mut voice = Voice::new();
        voice.trigger(440.0);
        voice.release();
        assert_eq!(voice.state, VoiceState::Release);
    }

    #[test]
    fn test_voice_release_from_off_does_nothing() {
        let mut voice = Voice::new();
        voice.release();
        assert_eq!(voice.state, VoiceState::Off);
    }

    #[test]
    fn test_envelope_attack_amplitude() {
        let mut voice = Voice::new();
        voice.envelope = Envelope {
            attack: 0.1,
            decay: 0.1,
            sustain: 0.5,
            release: 0.1,
        };
        voice.trigger(440.0);

        assert_eq!(voice.state, VoiceState::Attack);
        assert!(voice.current_amplitude() >= 0.0);
        assert!(voice.current_amplitude() <= 1.0);
    }

    #[test]
    fn test_envelope_attack_completes() {
        let mut voice = Voice::new();
        voice.envelope = Envelope {
            attack: 0.001,
            decay: 0.1,
            sustain: 0.5,
            release: 0.1,
        };
        voice.trigger(440.0);

        while voice.state == VoiceState::Attack {
            voice.process();
        }
        assert_eq!(voice.state, VoiceState::Decay);
    }

    #[test]
    fn test_envelope_decay_completes() {
        let mut voice = Voice::new();
        voice.envelope = Envelope {
            attack: 0.001,
            decay: 0.001,
            sustain: 0.5,
            release: 0.1,
        };
        voice.trigger(440.0);

        while voice.state == VoiceState::Attack {
            voice.process();
        }
        while voice.state == VoiceState::Decay {
            voice.process();
        }
        assert_eq!(voice.state, VoiceState::Sustain);
    }

    #[test]
    fn test_envelope_release_completes() {
        let mut voice = Voice::new();
        voice.envelope = Envelope {
            attack: 0.001,
            decay: 0.001,
            sustain: 0.5,
            release: 0.001,
        };
        voice.trigger(440.0);

        while voice.state == VoiceState::Attack {
            voice.process();
        }
        while voice.state == VoiceState::Decay {
            voice.process();
        }
        voice.release();

        while voice.state == VoiceState::Release {
            voice.process();
        }
        assert_eq!(voice.state, VoiceState::Off);
    }

    #[test]
    fn test_voice_process_returns_zero_when_off() {
        let mut voice = Voice::new();
        let sample = voice.process();
        assert_eq!(sample, 0.0);
    }

    #[test]
    fn test_voice_process_returns_triangle_wave() {
        let mut voice = Voice::new();
        voice.trigger(440.0);
        voice.envelope = Envelope {
            attack: 0.0,
            decay: 0.0,
            sustain: 1.0,
            release: 0.0,
        };
        voice.state = VoiceState::Sustain;

        let sample = voice.process();
        assert!(sample.abs() <= 1.0);
    }

    #[test]
    fn test_triangle_wave_bounds() {
        let mut voice = Voice::new();
        voice.trigger(440.0);
        voice.envelope = Envelope {
            attack: 0.0,
            decay: 0.0,
            sustain: 1.0,
            release: 0.0,
        };
        voice.state = VoiceState::Sustain;

        for _ in 0..1000 {
            let sample = voice.process();
            assert!(sample.abs() <= 1.0);
        }
    }

    #[test]
    fn test_voice_phase_wraps() {
        let mut voice = Voice::new();
        voice.trigger(44100.0);
        voice.envelope = Envelope {
            attack: 0.0,
            decay: 0.0,
            sustain: 1.0,
            release: 0.0,
        };
        voice.state = VoiceState::Sustain;

        let initial_phase = voice.phase;
        voice.process();
        assert!(voice.phase < initial_phase || voice.phase == 0.0);
    }

    #[test]
    fn test_voice_off_amplitude_is_zero() {
        let voice = Voice::new();
        assert_eq!(voice.current_amplitude(), 0.0);
    }

    #[test]
    fn test_sustain_amplitude_matches_sustain_level() {
        let mut voice = Voice::new();
        voice.envelope = Envelope {
            attack: 0.001,
            decay: 0.001,
            sustain: 0.7,
            release: 0.001,
        };
        voice.trigger(440.0);

        while voice.state != VoiceState::Sustain {
            voice.process();
        }

        assert!((voice.current_amplitude() - 0.7).abs() < 0.01);
    }
}
