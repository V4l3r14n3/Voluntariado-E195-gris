import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { BlogPost } from '../mock-data';

type Row = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string | null;
  organization_id: string;
  created_at: string;
  organization: { name: string } | null;
  author: { name: string } | null;
};

function rowToBlogPost(row: Row): BlogPost {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    imageUrl: row.image_url ?? undefined,
    authorName: row.author?.name ?? row.organization?.name ?? 'Unknown',
    organizationId: row.organization_id,
    organizationName: row.organization?.name ?? '',
    createdAt: row.created_at,
  };
}

const SELECT = '*, organization:organizations(name), author:users(name)';

export function useBlogPosts(organizationId?: string) {
  return useQuery({
    queryKey: ['blog_posts', organizationId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('blog_posts').select(SELECT).order('created_at', { ascending: false });
      if (organizationId) q = q.eq('organization_id', organizationId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => rowToBlogPost(r as unknown as Row));
    },
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; content: string; image_url?: string | null; author_id: string; organization_id: string }) => {
      const { data, error } = await supabase.from('blog_posts').insert(payload).select(SELECT).single();
      if (error) throw error;
      return rowToBlogPost(data as unknown as Row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog_posts'] }),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { title?: string; content?: string; image_url?: string | null } }) => {
      const { data, error } = await supabase.from('blog_posts').update(updates).eq('id', id).select(SELECT).single();
      if (error) throw error;
      return rowToBlogPost(data as unknown as Row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog_posts'] }),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blog_posts'] }),
  });
}
