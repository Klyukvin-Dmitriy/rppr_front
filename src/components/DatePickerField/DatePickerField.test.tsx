import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatePickerField } from './DatePickerField';

// Мок react-datepicker
vi.mock('react-datepicker', () => ({
  default: ({
    selected,
    placeholderText,
    customInput,
    wrapperClassName,
    id,
  }: {
    selected: Date | null;
    placeholderText: string;
    customInput: React.ReactElement;
    wrapperClassName: string;
    id?: string;
  }) => (
    <div className={wrapperClassName} data-testid="datepicker-wrapper">
      {customInput ? (
        <input
          data-testid="date-input"
          id={id}
          placeholder={placeholderText}
          value={selected ? selected.toLocaleDateString('ru-RU') : ''}
        />
      ) : (
        <input data-testid="date-input" placeholder={placeholderText} />
      )}
    </div>
  ),
}));

// Мок date-fns
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'yyyy-MM-dd') {
      return date.toISOString().split('T')[0];
    }
    return date.toLocaleDateString();
  },
}));

// Мок utils/datePicker
vi.mock('../../utils/datePicker', () => ({
  parseIsoDate: (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },
}));

// Мок setupDatePicker
vi.mock('./setupDatePicker', () => ({}));

// Мок DateFilterInput
vi.mock('./DateFilterInput', () => ({
  DateFilterInput: ({ title, placeholder, className }: { title: string; placeholder: string; className?: string }) => (
    <input
      data-testid="date-filter-input"
      title={title}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

// Мок CSS
vi.mock('./DatePickerField.module.css', () => ({
  default: {
    wrapper: 'wrapper',
  },
}));

describe('DatePickerField Component', () => {
  it('renders date picker', () => {
    render(<DatePickerField value="" onChange={() => {}} />);
    expect(screen.getByTestId('datepicker-wrapper')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    render(<DatePickerField value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Выберите дату')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <DatePickerField
        value=""
        onChange={() => {}}
        placeholder="Дата заезда"
      />,
    );
    expect(screen.getByPlaceholderText('Дата заезда')).toBeInTheDocument();
  });

  it('renders with wrapper class', () => {
    render(
      <DatePickerField
        value=""
        onChange={() => {}}
        wrapperClassName="custom-wrapper"
      />,
    );
    const wrapper = screen.getByTestId('datepicker-wrapper');
    expect(wrapper).toHaveClass('custom-wrapper');
  });

  it('renders with id', () => {
    render(
      <DatePickerField
        value=""
        onChange={() => {}}
        id="checkin-date"
      />,
    );
    const input = screen.getByTestId('date-input');
    expect(input).toHaveAttribute('id', 'checkin-date');
  });

  it('renders with value', () => {
    render(
      <DatePickerField
        value="2026-06-15"
        onChange={() => {}}
      />,
    );
    const input = screen.getByTestId('date-input');
    expect(input).toBeInTheDocument();
  });

  it('renders with minDate', () => {
    const minDate = new Date('2026-01-01');
    render(
      <DatePickerField
        value=""
        onChange={() => {}}
        minDate={minDate}
      />,
    );
    expect(screen.getByTestId('datepicker-wrapper')).toBeInTheDocument();
  });

  it('renders with custom popperClassName', () => {
    render(
      <DatePickerField
        value=""
        onChange={() => {}}
        popperClassName="custom-popper"
      />,
    );
    expect(screen.getByTestId('datepicker-wrapper')).toBeInTheDocument();
  });
});