import React, { useEffect } from 'react';
import { AppUI } from './components/AppUI';
import { useKeyboardEvents } from './hooks/useKeyboardEvents';
import { useAppStore } from './store/appStore';

function App() {
  useKeyboardEvents();

  useEffect(() => {
    useAppStore.getState().loadSettings();
  }, []);

  return (
    <div className="app">
      <AppUI />
    </div>
  );
}

export default App;
