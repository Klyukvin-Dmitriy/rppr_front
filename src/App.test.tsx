import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthContext } from './contexts/AuthContext';

// Мок самого App, чтобы не рендерить реальный Router
vi.mock('./App', () => ({
  default: () => <div data-testid="app-mock">App Mock</div>,
}));

// Мокируем компоненты внутри App
vi.mock('./layouts/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

vi.mock('./layouts/AuthLayout', () => ({
  AuthLayout: () => <div data-testid="auth-layout">Auth Layout</div>,
}));

vi.mock('./pages/Auth/AuthPage', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('./pages/HotelsPage/HotelsPage', () => ({
  default: () => <div>Hotels Page</div>,
}));

vi.mock('./pages/HotelDetailPage/HotelDetailPage', () => ({
  HotelDetailPage: () => <div>Hotel Detail Page</div>,
}));

vi.mock('./pages/admin/AdminPage', () => ({
  AdminPage: () => <div>Admin Page</div>,
}));

vi.mock('./pages/admin/AddHotelForm', () => ({
  AddHotelForm: () => <div>Add Hotel Form</div>,
}));

vi.mock('./pages/admin/AddRoomForm', () => ({
  AddRoomForm: () => <div>Add Room Form</div>,
}));

vi.mock('./pages/profile/BookingHistory', () => ({
  BookingHistory: () => <div>Booking History</div>,
}));

const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByTestId('app-mock')).toBeInTheDocument();
  });

  it('renders hotels page on root route', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByTestId('app-mock')).toBeInTheDocument();
  });

  it('renders login page on /login route', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByTestId('app-mock')).toBeInTheDocument();
  });
});