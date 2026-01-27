import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

const SHIFTS = {
  morning: {
    key: 'morning',
    label: 'Matin (08h00-12h00)',
    ranges: [{ start: '08:00', end: '12:00' }],
  },
  afternoon: {
    key: 'afternoon',
    label: 'Après-midi (13h00-17h00)',
    ranges: [{ start: '13:00', end: '17:00' }],
  },
  fullday: {
    key: 'fullday',
    label: 'Toute la journée',
    ranges: [
      { start: '08:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
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
  const [formData, setFormData] = useState(
    initialData || {
      day: '',
      hour_star: '',
      hour_end: '',
      subject_id: '',
      etablishment_id: '',
    }
  );
  const [errors, setErrors] = useState({});
  const [selectedShift, setSelectedShift] = useState('morning');
  const applyShift = (shiftKey) => {
    const shift = SHIFTS[shiftKey];
    if (!shift) return;
    setSelectedShift(shiftKey);
    const primaryRange = shift.ranges[0];
    setFormData((prev) => ({
      ...prev,
      hour_star: primaryRange.start,
      hour_end: primaryRange.end,
    }));
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        day: initialData.day || '',
        hour_star: initialData.hour_star || '',
        hour_end: initialData.hour_end || '',
        subject_id: initialData.subject_id || '',
        etablishment_id: initialData.etablishment_id || '',
      });
      const shiftKey = Object.values(SHIFTS).find((shift) =>
        shift.ranges.some(
          (range) =>
            range.start === initialData.hour_star && range.end === initialData.hour_end
        )
      )?.key;
      if (shiftKey) {
        setSelectedShift(shiftKey);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      applyShift('morning');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const selectedSubject = subjects.find(
    (subject) => String(subject.id) === String(formData.subject_id)
  );
  const selectedSpecialtyLabel =
    selectedSubject?.specialty?.specialty_name ||
    selectedSubject?.specialties?.specialty_name ||
    '';

  const subjectOptions = useMemo(() => {
    const base = availableSubjects.length ? availableSubjects : subjects;
    const subjectId = initialData?.subject_id;
    if (!subjectId) return base;
    const alreadyIncluded = base.some(
      (subject) => String(subject.id) === String(subjectId)
    );
    if (alreadyIncluded) return base;
    const fallback = subjects.find(
      (subject) => String(subject.id) === String(subjectId)
    );
    return fallback ? [...base, fallback] : base;
  }, [availableSubjects, subjects, initialData?.subject_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleShiftChange = (shiftKey) => {
    applyShift(shiftKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const shift = SHIFTS[selectedShift] || SHIFTS.morning;
      const entries = shift.ranges.map((range) => ({
        ...formData,
        hour_star: range.start,
        hour_end: range.end,
      }));
      await onSubmit(shift.key === 'fullday' ? entries : entries[0]);
      if (!initialData) {
        setFormData({
          day: '',
          hour_star: '',
          hour_end: '',
          subject_id: '',
          etablishment_id: '',
        });
        applyShift('morning');
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-auto">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
          Jour *
        </label>
        <select
          name="day"
          value={formData.day}
          onChange={handleChange}
          className={`w-full appearance-none px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 cursor-pointer ${
            errors.day
              ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative'
              : 'border-border focus:ring-muted/60 focus:border-border/80'
          }`}
          required
        >
          <option value="">Sélectionner un jour</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        {errors.day && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">
            {errors.day[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
          Tranche horaire *
        </label>
        <div className="flex flex-wrap gap-3">
          {Object.values(SHIFTS).map((shift) => (
            <label
              key={shift.key}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-2xl border transition-all cursor-pointer text-sm font-semibold text-center ${
                selectedShift === shift.key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted text-foreground'
              }`}
            >
              <input
                type="radio"
                name="shift"
                value={shift.key}
                checked={selectedShift === shift.key}
                onChange={() => handleShiftChange(shift.key)}
                className="hidden"
              />
              {shift.label}
            </label>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {selectedShift === 'fullday'
            ? 'Matin 08:00-12:00 et après-midi 13:00-17:00'
            : `${SHIFTS[selectedShift].ranges[0].start} - ${SHIFTS[selectedShift].ranges[0].end}`}
        </p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
          Matiere *
        </label>
        <select
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          className={`w-full appearance-none px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 cursor-pointer ${
            errors.subject_id
              ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative'
              : 'border-border focus:ring-muted/60 focus:border-border/80'
          }`}
          required
        >
          <option value="">Sélectionner une matière</option>
          {subjectOptions.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
        {errors.subject_id && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">
            {errors.subject_id[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
          Specialite concernee
        </label>
        <input
          type="text"
          value={selectedSpecialtyLabel || '-'}
          readOnly
          className="w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm text-muted-foreground/80 transition-all focus:bg-card focus:outline-none focus:ring-4 border-border focus:ring-muted/60 focus:border-border/80"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
          Etablissement *
        </label>
        <select
          name="etablishment_id"
          value={formData.etablishment_id}
          onChange={handleChange}
          className={`w-full appearance-none px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 cursor-pointer ${
            errors.etablishment_id
              ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative'
              : 'border-border focus:ring-muted/60 focus:border-border/80'
          }`}
          required
        >
          <option value="">Sélectionner un établissement</option>
          {etablishments.map((etab) => (
            <option key={etab.id} value={etab.id}>
              {etab.etablishment_name}
            </option>
          ))}
        </select>
        {errors.etablishment_id && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">
            {errors.etablishment_id[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-2 h-auto shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading
            ? 'Enregistrement...'
            : initialData
              ? 'Mettre a jour la disponibilite'
              : 'Creer la disponibilite'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-border text-muted-foreground hover:bg-muted rounded-2xl py-2 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
