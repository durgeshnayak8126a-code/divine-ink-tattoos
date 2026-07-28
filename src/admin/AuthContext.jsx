import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  firebaseAuth,
  isFirebaseConfigured,
} from '../firebase/config.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(firebaseAuth, async (currentUser) => {
      try {
        const token = currentUser
          ? await currentUser.getIdTokenResult()
          : null;
        setUser(currentUser);
        setIsAdmin(token?.claims?.admin === true);
      } catch {
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      isConfigured: isFirebaseConfigured,
      login: async (email, password) => {
        if (!firebaseAuth) {
          throw new Error('Firebase environment variables are not configured.');
        }
        const credential = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );
        const token = await credential.user.getIdTokenResult(true);

        if (token.claims.admin !== true) {
          await signOut(firebaseAuth);
          const error = new Error('This account does not have admin access.');
          error.code = 'auth/not-admin';
          throw error;
        }

        setUser(credential.user);
        setIsAdmin(true);
        return credential;
      },
      logout: () => {
        if (!firebaseAuth) return Promise.resolve();
        return signOut(firebaseAuth);
      },
    }),
    [isAdmin, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
