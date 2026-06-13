import { describe, it, expect } from 'vitest'
import { parseIsoDate, getTodayStart } from './datePicker'

describe('parseIsoDate', () => {
  it('parses valid ISO date string', () => {
    const result = parseIsoDate('2026-06-15')
    expect(result).toBeInstanceOf(Date)
    expect(result?.getFullYear()).toBe(2026)
    expect(result?.getMonth()).toBe(5) // June = 5
    expect(result?.getDate()).toBe(15)
  })

  it('returns null for empty string', () => {
    expect(parseIsoDate('')).toBeNull()
  })

  it('returns null for invalid date', () => {
    expect(parseIsoDate('invalid-date')).toBeNull()
  })

  it('returns null for empty value', () => {
    // @ts-expect-error testing invalid input
    expect(parseIsoDate(null)).toBeNull()
    // @ts-expect-error testing invalid input
    expect(parseIsoDate(undefined)).toBeNull()
  })

  it('sets time to midnight', () => {
    const result = parseIsoDate('2026-06-15')
    expect(result?.getHours()).toBe(0)
    expect(result?.getMinutes()).toBe(0)
    expect(result?.getSeconds()).toBe(0)
  })
})

describe('getTodayStart', () => {
  it('returns Date object', () => {
    const result = getTodayStart()
    expect(result).toBeInstanceOf(Date)
  })

  it('sets hours to 0', () => {
    const result = getTodayStart()
    expect(result.getHours()).toBe(0)
  })

  it('sets minutes to 0', () => {
    const result = getTodayStart()
    expect(result.getMinutes()).toBe(0)
  })

  it('sets seconds to 0', () => {
    const result = getTodayStart()
    expect(result.getSeconds()).toBe(0)
  })

  it('sets milliseconds to 0', () => {
    const result = getTodayStart()
    expect(result.getMilliseconds()).toBe(0)
  })

  it('returns today date', () => {
    const result = getTodayStart()
    const today = new Date()
    expect(result.getFullYear()).toBe(today.getFullYear())
    expect(result.getMonth()).toBe(today.getMonth())
    expect(result.getDate()).toBe(today.getDate())
  })
})