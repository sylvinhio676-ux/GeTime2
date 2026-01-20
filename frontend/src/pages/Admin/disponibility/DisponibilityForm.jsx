import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DisponibilityForm({ initialData = null, subjects = [], etablishments = [], onSubmit, onCancel, isLoading = false }) {
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        day: initialData.day || '',
        hour_star: initialData.hour_star || '',
        hour_end: initialData.hour_end || '',
        subject_id: initialData.subject_id || '',
        etablishment_id: initialData.etablishment_id || '',
      });
    }
  }, [initialData]);

  const selectedSubject = subjects.find((subject) => String(subject.id) === String(formData.subject_id));
  const selectedSpecialtyLabel = selectedSubject?.specialty?.specialty_name || selectedSubject?.specialties?.specialty_name || '';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      if (!initialData) {
        setFormData({
          day: '',
          hour_star: '',
          hour_end: '',
          subject_id: '',
          etablishment_id: '',
        });
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        {errors.day && <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.day[0]}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            Heure de début *
          </label>
          <input
            type="time"
            name="hour_star"
            value={formData.hour_star}
            onChange={handleChange}
            className={`w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 ${
              errors.hour_star
                ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative'
                : 'border-border focus:ring-muted/60 focus:border-border/80'
            }`}
            required
          />
          {errors.hour_star && <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.hour_star[0]}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            Heure de fin *
          </label>
          <input
            type="time"
            name="hour_end"
            value={formData.hour_end}
            onChange={handleChange}
            className={`w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 ${
              errors.hour_end
                ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative'
                : 'border-border focus:ring-muted/60 focus:border-border/80'
            }`}
            required
          />
          {errors.hour_end && <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.hour_end[0]}</p>}
        </div>
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
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
        {errors.subject_id && <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.subject_id[0]}</p>}
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
          <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.etablishment_id[0]}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-2 h-auto shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : initialData ? 'Mettre a jour la disponibilite' : 'Creer la disponibilite'}
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
