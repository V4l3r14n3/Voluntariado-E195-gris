import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { Tables } from './supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'organization' | 'volunteer';

export type AuthUser = Tables<'users'> & {
  organization?: Tables<'organizations'> | null;
};

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  securityQuestion?: string;
  organizationName?: string;
  existingOrganizationId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string; needsConfirmation?: boolean }>;
  updateProfile: (updates: Partial<Pick<AuthUser, 'name' | 'avatar_url' | 'security_question'>>) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('fetchProfile error', error);
    return null;
  }
  return data as AuthUser | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        const profile = await fetchProfile(newSession.user.id);
        if (mounted) setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const register = async (payload: RegisterPayload) => {
    let organizationId = payload.existingOrganizationId ?? null;

    if (payload.role === 'organization' && !organizationId && payload.organizationName) {
      const { data: orgRow, error: orgErr } = await supabase
        .from('organizations')
        .insert({
          name: payload.organizationName,
          email: payload.email,
          status: 'pending',
        })
        .select('id')
        .single();
      if (orgErr) return { ok: false, error: `Org creation failed: ${orgErr.message}` };
      organizationId = orgRow.id;
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          role: payload.role,
          organization_id: organizationId ?? '',
          security_question: payload.securityQuestion ?? '',
        },
      },
    });
    if (error) return { ok: false, error: error.message };

    const needsConfirmation = !data.session;
    return { ok: true, needsConfirmation };
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'name' | 'avatar_url' | 'security_question'>>) => {
    if (!user) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabase.from('users').update(updates).eq('id', user.id);
    if (error) return { ok: false, error: error.message };
    const fresh = await fetchProfile(user.id);
    setUser(fresh);
    return { ok: true };
  };

  const refreshProfile = async () => {
    if (!session?.user) return;
    const fresh = await fetchProfile(session.user.id);
    setUser(fresh);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!session,
        login,
        logout,
        register,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
