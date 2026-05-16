import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Insertable, Updatable } from '../supabase';
import type { Opportunity } from '../mock-data';

type Row = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  city: string;
  location: string;
  organization_id: string;
  published: boolean;
  organization: { name: string } | null;
  applicants: { user_id: string }[];
};

function rowToOpportunity(row: Row): Opportunity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.event_date,
    time: row.event_time,
    city: row.city,
    location: row.location,
    organizationId: row.organization_id,
    organizationName: row.organization?.name ?? '',
    published: row.published,
    applicants: (row.applicants ?? []).map((a) => a.user_id),
  };
}

const SELECT = '*, organization:organizations(name), applicants:opportunity_applicants(user_id)';

export function useOpportunities(opts: { onlyPublished?: boolean; organizationId?: string } = {}) {
  return useQuery({
    queryKey: ['opportunities', opts],
    queryFn: async () => {
      let q = supabase.from('opportunities').select(SELECT).order('event_date', { ascending: true });
      if (opts.onlyPublished) q = q.eq('published', true);
      if (opts.organizationId) q = q.eq('organization_id', opts.organizationId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => rowToOpportunity(r as unknown as Row));
    },
  });
}

export function useOpportunity(id: string | null | undefined) {
  return useQuery({
    queryKey: ['opportunity', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(SELECT)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToOpportunity(data as unknown as Row) : null;
    },
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Insertable<'opportunities'>) => {
      const { data, error } = await supabase.from('opportunities').insert(payload).select(SELECT).single();
      if (error) throw error;
      return rowToOpportunity(data as unknown as Row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Updatable<'opportunities'> }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select(SELECT)
        .single();
      if (error) throw error;
      return rowToOpportunity(data as unknown as Row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useDeleteOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}

export function useApplyToOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ opportunityId, userId }: { opportunityId: string; userId: string }) => {
      const { error } = await supabase
        .from('opportunity_applicants')
        .insert({ opportunity_id: opportunityId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  });
}
