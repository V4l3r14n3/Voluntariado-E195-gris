-- ============================================================================
-- Voluntariado E195 — Schema inicial
-- Adaptado para Supabase (auth.users provee password_hash, email_verified, etc.)
-- ============================================================================

-- 1. Extensiones (citext + pgcrypto ya disponibles en Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- 2. ENUMs
CREATE TYPE user_role AS ENUM ('admin', 'organization', 'volunteer');
CREATE TYPE organization_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE certificate_status AS ENUM ('pending', 'completed');

-- 3. organizations
CREATE TABLE organizations (
    id                  UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(150)          NOT NULL UNIQUE,
    email               CITEXT                NOT NULL UNIQUE,
    status              organization_status   NOT NULL DEFAULT 'pending',
    document_url        TEXT                  NULL,
    rejection_message   TEXT                  NULL,
    created_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_org_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_org_rejection
        CHECK (status = 'rejected' OR rejection_message IS NULL)
);

-- 4. users (PK = auth.users.id; sin password_hash, auth.users lo maneja)
CREATE TABLE users (
    id                UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name              VARCHAR(120)  NOT NULL,
    email             CITEXT        NOT NULL UNIQUE,
    role              user_role     NOT NULL DEFAULT 'volunteer',
    avatar_url        TEXT          NULL,
    organization_id   UUID          NULL REFERENCES organizations(id) ON DELETE SET NULL ON UPDATE CASCADE,
    security_question VARCHAR(255)  NULL,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 5. opportunities
CREATE TABLE opportunities (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200)  NOT NULL,
    description     TEXT          NOT NULL,
    event_date      DATE          NOT NULL,
    event_time      TIME          NOT NULL,
    city            VARCHAR(100)  NOT NULL,
    location        VARCHAR(255)  NOT NULL,
    organization_id UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    published       BOOLEAN       NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_opp_date_sanity CHECK (event_date >= DATE '2000-01-01')
);

-- 6. opportunity_applicants (M:N)
CREATE TABLE opportunity_applicants (
    opportunity_id UUID         NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    applied_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    status         VARCHAR(20)  NOT NULL DEFAULT 'applied',
    PRIMARY KEY (opportunity_id, user_id),
    CONSTRAINT chk_oa_status CHECK (status IN ('applied','accepted','rejected','completed'))
);

-- 7. forum_messages
CREATE TABLE forum_messages (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200)  NOT NULL,
    message         TEXT          NOT NULL,
    author_id       UUID          NULL REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    author_role     user_role     NOT NULL,
    organization_id UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 8. blog_posts
CREATE TABLE blog_posts (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200)  NOT NULL,
    content         TEXT          NOT NULL,
    image_url       TEXT          NULL,
    author_id       UUID          NULL REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    organization_id UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 9. certificates
CREATE TABLE certificates (
    id             UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id   UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    opportunity_id UUID                 NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE ON UPDATE CASCADE,
    status         certificate_status   NOT NULL DEFAULT 'pending',
    completed_date DATE                 NOT NULL,
    issued_at      TIMESTAMPTZ          NULL,
    created_at     TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cert_volunteer_opp UNIQUE (volunteer_id, opportunity_id),
    CONSTRAINT chk_cert_status_issued
        CHECK ((status = 'pending'   AND issued_at IS NULL)
            OR (status = 'completed' AND issued_at IS NOT NULL))
);

-- 10. Índices
CREATE INDEX idx_users_role                  ON users (role);
CREATE INDEX idx_users_organization_id       ON users (organization_id);
CREATE INDEX idx_organizations_status        ON organizations (status);
CREATE INDEX idx_opportunities_org           ON opportunities (organization_id);
CREATE INDEX idx_opportunities_pub_date      ON opportunities (published, event_date DESC);
CREATE INDEX idx_opportunities_city          ON opportunities (city);
CREATE INDEX idx_oa_user_id                  ON opportunity_applicants (user_id);
CREATE INDEX idx_forum_org_created           ON forum_messages (organization_id, created_at DESC);
CREATE INDEX idx_forum_author_id             ON forum_messages (author_id);
CREATE INDEX idx_blog_org_created            ON blog_posts (organization_id, created_at DESC);
CREATE INDEX idx_certificates_volunteer_id   ON certificates (volunteer_id);
CREATE INDEX idx_certificates_opportunity_id ON certificates (opportunity_id);

-- 11. Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at         BEFORE UPDATE ON users         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_blog_posts_updated_at    BEFORE UPDATE ON blog_posts    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 12. Helper: rol del usuario actual (SECURITY DEFINER para evitar recursión RLS)
CREATE OR REPLACE FUNCTION current_user_role() RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT organization_id FROM public.users WHERE id = auth.uid();
$$;
