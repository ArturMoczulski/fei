import React from 'react';
import TitleBar from './TitleBar';
import KeyboardHand from './KeyboardHand';
import SettingsModal from './SettingsModal';
import ActionsListModal from './ActionsListModal';
import KeySelector from './KeySelector';
import Metronome from './Metronome';
import Autoplay from './Autoplay';
import MidiSettingsModal from './MidiSettingsModal';
import Transport from './Transport';
import TrackView from './TrackView';
import { TransportController } from './TransportController';
import { useAppStore } from '../store/appStore';
import { getLayout, semitoneToNote } from '../keyboard/layouts';
import type { KeyMapping } from '@shared/types';

export function AppUI() {
  const {
    keyboardLayout,
    volume,
    leftOctave,
    rightOctave,
    leftScaleArrangement,
    rightScaleArrangement,
    selectedKey,
    showSettings,
    showActions,
    toggleSettings,
    toggleActions,
    setVolume,
    setKeyboardLayout,
    setSelectedKey,
  } = useAppStore();

  const getActiveNotes = (hand: 'left' | 'right') => {
    const layout = getLayout(keyboardLayout, leftScaleArrangement, rightScaleArrangement);
    const octave = hand === 'left' ? leftOctave : rightOctave;
    const activeNotes: { note: string; octave: number; key: string }[] = [];

    layout.forEach((mapping: KeyMapping) => {
      if (mapping.hand === hand) {
        const note = semitoneToNote(mapping.semitone, selectedKey);
        activeNotes.push({ note, octave, key: mapping.key });
      }
    });

    return activeNotes;
  };

  return (
    <>
      <TransportController />
      <TitleBar
        onSettingsClick={toggleSettings}
        onActionsClick={toggleActions}
        keyboardLayout={keyboardLayout}
      />

      <div className="main-content">
        <div className="track-container">
          <TrackView />
        </div>

        <div className="hands-container">
          <KeyboardHand
            hand="left"
            baseOctave={leftOctave}
            keyboardLayout={keyboardLayout}
            activeNotes={getActiveNotes('left')}
            selectedKey={selectedKey}
          />

          <KeyboardHand
            hand="right"
            baseOctave={rightOctave}
            keyboardLayout={keyboardLayout}
            activeNotes={getActiveNotes('right')}
            selectedKey={selectedKey}
          />
        </div>
      </div>

      <div className="footer">
        <div className="footer-left">
          <Transport />
          <Autoplay />
        </div>

        <div className="footer-center">
          <KeySelector selectedKey={selectedKey} onChange={setSelectedKey} />
          <Metronome visible={true} />
        </div>

        <div className="footer-right">
          <div className="settings-row">
            <span className="settings-label">Vol:</span>
            <div className="volume-control">
              <input
                type="range"
                className="volume-slider"
                min="-40"
                max="0"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
              <span style={{ fontSize: '12px', minWidth: '30px' }}>{volume}dB</span>
            </div>
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal />}

      {showActions && <ActionsListModal />}

      <MidiSettingsModal />
    </>
  );
}
