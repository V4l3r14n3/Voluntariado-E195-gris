import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Certificate } from '../mock-data';

type Row = {
  id: string;
  volunteer_id: string;
  opportunity_id: string;
  status: 'pending' | 'completed';
  completed_date: string;
  issued_at: string | null;
  volunteer: { name: string } | null;
  opportunity: { title: string } | null;
};

function rowToCertificate(row: Row): Certificate {
  return {
    id: row.id,
    volunteerName: row.volunteer?.name ?? 'Unknown',
    activityTitle: row.opportunity?.title ?? 'Unknown activity',
    completedDate: row.completed_date,
    status: row.status,
  };
}

const SELECT = '*, volunteer:users(name), opportunity:opportunities(title)';

export function useCertificates(volunteerId?: string) {
  return useQuery({
    queryKey: ['certificates', volunteerId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('certificates').select(SELECT).order('completed_date', { ascending: false });
      if (volunteerId) q = q.eq('volunteer_id', volunteerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => rowToCertificate(r as unknown as Row));
    },
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { volunteer_id: string; opportunity_id: string; completed_date: string; status?: 'pending' | 'completed'; issued_at?: string | null }) => {
      const { data, error } = await supabase.from('certificates').insert(payload).select(SELECT).single();
      if (error) throw error;
      return rowToCertificate(data as unknown as Row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certificates'] }),
  });
}
