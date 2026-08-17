/**
 * Temporary Client-Side Auth Abstraction
 * 
 * Provides an isolated client-side authentication state for testing and navigation.
 * Designed to be easily replaced with Firebase Authentication / Google Sign-In later.
 */

const AUTH_STORAGE_KEY = 'ace_auth_state';

export interface UserSession {
  isAuthenticated: boolean;
  email?: string;
  name?: string;
  avatar?: string;
  role?: string;
  lastLogin?: string;
}

export class AuthService {
  private static instance: AuthService;
  private listeners: Array<(session: UserSession) => void> = [];

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getSession(): UserSession {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false };
    }

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.isAuthenticated === 'boolean') {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    return { isAuthenticated: false };
  }

  public signIn(user?: { email?: string; name?: string }): UserSession {
    const session: UserSession = {
      isAuthenticated: true,
      email: user?.email || 'operator@ace-engine.io',
      name: user?.name || 'Commercial Operator',
      avatar: 'CO',
      role: 'Enterprise RevOps Director',
      lastLogin: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Ignored
      }
    }

    this.notify(session);
    return session;
  }

  public signOut(): void {
    const session: UserSession = { isAuthenticated: false };
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // Ignored
      }
    }
    this.notify(session);
  }

  public subscribe(listener: (session: UserSession) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(session: UserSession): void {
    this.listeners.forEach((listener) => listener(session));
  }
}
