import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminUser } from '@core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  getAdminUsers(): Observable<AdminUser[]> {
    return of([]);
  }
}
