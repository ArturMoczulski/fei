import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IsomorphicButton from './IsomorphicButton';

describe('IsomorphicButton', () => {
  it('should render with given props', () => {
    render(
      <IsomorphicButton
        note="C"
        octave={4}
        isBlack={false}
        isPressed={false}
        keyHint="G"
      />
    );

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('should apply pressed class when isPressed is true', () => {
    render(
      <IsomorphicButton
        note="C"
        octave={4}
        isBlack={false}
        isPressed={true}
        keyHint="G"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('pressed');
  });

  it('should apply black class for black keys', () => {
    render(
      <IsomorphicButton
        note="C#"
        octave={4}
        isBlack={true}
        isPressed={false}
        keyHint="U"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('black');
  });

  it('should apply white class for white keys', () => {
    render(
      <IsomorphicButton
        note="C"
        octave={4}
        isBlack={false}
        isPressed={false}
        keyHint="G"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('white');
  });
});
