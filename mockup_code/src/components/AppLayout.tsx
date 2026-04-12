import type { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/lib/auth-context';

export function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
