import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() tone: 'danger' | 'warning' | 'neutral' | 'primary' | 'secondary' | 'muted' = 'neutral';
}
