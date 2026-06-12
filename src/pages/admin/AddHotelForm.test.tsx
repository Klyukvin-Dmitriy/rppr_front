import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AddHotelForm } from './AddHotelForm';
import { AuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';

vi.mock('./AddHotelForm.module.css', () => ({
  default: new Proxy({}, { get: (_t, prop) => String(prop) }),
}));

vi.mock('../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

const mockAuthContext = {
  user: {
    login: 'admin@example.com',
    first_name: 'Админ',
    last_name: 'Системов',
    is_manager: true,
  },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AddHotelForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form title', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddHotelForm />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/добавление.*отеля/i)).toBeInTheDocument();
  });

  it('renders all input fields', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddHotelForm />
      </AuthContext.Provider>
    );
    expect(screen.getByLabelText(/название отеля/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/локация/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { id: 1 } });

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddHotelForm />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/название отеля/i), {
      target: { value: 'Новый Отель' },
    });
    fireEvent.change(screen.getByLabelText(/локация/i), {
      target: { value: 'Москва' },
    });
    fireEvent.change(screen.getByLabelText(/описание/i), {
      target: { value: 'Отличный отель' },
    });
    fireEvent.change(screen.getByLabelText(/url изображения/i), {
      target: { value: 'https://example.com/hotel.jpg' },
    });

    fireEvent.click(screen.getByText(/добавить отель/i));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalled();
    });
  });

  it('shows error message on failed submission', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Ошибка'));

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddHotelForm />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/название отеля/i), {
      target: { value: 'Новый Отель' },
    });
    fireEvent.change(screen.getByLabelText(/локация/i), {
      target: { value: 'Москва' },
    });
    fireEvent.change(screen.getByLabelText(/описание/i), {
      target: { value: 'Отличный отель' },
    });
    fireEvent.change(screen.getByLabelText(/url изображения/i), {
      target: { value: 'https://example.com/hotel.jpg' },
    });

    fireEvent.click(screen.getByText(/добавить отель/i));

    await waitFor(() => {
      expect(screen.getByText(/не удалось добавить|ошибка/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddHotelForm />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/добавить отель/i));

    expect(mockApiClient.post).not.toHaveBeenCalled();
  });
});