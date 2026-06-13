import React from 'react';
import { Phone, Heart, Users, Shield, Brain, Ambulance as AmbulanceIcon, MessageCircle } from 'lucide-react';

const helplines = [
  { name: 'National Emergency', number: '911', desc: 'Life-threatening emergencies — police, fire, medical', icon: AmbulanceIcon, color: '#ef4444', bg: '#fef2f2' },
  { name: 'Suicide & Crisis Lifeline', number: '988', desc: '24/7 free, confidential crisis support for distress', icon: Heart, color: '#ec4899', bg: '#fdf2f8' },
  { name: 'Poison Control', number: '1-800-222-1222', desc: 'Emergency poison exposure & chemical ingestion help', icon: Shield, color: '#f59e0b', bg: '#fffbeb' },
  { name: 'Disaster Distress Helpline', number: '1-800-985-5990', desc: '24/7 crisis counseling for natural disasters & tragedies', icon: Users, color: '#0891b2', bg: '#ecfeff' },
  { name: 'Mental Health Support', number: '1-800-662-4357', desc: 'SAMHSA helpline for mental health & substance abuse', icon: Brain, color: '#7c3aed', bg: '#ede9fe' },
  { name: 'Veterans Crisis Line', number: '1-800-273-8255', desc: '24/7 crisis support for veterans & their families', icon: MessageCircle, color: '#059669', bg: '#ecfdf5' },
];

export default function HealthSupport() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <Phone size={48} color="#0891b2" />
        <h2>Health Support & Helplines</h2>
        <p>Immediate assistance, crisis contacts, and mental health resources available 24/7</p>
      </div>

      <div className="disclaimer-banner">
        <span>
          <strong>🚨 If this is a life-threatening emergency, call 911 immediately.</strong> These helplines provide free, confidential support.
        </span>
      </div>

      <div className="info-card">
        <h3>
          <Phone size={20} color="#0891b2" /> Emergency Helplines
        </h3>
        {helplines.map((h, i) => (
          <div className="helpline-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="helpline-icon" style={{ background: h.bg, color: h.color }}>
              <h.icon size={20} />
            </div>
            <div className="helpline-info">
              <div className="helpline-name">{h.name}</div>
              <div className="helpline-desc">{h.desc}</div>
            </div>
            <div className="helpline-number">{h.number}</div>
          </div>
        ))}
      </div>

      <div className="info-card">
        <h3>
          <Heart size={20} color="#ec4899" /> Mental Health & Wellness Tips
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="caution-item success" style={{ borderLeftColor: '#059669', background: '#ecfdf5' }}>
            <div className="caution-title">🌿 Practice Mindfulness</div>
            <div className="caution-desc">Take 5-10 minutes daily for deep breathing or meditation. Apps like Calm and Headspace offer guided sessions.</div>
          </div>
          <div className="caution-item info" style={{ borderLeftColor: '#0891b2', background: '#ecfeff' }}>
            <div className="caution-title">💬 Reach Out</div>
            <div className="caution-desc">Talk to friends, family, or a therapist. You don't have to face challenges alone — support is always available.</div>
          </div>
          <div className="caution-item warning" style={{ borderLeftColor: '#f59e0b', background: '#fffbeb' }}>
            <div className="caution-title">🏃 Stay Active</div>
            <div className="caution-desc">Regular physical activity — even a 20-minute walk — can significantly improve mood and reduce anxiety.</div>
          </div>
          <div className="caution-item danger" style={{ borderLeftColor: '#ef4444', background: '#fef2f2' }}>
            <div className="caution-title">🆘 Know the Warning Signs</div>
            <div className="caution-desc">Persistent sadness, withdrawal from activities, changes in sleep/appetite, or thoughts of self-harm. Call 988 if you or someone you know needs help.</div>
          </div>
        </div>
      </div>

      <div className="disclaimer-footer">
        <strong>📋 Note:</strong> Helpline numbers are for the United States. For international support, please search for local crisis resources in your country.
      </div>
    </div>
  );
}
