import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import NewsCard from '../components/NewsCard';
import PortfolioMetrics from '../components/PortfolioMetrics';
import WatchlistCard from '../components/WatchlistCard';
import { backendService } from '../services/backendService';

// Helper function to format relative time (e.g., "2h ago")
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

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
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(mockPortfolioData);
  const [watchlistData, setWatchlistData] = useState(mockWatchlist);
  const [newsData, setNewsData] = useState(mockNews);
  const { colors } = useTheme();
  
  // Fetch portfolio data from backend
  const fetchPortfolioData = async () => {
    try {
      const response = await backendService.getPortfolio();
      const historyResponse = await backendService.getPortfolioHistory('week');
      
      if (response.data && historyResponse.data) {
        const portfolio = response.data;
        const history = historyResponse.data;
        
        // Transform data for the chart
        const chartLabels = history.map(item => new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }));
        const chartData = history.map(item => item.value);
        
        setPortfolioData({
          balance: portfolio.totalValue,
          change: portfolio.dayChange,
          changePercentage: portfolio.dayChangePercentage,
          chartData: {
            labels: chartLabels,
            datasets: [{
              data: chartData,
            }]
          }
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      // Keep using mock data in case of error
    }
  };
  
  // Fetch watchlist data from backend
  const fetchWatchlistData = async () => {
    try {
      const response = await backendService.getWatchlist();
      
      if (response.data && response.data.stocks) {
        setWatchlistData(response.data.stocks.map(stock => ({
          symbol: stock.symbol,
          price: stock.price,
          change: stock.change,
          changePercentage: stock.changePercentage
        })));
      }
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
      // Keep using mock data in case of error
    }
  };
  
  // Fetch news data from backend
  const fetchNewsData = async () => {
    try {
      const response = await backendService.getResearchReports(1, 2);
      
      if (response.data && response.data.reports) {
        setNewsData(response.data.reports.map(report => ({
          id: report.id,
          title: report.title,
          source: report.source,
          time: formatRelativeTime(new Date(report.publishedAt)),
          tickers: report.tickers || [],
          impact: report.sentiment || 'neutral'
        })));
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
      // Keep using mock data in case of error
    }
  };
  
  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPortfolioData(),
        fetchWatchlistData(),
        fetchNewsData()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial data loading
  useEffect(() => {
    loadAllData();
  }, []);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAllData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading portfolio data...</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.portfolioLabel, { color: colors.text }]}>Portfolio Value</Text>
          <Text style={[styles.portfolioValue, { color: colors.text }]}>
            TSh {portfolioData.balance.toLocaleString()}
          </Text>
          <Text style={[
            styles.portfolioChange,
            { color: portfolioData.change >= 0 ? '#00C805' : '#FF5000' }
          ]}>
            {portfolioData.change >= 0 ? '+' : ''}
            TSh {portfolioData.change.toLocaleString()} ({portfolioData.changePercentage}%)
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={portfolioData.chartData}
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
          {watchlistData.map((stock) => (
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
          {newsData.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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