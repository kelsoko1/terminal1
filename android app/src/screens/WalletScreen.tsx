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
import { ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react-native';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 5000000,
    status: 'completed',
    date: '2024-03-03',
    description: 'Bank Transfer from CRDB'
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 2000000,
    status: 'completed',
    date: '2024-03-02',
    description: 'Withdrawal to NMB'
  },
  {
    id: '3',
    type: 'deposit',
    amount: 10000000,
    status: 'pending',
    date: '2024-03-01',
    description: 'Bank Transfer from DCB'
  }
];

export default function WalletScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const formatAmount = (amount: number) => {
    return `TSh ${amount.toLocaleString()}`;
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionCard, { backgroundColor: colors.card }]}
    >
      <View style={styles.transactionIcon}>
        {transaction.type === 'deposit' ? (
          <ArrowDownLeft size={24} color={colors.primary} />
        ) : (
          <ArrowUpRight size={24} color="#FF5000" />
        )}
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionDescription, { color: colors.text }]}>
          {transaction.description}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.text, opacity: 0.6 }]}>
          {new Date(transaction.date).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amount,
            { color: transaction.type === 'deposit' ? colors.primary : '#FF5000' }
          ]}
        >
          {transaction.type === 'deposit' ? '+' : '-'} {formatAmount(transaction.amount)}
        </Text>
        {transaction.status === 'pending' && (
          <Text style={[styles.pendingStatus, { color: colors.text, opacity: 0.6 }]}>
            Pending
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Balance Section */}
      <View style={[styles.balanceSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.balanceLabel, { color: colors.text }]}>
          Available Balance
        </Text>
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          TSh 13,000,000
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            <ArrowDownLeft size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          >
            <ArrowUpRight size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions Section */}
      <View style={styles.transactionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Transactions
        </Text>
        
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {mockTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </ScrollView>
      </View>

      {/* Add Money Button */}
      <TouchableOpacity
        style={[styles.addMoneyButton, { backgroundColor: colors.primary }]}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceSection: {
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  addMoneyButton: {
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