import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOrganizations } from "@/lib/queries/organizations";
import { useForumMessages, useCreateForumMessage } from "@/lib/queries/forum";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

export const Route = createFileRoute("/forum")({
  component: ForumPage,
});

function ForumPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: organizations = [] } = useOrganizations();
  const approvedOrgs = organizations.filter(o => o.status === 'approved');
  const defaultOrg = user?.organization_id ?? approvedOrgs[0]?.id ?? '';
  const [selectedOrg, setSelectedOrg] = useState(defaultOrg);
  const currentOrg = selectedOrg || defaultOrg;
  const { data: orgMessages = [] } = useForumMessages(currentOrg || undefined);
  const createMut = useCreateForumMessage();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  if (!user) { navigate({ to: "/" }); return null; }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    if (!currentOrg) { toast.error("Select an organization"); return; }
    try {
      await createMut.mutateAsync({
        title, message,
        author_id: user.id, author_role: user.role,
        organization_id: currentOrg,
      });
      setTitle(""); setMessage("");
      toast.success("Message posted!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Forum</h1>
        <p className="text-sm text-muted-foreground mt-1">Discuss with your community</p>
      </div>

      {user.role === 'volunteer' && (
        <div className="mb-6">
          <label className="text-sm font-medium mb-1 block">Select Organization</label>
          <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className="w-full max-w-xs px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            {approvedOrgs.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-card border border-border rounded-sm shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Send className="size-4" /> Post a Message</h2>
        <form onSubmit={handlePost} className="flex flex-col gap-3">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Message title" />
          <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none" placeholder="Write your message..." />
          <button type="submit" className="self-end px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">Post</button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {orgMessages.map(msg => (
          <div key={msg.id} className="bg-card border border-border rounded-sm shadow-sm p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold">{msg.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium">{msg.authorName}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-sm uppercase tracking-wider ${msg.authorRole === 'organization' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>{msg.authorRole}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
          </div>
        ))}
        {orgMessages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="size-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No messages yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
