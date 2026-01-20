import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DEFAULT_SLOTS = [
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '13:00', end: '15:00' },
  { start: '15:00', end: '17:00' },
];

function timeToMinutes(time) {
  const [h, m] = (time || '00:00').split(':').map(Number);
  return h * 60 + m;
}

export default function TimetableGrid({ programmations = [], onCreate, onEdit, onDelete, readOnly = false }) {
  const timeSlots = useMemo(() => {
    const slots = programmations.map((p) => ({ start: p.hour_star, end: p.hour_end }));
    const unique = new Map();
    DEFAULT_SLOTS.forEach((s) => {
      unique.set(`${s.start}-${s.end}`, s);
    });
    slots.forEach((s) => {
      if (s.start && s.end) unique.set(`${s.start}-${s.end}`, s);
    });
    return Array.from(unique.values()).sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }, [programmations]);

  const grouped = useMemo(() => {
    const map = new Map();
    programmations.forEach((p) => {
      const key = `${p.day}-${p.hour_star}-${p.hour_end}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return map;
  }, [programmations]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted text-muted-foreground text-[10px] uppercase font-black tracking-widest">
            <th className="px-4 py-3 text-left w-32">Horaire</th>
            {DAYS.map((day) => (
              <th key={day} className="px-3 py-3 text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={`${slot.start}-${slot.end}`} className="border-b border-border/60">
              <td className="px-4 py-4 text-xs font-bold text-muted-foreground">
                {slot.start} - {slot.end}
              </td>
              {DAYS.map((day) => {
                const key = `${day}-${slot.start}-${slot.end}`;
                const items = grouped.get(key) || [];
                const item = items[0];
                const bg = item?.subject?.color || 'var(--muted)';

                return (
                  <td key={key} className="px-2 py-2">
                    <div
                      className="relative group min-h-[90px] rounded-xl border border-border/60 shadow-sm"
                      style={{ backgroundColor: item ? bg : 'var(--background)' }}
                    >
                      {!item && !readOnly && (
                        <button
                          onClick={() => onCreate?.({ day, hour_star: slot.start, hour_end: slot.end })}
                          className="absolute inset-0 flex items-center justify-center text-muted-foreground/80 hover:text-muted-foreground"
                          type="button"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}

                      {item && !readOnly && (
                        <button
                          onClick={() => onEdit?.(item)}
                          type="button"
                          className="absolute inset-0 flex flex-col justify-between p-3 text-left"
                        >
                          <div className="flex items-start justify-between">
                            <div className="text-[11px] font-extrabold text-foreground">
                              {item.subject?.subject_name || 'Matiere'}
                            </div>
                            <span className="text-[9px] font-black text-foreground/80/70">
                              {item.room?.code || 'Salle'}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-foreground/80/80">
                            {item.subject?.teacher?.user?.name || 'Enseignant'}
                          </div>
                        </button>
                      )}

                      {item && readOnly && (
                        <div className="absolute inset-0 flex flex-col justify-between p-3 text-left">
                          <div className="flex items-start justify-between">
                            <div className="text-[11px] font-extrabold text-foreground">
                              {item.subject?.subject_name || 'Matiere'}
                            </div>
                            <span className="text-[9px] font-black text-foreground/80/70">
                              {item.room?.code || 'Salle'}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-foreground/80/80">
                            {item.subject?.teacher?.user?.name || 'Enseignant'}
                          </div>
                        </div>
                      )}

                      {item && !readOnly && (
                        <button
                          onClick={() => onDelete?.(item)}
                          type="button"
                          className="absolute -top-2 -left-2 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-delta-negative text-primary-foreground shadow-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {items.length > 1 && (
                        <div className="absolute bottom-2 right-2 text-[9px] font-black text-foreground/80/70">
                          +{items.length - 1}
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
