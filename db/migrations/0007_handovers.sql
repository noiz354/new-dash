-- 0007: handovers (GAP-22 / F27). Shift handover records — server rows are
-- created by operators via POST /api/shifts/handovers; seed intentionally
-- ships ZERO rows (the old UI showed fake HND-2026-* history).
CREATE TABLE handovers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shift_from text NOT NULL,
  shift_to text NOT NULL,
  lead_from text NOT NULL,
  lead_to text NOT NULL,
  wo_ref text,
  items text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  reject_reason text,
  decided_by text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, id)
);
CREATE INDEX handovers_org_status_idx ON handovers (organization_id, status, created_at DESC);
