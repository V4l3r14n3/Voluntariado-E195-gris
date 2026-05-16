-- ============================================================================
-- Row Level Security policies
-- ============================================================================

ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates           ENABLE ROW LEVEL SECURITY;

-- ─── users ─────────────────────────────────────────────────────────────────
CREATE POLICY users_select_self_or_admin ON users
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR is_admin());

-- Auto-update: cliente NO puede cambiar role ni organization_id (trigger lo bloquea)
CREATE POLICY users_update_self ON users
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY users_admin_update_all ON users
    FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- INSERT lo hace trigger handle_new_user (SECURITY DEFINER), no via cliente

-- ─── organizations ─────────────────────────────────────────────────────────
CREATE POLICY orgs_select_approved_public ON organizations
    FOR SELECT TO anon, authenticated
    USING (status = 'approved');

CREATE POLICY orgs_select_admin_all ON organizations
    FOR SELECT TO authenticated
    USING (is_admin());

CREATE POLICY orgs_select_own ON organizations
    FOR SELECT TO authenticated
    USING (id = current_org_id());

CREATE POLICY orgs_insert_authenticated ON organizations
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Org owner puede editar su propio registro (excepto status — trigger lo bloquea)
CREATE POLICY orgs_update_own ON organizations
    FOR UPDATE TO authenticated
    USING (id = current_org_id())
    WITH CHECK (id = current_org_id());

CREATE POLICY orgs_update_admin ON organizations
    FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY orgs_delete_admin ON organizations
    FOR DELETE TO authenticated
    USING (is_admin());

-- ─── opportunities ─────────────────────────────────────────────────────────
CREATE POLICY opps_select_published ON opportunities
    FOR SELECT TO anon, authenticated
    USING (published = true);

CREATE POLICY opps_select_owner ON opportunities
    FOR SELECT TO authenticated
    USING (organization_id = current_org_id());

CREATE POLICY opps_select_admin ON opportunities
    FOR SELECT TO authenticated
    USING (is_admin());

CREATE POLICY opps_insert_owner ON opportunities
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = current_org_id() AND current_user_role() = 'organization');

CREATE POLICY opps_update_owner ON opportunities
    FOR UPDATE TO authenticated
    USING (organization_id = current_org_id())
    WITH CHECK (organization_id = current_org_id());

CREATE POLICY opps_delete_owner ON opportunities
    FOR DELETE TO authenticated
    USING (organization_id = current_org_id() OR is_admin());

-- ─── opportunity_applicants ───────────────────────────────────────────────
CREATE POLICY oa_select_self ON opportunity_applicants
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY oa_select_org_owner ON opportunity_applicants
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_id AND o.organization_id = current_org_id()
    ));

CREATE POLICY oa_select_admin ON opportunity_applicants
    FOR SELECT TO authenticated
    USING (is_admin());

CREATE POLICY oa_insert_self ON opportunity_applicants
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() AND current_user_role() = 'volunteer');

CREATE POLICY oa_update_org_owner ON opportunity_applicants
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_id AND o.organization_id = current_org_id()
    ));

CREATE POLICY oa_delete_self ON opportunity_applicants
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ─── forum_messages ────────────────────────────────────────────────────────
CREATE POLICY forum_select_authenticated ON forum_messages
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY forum_insert_self ON forum_messages
    FOR INSERT TO authenticated
    WITH CHECK (author_id = auth.uid());

CREATE POLICY forum_update_self_or_admin ON forum_messages
    FOR UPDATE TO authenticated
    USING (author_id = auth.uid() OR is_admin())
    WITH CHECK (author_id = auth.uid() OR is_admin());

CREATE POLICY forum_delete_self_or_admin ON forum_messages
    FOR DELETE TO authenticated
    USING (author_id = auth.uid() OR is_admin());

-- ─── blog_posts ────────────────────────────────────────────────────────────
CREATE POLICY blog_select_public ON blog_posts
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY blog_insert_org_owner ON blog_posts
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = current_org_id() AND current_user_role() = 'organization');

CREATE POLICY blog_update_org_owner ON blog_posts
    FOR UPDATE TO authenticated
    USING (organization_id = current_org_id())
    WITH CHECK (organization_id = current_org_id());

CREATE POLICY blog_delete_org_owner_or_admin ON blog_posts
    FOR DELETE TO authenticated
    USING (organization_id = current_org_id() OR is_admin());

-- ─── certificates ──────────────────────────────────────────────────────────
CREATE POLICY cert_select_owner ON certificates
    FOR SELECT TO authenticated
    USING (volunteer_id = auth.uid());

CREATE POLICY cert_select_org_owner ON certificates
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_id AND o.organization_id = current_org_id()
    ));

CREATE POLICY cert_select_admin ON certificates
    FOR SELECT TO authenticated
    USING (is_admin());

CREATE POLICY cert_insert_org_owner ON certificates
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_id AND o.organization_id = current_org_id()
    ));

CREATE POLICY cert_update_org_owner_or_admin ON certificates
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND o.organization_id = current_org_id())
        OR is_admin()
    );
