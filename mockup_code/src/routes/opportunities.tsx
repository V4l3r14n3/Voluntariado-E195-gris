import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { useOpportunities, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from "@/lib/queries/opportunities";
import type { Opportunity } from "@/lib/mock-data";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/opportunities")({
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organization_id ?? undefined;
  const { data: opportunities = [] } = useOpportunities({ organizationId: orgId });
  const createMut = useCreateOpportunity();
  const updateMut = useUpdateOpportunity();
  const deleteMut = useDeleteOpportunity();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (authReady && (!user || user.role !== 'organization')) navigate({ to: "/" });
  }, [authReady, user, navigate]);

  if (!authReady) return <PageLoader />;
  if (!user || user.role !== 'organization') return null;

  const resetForm = () => {
    setTitle(""); setDescription(""); setDate(""); setTime(""); setCity(""); setLocation("");
    setEditing(null); setShowForm(false);
  };

  const openEdit = (opp: Opportunity) => {
    setEditing(opp); setTitle(opp.title); setDescription(opp.description); setDate(opp.date);
    setTime(opp.time); setCity(opp.city); setLocation(opp.location); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    if (!title || !description || !date || !time || !city || !location) { toast.error("All fields are required"); return; }
    if (!orgId) { toast.error("No organization linked to your user"); return; }

    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          updates: { title, description, event_date: date, event_time: time, city, location, published: publish },
        });
        toast.success("Opportunity updated!");
      } else {
        await createMut.mutateAsync({
          title, description, event_date: date, event_time: time, city, location,
          organization_id: orgId, published: publish,
        });
        toast.success(publish ? "Opportunity published!" : "Opportunity saved as draft!");
      }
      resetForm();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Opportunity deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Volunteer Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage volunteer opportunities</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">
          <Plus className="size-4" /> New Opportunity
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-sm shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">{editing ? 'Edit Opportunity' : 'Create Opportunity'}</h2>
          <form className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Beach Cleanup Drive" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none" placeholder="Describe the opportunity..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Portland" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Forest Park" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={e => handleSubmit(e as any, true)} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">
                {editing ? 'Update & Publish' : 'Publish'}
              </button>
              <button type="button" onClick={e => handleSubmit(e as any, false)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">
                Save as Draft
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Date / Time</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Applicants</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {opportunities.map(opp => (
              <tr key={opp.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3.5 font-medium">{opp.title}</td>
                <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{opp.date} {opp.time}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{opp.city}, {opp.location}</td>
                <td className="px-5 py-3.5 tabular-nums">{opp.applicants.length}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm ${opp.published ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {opp.published ? <><Eye className="size-3" /> Published</> : <><EyeOff className="size-3" /> Draft</>}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(opp)} className="p-1.5 hover:bg-accent rounded-sm transition-colors" title="Edit"><Pencil className="size-4 text-muted-foreground" /></button>
                    <button onClick={() => setDeleteConfirm(opp.id)} className="p-1.5 hover:bg-destructive/10 rounded-sm transition-colors" title="Delete"><Trash2 className="size-4 text-destructive" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-sm shadow-lg max-w-sm w-full p-6 text-center">
            <Trash2 className="size-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Delete Opportunity?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
