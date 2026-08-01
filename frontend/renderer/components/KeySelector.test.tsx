import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KeySelector from './KeySelector';

describe('KeySelector', () => {
  it('should render with correct initial value', () => {
    render(<KeySelector selectedKey={0} onChange={() => {}} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('0');
  });

  it('should render all 12 notes', () => {
    render(<KeySelector selectedKey={0} onChange={() => {}} />);
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(12);
  });

  it('should display correct note names', () => {
    render(<KeySelector selectedKey={0} onChange={() => {}} />);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('C#')).toBeInTheDocument();
    expect(screen.getByText('F#')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
