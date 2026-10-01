import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '@core/auth/firebase-auth.service';
import { AuthSessionService } from '@core/auth/auth-session.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberDevice = false;
  showPassword = false;
  isLoading = false;
  isResetting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: FirebaseAuthService,
    private readonly authSession: AuthSessionService,
    private readonly router: Router,
  ) {}

  async login(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      await this.authService.loginWithEmail(this.email, this.password, this.rememberDevice);
      const profile = await this.authSession.loadProfile(true);
      if (!profile) {
        const profileError = this.authSession.profileError();
        await this.authService.logout();
        this.authSession.clear();
        this.errorMessage = profileError || 'This account does not have an active OrderBridge admin profile.';
        return;
      }
      if (profile.role !== 'super_admin') {
        await this.authService.logout();
        this.authSession.clear();
        this.errorMessage = 'This account does not have OrderBridge super-admin access.';
        return;
      }
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = this.getAuthErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      await this.authService.loginWithGoogle();
      const profile = await this.authSession.loadProfile(true);
      if (!profile) {
        const profileError = this.authSession.profileError();
        await this.authService.logout();
        this.authSession.clear();
        this.errorMessage = profileError || 'This account does not have an active OrderBridge admin profile.';
        return;
      }
      if (profile.role !== 'super_admin') {
        await this.authService.logout();
        this.authSession.clear();
        this.errorMessage = 'This account does not have OrderBridge super-admin access.';
        return;
      }
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = this.getAuthErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  async sendPasswordReset(): Promise<void> {
    if (this.isResetting || !this.email.trim()) {
      this.errorMessage = 'Enter your email address first, then click Forgot.';
      this.successMessage = '';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isResetting = true;

    try {
      await this.authService.sendPasswordReset(this.email);
      this.successMessage = 'Password reset email sent. Check your inbox.';
    } catch (error) {
      this.errorMessage = this.getAuthErrorMessage(error);
    } finally {
      this.isResetting = false;
    }
  }

  private getAuthErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('auth/invalid-credential')) {
      return 'The email or password is incorrect.';
    }

    if (message.includes('auth/user-not-found')) {
      return 'No account exists for this email address.';
    }

    if (message.includes('auth/wrong-password')) {
      return 'The password is incorrect.';
    }

    if (message.includes('auth/too-many-requests')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    if (message.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in was closed before it finished.';
    }

    if (message.includes('auth/popup-blocked')) {
      return 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.';
    }

    if (message.includes('auth/unauthorized-domain')) {
      return 'Google sign-in is not enabled for this website domain. Add the current domain to Firebase Authentication authorized domains.';
    }

    if (message.includes('auth/network-request-failed')) {
      return 'The authentication service could not be reached. Check your connection and try again.';
    }

    return 'Authentication failed. Please try again.';
  }

}
