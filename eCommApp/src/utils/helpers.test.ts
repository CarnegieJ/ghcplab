import { describe, it, expect } from 'vitest';
import { formatPrice, calculateTotal, validateEmail } from './helpers';

describe('formatPrice', () => {
    it('formats a whole number as USD currency', () => {
        expect(formatPrice(10)).toBe('$10.00');
    });

    it('formats a decimal to 2 places', () => {
        expect(formatPrice(1.5)).toBe('$1.50');
    });

    it('formats zero as $0.00', () => {
        expect(formatPrice(0)).toBe('$0.00');
    });

    it('formats a price already at 2 decimal places', () => {
        expect(formatPrice(9.99)).toBe('$9.99');
    });

    it('formats a large number with comma separators', () => {
        expect(formatPrice(1000)).toBe('$1,000.00');
    });

    it('rounds a price with more than 2 decimal places', () => {
        expect(formatPrice(1.999)).toBe('$2.00');
    });

    it('formats a negative price', () => {
        expect(formatPrice(-5)).toBe('-$5.00');
    });
});

describe('calculateTotal', () => {
    it('returns 0 for an empty array', () => {
        expect(calculateTotal([])).toBe(0);
    });

    it('calculates total for a single item', () => {
        expect(calculateTotal([{ price: 5, quantity: 2 }])).toBe(10);
    });

    it('calculates total for multiple items', () => {
        expect(calculateTotal([
            { price: 5, quantity: 2 },
            { price: 3, quantity: 1 },
        ])).toBe(13);
    });

    it('calculates total correctly with quantity of 1', () => {
        expect(calculateTotal([{ price: 9.99, quantity: 1 }])).toBeCloseTo(9.99);
    });

    it('calculates total for items with zero price', () => {
        expect(calculateTotal([{ price: 0, quantity: 5 }])).toBe(0);
    });

    it('calculates total for items with zero quantity', () => {
        expect(calculateTotal([{ price: 10, quantity: 0 }])).toBe(0);
    });

    it('calculates total for many items', () => {
        const items = Array.from({ length: 10 }, () => ({ price: 1, quantity: 1 }));
        expect(calculateTotal(items)).toBe(10);
    });
});

describe('validateEmail', () => {
    it('returns true for a standard valid email', () => {
        expect(validateEmail('user@example.com')).toBe(true);
    });

    it('returns true for an email with subdomain', () => {
        expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('returns true for an email with plus addressing', () => {
        expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('returns true for a short valid email', () => {
        expect(validateEmail('a@b.co')).toBe(true);
    });

    it('returns false for an empty string', () => {
        expect(validateEmail('')).toBe(false);
    });

    it('returns false for a string with no @ symbol', () => {
        expect(validateEmail('notanemail')).toBe(false);
    });

    it('returns false for a string with no domain', () => {
        expect(validateEmail('user@')).toBe(false);
    });

    it('returns false for a string with no TLD', () => {
        expect(validateEmail('user@domain')).toBe(false);
    });

    it('returns false for a string with spaces', () => {
        expect(validateEmail('user @example.com')).toBe(false);
    });

    it('returns false for just an @ symbol', () => {
        expect(validateEmail('@')).toBe(false);
    });
});
