import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

const SHIFTS = {
  morning: {
    key: 'morning',
    label: 'Matin (08h00-12h00)',
    ranges: [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
    ],
  },
  afternoon: {
    key: 'afternoon',
    label: 'Après-midi (13h00-17h00)',
    ranges: [
      { start: '13:00', end: '15:00' },
      { start: '15:00', end: '17:00' },
    ],
  },
  fullday: {
    key: 'fullday',
    label: 'Toute la journée',
    ranges: [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '13:00', end: '15:00' },
      { start: '15:00', end: '17:00' },
    ],
  },
};

export default function DisponibilityForm({
  initialData = null,
  subjects = [],
  availableSubjects = [],
  etablishments = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  // Initialisation sécurisée pour éviter les cascading renders
  const [formData, setFormData] = useState(() => ({
    day: initialData?.day || '',
    hour_star: initialData?.hour_star || '08:00',
    hour_end: initialData?.hour_end || '10:00',
    subject_id: initialData?.subject_id || '',
    etablishment_id: initialData?.etablishment_id || '',
  }));

  const [selectedShift, setSelectedShift] = useState(() => {
    if (initialData) {
      const found = Object.values(SHIFTS).find((s) =>
        s.ranges.some(r => r.start === initialData.hour_star && r.end === initialData.hour_end)
      );
      return found ? found.key : 'morning';
    }
    return 'morning';
  });

  const [errors, setErrors] = useState({});

  // Récupération de la spécialité (ce que j'avais oublié)
  const selectedSubject = subjects.find(
    (s) => String(s.id) === String(formData.subject_id)
  );
  const selectedSpecialtyLabel =
    selectedSubject?.specialty?.specialty_name ||
    selectedSubject?.specialties?.specialty_name ||
    '';

  const handleShiftChange = (shiftKey) => {
    const shift = SHIFTS[shiftKey];
    if (!shift) return;
    setSelectedShift(shiftKey);
    setFormData((prev) => ({
      ...prev,
      hour_star: shift.ranges[0].start,
      hour_end: shift.ranges[0].end,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const shift = SHIFTS[selectedShift];
      const entries = shift.ranges.map((range) => ({
        ...formData,
        hour_star: range.start,
        hour_end: range.end,
      }));

      // Envoi segmenté
      await onSubmit(initialData ? entries[0] : entries);

      if (!initialData) {
        setFormData({ day: '', hour_star: '08:00', hour_end: '10:00', subject_id: '', etablishment_id: '' });
        setSelectedShift('morning');
      }
    } catch (error) {
      if (error.errors) setErrors(error.errors);
    }
  };

  const subjectOptions = useMemo(() => {
    const base = availableSubjects.length ? availableSubjects : subjects;
    if (!initialData?.subject_id) return base;
    if (base.some(s => String(s.id) === String(initialData.subject_id))) return base;
    const fallback = subjects.find(s => String(s.id) === String(initialData.subject_id));
    return fallback ? [...base, fallback] : base;
  }, [availableSubjects, subjects, initialData]);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-auto p-1">
      {/* JOUR */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Jour *</label>
        <select
          name="day"
          value={formData.day}
          onChange={handleChange}
          className={`w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card ${
            errors.day ? 'border-red-400' : 'border-border'
          }`}
          required
        >
          <option value="">Sélectionner un jour</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.day && <p className="text-red-500 text-[11px] font-bold ml-1">{errors.day[0]}</p>}
      </div>

      {/* TRANCHE HORAIRE */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Tranche horaire *</label>
        <div className="flex flex-wrap gap-3">
          {Object.values(SHIFTS).map((shift) => (
            <label
              key={shift.key}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-2xl border transition-all cursor-pointer text-sm font-semibold text-center ${
                selectedShift === shift.key ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-foreground'
              }`}
            >
              <input type="radio" className="hidden" checked={selectedShift === shift.key} onChange={() => handleShiftChange(shift.key)} />
              {shift.label}
            </label>
          ))}
        </div>
      </div>

      {/* MATIÈRE */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Matière *</label>
        <select
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          className={`w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm ${errors.subject_id ? 'border-red-400' : 'border-border'}`}
          required
        >
          <option value="">Sélectionner une matière</option>
          {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
        </select>
        {errors.subject_id && <p className="text-red-500 text-[11px] font-bold ml-1">{errors.subject_id[0]}</p>}
      </div>

      {/* SPÉCIALITÉ (REMIS EN PLACE) */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Spécialité concernée</label>
        <input
          type="text"
          value={selectedSpecialtyLabel || '-'}
          readOnly
          className="w-full px-4 py-3.5 rounded-2xl border bg-slate-100 text-sm text-muted-foreground cursor-not-allowed"
        />
      </div>

      {/* ETABLISSEMENT */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">Etablissement *</label>
        <select
          name="etablishment_id"
          value={formData.etablishment_id}
          onChange={handleChange}
          className={`w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm ${errors.etablishment_id ? 'border-red-400' : 'border-border'}`}
          required
        >
          <option value="">Sélectionner un établissement</option>
          {etablishments.map((e) => <option key={e.id} value={e.id}>{e.etablishment_name}</option>)}
        </select>
        {errors.etablishment_id && <p className="text-red-500 text-[11px] font-bold ml-1">{errors.etablishment_id[0]}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-[2] rounded-2xl py-6 shadow-lg shadow-primary/20" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer les disponibilités'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1 rounded-2xl py-6">Annuler</Button>
      </div>
    </form>
  );
}