import { TECH } from '../data/config';

/**
 * PRICE & CURRENCY UTILS (DIAMOND ENGINE)
 * -----------------------------------------------------------
 * Specialized logic for handling localized currency strings,
 * mathematical conversions, and formatting.
 */

/**
 * transformCurrencyStringToNumber: Converts localized price strings into numbers.
 * Handles both "₺150,50" and "150.50 ₺" formats.
 */
export const transformCurrencyStringToNumber = (
  localizedPrice: string | number,
): number => {
  if (typeof localizedPrice === 'number') return localizedPrice;
  if (!localizedPrice) return 0;

  let cleanValue = localizedPrice.toString().replace(/[^\d.,]/g, '');
  const lastDotIndex = cleanValue.lastIndexOf('.');
  const lastCommaIndex = cleanValue.lastIndexOf(',');

  if (lastDotIndex > lastCommaIndex) {
    cleanValue = cleanValue.replace(/,/g, '');
  } else if (lastCommaIndex > lastDotIndex) {
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } else {
    cleanValue = cleanValue.replace(',', '.');
  }

  const result = parseFloat(cleanValue);
  return isNaN(result) ? 0 : result;
};

/**
 * formatNumberToCurrency: Localized currency formatting.
 */
export const formatNumberToCurrency = (
  numericalAmount: number,
  targetCurrency: 'TRY' | 'USD' | 'EUR' = 'TRY',
  exchangeRates?: { usd: number; eur: number },
): string => {
  let convertedAmount = numericalAmount;
  let activeCurrencyCode = TECH.commerce.currency;

  if (targetCurrency !== 'TRY' && exchangeRates) {
    if (targetCurrency === 'USD' && exchangeRates.usd > 0) {
      convertedAmount = numericalAmount / exchangeRates.usd;
      activeCurrencyCode = 'USD';
    } else if (targetCurrency === 'EUR' && exchangeRates.eur > 0) {
      convertedAmount = numericalAmount / exchangeRates.eur;
      activeCurrencyCode = 'EUR';
    }
  }

  return new Intl.NumberFormat(TECH.commerce.locale, {
    style: 'currency',
    currency: activeCurrencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
};

/**
 * calculatePromotionalPrice: Applies discount to a price string.
 */
export const calculatePromotionalPrice = (
  originalPriceString: string,
  discountRate: number,
): string => {
  const mathematicalBasePrice = transformCurrencyStringToNumber(originalPriceString);
  if (mathematicalBasePrice === 0) return originalPriceString;
  const finalizedDiscountedPrice = mathematicalBasePrice * (1 - discountRate);
  return formatNumberToCurrency(finalizedDiscountedPrice);
};

/**
 * standardizePriceInput: Ensures standard "₺1.250" format.
 */
export const standardizePriceInput = (input: string): string => {
  let cleanValue = (input || '').trim();
  if (!cleanValue) return '';
  if (!cleanValue.startsWith('₺') && !isNaN(transformCurrencyStringToNumber(cleanValue))) {
    cleanValue = '₺' + cleanValue;
  }
  return cleanValue;
};
/**
 * getNextCurrency: Rotates currency between TRY, USD, and EUR.
 */
export const getNextCurrency = (current: 'TRY' | 'USD' | 'EUR'): 'TRY' | 'USD' | 'EUR' => {
  const cycle: Record<string, 'TRY' | 'USD' | 'EUR'> = {
    TRY: 'USD',
    USD: 'EUR',
    EUR: 'TRY',
  };
  return cycle[current] || 'TRY';
};
