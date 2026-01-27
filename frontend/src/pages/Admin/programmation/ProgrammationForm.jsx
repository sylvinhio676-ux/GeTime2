import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { programmationService } from '@/services/programmationService';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  DoorOpen
} from 'lucide-react';

export default function ProgrammationForm({ 
  initialData = null, 
  subjects = [], 
  campuses = [],
  rooms = [],
  availableSubjects = [],
  onSubmit, 
  onCancel, 
  isLoading = false,
  formError = ''
}) {
  const [formData, setFormData] = useState({
    day: '',
    hour_star: '',
    hour_end: '',
    subject_id: '',
    campus_id: '',
    room_id: '',
    status: 'draft',
  });

  const [errors, setErrors] = useState({});
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState({ current: null, reason: null, suggestions: [] });

  useEffect(() => {
    if (initialData) {
      const campusId = initialData.campus_id || initialData.room?.campus_id || '';
      setFormData({
        day: initialData.day || '',
        hour_star: initialData.hour_star || '',
        hour_end: initialData.hour_end || '',
        subject_id: initialData.subject_id || '',
        campus_id: campusId,
        room_id: initialData.room_id || '',
        status: initialData.status || 'draft',
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
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

  useEffect(() => {
    const hasSubject = Boolean(formData.subject_id);
    const hasCampus = Boolean(formData.campus_id);
    if (!hasSubject || !hasCampus) {
      setSuggestion({ current: null, reason: null, suggestions: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const payload = {
          subject_id: formData.subject_id,
          campus_id: formData.campus_id,
        };

        if (formData.day && formData.hour_star && formData.hour_end) {
          payload.day = formData.day;
          payload.hour_star = formData.hour_star;
          payload.hour_end = formData.hour_end;
        }

        if (selectedSubject?.specialty_id) {
          payload.specialty_ids = [selectedSubject.specialty_id];
        }

        if (initialData?.id) {
          payload.exclude_id = initialData.id;
        }

        const data = await programmationService.suggest(payload);
        setSuggestion(data || { current: null, reason: null, suggestions: [] });

        if (data?.current && !formData.room_id) {
          setFormData((prev) => ({
            ...prev,
            room_id: data.current.room_id || prev.room_id,
          }));
        }
      } catch (error) {
        const message = error?.message || error?.error || 'Suggestions indisponibles';
        setSuggestion({ current: null, reason: message, suggestions: [] });
      } finally {
        setIsSuggesting(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    formData.subject_id,
    formData.campus_id,
    formData.day,
    formData.hour_star,
    formData.hour_end,
    initialData?.id,
    selectedSubject?.specialty_id,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.errors) setErrors(error.errors);
    }
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="flex items-start gap-2 rounded-2xl border border-delta-negative/20 bg-delta-negative/10 px-4 py-3 text-xs font-semibold text-delta-negative">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}
      
      {/* --- JOUR ET MATIÈRE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Jour de la semaine *</label>
          <select 
            name="day" 
            value={formData.day}
            onChange={handleChange}
            className={`${inputClasses('day')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Choisir un jour --</option>
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
          {errors.day && <p className="text-delta-negative text-[10px] font-bold mt-1 ml-1">{errors.day[0]}</p>}
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}><BookOpen className="w-3.5 h-3.5 text-muted-foreground" /> Matière *</label>
          <select 
            name="subject_id" 
            value={formData.subject_id}
            onChange={handleChange}
            className={`${inputClasses('subject_id')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Sélectionner --</option>
            {subjectOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.subject_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>
      </div>

      {/* --- CRÉNEAU HORAIRE --- */}
      <div className="bg-muted/50 p-4 rounded-[2rem] border border-border/60">
        <label className={labelClasses}><Clock className="w-3.5 h-3.5 text-muted-foreground" /> Plage Horaire</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <input
              type="time"
              name="hour_star"
              value={formData.hour_star}
              onChange={handleChange}
              className={inputClasses('hour_star')}
              required
            />
          </div>
          <div className="space-y-1">
            <input
              type="time"
              name="hour_end"
              value={formData.hour_end}
              onChange={handleChange}
              className={inputClasses('hour_end')}
              required
            />
          </div>
        </div>
      </div>

      {/* --- CAMPUS & SALLE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><GraduationCap className="w-3.5 h-3.5 text-muted-foreground" /> Campus *</label>
          <select 
            name="campus_id" 
            value={formData.campus_id}
            onChange={handleChange}
            className={`${inputClasses('campus_id')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Sélectionner --</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>{campus.campus_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}><DoorOpen className="w-3.5 h-3.5 text-muted-foreground" /> Salle (auto si vide)</label>
          <select 
            name="room_id" 
            value={formData.room_id}
            onChange={handleChange}
            className={`${inputClasses('room_id')} appearance-none cursor-pointer`}
          >
            <option value="">-- Auto assignation --</option>
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>{room.code} • {room.capacity} places</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>
      </div>

      {/* --- SUGGESTIONS --- */}
      <div className="rounded-[2rem] border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
            Suggestions intelligentes
          </div>
          {isSuggesting && (
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyse en cours...
            </div>
          )}
        </div>

        {suggestion.reason && (
          <div className="text-xs font-semibold text-delta-negative">
            {suggestion.reason}
          </div>
        )}

        {suggestion.current && (
          <div className="rounded-xl border border-delta-positive/20 bg-delta-positive/10 px-4 py-3 text-xs font-semibold text-delta-positive">
            Créneau OK • {suggestion.current.day} {suggestion.current.hour_star}-{suggestion.current.hour_end} • Salle {suggestion.current.room_label}
          </div>
        )}

        {suggestion.suggestions?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestion.suggestions.map((s, index) => (
              <div key={`${s.day}-${s.hour_star}-${index}`} className="rounded-2xl border border-border bg-muted px-4 py-3">
                <div className="text-xs font-black text-foreground/80">
                  {s.day} • {s.hour_star}-{s.hour_end}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Salle proposée: {s.room_label}</div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      day: s.day,
                      hour_star: s.hour_star,
                      hour_end: s.hour_end,
                      room_id: s.room_id,
                    }))
                  }
                  className="mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/90"
                >
                  Utiliser ce créneau
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground/80">
            Sélectionnez une matière et un campus pour obtenir des propositions.
          </div>
        )}
      </div>

      {/* --- STATUT --- */}
      <div className="space-y-1 relative group">
        <label className={labelClasses}><CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" /> Statut du planning</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`${inputClasses('status')} appearance-none cursor-pointer`}
        >
          <option value="draft">Brouillon</option>
          <option value="validated">Validé</option>
          <option value="published">Publié</option>
        </select>
        <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-primary hover text-primary-foreground rounded-2xl py-7 h-auto shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold tracking-tight text-base">
                {initialData ? 'Mettre à jour le planning' : 'Confirmer la programmation'}
              </span>
            </div>
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-border text-muted-foreground hover:bg-muted rounded-2xl py-7 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
