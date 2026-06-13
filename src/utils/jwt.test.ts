import { describe, it, expect } from 'vitest'
import { getJwtPayload, getUserIdFromToken, getTokenExpiresAt, getIsManagerFromToken } from './jwt'

// Helper to create JWT token
function createJwtToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'fake-signature'
  return `${header}.${body}.${signature}`
}

describe('getJwtPayload', () => {
  it('parses valid JWT token', () => {
    const token = createJwtToken({ sub: '123', name: 'Test' })
    const payload = getJwtPayload(token)
    expect(payload).toEqual({ sub: '123', name: 'Test' })
  })

  it('returns null for invalid token', () => {
    expect(getJwtPayload('invalid')).toBeNull()
  })

  it('returns null for token with wrong parts', () => {
    expect(getJwtPayload('part1.part2')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getJwtPayload('')).toBeNull()
  })
})

describe('getUserIdFromToken', () => {
  it('extracts user id from sub field', () => {
    const token = createJwtToken({ sub: '123' })
    expect(getUserIdFromToken(token)).toBe(123)
  })

  it('extracts user id from user_id field', () => {
    const token = createJwtToken({ user_id: 456 })
    expect(getUserIdFromToken(token)).toBe(456)
  })

  it('extracts user id from id field', () => {
    const token = createJwtToken({ id: 789 })
    expect(getUserIdFromToken(token)).toBe(789)
  })

  it('returns null for invalid token', () => {
    expect(getUserIdFromToken('invalid')).toBeNull()
  })

  it('returns null when no id field', () => {
    const token = createJwtToken({ name: 'Test' })
    expect(getUserIdFromToken(token)).toBeNull()
  })
})

describe('getTokenExpiresAt', () => {
  it('extracts expiration timestamp', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = createJwtToken({ exp })
    expect(getTokenExpiresAt(token)).toBe(exp)
  })

  it('returns null for invalid token', () => {
    expect(getTokenExpiresAt('invalid')).toBeNull()
  })

  it('returns null when no exp field', () => {
    const token = createJwtToken({ sub: '123' })
    expect(getTokenExpiresAt(token)).toBeNull()
  })
})

describe('getIsManagerFromToken', () => {
  it('returns true when is_manager is true', () => {
    const token = createJwtToken({ is_manager: true })
    expect(getIsManagerFromToken(token)).toBe(true)
  })

  it('returns false when is_manager is false', () => {
    const token = createJwtToken({ is_manager: false })
    expect(getIsManagerFromToken(token)).toBe(false)
  })

  it('returns true when is_manager is "true" string', () => {
    const token = createJwtToken({ is_manager: 'true' })
    expect(getIsManagerFromToken(token)).toBe(true)
  })

  it('returns false when is_manager is "false" string', () => {
    const token = createJwtToken({ is_manager: 'false' })
    expect(getIsManagerFromToken(token)).toBe(false)
  })

  it('returns true when is_manager is 1', () => {
    const token = createJwtToken({ is_manager: 1 })
    expect(getIsManagerFromToken(token)).toBe(true)
  })

  it('returns false when is_manager is 0', () => {
    const token = createJwtToken({ is_manager: 0 })
    expect(getIsManagerFromToken(token)).toBe(false)
  })

  it('returns false when no is_manager field', () => {
    const token = createJwtToken({ sub: '123' })
    expect(getIsManagerFromToken(token)).toBe(false)
  })

  it('returns false for invalid token', () => {
    expect(getIsManagerFromToken('invalid')).toBe(false)
  })
})

describe('getIsManagerFromToken', () => {
  it('returns true when is_manager is true', () => {
    const token = createJwtToken({ is_manager: true });
    expect(getIsManagerFromToken(token)).toBe(true);
  });

  it('returns false when is_manager is false', () => {
    const token = createJwtToken({ is_manager: false });
    expect(getIsManagerFromToken(token)).toBe(false);
  });

  it('returns true when is_manager is "true" string', () => {
    const token = createJwtToken({ is_manager: 'true' });
    expect(getIsManagerFromToken(token)).toBe(true);
  });

  it('returns false when is_manager is "false" string', () => {
    const token = createJwtToken({ is_manager: 'false' });
    expect(getIsManagerFromToken(token)).toBe(false);
  });

  it('returns true when is_manager is 1', () => {
    const token = createJwtToken({ is_manager: 1 });
    expect(getIsManagerFromToken(token)).toBe(true);
  });

  it('returns false when is_manager is 0', () => {
    const token = createJwtToken({ is_manager: 0 });
    expect(getIsManagerFromToken(token)).toBe(false);
  });

  it('returns false when is_manager is missing', () => {
    const token = createJwtToken({});
    expect(getIsManagerFromToken(token)).toBe(false);
  });

  it('returns false for invalid token', () => {
    expect(getIsManagerFromToken('invalid')).toBe(false);
  });
});