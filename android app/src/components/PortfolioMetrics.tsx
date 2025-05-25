import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

interface MetricItemProps {
  label: string;
  value: number | string;
  isAmount?: boolean;
  isPositive?: boolean;
}

const mockMetrics = {
  buyingPower: 15000.00,
  cashBalance: 5000.00,
  marketValue: 20430.50,
  todayReturn: 1250.75,
  totalReturn: 5430.50,
};

export default function PortfolioMetrics() {
  const { colors } = useTheme();

  const MetricItem: React.FC<MetricItemProps> = ({ 
    label, 
    value, 
    isAmount = true, 
    isPositive = true 
  }) => (
    <View style={styles.metricItem}>
      <Text style={[styles.metricLabel, { color: colors.text }]}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          {
            color: !isAmount && isPositive ? '#00C805' : colors.text,
          },
        ]}
      >
        {isAmount ? 'TSh ' : ''}
        {isAmount ? value.toLocaleString() : value}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.section}>
        <MetricItem
          label="Buying Power"
          value={mockMetrics.buyingPower}
        />
        <MetricItem
          label="Cash"
          value={mockMetrics.cashBalance}
        />
        <MetricItem
          label="Market Value"
          value={mockMetrics.marketValue}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <MetricItem
          label="Today's Return"
          value={`+${mockMetrics.todayReturn.toLocaleString()} (+${(mockMetrics.todayReturn / mockMetrics.marketValue * 100).toFixed(2)}%)`}
          isAmount={false}
          isPositive={mockMetrics.todayReturn >= 0}
        />
        <MetricItem
          label="Total Return"
          value={`+${mockMetrics.totalReturn.toLocaleString()} (+${(mockMetrics.totalReturn / mockMetrics.marketValue * 100).toFixed(2)}%)`}
          isAmount={false}
          isPositive={mockMetrics.totalReturn >= 0}
        />
      </View>

      <TouchableOpacity
        style={[styles.detailsButton, { borderTopColor: colors.border }]}
      >
        <Text style={[styles.detailsText, { color: colors.primary }]}>
          See Full Portfolio Details
        </Text>
        <ChevronRight 
          stroke={colors.primary} 
          size={20} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  section: {
    padding: 16,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    opacity: 0.1,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 