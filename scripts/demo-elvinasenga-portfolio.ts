import { tradingService, portfolioService } from '../lib/firebase/services';
import { TradeType } from '../types/trade';

async function createDemoPortfolio() {
  const userId = 'KELSOKO001'; // elvinasenga@gmail.com

  const demoTrades = [
    { symbol: 'CRDB', quantity: 100, price: 400, type: TradeType.BUY },
    { symbol: 'NMB', quantity: 50, price: 3800, type: TradeType.BUY },
    { symbol: 'TBL', quantity: 25, price: 11000, type: TradeType.BUY },
    { symbol: 'CRDB', quantity: 40, price: 420, type: TradeType.BUY }, // Additional buy to test avg price
    { symbol: 'NMB', quantity: 10, price: 3900, type: TradeType.SELL }, // Partial sell
  ];

  for (const trade of demoTrades) {
    console.log(`Executing ${trade.type} trade for ${trade.symbol}...`);
    await tradingService.executeTrade(
      userId,
      trade.symbol,
      trade.quantity,
      trade.price,
      trade.type
    );
  }

  // Log resulting portfolio
  const summary = await portfolioService.getPortfolioSummary(userId);
  console.log('Demo portfolio summary for elvinasenga:', JSON.stringify(summary, null, 2));
}

createDemoPortfolio()
  .then(() => console.log('Demo data created.'))
  .catch(console.error);
