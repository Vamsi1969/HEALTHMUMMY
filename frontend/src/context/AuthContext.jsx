import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredUser, getStoredToken, loginUser, registerUser, logoutUser, getProfile } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  // Verify stored token is still valid on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        logoutUser();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (email, name, password) => {
    const data = await registerUser({ email, name, password });
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
