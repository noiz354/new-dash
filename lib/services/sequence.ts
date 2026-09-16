/**
 * Atomic canon numbering — `UPDATE sequences SET next_val = next_val + 1 …
 * RETURNING` inside the caller's transaction, then use `next_val - 1`.
 * Shared by work-order creation and service-request creation/conversion so
 * every entity number comes from the same per-org, per-year engine.
 */
import { and, eq, sql } from 'drizzle-orm';
import type { Tx } from '../../db/client';
import { sequences } from '../../db/schema';
import { DomainError } from '../domain/errors';

export type SequenceEntity = 'WO' | 'SR' | 'PO' | 'PR' | 'INS' | 'FND' | 'GRN' | 'PM' | 'AK';

export async function nextNumber(
  tx: Tx,
  orgId: string,
  entity: SequenceEntity,
  year: number,
): Promise<string> {
  const [seq] = await tx
    .update(sequences)
    .set({ nextVal: sql`${sequences.nextVal} + 1` })
    .where(and(eq(sequences.organizationId, orgId), eq(sequences.entity, entity), eq(sequences.year, year)))
    .returning({ v: sequences.nextVal });
  if (!seq) {
    throw new DomainError(500, 'SEQUENCE_MISSING', `No ${entity} sequence for org ${orgId} year ${year}`);
  }
  return `${entity}-${year}-${String(seq.v - 1).padStart(4, '0')}`;
}
