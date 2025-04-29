import { Stock } from './types';

export const initialStocks: Stock[] = [
  {
    symbol: 'CRDB',
    name: 'CRDB Bank Plc',
    price: 400,
    previousPrice: 395,
    percentageChange: 1.27,
    volume: 150000,
  },
  {
    symbol: 'NMB',
    name: 'NMB Bank Plc',
    price: 3900,
    previousPrice: 3850,
    percentageChange: 1.30,
    volume: 85000,
  },
  {
    symbol: 'TBL',
    name: 'Tanzania Breweries Ltd',
    price: 10900,
    previousPrice: 10850,
    percentageChange: 0.46,
    volume: 45000,
  },
  {
    symbol: 'TPCC',
    name: 'Tanzania Portland Cement Company Ltd',
    price: 4200,
    previousPrice: 4180,
    percentageChange: 0.48,
    volume: 32000,
  },
  {
    symbol: 'TOL',
    name: 'TOL Gases Limited',
    price: 500,
    previousPrice: 495,
    percentageChange: 1.01,
    volume: 28000,
  },
];

// Function to generate a mock price update for a given stock
export function generateMockPriceUpdate(stock: Stock): Stock {
  // Calculate a random price change within ±1% of the current price
  const priceChange = (Math.random() - 0.5) * (stock.price * 0.02);
  // Calculate the new price by adding the price change to the current price
  const newPrice = stock.price + priceChange;
  // Calculate the percentage change from the previous price to the new price
  const percentageChange =
    ((newPrice - stock.previousPrice) / stock.previousPrice) * 100;

  // Return a new stock object with updated price, previous price, percentage change, and volume
  return {
    ...stock, // Spread the existing stock properties
    previousPrice: stock.price, // Update the previous price to the current price
    price: Number(newPrice.toFixed(2)), // Update the price to the new price, rounded to 2 decimal places
    percentageChange: Number(percentageChange.toFixed(2)), // Update the percentage change, rounded to 2 decimal places
    volume: stock.volume + Math.floor(Math.random() * 10000), // Update the volume with a random increase up to 9999
  };
}
