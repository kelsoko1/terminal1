import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to include the Message and Stream models
interface CustomPrismaClient extends PrismaClient {
  message: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    updateMany: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    count: (args: any) => Promise<number>;
  };
  stream: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    count: (args: any) => Promise<number>;
  };
}

// This approach avoids TypeScript errors without requiring @types/node

// Define a safe global object that works in all environments
// Using this approach to avoid TypeScript errors with global
const globalAny: any = typeof window === 'undefined' 
  ? (typeof globalThis !== 'undefined' ? globalThis : {}) 
  : window;

// Create a single PrismaClient instance for the entire app
// This prevents exhausting database connections during development
let prismaInstance: CustomPrismaClient;

if (!globalAny.prisma) {
  const client = new PrismaClient() as CustomPrismaClient;
  
  // Add the Message model to the client
  // This is a workaround until we can run prisma generate
  client.message = {
    findMany: (args: any) => {
      // @ts-ignore - Using raw query as a fallback
      return client.$queryRaw`
        SELECT m.*, 
               s.id as "senderId", s.name as "senderName", s.image as "senderImage",
               r.id as "receiverId", r.name as "receiverName", r.image as "receiverImage"
        FROM "Message" m
        JOIN "User" s ON m."senderId" = s.id
        JOIN "User" r ON m."receiverId" = r.id
        ${args.where ? `WHERE ${buildWhereClause(args.where)}` : ''}
        ${args.orderBy ? `ORDER BY ${buildOrderByClause(args.orderBy)}` : ''}
      `;
    },
    findUnique: async (args: any) => {
      // @ts-ignore - Using raw query as a fallback
      const results = await client.$queryRaw`
        SELECT * FROM "Message" WHERE id = ${args.where.id} LIMIT 1
      `;
      return results[0] || null;
    },
    create: async (args: any) => {
      const { data } = args;
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw`
        INSERT INTO "Message" ("id", "senderId", "receiverId", "content", "read", "createdAt", "updatedAt")
        VALUES (${generateUuid()}, ${data.senderId}, ${data.receiverId}, ${data.content}, ${data.read || false}, NOW(), NOW())
        RETURNING *
      `;
      return result[0];
    },
    update: async (args: any) => {
      const { where, data } = args;
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw`
        UPDATE "Message" SET "read" = ${data.read}, "updatedAt" = NOW()
        WHERE "id" = ${where.id}
        RETURNING *
      `;
      return result[0];
    },
    updateMany: async (args: any) => {
      const { where, data } = args;
      // @ts-ignore - Using raw query as a fallback
      return client.$executeRaw`
        UPDATE "Message" SET "read" = ${data.read}, "updatedAt" = NOW()
        WHERE ${buildWhereClause(where)}
      `;
    },
    delete: async (args: any) => {
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw`
        DELETE FROM "Message" WHERE "id" = ${args.where.id} RETURNING *
      `;
      return result[0];
    },
    count: async (args: any) => {
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw`
        SELECT COUNT(*) FROM "Message"
        ${args.where ? `WHERE ${buildWhereClause(args.where)}` : ''}
      `;
      return parseInt(result[0].count, 10);
    }
  };
  
  // Add the Stream model to the client
  // This is a workaround until we can run prisma generate
  client.stream = {
    findMany: async (args: any) => {
      let query = `
        SELECT s.*, u.id as "userId", u.name as "userName", u.email as "userEmail", u.image as "userImage"
        FROM "Stream" s
        JOIN "User" u ON s."userId" = u.id
      `;
      
      if (args.where) {
        query += ` WHERE ${buildWhereClause(args.where)}`;
      }
      
      if (args.orderBy) {
        query += ` ORDER BY ${buildOrderByClause(args.orderBy)}`;
      }
      
      if (args.skip) {
        query += ` OFFSET ${args.skip}`;
      }
      
      if (args.take) {
        query += ` LIMIT ${args.take}`;
      }
      
      // @ts-ignore - Using raw query as a fallback
      return client.$queryRaw(query);
    },
    findUnique: async (args: any) => {
      // @ts-ignore - Using raw query as a fallback
      const results = await client.$queryRaw`
        SELECT s.*, u.id as "userId", u.name as "userName", u.email as "userEmail", u.image as "userImage"
        FROM "Stream" s
        JOIN "User" u ON s."userId" = u.id
        WHERE s.id = ${args.where.id}
        LIMIT 1
      `;
      return results[0] || null;
    },
    create: async (args: any) => {
      const { data } = args;
      const id = generateUuid();
      const now = new Date().toISOString();
      
      // Build the field names and values for the INSERT
      const fields = ['id', 'userId', 'title', 'viewers', 'isLive', 'startTime', 'mediaType', 'createdAt', 'updatedAt'];
      const values = [id, data.userId, data.title, data.viewers || 0, data.isLive !== undefined ? data.isLive : true, now, data.mediaType, now, now];
      
      // Add optional fields if they exist
      if (data.mediaUrl) {
        fields.push('mediaUrl');
        values.push(data.mediaUrl);
      }
      
      if (data.duration) {
        fields.push('duration');
        values.push(data.duration);
      }
      
      if (data.endTime) {
        fields.push('endTime');
        values.push(data.endTime);
      }
      
      // Build the query
      const fieldStr = fields.map(f => `"${f}"`).join(', ');
      const valueStr = values.map((v, i) => `$${i + 1}`).join(', ');
      const query = `
        INSERT INTO "Stream" (${fieldStr})
        VALUES (${valueStr})
        RETURNING *
      `;
      
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw(query, ...values);
      return result[0];
    },
    update: async (args: any) => {
      const { where, data } = args;
      const updates = [];
      const values = [where.id];
      let paramIndex = 2;
      
      // Build the SET clause
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          updates.push(`"${key}" = $${paramIndex++}`);
          values.push(value);
        }
      }
      
      // Always update the updatedAt timestamp
      updates.push(`"updatedAt" = $${paramIndex++}`);
      values.push(new Date().toISOString());
      
      const query = `
        UPDATE "Stream"
        SET ${updates.join(', ')}
        WHERE "id" = $1
        RETURNING *
      `;
      
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw(query, ...values);
      return result[0];
    },
    delete: async (args: any) => {
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw`
        DELETE FROM "Stream" WHERE "id" = ${args.where.id} RETURNING *
      `;
      return result[0];
    },
    count: async (args: any) => {
      let query = `SELECT COUNT(*) FROM "Stream"`;
      
      if (args.where) {
        query += ` WHERE ${buildWhereClause(args.where)}`;
      }
      
      // @ts-ignore - Using raw query as a fallback
      const result = await client.$queryRaw(query);
      return parseInt(result[0].count, 10);
    }
  };
  
  globalAny.prisma = client;
}

prismaInstance = globalAny.prisma;

// Helper function to generate UUID
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to build WHERE clause for SQL queries
function buildWhereClause(where: any): string {
  if (where.OR) {
    return where.OR.map((condition: any) => buildWhereClause(condition)).join(' OR ');
  }
  
  const conditions = [];
  for (const key in where) {
    if (key === 'OR') continue;
    
    // Handle boolean values properly
    if (typeof where[key] === 'boolean') {
      conditions.push(`"${key}" = ${where[key]}`);
    } else {
      conditions.push(`"${key}" = '${where[key]}'`);
    }
  }
  return conditions.join(' AND ');
}

// Helper function to build ORDER BY clause for SQL queries
function buildOrderByClause(orderBy: any): string {
  const orders = [];
  for (const key in orderBy) {
    // Handle objects like { createdAt: 'desc' }
    if (typeof orderBy[key] === 'string') {
      orders.push(`"${key}" ${orderBy[key]}`);
    } 
    // Handle objects like { createdAt: { order: 'desc' } }
    else if (typeof orderBy[key] === 'object' && orderBy[key].order) {
      orders.push(`"${key}" ${orderBy[key].order}`);
    }
  }
  return orders.join(', ');
}

export const prisma = prismaInstance;
export default prisma;