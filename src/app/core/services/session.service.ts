import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WhatsAppSession } from '@core/models/session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  getSessions(): Observable<WhatsAppSession[]> {
    return of([]);
  }
}
