import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AgentOperations,
  AuditLogPage,
  OperationsWindow,
  SystemHealth,
  WhatsAppOperations,
} from '@core/models/operations.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OperationsService {
  constructor(private readonly apiService: ApiService) {}

  getWhatsAppOperations(window: OperationsWindow): Observable<WhatsAppOperations> {
    return this.apiService.get<WhatsAppOperations>(`admin/operations/whatsapp?window=${window}`);
  }

  getAgentOperations(window: OperationsWindow): Observable<AgentOperations> {
    return this.apiService.get<AgentOperations>(`admin/operations/agents?window=${window}`);
  }

  getSystemHealth(): Observable<SystemHealth> {
    return this.apiService.get<SystemHealth>('admin/operations/health');
  }

  getAuditLogs(options: { limit?: number; after?: string; action?: string } = {}): Observable<AuditLogPage> {
    const query = new URLSearchParams();
    query.set('limit', String(options.limit ?? 50));
    if (options.after) query.set('after', options.after);
    if (options.action) query.set('action', options.action);
    return this.apiService.get<AuditLogPage>(`admin/audit-logs?${query.toString()}`);
  }
}
