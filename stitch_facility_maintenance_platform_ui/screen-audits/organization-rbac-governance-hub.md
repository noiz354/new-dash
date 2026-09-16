# organization_rbac_governance_hub

- File: `organization_rbac_governance_hub/screen.png`
- Design system: A
- Jenis layar: organization governance and RBAC directory
- Ringkasan visual: personnel roster kiri, permission matrix kanan, account diagnostics, access simulator, and deploy rule actions.
- Kekuatan: selected person terlihat kuat; matrix role memberi overview permission; simulator membantu menjelaskan ABAC; diagnostics actions jelas.
- Masalah visual: matrix sangat padat dan akan sulit di mobile; beberapa names/email truncated; shift window visual perlu dicek konsisten dengan kanon shift.
- Risiko rebuild: tinggi karena permission toggles, system locked columns, role tabs, deploy/discard, impersonate/deactivate confirmations.
- Komponen reusable yang teridentifikasi: PersonnelRoster, RoleTabs, PermissionMatrix, AccountDiagnostics, AccessSimulator, PolicyChips, DeployRuleBar.
- Elemen yang perlu binding data/API: personnel, roles, MFA/session, permissions, ABAC simulator result, geofence/shift constraints, critical override rules.
- Verifikasi tambahan terhadap `code.html`: cek toggle disabled/locked, deploy rule, reset MFA/key, audit impersonate, deactivate.
- Prioritas perbaikan:
  - P0: deactivate/impersonate/deploy wajib confirmation and audit reason.
  - P1: matrix perlu responsive alternative.
  - P2: standardize shift window/timezone display.
