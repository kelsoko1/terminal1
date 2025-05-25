import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ChartWidget } from '../components/trading/ChartWidget';
import { InstrumentList } from '../components/trading/InstrumentList';
import { TradeForm } from '../components/trading/TradeForm';
import { MarketOverview } from '../components/trading/MarketOverview';
import { SearchBar } from '../components/ui/SearchBar';
import { Instrument } from '@/lib/types/market';

const Tab = createMaterialTopTabNavigator();

export function TradeScreen() {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);

  return (
    <View style={styles.container}>
      <SearchBar />
      
      <Tab.Navigator>
        <Tab.Screen name="Stocks" children={() => (
          <InstrumentList type="stocks" onSelect={setSelectedInstrument} />
        )} />
        <Tab.Screen name="Bonds" children={() => (
          <InstrumentList type="bonds" onSelect={setSelectedInstrument} />
        )} />
      </Tab.Navigator>

      <View style={styles.chartContainer}>
        <ChartWidget symbol={selectedInstrument?.symbol || 'CRDB'} />
      </View>

      <View style={styles.bottomSection}>
        <TradeForm instrument={selectedInstrument} />
        <MarketOverview />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chartContainer: {
    height: 300,
    marginVertical: 16,
  },
  bottomSection: {
    flex: 1,
    padding: 16,
  },
}); 