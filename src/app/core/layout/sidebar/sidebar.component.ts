import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SUPER_ADMIN_NAV_ITEMS } from '@core/constants/dashboard.constants';
import { FirebaseAuthService } from '@core/auth/firebase-auth.service';
import { AuthSessionService } from '@core/auth/auth-session.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();
  readonly navItems = SUPER_ADMIN_NAV_ITEMS;
  isLoggingOut = false;
  profileImageFailed = false;

  constructor(
    private readonly authService: FirebaseAuthService,
    private readonly authSession: AuthSessionService,
    private readonly router: Router,
  ) {}

  get adminEmail(): string {
    return this.authService.userEmail;
  }

  get adminPhotoUrl(): string {
    return this.profileImageFailed ? 'admin-profile.svg' : this.authService.userPhotoUrl || 'admin-profile.svg';
  }

  async logout(): Promise<void> {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    try {
      await this.authService.logout();
      this.authSession.clear();
      await this.router.navigate(['/login']);
      this.mobileOpenChange.emit(false);
    } finally {
      this.isLoggingOut = false;
    }
  }

  closeMobileNavigation(): void {
    this.mobileOpenChange.emit(false);
  }
}
