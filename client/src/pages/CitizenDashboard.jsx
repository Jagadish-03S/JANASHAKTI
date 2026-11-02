import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import IncidentMap from '../components/map/IncidentMap';
import IncidentDetailModal from '../components/common/IncidentDetailModal';
import {
  PlusCircle,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ShieldCheck,
  Navigation,
  Send,
  X,
  Lock,
  Layers,
  History,
  Clock,
  Sparkles,
  FileImage,
  Eye,
  Trash2,
} from 'lucide-react';
import { INCIDENT_CATEGORIES, INCIDENT_PRIORITIES, PILOT_COORDINATES } from '../utils/constants';
import { DAVANAGERE_WARDS } from '../utils/davanagereData';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'my-reports' | 'nearby'
  const [allIncidents, setAllIncidents] = useState([]);
  const [myIncidents, setMyIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ROAD_HAZARD');
  const [priority, setPriority] = useState('MEDIUM');
  const [wardId, setWardId] = useState(12);
  const [landmarkAddress, setLandmarkAddress] = useState('');
  const [latitude, setLatitude] = useState(PILOT_COORDINATES.lat);
  const [longitude, setLongitude] = useState(PILOT_COORDINATES.lng);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [aiHint, setAiHint] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getIncidents().catch(() => ({ data: [] })),
      api.getMyIncidents().catch(() => ({ data: [] })),
    ]).then(([publicRes, myRes]) => {
      if (publicRes?.data) setAllIncidents(publicRes.data);
      if (myRes?.data) setMyIncidents(myRes.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Real-time AI advisory hint generator
  useEffect(() => {
    if (title.length > 5 || description.length > 10) {
      const text = `${title} ${description}`.toLowerCase();
      if (text.includes('pothole') || text.includes('road')) {
        setAiHint('AI Suggestion: Road Hazard • High Urgency • MCC Civil Infrastructure');
      } else if (text.includes('water') || text.includes('leak')) {
        setAiHint('AI Suggestion: Drinking Water Leak • Medium Urgency • MCC Water Supply');
      } else if (text.includes('light') || text.includes('dark')) {
        setAiHint('AI Suggestion: Streetlight Defect • BESCOM Davanagere');
      } else if (text.includes('accident')) {
        setAiHint('AI Suggestion: Traffic Accident • Critical Priority • Davanagere Police');
      } else {
        setAiHint(null);
      }
    } else {
      setAiHint(null);
    }
  }, [title, description]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(5)));
          setLongitude(Number(pos.coords.longitude.toFixed(5)));
          setFeedback({ type: 'success', message: 'Current GPS coordinates detected!' });
        },
        () => {
          setFeedback({ type: 'info', message: 'GPS access unavailable. Map pinned to Davanagere Hadadi Road.' });
        }
      );
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setFeedback({ type: 'error', message: 'Some photos exceeded the 5MB size limit and were skipped.' });
    }

    setPhotos(prev => [...prev, ...validFiles].slice(0, 4));

    // Generate previews
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...newPreviews].slice(0, 4));
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVouch = async (id) => {
    try {
      const res = await api.vouchIncident(id);
      if (res.success) {
        setAllIncidents(prev =>
          prev.map(i => i.id === id ? { ...i, upvotes_count: res.upvotesCount, status: res.status } : i)
        );
        setMyIncidents(prev =>
          prev.map(i => i.id === id ? { ...i, upvotes_count: res.upvotesCount, status: res.status } : i)
        );
      }
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('wardId', wardId);
    formData.append('landmarkAddress', landmarkAddress);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    photos.forEach(p => formData.append('photos', p));

    try {
      const res = await api.createIncident(formData);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Civic Report ${res.data.incident_number} logged! Community vouches initiated.`,
        });
        setTitle('');
        setDescription('');
        setLandmarkAddress('');
        setPhotos([]);
        setPhotoPreviews([]);
        loadData();
        setActiveTab('my-reports');
      } else {
        setFeedback({ type: 'error', message: res.message || 'Submission error' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to submit incident report. Please retry.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Citizen Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Citizen Action Portal</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono font-semibold">
              Davanagere Pilot
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{user?.fullName || 'Resident Citizen'}</strong>. 
            Empowering Davanagere residents with GPS-verified reporting and real-time municipal transparency.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 text-xs font-semibold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
              activeTab === 'report' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report Hazard
          </button>
          <button
            onClick={() => setActiveTab('my-reports')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
              activeTab === 'my-reports' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Reports ({myIncidents.length})
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
              activeTab === 'nearby' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nearby Feed ({allIncidents.length})
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. REPORT CIVIC HAZARD TAB */}
      {activeTab === 'report' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Report a Civic Hazard or Emergency</h2>
              <p className="text-xs text-slate-500">
                Auto-assigned to Davanagere Municipal Corporation MCC, BESCOM, or Traffic Police
              </p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Incident Headline / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Major water pipeline rupture flooding Hadadi Road footpath"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Category & Ward */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Object.keys(INCIDENT_CATEGORIES).map((key) => (
                    <option key={key} value={key}>{INCIDENT_CATEGORIES[key].label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Davanagere Ward *</label>
                <select
                  value={wardId}
                  onChange={(e) => setWardId(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {DAVANAGERE_WARDS.slice(0, 25).map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Detailed Hazard Observation *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe visible damage, hazards to pedestrians/vehicles, standing water depth, broken wires, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* AI Real-time Triage Preview Hint */}
            {aiHint && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/80 rounded-2xl flex items-center gap-2 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">{aiHint}</span>
              </div>
            )}

            {/* Landmark & Street Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Landmark & Street Details
              </label>
              <input
                type="text"
                placeholder="e.g. Opposite Bapuji Dental College, Vidyanagar 3rd cross"
                value={landmarkAddress}
                onChange={(e) => setLandmarkAddress(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* GPS Geolocation Map Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  GPS Pinpoint Location (Click on Map or Detect)
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Detect Current GPS
                </button>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-slate-300">
                <IncidentMap
                  incidents={allIncidents}
                  isPickerMode={true}
                  pickedLocation={{ lat: latitude, lng: longitude }}
                  onLocationPick={(coords) => {
                    setLatitude(coords.lat);
                    setLongitude(coords.lng);
                  }}
                  height="256px"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>Selected Coordinates: {latitude}, {longitude}</span>
                <span className="text-teal-700">🛡️ Public marker will be coarsened by ~100m</span>
              </div>
            </div>

            {/* Photo Upload with Thumbnail Previews */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Photo Proof Attachments (Max 4 photos, &lt; 5MB each)
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/50">
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold">Upload Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                </label>

                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Dispatching Incident to Davanagere City Portal...' : 'Submit Incident Report'}
            </button>
          </form>
        </div>
      )}

      {/* 2. MY SUBMITTED REPORTS TAB */}
      {activeTab === 'my-reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">My Incident Report History</h2>
            <span className="text-xs text-slate-500">{myIncidents.length} total reports filed</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your reports...</div>
          ) : myIncidents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Incidents Reported Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Whenever you report road hazards, water leaks, or streetlight outages in Davanagere, you can track their official municipal progress here.
              </p>
              <button
                onClick={() => setActiveTab('report')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                File Your First Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myIncidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {incident.incident_number}
                      </span>
                      <span className="text-xs text-slate-500">Ward {incident.ward_id}</span>
                    </div>
                    <StatusBadge status={incident.status} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{incident.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{incident.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      {incident.landmark_address}
                    </span>
                    <button className="text-blue-600 font-semibold flex items-center gap-1">
                      Inspect Timeline <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. NEARBY FEED TAB */}
      {activeTab === 'nearby' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Active Davanagere Community Feed</h2>
            <span className="text-xs text-slate-500">{allIncidents.length} active incidents</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allIncidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-subtle transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {incident.incident_number}
                    </span>
                    <StatusBadge status={incident.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{incident.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{incident.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVouch(incident.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-semibold border border-slate-200 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{incident.upvotes_count || 1} Vouches</span>
                  </button>
                  <span className="text-slate-400">Ward {incident.ward_id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onVouch={handleVouch}
          onAddComment={async (id, text) => {
            const res = await api.createIncident; // or comment API
            loadData();
          }}
          currentUser={user}
        />
      )}
    </div>
  );
}
