import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { useOpportunities } from "@/lib/queries/opportunities";
import { useOrganizations } from "@/lib/queries/organizations";
import { useCertificates } from "@/lib/queries/certificates";
import { Users, Building2, CalendarDays, CheckCircle2, Clock, AlertTriangle, TrendingUp, Award } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/" });
  }, [authReady, user, navigate]);

  if (!authReady) return <PageLoader />;
  if (!user) return null;

  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "organization") return <OrgDashboard />;
  return <VolunteerDashboard />;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <HoverCard>
      <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{label}</div>
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-2">{sub}</div>}
          </div>
          <div className="size-10 rounded-sm flex items-center justify-center bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </div>
    </HoverCard>
  );
}

function AdminDashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { data: organizations = [] } = useOrganizations();
  const { data: opportunities = [] } = useOpportunities();
  const pendingOrgs = organizations.filter(o => o.status === 'pending');
  const approvedOrgs = organizations.filter(o => o.status === 'approved');
  const publishedOpps = opportunities.filter(o => o.published);
  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard:admin.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboard:admin.subtitle')}</p>
        </div>
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-8">
          <StaggerItem><StatCard icon={Building2} label={t('dashboard:admin.organizations')} value={organizations.length} sub={t('dashboard:admin.pendingApproval', { count: pendingOrgs.length })} /></StaggerItem>
          <StaggerItem><StatCard icon={Users} label={t('dashboard:admin.totalVolunteers')} value="—" sub={t('dashboard:admin.seeReports')} /></StaggerItem>
          <StaggerItem><StatCard icon={CalendarDays} label={t('dashboard:admin.activeOpportunities')} value={publishedOpps.length} /></StaggerItem>
          <StaggerItem><StatCard icon={CheckCircle2} label={t('dashboard:admin.approvedOrgs')} value={approvedOrgs.length} /></StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-2 gap-6">
          <StaggerItem>
            <HoverCard>
              <div className="bg-card border border-border rounded-sm shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base font-semibold">{t('dashboard:admin.pendingOrgs')}</h2>
                </div>
                <div className="divide-y divide-border">
                  {pendingOrgs.length === 0 && <div className="p-5 text-sm text-muted-foreground">{t('dashboard:admin.noPending')}</div>}
                  {pendingOrgs.map(org => (
                    <div key={org.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{org.name}</div>
                        <div className="text-xs text-muted-foreground">{org.email}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-warning/20 text-warning-foreground rounded-sm">{t('common:statusLabels.pending')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCard>
          </StaggerItem>

          <StaggerItem>
            <HoverCard>
              <div className="bg-card border border-border rounded-sm shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base font-semibold">{t('dashboard:admin.recentActivity')}</h2>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { text: t('dashboard:admin.activity.verification'), time: t('dashboard:admin.timeAgo.twoHours'), icon: Building2 },
                    { text: t('dashboard:admin.activity.newVolunteer'), time: t('dashboard:admin.timeAgo.fourHours'), icon: Users },
                    { text: t('dashboard:admin.activity.cleanupCompleted'), time: t('dashboard:admin.timeAgo.oneDay'), icon: CheckCircle2 },
                    { text: t('dashboard:admin.activity.rejected'), time: t('dashboard:admin.timeAgo.twoDays'), icon: AlertTriangle },
                  ].map((item, i) => (
                    <div key={i} className="p-4 flex items-start gap-3">
                      <item.icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm">{item.text}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}

function OrgDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const orgId = user?.organization_id ?? undefined;
  const { data: orgOpps = [] } = useOpportunities({ organizationId: orgId });
  const totalApplicants = orgOpps.reduce((sum, o) => sum + o.applicants.length, 0);
  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard:org.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboard:org.subtitle')}</p>
        </div>
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-8">
          <StaggerItem><StatCard icon={CalendarDays} label={t('dashboard:org.opportunities')} value={orgOpps.length} sub={t('dashboard:org.published', { count: orgOpps.filter(o => o.published).length })} /></StaggerItem>
          <StaggerItem><StatCard icon={Users} label={t('dashboard:org.applicants')} value={totalApplicants} sub={t('dashboard:org.acrossAll')} /></StaggerItem>
          <StaggerItem><StatCard icon={TrendingUp} label={t('dashboard:org.completionRate')} value="92%" /></StaggerItem>
          <StaggerItem><StatCard icon={Clock} label={t('dashboard:org.upcoming')} value={orgOpps.filter(o => o.published).length} sub={t('dashboard:org.next30')} /></StaggerItem>
        </StaggerContainer>

        <HoverCard>
          <div className="bg-card border border-border rounded-sm shadow-sm">
            <div className="p-5 border-b border-border">
              <h2 className="text-base font-semibold">{t('dashboard:org.yourOpps')}</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">{t('dashboard:org.table.title')}</th>
                  <th className="px-5 py-3 text-left">{t('dashboard:org.table.date')}</th>
                  <th className="px-5 py-3 text-left">{t('dashboard:org.table.city')}</th>
                  <th className="px-5 py-3 text-left">{t('dashboard:org.table.applicants')}</th>
                  <th className="px-5 py-3 text-right">{t('dashboard:org.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orgOpps.map(opp => (
                  <tr key={opp.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{opp.title}</td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{opp.date}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{opp.city}</td>
                    <td className="px-5 py-3.5 tabular-nums">{opp.applicants.length}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-sm ${opp.published ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {opp.published ? t('common:statusLabels.published') : t('common:statusLabels.draft')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HoverCard>
      </div>
    </PageTransition>
  );
}

function VolunteerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard', 'common']);
  const { data: opportunities = [] } = useOpportunities();
  const { data: certificates = [] } = useCertificates(user?.id);
  const appliedOpps = opportunities.filter(o => user && o.applicants.includes(user.id));
  const badges = [
    { emoji: "🌱", name: t('dashboard:volunteer.badges.firstTimer') },
    { emoji: "🌊", name: t('dashboard:volunteer.badges.oceanGuardian') },
    { emoji: "🌳", name: t('dashboard:volunteer.badges.treeHugger') },
  ];
  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard:volunteer.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboard:volunteer.subtitle')}</p>
        </div>
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-8">
          <StaggerItem><StatCard icon={CalendarDays} label={t('dashboard:volunteer.appliedEvents')} value={appliedOpps.length} /></StaggerItem>
          <StaggerItem><StatCard icon={CheckCircle2} label={t('dashboard:volunteer.completed')} value={certificates.filter(c => c.status === 'completed').length} /></StaggerItem>
          <StaggerItem><StatCard icon={Clock} label={t('dashboard:volunteer.hoursLogged')} value="—" sub={t('dashboard:volunteer.comingSoon')} /></StaggerItem>
          <StaggerItem><StatCard icon={Award} label={t('dashboard:volunteer.certificates')} value={certificates.length} /></StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-2 gap-6">
          <StaggerItem>
            <HoverCard>
              <div className="bg-card border border-border rounded-sm shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base font-semibold">{t('dashboard:volunteer.myApplications')}</h2>
                </div>
                <div className="divide-y divide-border">
                  {appliedOpps.length === 0 && <div className="p-5 text-sm text-muted-foreground">{t('dashboard:volunteer.noApplications')}</div>}
                  {appliedOpps.map(opp => (
                    <div key={opp.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{opp.title}</div>
                        <div className="text-xs text-muted-foreground">{opp.organizationName} • {opp.date}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-sm">{t('common:statusLabels.registered')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCard>
          </StaggerItem>

          <StaggerItem>
            <HoverCard>
              <div className="bg-card border border-border rounded-sm shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base font-semibold">{t('dashboard:volunteer.recentBadges')}</h2>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3">
                  {badges.map((badge, i) => (
                    <div key={i} className="text-center p-3 bg-muted rounded-sm">
                      <div className="text-2xl mb-1">{badge.emoji}</div>
                      <div className="text-xs font-medium">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
