import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Activity, Database, MapPin, Radio } from 'lucide-react';

export default function HealthWidget() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isConnected: socketConnected } = useSocket();

  useEffect(() => {
    api.getHealth()
      .then(res => setHealth(res))
      .catch(err => setHealth({ status: 'OFFLINE', error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const isHealthy = health?.status === 'OPERATIONAL';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">System & Pilot Telemetry</h4>
            <p className="text-xs text-slate-500">Davanagere City Corporation (MCC)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            isHealthy ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {loading ? 'Checking...' : health?.status || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-lg">
          <span className="text-slate-500 block mb-1">City Node</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {health?.pilotDeployment?.city || 'Davanagere'} (45 Wards)
          </span>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg">
          <span className="text-slate-500 block mb-1">Database Engine</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            {health?.database?.engine || 'PostGIS / Memory'}
          </span>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg">
          <span className="text-slate-500 block mb-1">Socket.IO Gateway</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            {socketConnected ? 'Connected (Live)' : 'Standby / Polling'}
          </span>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg">
          <span className="text-slate-500 block mb-1">System Uptime</span>
          <span className="font-semibold text-slate-800 font-mono">
            {health?.uptimeSeconds ? `${health.uptimeSeconds}s active` : 'Active'}
          </span>
        </div>
      </div>
    </div>
  );
}

