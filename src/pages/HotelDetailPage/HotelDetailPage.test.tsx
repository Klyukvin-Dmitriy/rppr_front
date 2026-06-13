import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HotelDetailPage } from './HotelDetailPage';
import { AuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';

vi.mock('./HotelDetailPage.module.css', () => ({
  default: new Proxy({}, { get: (_t, prop) => String(prop) }),
}));

vi.mock('../../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('./ImageWithFallback', () => ({
  ImageWithFallback: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="image-fallback" />
  ),
}));

vi.mock('./RoomList', () => ({
  RoomList: () => <div data-testid="room-list">Room List</div>,
}));

vi.mock('./RecommendedRooms', () => ({
  RecommendedRooms: () => <div data-testid="recommended-rooms">Recommended</div>,
}));

vi.mock('./PaymentModal', () => ({
  PaymentModal: () => <div data-testid="payment-modal">Payment</div>,
}));

vi.mock('../../components/DatePickerField/DatePickerField', () => ({
  DatePickerField: () => <input data-testid="date-picker" />,
}));

vi.mock('./paymentMasks', () => ({
  isPaymentFormComplete: () => true,
}));

vi.mock('../../utils/notifyApiError', () => ({
  notifyApiError: vi.fn(),
}));

vi.mock('../../services/notification/notificationService', () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../utils/getErrorMessage', () => ({
  getErrorMessage: () => 'Ошибка',
}));

vi.mock('../../utils/datePicker', () => ({
  getTodayStart: () => new Date('2026-01-01'),
  parseIsoDate: () => null,
}));

const mockApiClient = vi.mocked(apiClient);

const mockAuthContext = {
  user: {
    login: 'test@example.com',
    first_name: 'Иван',
    last_name: 'Петров',
    is_manager: false,
  },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const mockRooms = [
  {
    id: 1,
    name: 'Стандарт',
    description: 'Обычный номер',
    price_per_night: '5000',
    capacity: 2,
    hotel_name: 'Гранд Отель',
    hotel_description: 'Роскошный отель',
    image_url: 'https://example.com/room1.jpg',
    hotel_image_url: 'https://example.com/hotel.jpg',
  },
];

const mockRecommendations = [
  {
    id: 2,
    name: 'Люкс',
    price_per_night: 12000,
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={['/hotel/1']}>
      <Routes>
        <Route path="/hotel/:hotelId" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('HotelDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockApiClient.get.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <HotelDetailPage />
      </AuthContext.Provider>,
    );

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('loads rooms on mount', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({ data: mockRooms })
      .mockResolvedValueOnce({ data: mockRecommendations });

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <HotelDetailPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith('/hotels/1/rooms');
    });
  });

  it('displays hotel name', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({ data: mockRooms })
      .mockResolvedValueOnce({ data: mockRecommendations });

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <HotelDetailPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
    });
  });

  it('displays room name', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({ data: mockRooms })
      .mockResolvedValueOnce({ data: mockRecommendations });

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <HotelDetailPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Стандарт')).toBeInTheDocument();
    });
  });

  it('shows message when no rooms available', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: [] });

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <HotelDetailPage />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/нет доступных/i)).toBeInTheDocument();
    });
  });
});