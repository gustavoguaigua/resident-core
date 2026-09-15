import { Inject, Injectable } from "@nestjs/common";

import type { TenantContext } from "@resident/auth";

import { PrismaService } from "../../platform/database/prisma.service.js";
import {
  AuthenticatedDiscoveryError,
  type AccessibleTenant,
  type CurrentUserProfile,
  type EffectiveTenantPermissions,
} from "./authenticated-discovery.contract.js";

@Injectable()
export class AuthenticatedDiscoveryService {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  public async getCurrentUser(
    userProfileId: string,
  ): Promise<CurrentUserProfile> {
    const profile = await this.requireActiveProfile(userProfileId);
    return {
      displayName: profile.displayName,
      status: "active",
      userProfileId: profile.id,
    };
  }

  public async listAccessibleTenants(
    userProfileId: string,
  ): Promise<readonly AccessibleTenant[]> {
    await this.requireActiveProfile(userProfileId);
    const memberships = await this.prisma.userTenantMembership.findMany({
      orderBy: [{ tenant: { slug: "asc" } }, { id: "asc" }],
      select: {
        tenant: { select: { id: true, name: true, slug: true } },
      },
      where: {
        status: "ACTIVE",
        tenant: { status: "ACTIVE" },
        userProfile: { status: "ACTIVE" },
        userProfileId,
      },
    });
    return memberships.map(({ tenant }) => ({
      membershipStatus: "active",
      name: tenant.name,
      slug: tenant.slug,
      tenantId: tenant.id,
    }));
  }

  public async getEffectivePermissions(
    userProfileId: string,
    tenant: TenantContext,
  ): Promise<EffectiveTenantPermissions> {
    const membership = await this.prisma.userTenantMembership.findFirst({
      select: {
        roles: {
          select: {
            role: {
              select: {
                permissions: {
                  select: { permission: { select: { code: true } } },
                },
              },
            },
          },
          where: { removedAt: null },
        },
      },
      where: {
        id: tenant.membershipId,
        status: "ACTIVE",
        tenant: { status: "ACTIVE" },
        tenantId: tenant.tenantId,
        userProfile: { status: "ACTIVE" },
        userProfileId,
      },
    });
    if (membership === null)
      throw new AuthenticatedDiscoveryError("ACCESS_DENIED");

    const permissions = new Set<string>();
    for (const assignment of membership.roles) {
      for (const rolePermission of assignment.role.permissions) {
        permissions.add(rolePermission.permission.code);
      }
    }
    return {
      permissions: [...permissions].sort((left, right) =>
        left.localeCompare(right),
      ),
      tenantId: tenant.tenantId,
    };
  }

  private async requireActiveProfile(userProfileId: string) {
    const profile = await this.prisma.userProfile.findFirst({
      select: { displayName: true, id: true },
      where: { id: userProfileId, status: "ACTIVE" },
    });
    if (profile === null)
      throw new AuthenticatedDiscoveryError("ACCESS_DENIED");
    return profile;
  }
}
