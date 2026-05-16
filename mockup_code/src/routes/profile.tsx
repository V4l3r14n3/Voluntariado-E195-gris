import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserCircle, Lock, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");

  if (!user) { navigate({ to: "/" }); return null; }

  const handleSave = async () => {
    const result = await updateProfile({ name });
    if (!result.ok) { toast.error(result.error ?? "Update failed"); return; }
    if (email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) { toast.error(`Email update: ${error.message}`); return; }
      toast.success("Profile updated. Check both emails to confirm address change.");
    } else {
      toast.success("Profile updated successfully!");
    }
    setEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmNew) { toast.error("Passwords don't match"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed successfully!");
    setChangingPassword(false);
    setNewPassword(""); setConfirmNew("");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Profile</h1>

      <div className="bg-card border border-border rounded-sm shadow-sm mb-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="size-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">Personal Information</h2>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">Save</button>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Name</label>
              {editing ? (
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              ) : (
                <div className="text-sm">{user.name}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
              {editing ? (
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              ) : (
                <div className="text-sm">{user.email}</div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Role</label>
            <div className="text-sm capitalize">{user.role}</div>
          </div>
          {user.organization && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Organization</label>
              <div className="text-sm">{user.organization.name}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm mb-6">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <Lock className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">Security</h2>
        </div>
        <div className="p-5">
          {!changingPassword ? (
            <button onClick={() => setChangingPassword(true)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-3 max-w-sm">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="password" value={confirmNew} onChange={e => setConfirmNew(e.target.value)} placeholder="Confirm new password" className="px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90">Update Password</button>
                <button type="button" onClick={() => setChangingPassword(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <HelpCircle className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">Security Question</h2>
        </div>
        <div className="p-5">
          <div className="text-sm text-muted-foreground mb-2">Your security question is set. It will be used to recover your password.</div>
          <div className="text-sm font-medium">{user.security_question || "What is your pet's name?"}</div>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={() => { logout(); navigate({ to: "/" }); }} className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-sm hover:bg-destructive/10 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}
