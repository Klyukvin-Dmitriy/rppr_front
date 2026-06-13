import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockLogin, mockRegister } from './mockAuth'

describe('mockLogin', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('returns user data for valid credentials', async () => {
    const loginPromise = mockLogin('admin@example.com', 'admin123')
    vi.advanceTimersByTime(500)
    const result = await loginPromise

    expect(result).toHaveProperty('access_token')
    expect(result).toHaveProperty('first_name')
    expect(result).toHaveProperty('last_name')
    expect(result).toHaveProperty('is_manager')
    expect(result.is_manager).toBe(true)
  })

  it('returns non-manager user for regular credentials', async () => {
    const loginPromise = mockLogin('e.resetto291@gmail.com', 'password123')
    vi.advanceTimersByTime(500)
    const result = await loginPromise

    expect(result.is_manager).toBe(false)
    expect(result.first_name).toBe('Иван')
    expect(result.last_name).toBe('Петров')
  })

  it('throws error for invalid credentials', async () => {
    const loginPromise = mockLogin('wrong@example.com', 'wrongpass')
    vi.advanceTimersByTime(500)
    
    await expect(loginPromise).rejects.toThrow('Неверный email или пароль')
  })

  it('throws error for wrong password', async () => {
    const loginPromise = mockLogin('admin@example.com', 'wrongpass')
    vi.advanceTimersByTime(500)
    
    await expect(loginPromise).rejects.toThrow('Неверный email или пароль')
  })

  it('generates JWT token with 3 parts', async () => {
    const loginPromise = mockLogin('admin@example.com', 'admin123')
    vi.advanceTimersByTime(500)
    const result = await loginPromise

    const tokenParts = result.access_token.split('.')
    expect(tokenParts).toHaveLength(3)
  })

  it('simulates network delay', async () => {
    const startTime = Date.now()
    const loginPromise = mockLogin('admin@example.com', 'admin123')
    vi.advanceTimersByTime(500)
    await loginPromise
    const endTime = Date.now()

    expect(endTime - startTime).toBeGreaterThanOrEqual(500)
  })
})

describe('mockRegister', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('registers new user successfully', async () => {
  const uniqueEmail = `newuser-${Date.now()}-${Math.random()}@example.com`
  const registerPromise = mockRegister({
    login: uniqueEmail,
    password: 'newpass123',
    first_name: 'Новый',
    last_name: 'Пользователь',
  })
  vi.advanceTimersByTime(500)
  const result = await registerPromise

  expect(result).toHaveProperty('id')
  expect(result.login).toBe(uniqueEmail)
  expect(result.first_name).toBe('Новый')
  expect(result.last_name).toBe('Пользователь')
  expect(result.is_manager).toBe(false)
})

        it('returns user with is_manager false', async () => {
        const uniqueEmail = `manager-test-${Date.now()}-${Math.random()}@example.com`
        const registerPromise = mockRegister({
        login: uniqueEmail,
        password: 'testpass',
        first_name: 'Тест',
        last_name: 'Тестов',
    })
    vi.advanceTimersByTime(500)
     const result = await registerPromise

    expect(result.is_manager).toBe(false)
    })

  it('simulates network delay', async () => {
  const uniqueEmail = `delay-test-${Date.now()}-${Math.random()}@example.com`
  const startTime = Date.now()
  const registerPromise = mockRegister({
    login: uniqueEmail,
    password: 'testpass',
    first_name: 'Тест',
    last_name: 'Тестов',
  })
  vi.advanceTimersByTime(500)
  await registerPromise
  const endTime = Date.now()

  expect(endTime - startTime).toBeGreaterThanOrEqual(500)
})
})