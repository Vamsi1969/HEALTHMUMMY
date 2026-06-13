import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onSwitchToRegister, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn size={32} />
          <h2>Welcome Back</h2>
          <p>Sign in to your Health Assistant account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="login-email">
              <Mail size={16} />
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">
              <Lock size={16} />
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="link-btn">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
