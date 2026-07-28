import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout.jsx';
import { AuthProvider } from './AuthContext.jsx';
import DashboardPage from './DashboardPage.jsx';
import LoginPage from './LoginPage.jsx';
import ProtectedAdminRoute from './ProtectedAdminRoute.jsx';
import './admin.css';

const GalleryPage = lazy(() => import('./gallery/GalleryPage.jsx'));

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login/" element={<LoginPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route
              path="gallery/"
              element={
                <Suspense fallback={<p className="admin-intro">Loading gallery tools…</p>}>
                  <GalleryPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate replace to="/admin/" />} />
      </Routes>
    </AuthProvider>
  );
}
