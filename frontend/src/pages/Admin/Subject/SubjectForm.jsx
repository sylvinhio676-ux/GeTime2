import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, Clock, Layers, User, ChevronDown, Loader2, Check, AlertCircle 
} from 'lucide-react';

export default function SubjectForm({ 
  initialData = null, 
  teachers = [], 
  specialties = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  // L'état est initialisé une seule fois au montage.
  // La suppression du useEffect élimine l'erreur de rendu en cascade.
  const [formData, setFormData] = useState({
    subject_name: initialData?.subject_name || '',
    hour_by_week: initialData?.hour_by_week || '',
    total_hour: initialData?.total_hour || '',
    type_subject: initialData?.type_subject || '',
    color: initialData?.color || '#3b82f6',
    teacher_id: initialData?.teacher_id || '',
    specialty_id: initialData?.specialty_id || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = ({ target }) => {
    const { name, value } = target;
    
    // Conversion numérique pour les IDs et volumes horaires
    const numericFields = ['teacher_id', 'specialty_id', 'hour_by_week', 'total_hour'];
    const processedValue = numericFields.includes(name) && value !== '' ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    
    // Nettoyage immédiat de l'erreur du champ en cours de saisie
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (err) {
      // Gestion des erreurs de validation Laravel
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.message || 'Une erreur est survenue' });
      }
    }
  };

  const inputClasses = (name) => `
    w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all 
    focus:bg-card focus:outline-none focus:ring-4 
    ${errors[name] ? 'border-red-500 focus:ring-red-500/10' : 'border-border focus:ring-primary/10 focus:border-primary/40'}
  `;

  const labelClasses = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold">{errors.general}</p>
        </div>
      )}

      <div className="space-y-1">
        <label className={labelClasses}>
          <BookOpen className="w-3.5 h-3.5" /> Nom de la Matière *
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
        {errors.subject_name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.subject_name[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClasses}>
            <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Rythme indicatif (h/sem)
          </label>
          <input
            type="number"
            name="hour_by_week"
            value={formData.hour_by_week}
            onChange={handleChange}
            placeholder="Ex: 4"
            className={inputClasses('hour_by_week')}
          />
          <p className="text-[9px] text-muted-foreground px-1">
            Sert de base pour la planification standard.
          </p>
        </div>
        <div className="space-y-1">
          <label className={labelClasses}><Layers className="w-3.5 h-3.5" /> Total (h) *</label>
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

      <div className="space-y-1 relative group">
        <label className={labelClasses}>Type de Cours *</label>
        <select
          name="type_subject"
          value={formData.type_subject}
          onChange={handleChange}
          className={`${inputClasses('type_subject')} appearance-none cursor-pointer`}
          required
        >
          <option value="">-- Sélectionner --</option>
          <option value="cours">Cours (CM)</option>
          <option value="td">TD</option>
          <option value="tp">TP</option>
        </select>
        <ChevronDown className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/80" />
      </div>

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

      <div className="space-y-1">
        <label className={labelClasses}><Check className="w-3.5 h-3.5" /> Couleur</label>
        <input
          type="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="h-12 w-24 rounded-xl border border-border bg-card cursor-pointer"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-[2] rounded-2xl py-7 h-auto">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <span className="font-bold">{initialData ? 'Enregistrer' : 'Créer la matière'}</span>
          )}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1 rounded-2xl py-7 h-auto font-bold">
          Annuler
        </Button>
      </div>
    </form>
  );
}