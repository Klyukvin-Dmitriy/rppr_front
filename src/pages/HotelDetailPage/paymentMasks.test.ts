import { describe, it, expect } from 'vitest'
import {
  maskCardNumber,
  maskExpiryDate,
  maskCvv,
  applyPaymentMask,
  isPaymentFormComplete,
} from './paymentMasks'

describe('maskCardNumber', () => {
  it('masks 16 digit card number', () => {
    expect(maskCardNumber('1234567890123456')).toBe('1234 5678 9012 3456')
  })

  it('masks partial card number', () => {
    expect(maskCardNumber('12345678')).toBe('1234 5678')
  })

  it('removes non-digit characters', () => {
    expect(maskCardNumber('1234-5678-9012-3456')).toBe('1234 5678 9012 3456')
  })

  it('limits to 16 digits', () => {
    expect(maskCardNumber('12345678901234567890')).toBe('1234 5678 9012 3456')
  })

  it('handles empty string', () => {
    expect(maskCardNumber('')).toBe('')
  })
})

describe('maskExpiryDate', () => {
  it('formats expiry date', () => {
    expect(maskExpiryDate('1225')).toBe('12/25')
  })

  it('formats partial expiry date', () => {
    expect(maskExpiryDate('12')).toBe('12')
  })

  it('removes non-digit characters', () => {
    expect(maskExpiryDate('12/25')).toBe('12/25')
  })

  it('limits to 4 digits', () => {
    expect(maskExpiryDate('122599')).toBe('12/25')
  })
})

describe('maskCvv', () => {
  it('masks 3 digit CVV', () => {
    expect(maskCvv('123')).toBe('123')
  })

  it('removes non-digit characters', () => {
    expect(maskCvv('12a3')).toBe('123')
  })

  it('limits to 3 digits', () => {
    expect(maskCvv('12345')).toBe('123')
  })
})

describe('applyPaymentMask', () => {
  it('applies card number mask', () => {
    expect(applyPaymentMask('cardNumber', '1234567890123456')).toBe('1234 5678 9012 3456')
  })

  it('applies expiry date mask', () => {
    expect(applyPaymentMask('expiryDate', '1225')).toBe('12/25')
  })

  it('applies CVV mask', () => {
    expect(applyPaymentMask('cvv', '123')).toBe('123')
  })

  it('returns value as is for other fields', () => {
    expect(applyPaymentMask('cardHolder' as any, 'John Doe')).toBe('John Doe')
  })
})

describe('isPaymentFormComplete', () => {
  it('returns true for complete form', () => {
    const data = {
      cardNumber: '1234 5678 9012 3456',
      expiryDate: '12/25',
      cvv: '123',
      cardHolder: 'John Doe',
    }
    expect(isPaymentFormComplete(data)).toBe(true)
  })

  it('returns false for incomplete card number', () => {
    const data = {
      cardNumber: '1234 5678',
      expiryDate: '12/25',
      cvv: '123',
      cardHolder: 'John Doe',
    }
    expect(isPaymentFormComplete(data)).toBe(false)
  })

  it('returns false for incomplete expiry date', () => {
    const data = {
      cardNumber: '1234 5678 9012 3456',
      expiryDate: '12',
      cvv: '123',
      cardHolder: 'John Doe',
    }
    expect(isPaymentFormComplete(data)).toBe(false)
  })

  it('returns false for invalid month', () => {
    const data = {
      cardNumber: '1234 5678 9012 3456',
      expiryDate: '13/25',
      cvv: '123',
      cardHolder: 'John Doe',
    }
    expect(isPaymentFormComplete(data)).toBe(false)
  })

  it('returns false for incomplete CVV', () => {
    const data = {
      cardNumber: '1234 5678 9012 3456',
      expiryDate: '12/25',
      cvv: '12',
      cardHolder: 'John Doe',
    }
    expect(isPaymentFormComplete(data)).toBe(false)
  })
})