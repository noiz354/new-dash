import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { auditEvents, users } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';

const ROLES6 = [
  'Enterprise Admin',
  'Facility Director',
  'Engineering Lead',
  'Senior Field Tech',
  'Vendor Partner Tech',
  'Read-Only Auditor',
] as const;

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  title: z.string().max(100).optional(),
  role: z.enum(ROLES6),
});

/** GET /api/organization/users — List tenant personnel */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'org.users.list', method: 'GET', permission: 'org.read' }, req, async (ctx) => {
    const db = getDb();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        initials: users.initials,
        title: users.title,
        role: users.role,
        isActive: users.isActive,
        hasMfa: users.totpSecret,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.organizationId, ctx!.orgId))
      .orderBy(desc(users.createdAt));

    return {
      data: rows.map((u) => ({
        ...u,
        hasMfa: Boolean(u.hasMfa),
      })),
    };
  });
}

/** POST /api/organization/users — Invite or create user */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'org.users.create', method: 'POST', permission: 'org.manage' }, req, async (ctx) => {
    const body = await req.json();
    const input = CreateUserSchema.parse(body);

    const db = getDb();
    // Default initial random passphrase hash for invited user
    const tempPass = Math.random().toString(36).slice(-10) + 'A1!';
    const passwordHash = await hashPassword(tempPass);

    const initials = input.name
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const [created] = await db
      .insert(users)
      .values({
        organizationId: ctx!.orgId,
        email: input.email.toLowerCase().trim(),
        name: input.name.trim(),
        initials: initials || 'XX',
        title: input.title?.trim() || '',
        role: input.role,
        passwordHash,
        isActive: true,
      })
      .returning();

    await db.insert(auditEvents).values({
      organizationId: ctx!.orgId,
      actorUserId: ctx!.userId,
      actorName: ctx!.name,
      action: 'USER_INVITE',
      entityType: 'user',
      entityId: created.id,
      after: { email: created.email, name: created.name, role: created.role },
    });

    return {
      status: 201,
      data: {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
        initials: created.initials,
        title: created.title,
        isActive: created.isActive,
      },
    };
  });
}
