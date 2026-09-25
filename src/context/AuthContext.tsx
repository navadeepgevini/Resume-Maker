'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getAdditionalUserInfo,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { logActivityClient } from '@/lib/activity-logger';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email' | 'guest';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<{ user: AuthUser; isNewUser: boolean }>;
  loginWithEmail: (email: string, password: string, name?: string, isSignUp?: boolean) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

/** Maps Firebase Auth error codes to human-readable messages. */
function friendlyAuthError(err: unknown): Error {
  const code = (err as { code?: string })?.code ?? '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/invalid-login-credentials': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/unauthorized-domain': 'Google Sign-In is not enabled for this domain yet.',
    'auth/operation-not-allowed': 'Email/Password sign-in is disabled in your Firebase console.',
  };
  
  // Log the unknown code so we can debug it in the console
  if (!messages[code]) {
    console.error(`Unknown Firebase Auth Error Code: ${code}`);
  }
  
  return new Error(messages[code] || 'Authentication failed. Please check your details and try again.');
}

const AUTH_STORAGE_KEY = 'resumemaker_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Helper to map FirebaseUser to AuthUser */
function mapFirebaseUser(fUser: FirebaseUser): AuthUser {
  return {
    id: fUser.uid,
    name: fUser.displayName || fUser.email?.split('@')[0] || 'User',
    email: fUser.email || '',
    avatar: fUser.photoURL || undefined,
    provider: fUser.providerData.some((p) => p.providerId === 'google.com')
      ? 'google'
      : 'email',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      if (fUser) {
        const mapped = mapFirebaseUser(fUser);
        setUser(mapped);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mapped));
      } else {
        // No active Firebase session — clear any stale cached user.
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /** Helper to sync profile into ResumeForge localStorage */
  const syncResumePersonal = useCallback((profile: AuthUser) => {
    try {
      const currentResumeData = localStorage.getItem('resumeforge_data');
      if (currentResumeData) {
        const parsed = JSON.parse(currentResumeData);
        if (!parsed.personal.fullName || parsed.personal.fullName === 'John Doe') {
          parsed.personal.fullName = profile.name;
          parsed.personal.email = profile.email;
          if (profile.avatar) {
            parsed.personal.photo = profile.avatar;
          }
          localStorage.setItem('resumeforge_data', JSON.stringify(parsed));
        }
      }
    } catch {
      // Ignore sync error
    }
  }, []);

  /**
   * Google Sign-In via a real Firebase popup. Throws on failure/cancellation —
   * callers must handle the rejection rather than assume success.
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;
      const mapped = mapFirebaseUser(result.user);
      setUser(mapped);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mapped));
      } catch (e) {}
      syncResumePersonal(mapped);
      logActivityClient(mapped.id, mapped.email, 'USER_LOGIN');
      return { user: mapped, isNewUser };
    } catch (err: unknown) {
      throw friendlyAuthError(err);
    }
  }, [syncResumePersonal]);

  /**
   * Email & Password Sign In / Sign Up using Firebase Authentication.
   * Throws on invalid credentials — never silently substitutes a fake session.
   */
  const loginWithEmail = useCallback(
    async (email: string, password: string, name?: string, isSignUp?: boolean) => {
      try {
        if (isSignUp) {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          if (name) {
            await updateProfile(cred.user, { displayName: name });
          }
          const mapped = mapFirebaseUser({
            ...cred.user,
            displayName: name || cred.user.displayName,
          } as FirebaseUser);
          setUser(mapped);
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mapped));
          } catch(e) {}
          syncResumePersonal(mapped);
          logActivityClient(mapped.id, mapped.email, 'USER_LOGIN', { isSignUp: true });
          return { user: mapped, isNewUser: true };
        } else {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const mapped = mapFirebaseUser(cred.user);
          setUser(mapped);
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mapped));
          } catch(e) {}
          syncResumePersonal(mapped);
          logActivityClient(mapped.id, mapped.email, 'USER_LOGIN', { isSignUp: false });
          return { user: mapped, isNewUser: false };
        }
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },
    [syncResumePersonal],
  );

  /**
   * Forgot Password feature via Firebase sendPasswordResetEmail
   */
  const resetPassword = useCallback(async (email: string) => {
    if (!email) {
      throw new Error('Please enter your email address to reset password.');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      throw friendlyAuthError(err);
    }
  }, []);

  /**
   * Sign Out
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore signout error
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, loginWithGoogle, loginWithEmail, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
