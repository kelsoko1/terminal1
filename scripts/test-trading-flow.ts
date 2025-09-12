import { tradingService, portfolioService } from '../lib/firebase/services';
import { TradeType } from '../types/trade';

async function testTradingFlow() {
  const userId = 'test-user-1';
  const symbol = 'AAPL';
  const price = 150.50;
  const quantity = 10;

  try {
    console.log('Executing BUY trade...');
    const buyTrade = await tradingService.executeTrade(
      userId,
      symbol,
      quantity,
      price,
      TradeType.BUY
    );
    console.log('BUY Trade executed:', buyTrade);

    // Check portfolio after BUY
    const portfolioAfterBuy = await portfolioService.getPortfolioSummary(userId);
    console.log('Portfolio after BUY:', JSON.stringify(portfolioAfterBuy, null, 2));

    // Execute a SELL trade
    console.log('\nExecuting SELL trade...');
    const sellTrade = await tradingService.executeTrade(
      userId,
      symbol,
      quantity / 2, // Sell half
      price * 1.05, // 5% higher price
      TradeType.SELL
    );
    console.log('SELL Trade executed:', sellTrade);

    // Check portfolio after SELL
    const portfolioAfterSell = await portfolioService.getPortfolioSummary(userId);
    console.log('Portfolio after SELL:', JSON.stringify(portfolioAfterSell, null, 2));

    // Get trade history
    const tradeHistory = await tradingService.getTradeHistory(userId);
    console.log('\nTrade History:', JSON.stringify(tradeHistory, null, 2));

  } catch (error) {
    console.error('Error in test trading flow:', error);
  }
}

testTradingFlow()
  .then(() => console.log('Test completed'))
  .catch(console.error);
