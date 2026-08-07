import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { UserRole } from "@/lib/mock-data";
import { useOrganizations } from "@/lib/queries/organizations";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);
  const { data: organizations = [] } = useOrganizations();
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
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('auth:register.validation.nameRequired');
    if (!email.trim()) errs.email = t('auth:register.validation.emailRequired');
    if (!password) errs.password = t('auth:register.validation.passwordRequired');
    if (password.length < 6) errs.password = t('auth:register.validation.passwordMin');
    if (password !== confirmPassword) errs.confirmPassword = t('auth:register.validation.passwordMatch');
    if (!securityQuestion) errs.securityQuestion = t('auth:register.validation.questionRequired');
    if (!securityAnswer) errs.securityAnswer = t('auth:register.validation.answerRequired');
    if (role === "organization") {
      if (!selectedOrg) errs.organization = t('auth:register.validation.orgSelect');
      else if (selectedOrg === "new" && !newOrgName.trim()) errs.organization = t('auth:register.validation.orgName');
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    const result = await register({
      name,
      email,
      password,
      role,
      securityQuestion,
      existingOrganizationId: role === "organization" && selectedOrg && selectedOrg !== "new" ? selectedOrg : undefined,
      organizationName: role === "organization" && selectedOrg === "new" ? newOrgName.trim() : undefined,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error ?? t('auth:register.failed'));
      return;
    }
    if (result.needsConfirmation) {
      toast.success(t('auth:register.confirmEmail'));
      navigate({ to: "/login" });
    } else {
      toast.success(t('auth:register.success'));
      navigate({ to: "/dashboard" });
    }
  };

  const roles: { value: UserRole; label: string; desc: string }[] = [
    { value: "volunteer", label: t('common:roles.volunteer'), desc: t('auth:register.roleDesc.volunteer') },
    { value: "organization", label: t('common:roles.organization'), desc: t('auth:register.roleDesc.organization') },
    { value: "admin", label: t('common:roles.admin'), desc: t('auth:register.roleDesc.admin') },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="size-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">{t('common:brand')}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t('auth:register.title')}</p>
        </div>

        <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
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
              <label className="text-sm font-medium mb-1 block">{t('auth:register.fullName')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('auth:register.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('auth:register.password')}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('auth:register.confirmPassword')}</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('auth:register.securityQuestion')}</label>
              <select value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('auth:register.selectQuestion')}</option>
                <option value="pet">{t('auth:register.questions.pet')}</option>
                <option value="city">{t('auth:register.questions.city')}</option>
                <option value="color">{t('auth:register.questions.color')}</option>
                <option value="school">{t('auth:register.questions.school')}</option>
              </select>
              {errors.securityQuestion && <p className="text-xs text-destructive mt-1">{errors.securityQuestion}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('auth:register.securityAnswer')}</label>
              <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.securityAnswer && <p className="text-xs text-destructive mt-1">{errors.securityAnswer}</p>}
            </div>

            {role === "organization" && (
              <div>
                <label className="text-sm font-medium mb-1 block">{t('auth:register.organization')}</label>
                <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">{t('auth:register.selectOrg')}</option>
                  {organizations.filter(o => o.status === 'approved').map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                  <option value="new">{t('auth:register.createNewOrg')}</option>
                </select>
                {selectedOrg === "new" && (
                  <input type="text" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring mt-2" placeholder={t('auth:register.newOrgPlaceholder')} />
                )}
                {errors.organization && <p className="text-xs text-destructive mt-1">{errors.organization}</p>}
              </div>
            )}

            <button type="submit" disabled={submitting} className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors mt-2 disabled:opacity-60">
              {submitting ? t('auth:register.submitting') : t('auth:register.submit')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">{t('auth:register.haveAccount')} </span>
            <Link to="/login" className="text-sm text-primary font-medium hover:underline">{t('auth:register.loginLink')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
