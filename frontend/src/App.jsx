import React, { useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import SymptomInput from './components/SymptomInput';
import ResultsCard from './components/ResultsCard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HealthSupport from './components/HealthSupport';
import BloodBank from './components/BloodBank';
import NearHospital from './components/NearHospital';
import Cautions from './components/Cautions';
import { analyzeSymptoms } from './api/client';

function HealthAssistant() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState('home');
  const { isAuthenticated, user } = useAuth();

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await analyzeSymptoms(data);
      setResults(response);
    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (target) => {
    setPage(target);
    setResults(null);
    setError(null);
  };

  // Auth pages
  if (page === 'login') {
    return (
      <div className="app">
        <Header onNavigate={handleNavigate} currentPage={page} />
        <LoginPage onSwitchToRegister={() => setPage('register')} onSuccess={() => setPage('home')} />
      </div>
    );
  }

  if (page === 'register') {
    return (
      <div className="app">
        <Header onNavigate={handleNavigate} currentPage={page} />
        <RegisterPage onSwitchToLogin={() => setPage('login')} onSuccess={() => setPage('home')} />
      </div>
    );
  }

  // Feature pages
  if (page === 'support') {
    return (
      <div className="app">
        <Header onNavigate={handleNavigate} currentPage={page} />
        <main className="main-content"><HealthSupport /></main>
        <footer className="footer">Health Assistant v1.0.0 — Health support & emergency resources.</footer>
      </div>
    );
  }

  if (page === 'blood') {
    return (
      <div className="app">
        <Header onNavigate={handleNavigate} currentPage={page} />
        <main className="main-content"><BloodBank /></main>
        <footer className="footer">Health Assistant v1.0.0 — Blood bank & donation information.</footer>
      </div>
    );
  }

  if (page === 'hospital') {
    return (
      <div className="app">
        <Header onNavigate={handleNavigate} currentPage={page} />
        <main className="main-content"><NearHospital /></main>
        <footer className="footer">Health Assistant v1.0.0 — Hospital guide & first aid resources.</footer>
      </div>
    );
  }

  if (page === 'cautions') {
    return (
      <div className="app">
        <Header onNavigate={handleNavigate} currentPage={page} />
        <main className="main-content"><Cautions /></main>
        <footer className="footer">Health Assistant v1.0.0 — Health cautions & medication safety.</footer>
      </div>
    );
  }

  // Home page - Symptom Checker
  return (
    <div className="app">
      <Header onNavigate={handleNavigate} currentPage={page} />
      <main className="main-content">
        <div className="hero">
          <Stethoscope className="hero-icon" />
          <h2>How are you feeling today?</h2>
          <p>Describe your symptoms and get AI-powered insights, medication suggestions, and care recommendations.</p>
        </div>

        <div className="dashboard-grid">
          {[
            { id: 'support', icon: '❤️', title: 'Health Support', desc: 'Helplines, crisis contacts & mental health resources', color: '#0891b2' },
            { id: 'blood', icon: '🩸', title: 'Blood Bank', desc: 'Type compatibility, donation guide & urgent needs', color: '#ef4444' },
            { id: 'hospital', icon: '🏥', title: 'Near Hospital', desc: 'First aid, ER guide & finding the right care', color: '#059669' },
            { id: 'cautions', icon: '⚠️', title: 'Cautions', desc: 'Drug interactions, safety alerts & seasonal tips', color: '#f59e0b' },
          ].map((card) => (
            <div className="dash-card" key={card.id} onClick={() => handleNavigate(card.id)}>
              <div className="dash-icon" style={{ background: `${card.color}15`, color: card.color }}>
                <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>

        <SymptomInput onSubmit={handleSubmit} loading={loading} />

        {isAuthenticated && (
          <div style={{ marginBottom: '0.65rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Signed in as {user?.name} — your history is saved across sessions
          </div>
        )}

        {error && (
          <div className="disclaimer-banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
            <span>Error: {error}</span>
          </div>
        )}

        {results && <ResultsCard results={results} />}

        {!results && !loading && (
          <div className="empty-state">
            <Stethoscope />
            <h3>Describe your symptoms above</h3>
            <p>Get AI-powered analysis and recommendations for your health concerns.</p>
          </div>
        )}
      </main>
      <footer className="footer">
        Health Assistant v1.0.0 — AI-powered health information tool. Not a substitute for medical advice.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HealthAssistant />
    </AuthProvider>
  );
}
