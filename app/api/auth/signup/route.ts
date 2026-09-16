import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { COOKIE_NAME, sessionCookieOptions } from '@/lib/auth/session';
import { provisionOrganization } from '@/lib/services/onboarding-service';

const SignupSchema = z.object({
  orgName: z.string().min(3).max(100),
  adminEmail: z.string().email(),
  adminName: z.string().min(2).max(100),
  adminPassword: z.string().min(8).max(100),
  adminTitle: z.string().max(100).optional(),
});

/**
 * POST /api/auth/signup — Multi-tenant organization provisioning (Phase 3 C.1 - Critical Path #1).
 * Creates tenant, initializes numbering sequences, creates admin, and sets session cookie.
 */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'auth.signup', method: 'POST', public: true }, req, async () => {
    const body = await req.json();
    const input = SignupSchema.parse(body);

    const userAgent = req.headers.get('user-agent');
    const result = await provisionOrganization(getDb(), input, userAgent);

    return {
      status: 201,
      data: {
        organizationId: result.organizationId,
        orgName: result.orgName,
        adminUserId: result.adminUserId,
        adminEmail: result.adminEmail,
      },
      setCookie: {
        name: COOKIE_NAME,
        value: result.sessionToken,
        options: sessionCookieOptions(),
      },
    };
  });
}
