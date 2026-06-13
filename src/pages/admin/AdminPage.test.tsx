import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AddRoomForm } from './AddRoomForm';
import { AuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';

vi.mock('./AddRoomForm.module.css', () => ({
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

describe('AddRoomForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form title', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddRoomForm />
      </AuthContext.Provider>
    );
    expect(screen.getByText(/добавление номера/i)).toBeInTheDocument();
  });

  it('renders all input fields', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddRoomForm />
      </AuthContext.Provider>
    );
    expect(screen.getByLabelText(/название номера/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/цена за ночь/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/вместимость/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { id: 1 } });

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddRoomForm />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/id отеля/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/название номера/i), {
      target: { value: 'Люкс' },
    });
    fireEvent.change(screen.getByLabelText(/описание/i), {
      target: { value: 'Роскошный номер' },
    });
    fireEvent.change(screen.getByLabelText(/цена за ночь/i), {
      target: { value: '12000' },
    });
    fireEvent.change(screen.getByLabelText(/вместимость/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/url изображения/i), {
      target: { value: 'https://example.com/room.jpg' },
    });

    fireEvent.click(screen.getByText(/добавить номер/i));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalled();
    });
  });

  it('shows error message on failed submission', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('Ошибка'));

    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddRoomForm />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/id отеля/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/название номера/i), {
      target: { value: 'Люкс' },
    });
    fireEvent.change(screen.getByLabelText(/описание/i), {
      target: { value: 'Роскошный номер' },
    });
    fireEvent.change(screen.getByLabelText(/цена за ночь/i), {
      target: { value: '12000' },
    });
    fireEvent.change(screen.getByLabelText(/вместимость/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/url изображения/i), {
      target: { value: 'https://example.com/room.jpg' },
    });

    fireEvent.click(screen.getByText(/добавить номер/i));

    await waitFor(() => {
      expect(screen.getByText(/не удалось добавить|ошибка/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <AddRoomForm />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/добавить номер/i));

    expect(mockApiClient.post).not.toHaveBeenCalled();
  });
});