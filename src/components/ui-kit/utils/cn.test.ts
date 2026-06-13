import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('joins multiple class names', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('handles empty arguments', () => {
    expect(cn()).toBe('');
  });

  it('handles single class name', () => {
    expect(cn('single')).toBe('single');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('handles all falsy values', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  it('handles mixed truthy and falsy values', () => {
    expect(cn('foo', false, 'bar', null, 'baz', undefined)).toBe('foo bar baz');
  });

  it('handles empty string', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });
});