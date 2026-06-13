import React, { useState } from 'react';
import { AlertTriangle, Loader2, HeartPulse, MessageCircle } from 'lucide-react';

export default function SymptomInput({ onSubmit, loading }) {
  const [description, setDescription] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) return;
    onSubmit({
      description: description.trim(),
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      duration: duration || undefined,
      severity: severity || undefined,
    });
  };

  return (
    <form className="input-card" onSubmit={handleSubmit}>
      <div className="disclaimer-banner">
        <AlertTriangle size={16} />
        <span>
          <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and is NOT a substitute
          for professional medical advice, diagnosis, or treatment.
        </span>
      </div>

      <label className="input-label" htmlFor="symptom-description">
        <MessageCircle size={18} />
        Describe your symptoms or health concern
      </label>

      <textarea
        id="symptom-description"
        name="description"
        className="symptom-textarea"
        placeholder="e.g., I've had a persistent headache for the past 3 days, mainly on the front of my head. It's a dull ache and gets worse when I look at screens. I also feel some tightness in my neck..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
        disabled={loading}
      />

      <div className="options-row">
        <div className="option-field">
          <label htmlFor="symptom-age">Age (optional)</label>
          <input
            id="symptom-age"
            name="age"
            type="number"
            min={0}
            max={150}
            placeholder="e.g., 30"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="option-field">
          <label htmlFor="symptom-gender">Gender (optional)</label>
          <select id="symptom-gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)} disabled={loading}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="option-field">
          <label htmlFor="symptom-duration">Duration (optional)</label>
          <input
            id="symptom-duration"
            name="duration"
            type="text"
            placeholder="e.g., 3 days"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="option-field">
          <label htmlFor="symptom-severity">Severity (optional)</label>
          <select id="symptom-severity" name="severity" value={severity} onChange={(e) => setSeverity(e.target.value)} disabled={loading}>
            <option value="">Not sure</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className={`submit-btn ${loading ? 'loading' : ''}`}
        disabled={loading || !description.trim() || description.trim().length < 10}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="spinner" />
            Analyzing...
          </>
        ) : (
          <>
            <HeartPulse size={18} />
            Analyze Symptoms
          </>
        )}
      </button>
    </form>
  );
}
