/**
 * Currency utilities for formatting and handling Tanzanian Shillings (TZS)
 */

/**
 * Format a number as TZS currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  options: { 
    notation?: 'standard' | 'compact',
    showSymbol?: boolean,
    decimals?: number 
  } = {}
): string {
  const { 
    notation = 'standard',
    showSymbol = true,
    decimals = 0
  } = options;

  const formatter = new Intl.NumberFormat('sw-TZ', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'TZS',
    notation,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(amount);
}

/**
 * Convert USD to TZS
 * Note: In a production app, this would use real-time exchange rates from an API
 * @param usdAmount - Amount in USD
 * @returns Amount in TZS
 */
export function usdToTzs(usdAmount: number): number {
  // Exchange rate: 1 USD = ~2,500 TZS (this should be fetched from an API in production)
  const exchangeRate = 2500;
  return usdAmount * exchangeRate;
}

/**
 * Convert TZS to USD
 * @param tzsAmount - Amount in TZS
 * @returns Amount in USD
 */
export function tzsToUsd(tzsAmount: number): number {
  // Exchange rate: 1 USD = ~2,500 TZS
  const exchangeRate = 2500;
  return tzsAmount / exchangeRate;
}

/**
 * Format a large number in a more readable way (e.g., 1.5M, 2.3K)
 * @param amount - The amount to format
 * @returns Formatted amount string
 */
export function formatLargeNumber(amount: number): string {
  return formatCurrency(amount, { notation: 'compact', showSymbol: true });
}

/**
 * Currency symbol for Tanzanian Shillings
 */
export const CURRENCY_SYMBOL = 'TSh';

/**
 * Currency code for Tanzanian Shillings
 */
export const CURRENCY_CODE = 'TZS';
