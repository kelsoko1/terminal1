import { BaseService } from './baseService';
// Local fallback types for Organization, OrganizationType, OrgStatus
export enum OrgStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export type OrganizationType = 'company' | 'nonprofit' | 'school' | 'other';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  status: OrgStatus;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

import { userService } from './userService';

export class OrganizationService extends BaseService<Organization> {
  constructor() {
    super('organizations');
  }

  async createOrganization(
    data: Omit<Organization, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
    adminUserId?: string
  ): Promise<Organization> {
    const org = await this.create({
      ...data,
      status: OrgStatus.ACTIVE,
    });

    // If an admin user ID is provided, assign them as the organization admin
    if (adminUserId) {
      await userService.update(adminUserId, {
        organizationId: org.id,
        isOrganizationAdmin: true,
      });
    }

    return org;
  }

  async getOrganizationWithUsers(organizationId: string) {
    const [org, users] = await Promise.all([
      this.getById(organizationId),
      userService.list(['organizationId', '==', organizationId])
    ]);

    if (!org) return null;

    return {
      ...org,
      users,
    };
  }

  async updateOrganizationStatus(organizationId: string, status: OrgStatus): Promise<boolean> {
    const result = await this.update(organizationId, { status });
    return result !== null;
  }

  async getOrganizationsByType(type: OrganizationType): Promise<Organization[]> {
    return this.list(['type', '==', type]);
  }

  async getSubOrganizations(organizationId: string): Promise<Organization[]> {
    return this.list(['parentId', '==', organizationId]);
  }

  async getOrganizationHierarchy(organizationId: string): Promise<Organization[]> {
    const result: Organization[] = [];
    let currentOrg = await this.getById(organizationId);
    
    // Get all parent organizations
    while (currentOrg) {
      result.unshift(currentOrg);
      if (currentOrg.parentId) {
        currentOrg = await this.getById(currentOrg.parentId);
      } else {
        currentOrg = null;
      }
    }
    
    return result;
  }
}

export const organizationService = new OrganizationService();
