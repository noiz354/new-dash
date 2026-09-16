import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { putSetting } from '@/lib/services/settings-service';

const PutSettingSchema = z.object({
  // Any JSON value; service size-checks after encoding.
  value: z.unknown(),
  kind: z.enum(['value', 'secret']).optional(),
});

/** PUT /api/settings/[key] — upsert an org-scoped setting (kind 'value' only; secrets use rotate). */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  return withRoute({ op: 'settings.put', method: 'PUT', permission: 'settings.manage' }, req, async (ctx, requestId) => {
    const { key } = await params;
    const body = await req.json();
    const input = PutSettingSchema.parse(body);
    const idem = req.headers.get('idempotency-key');
    const row = await putSetting(getDb(), ctx!, decodeURIComponent(key), { value: input.value, kind: input.kind }, { idempotencyKey: idem, requestId });
    return { data: row };
  });
}
