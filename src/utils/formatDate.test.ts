import { describe, it, expect } from 'vitest'
import { formatRuDate } from './formatDate'

describe('formatRuDate', () => {
  it('formats ISO date string to Russian format', () => {
    expect(formatRuDate('2026-06-15T12:00:00')).toBe('15.06.2026')
  })

  it('formats date without time', () => {
    expect(formatRuDate('2026-06-15')).toBe('15.06.2026')
  })

  it('returns dash for empty string', () => {
    expect(formatRuDate('')).toBe('—')
  })

  it('returns dash for null/undefined', () => {
    // @ts-expect-error testing invalid input
    expect(formatRuDate(null)).toBe('—')
    // @ts-expect-error testing invalid input
    expect(formatRuDate(undefined)).toBe('—')
  })

  it('handles valid date string', () => {
    expect(formatRuDate('2024-01-01T00:00:00')).toBe('01.01.2024')
  })

  it('handles different months', () => {
    expect(formatRuDate('2026-12-31')).toBe('31.12.2026')
    expect(formatRuDate('2026-01-01')).toBe('01.01.2026')
  })
})