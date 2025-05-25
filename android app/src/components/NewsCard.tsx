import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  tickers: string[];
  impact: 'positive' | 'negative' | 'neutral';
}

interface NewsCardProps {
  news: NewsItem;
  onPress?: () => void;
}

export default function NewsCard({ news, onPress }: NewsCardProps) {
  const { colors } = useTheme();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return '#00C805';
      case 'negative':
        return '#FF5000';
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.source, { color: colors.text }]}>
            {news.source} • {news.time}
          </Text>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          {news.title}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.tickers}>
            {news.tickers.map((ticker, index) => (
              <Text
                key={ticker}
                style={[
                  styles.ticker,
                  { color: getImpactColor(news.impact) },
                  index > 0 && styles.tickerSpacing
                ]}
              >
                {ticker}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tickers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticker: {
    fontSize: 14,
    fontWeight: '600',
  },
  tickerSpacing: {
    marginLeft: 8,
  },
}); 