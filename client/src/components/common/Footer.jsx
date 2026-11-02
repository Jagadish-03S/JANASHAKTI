import React from 'react';
import { Shield, PhoneCall, Heart } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../../utils/davanagereData';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-white font-bold tracking-tight text-lg">JANASHAKTI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open civic safety and community incident reporting platform. Pilot implementation for Davanagere City Corporation (Mahanagara Palike), Karnataka.
            </p>
            <div className="text-[11px] text-teal-400 font-medium">
              Phase 1 Deliverable: Core System Skeleton & Architecture
            </div>
          </div>

          {/* Davanagere Emergency Helplines */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-400" />
              Davanagere Emergency & Municipal Helplines
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {EMERGENCY_CONTACTS.slice(0, 4).map((c) => (
                <div key={c.number} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 block font-medium">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.type}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded">
                    {c.number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Standards & Compliance */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-white uppercase tracking-wider">
              Privacy & Safeguards
            </h5>
            <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <li>• Reporter PII masked for public viewers</li>
              <li>• Public incident locations coarsened (~100m)</li>
              <li>• AI outputs advisory only (No official label)</li>
              <li>• Role-enforced authorization on status changes</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 JANASHAKTI Platform. Davanagere Municipal Pilot.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for civic empowerment
          </p>
        </div>
      </div>
    </footer>
  );
}

