import { Freshness, RuntimeHealthStatus } from '@core/models/operations.model';

export const humanizeOperationalValue = (value: string | null | undefined): string => {
  if (!value) return 'Unknown';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const observationLabel = (
  status: string | null | undefined,
  freshness?: Freshness,
): string => {
  if (!status || status === 'unknown') return 'Unknown';
  if (status === 'not_monitored') return 'Not monitored';
  return freshness === 'stale'
    ? `${humanizeOperationalValue(status)} · Stale`
    : humanizeOperationalValue(status);
};

export const operationalTone = (
  status: string | null | undefined,
  freshness?: Freshness,
): 'danger' | 'warning' | 'neutral' | 'success' => {
  if (freshness === 'stale' || status === 'stale') return 'warning';
  if (status === 'degraded' || status === 'failed' || status === 'failure_observed') return 'danger';
  if (status === 'healthy' || status === 'observed' || status === 'activity_observed') return 'success';
  return 'neutral';
};

export const isUnknownHealth = (status: RuntimeHealthStatus): boolean =>
  status === 'unknown' || status === 'not_monitored';
