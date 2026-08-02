import { useEffect } from 'react';
import { useTransportStore, startTimeUpdate, stopTimeUpdate } from '../hooks/useTransport';

export function TransportController() {
  const isPlaying = useTransportStore(state => state.isPlaying);

  useEffect(() => {
    if (isPlaying) {
      startTimeUpdate();
    } else {
      stopTimeUpdate();
    }

    return () => {
      stopTimeUpdate();
    };
  }, [isPlaying]);

  return null;
}
