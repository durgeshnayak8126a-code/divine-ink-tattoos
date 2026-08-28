import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout.jsx';
import { AuthProvider } from './AuthContext.jsx';
import DashboardPage from './DashboardPage.jsx';
import LoginPage from './LoginPage.jsx';
import ProtectedAdminRoute from './ProtectedAdminRoute.jsx';
import './admin.css';

const GalleryPage = lazy(() => import('./gallery/GalleryPage.jsx'));
const ArtistsPage = lazy(() => import('./artists/ArtistsPage.jsx'));
const PiercingPage = lazy(() => import('./piercing/PiercingPage.jsx'));
const CollectionCmsPage = lazy(() => import('./cms/CollectionCmsPage.jsx'));
const SettingsCmsPage = lazy(() => import('./cms/SettingsCmsPage.jsx'));

function LazyPage({ children }) {
  return (
    <Suspense fallback={<p className="admin-intro">Loading CMS…</p>}>
      {children}
    </Suspense>
  );
}

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
                <LazyPage>
                  <GalleryPage />
                </LazyPage>
              }
            />
            <Route
              path="artists/"
              element={
                <LazyPage>
                  <ArtistsPage />
                </LazyPage>
              }
            />
            <Route
              path="piercing/"
              element={
                <LazyPage>
                  <PiercingPage />
                </LazyPage>
              }
            />
            {['services', 'reviews', 'faqs', 'offers'].map((moduleName) => (
              <Route
                key={moduleName}
                path={`${moduleName}/`}
                element={
                  <LazyPage>
                    <CollectionModule moduleName={moduleName} />
                  </LazyPage>
                }
              />
            ))}
            {['homepage', 'contact', 'seo'].map((moduleName) => (
              <Route
                key={moduleName}
                path={`${moduleName}/`}
                element={
                  <LazyPage>
                    <SettingsModule moduleName={moduleName} />
                  </LazyPage>
                }
              />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<Navigate replace to="/admin/" />} />
      </Routes>
    </AuthProvider>
  );
}

function CollectionModule({ moduleName }) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    import('./cms/cmsConfig.js').then(({ CMS_MODULES }) => setConfig(CMS_MODULES[moduleName]));
  }, [moduleName]);
  return config ? <CollectionCmsPage config={config} /> : null;
}

function SettingsModule({ moduleName }) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    import('./cms/cmsConfig.js').then(({ SETTINGS_MODULES }) => setConfig(SETTINGS_MODULES[moduleName]));
  }, [moduleName]);
  return config ? <SettingsCmsPage config={config} /> : null;
}
