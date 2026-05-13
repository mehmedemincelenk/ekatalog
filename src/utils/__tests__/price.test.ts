import { describe, it, expect } from 'vitest';
import {
  transformCurrencyStringToNumber,
  formatNumberToCurrency,
  calculatePromotionalPrice,
} from '../price';

describe('Price Utils (A-Level English Refactor)', () => {
  describe('transformCurrencyStringToNumber', () => {
    it('should parse "₺150,50" correctly into 150.5', () => {
      expect(transformCurrencyStringToNumber('₺150,50')).toBe(150.5);
    });

    it('should parse "150.50 ₺" correctly into 150.5', () => {
      expect(transformCurrencyStringToNumber('150.50 ₺')).toBe(150.5);
    });

    it('should return 0 for empty string', () => {
      expect(transformCurrencyStringToNumber('')).toBe(0);
    });

    it('should handle comma as decimal separator', () => {
      expect(transformCurrencyStringToNumber('100,5')).toBe(100.5);
    });
  });

  describe('formatNumberToCurrency', () => {
    it('should format 150.5 correctly into TRY string', () => {
      const formatted = formatNumberToCurrency(150.5);
      // Matches both "₺150,50" and "150,50 ₺" variations
      expect(formatted).toMatch(/₺?\s?150,50\s?₺?/);
    });
  });

  describe('calculatePromotionalPrice', () => {
    it('should apply 10% discount correctly', () => {
      const discounted = calculatePromotionalPrice('₺100,00', 0.1);
      expect(discounted).toMatch(/₺?\s?90,00\s?₺?/);
    });

    it('should return original string if baseline price is 0', () => {
      expect(calculatePromotionalPrice('₺0,00', 0.1)).toBe('₺0,00');
    });
  });
});
