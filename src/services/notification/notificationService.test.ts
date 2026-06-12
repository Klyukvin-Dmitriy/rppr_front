import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { notificationService } from './notificationService'

describe('notificationService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    
    // Очищаем все уведомления перед каждым тестом
    const cleanupListener = vi.fn()
    const cleanupUnsubscribe = notificationService.subscribe(cleanupListener)
    const existingNotifications = cleanupListener.mock.calls[0][0]
    existingNotifications.forEach((n: { id: string }) => {
      notificationService.dismiss(n.id)
    })
    cleanupUnsubscribe()
    
    // Мок crypto.randomUUID
    let counter = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => `id-${++counter}` as any,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('subscribe', () => {
    it('calls listener with current notifications on subscribe', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      expect(listener).toHaveBeenCalledWith([])
      unsubscribe()
    })

    it('returns unsubscribe function', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('does not call listener after unsubscribe', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()
      unsubscribe()
      notificationService.success('test')
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('show', () => {
    it('adds notification and notifies listeners', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.show('success', 'Test message')

      expect(listener).toHaveBeenCalledTimes(1)
      const notifications = listener.mock.calls[0][0]
      expect(notifications).toHaveLength(1)
      expect(notifications[0]).toMatchObject({
        type: 'success',
        message: 'Test message',
      })
      unsubscribe()
    })

    it('does not add notification with empty message', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.show('success', '   ')

      expect(listener).not.toHaveBeenCalled()
      unsubscribe()
    })

    it('auto-dismisses after duration', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.show('success', 'Test', 1000)

      expect(listener).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(1000)

      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener.mock.calls[1][0]).toHaveLength(0)
      unsubscribe()
    })

    it('does not auto-dismiss when duration is 0', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.show('success', 'Test', 0)

      vi.advanceTimersByTime(10000)

      expect(listener).toHaveBeenCalledTimes(1)
      unsubscribe()
    })
  })

  describe('success', () => {
    it('shows success notification', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.success('Success message')

      const notifications = listener.mock.calls[0][0]
      expect(notifications[0].type).toBe('success')
      expect(notifications[0].message).toBe('Success message')
      unsubscribe()
    })
  })

  describe('error', () => {
    it('shows error notification', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.error('Error message')

      const notifications = listener.mock.calls[0][0]
      expect(notifications[0].type).toBe('error')
      expect(notifications[0].message).toBe('Error message')
      unsubscribe()
    })
  })

  describe('info', () => {
    it('shows info notification', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.info('Info message')

      const notifications = listener.mock.calls[0][0]
      expect(notifications[0].type).toBe('info')
      expect(notifications[0].message).toBe('Info message')
      unsubscribe()
    })
  })

  describe('dismiss', () => {
    it('removes notification by id', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.show('success', 'Test', 0)
      const notifications = listener.mock.calls[0][0]
      const id = notifications[0].id

      notificationService.dismiss(id)

      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener.mock.calls[1][0]).toHaveLength(0)
      unsubscribe()
    })

    it('does nothing when id does not exist', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.dismiss('non-existent-id')

      expect(listener).toHaveBeenCalledTimes(1)
      unsubscribe()
    })
  })

  describe('multiple notifications', () => {
    it('handles multiple notifications', () => {
      const listener = vi.fn()
      const unsubscribe = notificationService.subscribe(listener)
      listener.mockClear()

      notificationService.show('success', 'First', 0)
      notificationService.show('error', 'Second', 0)
      notificationService.show('info', 'Third', 0)

      const notifications = listener.mock.calls[2][0]
      expect(notifications).toHaveLength(3)
      unsubscribe()
    })
  })
})