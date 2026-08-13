import { Component, Input } from '@angular/core';
import { DashboardStat } from '@core/models/dashboard.model';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  @Input({ required: true }) stat!: DashboardStat;
}
