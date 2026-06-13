import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon paths (broken with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TYPE_COLORS = {
  hospital: '#ef4444',
  clinic: '#0891b2',
  pharmacy: '#059669',
  doctors: '#7c3aed',
};

const TYPE_ICONS = {};
Object.entries(TYPE_COLORS).forEach(([type, color]) => {
  TYPE_ICONS[type] = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%; border: 3px solid white;
      background: ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; color: white; font-weight: 700;
    ">🏥</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
});

const userIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;
    background: #3b82f6; box-shadow: 0 2px 8px rgba(59,130,246,0.5);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function HospitalMap({ results, userLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Cleanup previous instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    if (!userLocation) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([userLocation.lat, userLocation.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // User marker
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong>You are here</strong>');

    // Hospital markers
    const bounds = L.latLngBounds([[userLocation.lat, userLocation.lng]]);
    markersRef.current = [];

    if (results && results.length > 0) {
      results.forEach((f) => {
        const icon = TYPE_ICONS[f.type] || TYPE_ICONS.hospital;
        const marker = L.marker([f.lat, f.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px;">
              <strong style="font-size: 14px;">${f.name}</strong>
              <div style="color: #64748b; font-size: 12px; margin: 4px 0;">${f.address}</div>
              <div style="display: flex; gap: 8px; font-size: 12px; margin: 6px 0;">
                ${f.distance ? `<span style="font-weight: 600;">${f.distance} km</span>` : ''}
                ${f.phone ? `<span>📞 ${f.phone}</span>` : ''}
              </div>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}"
                 target="_blank" rel="noopener noreferrer"
                 style="display: inline-block; margin-top: 4px; padding: 4px 10px;
                        background: #0891b2; color: white; text-decoration: none;
                        border-radius: 4px; font-size: 12px; font-weight: 600;">
                🗺️ Get Directions
              </a>
            </div>
          `);
        markersRef.current.push(marker);
        bounds.extend([f.lat, f.lng]);
      });
    }

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [results, userLocation]);

  if (!userLocation) return null;

  return (
    <div ref={mapRef} className="hospital-map-container" />
  );
}
