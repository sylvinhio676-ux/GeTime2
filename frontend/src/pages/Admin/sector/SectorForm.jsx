import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Layers, 
  Hash, 
  University, 
  AlertCircle,
  ChevronDown 
} from 'lucide-react';

export default function SectorForm({ 
  initialData = null, 
  schools = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    sector_name: '',
    code: '',
    school_id: '',
  });

  const [errors, setErrors] = useState({});

  // Synchronisation pour le mode édition
  useEffect(() => {
    if (initialData) {
      setFormData({
        sector_name: initialData.sector_name || '',
        code: initialData.code || '',
        school_id: initialData.school_id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Nettoyage de l'erreur au fur et à mesure de la saisie
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
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: "Une erreur est survenue lors de l'enregistrement." });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- ERREUR GÉNÉRALE --- */}
      {errors.general && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold">{errors.general}</p>
        </div>
      )}

      {/* --- NOM DU SECTEUR --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          Nom de la Filière / Secteur *
        </label>
        <input
          type="text"
          name="sector_name"
          value={formData.sector_name}
          onChange={handleChange}
          placeholder="Ex: Génie Logiciel"
          className={`w-full px-4 py-3.5 rounded-2xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${
            errors.sector_name 
              ? 'border-rose-300 focus:ring-rose-100 text-rose-900' 
              : 'border-slate-200 focus:ring-slate-100 focus:border-slate-400'
          }`}
          required
        />
        {errors.sector_name && (
          <p className="text-rose-500 text-[11px] font-bold ml-1">{errors.sector_name[0]}</p>
        )}
      </div>

      {/* --- CODE DE LA FILIÈRE --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          <Hash className="w-3.5 h-3.5 text-slate-500" />
          Code Identifiant *
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="Ex: GL-2024"
          className={`w-full px-4 py-3.5 rounded-2xl border bg-slate-50/50 text-sm font-mono transition-all focus:bg-white focus:outline-none focus:ring-4 ${
            errors.code 
              ? 'border-rose-300 focus:ring-rose-100' 
              : 'border-slate-200 focus:ring-slate-100 focus:border-slate-400'
          }`}
          required
        />
        {errors.code && (
          <p className="text-rose-500 text-[11px] font-bold ml-1">{errors.code[0]}</p>
        )}
      </div>

      {/* --- SÉLECTION DE L'ÉCOLE --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          <University className="w-3.5 h-3.5 text-slate-500" />
          École de rattachement *
        </label>
        <div className="relative">
          <select 
            name="school_id" 
            value={formData.school_id}
            onChange={handleChange}
            className={`w-full appearance-none px-4 py-3.5 rounded-2xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 cursor-pointer ${
              errors.school_id 
                ? 'border-rose-300 focus:ring-rose-100' 
                : 'border-slate-200 focus:ring-slate-100 focus:border-slate-400'
            }`}
            required
          >
            <option value="">Sélectionner une école</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.school_name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {errors.school_id && (
          <p className="text-rose-500 text-[11px] font-bold ml-1">{errors.school_id[0]}</p>
        )}
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-50">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-blue-700 hover:bg-blue-800 text-white rounded-2xl py-7 h-auto shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enregistrement...</span>
            </div>
          ) : (
            <span className="font-bold tracking-tight">
              {initialData ? 'Mettre à jour la filière' : 'Créer la filière'}
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
    </form>
  );
}