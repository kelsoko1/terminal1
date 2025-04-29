-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE order_type AS ENUM ('market', 'limit');
CREATE TYPE order_side AS ENUM ('buy', 'sell');
CREATE TYPE order_status AS ENUM ('pending', 'executed', 'cancelled', 'expired');
CREATE TYPE time_in_force AS ENUM ('day', 'gtc');
CREATE TYPE security_type AS ENUM ('stock', 'bond', 'fund', 'commodity', 'forex');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dsex_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    cash_balance DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Securities table
CREATE TABLE securities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type security_type NOT NULL,
    description TEXT,
    sector VARCHAR(100),
    exchange VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create time-series table for market data
CREATE TABLE market_data (
    security_id UUID REFERENCES securities(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(20, 2) NOT NULL,
    volume BIGINT,
    high DECIMAL(20, 2),
    low DECIMAL(20, 2),
    open DECIMAL(20, 2),
    close DECIMAL(20, 2),
    PRIMARY KEY (security_id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create partitions for market data (example for 2024)
CREATE TABLE market_data_2024_q1 PARTITION OF market_data
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE market_data_2024_q2 PARTITION OF market_data
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE market_data_2024_q3 PARTITION OF market_data
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE market_data_2024_q4 PARTITION OF market_data
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

-- Holdings table
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id),
    security_id UUID REFERENCES securities(id),
    quantity DECIMAL(20, 6) NOT NULL,
    average_price DECIMAL(20, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (portfolio_id, security_id)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    security_id UUID REFERENCES securities(id),
    order_type order_type NOT NULL,
    side order_side NOT NULL,
    quantity DECIMAL(20, 6) NOT NULL,
    price DECIMAL(20, 2),
    status order_status NOT NULL DEFAULT 'pending',
    time_in_force time_in_force NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES users(id),
    security_id UUID REFERENCES securities(id),
    quantity DECIMAL(20, 6) NOT NULL,
    price DECIMAL(20, 2) NOT NULL,
    side order_side NOT NULL,
    commission DECIMAL(20, 2) NOT NULL,
    total_amount DECIMAL(20, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Watchlists table
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist items table
CREATE TABLE watchlist_items (
    watchlist_id UUID REFERENCES watchlists(id),
    security_id UUID REFERENCES securities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (watchlist_id, security_id)
);

-- News table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100),
    url VARCHAR(512),
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- News securities relation table
CREATE TABLE news_securities (
    news_id UUID REFERENCES news(id),
    security_id UUID REFERENCES securities(id),
    PRIMARY KEY (news_id, security_id)
);

-- Create indexes
CREATE INDEX idx_securities_symbol ON securities(symbol);
CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_security ON orders(security_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_security ON transactions(security_id);
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_securities_updated_at
    BEFORE UPDATE ON securities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
    BEFORE UPDATE ON holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at
    BEFORE UPDATE ON watchlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 