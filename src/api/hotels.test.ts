import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getHotels, getLocationSuggestions } from './hotels'

// Мок fetch
const mockFetch = vi.fn()
;(globalThis as any).fetch = mockFetch

describe('getHotels', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('calls fetch with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hotels: [] }),
    })

    const params = new URLSearchParams({ page: '1', page_size: '10' })
    await getHotels(params)

    expect(mockFetch).toHaveBeenCalledWith(
      '/hotels/?page=1&page_size=10',
      expect.objectContaining({
        method: 'GET',
      })
    )
  })

  it('sends correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hotels: [] }),
    })

    const params = new URLSearchParams()
    await getHotels(params)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'accept': 'application/json',
        },
      })
    )
  })

  it('returns hotels data on success', async () => {
    const mockResponse = {
      hotels: [
        { id: 1, name: 'Отель 1' },
        { id: 2, name: 'Отель 2' },
      ],
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const params = new URLSearchParams()
    const result = await getHotels(params)

    expect(result).toEqual(mockResponse)
  })

  it('throws error on failed request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Ошибка сервера' }),
    })

    const params = new URLSearchParams()
    await expect(getHotels(params)).rejects.toThrow('Ошибка сервера')
  })

  it('throws default error message when no detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    })

    const params = new URLSearchParams()
    await expect(getHotels(params)).rejects.toThrow('Ошибка при загрузке отелей')
  })
})

describe('getLocationSuggestions', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('calls fetch with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ suggestions: [] }),
    })

    await getLocationSuggestions('Москва')

    expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/hotels/locations/suggest?q='),
        expect.objectContaining({
        method: 'GET',
        })
    )
    })

  it('passes abort signal when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ suggestions: [] }),
    })

    const controller = new AbortController()
    await getLocationSuggestions('Москва', controller.signal)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: controller.signal,
      })
    )
  })

  it('returns suggestions on success', async () => {
    const mockResponse = {
      suggestions: ['Москва', 'Мурманск', 'Магадан'],
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await getLocationSuggestions('М')

    expect(result).toEqual(mockResponse)
  })

  it('throws error on failed request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Ошибка поиска' }),
    })

    await expect(getLocationSuggestions('Москва')).rejects.toThrow('Ошибка поиска')
  })

  it('throws default error message when no detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await expect(getLocationSuggestions('Москва')).rejects.toThrow(
      'Ошибка при загрузке подсказок локаций'
    )
  })
})