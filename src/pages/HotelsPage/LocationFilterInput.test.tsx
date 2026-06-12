import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationFilterInput } from './LocationFilterInput';

vi.mock('./HotelsPage.module.css', () => ({
  default: new Proxy({}, { get: (_t, prop) => String(prop) }),
}));

vi.mock('../../api/hotels', () => ({
  getLocationSuggestions: vi.fn(),
}));

describe('LocationFilterInput', () => {
  it('renders input with placeholder', () => {
    render(<LocationFilterInput value="" placeholder="Локация" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Локация')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<LocationFilterInput value="Москва" placeholder="Локация" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Москва')).toBeInTheDocument();
  });

  it('calls onChange when input changes', () => {
    const handleChange = vi.fn();
    render(<LocationFilterInput value="" placeholder="Локация" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Локация');
    fireEvent.change(input, { target: { value: 'Санкт' } });
    
    expect(handleChange).toHaveBeenCalledWith('Санкт');
  });

  it('renders input with name attribute', () => {
    render(<LocationFilterInput value="" placeholder="Локация" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('Локация');
    expect(input).toHaveAttribute('name', 'location');
  });
});