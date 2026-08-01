# Fei - Isomorphic Split Keyboard Instrument

## Overview

Fei is a software instrument that transforms a computer keyboard into a musical instrument with two independent hands. It uses an isomorphic layout where each hand operates independently with its own octave control.

## Key Features

- **Isomorphic Layout**: 3 rows × 4 columns per hand (12 semitones per octave)
- **Dual Hand Control**: Left and right hands play independently
- **Key Transposition**: Select musical key to transpose all notes
- **Polyphonic Audio**: Multiple simultaneous notes per hand
- **Low Latency**: Rust/cpal audio engine for sub-10ms response

## Project Structure

```
fei/
├── audio-engine/      # Rust/Tauri audio engine
├── frontend/          # React UI
└── docs/              # Documentation
```

## Documentation

- [Design](./design/architecture.md) - Architecture and design decisions
- [Implementation](./implementation/overview.md) - Technical implementation details
- [Instrument Guide](./design/instrument.md) - How to play the instrument

## Building

```bash
# From frontend/ directory:

npm install           # Install dependencies (one-time)
npm run tauri:dev    # Development: starts Vite + runs Tauri app
npm run tauri:build  # Production build

# Or from audio-engine/:
cargo run            # Run Rust audio engine directly
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only (port 5173) |
| `npm run build` | Build frontend for production |
| `npm run tauri:dev` | Full dev mode: Vite + Tauri app with hot reload |
| `npm run tauri:build` | Build Tauri app for distribution |
| `cargo run` | Run audio engine directly from Rust |

### Hot Reload

- **React/Frontend**: Changes hot-reload automatically via Vite
- **Rust**: Requires app restart (no hot reload for Rust code)
