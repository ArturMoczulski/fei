#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio;

use audio::AudioEngine;
use log::info;
use std::sync::Arc;
use parking_lot::Mutex;

const NOTES: [&str; 12] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

fn calculate_frequency(semitone: i32, octave: i32, key_note_index: i32) -> f32 {
    let note_index = (key_note_index + semitone) % 12;
    let note = NOTES[note_index as usize];
    let base_note = note.chars().next().unwrap_or('C');
    let note_index = NOTES.iter().position(|&n| n.chars().next() == Some(base_note)).unwrap_or(0) as i32;
    let total_semitones = key_note_index + semitone;
    let octave_offset = total_semitones / 12;
    let midi_number = (octave + octave_offset + 1) * 12 + note_index;
    440.0 * 2.0f32.powf((midi_number - 69) as f32 / 12.0)
}

static AUDIO_ENGINE: once_cell::sync::Lazy<Arc<Mutex<AudioEngine>>> =
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(AudioEngine::new())));

#[tauri::command]
fn cmd_init_audio() -> Result<bool, String> {
    {
        let engine = AUDIO_ENGINE.lock();
        if engine.is_initialized() {
            return Ok(true);
        }
    }

    {
        let mut engine = AUDIO_ENGINE.lock();
        engine.init()?;
    }

    info!("Audio initialized via command");
    Ok(true)
}

#[tauri::command]
fn cmd_play_note(semitone: i32, octave: i32, hand: String, selected_key: i32) {
    let frequency = calculate_frequency(semitone, octave, selected_key);
    let engine = AUDIO_ENGINE.lock();
    engine.play_note(frequency, &hand);
}

#[tauri::command]
fn cmd_stop_note(semitone: i32, octave: i32, hand: String, selected_key: i32) {
    let frequency = calculate_frequency(semitone, octave, selected_key);
    let engine = AUDIO_ENGINE.lock();
    engine.stop_note(frequency, &hand);
}

#[tauri::command]
fn cmd_play_note_raw(frequency: f32, hand: String) {
    let engine = AUDIO_ENGINE.lock();
    engine.play_note(frequency, &hand);
}

#[tauri::command]
fn cmd_stop_note_raw(frequency: f32, hand: String) {
    let engine = AUDIO_ENGINE.lock();
    engine.stop_note(frequency, &hand);
}

#[tauri::command]
fn cmd_stop_all() {
    let engine = AUDIO_ENGINE.lock();
    engine.stop_all();
}

#[tauri::command]
fn cmd_panic() {
    let engine = AUDIO_ENGINE.lock();
    engine.panic();
}

#[tauri::command]
fn cmd_set_volume(volume: f32) {
    let mut engine = AUDIO_ENGINE.lock();
    engine.set_volume(volume);
}

#[tauri::command]
fn cmd_get_volume() -> f32 {
    let engine = AUDIO_ENGINE.lock();
    engine.get_volume()
}

#[tauri::command]
fn cmd_is_audio_ready() -> bool {
    let engine = AUDIO_ENGINE.lock();
    engine.is_initialized()
}

fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    info!("Starting Fei application");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            cmd_init_audio,
            cmd_play_note,
            cmd_stop_note,
            cmd_play_note_raw,
            cmd_stop_note_raw,
            cmd_stop_all,
            cmd_panic,
            cmd_set_volume,
            cmd_get_volume,
            cmd_is_audio_ready,
        ])
        .setup(|_app| {
            info!("Fei setup complete");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
