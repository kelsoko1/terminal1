import { userService, organizationService, subscriptionService, postService, tradingService } from '../lib/firebase/services/index';
import { Timestamp } from 'firebase-admin/firestore';

// Mock data, since we are not using Prisma
const mockOrganizations = [
  {
    id: 'org1',
    name: 'Test Organization',
    type: 'company' as any,
    licenseNumber: '12345',
    address: '123 Main St',
    contactEmail: 'contact@testorg.com',
    contactPhone: '123-456-7890',
    website: 'https://testorg.com',
    description: 'A test organization',
    status: 'active' as any,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUsers = [
  {
    id: 'user1',
    email: 'admin@testorg.com',
    name: 'Admin User',
    password: 'password', // Note: You should handle password hashing properly
    role: 'ADMIN' as any,
    status: 'ACTIVE' as any,
    organizationId: 'org1',
    department: 'IT',
    position: 'Developer',
    employeeId: 'E12345',
    isOrganizationAdmin: true,
    image: null,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSubscriptions = [
  {
    id: 'sub1',
    userId: 'user1',
    planId: 'basic',
    status: 'ACTIVE' as any,
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    autoRenew: true,
    paymentMethod: 'stripe',
    lastPaymentDate: new Date(),
    nextPaymentDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockPosts = [
    {
        id: 'post1',
        userId: 'user1',
        content: 'This is a test post',
        visibility: 'PUBLIC' as any,
        tradeSymbol: 'BTC',
        tradeType: 'BUY' as any,
        tradePrice: 50000,
        analysisType: 'TECHNICAL' as any,
        analysisSummary: 'A summary',
        hashtags: ['test', 'btc'],
        mentions: [],
        likes: 0,
        shares: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

const mockTrades = [
    {
        id: 'trade1',
        userId: 'user1',
        symbol: 'BTC',
        quantity: 1,
        price: 50000,
        type: 'BUY' as any,
        status: 'COMPLETED' as any,
        executedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    }
]

async function migrateUsers() {
  console.log('Starting users migration...');
  for (const user of mockUsers) {
    try {
      const { createdAt, updatedAt, id, ...userData } = user;
      await userService.createUser(userData as any, id);
      console.log(`Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`Error migrating user ${user.email}:`, error);
    }
  }
  console.log('Users migration completed');
}

async function migrateOrganizations() {
  console.log('Starting organizations migration...');
  for (const org of mockOrganizations) {
    try {
        const { createdAt, updatedAt, id, ...orgData } = org;
      await organizationService.create(orgData as any, id);
      console.log(`Migrated organization: ${org.name}`);
    } catch (error) {
      console.error(`Error migrating organization ${org.name}:`, error);
    }
  }
  console.log('Organizations migration completed');
}

async function migrateSubscriptions() {
  console.log('Starting subscriptions migration...');
  for (const sub of mockSubscriptions) {
    try {
        const { createdAt, updatedAt, id, ...subData } = sub;
      await subscriptionService.create(subData as any, id);
      console.log(`Migrated subscription for user: ${sub.userId}`);
    } catch (error) {
      console.error(`Error migrating subscription ${sub.id}:`, error);
    }
  }
  console.log('Subscriptions migration completed');
}

async function migratePosts() {
  console.log('Starting posts migration...');
  for (const post of mockPosts) {
    try {
        const { createdAt, updatedAt, id, ...postData } = post;
      await postService.create(postData as any, id);
      console.log(`Migrated post: ${post.id}`);
    } catch (error) {
      console.error(`Error migrating post ${post.id}:`, error);
    }
  }
  console.log('Posts migration completed');
}

async function migrateTrades() {
  console.log('Starting trades migration...');
  for (const trade of mockTrades) {
    try {
        const { createdAt, updatedAt, id, ...tradeData } = trade;
      await tradingService.create(tradeData as any, id);
      console.log(`Migrated trade: ${trade.id}`);
    } catch (error) {
      console.error(`Error migrating trade ${trade.id}:`, error);
    }
  }
  console.log('Trades migration completed');
}

async function runMigrations() {
  console.log('Starting Firestore migration...');

  try {
    // Run migrations in order to respect foreign key constraints
    await migrateOrganizations();
    await migrateUsers();
    await migrateSubscriptions();
    await migratePosts();
    await migrateTrades();

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migrations
runMigrations();