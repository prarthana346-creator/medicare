import React from 'react';

const StatCard = ({ title, value, icon: Icon, changeText, trend = 'up', color = 'blue' }) => {
  const colorMap = {
    blue: {
      bg: 'bg-medicare-50 text-medicare-600 border-medicare-100',
      iconBg: 'bg-medicare-600 text-white',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
    },
    cyan: {
      bg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      iconBg: 'bg-cyan-600 text-white',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      iconBg: 'bg-amber-600 text-white',
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h4>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${selectedColor.iconBg}`}>
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>
      </div>
      {changeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={`font-semibold mr-1.5 ${trend === 'up' ? 'text-emerald-600' : 'text-slate-500'}`}>
            {changeText}
          </span>
          <span className="text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

