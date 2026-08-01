import React, { useEffect } from 'react';
import { AppUI } from './components/AppUI';
import { useKeyboardEvents } from './hooks/useKeyboardEvents';
import { useAppStore } from './store/appStore';
import { audioEngine } from './audio/AudioEngine';

function App() {
  useKeyboardEvents();

  useEffect(() => {
    audioEngine.init().then(() => {
      useAppStore.getState().setAudioReady(true);
    });
  }, []);

  return (
    <div className="app">
      <AppUI />
    </div>
  );
}

export default App;
