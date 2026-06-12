import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useNotification } from './useNotification'

// Мок notificationService
vi.mock('../services/notification/notificationService', () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('useNotification', () => {
  it('returns object with success, error, info methods', () => {
    const { result } = renderHook(() => useNotification())

    expect(result.current).toHaveProperty('success')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('info')
  })

  it('success is a function', () => {
    const { result } = renderHook(() => useNotification())
    expect(typeof result.current.success).toBe('function')
  })

  it('error is a function', () => {
    const { result } = renderHook(() => useNotification())
    expect(typeof result.current.error).toBe('function')
  })

  it('info is a function', () => {
    const { result } = renderHook(() => useNotification())
    expect(typeof result.current.info).toBe('function')
  })

  it('returns same reference on re-render (memoized)', () => {
    const { result, rerender } = renderHook(() => useNotification())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})