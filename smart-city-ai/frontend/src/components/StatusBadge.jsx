import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Pending': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Detected': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Assigned': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const dotColors = {
    'Pending': 'bg-red-450 bg-red-400',
    'Detected': 'bg-red-400',
    'Assigned': 'bg-amber-400',
    'Resolved': 'bg-emerald-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${dotColors[status] || 'bg-blue-450 bg-blue-450 bg-blue-400'}`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
