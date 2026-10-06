import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AgentOperations, OperationsWindow } from '@core/models/operations.model';
import { OperationsService } from '@core/services/operations.service';
import { humanizeOperationalValue, observationLabel, operationalTone } from '@core/utils/operations-display.util';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-agent-operations',
  imports: [DatePipe, DecimalPipe, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './agent-operations.component.html',
})
export class AgentOperationsComponent implements OnInit {
  readonly windows: OperationsWindow[] = ['1h', '24h', '7d', '30d'];
  window: OperationsWindow = '24h';
  data: AgentOperations | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private readonly operationsService: OperationsService) {}

  async ngOnInit(): Promise<void> { await this.load(); }

  async setWindow(window: string): Promise<void> {
    if (!this.windows.includes(window as OperationsWindow)) return;
    this.window = window as OperationsWindow;
    await this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.data = await firstValueFrom(this.operationsService.getAgentOperations(this.window));
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load agent operations.';
    } finally {
      this.isLoading = false;
    }
  }

  readonly label = observationLabel;
  readonly humanize = humanizeOperationalValue;
  readonly tone = operationalTone;
}
