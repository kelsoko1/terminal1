import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import WatchlistCard from '../components/WatchlistCard';

const mockWatchlists = [
  {
    id: '1',
    name: 'My Watchlist',
    stocks: [
      { symbol: 'CRDB', price: 385, change: 15, changePercentage: 4.05 },
      { symbol: 'NMB', price: 2750, change: -45, changePercentage: -1.61 },
      { symbol: 'TBL', price: 10900, change: 200, changePercentage: 1.87 },
      { symbol: 'TPCC', price: 3200, change: 50, changePercentage: 1.59 },
      { symbol: 'TCC', price: 17000, change: -300, changePercentage: -1.73 },
    ]
  },
  {
    id: '2',
    name: 'Banking Sector',
    stocks: [
      { symbol: 'CRDB', price: 385, change: 15, changePercentage: 4.05 },
      { symbol: 'NMB', price: 2750, change: -45, changePercentage: -1.61 },
      { symbol: 'DCB', price: 510, change: 10, changePercentage: 2.00 },
    ]
  }
];

export default function WatchlistScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeWatchlist, setActiveWatchlist] = useState(mockWatchlists[0]);
  const { colors } = useTheme();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Watchlist Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.watchlistSelector}
        contentContainerStyle={styles.watchlistSelectorContent}
      >
        {mockWatchlists.map((watchlist) => (
          <TouchableOpacity
            key={watchlist.id}
            style={[
              styles.watchlistTab,
              watchlist.id === activeWatchlist.id && styles.activeWatchlistTab,
              { borderColor: colors.primary }
            ]}
            onPress={() => setActiveWatchlist(watchlist)}
          >
            <Text
              style={[
                styles.watchlistTabText,
                watchlist.id === activeWatchlist.id && { color: colors.primary },
                { color: colors.text }
              ]}
            >
              {watchlist.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.addWatchlistButton, { borderColor: colors.border }]}
        >
          <Plus size={20} stroke={colors.text} />
        </TouchableOpacity>
      </ScrollView>

      {/* Stocks List */}
      <ScrollView
        style={styles.stocksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeWatchlist.stocks.map((stock) => (
          <WatchlistCard
            key={stock.symbol}
            stock={stock}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  watchlistSelector: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  watchlistSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  watchlistTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  activeWatchlistTab: {
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
  },
  watchlistTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addWatchlistButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stocksList: {
    flex: 1,
    padding: 16,
  },
}); 