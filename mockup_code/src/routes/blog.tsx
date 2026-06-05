import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from "@/lib/queries/blog";
import type { BlogPost } from "@/lib/mock-data";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen, Image } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['blog', 'common']);
  const { data: posts = [] } = useBlogPosts();
  const createMut = useCreateBlogPost();
  const updateMut = useUpdateBlogPost();
  const deleteMut = useDeleteBlogPost();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/" });
  }, [authReady, user, navigate]);

  if (!authReady) return <PageLoader />;
  if (!user) return null;

  const isOrg = user.role === 'organization';
  const orgId = user.organization_id;

  const resetForm = () => { setTitle(""); setContent(""); setEditing(null); setShowForm(false); };

  const openEdit = (post: BlogPost) => {
    setEditing(post); setTitle(post.title); setContent(post.content); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error(t('blog:toasts.required')); return; }
    if (!orgId) { toast.error(t('blog:toasts.noOrg')); return; }

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, updates: { title, content } });
        toast.success(t('blog:toasts.updated'));
      } else {
        await createMut.mutateAsync({ title, content, author_id: user.id, organization_id: orgId });
        toast.success(t('blog:toasts.published'));
      }
      resetForm();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success(t('blog:toasts.deleted'));
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteConfirm(null);
  };

  if (selectedPost) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <button onClick={() => setSelectedPost(null)} className="text-sm text-primary font-medium hover:underline mb-6 block">{t('blog:back')}</button>
        <article>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">{selectedPost.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <span>{selectedPost.authorName}</span>
            <span>•</span>
            <span>{selectedPost.organizationName}</span>
            <span>•</span>
            <span className="tabular-nums">{selectedPost.createdAt}</span>
          </div>
          {selectedPost.content.split('\n\n').map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground mb-4">{p}</p>
          ))}
        </article>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('blog:title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isOrg ? t('blog:subtitleOrg') : t('blog:subtitleVol')}</p>
        </div>
        {isOrg && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">
            <Plus className="size-4" /> {t('blog:newPost')}
          </button>
        )}
      </div>

      {showForm && isOrg && (
        <div className="bg-card border border-border rounded-sm shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">{editing ? t('blog:editPost') : t('blog:createPost')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('blog:title_')}</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('blog:content')}</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[150px] resize-none" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="size-4" />
              <span>{t('blog:imageNote')}</span>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">{editing ? t('common:update') : t('common:publish')}</button>
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">{t('common:cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-card border border-border rounded-sm shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedPost(post)}>
                <h3 className="text-base font-semibold hover:text-primary transition-colors">{post.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{post.organizationName}</span>
                  <span>•</span>
                  <span className="tabular-nums">{post.createdAt}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.content}</p>
              </div>
              {isOrg && (
                <div className="flex gap-1 ml-4 shrink-0">
                  <button onClick={() => openEdit(post)} className="p-1.5 hover:bg-accent rounded-sm transition-colors"><Pencil className="size-4 text-muted-foreground" /></button>
                  <button onClick={() => setDeleteConfirm(post.id)} className="p-1.5 hover:bg-destructive/10 rounded-sm transition-colors"><Trash2 className="size-4 text-destructive" /></button>
                </div>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="size-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('blog:empty')}</p>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-sm shadow-lg max-w-sm w-full p-6 text-center">
            <Trash2 className="size-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">{t('blog:delete.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('common:irreversible')}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent">{t('common:cancel')}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/90">{t('common:delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
