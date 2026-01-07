import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  MapPin, 
  Building2, 
  School, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';

export default function CampusForm({ 
  initialData = null, 
  etablishments = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    campus_name: '',
    localisation: '',
    etablishment_id: '',
  });

  const [errors, setErrors] = useState({});

  // Synchronisation avec les données initiales (édition)
  useEffect(() => {
    if (initialData) {
      setFormData({
        campus_name: initialData.campus_name || '',
        localisation: initialData.localisation || '',
        etablishment_id: initialData.etablishment_id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur dès que l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: "Une erreur de connexion est survenue." });
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

      {/* --- NOM DU CAMPUS --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          Dénomination du Campus *
        </label>
        <input
          type="text"
          name="campus_name"
          value={formData.campus_name}
          onChange={handleChange}
          placeholder="Ex: Campus de l'Innovation"
          className={`w-full px-4 py-3.5 rounded-2xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${
            errors.campus_name 
              ? 'border-rose-300 focus:ring-rose-100 text-rose-900' 
              : 'border-slate-200 focus:ring-slate-100 focus:border-slate-400'
          }`}
          required
        />
        {errors.campus_name && (
          <p className="text-rose-500 text-[11px] font-bold ml-1">{errors.campus_name[0]}</p>
        )}
      </div>

      {/* --- LOCALISATION --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          Ville / Localisation *
        </label>
        <input
          type="text"
          name="localisation"
          value={formData.localisation}
          onChange={handleChange}
          placeholder="Ex: Douala, Akwa"
          className={`w-full px-4 py-3.5 rounded-2xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${
            errors.localisation 
              ? 'border-rose-300 focus:ring-rose-100 text-rose-900' 
              : 'border-slate-200 focus:ring-slate-100 focus:border-slate-400'
          }`}
          required
        />
        {errors.localisation && (
          <p className="text-rose-500 text-[11px] font-bold ml-1">{errors.localisation[0]}</p>
        )}
      </div>

      {/* --- ÉTABLISSEMENT PARENT (SELECT CUSTOM) --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
          <School className="w-3.5 h-3.5 text-slate-500" />
          Rattachement à l'établissement *
        </label>
        <div className="relative">
          <select 
            name="etablishment_id" 
            value={formData.etablishment_id}
            onChange={handleChange}
            className={`w-full appearance-none px-4 py-3.5 rounded-2xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 cursor-pointer ${
              errors.etablishment_id 
                ? 'border-rose-300 focus:ring-rose-100' 
                : 'border-slate-200 focus:ring-slate-100 focus:border-slate-400'
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
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {errors.etablishment_id && (
          <p className="text-rose-500 text-[11px] font-bold ml-1">{errors.etablishment_id[0]}</p>
        )}
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
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
              {initialData ? 'Mettre à jour le Campus' : 'Confirmer la Création'}
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