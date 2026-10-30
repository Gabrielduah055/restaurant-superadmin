import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { SystemHealth } from '@core/models/operations.model';
import { OperationsService } from '@core/services/operations.service';
import { SystemHealthComponent } from './system-health.component';

const makeHealthSnapshot = (overrides: Partial<SystemHealth> = {}): SystemHealth => ({
  generatedAt: '2026-10-07T10:00:00.000Z',
  api: {
    status: 'healthy',
    startedAt: '2026-10-07T09:00:00.000Z',
    observedAt: '2026-10-07T10:00:00.000Z',
    uptimeSeconds: 3600,
  },
  mongodb: {
    status: 'degraded',
    observedAt: '2026-10-07T10:00:00.000Z',
    latencyMs: null,
    readyState: 0,
    failureCode: 'MONGODB_DISCONNECTED',
  },
  queue: {
    runtime: null,
    backlog: {
      status: 'unavailable',
      reason: 'mongodb_disconnected',
      observedAt: null,
      pending: null,
      due: null,
      sending: null,
      failedLast24h: null,
      oldestPendingAt: null,
      lastAttemptAt: null,
    },
  },
  schedulers: [],
  auditPersistence: {
    runtime: null,
    queuedEntries: 0,
    inFlightEntries: 0,
    unresolvedEntries: 0,
    retryPassRunning: false,
  },
  ...overrides,
});

describe('SystemHealthComponent', () => {
  let getSystemHealth: jasmine.Spy<() => Observable<SystemHealth>>;

  const render = async () => {
    const fixture = TestBed.createComponent(SystemHealthComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  };

  const metricValue = (element: HTMLElement, label: string): string | undefined => {
    const metricLabel = Array.from(element.querySelectorAll('small')).find(
      (candidate) => candidate.textContent?.trim() === label,
    );
    return metricLabel?.parentElement?.querySelector('strong')?.textContent?.trim();
  };

  beforeEach(async () => {
    getSystemHealth = jasmine.createSpy('getSystemHealth');
    await TestBed.configureTestingModule({
      imports: [SystemHealthComponent],
      providers: [
        {
          provide: OperationsService,
          useValue: { getSystemHealth },
        },
      ],
    }).compileComponents();
  });

  it('renders unavailable backlog counts and an absent observation timestamp explicitly', async () => {
    getSystemHealth.and.returnValue(of(makeHealthSnapshot()));
    const { element } = await render();
    const text = (element.textContent ?? '').replace(/\s+/g, ' ');

    expect(text).toContain('Backlog unavailable · Mongodb Disconnected · Observed Unknown');
    expect(metricValue(element, 'Pending')).toBe('Unavailable');
    expect(metricValue(element, 'Due')).toBe('Unavailable');
    expect(metricValue(element, 'Sending')).toBe('Unavailable');
    expect(metricValue(element, 'Failed in 24h')).toBe('Unavailable');
  });

  it('preserves valid zero backlog counts', async () => {
    const snapshot = makeHealthSnapshot();
    snapshot.queue.backlog = {
      ...snapshot.queue.backlog,
      status: 'available',
      reason: null,
      observedAt: '2026-10-07T10:00:00.000Z',
      pending: 0,
      due: 0,
      sending: 0,
      failedLast24h: 0,
    };
    getSystemHealth.and.returnValue(of(snapshot));
    const { element } = await render();

    expect(metricValue(element, 'Pending')).toBe('0');
    expect(metricValue(element, 'Due')).toBe('0');
    expect(metricValue(element, 'Sending')).toBe('0');
    expect(metricValue(element, 'Failed in 24h')).toBe('0');
  });

  it('shows unresolved audit work when queued is zero and an entry is in flight', async () => {
    const snapshot = makeHealthSnapshot({
      auditPersistence: {
        runtime: null,
        queuedEntries: 0,
        inFlightEntries: 1,
        unresolvedEntries: 1,
        retryPassRunning: true,
      },
    });
    getSystemHealth.and.returnValue(of(snapshot));
    const { element } = await render();
    const text = (element.textContent ?? '').replace(/\s+/g, ' ');

    expect(text).toContain('1 unresolved · 0 queued · 1 in flight');
    expect(text).toContain('Retry pass: Running');
  });

  it('shows the backend 503 message and retries the health request', async () => {
    const unavailable = new HttpErrorResponse({
      status: 503,
      error: {
        success: false,
        message: 'Authenticated access could not be authorized at this time',
      },
    });
    getSystemHealth.and.returnValues(
      throwError(() => unavailable),
      of(makeHealthSnapshot()),
    );
    const { fixture, element } = await render();

    expect(element.textContent).toContain('Authenticated access could not be authorized at this time');
    const retry = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Retry',
    );
    expect(retry).toBeTruthy();

    retry?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(getSystemHealth).toHaveBeenCalledTimes(2);
    expect(element.textContent).toContain('Wasender outbound queue');
    expect(element.textContent).not.toContain('Authenticated access could not be authorized at this time');
  });
});
