import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Metronome from './Metronome';

vi.mock('../audio/MetronomeAudioEngine', () => ({
  metronomeAudioEngine: {
    init: vi.fn().mockResolvedValue(undefined),
    start: vi.fn(),
    stop: vi.fn(),
    setBpm: vi.fn(),
    setTimeSignature: vi.fn(),
    getBpm: vi.fn().mockReturnValue(120),
    getTimeSignature: vi.fn().mockReturnValue({ numerator: 4, denominator: 4 }),
    getIsRunning: vi.fn().mockReturnValue(false),
    dispose: vi.fn(),
  },
}));

describe('Metronome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when visible', () => {
    render(<Metronome visible={true} />);

    expect(screen.getByTitle('Start Metronome')).toBeInTheDocument();
  });

  it('should not render when not visible', () => {
    render(<Metronome visible={false} />);

    expect(screen.queryByTitle('Start Metronome')).not.toBeInTheDocument();
  });

  it('should have tempo preset options', () => {
    render(<Metronome visible={true} />);

    expect(screen.getByText('Largo (50)')).toBeInTheDocument();
    expect(screen.getByText('Allegro (130)')).toBeInTheDocument();
  });

  it('should display BPM input', () => {
    render(<Metronome visible={true} />);

    const bpmInput = screen.getByRole('spinbutton');
    expect(bpmInput).toBeInTheDocument();
    expect(bpmInput).toHaveValue(110);
  });

  it('should display time signature options', () => {
    render(<Metronome visible={true} />);

    expect(screen.getByText('4/4')).toBeInTheDocument();
    expect(screen.getByText('3/4')).toBeInTheDocument();
  });
});
