pub const SAMPLE_RATE: f32 = 44100.0;

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
    pub frequency: f32,
    pub phase: f32,
    pub envelope: Envelope,
    pub state: VoiceState,
    age: f32,
    release_start_amplitude: f32,
}

impl Voice {
    pub fn new() -> Self {
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

    pub fn trigger(&mut self, frequency: f32) {
        self.frequency = frequency;
        self.phase = 0.0;
        self.age = 0.0;
        self.state = VoiceState::Attack;
    }

    pub fn release(&mut self) {
        if self.state != VoiceState::Off {
            self.state = VoiceState::Release;
            self.age = 0.0;
            self.release_start_amplitude = self.current_amplitude();
        }
    }

    pub fn current_amplitude(&self) -> f32 {
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

    pub fn process(&mut self) -> f32 {
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
