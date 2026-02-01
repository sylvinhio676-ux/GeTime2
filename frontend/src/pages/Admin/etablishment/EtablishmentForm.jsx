import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, AlignLeft, MapPin, AlertCircle } from 'lucide-react';

export default function EtablishmentForm({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const [formData, setFormData] = useState(
    initialData || {
      etablishment_name: '',
      description: '',
      city: '',
    }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await onSubmit(formData);
    } catch (err) {
      if (err?.errors) {
        setErrors(err.errors);
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.message || 'Une erreur est survenue' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-delta-negative/10 border border-delta-negative/20 text-delta-negative text-sm">
          <AlertCircle className="w-4 h-4" />
          <p className="font-medium">{errors.general}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          <Building2 className="w-3.5 h-3.5" />
          Nom de l'établissement *
        </label>
        <input
          type="text"
          name="etablishment_name"
          value={formData.etablishment_name}
          onChange={handleChange}
          placeholder="Ex : Université Centrale"
          className={`w-full px-4 py-3 rounded-xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 ${
            errors.etablishment_name
              ? 'border-delta-negative/40 focus:ring-delta-negative/20'
              : 'border-border focus:ring-muted/60 focus:border-border/80'
          }`}
          required
        />
        {errors.etablishment_name && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">
            {errors.etablishment_name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          <AlignLeft className="w-3.5 h-3.5" />
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Décrivez brièvement l'établissement..."
          className={`w-full px-4 py-3 rounded-xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 min-h-[100px] resize-none ${
            errors.description
              ? 'border-delta-negative/40 focus:ring-delta-negative/20'
              : 'border-border focus:ring-muted/60 focus:border-border/80'
          }`}
        />
        {errors.description && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">
            {errors.description[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
          <MapPin className="w-3.5 h-3.5" />
          Ville
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Yaoundé, Douala..."
          className={`w-full px-4 py-3 rounded-xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 ${
            errors.city
              ? 'border-delta-negative/40 focus:ring-delta-negative/20'
              : 'border-border focus:ring-muted/60 focus:border-border/80'
          }`}
        />
        {errors.city && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">
            {errors.city[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2 h-auto shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : initialData ? 'Mettre à jour' : 'Créer l’établissement'}
        </Button>

        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-border text-muted-foreground hover:bg-muted rounded-xl py-2 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
