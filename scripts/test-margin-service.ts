/**
 * Test script for margin trading service
 * 
 * This script demonstrates the usage of the margin trading service
 * with the production-ready implementation.
 */
import { MarginTradeService, MarginPositionType } from '../lib/services/marginTradeService';

async function testMarginTrading() {
  console.log('Starting margin trading service test...');
  
  // Create service instance
  const marginService = new MarginTradeService();
  
  try {
    // Test placing a trade
    const tradeRequest = {
      userId: 'test-user-123',
      symbol: 'CRDB',
      type: 'LONG' as MarginPositionType,
      amount: 1000,
      leverage: 5,
      stopLoss: 370,
      takeProfit: 400
    };
    
    console.log(`Placing trade: ${JSON.stringify(tradeRequest, null, 2)}`);
    const tradeResult = await marginService.placeTrade(tradeRequest);
    console.log(`Trade placed: ${tradeResult}`);
    
    // Test getting positions
    console.log('Getting positions...');
    const positions = await marginService.getPositions('test-user-123');
    console.log(`Found ${positions.length} positions`);
    
    if (positions.length > 0) {
      const positionId = positions[0].id;
      
      // Test adding margin
      console.log(`Adding margin to position ${positionId}...`);
      const addMarginResult = await marginService.addMargin(positionId, 100);
      console.log(`Margin added: ${addMarginResult}`);
      
      // Test updating positions
      console.log('Updating positions...');
      await marginService.updatePositions();
      console.log('Positions updated');
      
      // Test closing position
      console.log(`Closing position ${positionId}...`);
      const closeResult = await marginService.closePosition(positionId);
      console.log(`Position closed: ${closeResult}`);
    }
    
    // Test getting trade history
    console.log('Getting trade history...');
    const tradeHistory = await marginService.getTradeHistory('test-user-123');
    console.log(`Found ${tradeHistory.length} trades in history`);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testMarginTrading().catch(console.error);
