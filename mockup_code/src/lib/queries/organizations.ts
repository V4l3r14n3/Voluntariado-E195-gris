import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Tables, Insertable, Updatable } from '../supabase';
import type { Organization } from '../mock-data';

export type OrganizationRow = Tables<'organizations'>;

export function rowToOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    documentUrl: row.document_url ?? undefined,
    rejectionMessage: row.rejection_message ?? undefined,
    createdAt: row.created_at,
  };
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToOrganization);
    },
  });
}

export function useOrganization(id: string | null | undefined) {
  return useQuery({
    queryKey: ['organization', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToOrganization(data) : null;
    },
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Insertable<'organizations'>) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      return rowToOrganization(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Updatable<'organizations'> }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return rowToOrganization(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
}
