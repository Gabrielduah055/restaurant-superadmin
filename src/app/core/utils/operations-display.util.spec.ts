import { humanizeOperationalValue, observationLabel, operationalTone } from './operations-display.util';

describe('operations display utilities', () => {
  it('renders absent observations as unknown', () => {
    expect(observationLabel('unknown')).toBe('Unknown');
    expect(observationLabel('not_monitored')).toBe('Not monitored');
  });

  it('does not hide stale observations behind a healthy label', () => {
    expect(observationLabel('healthy', 'stale')).toBe('Healthy · Stale');
    expect(operationalTone('healthy', 'stale')).toBe('warning');
  });

  it('humanizes safe backend status codes', () => {
    expect(humanizeOperationalValue('provider_request')).toBe('Provider Request');
  });
});
