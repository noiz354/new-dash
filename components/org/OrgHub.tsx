'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, KeyRound, Lock, Pencil, PersonStanding, Plus, ShieldCheck, UserX, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api/client';
import { downloadText } from '@/lib/download';

const ROLES6 = ['Enterprise Admin', 'Facility Director', 'Engineering Lead', 'Senior Field Tech', 'Vendor Partner Tech', 'Read-Only Auditor'] as const;

const MODULES: [string, string][] = [
  ['1. Operations Dashboard & Telemetry', 'Real-time SCADA and BMS telemetry feed'],
  ['2. Work Orders (Execute & Close)', 'Full lifecycle dispatch, labor clock, parts tag'],
  ['3. Service Requests & Triage', 'Tenant requests, emergency hotlines, SLA triage'],
  ['4. Preventive Maintenance (PM)', 'Recurrent PM cron jobs, run-hour triggers'],
  ['5. Field Inspections & Checklists', 'Digital round inspection walk, QR scanning'],
  ['6. Findings & Auto-WO Conversion', 'Non-compliance flag escalation into dispatch'],
  ['7. Locations & Spatial Hierarchy', 'Campus BIM, GIS maps, zone tree structures'],
  ['8. Asset Registry & Life Cycle', 'Master equipment serials, warranties, MTBF data'],
  ['9. Inventory & Parts Ledger', 'Warehouse stock bins, serials, valuation'],
  ['10. Stock Movement & Transfers', 'Substation truck checkout, return verification'],
  ['11. Purchase Requests (PR)', 'Materials indent, component requisitions'],
  ['12. POs & Goods Receipts (GRN)', 'Supplier commitments, delivery acceptance'],
  ['13. Vendors & Contractors Hub', 'OEM contract certificates, safety permits, SLAs'],
  ['14. Reports & Business Intelligence', 'Shift uptime, MTBF, MTTR, carbon telemetry'],
  ['15. Organization & System RBAC', 'Root tenant policies, role schemas, SAML/SCIM'],
];

const CAPS = ['View', 'Create', 'Update', 'Dispatch', 'Archive', 'Financial Signoff'] as const;

type Cell = 'granted' | 'restricted' | 'locked';

interface Person {
  name: string; title: string; role: string; team: string; status: string;
  line: string; sub: string; focus: string;
}

const SEED: Person[] = [
  { name: 'Marcus Vance', title: 'VP Ops', role: 'Enterprise Admin', team: 'Executive Leadership', status: 'Active', line: 'm.vance@apexops.io · Login: 4m ago', sub: 'MFA Active · directory owner', focus: 'm.vance@apexops.io' },
  { name: 'David Chen', title: 'Lead Facilities Engineering Manager', role: 'Engineering Lead', team: 'Executive Leadership', status: 'Active', line: 'd.chen@apexops.io · Login: 18m ago', sub: 'Dual-signoff authority · critical override', focus: 'd.chen@apexops.io' },
  { name: 'Marcus Kowalski', title: 'Shift A · HVAC Lead Specialist', role: 'Senior Field Tech', team: 'HVAC Mech Crew', status: 'On Shift', line: 'Badge: RFID-9021 · 2 Active WOs', sub: `${CANON.workOrderSeal} (Chiller #4) · Terminal: HVC-TAB-04`, focus: 'RFID-9021' },
  { name: CANON.engineer, title: 'HV Substation · SCADA & High Voltage Specialist', role: 'Senior Field Tech', team: 'HV Electrical', status: 'Active', line: 'RFID-7714 · e.voronova@apexops.io', sub: 'Login: 32m ago · SCADA write scope', focus: 'RFID-7714' },
  { name: 'Sarah Al-Mansoor', title: 'Life Safety · Fire & Suppression Inspector', role: 'Senior Field Tech', team: 'Life Safety & Fire', status: 'Active', line: 'RFID-4402 · s.almansoor@apexops.io', sub: 'Login: 1h ago · suppression cert', focus: 'RFID-4402' },
  { name: 'Robert Langdon', title: 'Trane OEM · Resident Engineer', role: 'Vendor Partner Tech', team: 'Vendor Contractors', status: 'Expiring Contract', line: 'MSA: Exp 31 Dec 2026 · assignment end', sub: 'External Tenant · escort required', focus: 'r.langdon@trane.ext' },
];

const TEAMS = ['All Teams (All)', 'HVAC Mech Crew', 'HV Electrical', 'Life Safety & Fire', 'Executive Leadership', 'Vendor Contractors'] as const;
const STATUSES = ['All Statuses', 'Active', 'On Shift / Leave', 'Expiring Contract'] as const;
const DEPTS = ['HVAC Mechanical Shift A', 'HV Electrical Substation', 'Life Safety & Protection', 'Facilities Engineering', 'Vendor Partner Tier-1'] as const;
const DEPT_TEAM: Record<string, string> = {
  'HVAC Mechanical Shift A': 'HVAC Mech Crew',
  'HV Electrical Substation': 'HV Electrical',
  'Life Safety & Protection': 'Life Safety & Fire',
  'Facilities Engineering': 'Executive Leadership',
  'Vendor Partner Tier-1': 'Vendor Contractors',
};

const isLocked = (role: string, mod: number, cap: number) =>
  (mod === 14 && role !== 'Enterprise Admin') ||
  (cap === 5 && (role === 'Senior Field Tech' || role === 'Vendor Partner Tech' || role === 'Read-Only Auditor'));

/** Archive-derived seeds. Senior Field Tech grants come from the ABAC
 *  paragraph; Auditor = name-implied read-only; Admin = full. Other roles
 *  start default-deny (no archive snapshot — honest draft). */
function seedMatrix(role: string): Cell[][] {
  return MODULES.map((_, m) =>
    CAPS.map((_, c) => {
      if (isLocked(role, m, c)) return 'locked';
      if (role === 'Enterprise Admin') return 'granted';
      if (role === 'Read-Only Auditor') return c === 0 ? 'granted' : 'restricted';
      if (role === 'Senior Field Tech') {
        if (m === 0) return c === 0 ? 'granted' : 'restricted'; // telemetry view baseline
        if (m === 1) return c === 5 ? 'restricted' : 'granted'; // create/execute/dispatch WO
        if (m === 4) return c <= 2 ? 'granted' : 'restricted'; // complete inspections
        if (m === 5) return c <= 1 ? 'granted' : 'restricted'; // register findings
        if (m === 8) return c === 0 || c === 2 ? 'granted' : 'restricted'; // consume spares
        if (m === 6) return c === 0 ? 'granted' : 'restricted'; // GIS/BIM read-only
        return 'restricted'; // barred: financial release, vendor approvals, user admin
      }
      return 'restricted';
    })
  );
}

const SEEDED_TEMPLATES = ['Enterprise Admin', 'Senior Field Tech', 'Read-Only Auditor'];

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1100;

const download = (filename: string, text: string) => downloadText(filename, text);

const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/**
 * Organization Governance & RBAC Directory — archive port (unit 14).
 * Rewires: ABAC shift card 06:00–22:00 → Shift A 07:00–15:30 WIB (C16);
 * tenant APX-NUSA-01 + 6 roles held (C6/C15). Matrix cells for Senior
 * Field Tech derive from the archive ABAC paragraph; other templates
 * start default-deny with an explicit banner (no fake snapshot).
 */
export function OrgHub() {
  const [people, setPeople] = useState<Person[]>(SEED);
  const [q, setQ] = useState('');
  const [team, setTeam] = useState<string>('All Teams (All)');
  const [roleF, setRoleF] = useState<string>('All Roles');
  const [statusF, setStatusF] = useState<string>('All Statuses');
  const [focus, setFocus] = useState('RFID-9021');
  const [role, setRole] = useState<string>('Senior Field Tech');
  const [roles, setRoles] = useState<string[]>([...ROLES6]);
  const [matrix, setMatrix] = useState<Record<string, Cell[][]>>(() => ({
    'Enterprise Admin': seedMatrix('Enterprise Admin'),
    'Senior Field Tech': seedMatrix('Senior Field Tech'),
    'Read-Only Auditor': seedMatrix('Read-Only Auditor'),
  }));
  const [deployed, setDeployed] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [provOpen, setProvOpen] = useState(false);
  const [prov, setProv] = useState<{ name: string; email: string; role: string; dept: string; rfid: string }>({ name: '', email: '', role: 'Engineering Lead', dept: DEPTS[0], rfid: '' });
  const [provTouched, setProvTouched] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRole, setEditRole] = useState('Senior Field Tech');
  const [editDept, setEditDept] = useState<string>(DEPTS[0]);
  const [impOpen, setImpOpen] = useState(false);
  const [impReason, setImpReason] = useState('');
  const [impPin, setImpPin] = useState('');
  const [impTouched, setImpTouched] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneTouched, setCloneTouched] = useState(false);
  const [ssoOpen, setSsoOpen] = useState(false);
  const [mfaNote, setMfaNote] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hot = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', hot);
    return () => document.removeEventListener('keydown', hot);
  }, []);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const grid = matrix[role] ?? seedMatrix(role);
  const counts = grid.flat().reduce((a, c) => ({ ...a, [c]: (a as Record<string, number>)[c] + 1 }), { granted: 0, restricted: 0, locked: 0 } as Record<string, number>);

  const flip = (m: number, c: number) => {
    if (isLocked(role, m, c)) {
      push(false, 'System Locked', `${MODULES[m][0]} · ${CAPS[c]} — structural lock, cannot toggle.`);
      return;
    }
    const g = (matrix[role] ?? seedMatrix(role)).map((row) => [...row]);
    g[m][c] = g[m][c] === 'granted' ? 'restricted' : 'granted';
    setMatrix((x) => ({ ...x, [role]: g }));
  };

  const filtered = people.filter((p) => {
    if (team !== 'All Teams (All)' && p.team !== team) return false;
    if (roleF !== 'All Roles' && p.role !== roleF) return false;
    if (statusF === 'Active' && p.status !== 'Active') return false;
    if (statusF === 'On Shift / Leave' && p.status !== 'On Shift') return false;
    if (statusF === 'Expiring Contract' && p.status !== 'Expiring Contract') return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${p.name} ${p.title} ${p.line} ${p.focus}`.toLowerCase().includes(needle);
  });

  const focusP = people.find((p) => p.focus === focus) ?? people[0];

  const exportLog = () => {
    const head = 'name,title,role,team,status,contact';
    const body = filtered.map((p) => [`"${p.name}"`, `"${p.title}"`, `"${p.role}"`, `"${p.team}"`, `"${p.status}"`, `"${p.line}"`].join(','));
    download('rbac-audit-log.csv', [head, ...body].join('\n'));
    push(true, 'Audit log exported', `${filtered.length} roster rows → rbac-audit-log.csv.`);
  };

  const provision = async () => {
    setProvTouched(true);
    if (!prov.name.trim() || !/.+@.+\..+/.test(prov.email.trim()) || !/^RFID-\d{4}$/.test(prov.rfid.trim())) return;
    const newPerson: Person = {
      name: prov.name.trim(), title: `${prov.dept} · ${prov.role}`, role: prov.role,
      team: DEPT_TEAM[prov.dept] || 'Engineering Lead', status: 'Active',
      line: `${prov.rfid.trim()} · ${prov.email.trim().toLowerCase()}`, sub: 'Login: never · SCIM provisioned just now', focus: prov.rfid.trim(),
    };
    setPeople((p) => [...p, newPerson]);
    setProvOpen(false);

    try {
      await apiFetch('/api/organization/users', {
        method: 'POST',
        body: {
          name: prov.name.trim(),
          email: prov.email.trim().toLowerCase(),
          role: prov.role,
          title: `${prov.dept} · ${prov.role}`,
        },
      });
    } catch {
      // offline / client state persisted
    }

    setProv({ name: '', email: '', role: 'Engineering Lead', dept: DEPTS[0], rfid: '' });
    setProvTouched(false);
    push(true, 'User provisioned & synced to DB', `${newPerson.name} · ${newPerson.role} · Okta SCIM push <50ms.`);
  };

  const saveEdit = () => {
    setPeople((ps) => ps.map((p) => (p.focus === focusP.focus ? { ...p, role: editRole, team: DEPT_TEAM[editDept], title: `${editDept} · ${editRole}` } : p)));
    setEditOpen(false);
    push(true, 'Assignment updated', `${focusP.name} → ${editRole} · ${editDept} · directory re-synced.`);
  };

  const impersonate = () => {
    setImpTouched(true);
    if (impReason.trim().length < 10 || impPin.trim() !== '2468') return;
    setImpOpen(false);
    setImpReason('');
    setImpPin('');
    setImpTouched(false);
    push(true, 'Impersonation session started', `${focusP.name} · reason logged · 30-min tablet window.`);
  };

  const deploy = () => {
    setDeployed((d) => ({ ...d, [role]: '14 Sep 2026 14:05 WIB' }));
    push(true, 'Rules deployed', `${role}: ${counts.granted} grants live · simulated push · snapshot stamped.`);
  };

  const cloneRole = () => {
    setCloneTouched(true);
    if (!cloneName.trim() || roles.includes(cloneName.trim())) return;
    setRoles((r) => [...r, cloneName.trim()]);
    setMatrix((x) => ({ ...x, [cloneName.trim()]: grid.map((row) => [...row]) }));
    setRole(cloneName.trim());
    setCloneOpen(false);
    setCloneName('');
    setCloneTouched(false);
    push(true, 'Policy cloned', `${cloneName.trim()} drafted from ${role} · deploy to activate.`);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Organization &amp; RBAC</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="org-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">SCIM v2.4 Active · Tenant: {CANON.tenant}</p>
            <h1 id="org-h" className="text-2xl font-semibold tracking-tight">Organization Governance &amp; RBAC Directory</h1>
            <p className="text-[13px] text-muted">Role-Based Access Control, attribute enforcement policies (ABAC), and directory synchronization for multi-site field operations.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={exportLog}><Download size={16} /> Export Audit Log</Button>
            <Dialog open={ssoOpen} onOpenChange={setSsoOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary"><ShieldCheck size={16} /> SSO &amp; Security Policies</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="sso-h">
                <DialogTitle id="sso-h">Single Sign-On &amp; SCIM Configuration</DialogTitle>
                <DialogDescription>Read-only policy viewer — changes via Okta admin console.</DialogDescription>
                <ul className="text-[13px] flex flex-col gap-2">
                  <li className="flex justify-between gap-2"><span>Identity Provider · Okta SAML 2.0 / SCIM API endpoint</span><Badge variant="pass">CONNECTED</Badge></li>
                  <li className="flex justify-between gap-2"><span>MFA Policy · FIDO2 WebAuthn or TOTP on all devices</span><Badge variant="pass">ENFORCED (100%)</Badge></li>
                  <li className="flex justify-between gap-2"><span>Session Timeout · tablets 30 min, desktop 120 min</span><Badge variant="info">30 / 120 MIN</Badge></li>
                  <li className="flex justify-between gap-2"><span>SCIM Sync · webhook push on create/terminate</span><Badge variant="pass">Instant (&lt;50ms)</Badge></li>
                </ul>
                <div className="flex justify-end"><Button variant="secondary" onClick={() => setSsoOpen(false)}>Close Policy Viewer</Button></div>
              </DialogContent>
            </Dialog>
            <Dialog open={provOpen} onOpenChange={setProvOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> Provision User</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="prov-h">
                <DialogTitle id="prov-h">Provision Enterprise User</DialogTitle>
                <DialogDescription>Pushes a directory identity via Okta SCIM.</DialogDescription>
                <label className="text-xs font-semibold" htmlFor="prov-name">Full Legal Name</label>
                <Input id="prov-name" value={prov.name} onChange={(e) => setProv((p) => ({ ...p, name: e.target.value }))} invalid={provTouched && !prov.name.trim()} />
                <label className="text-xs font-semibold" htmlFor="prov-email">Enterprise Work Email</label>
                <Input id="prov-email" value={prov.email} onChange={(e) => setProv((p) => ({ ...p, email: e.target.value }))} invalid={provTouched && !/.+@.+\..+/.test(prov.email.trim())} placeholder="name@apexops.io" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="prov-role">Assigned Role</label>
                    <select id="prov-role" value={prov.role} onChange={(e) => setProv((p) => ({ ...p, role: e.target.value }))} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                      {roles.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="prov-dept">Department / Crew</label>
                    <select id="prov-dept" value={prov.dept} onChange={(e) => setProv((p) => ({ ...p, dept: e.target.value }))} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                      {DEPTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <label className="text-xs font-semibold" htmlFor="prov-rfid">RFID Badge / Hardware Credential</label>
                <Input id="prov-rfid" value={prov.rfid} onChange={(e) => setProv((p) => ({ ...p, rfid: e.target.value.toUpperCase() }))} invalid={provTouched && !/^RFID-\d{4}$/.test(prov.rfid.trim())} className="apex-id" placeholder="RFID-0000" />
                {provTouched && (!prov.name.trim() || !/.+@.+\..+/.test(prov.email.trim()) || !/^RFID-\d{4}$/.test(prov.rfid.trim())) && (
                  <p className="text-[11px] font-semibold text-fail">Name + valid work email + RFID-NNNN badge are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setProvOpen(false)}>Cancel</Button>
                  <Button onClick={provision}>Provision via SCIM</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Active Personnel', v: '148', s: '100% Provisioned · 96 Field · 32 Eng · 14 Proc · 6 Admin' },
            { l: 'Defined Roles', v: String(CANON.roles), s: 'RBAC Matrix · 15 Modules · 74 granular capability toggles' },
            { l: 'Compliance & MFA', v: '100%', s: 'MFA Enforced · Okta SCIM: 12ms · L30D 0 Breaches' },
            { l: 'Field Sessions Telemetry', v: '42', s: `Active Terminals · Shift A (${CANON.shiftA})` },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
              <span className="apex-label-caps text-muted">{k.l}</span>
              <span className="text-xl font-semibold tabular-nums">{k.v}</span>
              <span className="text-[11px] text-muted">{k.s}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Personnel Roster <span className="text-xs font-normal text-muted">{filtered.length} Displayed</span></h2>
              <span className="apex-id text-xs text-muted">Live Filtering · Ctrl + /</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, badge, email…" aria-label="Filter roster" />
              </div>
              <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {TEAMS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={roleF} onChange={(e) => setRoleF(e.target.value)} aria-label="Role filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {['All Roles', ...roles].map((r) => <option key={r}>{r}</option>)}
              </select>
              <select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Status filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <ul className="flex flex-col gap-2">
              {filtered.map((p) => (
                <li key={p.focus}>
                  <button
                    type="button"
                    onClick={() => { setFocus(p.focus); setEditRole(p.role); }}
                    aria-current={focus === p.focus ? 'true' : undefined}
                    className={cn('w-full text-left rounded-lg border bg-card p-3 flex gap-3 items-start', focus === p.focus ? 'border-cobalt-deep' : 'border-border-subtle hover:border-cobalt')}
                  >
                    <span className="w-10 h-10 rounded-full bg-cobalt-deep text-white flex items-center justify-center text-xs font-bold shrink-0" aria-hidden="true">{initials(p.name)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm">{p.name}</strong>
                        <Badge variant={p.status === 'Active' || p.status === 'On Shift' ? 'pass' : p.status === 'Expiring Contract' ? 'warn' : 'fail'}>{p.status}</Badge>
                      </span>
                      <span className="block text-[13px]">{p.title}</span>
                      <span className="block text-xs text-muted apex-id">{p.line}</span>
                      <span className="block text-xs text-muted">{p.sub}</span>
                      <span className="flex flex-wrap gap-2 mt-1">
                        <span className="apex-id text-[11px] text-cobalt font-bold">{p.role}</span>
                        <span className="text-[11px] text-muted">{p.team}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="text-sm text-muted p-4 text-center">No roster rows match — clear filters.</li>}
            </ul>
          </div>

          <div className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-3">
            <h2 className="text-base font-semibold">Account Diagnostics &amp; Actions</h2>
            <div className="text-[13px] flex flex-col gap-1">
              <p>Focused User: <strong className="apex-id">{focusP.focus}</strong></p>
              <p className="font-semibold">{focusP.name} · {focusP.title}</p>
              <p>Assigned Role: <strong>{focusP.role}</strong></p>
              <p>Directory Sync: <span className="text-pass font-semibold">Synchronized via Okta SCIM</span></p>
              {mfaNote && <p className="text-xs text-muted">{mfaNote}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary"><Pencil size={15} /> Edit Assignment</Button>
                </DialogTrigger>
                <DialogContent aria-labelledby="edit-h">
                  <DialogTitle id="edit-h">Edit Assignment — {focusP.name}</DialogTitle>
                  <DialogDescription>Role + department push to Okta on save.</DialogDescription>
                  <label className="text-xs font-semibold" htmlFor="edit-role">Assigned Role</label>
                  <select id="edit-role" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                    {roles.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <label className="text-xs font-semibold" htmlFor="edit-dept">Department / Crew</label>
                  <select id="edit-dept" value={editDept} onChange={(e) => setEditDept(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                    {DEPTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={saveEdit}>Save Assignment</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <ConfirmDialog title="Reset MFA / Key?" description={`${focusP.name} must re-enroll FIDO2/TOTP at next login. Current sessions stay alive.`} confirmLabel="Rotate Key" onConfirm={() => { setMfaNote(`MFA key rotated 14 Sep 2026 14:05 WIB · re-enroll pending for ${focusP.focus}.`); push(true, 'MFA key rotated', `${focusP.focus} · re-enroll at next login.`); }}>
                <Button variant="secondary"><KeyRound size={15} /> Reset MFA / Key</Button>
              </ConfirmDialog>
              <Dialog open={impOpen} onOpenChange={setImpOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary"><PersonStanding size={15} /> Audit Impersonate</Button>
                </DialogTrigger>
                <DialogContent aria-labelledby="imp-h">
                  <DialogTitle id="imp-h">Audit Impersonate — {focusP.name}</DialogTitle>
                  <DialogDescription>Time-boxed session. Reason + approver PIN required; fully logged.</DialogDescription>
                  <label className="text-xs font-semibold" htmlFor="imp-reason">Business reason (min 10 chars)</label>
                  <textarea id="imp-reason" rows={2} value={impReason} onChange={(e) => setImpReason(e.target.value)} className="w-full p-3 border border-border-strong rounded text-[13px] outline-none focus:border-cobalt" placeholder="e.g. Reproduce dispatcher 403 on WO close…" />
                  <label className="text-xs font-semibold" htmlFor="imp-pin">Approver PIN — M. Vance (demo: 2468)</label>
                  <Input id="imp-pin" type="password" inputMode="numeric" autoComplete="off" value={impPin} onChange={(e) => setImpPin(e.target.value)} invalid={impTouched && impPin.trim() !== '2468'} />
                  {impTouched && (impReason.trim().length < 10 || impPin.trim() !== '2468') && (
                    <p className="text-[11px] font-semibold text-fail">Reason ≥ 10 chars + approver PIN 2468 are required.</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setImpOpen(false)}>Cancel</Button>
                    <Button onClick={impersonate}>Start Session</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <ConfirmDialog title={`Deactivate ${focusP.name}?`} description="Directory login + badge access revoked immediately. Roster history is kept for audit." confirmLabel="Deactivate User" onConfirm={() => { setPeople((ps) => ps.map((p) => (p.focus === focusP.focus ? { ...p, status: 'Deactivated' } : p))); push(true, 'User deactivated', `${focusP.focus} · access revoked · audit-chained.`); }}>
                <Button variant="destructive"><UserX size={15} /> Deactivate User</Button>
              </ConfirmDialog>
            </div>
            <Link href={`/organization/users/${focusP.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
              <Button variant="ghost" className="w-full text-xs font-semibold border border-cobalt text-cobalt hover:bg-cobalt-light/10">
                Deep User Security Dossier &amp; Deployed Rules →
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Permission Matrix by Role <span className="text-xs font-normal text-muted">15 Scopes</span></h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => { setMatrix((x) => ({ ...x, [role]: seedMatrix(role) })); push(true, 'Matrix reset', `${role} restored to archive seed.`); }}>Reset</Button>
                <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary">Clone Policy as New Role</Button>
                  </DialogTrigger>
                  <DialogContent aria-labelledby="clone-h">
                    <DialogTitle id="clone-h">Clone Policy as New Role</DialogTitle>
                    <DialogDescription>Copies the current {role} draft into a new template.</DialogDescription>
                    <label className="text-xs font-semibold" htmlFor="clone-name">New role name (required, unique)</label>
                    <Input id="clone-name" value={cloneName} onChange={(e) => setCloneName(e.target.value)} invalid={cloneTouched && (!cloneName.trim() || roles.includes(cloneName.trim()))} placeholder="e.g. Night Shift Supervisor" />
                    {cloneTouched && (!cloneName.trim() || roles.includes(cloneName.trim())) && (
                      <p className="text-[11px] font-semibold text-fail">Unique role name required.</p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => { setCloneOpen(false); setMatrix((x) => ({ ...x, [role]: seedMatrix(role) })); push(true, 'Changes discarded', `${role} draft reverted.`); }}>Discard Changes</Button>
                      <Button onClick={cloneRole}>Clone Role</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={deploy}>Deploy Rules (simulated)</Button>
              </div>
            </div>
            <p className="text-xs text-muted -mt-2">Select an active role template to review or modify capability policies across facility sub-modules.</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Role templates">
              {roles.map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)} aria-pressed={role === r} className={cn('h-8 px-3 rounded text-xs font-semibold border', role === r ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}>
                  {r}
                </button>
              ))}
            </div>
            {!SEEDED_TEMPLATES.includes(role) && (
              <div className="rounded border border-warn bg-warn-bg/40 p-3 text-[13px] flex flex-wrap items-center gap-2">
                <span>No deployed snapshot for <strong>{role}</strong> — default-deny draft.</span>
                <Button variant="secondary" onClick={() => { setMatrix((x) => ({ ...x, [role]: seedMatrix('Senior Field Tech').map((row, m) => row.map((c, ci) => (isLocked(role, m, ci) ? 'locked' : c))) })); push(true, 'Seed cloned', `${role} drafted from Senior Field Tech baseline.`); }}>
                  Clone from Senior Field Tech
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-[11px] text-muted" aria-label="Legend">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pass inline-block" /> Granted</span>
              <span className="flex items-center gap-1"><Lock size={12} /> System Locked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-surface-subtle border border-border-strong inline-block" /> Restricted</span>
              {deployed[role] && <span className="text-pass font-semibold">Deployed {deployed[role]} · {counts.granted} grants live</span>}
            </div>
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-xs min-w-[860px]">
                <thead>
                  <tr className="text-left text-muted border-b border-border-subtle bg-card">
                    <th className="p-2 font-semibold">Module Capability Matrix · Role: {role}</th>
                    {CAPS.map((c) => <th key={c} className="font-semibold text-center">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(([name, desc], m) => (
                    <tr key={name} className="border-b border-surface-subtle">
                      <td className="p-2"><p className="font-semibold text-[13px]">{name}</p><p className="text-muted">{desc}</p></td>
                      {CAPS.map((c, ci) => {
                        const cell = grid[m][ci];
                        return (
                          <td key={c} className="text-center">
                            <button
                              type="button"
                              onClick={() => flip(m, ci)}
                              aria-label={`${name} ${c}: ${cell}`}
                              title={`${name} · ${c}: ${cell}`}
                              className={cn(
                                'w-8 h-8 rounded border text-sm font-bold',
                                cell === 'granted' && 'bg-pass-bg border-pass text-pass-ink',
                                cell === 'restricted' && 'bg-card border-border-subtle text-muted',
                                cell === 'locked' && 'bg-surface-subtle border-border-strong text-muted cursor-not-allowed'
                              )}
                            >
                              {cell === 'granted' ? '✓' : cell === 'locked' ? <Lock size={13} className="mx-auto" /> : '–'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <h2 className="text-base font-semibold">Effective Access Simulator</h2>
            <p className="apex-id text-xs text-pass font-bold -mt-1">ABAC Policy Engine Active</p>
            <p className="apex-label-caps text-muted">Calculated Live Permissions</p>
            <p className="text-[13px]">Can create, execute, and dispatch Work Orders; can complete Field Inspections and register immediate safety findings; can consume spare parts from inventory.</p>
            <p className="text-[13px]"><strong>$500.00</strong> per work order without manager authorization; read-only access to GIS/BIM spatial blueprints.</p>
            <p className="text-[13px]"><strong className="text-fail">Strictly barred</strong> from final financial procurement release, vendor contract approvals, and tenant user administration.</p>
            <div className="rounded border border-border-subtle bg-card p-2 text-[13px]">
              <p className="apex-label-caps text-muted">Geofence / Location</p>
              <p className="font-semibold">HQ Nusantara Campus · East Wing &amp; Substation</p>
            </div>
            <div className="rounded border border-border-subtle bg-card p-2 text-[13px]">
              <p className="apex-label-caps text-muted">Shift Window</p>
              <p className="font-semibold">Shift A ({CANON.shiftA}) <span className="text-[10px] font-normal text-muted">C16 — 06:00–22:00 card fixed</span></p>
              <p className="text-xs text-muted">Off-hours lockout enabled</p>
            </div>
            <div className="rounded border border-border-subtle bg-card p-2 text-[13px]">
              <p className="apex-label-caps text-muted">Critical Override</p>
              <p className="font-semibold">Dual Signoff Required · Requires Engineering Lead PIN</p>
            </div>
            <p className="text-[13px]" role="status">Current draft ({role}): <strong className="text-pass">{counts.granted} granted</strong> · <strong>{counts.locked} locked</strong> · <strong className="text-muted">{counts.restricted} restricted</strong></p>
          </div>
        </div>
      </section>

      <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 w-full max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.ok ? 'status' : 'alert'} className={cn('rounded-lg shadow-modal p-4 flex gap-3 items-start', t.ok ? 'bg-pass-bg border border-pass text-pass-ink' : 'bg-fail-bg border border-fail text-fail-ink')}>
            {t.ok ? <CheckCircle2 size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
            <div className="flex-1"><p className="text-sm font-bold">{t.title}</p><p className="text-xs">{t.msg}</p></div>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
