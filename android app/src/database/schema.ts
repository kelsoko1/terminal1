import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'dsex_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'portfolios',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'cash_balance', type: 'number' },
        { name: 'market_value', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'holdings',
      columns: [
        { name: 'portfolio_id', type: 'string', isIndexed: true },
        { name: 'security_id', type: 'string', isIndexed: true },
        { name: 'quantity', type: 'number' },
        { name: 'average_price', type: 'number' },
        { name: 'current_price', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'securities',
      columns: [
        { name: 'symbol', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'sector', type: 'string' },
        { name: 'last_price', type: 'number' },
        { name: 'change', type: 'number' },
        { name: 'change_percent', type: 'number' },
        { name: 'open', type: 'number' },
        { name: 'high', type: 'number' },
        { name: 'low', type: 'number' },
        { name: 'volume', type: 'number' },
        { name: 'market_cap', type: 'number' },
        { name: 'last_updated', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'security_id', type: 'string', isIndexed: true },
        { name: 'order_type', type: 'string' },
        { name: 'side', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'price', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'time_in_force', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'security_id', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'price', type: 'number' },
        { name: 'amount', type: 'number' },
        { name: 'commission', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'watchlists',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'watchlist_items',
      columns: [
        { name: 'watchlist_id', type: 'string', isIndexed: true },
        { name: 'security_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'market_data',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'value', type: 'number' },
        { name: 'change', type: 'number' },
        { name: 'change_percent', type: 'number' },
        { name: 'volume', type: 'number' },
        { name: 'timestamp', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'news',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'source', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'impact', type: 'string' },
        { name: 'related_symbols', type: 'string' },
        { name: 'published_at', type: 'number' },
      ]
    }),
  ]
}); 