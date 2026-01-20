import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Layers, 
  User, 
  ChevronDown, 
  Loader2, 
  Check,
  AlertCircle
} from 'lucide-react';

export default function SubjectForm({ 
  initialData = null, 
  teachers = [], 
  specialties = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    subject_name: '',
    hour_by_week: '',
    total_hour: '',
    type_subject: '',
    color: 'var(--primary)',
    teacher_id: '',
    specialty_id: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject_name: initialData.subject_name || '',
        hour_by_week: initialData.hour_by_week || '',
        total_hour: initialData.total_hour || '',
        type_subject: initialData.type_subject || '',
        color: initialData.color || 'var(--primary)',
        teacher_id: initialData.teacher_id || '',
        specialty_id: initialData.specialty_id || '',
      });
    }
  }, [initialData]);

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'Une erreur est survenue' });
      }
    }
  };

  const inputClasses = (name) => `
    w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all 
    focus:bg-card focus:outline-none focus:ring-4 
    ${errors[name] ? 'border-delta-negative/40 focus:ring-delta-negative/20' : 'border-border focus:ring-muted/60 focus:border-border/80'}
  `;

  const labelClasses = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-delta-negative/10 border border-delta-negative/20 text-delta-negative text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold">{errors.general}</p>
        </div>
      )}

      {/* --- NOM DE LA MATIÈRE --- */}
      <div className="space-y-1">
        <label className={labelClasses}>
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" /> Nom de la Matière *
        </label>
        <input
          type="text"
          name="subject_name"
          value={formData.subject_name}
          onChange={handleChange}
          placeholder="Ex: Algorithmique Avancée"
          className={inputClasses('subject_name')}
          required
        />
        {errors.subject_name && <p className="text-delta-negative text-[10px] font-bold mt-1 ml-1">{errors.subject_name[0]}</p>}
      </div>

      {/* --- GRILLE : HEURES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClasses}>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Heures / Semaine *
          </label>
          <input
            type="number"
            name="hour_by_week"
            value={formData.hour_by_week}
            onChange={handleChange}
            className={inputClasses('hour_by_week')}
            required
          />
        </div>
        <div className="space-y-1">
          <label className={labelClasses}>
            <Layers className="w-3.5 h-3.5 text-muted-foreground" /> Volume Total (h) *
          </label>
          <input
            type="number"
            name="total_hour"
            value={formData.total_hour}
            onChange={handleChange}
            className={inputClasses('total_hour')}
            required
          />
        </div>
      </div>

      {/* --- TYPE DE MATIÈRE --- */}
      <div className="space-y-1 relative group">
        <label className={labelClasses}>Type de Cours *</label>
        <select
          name="type_subject"
          value={formData.type_subject}
          onChange={handleChange}
          className={`${inputClasses('type_subject')} appearance-none cursor-pointer`}
          required
        >
          <option value="">-- Sélectionner le type --</option>
          <option value="cours">Cours (CM)</option>
          <option value="td">TD</option>
          <option value="tp">TP</option>
        </select>
        <ChevronDown className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/80 pointer-events-none group-focus-within:rotate-180 transition-transform" />
      </div>

      {/* --- COULEUR --- */}
      <div className="space-y-1">
        <label className={labelClasses}>
          <Check className="w-3.5 h-3.5 text-muted-foreground" /> Couleur de la Matière
        </label>
        <input
          type="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="h-12 w-full rounded-2xl border border-border bg-card px-3"
        />
        {errors.color && <p className="text-delta-negative text-[10px] font-bold mt-1 ml-1">{errors.color[0]}</p>}
      </div>

      {/* --- ENSEIGNANT & SPÉCIALITÉ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><User className="w-3.5 h-3.5" /> Enseignant</label>
          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            className={`${inputClasses('teacher_id')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Sélectionner --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.user?.name || `Prof. ${t.id}`}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/80" />
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}>Spécialité</label>
          <select
            name="specialty_id"
            value={formData.specialty_id}
            onChange={handleChange}
            className={`${inputClasses('specialty_id')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Sélectionner --</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.specialty_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/80" />
        </div>
      </div>

      {/* --- FOOTER : ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-2xl py-7 h-auto shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="font-bold tracking-tight text-base">
              {initialData ? 'Enregistrer les modifications' : 'Confirmer la création'}
            </span>
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
