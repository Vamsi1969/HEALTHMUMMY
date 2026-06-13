import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onSwitchToLogin, onSuccess }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) return;
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), name.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus size={32} />
          <h2>Create Account</h2>
          <p>Join Health Assistant for personalized insights</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="register-name">
              <User size={16} />
              Full Name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              autoFocus
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">
              <Mail size={16} />
              Email
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">
              <Lock size={16} />
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm">
              <Lock size={16} />
              Confirm Password
            </label>
            <input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="link-btn">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
