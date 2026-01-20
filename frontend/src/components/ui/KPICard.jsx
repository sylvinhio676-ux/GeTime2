import React from 'react';

export default function KPICard({ title, value, delta, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: 'text-primary',
    success: 'text-success',
    danger: 'text-danger',
    accent: 'text-accent',
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {typeof delta !== 'undefined' && (
            <p className={`mt-2 text-sm ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
            </p>
          )}
        </div>

        {Icon && <Icon className={`w-8 h-8 ${colorMap[color] || 'text-primary'}`} />}
      </div>

      <div className="mt-3">
        <svg className="w-full h-10" viewBox="0 0 100 20" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2"
            points="0,15 20,10 40,12 60,6 80,9 100,4"
            strokeOpacity="0.15"
          />
        </svg>
      </div>
    </div>
  );
}
