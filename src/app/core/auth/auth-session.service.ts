import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { UserRole } from '@core/models/user.model';

export interface CurrentUserProfile {
  id: string;
  email: string;
  role: UserRole;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  readonly profile = signal<CurrentUserProfile | null>(null);
  readonly isLoadingProfile = signal(false);
  readonly profileError = signal('');
  private profileRequest?: Promise<CurrentUserProfile | null>;

  constructor(
    private readonly apiService: ApiService,
    private readonly firebaseAuth: FirebaseAuthService,
  ) {}

  async loadProfile(force = false): Promise<CurrentUserProfile | null> {
    if (!force && this.profile()) return this.profile();
    if (!force && this.profileRequest) return this.profileRequest;

    const firebaseUser = await this.firebaseAuth.getCurrentUser();
    if (!firebaseUser) {
      this.clear();
      return null;
    }

    this.isLoadingProfile.set(true);
    this.profileError.set('');
    this.profileRequest = firstValueFrom(this.apiService.get<CurrentUserProfile>('auth/me'))
      .then((profile) => {
        if (!profile.active) {
          this.clear('Your OrderBridge account is inactive.');
          return null;
        }
        this.profile.set(profile);
        return profile;
      })
      .catch((error: unknown) => {
        this.clear(error instanceof Error ? error.message : 'Unable to verify your OrderBridge access.');
        return null;
      })
      .finally(() => {
        this.isLoadingProfile.set(false);
        this.profileRequest = undefined;
      });

    return this.profileRequest;
  }

  clear(message = ''): void {
    this.profile.set(null);
    this.profileError.set(message);
  }
}
