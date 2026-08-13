import { Injectable } from '@angular/core';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { firebaseApp } from '@core/firebase-app';
import { AuthUser } from '@core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private readonly auth = getAuth(firebaseApp);
  private authReady: Promise<User | null> | null = null;

  async loginWithEmail(email: string, password: string, rememberDevice: boolean): Promise<string> {
    await setPersistence(
      this.auth,
      rememberDevice ? browserLocalPersistence : browserSessionPersistence,
    );

    const credential = await signInWithEmailAndPassword(this.auth, email.trim(), password);
    return credential.user.getIdToken();
  }

  async loginWithGoogle(): Promise<string> {
    await setPersistence(this.auth, browserLocalPersistence);
    const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
    return credential.user.getIdToken();
  }

  sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email.trim());
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.auth.currentUser) {
      return this.auth.currentUser;
    }

    this.authReady ??= new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });

    return this.authReady;
  }

  async getIdToken(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user ? user.getIdToken() : null;
  }

  async getAuthUser(): Promise<AuthUser | null> {
    const user = await this.getCurrentUser();

    if (!user) {
      return null;
    }

    return {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? 'Admin User',
      photoUrl: user.photoURL ?? '',
    };
  }

  get userEmail(): string {
    return this.auth.currentUser?.email ?? 'admin@orderbridge.ai';
  }

  get userPhotoUrl(): string {
    return this.auth.currentUser?.photoURL ?? '';
  }
}
