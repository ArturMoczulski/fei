.PHONY: dev build run

dev:
	cd audio-engine && npx @tauri-apps/cli@2 dev

build:
	cd frontend && npm run build
	cd audio-engine && cargo build

run:
	cd audio-engine && cargo run
