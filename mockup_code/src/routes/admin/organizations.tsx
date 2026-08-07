import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { useOrganizations, useUpdateOrganization } from "@/lib/queries/organizations";
import type { Organization } from "@/lib/mock-data";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, FileText, Upload } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

export const Route = createFileRoute("/admin/organizations")({
  component: AdminOrganizationsPage,
});

function AdminOrganizationsPage() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const { data: orgs = [] } = useOrganizations();
  const updateMut = useUpdateOrganization();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (authReady && (!user || user.role !== 'admin')) navigate({ to: "/" });
  }, [authReady, user, navigate]);

  if (!authReady) return <PageLoader />;
  if (!user || user.role !== 'admin') return null;

  const handleApprove = async (org: Organization) => {
    try {
      await updateMut.mutateAsync({ id: org.id, updates: { status: 'approved', rejection_message: null } });
      toast.success(t('admin:orgs.toasts.approved', { name: org.name }));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleReject = async () => {
    if (!selectedOrg) return;
    if (!rejectionMessage.trim()) { toast.error(t('admin:orgs.toasts.reasonRequired')); return; }
    try {
      await updateMut.mutateAsync({ id: selectedOrg.id, updates: { status: 'rejected', rejection_message: rejectionMessage } });
      toast.success(t('admin:orgs.toasts.rejected', { name: selectedOrg.name }));
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

  const filterLabel = (f: 'all' | 'pending' | 'approved' | 'rejected') => t(`admin:orgs.filters.${f}` as const);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t('admin:orgs.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('admin:orgs.subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(filter => (
          <button key={filter} className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border hover:bg-accent transition-colors">
            {filterLabel(filter)}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">{t('admin:orgs.table.organization')}</th>
              <th className="px-5 py-3 text-left">{t('admin:orgs.table.email')}</th>
              <th className="px-5 py-3 text-left">{t('admin:orgs.table.date')}</th>
              <th className="px-5 py-3 text-left">{t('admin:orgs.table.document')}</th>
              <th className="px-5 py-3 text-left">{t('common:status')}</th>
              <th className="px-5 py-3 text-right">{t('common:actions')}</th>
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
                      <span className="flex items-center gap-1 text-primary text-xs font-medium"><FileText className="size-3" /> {t('admin:orgs.uploaded')}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground text-xs"><Upload className="size-3" /> {t('admin:orgs.none')}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm ${statusColors[org.status]}`}>
                      <StatusIcon className="size-3" />
                      {t(`common:statusLabels.${org.status}` as const)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {org.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleApprove(org)} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">{t('admin:orgs.approve')}</button>
                        <button onClick={() => { setSelectedOrg(org); setShowRejectDialog(true); }} className="px-3 py-1.5 text-xs font-medium border border-destructive/30 text-destructive rounded-sm hover:bg-destructive/10 transition-colors">{t('admin:orgs.reject')}</button>
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
            <h3 className="text-lg font-semibold mb-2">{t('admin:orgs.rejectDialog.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <Trans
                i18nKey="admin:orgs.rejectDialog.body"
                values={{ name: selectedOrg.name }}
                components={[<strong key="0" />]}
              />
            </p>
            <textarea
              value={rejectionMessage}
              onChange={e => setRejectionMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-none"
              placeholder={t('admin:orgs.rejectDialog.placeholder')}
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => { setShowRejectDialog(false); setSelectedOrg(null); setRejectionMessage(""); }} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">{t('common:cancel')}</button>
              <button onClick={handleReject} className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/90 transition-colors">{t('admin:orgs.reject')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
