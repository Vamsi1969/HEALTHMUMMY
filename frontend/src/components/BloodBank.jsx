import React from 'react';
import { Droplets, Heart, Users, Shield, Info, Gift } from 'lucide-react';

const bloodTypes = [
  { type: 'O-', canDonateTo: 'All types (Universal Donor)', canReceiveFrom: 'O-', role: 'donor' },
  { type: 'O+', canDonateTo: 'O+, A+, B+, AB+', canReceiveFrom: 'O+, O-', role: 'donor' },
  { type: 'A-', canDonateTo: 'A-, A+, AB-, AB+', canReceiveFrom: 'A-, O-', role: 'recipient' },
  { type: 'A+', canDonateTo: 'A+, AB+', canReceiveFrom: 'A+, A-, O+, O-', role: 'recipient' },
  { type: 'B-', canDonateTo: 'B-, B+, AB-, AB+', canReceiveFrom: 'B-, O-', role: 'plasma' },
  { type: 'B+', canDonateTo: 'B+, AB+', canReceiveFrom: 'B+, B-, O+, O-', role: 'plasma' },
  { type: 'AB-', canDonateTo: 'AB-, AB+', canReceiveFrom: 'All negative types', role: 'plasma' },
  { type: 'AB+', canDonateTo: 'AB+ only', canReceiveFrom: 'All types (Universal Recipient)', role: 'recipient' },
];

const donateSteps = [
  { step: 1, title: 'Check Eligibility', desc: 'Age 17+, weigh 110+ lbs, feeling healthy on donation day.' },
  { step: 2, title: 'Find a Center', desc: 'Locate a blood bank or donation drive near you via the Red Cross or local hospital.' },
  { step: 3, title: 'Hydrate & Eat', desc: 'Drink plenty of water and eat a healthy meal before donating.' },
  { step: 4, title: 'Donate Blood', desc: 'The process takes about 45-60 minutes. You can donate whole blood every 56 days.' },
  { step: 5, title: 'Rest & Recover', desc: 'Relax for 15 minutes, enjoy snacks, and avoid heavy activity for the rest of the day.' },
];

export default function BloodBank() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <Droplets size={48} color="#ef4444" />
        <h2>Blood Bank Information</h2>
        <p>Blood type compatibility, donation guidelines, and urgent blood request resources</p>
      </div>

      {/* Blood Type Compatibility */}
      <div className="info-card">
        <h3>
          <Droplets size={20} color="#ef4444" /> Blood Type Compatibility Chart
        </h3>
        <div className="blood-grid">
          {bloodTypes.map((b, i) => (
            <div className={`blood-card ${b.role}`} key={i}>
              <div className="blood-type">{b.type}</div>
              <div className="blood-desc">{b.canDonateTo}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          <strong>O-</strong> is the universal donor (can give to all). <strong>AB+</strong> is the universal recipient (can receive from all).
        </p>
      </div>

      {/* Urgent Need Alert */}
      <div className="caution-item danger fade-in">
        <div className="caution-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={18} color="#ef4444" /> Urgent Blood Need
        </div>
        <div className="caution-desc">
          Every 2 seconds someone in the U.S. needs blood. Type <strong>O-negative</strong> and <strong>B-negative</strong> are often in critically short supply. 
          Contact your local Red Cross or hospital blood bank to schedule a donation or check for emergency blood drives.
        </div>
      </div>

      {/* Donation Steps */}
      <div className="info-card">
        <h3>
          <Gift size={20} color="#059669" /> How to Donate Blood
        </h3>
        {donateSteps.map((s) => (
          <div className="helpline-item" key={s.step}>
            <div className="helpline-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.step}</span>
            </div>
            <div className="helpline-info">
              <div className="helpline-name">{s.title}</div>
              <div className="helpline-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Blood Bank Tips */}
      <div className="info-card">
        <h3>
          <Shield size={20} color="#7c3aed" /> Important Notes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div className="helpline-item" style={{ background: '#ede9fe' }}>
            <Users size={20} color="#7c3aed" />
            <div className="helpline-info">
              <div className="helpline-name">One donation saves up to 3 lives</div>
              <div className="helpline-desc">A single blood donation can help multiple patients in need.</div>
            </div>
          </div>
          <div className="helpline-item" style={{ background: '#fffbeb' }}>
            <Info size={20} color="#d97706" />
            <div className="helpline-info">
              <div className="helpline-name">Types needed most: O-, O+, B-</div>
              <div className="helpline-desc">These blood types are in constant demand for emergencies and surgeries.</div>
            </div>
          </div>
          <div className="helpline-item" style={{ background: '#ecfeff' }}>
            <Heart size={20} color="#0891b2" />
            <div className="helpline-info">
              <div className="helpline-name">Platelet donation</div>
              <div className="helpline-desc">Platelets help cancer patients and have a shelf life of only 5 days.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="disclaimer-footer">
        <strong>🩸 Find a blood drive near you:</strong> Visit redcrossblood.org or call 1-800-RED-CROSS (1-800-733-2767).
      </div>
    </div>
  );
}
