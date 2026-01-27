import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';

export default function SpecialtyForm({ 
  initialData = null, 
  sectors = [], 
  programmers = [], 
  levels = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState(
    initialData || {
      specialty_name: '',
      code: '',
      description: '',
      number_student: '',
      sector_id: '',
      programmer_id: '',
      level_id: '',
    }
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        specialty_name: initialData.specialty_name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        number_student: initialData.number_student || '',
        sector_id: initialData.sector_id || '',
        programmer_id: initialData.programmer_id || '',
        level_id: initialData.level_id || '',
      });
    }
  }, [initialData]);

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
          specialty_name: '',
          code: '',
          description: '',
          number_student: '',
          sector_id: '',
          programmer_id: '',
          level_id: '',
        });
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };

  const inputClasses = (name) => `
    w-full px-4 py-2.5 rounded-xl border bg-background/50 text-sm 
    focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
    ${errors[name] ? 'border-destructive' : 'border-border'}
  `;

  const labelClasses = "block text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1.5 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Grille principale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Nom de la Spécialité - Pleine largeur sur Desktop */}
        <div className="md:col-span-2">
          <label className={labelClasses}>Nom de la Spécialité *</label>
          <input
            type="text"
            name="specialty_name"
            value={formData.specialty_name}
            onChange={handleChange}
            placeholder="Ex: Génie Logiciel"
            className={inputClasses('specialty_name')}
            required
          />
          {errors.specialty_name && (
            <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.specialty_name[0]}</p>
          )}
        </div>

        {/* Code */}
        <div>
          <label className={labelClasses}>Code *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Ex: GL"
            className={inputClasses('code')}
            required
          />
          {errors.code && (
            <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.code[0]}</p>
          )}
        </div>

        {/* Nombre d'étudiants */}
        <div>
          <label className={labelClasses}>Nombre d'étudiants *</label>
          <input
            type="number"
            name="number_student"
            value={formData.number_student}
            onChange={handleChange}
            className={inputClasses('number_student')}
            required
          />
          {errors.number_student && (
            <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.number_student[0]}</p>
          )}
        </div>

        {/* Niveau */}
        <div>
          <label className={labelClasses}>Niveau *</label>
          <select 
            name="level_id" 
            value={formData.level_id}
            onChange={handleChange}
            className={inputClasses('level_id')}
            required
          >
            <option value="">Sélectionner...</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.level_name || level.name_level}
              </option>
            ))}
          </select>
        </div>

        {/* Secteur */}
        <div>
          <label className={labelClasses}>Secteur *</label>
          <select 
            name="sector_id" 
            value={formData.sector_id}
            onChange={handleChange}
            className={inputClasses('sector_id')}
            required
          >
            <option value="">Sélectionner...</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.sector_name}
              </option>
            ))}
          </select>
        </div>

        {/* Responsable (Programmer) - Pleine largeur sur Desktop */}
        <div className="md:col-span-2">
          <label className={labelClasses}>Responsable / Programmeur</label>
          <select 
            name="programmer_id" 
            value={formData.programmer_id}
            onChange={handleChange}
            className={inputClasses('programmer_id')}
          >
            <option value="">-- Aucun responsable --</option>
            {programmers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.user?.name || p.registration_number}
              </option>
            ))}
          </select>
        </div>

        {/* Description - Pleine largeur */}
        <div className="md:col-span-2">
          <label className={labelClasses}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={inputClasses('description')}
            rows="3"
            placeholder="Informations complémentaires..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row gap-3 pt-4 sticky bottom-0 bg-card pb-2">
        <Button
          type='button'
          onClick={onCancel}
          className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl h-12 font-bold transition-all"
        >
          Annuler
        </Button>
        <Button
          type='submit'
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 rounded-xl h-12 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ...
            </span>
          ) : (
            initialData ? 'Enregistrer' : 'Créer'
          )}
        </Button>
      </div>
    </form>
  );
}