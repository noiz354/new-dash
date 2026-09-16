import type { NextRequest } from 'next/server';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { verifyAuditHashChain } from '@/lib/services/audit-service';

/**
 * POST /api/audit-trail/verify-chain
 * Hardened cryptographic hash-chain verification across all audit ledger events (Phase 2 B.4).
 */
export async function POST(req: NextRequest) {
  return withRoute(
    { op: 'audit.verify_chain', method: 'POST', permission: 'audit.read' },
    req,
    async (ctx) => {
      const result = await verifyAuditHashChain(getDb(), ctx!);
      return {
        data: result,
      };
    },
  );
}
