import React from 'react';
import { ROLES } from '../../utils/constants';

export default function RoleBadge({ role }) {
  const styles = {
    [ROLES.CITIZEN]: 'bg-blue-50 text-blue-700 border-blue-200',
    [ROLES.VOLUNTEER]: 'bg-teal-50 text-teal-700 border-teal-200',
    [ROLES.AUTHORITY]: 'bg-amber-50 text-amber-800 border-amber-200',
    [ROLES.ADMIN]: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${styles[role] || 'bg-slate-100 text-slate-800'}`}>
      {role}
    </span>
  );
}

