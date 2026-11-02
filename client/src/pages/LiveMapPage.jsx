import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import IncidentMap from '../components/map/IncidentMap';
import StatusBadge from '../components/common/StatusBadge';
import IncidentDetailModal from '../components/common/IncidentDetailModal';
import {
  MapPin,
  Filter,
  Navigation,
  Layers,
  Search,
  Eye,
  Building2,
  RefreshCw,
  LocateFixed,
} from 'lucide-react';
import { PILOT_COORDINATES, INCIDENT_CATEGORIES, INCIDENT_STATUSES } from '../utils/constants';
import { DAVANAGERE_WARDS } from '../utils/davanagereData';

export default function LiveMapPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalIncident, setDetailModalIncident] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [userRadius, setUserRadius] = useState({
    lat: PILOT_COORDINATES.lat,
    lng: PILOT_COORDINATES.lng,
    radiusMeters: 3000,
  });

  const loadIncidents = () => {
    setLoading(true);
    api.getIncidents({
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      ward: selectedWard !== 'ALL' ? selectedWard : undefined,
    })
      .then(res => {
        if (res.success) setIncidents(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIncidents();
  }, [selectedCategory, selectedStatus, selectedWard]);

  const handleVouch = async (id) => {
    try {
      const res = await api.vouchIncident(id);
      if (res.success) {
        setIncidents(prev =>
          prev.map(i => i.id === id ? { ...i, upvotes_count: res.upvotesCount, status: res.status } : i)
        );
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Interactive Davanagere Civic Map
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-semibold">
              OpenStreetMap + PostGIS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Spatial distribution across Davanagere's 45 Municipal Wards with ~100m privacy coarsening
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Map
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-semibold">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters:</span>
        </div>

        {/* Ward filter */}
        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All 45 Wards</option>
          {DAVANAGERE_WARDS.slice(0, 20).map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Categories</option>
          {Object.keys(INCIDENT_CATEGORIES).map(k => (
            <option key={k} value={k}>{INCIDENT_CATEGORIES[k].label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          {Object.keys(INCIDENT_STATUSES).map(s => (
            <option key={s} value={s}>{INCIDENT_STATUSES[s].label}</option>
          ))}
        </select>

        {/* Proximity Radius */}
        <div className="flex items-center gap-1.5 ml-auto">
          <LocateFixed className="w-4 h-4 text-teal-600" />
          <span className="text-slate-500 font-medium">Proximity Circle:</span>
          <select
            value={userRadius.radiusMeters}
            onChange={(e) => setUserRadius({ ...userRadius, radiusMeters: parseInt(e.target.value, 10) })}
            className="p-1.5 rounded-lg border border-slate-300 bg-white font-mono"
          >
            <option value="1000">1 km</option>
            <option value="2500">2.5 km</option>
            <option value="5000">5 km</option>
            <option value="10000">10 km</option>
          </select>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaflet Map */}
        <div className="lg:col-span-2 space-y-3">
          <IncidentMap
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setDetailModalIncident(inc);
            }}
            userRadius={userRadius}
            height="560px"
          />
        </div>

        {/* Right 1 Col: Selected Incident & Nearby Stream */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4 max-h-[560px] overflow-y-auto">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Ward Incidents ({incidents.length})</h3>
            <span className="text-[11px] text-slate-500 font-medium">Click map pin or item</span>
          </div>

          <div className="space-y-3">
            {incidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              return (
                <div
                  key={incident.id}
                  onClick={() => {
                    setSelectedIncident(incident);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {incident.incident_number}
                    </span>
                    <StatusBadge status={incident.status} />
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{incident.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{incident.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Ward {incident.ward_id}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModalIncident(incident);
                      }}
                      className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Inspect <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Inspector */}
      {detailModalIncident && (
        <IncidentDetailModal
          incident={detailModalIncident}
          onClose={() => setDetailModalIncident(null)}
          onVouch={handleVouch}
        />
      )}
    </div>
  );
}

