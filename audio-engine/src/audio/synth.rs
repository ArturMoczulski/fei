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

#[derive(Clone, Copy)]
pub struct Voice {
    frequency: f32,
    phase: f32,
    envelope: Envelope,
    state: VoiceState,
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

    pub fn with_envelope(envelope: Envelope) -> Self {
        Self {
            frequency: 0.0,
            phase: 0.0,
            envelope,
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

    pub fn reset(&mut self) {
        self.state = VoiceState::Off;
        self.frequency = 0.0;
        self.phase = 0.0;
        self.age = 0.0;
    }

    pub fn is_active(&self) -> bool {
        self.state != VoiceState::Off
    }

    pub fn frequency(&self) -> f32 {
        self.frequency
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
                let attack_level = if self.envelope.attack > 0.0 {
                    1.0
                } else {
                    self.envelope.sustain
                };
                let t = if self.envelope.decay > 0.0 {
                    (self.age / self.envelope.decay).min(1.0)
                } else {
                    1.0
                };
                attack_level - (attack_level - self.envelope.sustain) * t
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

    pub fn process(&mut self, frequency: f32, sample_rate: f32) -> f32 {
        if self.state == VoiceState::Off {
            return 0.0;
        }

        let triangle_wave = 2.0 * (self.phase * 2.0 - 1.0).abs() - 1.0;
        let amplitude = self.current_amplitude();

        self.phase += frequency / sample_rate;
        while self.phase >= 1.0 {
            self.phase -= 1.0;
        }

        self.age += 1.0 / sample_rate;

        match self.state {
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
            _ => {}
        }

        triangle_wave * amplitude
    }
}

impl Default for Voice {
    fn default() -> Self {
        Self::new()
    }
}
