import { PrismaClient } from '@prisma/client';
import { userService, organizationService, subscriptionService, postService, tradingService } from '../lib/firebase/services/index';
import { Timestamp } from 'firebase-admin/firestore';

const prisma = new PrismaClient();

async function migrateUsers() {
  console.log('Starting users migration...');
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    try {
      await userService.createUser({
        email: user.email,
        name: user.name || '',
        password: user.password, // Note: You should handle password hashing properly in a real migration
        role: user.role as any,
        status: user.status as any,
        organizationId: user.organizationId || undefined,
        department: user.department || undefined,
        position: user.position || undefined,
        employeeId: user.employeeId || undefined,
        isOrganizationAdmin: user.isOrganizationAdmin || false,
        image: user.image || undefined,
        permissions: user.permissions || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }, user.id);
      
      console.log(`Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`Error migrating user ${user.email}:`, error);
    }
  }
  
  console.log('Users migration completed');
}

async function migrateOrganizations() {
  console.log('Starting organizations migration...');
  const organizations = await prisma.organization.findMany();
  
  for (const org of organizations) {
    try {
      await organizationService.create(
        {
          name: org.name,
          type: org.type as any,
          licenseNumber: org.licenseNumber || undefined,
          address: org.address || undefined,
          contactEmail: org.contactEmail || undefined,
          contactPhone: org.contactPhone || undefined,
          website: org.website || undefined,
          description: org.description || undefined,
          status: org.status as any,
          parentId: org.parentId || undefined,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        },
        org.id
      );
      
      console.log(`Migrated organization: ${org.name}`);
    } catch (error) {
      console.error(`Error migrating organization ${org.name}:`, error);
    }
  }
  
  console.log('Organizations migration completed');
}

async function migrateSubscriptions() {
  console.log('Starting subscriptions migration...');
  const subscriptions = await prisma.subscription.findMany({
    include: { plan: true }
  });
  
  for (const sub of subscriptions) {
    try {
      await subscriptionService.create(
        {
          userId: sub.userId,
          planId: sub.planId,
          status: sub.status as any,
          startDate: sub.startDate,
          endDate: sub.endDate || undefined,
          autoRenew: sub.autoRenew,
          paymentMethod: sub.paymentMethod || undefined,
          lastPaymentDate: sub.lastPaymentDate || undefined,
          nextPaymentDate: sub.nextPaymentDate || undefined,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        },
        sub.id
      );
      
      console.log(`Migrated subscription for user: ${sub.userId}`);
    } catch (error) {
      console.error(`Error migrating subscription ${sub.id}:`, error);
    }
  }
  
  console.log('Subscriptions migration completed');
}

async function migratePosts() {
  console.log('Starting posts migration...');
  const posts = await prisma.post.findMany();
  
  for (const post of posts) {
    try {
      await postService.create(
        {
          userId: post.userId,
          content: post.content,
          visibility: post.visibility as any,
          tradeSymbol: post.tradeSymbol || undefined,
          tradeType: post.tradeType as any,
          tradePrice: post.tradePrice || undefined,
          analysisType: post.analysisType as any,
          analysisSummary: post.analysisSummary || undefined,
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          likes: post.likes,
          shares: post.shares,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
        post.id
      );
      
      console.log(`Migrated post: ${post.id}`);
    } catch (error) {
      console.error(`Error migrating post ${post.id}:`, error);
    }
  }
  
  console.log('Posts migration completed');
}

async function migrateTrades() {
  console.log('Starting trades migration...');
  const trades = await prisma.trade.findMany();
  
  for (const trade of trades) {
    try {
      await tradingService.create(
        {
          userId: trade.userId,
          symbol: trade.symbol,
          quantity: trade.quantity,
          price: trade.price,
          type: trade.type as any,
          status: trade.status as any,
          executedAt: trade.createdAt, // Using createdAt as executedAt
          createdAt: trade.createdAt,
          updatedAt: trade.updatedAt,
        },
        trade.id
      );
      
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
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the migrations
runMigrations();
