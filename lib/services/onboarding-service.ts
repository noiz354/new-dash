/**
 * Multi-Tenant Provisioning & Onboarding Service (Phase 3 C.1 - Critical Path #1).
 * Provisions new tenant organizations, initializes sequence numbers, creates
 * initial Enterprise Admin, and establishes authenticated session.
 */
import { eq } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { auditEvents, organizations, sequences, users } from '../../db/schema';
import { DomainError } from '../domain/errors';
import { hashPassword } from '../auth/password';
import { createSession } from '../auth/session';

export interface ProvisionOrgInput {
  orgName: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
  adminTitle?: string;
}

export interface ProvisionOrgResult {
  organizationId: string;
  orgName: string;
  adminUserId: string;
  adminEmail: string;
  sessionToken: string;
}

export async function provisionOrganization(
  db: Db,
  input: ProvisionOrgInput,
  userAgent?: string | null,
): Promise<ProvisionOrgResult> {
  const email = input.adminEmail.trim().toLowerCase();

  // Check if admin email already exists globally
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    throw new DomainError(409, 'EMAIL_EXISTS', 'A user with this email address already exists');
  }

  const slug = input.orgName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  const orgId = `APX-${slug || 'CORP'}-${randomSuffix}`;
  const currentYear = new Date().getFullYear();

  return db.transaction(async (tx) => {
    // 1. Create Organization
    const [org] = await tx
      .insert(organizations)
      .values({
        id: orgId,
        name: input.orgName.trim(),
        plan: 'ENTERPRISE',
      })
      .returning();

    // 2. Initialize Sequences
    const entities = ['WO', 'SR', 'PO', 'PR', 'INS', 'FND', 'GRN'];
    for (const entity of entities) {
      await tx.insert(sequences).values({
        organizationId: orgId,
        entity,
        year: currentYear,
        nextVal: 1,
      });
    }

    // 3. Create Initial Admin User
    const passwordHash = await hashPassword(input.adminPassword);
    const initials = input.adminName
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD';

    const [admin] = await tx
      .insert(users)
      .values({
        organizationId: orgId,
        email,
        name: input.adminName.trim(),
        initials,
        title: input.adminTitle?.trim() || 'VP Operations & Site Admin',
        role: 'Enterprise Admin',
        passwordHash,
        isActive: true,
      })
      .returning();

    // 4. Create Session
    const sessionToken = await createSession(tx, admin.id, orgId, userAgent);

    // 5. Audit Log
    await tx.insert(auditEvents).values({
      organizationId: orgId,
      actorUserId: admin.id,
      actorName: admin.name,
      actorRole: 'Enterprise Admin',
      action: 'ORG_PROVISION',
      entityType: 'organization',
      entityId: orgId,
      after: {
        orgName: org.name,
        adminEmail: admin.email,
        initialYear: currentYear,
      },
    });

    return {
      organizationId: orgId,
      orgName: org.name,
      adminUserId: admin.id,
      adminEmail: admin.email,
      sessionToken,
    };
  });
}
