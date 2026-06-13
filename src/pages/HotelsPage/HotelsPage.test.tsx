import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HotelsPage from './HotelsPage';
import { getHotels } from '../../api/hotels';
import { notifyApiError } from '../../utils/notifyApiError';

// Мок CSS
vi.mock('./HotelsPage.module.css', () => ({
  default: {
    hotelsPage: 'hotelsPage',
    searchBar: 'searchBar',
    inputWrapper: 'inputWrapper',
    searchInput: 'searchInput',
    searchInputNumber: 'searchInputNumber',
    clearInputButton: 'clearInputButton',
    searchButton: 'searchButton',
    clearAllButton: 'clearAllButton',
    filterError: 'filterError',
    hotelGrid: 'hotelGrid',
    datePickerWrapper: 'datePickerWrapper',
  },
}));

// Мок API
vi.mock('../../api/hotels', () => ({
  getHotels: vi.fn(),
}));

vi.mock('../../utils/notifyApiError', () => ({
  notifyApiError: vi.fn(),
}));

// Мок компонентов
vi.mock('../../components/HotelCard/HotelCard', () => ({
  default: ({ hotel }: { hotel: { id: number; name: string } }) => (
    <div data-testid="hotel-card">{hotel.name}</div>
  ),
}));

vi.mock('../../components/Pagination/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}));

vi.mock('../../components/DatePickerField/DatePickerField', () => ({
  DatePickerField: ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => (
    <input
      data-testid={`date-picker-${placeholder}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('./LocationFilterInput', () => ({
  LocationFilterInput: ({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (value: string) => void }) => (
    <input
      data-testid="location-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const mockGetHotels = vi.mocked(getHotels);
const mockNotifyApiError = vi.mocked(notifyApiError);

const mockHotelsResponse = {
  total: 2,
  hotels: [
    {
      id: 1,
      name: 'Гранд Отель',
      location: 'Москва',
      description: 'Роскошный отель',
      image_url: 'https://example.com/hotel1.jpg',
      rooms: [{ price_per_night: '5000' }],
    },
    {
      id: 2,
      name: 'Морской Курорт',
      location: 'Сочи',
      description: 'Отель у моря',
      image_url: 'https://example.com/hotel2.jpg',
      rooms: [{ price_per_night: '7000' }],
    },
  ],
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('HotelsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search bar with all filters', () => {
    mockGetHotels.mockResolvedValueOnce({ total: 0, hotels: [] });

    renderWithRouter(<HotelsPage />);

    expect(screen.getByPlaceholderText('Локация')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Цена от')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Цена до')).toBeInTheDocument();
  });

  it('loads hotels on mount', async () => {
    mockGetHotels.mockResolvedValueOnce(mockHotelsResponse);

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(mockGetHotels).toHaveBeenCalled();
    });
  });

  it('displays hotels after loading', async () => {
    mockGetHotels.mockResolvedValueOnce(mockHotelsResponse);

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
      expect(screen.getByText('Морской Курорт')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockGetHotels.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<HotelsPage />);

    expect(screen.getByText(/загрузка отелей/i)).toBeInTheDocument();
  });

  it('shows empty state when no hotels', async () => {
    mockGetHotels.mockResolvedValueOnce({ total: 0, hotels: [] });

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByText(/отелей не найдено/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed load', async () => {
    mockGetHotels.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(mockNotifyApiError).toHaveBeenCalled();
    });
  });

  it('calls getHotels with correct params', async () => {
    mockGetHotels.mockResolvedValueOnce(mockHotelsResponse);

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(mockGetHotels).toHaveBeenCalledWith(expect.any(URLSearchParams));
    });
  });

  it('renders pagination when there are multiple pages', async () => {
    const largeResponse = {
      total: 25,
      hotels: mockHotelsResponse.hotels,
    };
    mockGetHotels.mockResolvedValueOnce(largeResponse);

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  it('clears location input', async () => {
    mockGetHotels.mockResolvedValueOnce(mockHotelsResponse);

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Локация')).toBeInTheDocument();
    });

    const locationInput = screen.getByPlaceholderText('Локация');
    fireEvent.change(locationInput, { target: { value: 'Москва' } });

    const clearButton = screen.getByText('×');
    fireEvent.click(clearButton);

    expect(locationInput).toHaveValue('');
  });

  it('clears all filters', async () => {
    mockGetHotels.mockResolvedValueOnce(mockHotelsResponse);

    renderWithRouter(<HotelsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Локация')).toBeInTheDocument();
    });

    const clearAllButton = screen.getByText(/очистить все/i);
    fireEvent.click(clearAllButton);

    expect(screen.getByPlaceholderText('Локация')).toHaveValue('');
  });
});