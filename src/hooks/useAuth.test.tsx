import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'
import { AuthContext } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within AuthProvider')
  })

  it('returns context value when used within provider', () => {
    const mockValue = {
      user: { id: 1, login: 'test@example.com', first_name: 'Test', last_name: 'User', is_manager: false },
      token: 'token123',
      isLoading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={mockValue as never}>
        {children}
      </AuthContext.Provider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current).toEqual(mockValue)
  })
})