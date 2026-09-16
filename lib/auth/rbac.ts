/**
 * RBAC — server-side permission map for the 6 canon roles (lib/canon.ts,
 * OrgHub ROLES6). Enforcement lives in API routes/layouts, NEVER in the UI
 * alone (audit §6: "hidden button ≠ authorization").
 */
import { ROLES } from '../../db/schema';

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'wo.read', 'wo.create', 'wo.transition',
  'sr.read', 'sr.create', 'sr.transition',
  'assets.read',
  'finding.read', 'finding.create', 'finding.dismiss',
  'inventory.read', 'inventory.mutate',
  'po.read', 'po.approve',
  'vendors.read', 'vendors.manage',
  'reports.read',
  'audit.read',
  'org.read', 'org.manage',
  'settings.manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const READ_ALL: Permission[] = [
  'wo.read', 'sr.read', 'assets.read', 'finding.read', 'inventory.read',
  'po.read', 'vendors.read', 'reports.read', 'audit.read', 'org.read',
];

export const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  'Enterprise Admin': ['*'],
  'Facility Director': [
    ...READ_ALL,
    'wo.create', 'wo.transition', 'sr.create', 'sr.transition',
    'finding.create', 'finding.dismiss', 'inventory.mutate', 'po.approve', 'vendors.manage', 'org.manage',
  ],
  'Engineering Lead': [
    ...READ_ALL,
    'wo.create', 'wo.transition', 'sr.create', 'sr.transition', 'finding.create', 'finding.dismiss', 'inventory.mutate', 'vendors.manage',
  ],
  'Senior Field Tech': [
    'wo.read', 'wo.transition', 'sr.read', 'sr.create',
    'assets.read', 'finding.read', 'finding.create', 'finding.dismiss', 'inventory.read', 'vendors.read',
  ],
  // Vendor partners: read their assigned work only (row-level scoping is
  // slice #2; today the role can read the org's WOs — documented limitation).
  'Vendor Partner Tech': ['wo.read'],
  'Read-Only Auditor': READ_ALL,
};

export function can(role: Role, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes('*') || perms.includes(permission);
}
