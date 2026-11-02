import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PILOT_COORDINATES, INCIDENT_STATUSES, INCIDENT_CATEGORIES } from '../../utils/constants';

// Color map for Leaflet custom HTML markers
const STATUS_MARKER_COLORS = {
  UNVERIFIED: '#F59E0B',          // Amber
  COMMUNITY_CONFIRMED: '#0284C7', // Sky
  UNDER_AUTHORITY_REVIEW: '#6366F1', // Indigo
  OFFICIALLY_VERIFIED: '#0D9488', // Teal
  IN_PROGRESS: '#2563EB',         // Electric Blue
  RESOLVED: '#10B981',            // Emerald Green
  REJECTED: '#EF4444',            // Rose Red
  DUPLICATE: '#64748B',           // Slate Gray
};

function createCustomPin(status = 'UNVERIFIED', isSelected = false) {
  const color = STATUS_MARKER_COLORS[status] || '#2563EB';
  const size = isSelected ? 36 : 28;

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export default function IncidentMap({
  incidents = [],
  selectedIncident = null,
  onSelectIncident = null,
  onLocationPick = null,
  isPickerMode = false,
  pickedLocation = null,
  userRadius = null,
  height = '500px',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [PILOT_COORDINATES.lat, PILOT_COORDINATES.lng],
        zoom: PILOT_COORDINATES.zoom,
        zoomControl: true,
      });

      // OpenStreetMap Standard Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Davanagere Pilot',
        maxZoom: 19,
      }).addTo(map);

      // Create layers
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Click-to-pick GPS coordinates listener
      map.on('click', (e) => {
        if (onLocationPick) {
          onLocationPick({
            lat: Number(e.latlng.lat.toFixed(5)),
            lng: Number(e.latlng.lng.toFixed(5)),
          });
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Incident Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    incidents.forEach((inc) => {
      const lat = inc.latitude || inc.public_lat || inc.exact_lat;
      const lng = inc.longitude || inc.public_lng || inc.exact_lng;

      if (!lat || !lng) return;

      const isSelected = selectedIncident && selectedIncident.id === inc.id;
      const icon = createCustomPin(inc.status, isSelected);

      const marker = L.marker([lat, lng], { icon });

      const statusConfig = INCIDENT_STATUSES[inc.status] || { label: inc.status };
      const categoryConfig = INCIDENT_CATEGORIES[inc.category] || { label: inc.category };

      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #2563EB; background: #EFF6FF; padding: 2px 6px; border-radius: 4px;">
              ${inc.incident_number}
            </span>
            <span style="font-size: 10px; font-weight: bold; color: ${STATUS_MARKER_COLORS[inc.status] || '#2563EB'};">
              ${statusConfig.label}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #0F172A;">
            ${inc.title}
          </h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">
            ${categoryConfig.label} • Ward ${inc.ward_id || 12}
          </p>
          <div style="font-size: 10px; color: #64748B; margin-bottom: 8px;">
            📍 ${inc.landmark_address || 'Davanagere'}
          </div>
          <div style="font-size: 10px; color: #0D9488; font-weight: 500;">
            🛡️ Public location blurred by ~100m for citizen privacy
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectIncident) {
          onSelectIncident(inc);
        }
      });

      markersLayer.addLayer(marker);
    });

    // If an incident is selected, pan to it smoothly
    if (selectedIncident) {
      const sLat = selectedIncident.latitude || selectedIncident.public_lat;
      const sLng = selectedIncident.longitude || selectedIncident.public_lng;
      if (sLat && sLng) {
        map.setView([sLat, sLng], 15, { animate: true });
      }
    }
  }, [incidents, selectedIncident]);

  // 3. Render Coordinate Picker Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickerMarkerRef.current) {
      map.removeLayer(pickerMarkerRef.current);
      pickerMarkerRef.current = null;
    }

    if (pickedLocation && pickedLocation.lat && pickedLocation.lng) {
      const pickerIcon = L.divIcon({
        className: 'picker-pin',
        html: `
          <div style="
            background: #2563EB;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid #FFFFFF;
            box-shadow: 0 0 12px rgba(37, 99, 235, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 14px;
          ">
            🎯
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      pickerMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
        icon: pickerIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      map.setView([pickedLocation.lat, pickedLocation.lng], 15, { animate: true });
    }
  }, [pickedLocation]);

  // 4. Render Proximity Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (userRadius && userRadius.lat && userRadius.lng && userRadius.radiusMeters) {
      radiusCircleRef.current = L.circle([userRadius.lat, userRadius.lng], {
        radius: userRadius.radiusMeters,
        color: '#0D9488',
        fillColor: '#0D9488',
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);
    }
  }, [userRadius]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-subtle bg-slate-100">
      <div ref={mapContainerRef} style={{ height }} className="w-full" />

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md text-[10px] space-y-1">
        <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">Status Legend</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-700">Unverified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-slate-700">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span className="text-slate-700">Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-700">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-slate-700">Resolved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-700">Rejected</span>
          </div>
        </div>
      </div>

      {isPickerMode && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
          <span>Click anywhere in Davanagere to place GPS pin</span>
        </div>
      )}
    </div>
  );
}

