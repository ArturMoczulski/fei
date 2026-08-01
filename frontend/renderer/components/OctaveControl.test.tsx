import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OctaveControl from './OctaveControl';

vi.mock('./KeyBindingTooltip', () => ({
  KeyBindingTooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('OctaveControl', () => {
  it('should render octave display', () => {
    render(
      <OctaveControl
        octave={4}
        onChange={() => {}}
        hand="left"
        keyboardLayout="dvorak"
      />
    );

    expect(screen.getByText('C4')).toBeInTheDocument();
  });

  it('should call onChange with octave - 1 when decrement is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OctaveControl
        octave={4}
        onChange={onChange}
        hand="left"
        keyboardLayout="dvorak"
      />
    );

    const decrementButton = screen.getByText('▼');
    await user.click(decrementButton);

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('should call onChange with octave + 1 when increment is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OctaveControl
        octave={4}
        onChange={onChange}
        hand="left"
        keyboardLayout="dvorak"
      />
    );

    const incrementButton = screen.getByText('▲');
    await user.click(incrementButton);

    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('should disable decrement button when octave is 1', () => {
    render(
      <OctaveControl
        octave={1}
        onChange={() => {}}
        hand="left"
        keyboardLayout="dvorak"
      />
    );

    const decrementButton = screen.getByText('▼');
    expect(decrementButton).toBeDisabled();
  });

  it('should disable increment button when octave is 7', () => {
    render(
      <OctaveControl
        octave={7}
        onChange={() => {}}
        hand="left"
        keyboardLayout="dvorak"
      />
    );

    const incrementButton = screen.getByText('▲');
    expect(incrementButton).toBeDisabled();
  });
});
