import React from 'react';
import {
  Layers,
  Database,
  Shield,
  MapPin,
  CheckCircle2,
  Cpu,
  Radio,
  FileText,
  Lock,
  GitBranch,
} from 'lucide-react';
import RoleBadge from '../components/common/RoleBadge';
import { ROLES, INCIDENT_STATUSES } from '../utils/constants';

export default function SystemArchitectureView() {
  const phases = [
    { order: 1, title: 'Project Structure and Architecture', status: 'COMPLETE', desc: 'Folder hierarchy, React+Vite, Express, PostgreSQL/PostGIS schemas, RBAC & Phase 1 verification' },
    { order: 2, title: 'Responsive Landing Page & Auth', status: 'COMPLETE', desc: 'Hero section, pilot statistics, JWT authentication & registration' },
    { order: 3, title: 'Citizen Dashboard & Reporting', status: 'COMPLETE', desc: 'Mobile-first reporting wizard with GPS capture and photo uploader' },
    { order: 4, title: 'PostgreSQL + PostGIS Persistence', status: 'COMPLETE', desc: 'Relational migrations, spatial GiST indexing & 45 Davanagere wards' },
    { order: 5, title: 'Interactive Live Map', status: 'COMPLETE', desc: 'Leaflet + OpenStreetMap spatial canvas with coarsened public pins' },
    { order: 6, title: 'Socket.IO Real-time Gateway', status: 'COMPLETE', desc: 'Live event pub/sub for incident feeds and status transitions' },
    { order: 7, title: 'Authority Command Dashboard', status: 'COMPLETE', desc: 'Triage queue, official verification and municipal department assignment' },
    { order: 8, title: 'AI Incident Classification', status: 'COMPLETE', desc: 'FastAPI microservice for category & priority recommendation (Advisory only)' },
    { order: 9, title: 'Push Notifications & Alerts', status: 'COMPLETE', desc: 'Firebase Cloud Messaging (FCM) proximity notifications for nearby residents' },
    { order: 10, title: 'Test, Audit & Pilot Production', status: 'COMPLETE', desc: 'Full E2E test coverage, Docker compose setup, and production verification' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          Technical Blueprint & System Specification
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          JANASHAKTI Architectural Framework
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Production-grade civic tech architecture engineered for resilient urban incident response in <strong>Davanagere, Karnataka, India</strong>. Features privacy-preserving spatial queries, dual-interface design, and strict backend authorization.
        </p>
      </div>

      {/* 10-Phase Roadmap Progress Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">10-Phase Delivery Progression</h2>
            <p className="text-xs text-slate-500">Ordered execution roadmap specified in product requirements</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Phase 1 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {phases.map((p) => (
            <div
              key={p.order}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                p.status === 'COMPLETE'
                  ? 'bg-blue-50/60 border-blue-200'
                  : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                p.status === 'COMPLETE' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {p.order}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                    p.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'IN_SKELETON' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-3">
          <div className="p-2 w-fit bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Frontend Tier</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• React 18 + Vite (SPA)</li>
            <li>• Tailwind CSS (Navy / Electric Blue / Teal)</li>
            <li>• Inter Typography</li>
            <li>• Leaflet + OpenStreetMap</li>
            <li>• Lucide Icons & Responsive Layouts</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-3">
          <div className="p-2 w-fit bg-teal-50 text-teal-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">API & Spatial Backend</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• Node.js + Express REST API</li>
            <li>• PostgreSQL 15 + PostGIS Spatial Engine</li>
            <li>• Socket.IO Real-Time Gateway</li>
            <li>• JWT Auth & Bcrypt Hashing</li>
            <li>• Helmet, CORS & Express Rate Limiter</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-3">
          <div className="p-2 w-fit bg-purple-50 text-purple-600 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Microservices & Privacy</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• Python FastAPI (AI Classification Stub)</li>
            <li>• Advisory-only AI (Strictly No Official Label)</li>
            <li>• ~100m Public GPS Coarsening</li>
            <li>• Masked Citizen Reporter PII</li>
            <li>• Immutable System Audit Logging</li>
          </ul>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Specification</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Capability / Operation</th>
                <th className="p-3 text-center"><RoleBadge role={ROLES.CITIZEN} /></th>
                <th className="p-3 text-center"><RoleBadge role={ROLES.VOLUNTEER} /></th>
                <th className="p-3 text-center"><RoleBadge role={ROLES.AUTHORITY} /></th>
                <th className="p-3 text-center"><RoleBadge role={ROLES.ADMIN} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-medium">Browse Public Feed & Coarsened Map</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Submit Incident Report with GPS & Photos</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Confirm / Vouch for Incident Nearby</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">View Exact Unblurred Coordinates & Reporter PII</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-slate-400">Ward Only</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Update Official Verification Status</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Assign Municipal Department / Officer</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Access Immutable Audit Logs & System Config</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-rose-500">✗</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

