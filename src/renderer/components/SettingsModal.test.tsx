import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsModal from './SettingsModal';

const mockToggleSettings = vi.fn();
const mockSetKeyboardLayout = vi.fn();
const mockSetVolume = vi.fn();

vi.mock('../store/appStore', () => ({
  useAppStore: vi.fn((selector?: (state: any) => any) => {
    const state = {
      keyboardLayout: 'dvorak',
      volume: -6,
      showSettings: true,
      showActions: false,
      setKeyboardLayout: mockSetKeyboardLayout,
      setVolume: mockSetVolume,
      toggleSettings: mockToggleSettings,
      toggleActions: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../audio/AudioEngine', () => ({
  audioEngine: { panic: vi.fn() },
}));

describe('SettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render settings modal when showSettings is true', () => {
    render(<SettingsModal />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render keyboard layout selector', () => {
    render(<SettingsModal />);
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should render panic button', () => {
    render(<SettingsModal />);
    expect(screen.getByText('Panic (Stop All)')).toBeInTheDocument();
  });

  it('should call toggleSettings when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockToggleSettings).toHaveBeenCalled();
  });

  it('should render about section', () => {
    render(<SettingsModal />);
    expect(screen.getByText('About')).toBeInTheDocument();
  });
});
