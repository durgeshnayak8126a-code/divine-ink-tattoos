import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedAdminRoute() {
  const { isAdmin, isConfigured, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="admin-status" aria-live="polite">
        Verifying admin session…
      </main>
    );
  }

  if (!isConfigured || !user || !isAdmin) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to="/admin/login/"
      />
    );
  }

  return <Outlet />;
}
