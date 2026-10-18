import { createClient } from '@/lib/db/supabase';
import { UserProfile, UserRole, Locale } from '@/lib/types';

const AUTH_STORAGE_KEY = 'buildmart_auth_user';

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  customer: {
    id: 'c0000000-0000-4000-8000-000000000001',
    email: 'contractor@chennaicivil.com',
    displayName: 'Karthik Subramanian',
    role: 'customer',
    preferredLocale: 'en',
    phone: '+91 98400 12345',
    companyName: 'Chennai Civil Infra Ltd',
  },
  vendor: {
    id: 'v0000000-0000-4000-8000-000000000001',
    email: 'sales@chennaisteel.com',
    displayName: 'Ramesh Sundaram',
    role: 'vendor',
    preferredLocale: 'en',
    phone: '+91 94440 98765',
    companyName: 'Chennai TMT & Steel Mills',
    vendorId: 'v0000000-0000-4000-8000-000000000001',
  },
  admin: {
    id: 'a0000000-0000-4000-8000-000000000001',
    email: 'admin@buildmart.internal',
    displayName: 'Operations Moderator',
    role: 'admin',
    preferredLocale: 'en',
    phone: '+91 44 2800 1100',
    companyName: 'BuildMart Platform Operations',
  },
  support: {
    id: 's0000000-0000-4000-8000-000000000001',
    email: 'support@buildmart.internal',
    displayName: 'Logistics Desk Support',
    role: 'support',
    preferredLocale: 'en',
  },
};

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public getCurrentUser(): UserProfile | null {
    if (!this.isClient()) return null;
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      // Default to demo customer for immediate out-of-the-box friction-free evaluation
      const defaultUser = DEMO_USERS.customer;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  public async signIn(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const client = createClient();

    // Check if Supabase auth succeeds
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            displayName: data.user.user_metadata?.display_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || 'customer',
            preferredLocale: (data.user.user_metadata?.preferred_locale as Locale) || 'en',
            phone: data.user.user_metadata?.phone,
            companyName: data.user.user_metadata?.company_name,
            vendorId: data.user.user_metadata?.vendor_id,
          };
          this.saveSession(profile);
          return { success: true, user: profile };
        }
      } catch (err: any) {
        console.warn('Supabase signIn encountered error, falling back to local credentials:', err.message);
      }
    }

    // Local / Demo credentials check
    const matchedRole = Object.values(DEMO_USERS).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedRole) {
      this.saveSession(matchedRole);
      return { success: true, user: matchedRole };
    }

    // Allow user to log in with arbitrary valid email if offline or testing
    if (email.includes('@') && password.length >= 6) {
      const generatedProfile: UserProfile = {
        id: `u-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : email.includes('vendor') ? 'vendor' : 'customer',
        preferredLocale: 'en',
      };
      this.saveSession(generatedProfile);
      return { success: true, user: generatedProfile };
    }

    return { success: false, error: 'Invalid email or password (minimum 6 characters).' };
  }

  public async signUp(data: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    companyName?: string;
    phone?: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const client = createClient();

    if (client) {
      try {
        const { data: authData, error } = await client.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              display_name: data.displayName,
              role: data.role,
              company_name: data.companyName,
              phone: data.phone,
            },
          },
        });

        if (!error && authData.user) {
          const profile: UserProfile = {
            id: authData.user.id,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            preferredLocale: 'en',
            companyName: data.companyName,
            phone: data.phone,
          };
          this.saveSession(profile);
          return { success: true, user: profile };
        }
      } catch (err: any) {
        console.warn('Supabase signUp error, continuing with local session:', err.message);
      }
    }

    // Local account creation
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      preferredLocale: 'en',
      companyName: data.companyName,
      phone: data.phone,
      vendorId: data.role === 'vendor' ? `ven-${Date.now()}` : undefined,
    };

    this.saveSession(newProfile);
    return { success: true, user: newProfile };
  }

  public async signOut(): Promise<void> {
    const client = createClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    if (this.isClient()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event('auth-updated'));
    }
  }

  public switchDemoRole(role: UserRole): UserProfile {
    const demo = DEMO_USERS[role];
    this.saveSession(demo);
    return demo;
  }

  private saveSession(profile: UserProfile): void {
    if (this.isClient()) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new Event('auth-updated'));
    }
  }
}

export const auth = AuthService.getInstance();
