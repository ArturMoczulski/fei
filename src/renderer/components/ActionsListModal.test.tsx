import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionsListModal } from './ActionsListModal';

vi.mock('../keyboard/keyBindings', () => ({
  getKeyBindingForAction: vi.fn((action: string) => {
    const map: Record<string, string> = {
      'left_hand_sound_upper_pinky': ';',
      'left_hand_sound_upper_ring': '.',
      'right_hand_sound_upper_index': 'G',
      'left_hand_increase_octave': '4',
      'left_hand_decrease_octave': '3',
      'right_hand_increase_octave': '7',
      'right_hand_decrease_octave': '8',
      'panic_stop': '\\',
      'toggle_metronome': '/',
      'open_settings': 'ESCAPE',
      'toggle_actions_list': ']',
    };
    return map[action] || null;
  }),
}));

describe('ActionsListModal', () => {
  it('should render modal title', () => {
    render(
      <ActionsListModal
        keyboardLayout="dvorak"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Keyboard Actions')).toBeInTheDocument();
  });

  it('should render all action categories', () => {
    render(
      <ActionsListModal
        keyboardLayout="dvorak"
        onClose={() => {}}
      />
    );

    expect(screen.getAllByText(/Left_sound/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Right_sound/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Octave/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Transport/).length).toBeGreaterThan(0);
  });

  it('should render action items', () => {
    render(
      <ActionsListModal
        keyboardLayout="dvorak"
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/Left Hand Sound Upper Pinky/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ActionsListModal
        keyboardLayout="dvorak"
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
