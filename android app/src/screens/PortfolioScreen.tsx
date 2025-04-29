import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import NewsCard from '../components/NewsCard';
import PortfolioMetrics from '../components/PortfolioMetrics';
import WatchlistCard from '../components/WatchlistCard';

const mockPortfolioData = {
  balance: 25430.50,
  change: 1250.75,
  changePercentage: 5.12,
  chartData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
      data: [21000, 22400, 24000, 23200, 25430],
    }]
  }
};

const mockNews = [
  {
    id: '1',
    title: 'CRDB Bank Reports Strong Q4 Earnings',
    source: 'DSE News',
    time: '2h ago',
    tickers: ['CRDB'],
    impact: 'positive'
  },
  {
    id: '2',
    title: 'TBL Announces New Production Facility',
    source: 'The Citizen',
    time: '4h ago',
    tickers: ['TBL'],
    impact: 'neutral'
  }
];

const mockWatchlist = [
  { symbol: 'CRDB', price: 385, change: 15, changePercentage: 4.05 },
  { symbol: 'NMB', price: 2750, change: -45, changePercentage: -1.61 },
  { symbol: 'TBL', price: 10900, change: 200, changePercentage: 1.87 }
];

export default function PortfolioScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.portfolioLabel, { color: colors.text }]}>Portfolio Value</Text>
          <Text style={[styles.portfolioValue, { color: colors.text }]}>
            TSh {mockPortfolioData.balance.toLocaleString()}
          </Text>
          <Text style={[
            styles.portfolioChange,
            { color: mockPortfolioData.change >= 0 ? '#00C805' : '#FF5000' }
          ]}>
            {mockPortfolioData.change >= 0 ? '+' : ''}
            TSh {mockPortfolioData.change.toLocaleString()} ({mockPortfolioData.changePercentage}%)
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={mockPortfolioData.chartData}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 200, 5, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Portfolio Metrics */}
        <PortfolioMetrics />

        {/* Watchlist Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Watchlist</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Watchlist')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {mockWatchlist.map((stock) => (
            <WatchlistCard key={stock.symbol} stock={stock} />
          ))}
        </View>

        {/* News Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>News</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('NewsSettings')}
              style={styles.settingsButton}
            >
              <MaterialCommunityIcons name="cog" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {mockNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  portfolioLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  portfolioChange: {
    fontSize: 16,
    fontWeight: '500',
  },
  chartContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  chart: {
    borderRadius: 16,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#00C805',
    fontSize: 16,
  },
  settingsButton: {
    padding: 4,
  },
}); 