import { describe, it, expect } from 'vitest'
import { STORAGE_ACCESS_TOKEN, STORAGE_AUTH_USER } from './storage'

describe('Storage Constants', () => {
  it('STORAGE_ACCESS_TOKEN has correct value', () => {
    expect(STORAGE_ACCESS_TOKEN).toBe('accessToken')
  })

  it('STORAGE_AUTH_USER has correct value', () => {
    expect(STORAGE_AUTH_USER).toBe('authUser')
  })

  it('constants are strings', () => {
    expect(typeof STORAGE_ACCESS_TOKEN).toBe('string')
    expect(typeof STORAGE_AUTH_USER).toBe('string')
  })

  it('constants are not empty', () => {
    expect(STORAGE_ACCESS_TOKEN.length).toBeGreaterThan(0)
    expect(STORAGE_AUTH_USER.length).toBeGreaterThan(0)
  })
})