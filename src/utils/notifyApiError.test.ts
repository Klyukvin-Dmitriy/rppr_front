import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifyApiError } from './notifyApiError';
import { notificationService } from '../services/notification/notificationService';

vi.mock('../services/notification/notificationService', () => ({
  notificationService: {
    error: vi.fn(),
  },
}));

describe('notifyApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls notificationService.error with error message', () => {
    const error = new Error('Test error');
    const result = notifyApiError(error);
    
    expect(notificationService.error).toHaveBeenCalledWith('Test error');
    expect(result).toBe('Test error');
  });

  it('uses fallback message when error has no message', () => {
    const error = {};
    const result = notifyApiError(error, 'Default error');
    
    expect(notificationService.error).toHaveBeenCalledWith('Default error');
    expect(result).toBe('Default error');
  });

  it('returns empty string for canceled errors', () => {
    const error = new DOMException('Aborted', 'AbortError');
    const result = notifyApiError(error);
    
    expect(notificationService.error).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('uses default fallback when no fallback provided', () => {
    const error = {};
    const result = notifyApiError(error);
    
    expect(notificationService.error).toHaveBeenCalledWith('Произошла ошибка');
    expect(result).toBe('Произошла ошибка');
  });
});