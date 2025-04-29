// Mock database implementation

// In-memory storage
const tables: Record<string, any[]> = {
  users: [],
  portfolios: [],
  securities: [],
  orders: [],
  transactions: [],
  watchlists: [],
  watchlist_items: [],
  market_data: [],
};

// Simple ID generator
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Helper for executing database queries
export const db = {
  /**
   * Execute a SQL query with optional parameters
   * @param text SQL query text
   * @param params Query parameters
   * @returns Query result
   */
  async query(text: string, params?: any[]) {
    console.log('Executing mock query:', { text, params });
    
    // Simple query parsing for basic operations
    if (text.toLowerCase().includes('select') && text.toLowerCase().includes('from users')) {
      // Handle user queries
      if (params && params.length > 0) {
        // Filtering by specific values (e.g., email)
        if (text.toLowerCase().includes('where')) {
          const filtered = tables.users.filter(user => {
            // Very basic WHERE clause handling
            if (text.toLowerCase().includes('email') && params[0]) {
              return user.email === params[0];
            }
            if (text.toLowerCase().includes('id') && params[0]) {
              return user.id === params[0];
            }
            return false;
          });
          
          return {
            rows: filtered,
            rowCount: filtered.length
          };
        }
      }
      
      // Return all users if no filtering
      return {
        rows: tables.users,
        rowCount: tables.users.length
      };
    }
    
    // Handle INSERT operations
    if (text.toLowerCase().includes('insert into users')) {
      const newUser = {
        id: generateId(),
        name: params?.[0] || 'Unknown',
        email: params?.[1] || 'unknown@example.com',
        password_hash: params?.[2] || '',
        role: params?.[3] || 'investor',
        department: params?.[4] || null,
        contact_number: params?.[5] || null,
        status: params?.[6] || 'active',
        permissions: params?.[7] || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tables.users.push(newUser);
      
      return {
        rows: [{ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }],
        rowCount: 1
      };
    }
    
    // Handle INSERT operations for portfolios
    if (text.toLowerCase().includes('insert into portfolios')) {
      const newPortfolio = {
        id: generateId(),
        user_id: params?.[0] || null,
        name: params?.[1] || 'Default Portfolio',
        cash_balance: params?.[2] || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tables.portfolios.push(newPortfolio);
      
      return {
        rows: [{ id: newPortfolio.id }],
        rowCount: 1
      };
    }
    
    // Default empty response for unhandled queries
    return {
      rows: [],
      rowCount: 0
    };
  },

  /**
   * Execute a transaction with multiple queries
   * @param callback Function that receives a client and executes queries
   * @returns Result of the callback function
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    // For mock implementation, just execute the callback directly
    try {
      // Pass the db object itself as the client
      return await callback(this);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  },
  
  // Add some test users for development
  initializeTestData() {
    // Clear existing data
    tables.users = [];
    tables.portfolios = [];
    
    // Add admin user
    const adminUser = {
      id: generateId(),
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: '$2a$10$zPzOPzrUkYuaaVkysdmOa.QgAzkdtj9C8XVxQOH1hVLiKNjyy42Hy', // admin123
      role: 'admin',
      department: 'management',
      status: 'active',
      permissions: [
        'all_access',
        'system_config',
        'user_management',
        'broker_management',
        'trader_management',
        'financial_reports',
        'client_management',
        'trading',
        'market_analysis',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add HR user
    const hrUser = {
      id: generateId(),
      name: 'HR Manager',
      email: 'hr@example.com',
      password_hash: '$2a$10$zPzOPzrUkYuaaVkysdmOa.QgAzkdtj9C8XVxQOH1hVLiKNjyy42Hy', // admin123
      role: 'hr',
      department: 'human_resources',
      status: 'active',
      permissions: [
        'user_management',
        'broker_management',
        'trader_management',
        'hiring',
        'department_management',
        'performance_review',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add broker user
    const brokerUser = {
      id: generateId(),
      name: 'John Broker',
      email: 'broker@example.com',
      password_hash: '$2a$10$zPzOPzrUkYuaaVkysdmOa.QgAzkdtj9C8XVxQOH1hVLiKNjyy42Hy', // admin123
      role: 'broker',
      license_number: 'BRK-2025-001',
      department: 'equities',
      status: 'active',
      permissions: [
        'trading',
        'client_management',
        'reports',
        'market_analysis',
        'portfolio_management',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add investor user
    const investorUser = {
      id: generateId(),
      name: 'Jane Investor',
      email: 'investor@example.com',
      password_hash: '$2a$10$zPzOPzrUkYuaaVkysdmOa.QgAzkdtj9C8XVxQOH1hVLiKNjyy42Hy', // admin123
      role: 'investor',
      status: 'active',
      permissions: [
        'view_portfolio',
        'place_orders',
        'view_reports',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add users to the mock database
    tables.users.push(adminUser, hrUser, brokerUser, investorUser);
    
    // Create portfolio for investor
    const investorPortfolio = {
      id: generateId(),
      user_id: investorUser.id,
      name: 'Default Portfolio',
      cash_balance: 10000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    tables.portfolios.push(investorPortfolio);
    
    console.log('Test data initialized with users:', tables.users.length);
  }
};

// Initialize test data
db.initializeTestData();

export default db;
