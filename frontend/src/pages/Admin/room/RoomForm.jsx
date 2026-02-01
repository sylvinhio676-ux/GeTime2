import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DoorOpen, 
  Users, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronDown,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function RoomForm({ 
  initialData = null, 
  campuses = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    code: '',
    capacity: '',
    is_available: true,
    type_room: '',
    campus_id: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        capacity: initialData.capacity || '',
        is_available: initialData.is_available ?? true,
        type_room: initialData.type_room || '',
        campus_id: initialData.campus_id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.errors) setErrors(error.errors);
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
      
      {/* --- CODE DE LA SALLE --- */}
      <div className="space-y-1">
        <label className={labelClasses}>
          <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" /> Code de la Salle *
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="Ex: SALLE-101"
          className={inputClasses('code')}
          required
        />
        {errors.code && <p className="text-delta-negative text-[10px] font-bold mt-1 ml-1">{errors.code[0]}</p>}
      </div>

      {/* --- CAPACITÉ & DISPONIBILITÉ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClasses}>
            <Users className="w-3.5 h-3.5 text-muted-foreground" /> Capacité (places) *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="0"
            className={inputClasses('capacity')}
            required
          />
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>État Initial</label>
          <div 
            onClick={() => setFormData(p => ({...p, is_available: !p.is_available}))}
            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border cursor-pointer transition-all ${
              formData.is_available 
                ? 'bg-delta-positive/10/50 border-delta-positive/20 text-delta-positive' 
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            <span className="text-sm font-bold">{formData.is_available ? 'Disponible' : 'Indisponible'}</span>
            {formData.is_available ? <ToggleRight className="w-6 h-6 text-delta-positive" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground/60" />}
          </div>
        </div>
      </div>

      {/* --- TYPE DE SALLE --- */}
      <div className="space-y-1 relative group">
        <label className={labelClasses}>
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" /> Type de Salle *
        </label>
        <select 
          name="type_room" 
          value={formData.type_room}
          onChange={handleChange}
          className={`${inputClasses('type_room')} appearance-none cursor-pointer`}
          required
        >
          <option value="">-- Sélectionner un type --</option>
          <option value="cours">Cours</option>
          <option value="td">TD</option>
          <option value="tp">TP</option>
        </select>
        <ChevronDown className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/80 pointer-events-none group-focus-within:rotate-180 transition-transform" />
      </div>

      {/* --- SÉLECTION CAMPUS --- */}
      <div className="space-y-1 relative group">
        <label className={labelClasses}>
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Campus de rattachement *
        </label>
        <select 
          name="campus_id" 
          value={formData.campus_id}
          onChange={handleChange}
          className={`${inputClasses('campus_id')} appearance-none cursor-pointer`}
          required
        >
          <option value="">-- Sélectionner un campus --</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.campus_name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 bottom-4 w-4 h-4 text-muted-foreground/80 pointer-events-none group-focus-within:rotate-180 transition-transform" />
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-primary text-primary-foreground rounded-2xl py-7 h-auto shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold tracking-tight text-base">
                {initialData ? 'Enregistrer les modifications' : 'Créer la salle'}
              </span>
            </div>
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-border text-primary hover:bg-muted rounded-2xl py-7 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
