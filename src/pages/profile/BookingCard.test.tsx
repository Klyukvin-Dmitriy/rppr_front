import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingCard } from './BookingCard';
import type { Booking } from './types';

// Мок CSS modules
vi.mock('./BookingHistory.module.css', () => ({
  default: {
    card: 'card',
    cardImage: 'cardImage',
    cardContent: 'cardContent',
    header: 'header',
    status: 'status',
    info: 'info',
    actions: 'actions',
    payButton: 'payButton',
    editButton: 'editButton',
    cancelButton: 'cancelButton',
  },
}));

// Мок bookingUtils
vi.mock('./bookingUtils', () => ({
  formatBookingDate: (date: string) => {
    if (!date) return '—';
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  },
  isBookingExpired: (booking: Booking) => {
    return new Date(booking.check_out) < new Date();
  },
}));

// Мок types (statusLabels и statusColors)
vi.mock('./types', async () => {
  const actual = await vi.importActual('./types');
  return {
    ...actual,
    statusLabels: {
      pending: 'Ожидает оплаты',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено',
      completed: 'Завершено',
    },
    statusColors: {
      pending: '#ffa500',
      confirmed: '#00ff00',
      cancelled: '#ff0000',
      completed: '#808080',
    },
  };
});

describe('BookingCard', () => {
  const mockOnPaymentRequest = vi.fn();
  const mockOnEditRequest = vi.fn();
  const mockOnCancelRequest = vi.fn();

  const futureDate1 = new Date();
  futureDate1.setFullYear(futureDate1.getFullYear() + 1);
  futureDate1.setDate(15);
  const futureDateStr = futureDate1.toISOString().split('T')[0];

  const futureDate2 = new Date();
  futureDate2.setFullYear(futureDate2.getFullYear() + 1);
  futureDate2.setDate(20);  // ← ДРУГАЯ ДАТА!
  const futureDateStr2 = futureDate2.toISOString().split('T')[0];

  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  const mockBooking: Booking = {
    id: 1,
    room_id: 1,
    hotel_id: 1,
    hotel_name: 'Гранд Отель',
    room_name: 'Люкс',
    hotel_image_url: 'https://example.com/hotel.jpg',
    check_in: futureDateStr,
    check_out: futureDateStr2,
    total_price: '60000',
    status: 'pending',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hotel name', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
  });

  it('renders room name', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.getByText(/Люкс/)).toBeInTheDocument();
  });

      it('renders formatted check-in date', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    const [year, month, day] = futureDateStr.split('-');
    const dateElements = screen.getAllByText(`${day}.${month}.${year}`);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('renders total price', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.getByText(/60000\.00/)).toBeInTheDocument();
  });

  it('renders hotel image when hotel_image_url exists', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    const img = screen.getByAltText('Гранд Отель');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/hotel.jpg');
  });

  it('does not render image when hotel_image_url is missing', () => {
    const bookingWithoutImage = { ...mockBooking, hotel_image_url: undefined };
    render(
      <BookingCard
        booking={bookingWithoutImage}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows status label', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.getByText('Ожидает оплаты')).toBeInTheDocument();
  });

  it('shows confirmed status', () => {
    const confirmedBooking = { ...mockBooking, status: 'confirmed' as const };
    render(
      <BookingCard
        booking={confirmedBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.getByText('Подтверждено')).toBeInTheDocument();
  });

  it('shows cancelled status', () => {
    const cancelledBooking = { ...mockBooking, status: 'cancelled' as const };
    render(
      <BookingCard
        booking={cancelledBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.getByText('Отменено')).toBeInTheDocument();
  });

  it('shows actions for pending non-expired booking', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.getByText('Оплатить')).toBeInTheDocument();
    expect(screen.getByText('Изменить')).toBeInTheDocument();
    expect(screen.getByText('Отменить')).toBeInTheDocument();
  });

  it('shows actions without pay button for confirmed booking', () => {
    const confirmedBooking = { ...mockBooking, status: 'confirmed' as const };
    render(
      <BookingCard
        booking={confirmedBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.queryByText('Оплатить')).not.toBeInTheDocument();
    expect(screen.getByText('Изменить')).toBeInTheDocument();
    expect(screen.getByText('Отменить')).toBeInTheDocument();
  });

  it('does not show actions for cancelled booking', () => {
    const cancelledBooking = { ...mockBooking, status: 'cancelled' as const };
    render(
      <BookingCard
        booking={cancelledBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.queryByText('Оплатить')).not.toBeInTheDocument();
    expect(screen.queryByText('Изменить')).not.toBeInTheDocument();
    expect(screen.queryByText('Отменить')).not.toBeInTheDocument();
  });

  it('does not show actions for expired booking', () => {
    const expiredBooking: Booking = {
      ...mockBooking,
      check_in: pastDateStr,
      check_out: pastDateStr,
    };
    render(
      <BookingCard
        booking={expiredBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    expect(screen.queryByText('Оплатить')).not.toBeInTheDocument();
    expect(screen.queryByText('Изменить')).not.toBeInTheDocument();
    expect(screen.queryByText('Отменить')).not.toBeInTheDocument();
  });

  it('calls onPaymentRequest when pay button clicked', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    fireEvent.click(screen.getByText('Оплатить'));
    expect(mockOnPaymentRequest).toHaveBeenCalledWith(1);
  });

  it('calls onEditRequest when edit button clicked', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    fireEvent.click(screen.getByText('Изменить'));
    expect(mockOnEditRequest).toHaveBeenCalledWith(mockBooking);
  });

  it('calls onCancelRequest when cancel button clicked', () => {
    render(
      <BookingCard
        booking={mockBooking}
        onPaymentRequest={mockOnPaymentRequest}
        onEditRequest={mockOnEditRequest}
        onCancelRequest={mockOnCancelRequest}
      />
    );
    fireEvent.click(screen.getByText('Отменить'));
    expect(mockOnCancelRequest).toHaveBeenCalledWith(1);
  });
});