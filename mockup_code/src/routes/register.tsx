import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { UserRole } from "@/lib/mock-data";
import { mockOrganizations } from "@/lib/mock-data";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("volunteer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    if (password.length < 6) errs.password = "Min 6 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!securityQuestion) errs.securityQuestion = "Required";
    if (!securityAnswer) errs.securityAnswer = "Required";
    if (role === "organization" && !selectedOrg && !newOrgName) errs.organization = "Select or create an organization";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const org = role === "organization" ? (selectedOrg === "new" ? newOrgName : selectedOrg) : undefined;
    register(name, email, role, org);
    toast.success("Registration successful! Welcome aboard.");
    navigate({ to: "/dashboard" });
  };

  const roles: { value: UserRole; label: string; desc: string }[] = [
    { value: "volunteer", label: "Volunteer", desc: "Find and join opportunities" },
    { value: "organization", label: "Organization", desc: "Post and manage opportunities" },
    { value: "admin", label: "Administrator", desc: "System administration" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="size-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">Volunteero</span>
          </div>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
          {/* Role selection */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-3 rounded-sm border text-center transition-colors ${
                  role === r.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
              >
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-[11px] mt-0.5 opacity-70">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Security Question</label>
              <select value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select a question...</option>
                <option value="pet">What is your pet's name?</option>
                <option value="city">What city were you born in?</option>
                <option value="color">What is your favorite color?</option>
                <option value="school">What was your first school?</option>
              </select>
              {errors.securityQuestion && <p className="text-xs text-destructive mt-1">{errors.securityQuestion}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Security Answer</label>
              <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.securityAnswer && <p className="text-xs text-destructive mt-1">{errors.securityAnswer}</p>}
            </div>

            {role === "organization" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Organization</label>
                <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select organization...</option>
                  {mockOrganizations.filter(o => o.status === 'approved').map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                  <option value="new">+ Create New Organization</option>
                </select>
                {selectedOrg === "new" && (
                  <input type="text" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring mt-2" placeholder="New organization name" />
                )}
                {errors.organization && <p className="text-xs text-destructive mt-1">{errors.organization}</p>}
              </div>
            )}

            <button type="submit" className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors mt-2">
              Create Account
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-sm text-primary font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
