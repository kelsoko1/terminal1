import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';

interface ChartWidgetProps {
  symbol: string;
}

export function ChartWidget({ symbol }: ChartWidgetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.price}>TZS 45,123.45</Text>
        </View>
        <View style={styles.timeframes}>
          <Button size="sm">1D</Button>
          <Button size="sm">1W</Button>
          <Button size="sm">1M</Button>
          <Button size="sm">3M</Button>
        </View>
      </View>

      <LineChart
        data={{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: [20, 45, 28, 80, 99, 43]
          }]
        }}
        width={Dimensions.get('window').width}
        height={220}
        chartConfig={{
          backgroundColor: '#1A1B1E',
          backgroundGradientFrom: '#1A1B1E',
          backgroundGradientTo: '#1A1B1E',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  price: {
    color: '#71717A',
  },
  timeframes: {
    flexDirection: 'row',
    gap: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 