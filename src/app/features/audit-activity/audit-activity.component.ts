import { DatePipe, KeyValuePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuditLogEntry, AuditLogPage } from '@core/models/operations.model';
import { OperationsService } from '@core/services/operations.service';
import { humanizeOperationalValue } from '@core/utils/operations-display.util';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-audit-activity',
  imports: [DatePipe, KeyValuePipe, PageHeaderComponent],
  templateUrl: './audit-activity.component.html',
})
export class AuditActivityComponent implements OnInit {
  data: AuditLogPage | null = null;
  items: AuditLogEntry[] = [];
  isLoading = true;
  isLoadingMore = false;
  errorMessage = '';

  constructor(private readonly operationsService: OperationsService) {}

  async ngOnInit(): Promise<void> { await this.load(); }

  async load(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.data = await firstValueFrom(this.operationsService.getAuditLogs());
      this.items = this.data.items;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load audit logs.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadMore(): Promise<void> {
    if (!this.data?.nextCursor || this.isLoadingMore) return;
    this.isLoadingMore = true;
    try {
      const nextPage = await firstValueFrom(
        this.operationsService.getAuditLogs({ after: this.data.nextCursor }),
      );
      this.items = [...this.items, ...nextPage.items];
      this.data = { ...nextPage, items: this.items };
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load more audit logs.';
    } finally {
      this.isLoadingMore = false;
    }
  }

  readonly humanize = humanizeOperationalValue;
}
