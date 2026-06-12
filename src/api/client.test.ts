import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAccessToken, setAccessToken, clearAuthStorage } from '../../src/api/client';
import { STORAGE_ACCESS_TOKEN, STORAGE_AUTH_USER } from '../../src/api/storage';

describe('client.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAccessToken', () => {
    it('returns token from localStorage', () => {
      localStorage.setItem(STORAGE_ACCESS_TOKEN, 'test-token');
      expect(getAccessToken()).toBe('test-token');
    });

    it('returns null when token not exists', () => {
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('setAccessToken', () => {
    it('saves token to localStorage', () => {
      setAccessToken('new-token');
      expect(localStorage.getItem(STORAGE_ACCESS_TOKEN)).toBe('new-token');
    });

    it('removes token when null is passed', () => {
      localStorage.setItem(STORAGE_ACCESS_TOKEN, 'old-token');
      setAccessToken(null);
      expect(localStorage.getItem(STORAGE_ACCESS_TOKEN)).toBeNull();
    });
  });

  describe('clearAuthStorage', () => {
    it('removes both access token and auth user from localStorage', () => {
      localStorage.setItem(STORAGE_ACCESS_TOKEN, 'token');
      localStorage.setItem(STORAGE_AUTH_USER, 'user');
      
      clearAuthStorage();
      
      expect(localStorage.getItem(STORAGE_ACCESS_TOKEN)).toBeNull();
      expect(localStorage.getItem(STORAGE_AUTH_USER)).toBeNull();
    });
  });
});