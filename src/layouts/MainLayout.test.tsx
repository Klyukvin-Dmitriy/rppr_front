import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { AuthContext } from '../contexts/AuthContext';

// Мок CSS modules
vi.mock('./MainLayout.module.css', () => ({
  default: {
    mainLayout: 'mainLayout',
    header: 'header',
    brand: 'brand',
    nav: 'nav',
    userMenu: 'userMenu',
    userNameButton: 'userNameButton',
    dropdown: 'dropdown',
    dropdownItem: 'dropdownItem',
    dropdownDivider: 'dropdownDivider',
    navLink: 'navLink',
    separator: 'separator',
  },
}));

const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand link', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout />
      </AuthContext.Provider>
    );
    expect(screen.getByText('RPPR Hotels')).toBeInTheDocument();
  });

  it('shows login and register links when not authenticated', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout />
      </AuthContext.Provider>
    );
    expect(screen.getByText('Вход')).toBeInTheDocument();
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });

  it('shows user name button when authenticated', () => {
    const authContextWithUser = {
      ...mockAuthContext,
      isAuthenticated: true,
      user: {
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      },
    };

    renderWithRouter(
      <AuthContext.Provider value={authContextWithUser}>
        <MainLayout />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Петров И./)).toBeInTheDocument();
  });

  it('opens user menu on button click', () => {
    const authContextWithUser = {
      ...mockAuthContext,
      isAuthenticated: true,
      user: {
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      },
    };

    renderWithRouter(
      <AuthContext.Provider value={authContextWithUser}>
        <MainLayout />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/Петров И./));
    expect(screen.getByText('Мои бронирования')).toBeInTheDocument();
  });

  it('shows admin link for manager users', () => {
    const authContextWithManager = {
      ...mockAuthContext,
      isAuthenticated: true,
      user: {
        login: 'admin@example.com',
        first_name: 'Админ',
        last_name: 'Системов',
        is_manager: true,
      },
    };

    renderWithRouter(
      <AuthContext.Provider value={authContextWithManager}>
        <MainLayout />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/Системов А./));
    expect(screen.getByText('Панель администратора')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    const authContextWithUser = {
      ...mockAuthContext,
      isAuthenticated: true,
      user: {
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      },
    };

    renderWithRouter(
      <AuthContext.Provider value={authContextWithUser}>
        <MainLayout />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/Петров И./));
    fireEvent.click(screen.getByText('Выйти'));
    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  it('shows login as link text', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout />
      </AuthContext.Provider>
    );
    const loginLink = screen.getByText('Вход');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows register as link text', () => {
    renderWithRouter(
      <AuthContext.Provider value={mockAuthContext}>
        <MainLayout />
      </AuthContext.Provider>
    );
    const registerLink = screen.getByText('Регистрация');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});