import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import RoleBadge from '../components/common/RoleBadge';
import IncidentMap from '../components/map/IncidentMap';
import IncidentDetailModal from '../components/common/IncidentDetailModal';
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  AlertOctagon,
  Users,
  MapPin,
  RefreshCw,
  Building2,
  FileCheck2,
  Lock,
  ArrowUpRight,
  Filter,
  Eye,
  Camera,
  Activity,
  History,
  Send,
  UserCheck,
} from 'lucide-react';
import { INCIDENT_STATUSES, ROLES, INCIDENT_CATEGORIES } from '../utils/constants';
import { DAVANAGERE_WARDS } from '../utils/davanagereData';

export default function AuthorityDashboard() {
  const { user, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'map' | 'audit'
  const [metrics, setMetrics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailModalIncident, setDetailModalIncident] = useState(null);

  // Status Update State
  const [newStatus, setNewStatus] = useState('OFFICIALLY_VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [assignedDept, setAssignedDept] = useState('dept-mcc-roads');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isAuthorized = user?.role === ROLES.AUTHORITY || user?.role === ROLES.ADMIN;
  const isAdmin = user?.role === ROLES.ADMIN;

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getAuthorityMetrics().catch(() => ({ data: null })),
      api.getIncidents().catch(() => ({ data: [] })),
      isAdmin ? api.getAuditLogs().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([metricsRes, incRes, auditRes]) => {
      if (metricsRes?.data) setMetrics(metricsRes.data);
      if (incRes?.data) setIncidents(incRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [user, activeTab]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setUpdating(true);
    try {
      const res = await api.updateIncidentStatus(selectedIncident.id, newStatus, remarks);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Incident ${selectedIncident.incident_number} status updated to ${newStatus}.`,
        });
        setSelectedIncident(null);
        setRemarks('');
        setProofPhotoUrl('');
        loadData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Status update failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update status. Please verify permissions.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDepartmentAssign = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/authority/incidents/${selectedIncident.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('janashakti_token')}`,
        },
        body: JSON.stringify({
          departmentId: assignedDept,
          officerName: assignedOfficer || user.fullName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Department dispatched successfully.' });
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Dispatch failed.' });
    } finally {
      setUpdating(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Authority Command Center Restricted</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            This module requires <RoleBadge role="AUTHORITY" /> or <RoleBadge role="ADMIN" /> role. 
            Backend RBAC authorization is strictly enforced on all triage endpoints.
          </p>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 max-w-md mx-auto">
          <span className="text-xs font-bold text-slate-700 block">
            Test as Municipal Authority or Admin Persona:
          </span>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => switchDemoRole(ROLES.AUTHORITY)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Sign In as MCC Ward Officer (Authority)
            </button>
            <button
              onClick={() => switchDemoRole(ROLES.ADMIN)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Sign In as Davanagere System Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Command Center Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-command flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
              Municipal Operations Desk
            </span>
            <RoleBadge role={user.role} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Davanagere Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mahanagara Palike Verification • PostGIS Spatial Triage • Department Work Orders
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-slate-800/90 p-1.5 rounded-2xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'triage' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Triage & Dispatch
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Spatial Map View
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              System Audit Trail ({auditLogs.length})
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      )}

      {/* KPI Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Logged</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics?.totalReports || 0}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Unverified</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{metrics?.unverifiedCount || 0}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">Confirmed</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{metrics?.communityConfirmedCount || 0}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider block">Verified</span>
          <span className="text-2xl font-black text-teal-600 mt-1 block">{metrics?.officiallyVerifiedCount || 0}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">In Progress</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{metrics?.inProgressCount || 0}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-subtle">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Resolved</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{metrics?.resolvedCount || 0}</span>
        </div>
      </div>

      {/* 1. TRIAGE & DISPATCH TAB */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Triage Queue */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Incident Triage & Verification Queue</h3>
                <p className="text-xs text-slate-500">Select any incident to inspect evidence and execute status transition</p>
              </div>
              <button onClick={loadData} className="p-2 text-slate-400 hover:text-slate-600">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {incidents.map((incident) => {
                const isSelected = selectedIncident?.id === incident.id;
                return (
                  <div
                    key={incident.id}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setNewStatus(incident.status);
                    }}
                    className={`p-5 hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {incident.incident_number}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Ward {incident.ward_id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          incident.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          incident.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {incident.priority}
                        </span>
                      </div>
                      <StatusBadge status={incident.status} />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{incident.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{incident.description}</p>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        {incident.landmark_address}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailModalIncident(incident);
                        }}
                        className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                      >
                        Inspect Evidence <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Authority Action Terminal */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-subtle p-6 space-y-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official Action Terminal</h3>
                <p className="text-xs text-slate-500">Mahanagara Palike Dispatch</p>
              </div>
              <FileCheck2 className="w-5 h-5 text-blue-600" />
            </div>

            {selectedIncident ? (
              <div className="space-y-6">
                {/* Selected Info Summary */}
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Incident:</span>
                    <span className="font-mono font-bold text-blue-700">{selectedIncident.incident_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Status:</span>
                    <StatusBadge status={selectedIncident.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Davanagere Ward:</span>
                    <span className="font-semibold text-slate-800">Ward {selectedIncident.ward_id}</span>
                  </div>
                </div>

                {/* 1. Official Status Updater */}
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Commit Official Status *
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {Object.keys(INCIDENT_STATUSES).map((k) => (
                        <option key={k} value={k}>{INCIDENT_STATUSES[k].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Remarks / Field Observation *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Field engineer on site; asphalt patching crew scheduled for tomorrow 10 AM..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {newStatus === 'RESOLVED' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Resolution Proof Photo URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://.../proof_photo.jpg"
                        value={proofPhotoUrl}
                        onChange={(e) => setProofPhotoUrl(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {updating ? 'Committing...' : 'Commit Status Transition'}
                  </button>
                </form>

                {/* 2. Department Work Order Dispatch */}
                <form onSubmit={handleDepartmentAssign} className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Assign Municipal Department</h4>
                  <select
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="dept-mcc-roads">MCC Road & Infrastructure Works</option>
                    <option value="dept-mcc-sanitation">MCC Solid Waste & Sanitation</option>
                    <option value="dept-mcc-water">MCC Water Supply & Drainage</option>
                    <option value="dept-bescom">BESCOM Davanagere Electricity Circle</option>
                    <option value="dept-police">Davanagere Traffic Police Division</option>
                    <option value="dept-fire">Karnataka Fire & Emergency Services</option>
                  </select>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Dispatch Work Order
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select any incident from the left queue to perform official verification, assign ward departments, or resolve with photographic proof.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SPATIAL MAP VIEW TAB */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <IncidentMap
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setDetailModalIncident(inc);
            }}
            height="620px"
          />
        </div>
      )}

      {/* 3. SYSTEM AUDIT TRAIL TAB (ADMIN ONLY) */}
      {activeTab === 'audit' && isAdmin && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable System Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Tamper-evident logs of all user actions, logins, status changes, and municipal assignments
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              ADMIN ONLY
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Resource / Incident</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold block">{log.actor_name}</span>
                      <span className="text-[10px] text-slate-400">{log.actor_role}</span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      {log.incident_id || log.resource_id || '-'}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{log.remarks}</td>
                    <td className="p-3 text-[11px] text-slate-400 font-mono">
                      {new Date(log.created_at || log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalIncident && (
        <IncidentDetailModal
          incident={detailModalIncident}
          onClose={() => setDetailModalIncident(null)}
          currentUser={user}
        />
      )}
    </div>
  );
}
