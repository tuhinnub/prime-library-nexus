REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.admin_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_metrics() TO authenticated;