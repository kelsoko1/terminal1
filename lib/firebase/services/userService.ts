import { BaseService } from './baseService';
import { adminDb } from '../admin';

// Local fallback type for User
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export enum UserRole {
  USER,
  ADMIN,
}

export enum UserStatus {
  ACTIVE,
  INACTIVE,
}

export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'>, id?: string): Promise<User> {
    return this.create({
      ...data,
      status: UserStatus.ACTIVE,
      role: data.role || UserRole.USER,
      permissions: data.permissions || [],
    }, id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const snapshot = await adminDb
      .collection(this.collectionName)
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as User;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
    const result = await this.update(userId, { status });
    return result !== null;
  }

  async addUserPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user) return false;

    const permissions = new Set(user.permissions || []);
    permissions.add(permission);

    await this.update(userId, {
      permissions: Array.from(permissions),
    });

    return true;
  }

  async removeUserPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user || !user.permissions) return false;

    const permissions = new Set(user.permissions);
    permissions.delete(permission);

    await this.update(userId, {
      permissions: Array.from(permissions),
    });

    return true;
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return this.list(['organizationId', '==', organizationId]);
  }
}

export const userService = new UserService();
