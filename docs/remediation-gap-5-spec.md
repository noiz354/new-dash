# GAP-5 Spec — ProfileSessions live wiring (CLOSE ALL GAPS)

## Problem (truth map: ProfileSessions FRONTEND-ONLY)

`components/profile/ProfileSessions.tsx` renders a hardcoded `SESSIONS` const
(Dispatch Console / Rugged Tablet-07 / SSO token) with local-only `revoke()`
(`setSessions(filter)` — pure `useState`, no network). Meanwhile the backend is
real and idle: `GET /api/auth/sessions` (list) + `POST /api/auth/sessions`
(revoke-all + `AUTH_SESSIONS_REVOKE_ALL` audit + cookie clear) exist in
`app/api/auth/sessions/route.ts`, backed by `lib/auth/session.ts`
(`listUserSessions`, `revokeAllUserSessions`). No caller. Copy on the page
claims "Demo identity · simulated MFA · SCIM v2.4 (mock)".

## Scope (deliberate, minimal)

1. **GET marks the current device.** `listUserSessions` today returns only
   `idHashPrefix` (safe — never the full hash). The route reads its own
   `apex_session` cookie (`req.cookies`), hashes it, and adds
   `current: boolean` per row so the UI can badge THIS DEVICE honestly without
   ever exposing full hashes.
2. **POST gains `{mode: 'all' | 'others'}`** (default `'all'` — existing
   behavior preserved: revoke everything + clear cookie + audit). `'others'`
   revokes every session *except* the caller's (new
   `revokeOtherUserSessions()`), keeps the caller signed in, and audits
   `AUTH_SESSIONS_REVOKE_OTHERS` with `{revokedCount}`. Rationale: on the
   profile page "revoke-all" would instantly log the user out mid-task;
   revoke-others is the sane primary action.
3. **Frontend rewrite to live data:** GET on mount; loading / error / empty
   states; rows show user-agent + last-seen + expiry + THIS DEVICE badge;
   "Sign out other devices" → POST others + refetch + toast with real count;
   "Sign out all devices" → POST all → `window.location.href = '/login'`.
   The fake `SESSIONS` const and local-only `revoke()` are deleted. The
   "Demo identity · simulated MFA · SCIM v2.4 (mock)" line is replaced with
   honest copy (live DB sessions; MFA real TOTP — no simulated-MFA claim).
4. **Per-session single revoke is DEFERRED by design**, not silently dropped:
   the API exposes only 8-char hash prefixes, so a prefix-targeted DELETE
   would be ambiguous and would need full-hash exposure (sensitive). The UI
   states this honestly instead of faking per-row revoke. Documented here so
   a future design (opaque per-session ids) can add it properly.

## Out of scope (same page, untouched)

- API Access / Rotate Key section (separate gap, if any).
- Impersonate banner (pre-existing local behavior, not sessions).
- Identity header (CANON persona display).

## Acceptance

- [ ] GET returns rows with `current: true` exactly for the caller's session.
- [ ] POST `{mode:'others'}` revokes N−1, keeps caller valid, audits.
- [ ] POST `{}` (legacy) revokes all, clears cookie, audits (unchanged).
- [ ] ProfileSessions shows live rows; revoke-others updates list + toast
      with server count; sign-out-all lands on /login; fetch failure shows an
      honest error banner with actions disabled (no fake list).
- [ ] No `SESSIONS` const, no "SCIM v2.4 (mock)" copy, no local-only revoke.
- [ ] Integration tests: list-current-flag, others-keeps-caller, all-revokes-all.
- [ ] `npm test` green, `tsc` no new errors, runtime MCP verified, 0 JS errors.
