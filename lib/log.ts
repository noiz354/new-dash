/**
 * Structured JSON logging (audit §G, minimal-but-real).
 * One line per event: { ts, level, msg, requestId?, userId?, orgId?, op?,
 * durationMs?, errorCode?, ... }. NEVER log passwords, TOTP codes, session
 * tokens, or secrets — the wrappers below only pass identifiers.
 */
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogFields {
  requestId?: string;
  userId?: string;
  orgId?: string;
  op?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  errorCode?: string;
  [key: string]: unknown;
}

export function log(level: LogLevel, msg: string, fields: LogFields = {}): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...fields });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export function newRequestId(): string {
  return crypto.randomUUID();
}
