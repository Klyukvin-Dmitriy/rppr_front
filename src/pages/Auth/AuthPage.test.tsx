import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from './AuthPage';
import { AuthContext } from '../../contexts/AuthContext';

// Моки
const mockLogin = vi.fn();
const mockRegister = vi.fn();

const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: mockLogin,
  register: mockRegister,
  logout: vi.fn(),
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login form', () => {
    it('renders login form when initialIsLogin is true', () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      expect(screen.getByText('Авторизация')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('shows validation error for empty email', async () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/email и пароль обязательны/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email format', async () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/некорректный формат email/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for short password', async () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: '123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(screen.getByText(/пароль должен содержать не менее 6 символов/i)).toBeInTheDocument();
      });
    });

    it('calls login with correct credentials', async () => {
      mockLogin.mockResolvedValue(undefined);

      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('shows error message when login fails', async () => {
      mockLogin.mockRejectedValue(new Error('Неверный пароль'));

      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'wrongpassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: /войти/i }));

      await waitFor(() => {
        expect(screen.getByText('Неверный пароль')).toBeInTheDocument();
      });
    });
  });

  describe('Register form', () => {
    it('renders register form when initialIsLogin is false', () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={false} />
        </AuthContext.Provider>
      );

      expect(screen.getByText('Регистрация')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Фамилия')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Повторите пароль')).toBeInTheDocument();
    });

    it('shows validation error for missing name fields', async () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={false} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

      await waitFor(() => {
        expect(screen.getByText(/имя и фамилия обязательны/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when passwords do not match', async () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={false} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Имя'), {
        target: { value: 'Иван' },
      });
      fireEvent.change(screen.getByPlaceholderText('Фамилия'), {
        target: { value: 'Петров' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), {
        target: { value: 'different' },
      });

      fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

      await waitFor(() => {
        expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument();
      });
    });

    it('calls register with correct data', async () => {
      mockRegister.mockResolvedValue({ id: 1, login: 'test@example.com' });

      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={false} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Имя'), {
        target: { value: 'Иван' },
      });
      fireEvent.change(screen.getByPlaceholderText('Фамилия'), {
        target: { value: 'Петров' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          login: 'test@example.com',
          password: 'password123',
          first_name: 'Иван',
          last_name: 'Петров',
          is_manager: false,
        });
      });
    });

    it('translates "Login already exists" error', async () => {
      mockRegister.mockRejectedValue(new Error('Login already exists'));

      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={false} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Имя'), {
        target: { value: 'Иван' },
      });
      fireEvent.change(screen.getByPlaceholderText('Фамилия'), {
        target: { value: 'Петров' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

      await waitFor(() => {
        expect(screen.getByText(/пользователь с таким email уже существует/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('shows link to register when in login mode', () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      expect(screen.getByText(/нет аккаунта/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /зарегистрироваться/i })).toHaveAttribute(
        'href',
        '/register'
      );
    });

    it('shows link to login when in register mode', () => {
      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={false} />
        </AuthContext.Provider>
      );

      expect(screen.getByText(/есть аккаунт/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /войти/i })).toHaveAttribute('href', '/login');
    });
  });

    describe('Loading state', () => {
    it('disables submit button when loading', async () => {
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      renderWithRouter(
        <AuthContext.Provider value={mockAuthContext}>
          <AuthPage initialIsLogin={true} />
        </AuthContext.Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' },
      });

      // Получаем кнопку ДО нажатия (когда она ещё не disabled)
      const submitButton = screen.getByRole('button', { name: /войти/i });
      fireEvent.click(submitButton);

      // Теперь кнопка стала "Загрузка..." и disabled
      await waitFor(() => {
        const loadingButton = screen.getByRole('button');
        expect(loadingButton).toBeDisabled();
      });

      resolveLogin!();
    });
  });
});