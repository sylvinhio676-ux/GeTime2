import React from 'react';

export default function ChartPlaceholder({ title = 'Graphique', subtitle = '' }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className="text-sm text-gray-500">Derniers 7 jours</div>
      </div>

      <div className="w-full h-48 bg-gradient-to-b from-white to-gray-50 rounded-md flex items-center justify-center">
        <svg className="w-full h-full p-4" viewBox="0 0 200 80" preserveAspectRatio="none">
          <polyline fill="none" stroke="#0B1F4B" strokeWidth="3" points="0,60 30,45 60,50 90,30 120,35 150,20 180,25 200,10" strokeOpacity="0.9" />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full" /> <span>Utilisation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-success rounded-full" /> <span>Croissance</span>
        </div>
      </div>
    </div>
  );
}
