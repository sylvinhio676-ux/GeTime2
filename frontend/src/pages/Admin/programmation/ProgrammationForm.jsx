import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { programmationService } from '@/services/programmationService';
import { 
  Calendar, Clock, BookOpen, ChevronDown, Loader2, CheckCircle2,
  AlertCircle, GraduationCap, DoorOpen
} from 'lucide-react';

export default function ProgrammationForm({ 
  initialData = null, subjects = [], campuses = [], rooms = [],
  availableSubjects = [], onSubmit, onCancel, isLoading = false, formError = ''
}) {
  const [formData, setFormData] = useState({
    day: '', hour_star: '', hour_end: '', subject_id: '',
    campus_id: '', room_id: '', status: 'draft',
  });

  const [errors, setErrors] = useState({});
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState({ current: null, reason: null, suggestions: [] });

  useEffect(() => {
    if (initialData) {
      const campusId = initialData.campus_id || initialData.room?.campus_id || '';
      setFormData({
        day: initialData.day || '', hour_star: initialData.hour_star || '',
        hour_end: initialData.hour_end || '', subject_id: initialData.subject_id || '',
        campus_id: campusId, room_id: initialData.room_id || '', status: initialData.status || 'draft',
      });
    }
  }, [initialData]);

  const addMinutes = (time, minutesToAdd) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutesToAdd;
    const clamped = Math.min(total, 17 * 60);
    const hh = String(Math.floor(clamped / 60)).padStart(2, '0');
    const mm = String(clamped % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'hour_star' && !prev.hour_end) {
        next.hour_end = addMinutes(value, 120);
      }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const selectedSubject = useMemo(
    () => subjects.find((s) => String(s.id) === String(formData.subject_id)),
    [subjects, formData.subject_id]
  );

  const subjectOptions = useMemo(() => {
    const pool = availableSubjects.length ? availableSubjects : subjects;
    const subjectId = initialData?.subject_id;
    if (!subjectId) return pool;
    const alreadyIncluded = pool.some((s) => String(s.id) === String(subjectId));
    if (alreadyIncluded) return pool;
    const selected = subjects.find((s) => String(s.id) === String(subjectId));
    return selected ? [...pool, selected] : pool;
  }, [availableSubjects, subjects, initialData?.subject_id]);

  // --- LE MOTEUR DE CORRECTION ICI ---
  useEffect(() => {
    const { day, hour_star, hour_end, subject_id } = formData;
    // On déclenche la recherche dès qu'on a le trio Day + Hour + Subject
    if (!day || !hour_star || !hour_end || !subject_id) {
      setSuggestion({ current: null, reason: null, suggestions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const payload = {
          subject_id, day, hour_star, hour_end,
          campus_id: formData.campus_id || null, // Campus optionnel pour la recherche globale
          exclude_id: initialData?.id
        };

        const data = await programmationService.suggest(payload);
        setSuggestion(data || { current: null, reason: null, suggestions: [] });

        // AUTO-REMPLISSAGE : Si le système trouve une salle, on remplit Campus et Salle
        if (data?.current && !formData.room_id) {
          setFormData(prev => ({
            ...prev,
            room_id: data.current.room_id,
            campus_id: data.current.campus_id // LE CAMPUS SE REMPLIT SEUL
          }));
        }
      }  catch (error) {
        // AJOUTE CE CONSOLE LOG POUR VOIR L'ERREUR DANS LA CONSOLE (F12)
        console.error("ERREUR SERVEUR :", error.response?.data || error.message);
        
        // Affiche le message d'erreur réel du serveur s'il existe
        const serverMessage = error.response?.data?.error || error.response?.data?.message || "Erreur suggestions";
        setSuggestion({ current: null, reason: serverMessage, suggestions: [] });
}
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.day, formData.hour_star, formData.hour_end, formData.subject_id]);

  const filteredRooms = useMemo(() => {
    if (!formData.campus_id) return rooms;
    return rooms.filter((room) => String(room.campus_id) === String(formData.campus_id));
  }, [rooms, formData.campus_id]);

  const inputClasses = (name) => `
    w-full px-4 py-3 border bg-muted/50 rounded-2xl text-sm transition-all focus:bg-card focus:outline-none focus:ring-4
    ${errors[name] ? 'border-delta-negative/40 focus:ring-delta-negative/20' : 'border-border focus:ring-muted/60 focus:border-border/80'}
  `;

  const labelClasses = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1 mb-2";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
      {formError && (
        <div className="flex items-start gap-2 rounded-2xl border border-delta-negative/20 bg-delta-negative/10 px-4 py-3 text-xs font-semibold text-delta-negative">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Jour de la semaine *</label>
          <select name="day" value={formData.day} onChange={handleChange} className={`${inputClasses('day')} appearance-none cursor-pointer`} required>
            <option value="">-- Choisir un jour --</option>
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}><BookOpen className="w-3.5 h-3.5 text-muted-foreground" /> Matière *</label>
          <select name="subject_id" value={formData.subject_id} onChange={handleChange} className={`${inputClasses('subject_id')} appearance-none cursor-pointer`} required>
            <option value="">-- Sélectionner --</option>
            {subjectOptions.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-[2rem] border border-border/60">
        <label className={labelClasses}><Clock className="w-3.5 h-3.5 text-muted-foreground" /> Plage Horaire</label>
        <div className="grid grid-cols-2 gap-4">
          <input type="time" name="hour_star" value={formData.hour_star} onChange={handleChange} className={inputClasses('hour_star')} required />
          <input type="time" name="hour_end" value={formData.hour_end} onChange={handleChange} className={inputClasses('hour_end')} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><GraduationCap className="w-3.5 h-3.5 text-muted-foreground" /> Campus *</label>
          <select name="campus_id" value={formData.campus_id} onChange={handleChange} className={`${inputClasses('campus_id')} appearance-none cursor-pointer`} required>
            <option value="">-- Sélectionner --</option>
            {campuses.map(c => <option key={c.id} value={c.id}>{c.campus_name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}><DoorOpen className="w-3.5 h-3.5 text-muted-foreground" /> Salle (auto si vide)</label>
          <select name="room_id" value={formData.room_id} onChange={handleChange} className={`${inputClasses('room_id')} appearance-none cursor-pointer`}>
            <option value="">-- Auto assignation --</option>
            {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.code} • {r.capacity} places</option>)}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>
      </div>

      {/* SUGGESTIONS (Exactement ton design) */}
      <div className="rounded-[2rem] border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Suggestions intelligentes</div>
          {isSuggesting && <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Analyse...</div>}
        </div>
        {suggestion.reason && <div className="text-xs font-semibold text-delta-negative">{suggestion.reason}</div>}
        {suggestion.current && (
          <div className="rounded-xl border border-delta-positive/20 bg-delta-positive/10 px-4 py-3 text-xs font-semibold text-delta-positive">
            Créneau OK • {suggestion.current.day} {suggestion.current.hour_star}-{suggestion.current.hour_end} • Salle {suggestion.current.room_label}
          </div>
        )}
        {suggestion.suggestions?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestion.suggestions.map((s, index) => (
              <div key={index} className="rounded-2xl border border-border bg-muted px-4 py-3">
                <div className="text-xs font-black text-foreground/80">{s.day} • {s.hour_star}-{s.hour_end}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Salle: {s.room_label}</div>
                <button type="button" onClick={() => setFormData(prev => ({...prev, day: s.day, hour_star: s.hour_star, hour_end: s.hour_end, room_id: s.room_id, campus_id: s.campus_id}))} className="mt-2 text-[10px] font-black uppercase text-primary">Utiliser ce créneau</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1 relative group">
        <label className={labelClasses}><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" /> Statut</label>
        <select name="status" value={formData.status} onChange={handleChange} className={inputClasses('status')}>
          <option value="draft">Brouillon</option>
          <option value="validated">Validé</option>
          <option value="published">Publié</option>
        </select>
        <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-[2] bg-primary hover text-primary-foreground rounded-2xl py-7 h-auto shadow-xl">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /><span className="font-bold text-base">{initialData ? 'Mettre à jour' : 'Confirmer'}</span></div>}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1 border-border text-muted-foreground rounded-2xl py-7 h-auto font-bold">Annuler</Button>
      </div>
    </form>
  );
}