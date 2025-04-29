import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercentage: number;
}

interface WatchlistCardProps {
  stock: Stock;
  onPress?: () => void;
}

export default function WatchlistCard({ stock, onPress }: WatchlistCardProps) {
  const { colors } = useTheme();
  
  // Mock data for the mini chart
  const chartData = {
    labels: [],
    datasets: [{
      data: [
        stock.price - (stock.change * 1.2),
        stock.price - (stock.change * 0.8),
        stock.price - (stock.change * 0.4),
        stock.price - (stock.change * 0.2),
        stock.price
      ],
    }]
  };

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? '#00C805' : '#FF5000';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        <Text style={[styles.symbol, { color: colors.text }]}>
          {stock.symbol}
        </Text>
        <Text style={[styles.price, { color: colors.text }]}>
          TSh {stock.price.toLocaleString()}
        </Text>
      </View>

      <View style={styles.rightContent}>
        <View style={styles.miniChart}>
          <LineChart
            data={chartData}
            width={100}
            height={40}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => isPositive ? 
                `rgba(0, 200, 5, ${opacity})` : 
                `rgba(255, 80, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
            }}
            bezier
            withHorizontalLabels={false}
            withVerticalLabels={false}
            withDots={false}
            style={styles.chart}
          />
        </View>
        
        <View style={styles.changeContainer}>
          <Text style={[styles.change, { color: changeColor }]}>
            {isPositive ? '+' : ''}
            {stock.changePercentage.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
  },
  miniChart: {
    width: 100,
    height: 40,
    marginRight: 12,
  },
  chart: {
    paddingRight: 0,
    paddingLeft: 0,
    marginLeft: -16, // Adjust chart position
  },
  changeContainer: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 