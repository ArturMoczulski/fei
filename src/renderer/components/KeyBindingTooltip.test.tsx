import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyBindingTooltip } from './KeyBindingTooltip';

vi.mock('../keyboard/keyBindings', () => ({
  getKeyBindingForAction: vi.fn((action: string) => {
    const map: Record<string, string> = {
      'left_hand_increase_octave': '4',
      'left_hand_decrease_octave': '3',
      'right_hand_increase_octave': '7',
      'right_hand_decrease_octave': '8',
      'open_settings': 'ESCAPE',
    };
    return map[action] || null;
  }),
}));

describe('KeyBindingTooltip', () => {
  it('should render children without tooltip when no actions', () => {
    render(
      <KeyBindingTooltip actions={[]} keyboardLayout="dvorak">
        <button>Test</button>
      </KeyBindingTooltip>
    );

    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
  });

  it('should not show tooltip initially', () => {
    render(
      <KeyBindingTooltip actions={['open_settings']} keyboardLayout="dvorak">
        <button>Test</button>
      </KeyBindingTooltip>
    );

    expect(screen.queryByText(/Settings/)).not.toBeInTheDocument();
  });

  it('should show tooltip on mouse enter', async () => {
    const user = userEvent.setup();
    render(
      <KeyBindingTooltip actions={['open_settings']} keyboardLayout="dvorak">
        <button>Test</button>
      </KeyBindingTooltip>
    );

    const button = screen.getByRole('button', { name: 'Test' });
    await user.hover(button);

    expect(screen.getByText(/Open Settings/)).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', async () => {
    const user = userEvent.setup();
    render(
      <KeyBindingTooltip actions={['open_settings']} keyboardLayout="dvorak">
        <button>Test</button>
      </KeyBindingTooltip>
    );

    const button = screen.getByRole('button', { name: 'Test' });
    await user.hover(button);
    expect(screen.getByText(/Open Settings/)).toBeInTheDocument();

    await user.unhover(button);
    expect(screen.queryByText(/Open Settings/)).not.toBeInTheDocument();
  });

  it('should render multiple key bindings', async () => {
    const user = userEvent.setup();
    render(
      <KeyBindingTooltip
        actions={['left_hand_increase_octave', 'left_hand_decrease_octave']}
        keyboardLayout="dvorak"
      >
        <button>Test</button>
      </KeyBindingTooltip>
    );

    const button = screen.getByRole('button', { name: 'Test' });
    await user.hover(button);

    expect(screen.getByText(/Left Hand Increase Octave/)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/Left Hand Decrease Octave/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
