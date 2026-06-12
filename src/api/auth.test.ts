import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register, login, refresh } from './auth'
import type { UserCreate } from '../types/auth'

// Мок fetch
const mockFetch = vi.fn()
;(globalThis as any).fetch = mockFetch

describe('register', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('calls fetch with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, login: 'test@example.com' }),
    })

    await register({
      login: 'test@example.com',
      password: 'password123',
      first_name: 'Тест',
      last_name: 'Пользователь',
      is_manager: false,
    } as UserCreate)

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    )
  })

  it('sends correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })

    await register({
      login: 'test@example.com',
      password: 'password123',
      first_name: 'Тест',
      last_name: 'Пользователь',
      is_manager: false,
    } as UserCreate)

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
      })
    )
  })

  it('returns response data on success', async () => {
    const mockResponse = { id: 1, login: 'test@example.com' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await register({
      login: 'test@example.com',
      password: 'password123',
      first_name: 'Тест',
      last_name: 'Пользователь',
      is_manager: false,
    } as UserCreate)

    expect(result).toEqual(mockResponse)
  })

  it('throws error on failed registration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Email уже занят' }),
    })

    await expect(
      register({
        login: 'test@example.com',
        password: 'password123',
        first_name: 'Тест',
        last_name: 'Пользователь',
        is_manager: false,
      } as UserCreate)
    ).rejects.toThrow('Email уже занят')
  })

  it('throws default error message when no detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await expect(
      register({
        login: 'test@example.com',
        password: 'password123',
        first_name: 'Тест',
        last_name: 'Пользователь',
        is_manager: false,
      } as UserCreate)
    ).rejects.toThrow('Ошибка регистрации')
  })
})

describe('login', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('calls fetch with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'token123' }),
    })

    await login('test@example.com', 'password123')

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    )
  })

  it('sends form-urlencoded data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'token123' }),
    })

    await login('test@example.com', 'password123')

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'application/json',
        },
      })
    )
  })

  it('returns LoginResponse on success', async () => {
    const mockResponse = {
      access_token: 'token123',
      first_name: 'Иван',
      last_name: 'Петров',
      is_manager: false,
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await login('test@example.com', 'password123')

    expect(result).toEqual(mockResponse)
  })

  it('throws error on failed login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Неверный пароль' }),
    })

    await expect(login('test@example.com', 'wrongpass')).rejects.toThrow(
      'Неверный пароль'
    )
  })

  it('throws default error message when no detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await expect(login('test@example.com', 'wrongpass')).rejects.toThrow(
      'Ошибка входа'
    )
  })
})

describe('refresh', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('calls fetch with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'newtoken123' }),
    })

    await refresh()

    expect(mockFetch).toHaveBeenCalledWith(
      '/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    )
  })

  it('returns new access token', async () => {
    const mockResponse = {
      access_token: 'newtoken123',
      first_name: 'Иван',
      last_name: 'Петров',
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await refresh()

    expect(result.access_token).toBe('newtoken123')
  })

  it('throws error when token is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: '' }),
    })

    await expect(refresh()).rejects.toThrow('Сервер вернул пустой токен')
  })

  it('throws error on failed refresh', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Токен истёк' }),
    })

    await expect(refresh()).rejects.toThrow('Токен истёк')
  })

  it('throws default error message when no detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await expect(refresh()).rejects.toThrow('Не удалось обновить сессию')
  })
})