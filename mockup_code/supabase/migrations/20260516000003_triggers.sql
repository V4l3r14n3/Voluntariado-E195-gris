-- ============================================================================
-- Trigger sincronizar auth.users → public.users
-- Cuando se crea row en auth.users (signUp), insertar perfil en public.users
-- copiando metadata: name, role, organization_id, security_question
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_name              TEXT;
    v_role              user_role;
    v_organization_id   UUID;
    v_security_question TEXT;
BEGIN
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    v_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'volunteer'::user_role
    );
    v_organization_id := NULLIF(NEW.raw_user_meta_data->>'organization_id', '')::UUID;
    v_security_question := NEW.raw_user_meta_data->>'security_question';

    INSERT INTO public.users (id, name, email, role, organization_id, security_question)
    VALUES (NEW.id, v_name, NEW.email, v_role, v_organization_id, v_security_question)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mantener email sincronizado si cambia en auth.users
CREATE OR REPLACE FUNCTION handle_auth_email_update() RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE public.users SET email = NEW.email WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_auth_email_update();

-- ============================================================================
-- Bloquear escalamiento de privilegios:
--   - users: no puede cambiar role ni organization_id salvo admin
--   - organizations: no puede cambiar status salvo admin
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_user_privilege_escalation() RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF is_admin() THEN
        RETURN NEW;
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'No autorizado: no puede modificar role';
    END IF;
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
        RAISE EXCEPTION 'No autorizado: no puede modificar organization_id';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_prevent_escalation ON public.users;
CREATE TRIGGER trg_users_prevent_escalation
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION prevent_user_privilege_escalation();

CREATE OR REPLACE FUNCTION prevent_org_status_change() RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF is_admin() THEN
        RETURN NEW;
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'No autorizado: no puede cambiar estado de organización';
    END IF;
    IF NEW.rejection_message IS DISTINCT FROM OLD.rejection_message THEN
        RAISE EXCEPTION 'No autorizado: no puede modificar rejection_message';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orgs_prevent_status_change ON public.organizations;
CREATE TRIGGER trg_orgs_prevent_status_change
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION prevent_org_status_change();
