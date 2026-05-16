import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOrganizations, useUpdateOrganization } from "@/lib/queries/organizations";
import type { Organization } from "@/lib/mock-data";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, FileText, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/organizations")({
  component: AdminOrganizationsPage,
});

function AdminOrganizationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: orgs = [] } = useOrganizations();
  const updateMut = useUpdateOrganization();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (!user || user.role !== 'admin') { navigate({ to: "/" }); return null; }

  const handleApprove = async (org: Organization) => {
    try {
      await updateMut.mutateAsync({ id: org.id, updates: { status: 'approved', rejection_message: null } });
      toast.success(`${org.name} has been approved!`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleReject = async () => {
    if (!selectedOrg) return;
    if (!rejectionMessage.trim()) { toast.error("Please provide a rejection reason"); return; }
    try {
      await updateMut.mutateAsync({ id: selectedOrg.id, updates: { status: 'rejected', rejection_message: rejectionMessage } });
      toast.success(`${selectedOrg.name} has been rejected`);
    } catch (err) {
      toast.error((err as Error).message);
    }
    setShowRejectDialog(false);
    setSelectedOrg(null);
    setRejectionMessage("");
  };

  const statusColors = {
    pending: 'bg-warning/20 text-warning-foreground',
    approved: 'bg-primary/10 text-primary',
    rejected: 'bg-destructive/10 text-destructive',
  };
  const statusIcons = { pending: Clock, approved: CheckCircle2, rejected: XCircle };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Organization Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage organization applications</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(filter => (
          <button key={filter} className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border hover:bg-accent transition-colors capitalize">
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Organization</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Document</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orgs.map(org => {
              const StatusIcon = statusIcons[org.status];
              return (
                <tr key={org.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{org.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{org.email}</td>
                  <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{org.createdAt}</td>
                  <td className="px-5 py-3.5">
                    {org.documentUrl ? (
                      <span className="flex items-center gap-1 text-primary text-xs font-medium"><FileText className="size-3" /> Uploaded</span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground text-xs"><Upload className="size-3" /> None</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm ${statusColors[org.status]}`}>
                      <StatusIcon className="size-3" />
                      {org.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {org.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleApprove(org)} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">Approve</button>
                        <button onClick={() => { setSelectedOrg(org); setShowRejectDialog(true); }} className="px-3 py-1.5 text-xs font-medium border border-destructive/30 text-destructive rounded-sm hover:bg-destructive/10 transition-colors">Reject</button>
                      </div>
                    )}
                    {org.status === 'rejected' && org.rejectionMessage && (
                      <span className="text-xs text-muted-foreground italic">"{org.rejectionMessage}"</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showRejectDialog && selectedOrg && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-sm shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Reject Organization</h3>
            <p className="text-sm text-muted-foreground mb-4">Provide a reason for rejecting <strong>{selectedOrg.name}</strong></p>
            <textarea
              value={rejectionMessage}
              onChange={e => setRejectionMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-none"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => { setShowRejectDialog(false); setSelectedOrg(null); setRejectionMessage(""); }} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/90 transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
