import React from 'react';
import { AlertTriangle, Shield, Stethoscope, Activity, Pill } from 'lucide-react';

export default function ResultsCard({ results }) {
  if (!results) return null;

  const {
    analysis,
    possible_conditions,
    medication_suggestions,
    lifestyle_recommendations,
    when_to_see_doctor,
    disclaimer,
  } = results;

  return (
    <div className="results-section">
      {/* Analysis Summary */}
      <div className="result-card">
        <h3>
          <Activity size={20} color="#0ea5e9" />
          Analysis Summary
        </h3>
        <p className="analysis-text">{analysis}</p>
      </div>

      {/* Possible Conditions */}
      {possible_conditions?.length > 0 && (
        <>
          <h3 className="section-title">
            <Stethoscope size={20} color="#0ea5e9" />
            Possible Conditions
          </h3>
          {possible_conditions.map((condition, idx) => (
            <div className="condition-item" key={idx}>
              <div className="condition-header">
                <span className="condition-name">{condition.name}</span>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span className={`probability-tag ${condition.probability}`}>
                    {condition.probability} probability
                  </span>
                  <span className={`urgency-badge ${condition.urgency}`}>
                    {condition.urgency === 'emergency' && '🚨 '}
                    {condition.urgency === 'see_doctor_soon' && '🩺 '}
                    {condition.urgency?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p className="condition-desc">{condition.description}</p>
              {condition.common_symptoms?.length > 0 && (
                <div className="symptom-tags">
                  {condition.common_symptoms.map((symp, i) => (
                    <span className="symptom-tag" key={i}>{symp}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Medication Suggestions */}
      {medication_suggestions?.length > 0 && (
        <>
          <h3 className="section-title">
            <Pill size={20} color="#10b981" />
            Medication Suggestions
          </h3>
          {medication_suggestions.map((med, idx) => (
            <div className="med-item" key={idx}>
              <div className="med-header">
                <span className="med-name">{med.name}</span>
                <span className="med-category">{med.category}</span>
              </div>
              <p className="med-notes">{med.dosage_notes}</p>
              <span className={`med-prescription ${med.is_prescription_required ? 'rx' : 'otc'}`}>
                {med.is_prescription_required ? '🔴 Prescription Required' : '🟢 OTC Available'}
              </span>
              {med.warnings?.length > 0 && (
                <ul className="warnings-list">
                  {med.warnings.map((w, i) => (
                    <li key={i}>
                      <span>⚠️</span> {w}
                    </li>
                  ))}
                </ul>
              )}
              {med.common_side_effects?.length > 0 && (
                <ul className="warnings-list" style={{ marginTop: '0.35rem' }}>
                  <li style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Side effects: {med.common_side_effects.join(', ')}
                  </li>
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* Lifestyle Recommendations */}
      {lifestyle_recommendations?.length > 0 && (
        <div className="result-card">
          <h3>
            <Shield size={20} color="#10b981" />
            Lifestyle Recommendations
          </h3>
          <ul className="rec-list">
            {lifestyle_recommendations.map((rec, idx) => (
              <li key={idx}>
                <span style={{ color: 'var(--secondary)' }}>✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* When to See Doctor */}
      {when_to_see_doctor && (
        <div className="see-doctor-card">
          <h4>🩺 When to See a Doctor</h4>
          <p>{when_to_see_doctor}</p>
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <div className="disclaimer-footer">
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{disclaimer}</span>
        </div>
      )}
    </div>
  );
}
