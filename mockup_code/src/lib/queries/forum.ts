import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { ForumMessage, UserRole } from '../mock-data';

type Row = {
  id: string;
  title: string;
  message: string;
  author_id: string | null;
  author_role: UserRole;
  organization_id: string;
  created_at: string;
  author: { name: string } | null;
};

function rowToForumMessage(row: Row): ForumMessage {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    authorName: row.author?.name ?? 'Unknown',
    authorRole: row.author_role,
    organizationId: row.organization_id,
    createdAt: row.created_at,
  };
}

const SELECT = '*, author:users(name)';

export function useForumMessages(organizationId?: string) {
  return useQuery({
    queryKey: ['forum_messages', organizationId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('forum_messages').select(SELECT).order('created_at', { ascending: false });
      if (organizationId) q = q.eq('organization_id', organizationId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => rowToForumMessage(r as unknown as Row));
    },
  });
}

export function useCreateForumMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; message: string; author_id: string; author_role: UserRole; organization_id: string }) => {
      const { data, error } = await supabase.from('forum_messages').insert(payload).select(SELECT).single();
      if (error) throw error;
      return rowToForumMessage(data as unknown as Row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum_messages'] }),
  });
}
