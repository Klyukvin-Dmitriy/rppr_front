import { describe, it, expect } from 'vitest'
import { getErrorMessage } from './getErrorMessage'
import { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

describe('getErrorMessage', () => {
  it('returns empty string for canceled error', () => {
    const error = new DOMException('Canceled', 'AbortError')
    expect(getErrorMessage(error)).toBe('')
  })

  it('returns detail string from AxiosError', () => {
    const error = new AxiosError('Error')
    error.response = {
      data: { detail: 'Invalid credentials' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    }
    expect(getErrorMessage(error)).toBe('Invalid credentials')
  })

  it('returns joined messages from array detail', () => {
    const error = new AxiosError('Error')
    error.response = {
      data: { detail: [{ msg: 'Error 1' }, { msg: 'Error 2' }] },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    }
    expect(getErrorMessage(error)).toBe('Error 1, Error 2')
  })

  it('returns "Нет соединения с сервером" when no response', () => {
    const error = new AxiosError('Error')
    expect(getErrorMessage(error)).toBe('Нет соединения с сервером')
  })

  it('returns fallback when no detail', () => {
    const error = new AxiosError('Error')
    error.response = {
      data: {},
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    }
    expect(getErrorMessage(error)).toBe('Произошла ошибка')
  })

  it('returns custom fallback', () => {
    const error = new AxiosError('Error')
    error.response = {
      data: {},
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    }
    expect(getErrorMessage(error, 'Custom error')).toBe('Custom error')
  })

  it('returns error message for Error instance', () => {
    const error = new Error('Test error message')
    expect(getErrorMessage(error)).toBe('Test error message')
  })

  it('returns fallback for unknown error', () => {
    expect(getErrorMessage('string error')).toBe('Произошла ошибка')
  })

  it('returns fallback for null', () => {
    expect(getErrorMessage(null)).toBe('Произошла ошибка')
  })
})