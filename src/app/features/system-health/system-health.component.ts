import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SystemHealth } from '@core/models/operations.model';
import { OperationsService } from '@core/services/operations.service';
import { humanizeOperationalValue, observationLabel, operationalTone } from '@core/utils/operations-display.util';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-system-health',
  imports: [DatePipe, DecimalPipe, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './system-health.component.html',
})
export class SystemHealthComponent implements OnInit {
  data: SystemHealth | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private readonly operationsService: OperationsService) {}

  async ngOnInit(): Promise<void> { await this.load(); }

  async load(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.data = await firstValueFrom(this.operationsService.getSystemHealth());
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  readonly label = observationLabel;
  readonly humanize = humanizeOperationalValue;
  readonly tone = operationalTone;

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = error.error?.message;
      if (typeof backendMessage === 'string' && backendMessage.trim()) {
        return backendMessage;
      }
      if (error.status === 503) {
        return 'System health is temporarily unavailable. Please retry.';
      }
    }

    return error instanceof Error ? error.message : 'Unable to load system health.';
  }
}
