import { NextRequest } from 'next/server';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { resetUserMfa } from '@/lib/services/org-service';

/**
 * POST /api/organization/users/[id]/reset-mfa — revoke a user's MFA enrollment.
 * Clears totp_secret and deletes all live sessions so the user must
 * re-enroll TOTP/FIDO2 at next login. Cannot target your own account
 * (self lockout risk: with no other factor you could not log back in).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withRoute({ op: 'org.users.reset-mfa', method: 'POST', permission: 'org.manage' }, req, async (ctx) => {
    const data = await resetUserMfa(getDb(), ctx!, id);
    return { data };
  });
}
