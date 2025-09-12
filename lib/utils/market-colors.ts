/**
 * Utility functions for market data color coding
 */

// Store transaction states for symbols
interface TransactionState {
  symbol: string;
  action: 'buy' | 'sell' | 'deposit' | 'withdrawal' | null;
  timestamp: number;
}

// Keep track of recent transactions to apply color effects
const recentTransactions: TransactionState[] = [];

// How long to show the transaction color effect (in milliseconds)
const TRANSACTION_EFFECT_DURATION = 1000; // 1 second

/**
 * Determines the appropriate color class based on market status and value
 * When market is open: green for positive, red for negative
 * When market is closed: blue/teal for positive, red for negative
 * 
 * @param value - The numeric value to check (percentage change)
 * @param marketStatus - The current market status ('open' or 'closed')
 * @returns CSS class name for text color
 */
export const getValueColor = (value: number, marketStatus: string): string => {
  const isPositive = value >= 0;
  const isMarketOpen = marketStatus.toLowerCase() === 'open';
  
  if (isPositive) {
    return isMarketOpen ? 'text-green-600' : 'text-blue-500';
  } else {
    return 'text-red-600';
  }
};

/**
 * Get market status from a global context or API
 * This is a placeholder function - implement actual logic to get market status
 */
export const getMarketStatus = (): string => {
  // This would typically come from a context or API call
  // For now, we'll return a placeholder
  const currentHour = new Date().getHours();
  
  // Assuming market hours are 9 AM to 4 PM
  return (currentHour >= 9 && currentHour < 16) ? 'open' : 'closed';
};

/**
 * Records a transaction (buy, sell, deposit, withdrawal) for a symbol and returns a color class
 * When buying or depositing: text turns gold
 * When selling or withdrawing: text returns to normal market color (based on value and market status)
 * 
 * @param symbol - The stock symbol or account identifier
 * @param action - The transaction action ('buy', 'sell', 'deposit', or 'withdrawal')
 * @returns CSS class name for text color
 */
export const recordTransaction = (symbol: string, action: 'buy' | 'sell' | 'deposit' | 'withdrawal'): void => {
  // Add the transaction to the recent transactions list
  recentTransactions.push({
    symbol,
    action,
    timestamp: Date.now()
  });
  
  // Clean up old transactions after the effect duration
  setTimeout(() => {
    const index = recentTransactions.findIndex(
      t => t.symbol === symbol && t.timestamp === recentTransactions[recentTransactions.length - 1].timestamp
    );
    if (index !== -1) {
      recentTransactions.splice(index, 1);
    }
  }, TRANSACTION_EFFECT_DURATION);
};

/**
 * Gets the color class for a symbol, taking into account any recent transactions
 * 
 * @param symbol - The stock symbol or account identifier
 * @param value - The value (percentage change) of the stock
 * @param marketStatus - The current market status ('open' or 'closed')
 * @returns CSS class name for text color
 */
export const getSymbolColor = (symbol: string, value: number, marketStatus: string): string => {
  // Check if there's a recent transaction for this symbol
  const recentTransaction = recentTransactions.find(t => t.symbol === symbol);
  
  if (recentTransaction) {
    if (recentTransaction.action === 'buy' || recentTransaction.action === 'deposit') {
      // When buying or depositing, text turns gold
      return 'text-amber-400'; // Gold color
    }
    // When selling or withdrawing, return to normal market color
  }
  
  // Default to normal market color
  return getValueColor(value, marketStatus);
};
