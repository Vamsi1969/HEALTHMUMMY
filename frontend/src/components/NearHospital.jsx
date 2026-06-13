import React, { useState, useEffect, useRef } from 'react';
import {
  Building2, Ambulance, Stethoscope, Pill, Bandage, FlaskConical,
  Heart, AlertTriangle, MapPin, Navigation, Loader2, Phone, Clock,
  ExternalLink, Crosshair, Map, Search
} from 'lucide-react';
import HospitalMap from './HospitalMap';

const hospitals = [
  { icon: Ambulance, name: 'Emergency Room (ER)', desc: 'Life-threatening conditions: chest pain, severe bleeding, difficulty breathing, head injuries, stroke symptoms', color: '#ef4444', bg: '#fef2f2' },
  { icon: Stethoscope, name: 'Urgent Care Center', desc: 'Non-emergency but immediate: minor fractures, cuts needing stitches, fever, infections, sprains', color: '#f59e0b', bg: '#fffbeb' },
  { icon: Building2, name: 'General Hospital', desc: 'Inpatient care, surgeries, specialist consultations, diagnostic testing, maternity services', color: '#0891b2', bg: '#ecfeff' },
  { icon: Pill, name: 'Pharmacy', desc: 'Medication dispensing, vaccinations, health screenings, minor ailment advice, prescription refills', color: '#059669', bg: '#ecfdf5' },
  { icon: FlaskConical, name: 'Diagnostic Center', desc: 'Blood tests, X-rays, MRIs, CT scans, ultrasound, preventive health screenings', color: '#7c3aed', bg: '#ede9fe' },
  { icon: Heart, name: 'Specialty Clinic', desc: 'Cardiology, orthopedics, dermatology, neurology, psychiatry — specialist doctor visits', color: '#ec4899', bg: '#fdf2f8' },
];

const firstAid = [
  { title: '🚑 Severe Bleeding', desc: 'Apply direct pressure with a clean cloth. Elevate the wound. Call 911 if bleeding does not stop after 10 minutes.' },
  { title: '🔥 Burns', desc: 'Cool under running water for 10-20 minutes. Cover with sterile gauze. Do NOT apply ice, butter, or ointments.' },
  { title: '🦴 Fracture/Sprain', desc: 'Immobilize the area, apply ice wrapped in cloth, keep elevated. Seek medical attention for suspected fractures.' },
  { title: '🫀 Heart Attack Signs', desc: 'Chest pain/pressure, arm/jaw pain, shortness of breath, nausea. Call 911 immediately — every minute matters.' },
  { title: '🧠 Stroke (FAST)', desc: 'Face drooping, Arm weakness, Speech difficulty — Time to call 911. Note when symptoms started.' },
  { title: '🫁 Choking', desc: 'Heimlich maneuver: stand behind, fist above navel, thrust inward and upward. Call 911 if unsuccessful.' },
];

// ── Helper ─────────────────────────────────────────────────────

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

const HOSPITAL_TAGS = [
  '"amenity"="hospital"',
  '"amenity"="clinic"',
  '"amenity"="pharmacy"',
  '"healthcare"="hospital"',
  '"healthcare"="clinic"',
];

const TYPE_LABELS = {
  hospital: { label: '🏥 Hospital', color: '#ef4444', bg: '#fef2f2' },
  clinic: { label: '🏥 Clinic', color: '#0891b2', bg: '#ecfeff' },
  pharmacy: { label: '💊 Pharmacy', color: '#059669', bg: '#ecfdf5' },
  doctors: { label: '🩺 Doctor', color: '#7c3aed', bg: '#ede9fe' },
};

function getType(name, tags) {
  const lower = (name || '').toLowerCase();
  if (tags?.amenity === 'pharmacy' || lower.includes('pharmacy') || lower.includes('drug')) return 'pharmacy';
  if (tags?.healthcare === 'clinic' || lower.includes('clinic') || lower.includes('urgent care')) return 'clinic';
  if (lower.includes('doctor') || lower.includes('medical group') || lower.includes('physician')) return 'doctors';
  return 'hospital';
}

// ── Component ──────────────────────────────────────────────────

export default function NearHospital() {
  const [location, setLocation] = useState(null); // {lat, lng}
  const [results, setResults] = useState(null);   // array
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced autocomplete via Nominatim
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = cityQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&featureType=city`,
          { headers: { 'User-Agent': 'HealthAssistant/1.0' } },
        );
        const data = await res.json();
        if (!data || data.length === 0) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const mapped = data.map((d) => ({
          name: d.display_name.split(',').slice(0, 3).join(','),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        }));
        setSuggestions(mapped);
        setShowSuggestions(true);
        setSelectedSuggestion(-1);
      } catch { /* ignore */ }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [cityQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectSuggestion = (suggestion) => {
    setCityQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setLocation({ lat: suggestion.lat, lng: suggestion.lng });
    setLocationName(suggestion.name);
    setGeoError(null);
    setResults(null);
    searchHospitals(suggestion.lat, suggestion.lng);
  };

  const searchByCity = async () => {
    const q = cityQuery.trim();
    if (!q || q.length < 2) return;
    setSearching(true);
    setGeoError(null);
    setResults(null);
    setLocation(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`,
        { headers: { 'User-Agent': 'HealthAssistant/1.0' } },
      );
      const data = await res.json();
      if (!data || data.length === 0) {
        setGeoError(`Could not find a location for "${q}". Try a different city name.`);
        setSearching(false);
        return;
      }
      const { lat, lon, display_name } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      setLocation({ lat: latNum, lng: lngNum });
      setLocationName(display_name.split(',').slice(0, 2).join(','));
      await searchHospitals(latNum, lngNum);
    } catch (err) {
      console.error(err);
      setGeoError('Could not search for that city. Please try again.');
      setSearching(false);
    }
  };

  const handleCityKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter' && selectedSuggestion >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedSuggestion]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    if (e.key === 'Enter') searchByCity();
  };

  const findLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    setResults(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocating(false);
        await searchHospitals(latitude, longitude);
      },
      (err) => {
        setLocating(false);
        const msgs = {
          1: 'Location access denied. Please enable location in your browser settings.',
          2: 'Location unavailable. Try again or check your GPS.',
          3: 'Location request timed out. Please try again.',
        };
        setGeoError(msgs[err.code] || 'Could not get location.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const searchHospitals = async (lat, lng) => {
    setSearching(true);
    setGeoError(null);
    try {
      // Overpass API query — find hospitals, clinics, pharmacies within 5km
      const query = `
        [out:json][timeout:15];
        (
          node(${lat - 0.1},${lng - 0.1},${lat + 0.1},${lng + 0.1})[~"^(amenity|healthcare)$"~"^(hospital|clinic|pharmacy)$"];
          way(${lat - 0.1},${lng - 0.1},${lat + 0.1},${lng + 0.1})[~"^(amenity|healthcare)$"~"^(hospital|clinic|pharmacy)$"];
        );
        out center 20;
      `;

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      const data = await res.json();
      const elements = data.elements || [];

      const mapped = elements
        .map((el) => {
          const name = el.tags?.name || 'Unnamed Facility';
          const phone = el.tags?.phone || el.tags?.['contact:phone'] || '';
          const hours = el.tags?.['opening_hours'] || '';
          const website = el.tags?.website || '';
          const address = [
            el.tags?.['addr:street'],
            el.tags?.['addr:housenumber'],
            el.tags?.['addr:city'],
          ].filter(Boolean).join(', ') || 'Address not available';

          const elLat = el.lat || el.center?.lat || lat;
          const elLng = el.lon || el.center?.lon || lng;
          const dist = parseFloat(getDistance(lat, lng, elLat, elLng));
          const type = getType(name, el.tags);

          return { name, phone, hours, website, address, distance: dist, type, lat: elLat, lng: elLng };
        })
        .filter((f) => f.distance <= 10) // within 10 km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 15);

      setResults(mapped);

      // Reverse geocode for area name
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
          { headers: { 'User-Agent': 'HealthAssistant/1.0' } },
        );
        const geoData = await geoRes.json();
        const area = geoData?.address?.city || geoData?.address?.town || geoData?.address?.county || '';
        setLocationName(area);
      } catch { /* ignore */ }
    } catch (err) {
      setGeoError('Could not search for hospitals. Please try again.');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="feature-page">
      <div className="feature-header">
        <Building2 size={48} color="#0891b2" />
        <h2>Hospital & Medical Services Guide</h2>
        <p>Find the right medical facility, first aid advice, and when to seek emergency care</p>
      </div>

      <div className="disclaimer-banner">
        <AlertTriangle size={16} />
        <span><strong>🚨 In an emergency, always call 911 first.</strong> This guide helps you choose the right type of care for different situations.</span>
      </div>

      {/* ── Find Hospitals Near Me ──────────────────────────── */}
      <div className="info-card">
        <h3>
          <MapPin size={20} color="#ef4444" /> Find Hospitals Near Me
        </h3>

        {/* ── City Search ────────────────────────────────── */}
        <div className="city-search-row">
          <div className="city-search-input-wrap">
            <MapPin size={16} className="city-search-icon" />
            <input
              id="city-search"
              name="citySearch"
              className="city-search-input"
              type="text"
              placeholder="Enter a city name… e.g. New York, London, Tokyo"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              onKeyDown={handleCityKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              disabled={searching || locating}
              autoComplete="off"
              aria-label="Search for a city"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              role="combobox"
            />
            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="city-suggestions" ref={suggestRef}>
                {suggestions.map((s, i) => (
                  <div
                    className={`city-suggestion ${i === selectedSuggestion ? 'active' : ''}`}
                    key={i}
                    onMouseDown={() => selectSuggestion(s)}
                    onMouseEnter={() => setSelectedSuggestion(i)}
                  >
                    <MapPin size={14} className="suggest-icon" />
                    <div className="suggest-text">{s.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="city-search-btn"
            onClick={searchByCity}
            disabled={searching || locating || !cityQuery.trim()}
          >
            {searching ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
          </button>
        </div>

        <div className="locate-divider">
          <span>or use your current location</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            className="locate-btn"
            onClick={findLocation}
            disabled={locating || searching}
          >
            {locating ? (
              <><Loader2 size={20} className="spinner" /> Detecting your location...</>
            ) : searching ? (
              <><Loader2 size={20} className="spinner" /> Searching nearby hospitals...</>
            ) : (
              <><Navigation size={20} /> Use My Location</>
            )}
          </button>
        </div>

        {geoError && (
          <div className="disclaimer-banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
            <AlertTriangle size={16} />
            <span>{geoError}</span>
          </div>
        )}

        {results && results.length === 0 && !searching && (
          <div className="disclaimer-banner" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
            <AlertTriangle size={16} />
            <span>No hospitals or clinics found within 10 km of your location.</span>
          </div>
        )}

        {results && results.length > 0 && (
          <>
            <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} />
              Found <strong>{results.length}</strong> facilities near{locationName ? ` ${locationName}` : ' your location'}
            </div>

            {/* Map View */}
            <div className="info-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Map size={16} /> Map View
              </div>
              <HospitalMap results={results} userLocation={location} />
            </div>

            <div className="hospital-results">
              {results.map((f, i) => {
                const t = TYPE_LABELS[f.type] || TYPE_LABELS.hospital;
                return (
                  <div className="hosp-result" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="hosp-result-top">
                      <span className="hosp-type-badge" style={{ background: t.bg, color: t.color }}>
                        {t.label}
                      </span>
                      <span className="hosp-distance">{f.distance} km</span>
                    </div>
                    <div className="hosp-result-name">{f.name}</div>
                    <div className="hosp-result-addr">{f.address}</div>
                    <div className="hosp-result-meta">
                      {f.phone && (
                        <a href={`tel:${f.phone}`} className="hosp-meta-link">
                          <Phone size={13} /> {f.phone}
                        </a>
                      )}
                      {f.hours && (
                        <span className="hosp-meta-text" title={f.hours}>
                          <Clock size={13} /> {f.hours.slice(0, 30)}...
                        </span>
                      )}
                    </div>
                    <div className="hosp-result-actions">
                      <button className="hosp-action-btn" onClick={() => openDirections(f.lat, f.lng)}>
                        <Navigation size={14} /> Get Directions
                      </button>
                      {f.website && (
                        <a href={f.website} target="_blank" rel="noopener noreferrer" className="hosp-action-btn secondary">
                          <ExternalLink size={14} /> Website
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!results && !searching && !locating && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Crosshair size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
            Enter a city name above or use your location to find hospitals, clinics, and pharmacies near you.
          </div>
        )}
      </div>

      {/* ── Hospital Types ──────────────────────────────────── */}
      <div className="info-card">
        <h3>
          <Building2 size={20} color="#0891b2" /> Types of Medical Facilities
        </h3>
        <div className="hospital-types">
          {hospitals.map((h, i) => (
            <div className="hosp-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="hosp-icon" style={{ background: h.bg, color: h.color }}>
                <h.icon size={22} />
              </div>
              <div className="hosp-name">{h.name}</div>
              <div className="hosp-desc">{h.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── First Aid ────────────────────────────────────────── */}
      <div className="info-card">
        <h3>
          <Bandage size={20} color="#ef4444" /> First Aid & Emergency Response
        </h3>
        {firstAid.map((f, i) => (
          <div className="caution-item warning" key={i} style={{ borderLeftColor: i < 3 ? '#f59e0b' : '#ef4444', background: i < 3 ? '#fffbeb' : '#fef2f2' }}>
            <div className="caution-title">{f.title}</div>
            <div className="caution-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* ── When to Go Where ──────────────────────────────────── */}
      <div className="info-card">
        <h3>
          <Ambulance size={20} color="#dc2626" /> When to Go Where
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div className="caution-item danger">
            <div className="caution-title">🚨 Call 911 / Go to ER</div>
            <div className="caution-desc">Chest pain, difficulty breathing, severe allergic reaction, uncontrollable bleeding, stroke symptoms, head injury with loss of consciousness, major burns, poisoning.</div>
          </div>
          <div className="caution-item warning">
            <div className="caution-title">🏥 Visit Urgent Care</div>
            <div className="caution-desc">Minor cuts needing stitches, sprains, mild fever, ear infections, sore throat, UTI symptoms, minor burns, insect bites with reaction — same day, no appointment needed.</div>
          </div>
          <div className="caution-item info">
            <div className="caution-title">📅 Schedule with Primary Care</div>
            <div className="caution-desc">Annual checkups, chronic condition management, vaccinations, non-urgent health concerns, prescription refills, specialist referrals.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
