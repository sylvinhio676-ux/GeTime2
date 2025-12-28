import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, School, AlignLeft, AlertCircle } from 'lucide-react';

export default function SchoolForm({ initialData = null, onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      school_name: '',
      description: '',
    }
  );

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Nettoyer l'erreur dès que l'utilisateur tape à nouveau
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
    setErrors({});
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
      {/* --- MESSAGE D'ERREUR GÉNÉRAL --- */}
      {errors.general && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-in fade-in zoom-in-95">
          <AlertCircle className="w-4 h-4" />
          <p className="font-medium">{errors.general}</p>
        </div>
      )}

      {/* --- CHAMP : NOM DE L'ÉCOLE --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
          <School className="w-3.5 h-3.5" />
          Nom de l'établissement *
        </label>
        <div className="relative">
          <input
            type="text"
            name="school_name"
            value={formData.school_name}
            onChange={handleChange}
            placeholder="Ex: École Supérieure de Technologie"
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 ${
              errors.school_name 
                ? 'border-rose-300 focus:ring-rose-100 text-rose-900' 
                : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-400'
            }`}
            required
          />
        </div>
        {errors.school_name && (
          <p className="text-rose-500 text-[11px] font-bold ml-1 flex items-center gap-1">
            <span className="w-1 h-1 bg-rose-500 rounded-full" /> {errors.school_name[0]}
          </p>
        )}
      </div>

      {/* --- CHAMP : DESCRIPTION --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
          <AlignLeft className="w-3.5 h-3.5" />
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brève présentation de l'école..."
          className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-sm transition-all focus:bg-white focus:outline-none focus:ring-4 min-h-[120px] resize-none ${
            errors.description 
              ? 'border-rose-300 focus:ring-rose-100' 
              : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-400'
          }`}
          rows="4"
        />
        {errors.description && (
          <p className="text-rose-500 text-[11px] font-bold ml-1 flex items-center gap-1">
            <span className="w-1 h-1 bg-rose-500 rounded-full" /> {errors.description[0]}
          </p>
        )}
      </div>

      {/* --- BOUTONS D'ACTION --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 h-auto shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            initialData ? 'Enregistrer les modifications' : 'Créer l\'établissement'
          )}
        </Button>
        
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl py-6 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}