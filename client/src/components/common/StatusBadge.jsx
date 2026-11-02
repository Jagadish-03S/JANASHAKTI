import React from 'react';
import { INCIDENT_STATUSES } from '../../utils/constants';

export default function StatusBadge({ status }) {
  const config = INCIDENT_STATUSES[status] || {
    label: status,
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}

