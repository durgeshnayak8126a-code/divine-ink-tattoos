import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminMeta from './AdminMeta.jsx';
import { useAuth } from './AuthContext.jsx';

function getLoginError(error) {
  if (
    error?.code === 'auth/invalid-credential' ||
    error?.code === 'auth/user-not-found' ||
    error?.code === 'auth/wrong-password'
  ) {
    return 'Email or password is incorrect.';
  }
  if (error?.code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait before trying again.';
  }
  if (error?.code === 'auth/not-admin') {
    return 'This account does not have administrator access.';
  }
  return error?.message || 'Unable to sign in. Please try again.';
}

export default function LoginPage() {
  const { isAdmin, isConfigured, loading, login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError('');
  }, [email, password]);

  if (!loading && user && isAdmin) {
    return <Navigate replace to="/admin/" />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/admin/', { replace: true });
    } catch (loginError) {
      setError(getLoginError(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <AdminMeta title="Admin Login | Divine Ink Tattoos" />
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <a className="admin-brand" href="/" aria-label="Return to Divine Ink website">
          <img
            src="/divine-ink-logo.png"
            alt="Divine Ink Tattoos & Piercing Studio"
          />
        </a>
        <p className="admin-kicker">Secure administration</p>
        <h1 id="admin-login-title">Admin Login</h1>
        <p>Sign in with the administrator account configured in Firebase.</p>

        {!isConfigured && (
          <div className="admin-notice" role="status">
            Firebase is not configured. Copy <code>.env.example</code> to{' '}
            <code>.env.local</code> and add your project credentials.
          </div>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            autoComplete="username"
            disabled={!isConfigured || submitting}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            autoComplete="current-password"
            disabled={!isConfigured || submitting}
            minLength="6"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button disabled={!isConfigured || submitting} type="submit">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a className="admin-back-link" href="/">Return to public website</a>
      </section>
    </main>
  );
}
