import { CanDeactivateFn } from '@angular/router';

interface PendingBusinessCreationComponent {
  canDeactivate(): boolean;
}

export const pendingBusinessCreationGuard: CanDeactivateFn<PendingBusinessCreationComponent> = (
  component,
) => component.canDeactivate();
