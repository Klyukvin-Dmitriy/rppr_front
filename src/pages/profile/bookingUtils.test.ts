import { describe, it, expect } from 'vitest'
import { formatBookingDate, isBookingExpired, sortBookingsByCheckIn } from './bookingUtils'
import type { Booking } from './types'

describe('formatBookingDate', () => {
  it('formats date correctly', () => {
    expect(formatBookingDate('2026-06-15T12:00:00')).toBe('15.06.2026')
  })

  it('returns dash for empty string', () => {
    expect(formatBookingDate('')).toBe('—')
  })
})

describe('isBookingExpired', () => {
  it('returns true for past booking', () => {
    const booking: Booking = {
      id: 1,
      hotel_id: 1,
      room_id: 1,
      check_in: '2024-01-01',
      check_out: '2024-01-05',
      total_price: '5000',
      status: 'completed',
      hotel_name: 'Гранд Отель',
      room_name: 'Стандарт',
    }
    expect(isBookingExpired(booking)).toBe(true)
  })

  it('returns false for future booking', () => {
    const booking: Booking = {
      id: 2,
      hotel_id: 1,
      room_id: 1,
      check_in: '2030-01-01',
      check_out: '2030-01-05',
      total_price: '5000',
      status: 'confirmed',
      hotel_name: 'Морской Курорт',
      room_name: 'Люкс',
    }
    expect(isBookingExpired(booking)).toBe(false)
  })

  it('returns false for pending booking in future', () => {
    const booking: Booking = {
      id: 3,
      hotel_id: 1,
      room_id: 1,
      check_in: '2030-06-01',
      check_out: '2030-06-10',
      total_price: '8000',
      status: 'pending',
    }
    expect(isBookingExpired(booking)).toBe(false)
  })

  it('returns true for cancelled past booking', () => {
    const booking: Booking = {
      id: 4,
      hotel_id: 1,
      room_id: 1,
      check_in: '2020-01-01',
      check_out: '2020-01-05',
      total_price: '2000',
      status: 'cancelled',
    }
    expect(isBookingExpired(booking)).toBe(true)
  })
})

describe('sortBookingsByCheckIn', () => {
  it('sorts bookings by check_in date ascending', () => {
    const bookings: Booking[] = [
      {
        id: 1,
        hotel_id: 1,
        room_id: 1,
        check_in: '2026-06-15',
        check_out: '2026-06-20',
        total_price: '5000',
        status: 'confirmed',
      },
      {
        id: 2,
        hotel_id: 1,
        room_id: 1,
        check_in: '2026-01-01',
        check_out: '2026-01-05',
        total_price: '3000',
        status: 'completed',
      },
      {
        id: 3,
        hotel_id: 1,
        room_id: 1,
        check_in: '2026-03-10',
        check_out: '2026-03-15',
        total_price: '4000',
        status: 'pending',
      },
    ]
    const sorted = sortBookingsByCheckIn(bookings)
    expect(sorted[0].id).toBe(2)
    expect(sorted[1].id).toBe(3)
    expect(sorted[2].id).toBe(1)
  })

  it('does not mutate original array', () => {
    const bookings: Booking[] = [
      {
        id: 1,
        hotel_id: 1,
        room_id: 1,
        check_in: '2026-06-15',
        check_out: '2026-06-20',
        total_price: '5000',
        status: 'confirmed',
      },
      {
        id: 2,
        hotel_id: 1,
        room_id: 1,
        check_in: '2026-01-01',
        check_out: '2026-01-05',
        total_price: '3000',
        status: 'completed',
      },
    ]
    const original = [...bookings]
    sortBookingsByCheckIn(bookings)
    expect(bookings).toEqual(original)
  })

  it('handles empty array', () => {
    const bookings: Booking[] = []
    const sorted = sortBookingsByCheckIn(bookings)
    expect(sorted).toEqual([])
  })

  it('handles single element array', () => {
    const bookings: Booking[] = [
      {
        id: 1,
        hotel_id: 1,
        room_id: 1,
        check_in: '2026-06-15',
        check_out: '2026-06-20',
        total_price: '5000',
        status: 'confirmed',
      },
    ]
    const sorted = sortBookingsByCheckIn(bookings)
    expect(sorted).toHaveLength(1)
    expect(sorted[0].id).toBe(1)
  })
})