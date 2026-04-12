import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from './mock-data';
import { mockUsers } from './mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, role: UserRole, org?: string) => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string): boolean => {
    const found = mockUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    // For demo: accept any email and guess role from email
    if (email.includes('admin')) {
      setUser({ id: 'demo', name: 'Demo Admin', email, role: 'admin' });
      return true;
    }
    if (email.includes('org')) {
      setUser({ id: 'demo', name: 'Demo Organization', email, role: 'organization', organization: 'Demo Org' });
      return true;
    }
    setUser({ id: 'demo', name: 'Demo Volunteer', email, role: 'volunteer' });
    return true;
  };

  const logout = () => setUser(null);

  const register = (name: string, email: string, role: UserRole, org?: string) => {
    setUser({ id: 'new-' + Date.now(), name, email, role, organization: org });
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
