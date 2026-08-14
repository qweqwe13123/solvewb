REVOKE ALL ON FUNCTION public.claim_admin_role() FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;