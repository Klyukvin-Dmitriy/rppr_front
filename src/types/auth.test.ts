import { describe, it, expect } from 'vitest';
import { isFullUser } from './auth';
import type { User, AuthUser } from './auth';

describe('types/auth', () => {
  describe('isFullUser', () => {
    it('returns true for User with first_name and last_name', () => {
      const user: User = {
        id: 1,
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: 'Петров',
        is_manager: false,
      };
      expect(isFullUser(user)).toBe(true);
    });

    it('returns false for AuthUser without first_name', () => {
      const user: AuthUser = {
        login: 'test@example.com',
        last_name: 'Петров',
        is_manager: false,
      };
      expect(isFullUser(user)).toBe(false);
    });

    it('returns false for AuthUser without last_name', () => {
      const user: AuthUser = {
        login: 'test@example.com',
        first_name: 'Иван',
        is_manager: false,
      };
      expect(isFullUser(user)).toBe(false);
    });

    it('returns false when first_name is null', () => {
      const user = {
        login: 'test@example.com',
        first_name: null,
        last_name: 'Петров',
        is_manager: false,
      };
      expect(isFullUser(user as unknown as AuthUser)).toBe(false);
    });

    it('returns false when last_name is null', () => {
      const user = {
        login: 'test@example.com',
        first_name: 'Иван',
        last_name: null,
        is_manager: false,
      };
      expect(isFullUser(user as unknown as AuthUser)).toBe(false);
    });

    it('returns true for User with all fields', () => {
      const user: User = {
        id: 1,
        login: 'admin@example.com',
        first_name: 'Админ',
        last_name: 'Системов',
        is_manager: true,
      };
      expect(isFullUser(user)).toBe(true);
    });
  });
});