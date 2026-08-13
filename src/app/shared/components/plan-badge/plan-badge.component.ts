import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plan-badge',
  imports: [],
  templateUrl: './plan-badge.component.html',
})
export class PlanBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() tone: 'primary' | 'secondary' | 'muted' = 'primary';
}
