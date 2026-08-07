-- ============================================================================
-- Storage buckets + policies
-- Convención de paths:
--   avatars/<user_id>/<filename>
--   blog-images/<org_id>/<filename>
--   org-documents/<org_id>/<filename>
--   certificates/<volunteer_id>/<filename>
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES
    ('avatars',       'avatars',       true),
    ('blog-images',   'blog-images',   true),
    ('org-documents', 'org-documents', false),
    ('certificates',  'certificates',  false)
ON CONFLICT (id) DO NOTHING;

-- ─── avatars (público lectura, solo dueño escribe) ────────────────────────
CREATE POLICY "avatars_read_public" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_update_own" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── blog-images (público lectura, org owner escribe) ─────────────────────
CREATE POLICY "blog_images_read_public" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'blog-images');

CREATE POLICY "blog_images_insert_org_owner" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'blog-images'
        AND current_org_id()::text = (storage.foldername(name))[1]
        AND current_user_role() = 'organization'
    );

CREATE POLICY "blog_images_update_org_owner" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'blog-images' AND current_org_id()::text = (storage.foldername(name))[1]);

CREATE POLICY "blog_images_delete_org_owner" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'blog-images' AND current_org_id()::text = (storage.foldername(name))[1]);

-- ─── org-documents (privado: org owner sube, admin + owner leen) ──────────
CREATE POLICY "org_docs_select_owner_or_admin" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'org-documents'
        AND (current_org_id()::text = (storage.foldername(name))[1] OR is_admin())
    );

CREATE POLICY "org_docs_insert_owner" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'org-documents'
        AND current_org_id()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "org_docs_delete_owner_or_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'org-documents'
        AND (current_org_id()::text = (storage.foldername(name))[1] OR is_admin())
    );

-- ─── certificates (privado: voluntario lee suyos, org owner sube) ─────────
CREATE POLICY "certificates_select_volunteer_owner" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'certificates'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR is_admin()
            OR current_user_role() = 'organization'
        )
    );

CREATE POLICY "certificates_insert_org_or_admin" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'certificates'
        AND (current_user_role() = 'organization' OR is_admin())
    );

CREATE POLICY "certificates_delete_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'certificates' AND is_admin());
