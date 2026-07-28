import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login/', { replace: true });
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="admin-header-brand" href="/">
          <img src="/divine-ink-logo.png" alt="" />
          <span>Divine Ink Admin</span>
        </a>
        <div className="admin-account">
          <span>{user?.email}</span>
          <button onClick={handleLogout} type="button">Logout</button>
        </div>
      </header>

      <div className="admin-body">
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink end to="/admin/">Dashboard</NavLink>
          <NavLink to="/admin/gallery/">Gallery</NavLink>
          <a href="/" target="_blank" rel="noreferrer">View public website</a>
        </nav>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
