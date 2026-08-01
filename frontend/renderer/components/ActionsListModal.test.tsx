import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionsListModal from './ActionsListModal';

const mockToggleActions = vi.fn();

vi.mock('../store/appStore', () => ({
  useAppStore: vi.fn((selector?: (state: any) => any) => {
    const state = {
      keyboardLayout: 'dvorak',
      showActions: true,
      toggleActions: mockToggleActions,
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../keyboard/keyBindings', () => ({
  getKeyBindingForAction: vi.fn((action: string) => {
    const map: Record<string, string> = {
      'left_hand_sound_upper_pinky': ';',
      'right_hand_sound_upper_index': 'G',
      'left_hand_increase_octave': '4',
    };
    return map[action] || null;
  }),
}));

describe('ActionsListModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal title', () => {
    render(<ActionsListModal />);
    expect(screen.getByText('Keyboard Actions')).toBeInTheDocument();
  });

  it('should render action items', () => {
    render(<ActionsListModal />);
    expect(screen.getByText(/Left Hand Sound Upper Pinky/)).toBeInTheDocument();
  });

  it('should call toggleActions when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ActionsListModal />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockToggleActions).toHaveBeenCalled();
  });
});
