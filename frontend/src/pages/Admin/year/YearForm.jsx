import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export default function YearForm({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    date_star: '',
    date_end: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        date_star: initialData.date_star || '',
        date_end: initialData.date_end || '',
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
    w-full px-4 py-3.5 rounded-2xl border bg-slate-50/50 text-sm transition-all 
    focus:bg-white focus:outline-none focus:ring-4 
    ${errors[name] ? 'border-rose-300 focus:ring-rose-100 text-rose-900' : 'border-slate-200 focus:ring-slate-100 focus:border-slate-400'}
  `;

  const labelClasses = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- ERREUR GÉNÉRALE --- */}
      {errors.general && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold">{errors.general}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* --- DATE DE DÉBUT --- */}
        <div className="space-y-1">
          <label className={labelClasses}>
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Date de Début *
          </label>
          <input
            type="date"
            name="date_star"
            value={formData.date_star}
            onChange={handleChange}
            className={inputClasses('date_star')}
            required
          />
          {errors.date_star && (
            <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.date_star[0]}</p>
          )}
        </div>

        {/* --- DATE DE FIN --- */}
        <div className="space-y-1">
          <label className={labelClasses}>
            <Calendar className="w-3.5 h-3.5 text-purple-500" /> Date de Fin *
          </label>
          <input
            type="date"
            name="date_end"
            value={formData.date_end}
            onChange={handleChange}
            className={inputClasses('date_end')}
            required
          />
          {errors.date_end && (
            <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.date_end[0]}</p>
          )}
        </div>
      </div>

      {/* --- PETIT INDICATEUR VISUEL --- */}
      <div className="flex items-center justify-center py-2 text-slate-300">
        <div className="h-[1px] flex-1 bg-slate-100"></div>
        <div className="px-4 py-1 rounded-full border border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-2">
          Période Académique <ArrowRight className="w-3 h-3" />
        </div>
        <div className="h-[1px] flex-1 bg-slate-100"></div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 text-white rounded-2xl py-7 h-auto shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold tracking-tight text-base">
                {initialData ? 'Mettre à jour la période' : 'Confirmer l\'année'}
              </span>
            </div>
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