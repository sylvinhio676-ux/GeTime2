import React from 'react';
import { Clock } from 'lucide-react';

export default function ActivityList({ items = [] }) {
  const defaults = items.length ? items : [
    { id: 1, title: 'Nouvel enseignant ajouté', desc: 'Marc Dupuis a été ajouté au département Maths', time: 'Il y a 2h' },
    { id: 2, title: 'Salle mise à jour', desc: 'Salle 201: capacité modifiée', time: 'Aujourd\'hui' },
    { id: 3, title: 'Programme publié', desc: 'Emploi du temps 2026 publié', time: 'Hier' },
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          <p className="text-sm font-semibold text-gray-900">Activité Récente</p>
        </div>
        <p className="text-xs text-gray-500">Filtré: 30 derniers jours</p>
      </div>

      <div className="space-y-3">
        {defaults.map((it) => (
          <div key={it.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-600 font-semibold">{it.title[0]}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{it.title}</p>
              <p className="text-sm text-gray-600">{it.desc}</p>
            </div>
            <div className="text-xs text-gray-500">{it.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
