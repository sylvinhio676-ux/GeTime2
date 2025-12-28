import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Layers, 
  AlertCircle,
  Check
} from 'lucide-react';

export default function LevelForm({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name_level: '',
  });

  const [errors, setErrors] = useState({});

  // Synchronisation pour le mode édition
  useEffect(() => {
    if (initialData) {
      setFormData({
        name_level: initialData.name_level || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur dès que l'utilisateur tape
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
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.message || 'Une erreur est survenue' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- ERREUR GÉNÉRALE --- */}
      {errors.general && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold">{errors.general}</p>
        </div>
      )}

      {/* --- CHAMP NOM DU NIVEAU --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          Libellé du Niveau *
        </label>
        
        <div className="relative group">
          <input
            type="text"
            name="name_level"
            value={formData.name_level}
            onChange={handleChange}
            placeholder="Ex: Licence 1, Master 2, Doctorat..."
            className={`w-full px-4 py-4 rounded-2xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${
              errors.name_level 
                ? 'border-rose-300 focus:ring-rose-100 text-rose-900' 
                : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-400'
            }`}
            required
          />
          {formData.name_level.length > 2 && !errors.name_level && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
              <Check className="w-5 h-5" />
            </div>
          )}
        </div>

        {errors.name_level && (
          <p className="text-rose-500 text-[11px] font-bold ml-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.name_level[0]}
          </p>
        )}
      </div>

      {/* --- FOOTER : ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-7 h-auto shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Traitement...</span>
            </div>
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
          className="flex-1 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-2xl py-7 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>

      <p className="text-center text-[10px] text-slate-400 font-medium">
        Tous les champs marqués d'une astérisque (*) sont obligatoires.
      </p>
    </form>
  );
}