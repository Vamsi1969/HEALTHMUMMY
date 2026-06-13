import React from 'react';
import { Activity, LogOut, User, Heart, Droplets, Building2, AlertTriangle, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'home', label: 'Symptom Check', icon: Stethoscope },
  { id: 'support', label: 'Health Support', icon: Heart },
  { id: 'blood', label: 'Blood Bank', icon: Droplets },
  { id: 'hospital', label: 'Near Hospital', icon: Building2 },
  { id: 'cautions', label: 'Cautions', icon: AlertTriangle },
];

export default function Header({ onNavigate, currentPage }) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate('login');
  };

  return (
    <header className="header">
      <div className="header-left" onClick={() => onNavigate && onNavigate('home')}>
        <Activity className="header-icon" />
        <h1>
          Health Assistant
          <span className="header-badge">AI-Powered</span>
        </h1>
      </div>

      <nav className="nav-tabs">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-tab ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate(item.id)}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="header-right">
        {isAuthenticated ? (
          <div className="header-user">
            <div className="avatar" title={user?.name}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
            <button className="icon-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="header-login-btn" onClick={() => onNavigate && onNavigate('login')}>
            <User size={15} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
