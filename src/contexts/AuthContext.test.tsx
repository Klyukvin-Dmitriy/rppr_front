import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { useAuth } from '../../src/hooks/useAuth';
import * as authApi from '../../src/api/auth';
import * as client from '../../src/api/client';
import * as jwt from '../../src/utils/jwt';

// Моки
vi.mock('../../src/api/auth');
vi.mock('../../src/api/client');
vi.mock('../../src/utils/jwt');

const mockLogin = vi.mocked(authApi.login);
const mockRegister = vi.mocked(authApi.register);
const mockGetAccessToken = vi.mocked(client.getAccessToken);
const mockSetAccessToken = vi.mocked(client.setAccessToken);
const mockClearAuthStorage = vi.mocked(client.clearAuthStorage);

const mockGetJwtPayload = vi.mocked(jwt.getJwtPayload);
const mockGetUserIdFromToken = vi.mocked(jwt.getUserIdFromToken);
const mockGetIsManagerFromToken = vi.mocked(jwt.getIsManagerFromToken);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  // Связываем setAccessToken и getAccessToken через общую переменную
  let storedToken: string | null = null;

  beforeEach(() => {
    storedToken = null;
    vi.clearAllMocks();
    localStorage.clear();

    // Ключевое исправление: setAccessToken сохраняет токен, getAccessToken его возвращает
    mockSetAccessToken.mockImplementation((token) => {
      storedToken = token;
    });
    mockGetAccessToken.mockImplementation(() => storedToken);
  });

  describe('useAuth', () => {
    it('throws error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');
    });

    it('returns null user when not authenticated', () => {
      storedToken = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('loads user from localStorage when token exists', () => {
      const mockUser = {
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      };
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      storedToken = 'valid-token';
      mockGetIsManagerFromToken.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('calls API and sets user on success', async () => {
      mockLogin.mockResolvedValue({
        access_token: 'new-token',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      });
      mockGetUserIdFromToken.mockReturnValue(1);
      mockGetJwtPayload.mockReturnValue({
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      });
      mockGetIsManagerFromToken.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockSetAccessToken).toHaveBeenCalledWith('new-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.login).toBe('test@example.com');
    });

    it('throws error when login fails', async () => {
      mockLogin.mockRejectedValue(new Error('Неверный пароль'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await expect(
          result.current.login('test@example.com', 'wrong')
        ).rejects.toThrow('Неверный пароль');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('throws error when token has no user id', async () => {
      mockLogin.mockResolvedValue({
        access_token: 'invalid-token',
        first_name: 'Иван',
        last_name: 'Петров',
      });
      mockGetUserIdFromToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await expect(
          result.current.login('test@example.com', 'password')
        ).rejects.toThrow('Не удалось прочитать id пользователя из токена');
      });
    });
  });

  describe('register', () => {
    it('calls API and logs in user', async () => {
      mockRegister.mockResolvedValue({
        id: 1,
        login: 'new@example.com',
        first_name: 'Новый',
        last_name: 'Пользователь',
        is_manager: false,
      });
      mockLogin.mockResolvedValue({
        access_token: 'new-token',
        first_name: 'Новый',
        last_name: 'Пользователь',
        is_manager: false,
      });
      mockGetUserIdFromToken.mockReturnValue(1);
      mockGetJwtPayload.mockReturnValue({
        login: 'new@example.com',
        first_name: 'Новый',
        last_name: 'Пользователь',
        is_manager: false,
      });
      mockGetIsManagerFromToken.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register({
          login: 'new@example.com',
          password: 'password123',
          first_name: 'Новый',
          last_name: 'Пользователь',
          is_manager: false,
        });
      });

      expect(mockRegister).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('throws error when register fails', async () => {
      mockRegister.mockRejectedValue(new Error('Email уже занят'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await expect(
          result.current.register({
            login: 'existing@example.com',
            password: 'password123',
            first_name: 'Тест',
            last_name: 'Тестов',
            is_manager: false,
          })
        ).rejects.toThrow('Email уже занят');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears storage and user', () => {
      const mockUser = {
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      };
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      storedToken = 'valid-token';

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(mockClearAuthStorage).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('auth:logout event', () => {
    it('clears user when event is dispatched', async () => {
      const mockUser = {
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      };
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      storedToken = 'valid-token';

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('is_manager flag', () => {
    it('sets is_manager from token', async () => {
      mockLogin.mockResolvedValue({
        access_token: 'admin-token',
        first_name: 'Админ',
        last_name: 'Системов',
        is_manager: true,
      });
      mockGetUserIdFromToken.mockReturnValue(1);
      mockGetJwtPayload.mockReturnValue({
        login: 'admin@example.com',
        first_name: 'Админ',
        last_name: 'Системов',
        is_manager: true,
      });
      mockGetIsManagerFromToken.mockReturnValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin@example.com', 'admin123');
      });

      expect(result.current.user?.is_manager).toBe(true);
    });
  });
});