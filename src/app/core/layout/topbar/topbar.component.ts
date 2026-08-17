import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '@core/auth/firebase-auth.service';
import { AuthSessionService } from '@core/auth/auth-session.service';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  @Output() menuRequested = new EventEmitter<void>();
  profileMenuOpen = false;
  profileImageFailed = false;
  isLoggingOut = false;

  constructor(
    private readonly authService: FirebaseAuthService,
    private readonly authSession: AuthSessionService,
    private readonly router: Router,
  ) {}

  get adminEmail(): string {
    return this.authService.userEmail;
  }
  get adminName(): string { return this.authService.profileAvatar.displayName; }
  get adminInitials(): string { return this.authService.profileAvatar.initials; }

  get adminPhotoUrl(): string {
    return this.profileImageFailed ? '' : this.authService.profileAvatar.photoUrl;
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
    } finally {
      this.isLoggingOut = false;
    }
  }
}
