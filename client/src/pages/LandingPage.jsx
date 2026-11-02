import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import HealthWidget from '../components/common/HealthWidget';
import StatusBadge from '../components/common/StatusBadge';
import {
  Shield,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Camera,
  ThumbsUp,
  Users,
  Eye,
  Lock,
  Building2,
  PhoneCall,
  Activity,
  Flame,
  Droplets,
  Lightbulb,
  Trash2,
  Car,
  Waves,
  HelpCircle,
} from 'lucide-react';
import {
  PILOT_COORDINATES,
  INCIDENT_CATEGORIES,
  INCIDENT_STATUSES,
  ROLES,
} from '../utils/constants';
import { EMERGENCY_CONTACTS, DAVANAGERE_WARDS } from '../utils/davanagereData';

export default function LandingPage({ onNavigate }) {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = () => {
    setLoading(true);
    api.getIncidents()
      .then(res => {
        if (res.success) setIncidents(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleVouch = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.vouchIncident(id);
      if (res.success) {
        setIncidents(prev =>
          prev.map(i => i.id === id ? { ...i, upvotes_count: res.upvotesCount, status: res.status } : i)
        );
      }
    } catch (err) {
      // Ignored
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(i => {
    const matchesSearch =
      searchQuery === '' ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.incident_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(i.ward_id).includes(searchQuery);

    const matchesCategory = selectedCategory === 'ALL' || i.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || i.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* 1. TOP BILINGUAL CIVIC BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-teal-900 text-white text-xs py-2 px-4 border-b border-blue-800/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-300 font-mono">ಜನಶಕ್ತಿ</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">
              ದಾವಣಗೆರೆ ಮಹಾನಗರ ಪಾಲಿಕೆ ನಾಗರಿಕ ಸುರಕ್ಷತಾ ವೇದಿಕೆ (Davanagere City Corporation Pilot)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-400" />
              Pilot City: Davanagere, KA
            </span>
            <span>•</span>
            <span className="text-teal-300 font-medium">45 Municipal Wards</span>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            Civic Protection Platform • Davanagere Pilot Active
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Transparent Civic Safety & Incident Resolution for{' '}
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-teal-400 bg-clip-text text-transparent">
              Davanagere
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
            Spot road hazards, broken water mains, and streetlight failures in your ward. Verify community reports, trigger municipal engineering dispatch, and track photographic resolution proof.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('citizen', { tab: 'report' })}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              Report Civic Hazard (GPS + Photo)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('authority')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4 text-teal-400" />
              Municipal Command Center
            </button>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-white block">45</span>
              <span className="text-xs text-slate-300 font-medium">City Wards Covered</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-teal-300 block">&lt; 100m</span>
              <span className="text-xs text-slate-300 font-medium">Citizen Location Privacy</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-blue-300 block">6 Divisions</span>
              <span className="text-xs text-slate-300 font-medium">MCC & Emergency Depts</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl font-bold text-emerald-300 block">Real-Time</span>
              <span className="text-xs text-slate-300 font-medium">Socket.IO Live Telemetry</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Real-time System Telemetry */}
        <HealthWidget />

        {/* 4. CIVIC HAZARD CATEGORIES */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Report Civic Issues Across Davanagere Wards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Categorized for immediate routing to Mahanagara Palike, BESCOM, or Traffic Police divisions
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(INCIDENT_CATEGORIES).map(([key, cat]) => (
              <div
                key={key}
                onClick={() => {
                  onNavigate('citizen', { category: key, tab: 'report' });
                }}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-subtle hover:shadow-card transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                  {key === 'ROAD_HAZARD' && <AlertTriangle className="w-5 h-5" />}
                  {key === 'STREETLIGHT' && <Lightbulb className="w-5 h-5" />}
                  {key === 'WATER_LEAKAGE' && <Droplets className="w-5 h-5" />}
                  {key === 'GARBAGE_DUMP' && <Trash2 className="w-5 h-5" />}
                  {key === 'ACCIDENT' && <Car className="w-5 h-5" />}
                  {key === 'FIRE_SAFETY' && <Flame className="w-5 h-5" />}
                  {key === 'PUBLIC_NUISANCE' && <ShieldAlert className="w-5 h-5" />}
                  {key === 'SEWAGE_OVERFLOW' && <Waves className="w-5 h-5" />}
                  {key === 'OTHER' && <HelpCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  {cat.label}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 block">One-touch dispatch</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 4-STEP HOW IT WORKS */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-10 shadow-elevated">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 font-mono">
              The Janashakti Incident Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              From Citizen Report to Verified Resolution
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A transparent 4-stage pipeline powered by community consensus and municipal accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="text-sm font-bold text-white">Spot & Snap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Citizen clicks photo with automatic GPS detection. Exact coordinates are protected by ~100m privacy blurring.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="text-sm font-bold text-white">Community Vouching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nearby Davanagere residents vouch for the issue. ≥ 3 vouches moves report to Community Confirmed.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="text-sm font-bold text-white">Authority Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Designated MCC engineers review evidence, conduct official verification, and dispatch field repair teams.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-sm font-bold">4</div>
              <h3 className="text-sm font-bold text-white">Proof of Repair</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Repair crew uploads completion photo. Incident marked RESOLVED with immutable audit logging.
              </p>
            </div>
          </div>
        </div>

        {/* 6. LIVE PUBLIC INCIDENT FEED & FILTER */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-2xl font-bold text-slate-900">Live Davanagere Public Incident Stream</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Public feed with coarsened GPS markers and masked citizen identities
              </p>
            </div>

            <button
              onClick={() => onNavigate('citizen', { tab: 'report' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Report New Issue
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by keyword, street name, ward number (e.g. 12, Hadadi, Pothole)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">All Hazard Categories</option>
                {Object.keys(INCIDENT_CATEGORIES).map(k => (
                  <option key={k} value={k}>{INCIDENT_CATEGORIES[k].label}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">All Lifecycle Statuses</option>
                {Object.keys(INCIDENT_STATUSES).map(k => (
                  <option key={k} value={k}>{INCIDENT_STATUSES[k].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Incidents Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Fetching Davanagere community reports...
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
              No matching incidents found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {incident.incident_number}
                      </span>
                      <StatusBadge status={incident.status} />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{incident.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="line-clamp-1">{incident.landmark_address}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={(e) => handleVouch(incident.id, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{incident.upvotes_count || 1} Vouches</span>
                    </button>

                    <span className="text-[10px] text-slate-400 font-medium">
                      Ward {incident.ward_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. CITIZEN PRIVACY & AI TRANSPARENCY SAFEGUARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-600 text-white rounded-lg">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-teal-950">Citizen Privacy Shield Active</h3>
            </div>
            <p className="text-xs text-teal-900 leading-relaxed">
              Your domestic safety is our priority. Public maps coarsen GPS coordinates by ~100m to prevent locating domestic residences. Reporter phone numbers and email addresses are never displayed on public feeds and remain restricted to authorized city officers.
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-blue-950">Zero Automated AI Verification</h3>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">
              In accordance with civic governance policies, AI classification outputs are purely advisory for category and triage prioritization. The system never marks reports as Officially Verified without physical or field confirmation by an authorized municipal officer.
            </p>
          </div>
        </div>

        {/* 8. DAVANAGERE EMERGENCY HELPLINES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Davanagere Emergency Helplines & Municipal Desks</h3>
              <p className="text-xs text-slate-500">Immediate telephone hotlines for civic emergencies</p>
            </div>
            <PhoneCall className="w-5 h-5 text-blue-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {EMERGENCY_CONTACTS.map((c) => (
              <div key={c.number} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">{c.type}</span>
                <span className="text-base font-extrabold text-blue-700 block font-mono">{c.number}</span>
                <span className="text-[11px] text-slate-700 font-medium block line-clamp-1">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
