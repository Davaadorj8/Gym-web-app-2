export interface AuditEntry<T = Record<string, unknown>> {
  id: string;
  timestamp: string;
  action: string;
  actorId?: string;
  targetId: string;
  details: T;
}

export function createAuditEntry<T>(
  action: string,
  targetId: string,
  details: T,
  actorId?: string
): AuditEntry<T> {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
    timestamp: new Date().toISOString(),
    action,
    targetId,
    actorId,
    details,
  };
}
