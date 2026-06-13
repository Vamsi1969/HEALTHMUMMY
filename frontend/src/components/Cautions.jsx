import React from 'react';
import { AlertTriangle, Shield, Thermometer, Pill, Brain, Heart, Sun, Snowflake, Leaf } from 'lucide-react';

const drugWarnings = [
  { med: 'Ibuprofen (Advil, Motrin)', warning: 'Avoid with stomach ulcers, kidney disease, or if you are allergic to NSAIDs. Do not combine with blood thinners.', severity: 'high' },
  { med: 'Acetaminophen (Tylenol)', warning: 'Maximum 3000mg/day (some sources say 4000mg). Overdose causes severe liver damage. Avoid alcohol while taking.', severity: 'high' },
  { med: 'Antihistamines (Benadryl)', warning: 'Causes drowsiness — do not drive. Avoid with glaucoma, enlarged prostate, or breathing problems.', severity: 'medium' },
  { med: 'Antibiotics', warning: 'Always complete the full course even if you feel better. Never share antibiotics. Avoid alcohol with some types.', severity: 'high' },
  { med: 'Blood Thinners (Warfarin)', warning: 'Monitor vitamin K intake. Avoid NSAIDs. Regular blood tests required to check INR levels.', severity: 'high' },
  { med: 'Antidepressants (SSRIs)', warning: 'May take 2-4 weeks to show effect. Do not stop abruptly — taper off under medical supervision.', severity: 'medium' },
];

const seasonalTips = [
  { icon: Thermometer, season: 'Summer Heat Safety', tips: ['Stay hydrated — drink water every 15-20 minutes', 'Avoid outdoor activity between 10 AM - 4 PM', 'Wear light, loose clothing and apply SPF 30+ sunscreen', 'Never leave children or pets in parked cars'], color: '#f59e0b', bg: '#fffbeb' },
  { icon: Snowflake, season: 'Winter Health Precautions', tips: ['Layer clothing and cover exposed skin to prevent frostbite', 'Use caution on icy surfaces to avoid falls/fractures', 'Get flu shot — influenza peaks December-February', 'Watch for signs of hypothermia: shivering, confusion, drowsiness'], color: '#0891b2', bg: '#ecfeff' },
  { icon: Leaf, season: 'Allergy Season (Spring/Fall)', tips: ['Check daily pollen counts before going outside', 'Shower and change clothes after being outdoors', 'Keep windows closed during high-pollen hours (5-10 AM)', 'OTC antihistamines can help — start before season begins'], color: '#059669', bg: '#ecfdf5' },
];

const safetyAlerts = [
  { icon: Brain, title: '🧘 Stay Mentally Healthy', desc: 'Take breaks from news/social media. Practice deep breathing when stressed. Reach out to friends or a therapist if you feel overwhelmed.', type: 'info' },
  { icon: Shield, title: '🛡️ Medication Safety', desc: 'Keep all medications in original labeled containers. Check expiration dates monthly. Use a pill organizer to avoid missed or double doses.', type: 'warning' },
  { icon: Heart, title: '❤️ Listen to Your Body', desc: 'Unexplained weight loss, persistent fatigue, changes in bowel/bladder habits, or lumps — see a doctor promptly. Early detection saves lives.', type: 'danger' },
  { icon: Pill, title: '💊 Drug Interactions', desc: 'Always tell your doctor about ALL medications and supplements you take — including herbal remedies. Some combinations can be dangerous or reduce effectiveness.', type: 'warning' },
];

export default function Cautions() {
  return (
    <div className="feature-page">
      <div className="feature-header">
        <AlertTriangle size={48} color="#f59e0b" />
        <h2>Health Cautions & Safety</h2>
        <p>Drug interaction warnings, seasonal health alerts, medication safety tips, and important precautions</p>
      </div>

      <div className="disclaimer-banner">
        <span>
          <strong>⚠️ Always consult your doctor or pharmacist before starting, stopping, or changing any medication.</strong> This information is a general guide, not medical advice.
        </span>
      </div>

      {/* Drug Warnings */}
      <div className="info-card">
        <h3>
          <Pill size={20} color="#ef4444" /> Common Medication Warnings
        </h3>
        {drugWarnings.map((d, i) => (
          <div className={`caution-item ${d.severity === 'high' ? 'danger' : 'warning'}`} key={i}>
            <div className="caution-title">{d.med}</div>
            <div className="caution-desc">{d.warning}</div>
          </div>
        ))}
      </div>

      {/* Seasonal Tips */}
      <div className="info-card">
        <h3>
          <Sun size={20} color="#f59e0b" /> Seasonal Health Precautions
        </h3>
        {seasonalTips.map((s, i) => (
          <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: s.bg, border: `1px solid ${s.color}20` }} key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: s.color }}>
              <s.icon size={20} /> {s.season}
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {s.tips.map((tip, j) => (
                <li key={j} style={{ padding: '0.3rem 0', fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <span style={{ color: s.color }}>•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Safety Alerts */}
      <div className="info-card">
        <h3>
          <Shield size={20} color="#7c3aed" /> Health & Safety Alerts
        </h3>
        {safetyAlerts.map((a, i) => (
          <div className={`caution-item ${a.type}`} key={i}>
            <div className="caution-title">{a.title}</div>
            <div className="caution-desc">{a.desc}</div>
          </div>
        ))}
      </div>

      <div className="disclaimer-footer">
        <strong>📞 For medication questions:</strong> Call your pharmacist or the Poison Control Center at 1-800-222-1222 for immediate guidance on medication concerns or suspected overdoses.
      </div>
    </div>
  );
}
