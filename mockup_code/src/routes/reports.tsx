import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { mockOpportunities, mockCertificates } from "@/lib/mock-data";
import { toast } from "sonner";
import { FileText, Download, Award, Users, CalendarCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate({ to: "/" }); return null; }

  if (user.role === 'organization') return <OrgReports />;
  return <VolunteerReports />;
}

function OrgReports() {
  const orgOpps = mockOpportunities.filter(o => o.organizationId === 'org1');
  const totalApplicants = orgOpps.reduce((sum, o) => sum + o.applicants.length, 0);

  const handleGenerateCert = () => {
    toast.success("Certificate PDF generated and ready for download!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Organization Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">View summaries and generate certificates</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Users className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Volunteers</span>
          </div>
          <div className="text-3xl font-semibold tabular-nums">{totalApplicants}</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <CalendarCheck className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Activities</span>
          </div>
          <div className="text-3xl font-semibold tabular-nums">{orgOpps.length}</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="size-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Attendance Rate</span>
          </div>
          <div className="text-3xl font-semibold tabular-nums">94%</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm mb-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold">Activities with Participants</h2>
          <button onClick={handleGenerateCert} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">
            <FileText className="size-4" /> Generate Certificates
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Activity</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Participants</th>
              <th className="px-5 py-3 text-left">Attendance</th>
              <th className="px-5 py-3 text-right">Certificate</th>
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
                  <button onClick={handleGenerateCert} className="p-1.5 hover:bg-accent rounded-sm transition-colors" title="Generate PDF">
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
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">My Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">View your certifications, badges, and completed activities</p>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><Award className="size-5 text-primary" /> My Badges</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: "🌱", name: "First Timer", desc: "Completed first activity" },
            { emoji: "🌊", name: "Ocean Guardian", desc: "Beach cleanup participant" },
            { emoji: "🌳", name: "Tree Hugger", desc: "Planted 10+ trees" },
            { emoji: "⭐", name: "Star Volunteer", desc: "50+ hours logged" },
          ].map((badge, i) => (
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
          <h2 className="text-base font-semibold flex items-center gap-2"><FileText className="size-5 text-primary" /> Certificates</h2>
        </div>
        <div className="divide-y divide-border">
          {mockCertificates.map(cert => (
            <div key={cert.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{cert.activityTitle}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Completed: {cert.completedDate}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-sm ${cert.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-warning/20 text-warning-foreground'}`}>
                  {cert.status}
                </span>
                {cert.status === 'completed' && (
                  <button onClick={() => toast.success("Certificate downloaded!")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-sm hover:bg-accent transition-colors">
                    <Download className="size-3" /> Download
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
