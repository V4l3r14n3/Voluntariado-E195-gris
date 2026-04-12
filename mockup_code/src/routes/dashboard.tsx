import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { mockOpportunities, mockOrganizations, mockCertificates } from "@/lib/mock-data";
import { Users, Building2, CalendarDays, CheckCircle2, Clock, AlertTriangle, TrendingUp, Award } from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate({ to: "/" }); return null; }

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
  const pendingOrgs = mockOrganizations.filter(o => o.status === 'pending');
  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">System overview and management</p>
        </div>
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-8">
          <StaggerItem><StatCard icon={Building2} label="Organizations" value={mockOrganizations.length} sub={`${pendingOrgs.length} pending approval`} /></StaggerItem>
          <StaggerItem><StatCard icon={Users} label="Total Volunteers" value="1,247" sub="+23 this week" /></StaggerItem>
          <StaggerItem><StatCard icon={CalendarDays} label="Active Opportunities" value={mockOpportunities.filter(o => o.published).length} /></StaggerItem>
          <StaggerItem><StatCard icon={CheckCircle2} label="Approved Orgs" value={mockOrganizations.filter(o => o.status === 'approved').length} /></StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-2 gap-6">
          <StaggerItem>
            <HoverCard>
              <div className="bg-card border border-border rounded-sm shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base font-semibold">Pending Organizations</h2>
                </div>
                <div className="divide-y divide-border">
                  {pendingOrgs.length === 0 && <div className="p-5 text-sm text-muted-foreground">No pending organizations</div>}
                  {pendingOrgs.map(org => (
                    <div key={org.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{org.name}</div>
                        <div className="text-xs text-muted-foreground">{org.email}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-warning/20 text-warning-foreground rounded-sm">Pending</span>
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
                  <h2 className="text-base font-semibold">Recent Activity</h2>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { text: "River Cleanup Initiative submitted verification", time: "2 hours ago", icon: Building2 },
                    { text: "New volunteer registered: John Smith", time: "4 hours ago", icon: Users },
                    { text: "Beach Cleanup Drive completed successfully", time: "1 day ago", icon: CheckCircle2 },
                    { text: "Urban Garden Project application rejected", time: "2 days ago", icon: AlertTriangle },
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
  const orgOpps = mockOpportunities.filter(o => o.organizationId === 'org1');
  const totalApplicants = orgOpps.reduce((sum, o) => sum + o.applicants.length, 0);
  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Organization Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your opportunities and volunteers</p>
        </div>
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-8">
          <StaggerItem><StatCard icon={CalendarDays} label="Opportunities" value={orgOpps.length} sub={`${orgOpps.filter(o => o.published).length} published`} /></StaggerItem>
          <StaggerItem><StatCard icon={Users} label="Applicants" value={totalApplicants} sub="Across all events" /></StaggerItem>
          <StaggerItem><StatCard icon={TrendingUp} label="Completion Rate" value="92%" /></StaggerItem>
          <StaggerItem><StatCard icon={Clock} label="Upcoming" value={orgOpps.filter(o => o.published).length} sub="Next 30 days" /></StaggerItem>
        </StaggerContainer>

        <HoverCard>
          <div className="bg-card border border-border rounded-sm shadow-sm">
            <div className="p-5 border-b border-border">
              <h2 className="text-base font-semibold">Your Opportunities</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">City</th>
                  <th className="px-5 py-3 text-left">Applicants</th>
                  <th className="px-5 py-3 text-right">Status</th>
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
                        {opp.published ? 'Published' : 'Draft'}
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
  const appliedOpps = mockOpportunities.filter(o => o.applicants.includes('3'));
  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Volunteer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your volunteering activity and upcoming events</p>
        </div>
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-8">
          <StaggerItem><StatCard icon={CalendarDays} label="Applied Events" value={appliedOpps.length} /></StaggerItem>
          <StaggerItem><StatCard icon={CheckCircle2} label="Completed" value={mockCertificates.filter(c => c.status === 'completed').length} /></StaggerItem>
          <StaggerItem><StatCard icon={Clock} label="Hours Logged" value="24" sub="This month" /></StaggerItem>
          <StaggerItem><StatCard icon={Award} label="Certificates" value={mockCertificates.length} /></StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-2 gap-6">
          <StaggerItem>
            <HoverCard>
              <div className="bg-card border border-border rounded-sm shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base font-semibold">My Applications</h2>
                </div>
                <div className="divide-y divide-border">
                  {appliedOpps.length === 0 && <div className="p-5 text-sm text-muted-foreground">No applications yet.</div>}
                  {appliedOpps.map(opp => (
                    <div key={opp.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{opp.title}</div>
                        <div className="text-xs text-muted-foreground">{opp.organizationName} • {opp.date}</div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-sm">Registered</span>
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
                  <h2 className="text-base font-semibold">Recent Badges</h2>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3">
                  {["🌱 First Timer", "🌊 Ocean Guardian", "🌳 Tree Hugger"].map((badge, i) => (
                    <div key={i} className="text-center p-3 bg-muted rounded-sm">
                      <div className="text-2xl mb-1">{badge.split(' ')[0]}</div>
                      <div className="text-xs font-medium">{badge.split(' ').slice(1).join(' ')}</div>
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
