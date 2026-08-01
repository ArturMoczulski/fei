import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsModal from './SettingsModal';

describe('SettingsModal', () => {
  it('should render settings modal', () => {
    render(
      <SettingsModal
        keyboardLayout="dvorak"
        volume={-6}
        onLayoutChange={() => {}}
        onVolumeChange={() => {}}
        onPanic={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render keyboard layout selector', () => {
    render(
      <SettingsModal
        keyboardLayout="dvorak"
        volume={-6}
        onLayoutChange={() => {}}
        onVolumeChange={() => {}}
        onPanic={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should render panic button', () => {
    render(
      <SettingsModal
        keyboardLayout="dvorak"
        volume={-6}
        onLayoutChange={() => {}}
        onVolumeChange={() => {}}
        onPanic={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Panic (Stop All)')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <SettingsModal
        keyboardLayout="dvorak"
        volume={-6}
        onLayoutChange={() => {}}
        onVolumeChange={() => {}}
        onPanic={() => {}}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render about section', () => {
    render(
      <SettingsModal
        keyboardLayout="dvorak"
        volume={-6}
        onLayoutChange={() => {}}
        onVolumeChange={() => {}}
        onPanic={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText(/isomorphic/)).toBeInTheDocument();
  });
});
