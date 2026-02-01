import { Plus, Trash2, Pencil } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DEFAULT_SLOTS = [
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '13:00', end: '15:00' },
  { start: '15:00', end: '17:00' },
];

/**
 * Transforme "08:00:00" ou "08:00" en minutes
 */
function timeToMinutes(time) {
  if (!time) return 0;
  // On split et on ne prend que les deux premiers éléments pour ignorer les secondes
  const parts = time.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

const formatTime = (time) => {
  if (!time) return '';
  return time.substring(0, 5); // Plus robuste que length > 5
};

export default function TimetableGrid({ programmations = [], onCreate, onEdit, onDelete, readOnly = false }) {
  
  // Debug pour vérifier ce qui arrive réellement du serveur
  // console.log("Données reçues par la Grid:", programmations);

  const timeSlots = DEFAULT_SLOTS;

  const findProgrammationsForSlot = (day, slotStart, slotEnd) => {
    // On convertit les créneaux de la grille (ex: "08:00") en minutes
    const sStart = timeToMinutes(slotStart);
    const sEnd = timeToMinutes(slotEnd);

    return programmations.filter(p => {
      if(p.day == "Vendredi"){
        console.log(`Test Vendredi: Slot[${slotStart}-${slotEnd}] vs BDD[${p.hour_star}-${p.hour_end}]`);
      }
      // 1. Comparaison du jour (Nettoyage des espaces et casse)
      if (String(p.day).trim().toLowerCase() !== String(day).trim().toLowerCase()) {
          return false;
      }
      
      // 2. Nettoyage des heures de la BDD (on ne garde que HH:mm)
      // p.hour_star peut être "08:00:00" -> on veut "08:00"
      const cleanDbStart = p.hour_star.substring(0, 5);
      const cleanDbEnd = p.hour_end.substring(0, 5);

      const pStart = timeToMinutes(cleanDbStart);
      const pEnd = timeToMinutes(cleanDbEnd);

      // 3. Logique d'inclusion
      // Un créneau de la grille (8h-10h) s'affiche si :
      // - Il commence en même temps ou après le début du cours
      // - Il finit en même temps ou avant la fin du cours
      const isInside = (sStart >= pStart && sEnd <= pEnd);
      
      return isInside;
    });
  };

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
              <td className="px-4 py-4 text-xs font-bold text-muted-foreground bg-muted/10">
                {slot.start} - {slot.end}
              </td>
              {DAYS.map((day) => {
                const items = findProgrammationsForSlot(day, slot.start, slot.end);
                const item = items[0];
                
                // On récupère la couleur depuis le sujet, sinon gris par défaut
                const bg = item?.subject?.color || '#e2e8f0';

                return (
                  <td key={`${day}-${slot.start}`} className="px-2 py-2">
                    <div
                      className="relative group min-h-[90px] min-w-[130px] rounded-xl border border-border/60 shadow-sm transition-all overflow-hidden bg-background"
                      style={item ? { 
                        backgroundColor: bg,
                        borderLeft: `4px solid ${item.status === 'published' ? '#10b981' : '#f59e0b'}` 
                      } : {}}
                    >
                      {!item && !readOnly && (
                        <button
                          onClick={() => onCreate?.({ day, hour_star: slot.start, hour_end: slot.end })}
                          className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 hover:text-primary hover:bg-muted/20 transition-all"
                          type="button"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}

                      {item && (
                        <div
                          onClick={() => !readOnly && onEdit?.(item)}
                          className={`absolute inset-0 flex flex-col justify-between p-3 text-left ${!readOnly ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="text-[11px] font-extrabold text-slate-900 leading-tight line-clamp-2 uppercase">
                              {item.subject?.subject_name || 'Sans titre'}
                            </div>
                            
                            {item.status === 'published' && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black px-1.5 py-0.5 bg-white/50 rounded text-slate-700 uppercase">
                                {item.room?.code || 'Salle ?'}
                              </span>
                              <span className="text-[8px] font-bold text-slate-600/60">
                                {formatTime(item.hour_star)}-{formatTime(item.hour_end)}
                              </span>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-700 truncate">
                              {item.subject?.teacher?.user?.name || 'Prof. ?'}
                            </div>
                          </div>
                        </div>
                      )}

                      {item && !readOnly && (
                        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
                            type="button"
                            className="group flex items-center justify-center w-6 h-6 rounded-full bg-white/90 text-slate-700 shadow-lg hover:bg-white hover:scale-110 transition-all"
                          >
                            <Pencil className="w-3 h-3 text-muted-foreground/80 group-hover:text-primary" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}
                            type="button"
                            className="group flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white shadow-lg hover:scale-110 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
