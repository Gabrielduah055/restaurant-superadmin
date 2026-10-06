export type OperationsWindow = '1h' | '24h' | '7d' | '30d';
export type Freshness = 'fresh' | 'stale' | 'unknown';
export type RuntimeHealthStatus = 'healthy' | 'degraded' | 'stale' | 'unknown' | 'not_monitored';

export interface DateWindow {
  from: string;
  to: string;
}

export interface WhatsAppOperations {
  generatedAt: string;
  window: DateWindow;
  sample: { limit: number; truncated: boolean };
  summary: {
    total: number;
    configured: number;
    notConfigured: number;
    providerConnectionMonitored: number;
  };
  sessions: WhatsAppSessionOperation[];
  nextCursor: string | null;
}

export interface WhatsAppSessionOperation {
  restaurantId: string;
  restaurantName: string;
  configuration: {
    status: 'configured' | 'not_configured';
    sessionReference: string | null;
    apiTokenConfigured: boolean;
    observedAt: string;
  };
  providerConnection: {
    status: 'unknown';
    reason: 'not_monitored';
    observedAt: null;
  };
  inbound: WhatsAppDirectionObservation;
  outbound: WhatsAppDirectionObservation & {
    sent: number;
    pending: number;
  };
}

export interface WhatsAppDirectionObservation {
  status: string;
  observedAt: string | null;
  freshness: Freshness;
  staleAfterSeconds: number;
  failed: number;
  processed?: number;
}

export interface MetricSummary {
  count: number;
  successes: number;
  failures: number;
  timeouts: number;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  lastObservedAt: string | null;
}

export interface NamedMetricSummary extends MetricSummary {
  name: string;
}

export interface AgentOperations {
  generatedAt: string;
  window: DateWindow;
  monitoring: {
    status: 'observed' | 'unknown';
    reason: string | null;
    observedAt: string | null;
    freshness: Freshness;
    staleAfterSeconds: number;
    retentionDays: number;
    sampleLimit: number;
    truncated: boolean;
  };
  agentTurns: MetricSummary & {
    usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  };
  providerRequests: MetricSummary & { byProvider: NamedMetricSummary[] };
  toolExecutions: MetricSummary & { byTool: NamedMetricSummary[] };
  recentFailures: Array<{
    kind: 'agent_turn' | 'provider_request' | 'tool_execution';
    restaurantId: string | null;
    senderRole: string | null;
    provider: string | null;
    model: string | null;
    toolName: string | null;
    errorCode: string;
    timeout: boolean;
    latencyMs: number;
    observedAt: string | null;
  }>;
}

export interface RuntimeHealthObservation {
  name: string;
  status: RuntimeHealthStatus;
  cadenceSeconds: number;
  staleAfterSeconds: number;
  startedAt: string | null;
  running: boolean;
  observedAt: string | null;
  lastRunStartedAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastFailureCode?: string;
}

export interface SystemHealth {
  generatedAt: string;
  api: {
    status: 'healthy';
    startedAt: string;
    observedAt: string;
    uptimeSeconds: number;
  };
  mongodb: {
    status: 'healthy' | 'degraded' | 'unknown';
    observedAt: string | null;
    latencyMs: number | null;
    readyState: number;
  };
  queue: {
    runtime: RuntimeHealthObservation | null;
    backlog: {
      observedAt: string;
      pending: number;
      due: number;
      sending: number;
      failedLast24h: number;
      oldestPendingAt: string | null;
      lastAttemptAt: string | null;
    };
  };
  schedulers: RuntimeHealthObservation[];
  auditPersistence: {
    runtime: RuntimeHealthObservation | null;
    queuedEntries: number;
  };
}

export interface AuditLogPage {
  generatedAt: string;
  retentionDays: number;
  items: AuditLogEntry[];
  nextCursor: string | null;
}

export interface AuditLogEntry {
  id: string;
  occurredAt: string | null;
  actor: { id: string; email: string; role: 'super_admin' };
  action: string;
  target: {
    type: string;
    id: string;
    restaurantId: string | null;
  };
  changedFields: string[];
  metadata?: Record<string, string | number | boolean | null>;
}
