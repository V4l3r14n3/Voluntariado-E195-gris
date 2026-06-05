import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";

function NotFoundComponent() {
  const { t } = useTranslation('common');
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t('notFound.title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('notFound.message')}</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            {t('notFound.goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function UnauthLanguageToggle() {
  const { isAuthenticated, authReady } = useAuth();
  if (!authReady || isAuthenticated) return null;
  return (
    <div className="fixed top-3 right-3 z-[60]">
      <LanguageToggle />
    </div>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <UnauthLanguageToggle />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
