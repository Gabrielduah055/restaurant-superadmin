import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Plan } from '@core/models/plan.model';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  getPlans(): Observable<Plan[]> {
    return of([]);
  }
}
