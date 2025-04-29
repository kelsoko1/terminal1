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
import { Settings } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import NewsCard from '../components/NewsCard';

type RootStackParamList = {
  NewsSettings: undefined;
};

type NewsScreenProps = NativeStackScreenProps<RootStackParamList>;

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  tickers: string[];
  impact: 'positive' | 'negative' | 'neutral';
}

const mockNews: NewsItem[] = [
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
  },
  {
    id: '3',
    title: 'Bank of Tanzania Updates Monetary Policy',
    source: 'BOT',
    time: '5h ago',
    tickers: ['CRDB', 'NMB', 'DCB'],
    impact: 'neutral'
  },
  {
    id: '4',
    title: 'NMB Bank Expands Digital Banking Services',
    source: 'Daily News',
    time: '6h ago',
    tickers: ['NMB'],
    impact: 'positive'
  },
  {
    id: '5',
    title: 'TPCC Reports Lower Than Expected Revenue',
    source: 'DSE News',
    time: '8h ago',
    tickers: ['TPCC'],
    impact: 'negative'
  }
];

const categories = ['All News', 'Market News', 'Company News', 'Earnings'] as const;
type NewsCategory = typeof categories[number];

export default function NewsScreen({ navigation }: NewsScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('All News');
  const { colors } = useTheme();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categorySelector}
        contentContainerStyle={styles.categorySelectorContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              category === activeCategory && styles.activeCategoryTab,
              { borderColor: colors.primary }
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text
              style={[
                styles.categoryTabText,
                category === activeCategory && { color: colors.primary },
                { color: colors.text }
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News List */}
      <ScrollView
        style={styles.newsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {mockNews.map((news) => (
          <NewsCard
            key={news.id}
            news={news}
            onPress={() => {}}
          />
        ))}
      </ScrollView>

      {/* Settings Button */}
      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('NewsSettings')}
      >
        <Settings 
          size={24} 
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categorySelector: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categorySelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: 'rgba(0, 200, 5, 0.1)',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  newsList: {
    flex: 1,
    padding: 16,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 