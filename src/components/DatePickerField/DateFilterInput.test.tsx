import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateFilterInput } from './DateFilterInput';

describe('DateFilterInput', () => {
  it('renders input with title', () => {
    render(<DateFilterInput title="Дата заезда" />);
    const input = screen.getByTitle('Дата заезда');
    expect(input).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    render(<DateFilterInput title="Test" placeholder="ДД.ММ.ГГГГ" />);
    expect(screen.getByPlaceholderText('ДД.ММ.ГГГГ')).toBeInTheDocument();
  });

  it('renders readonly input', () => {
    render(<DateFilterInput title="Test" />);
    const input = screen.getByTitle('Test');
    expect(input).toHaveAttribute('readOnly');
  });

  it('applies custom className', () => {
    render(<DateFilterInput title="Test" className="custom-class" />);
    const input = screen.getByTitle('Test');
    expect(input).toHaveClass('custom-class');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<DateFilterInput title="Test" onClick={handleClick} />);
    const input = screen.getByTitle('Test');
    fireEvent.click(input);
    expect(handleClick).toHaveBeenCalled();
  });

  it('displays value', () => {
    render(<DateFilterInput title="Test" value="12.06.2026" onChange={() => {}} />);
    expect(screen.getByDisplayValue('12.06.2026')).toBeInTheDocument();
  });
});