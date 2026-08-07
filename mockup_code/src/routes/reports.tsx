import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { useOpportunities } from "@/lib/queries/opportunities";
import { useCertificates } from "@/lib/queries/certificates";
import { toast } from "sonner";
import { FileText, Download, Award, Users, CalendarCheck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/" });
  }, [authReady, user, navigate]);

  if (!authReady) return <PageLoader />;
  if (!user) return null;

  if (user.role === 'organization') return <OrgReports />;
  return <VolunteerReports />;
}

function OrgReports() {
  const { user } = useAuth();
  const { t } = useTranslation(['reports', 'common']);
  const orgId = user?.organization_id ?? undefined;
  const { data: orgOpps = [] } = useOpportunities({ organizationId: orgId });
  const totalApplicants = orgOpps.reduce((sum, o) => sum + o.applicants.length, 0);

  const handleGenerateCert = () => {
    toast.success(t('reports:org.certGenerated'));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t('reports:org.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('reports:org.subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Users className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{t('reports:org.totalVolunteers')}</span>
          </div>
          <div className="text-3xl font-semibold tabular-nums">{totalApplicants}</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <CalendarCheck className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{t('reports:org.totalActivities')}</span>
          </div>
          <div className="text-3xl font-semibold tabular-nums">{orgOpps.length}</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{t('reports:org.attendanceRate')}</span>
          </div>
          <div className="text-3xl font-semibold tabular-nums">94%</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm mb-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold">{t('reports:org.activitiesWithParticipants')}</h2>
          <button onClick={handleGenerateCert} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">
            <FileText className="size-4" /> {t('reports:org.generateCerts')}
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">{t('reports:org.table.activity')}</th>
              <th className="px-5 py-3 text-left">{t('reports:org.table.date')}</th>
              <th className="px-5 py-3 text-left">{t('reports:org.table.participants')}</th>
              <th className="px-5 py-3 text-left">{t('reports:org.table.attendance')}</th>
              <th className="px-5 py-3 text-right">{t('reports:org.table.certificate')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orgOpps.map(opp => (
              <tr key={opp.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3.5 font-medium">{opp.title}</td>
                <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{opp.date}</td>
                <td className="px-5 py-3.5 tabular-nums">{opp.applicants.length}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '94%' }} />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">94%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={handleGenerateCert} className="p-1.5 hover:bg-accent rounded-sm transition-colors" title={t('reports:org.generateCerts')}>
                    <Download className="size-4 text-primary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VolunteerReports() {
  const { user } = useAuth();
  const { t } = useTranslation(['reports', 'common']);
  const { data: certificates = [] } = useCertificates(user?.id);
  const badges = [
    { emoji: "🌱", name: t('reports:vol.badges.firstTimer.name'), desc: t('reports:vol.badges.firstTimer.desc') },
    { emoji: "🌊", name: t('reports:vol.badges.oceanGuardian.name'), desc: t('reports:vol.badges.oceanGuardian.desc') },
    { emoji: "🌳", name: t('reports:vol.badges.treeHugger.name'), desc: t('reports:vol.badges.treeHugger.desc') },
    { emoji: "⭐", name: t('reports:vol.badges.starVolunteer.name'), desc: t('reports:vol.badges.starVolunteer.desc') },
  ];
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t('reports:vol.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('reports:vol.subtitle')}</p>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><Award className="size-5 text-primary" /> {t('reports:vol.myBadges')}</h2>
        <div className="grid grid-cols-4 gap-3">
          {badges.map((badge, i) => (
            <div key={i} className="text-center p-4 bg-muted rounded-sm">
              <div className="text-3xl mb-2">{badge.emoji}</div>
              <div className="text-sm font-medium">{badge.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{badge.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold flex items-center gap-2"><FileText className="size-5 text-primary" /> {t('reports:vol.certificates')}</h2>
        </div>
        <div className="divide-y divide-border">
          {certificates.map(cert => (
            <div key={cert.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{cert.activityTitle}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t('reports:vol.completedOn', { date: cert.completedDate })}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-sm ${cert.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-warning/20 text-warning-foreground'}`}>
                  {cert.status === 'completed' ? t('common:statusLabels.completed') : t('common:statusLabels.pending')}
                </span>
                {cert.status === 'completed' && (
                  <button onClick={() => toast.success(t('reports:vol.downloaded'))} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-sm hover:bg-accent transition-colors">
                    <Download className="size-3" /> {t('reports:vol.download')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
