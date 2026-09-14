/**
 * Apex Ops CANON — single source of truth, ported from docs/CANON_DATA.md
 * (Fase A final). Import these constants in every route/component instead of
 * inventing IDs, prices, shifts, or locale formats.
 */

export const CANON = {
  tenant: 'APX-NUSA-01',
  workOrderSeal: 'WO-2026-0894',
  assetSeal: 'AST-HVAC-004',
  assetOem: 'Trane EarthWise CVHE',
  assetSerial: 'TRA-99201-B',
  assetHealth: 68,
  assetHealthLabel: 'NEEDS OVERHAUL',
  lotoPadlock: '#4092',
  lotoPoint: 'M-44',
  lotoPanel: 'Panel DP-02',
  sealSku: 'PART-SEAL-8821',
  sealPrice: 1450.0,
  sealBin: 'CRIB-B / Bay 01',
  ledgerTotal: 1765.0,
  // C9: two DIFFERENT bearing SKUs — never merge.
  bearingSkus: ['PART-BRG-6204', 'PART-BRG-6205'] as const,
  inspection: 'INS-2026-0412',
  inspectionProgress: 65,
  finding: 'FND-2026-0188',
  serviceRequest: 'SR-2026-0894',
  purchaseOrder: 'PO-2026-0298',
  purchaseRequest: 'PR-2026-0314',
  grn: 'GRN-9941',
  msa: 'MSA-2024-TRN-09',
  msaDaysLeft: 312,
  vendorSlug: 'trane-technologies',
  vendorName: 'Trane Technologies',
  pmPlan: 'PM-PLN-0104',
  template: 'TMPL-HVAC-CHL-02',
  engineer: 'Elena Voronova',
  requestor: 'Elena Moreno', // C14: separate persona [ASUMSI-OTOMATIS]
  roles: 6,
  shiftA: '07:00–15:30 WIB',
  apiVersion: 'v1',
  locale: 'Asia/Jakarta' as const,
  currency: 'USD' as const,
} as const;

export const ID_FORMATS: Record<string, RegExp> = {
  workOrder: /^WO-2026-\d{4}$/,
  serviceRequest: /^SR-2026-\d{4}$/,
  asset: /^AST-[A-Z]+-\d{3}$/,
  part: /^PART-[A-Z]+-\d+$/,
  inspection: /^INS-2026-\d{4}$/,
  finding: /^FND-2026-\d{4}$/,
  purchaseOrder: /^PO-2026-\d{4}$/,
  purchaseRequest: /^PR-2026-\d{4}$/,
};

/** Format a phone in canon +62 form (C19). */
export function canonPhone(kind: 'office' | 'mobile' | 'vendor'): string {
  if (kind === 'mobile') return '+62-812-4092-7714';
  if (kind === 'vendor') return '+62-21-5090-0440';
  return '+62-21-5081-0001';
}

/** WIB clock label for UI (C18: UTC only for system/ledger timestamps). */
export function wibNow(d = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CANON.locale,
  }).format(d);
}
