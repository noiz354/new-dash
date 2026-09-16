import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { auditEvents, users } from '@/db/schema';
import { notFound } from '@/lib/domain/errors';

const ROLES6 = [
  'Enterprise Admin',
  'Facility Director',
  'Engineering Lead',
  'Senior Field Tech',
  'Vendor Partner Tech',
  'Read-Only Auditor',
] as const;

const UpdateUserSchema = z.object({
  role: z.enum(ROLES6).optional(),
  title: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

/** PATCH /api/organization/users/[id] — update user role or active status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withRoute({ op: 'org.users.update', method: 'PATCH', permission: 'org.manage' }, req, async (ctx) => {
    const body = await req.json();
    const input = UpdateUserSchema.parse(body);

    const db = getDb();
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.organizationId, ctx!.orgId), eq(users.id, id)))
      .limit(1);

    if (!existing[0]) throw notFound('USER', id);
    const before = existing[0];

    const [updated] = await db
      .update(users)
      .set({
        ...(input.role ? { role: input.role } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      })
      .where(and(eq(users.organizationId, ctx!.orgId), eq(users.id, id)))
      .returning();

    await db.insert(auditEvents).values({
      organizationId: ctx!.orgId,
      actorUserId: ctx!.userId,
      actorName: ctx!.name,
      action: input.isActive === false ? 'USER_DEACTIVATE' : 'USER_UPDATE',
      entityType: 'user',
      entityId: id,
      before: { role: before.role, isActive: before.isActive },
      after: { role: updated.role, isActive: updated.isActive },
    });

    return {
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        title: updated.title,
        isActive: updated.isActive,
      },
    };
  });
}
