import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BookingHistory } from './BookingHistory';
import { apiClient } from '../../api/client';
import type { Booking } from './types';

// Мок CSS modules
vi.mock('./BookingHistory.module.css', () => ({
  default: {
    page: 'page',
    personalInfo: 'personalInfo',
    sectionTitle: 'sectionTitle',
    infoFields: 'infoFields',
    field: 'field',
    bookingsSection: 'bookingsSection',
    noBookings: 'noBookings',
    list: 'list',
    modalOverlay: 'modalOverlay',
    modal: 'modal',
    modalActions: 'modalActions',
    cancelBtn: 'cancelBtn',
    confirmBtn: 'confirmBtn',
    paymentModal: 'paymentModal',
    closeModalButton: 'closeModalButton',
    paymentForm: 'paymentForm',
    paymentField: 'paymentField',
    paymentRow: 'paymentRow',
    paymentSubmitButton: 'paymentSubmitButton',
    editError: 'editError',
    editForm: 'editForm',
    editField: 'editField',
    editDateInput: 'editDateInput',
  },
}));

// Мок API client
vi.mock('../../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Мок BookingCard
vi.mock('./BookingCard', () => ({
  BookingCard: ({ booking, onPaymentRequest, onEditRequest, onCancelRequest }: {
    booking: Booking;
    onPaymentRequest: (id: number) => void;
    onEditRequest: (booking: Booking) => void;
    onCancelRequest: (id: number) => void;
  }) => (
    <div data-testid={`booking-${booking.id}`}>
      <span>{booking.hotel_name}</span>
      <span>{booking.room_name}</span>
      <button onClick={() => onPaymentRequest(booking.id)}>Оплатить</button>
      <button onClick={() => onEditRequest(booking)}>Изменить</button>
      <button onClick={() => onCancelRequest(booking.id)}>Отменить</button>
    </div>
  ),
}));

// Мок DatePickerField
vi.mock('../../components/DatePickerField/DatePickerField', () => ({
  DatePickerField: ({ value, onChange, placeholder, id }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    id?: string;
  }) => (
    <input
      data-testid={id || 'date-picker'}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Мок bookingUtils - БЕЗ any!
vi.mock('./bookingUtils', () => ({
  sortBookingsByCheckIn: (bookings: Booking[]) => 
    [...bookings].sort((a: Booking, b: Booking) => 
      new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
    ),
}));

// Мок utils
vi.mock('../../utils/datePicker', () => ({
  getTodayStart: () => new Date('2026-01-01'),
  parseIsoDate: (value: string) => value ? new Date(value) : null,
}));

vi.mock('../../utils/notifyApiError', () => ({
  notifyApiError: vi.fn(),
}));

vi.mock('../../services/notification/notificationService', () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe('BookingHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBookingsResponse = {
    data: {
      bookings: [
        {
          id: 1,
          room_id: 1,
          hotel_id: 1,
          check_in: '2026-06-15',
          check_out: '2026-06-20',
          total_price: '60000',
          status: 'pending' as const,
        },
      ],
      user_login: 'test@example.com',
      user_first_name: 'Иван',
      user_last_name: 'Петров',
    },
  };

  const mockRoomsResponse = {
    data: [
      {
        id: 1,
        name: 'Люкс',
        hotel_name: 'Гранд Отель',
        hotel_image_url: 'https://example.com/hotel.jpg',
      },
    ],
  };

  it('shows loading state initially', () => {
    mockApiClient.get.mockImplementation(() => new Promise(() => {}));
    
    render(<BookingHistory />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('fetches bookings on mount', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith('/bookings/my', expect.any(Object));
    });
  });

  it('displays user info after loading', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Иван')).toBeInTheDocument();
      expect(screen.getByText('Петров')).toBeInTheDocument();
    });
  });

  it('displays personal info section', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Личные данные')).toBeInTheDocument();
    });
  });

  it('displays bookings section title', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Мои бронирования')).toBeInTheDocument();
    });
  });

  it('displays booking cards', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
      expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
      expect(screen.getByText('Люкс')).toBeInTheDocument();
    });
  });

  it('shows empty state when no bookings', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        bookings: [],
        user_login: 'test@example.com',
        user_first_name: 'Иван',
        user_last_name: 'Петров',
      },
    });

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByText('У вас пока нет бронирований.')).toBeInTheDocument();
    });
  });

  it('shows "Не указано" for missing user info', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        bookings: [],
        user_login: 'test@example.com',
      },
    });

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getAllByText('Не указано').length).toBeGreaterThan(0);
    });
  });

  it('opens cancel modal when cancel is requested', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Отменить'));

    await waitFor(() => {
      expect(screen.getByText('Подтверждение отмены')).toBeInTheDocument();
      expect(screen.getByText('Вы уверены, что хотите отменить бронирование?')).toBeInTheDocument();
    });
  });

  it('closes cancel modal on No button click', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Отменить'));
    
    await waitFor(() => {
      expect(screen.getByText('Подтверждение отмены')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Нет'));

    await waitFor(() => {
      expect(screen.queryByText('Подтверждение отмены')).not.toBeInTheDocument();
    });
  });

  it('calls API to cancel booking on confirm', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);
    mockApiClient.delete.mockResolvedValueOnce({ data: {} });

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Отменить'));
    
    await waitFor(() => {
      expect(screen.getByText('Да, отменить')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Да, отменить'));

    await waitFor(() => {
      expect(mockApiClient.delete).toHaveBeenCalledWith('/bookings/1');
    });
  });

  it('opens payment modal when payment is requested', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Оплатить'));

    await waitFor(() => {
      expect(screen.getByText('Введите номер карты')).toBeInTheDocument();
    });
  });

  it('closes payment modal on close button click', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Оплатить'));
    
    await waitFor(() => {
      expect(screen.getByText('Введите номер карты')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('×'));

    await waitFor(() => {
      expect(screen.queryByText('Введите номер карты')).not.toBeInTheDocument();
    });
  });

  it('opens edit modal when edit is requested', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Изменить'));

    await waitFor(() => {
      expect(screen.getByText('Изменить бронирование')).toBeInTheDocument();
    });
  });

  it('closes edit modal on cancel button click', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Изменить'));
    
    await waitFor(() => {
      expect(screen.getByText('Изменить бронирование')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByText('Отмена');
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Изменить бронирование')).not.toBeInTheDocument();
    });
  });

    it('shows validation error when payment fields are empty', async () => {
    mockApiClient.get
      .mockResolvedValueOnce(mockBookingsResponse)
      .mockResolvedValueOnce(mockRoomsResponse);

    render(<BookingHistory />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-1')).toBeInTheDocument();
    });

    // Кликаем на "Оплатить" в карточке (первый)
    const allPayButtons = screen.getAllByText('Оплатить');
    fireEvent.click(allPayButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Введите номер карты')).toBeInTheDocument();
    });

    // Теперь кликаем на "Оплатить" в модалке (последний)
    const modalPayButtons = screen.getAllByText('Оплатить');
    fireEvent.click(modalPayButtons[modalPayButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Заполните все поля оплаты.')).toBeInTheDocument();
    });
  });
});