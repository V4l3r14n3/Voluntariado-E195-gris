import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserCircle, Lock, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, authReady, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['profile', 'common']);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/" });
  }, [authReady, user, navigate]);

  if (!authReady) return <PageLoader />;
  if (!user) return null;

  const handleSave = async () => {
    const result = await updateProfile({ name });
    if (!result.ok) { toast.error(result.error ?? t('profile:toasts.updateFailed')); return; }
    if (email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) { toast.error(t('profile:toasts.emailUpdateError', { msg: error.message })); return; }
      toast.success(t('profile:toasts.emailConfirm'));
    } else {
      toast.success(t('profile:toasts.profileUpdated'));
    }
    setEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error(t('profile:toasts.passwordMin')); return; }
    if (newPassword !== confirmNew) { toast.error(t('profile:toasts.passwordMatch')); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success(t('profile:toasts.passwordChanged'));
    setChangingPassword(false);
    setNewPassword(""); setConfirmNew("");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">{t('profile:title')}</h1>

      <div className="bg-card border border-border rounded-sm shadow-sm mb-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="size-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">{t('profile:personal')}</h2>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">{t('common:edit')}</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">{t('common:cancel')}</button>
              <button onClick={handleSave} className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">{t('common:save')}</button>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('profile:fields.name')}</label>
              {editing ? (
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              ) : (
                <div className="text-sm">{user.name}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('profile:fields.email')}</label>
              {editing ? (
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              ) : (
                <div className="text-sm">{user.email}</div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('profile:fields.role')}</label>
            <div className="text-sm">{t(`common:roles.${user.role}` as const)}</div>
          </div>
          {user.organization && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('profile:fields.organization')}</label>
              <div className="text-sm">{user.organization.name}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm mb-6">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <Lock className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">{t('profile:security')}</h2>
        </div>
        <div className="p-5">
          {!changingPassword ? (
            <button onClick={() => setChangingPassword(true)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">
              {t('profile:changePassword')}
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-3 max-w-sm">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('profile:newPassword')} className="px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="password" value={confirmNew} onChange={e => setConfirmNew(e.target.value)} placeholder={t('profile:confirmNew')} className="px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90">{t('profile:updatePassword')}</button>
                <button type="button" onClick={() => setChangingPassword(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent">{t('common:cancel')}</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <HelpCircle className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">{t('profile:securityQuestion')}</h2>
        </div>
        <div className="p-5">
          <div className="text-sm text-muted-foreground mb-2">{t('profile:securityQuestionDesc')}</div>
          <div className="text-sm font-medium">{user.security_question || t('profile:defaultQuestion')}</div>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={() => { logout(); navigate({ to: "/" }); }} className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-sm hover:bg-destructive/10 transition-colors">
          {t('common:signOut')}
        </button>
      </div>
    </div>
  );
}
