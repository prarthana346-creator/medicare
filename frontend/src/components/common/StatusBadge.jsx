import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (normalized === 'scheduled') {
    styles = 'bg-sky-50 text-sky-700 border-sky-200/80';
    dotColor = 'bg-sky-500';
  } else if (normalized === 'completed' || normalized === 'paid') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (normalized === 'cancelled') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (normalized === 'pending' || normalized === 'in progress') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'available') {
    styles = 'bg-teal-50 text-teal-700 border-teal-200/80';
    dotColor = 'bg-teal-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;

