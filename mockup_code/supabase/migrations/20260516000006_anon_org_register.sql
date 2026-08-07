-- ============================================================================
-- Permitir registro de organizaciones desde anon (sin sesión todavía).
-- Solo INSERT con status='pending'. Approval requires admin (cubierto por policy existente).
-- ============================================================================

CREATE POLICY orgs_insert_anon_pending ON organizations
    FOR INSERT TO anon
    WITH CHECK (status = 'pending');
