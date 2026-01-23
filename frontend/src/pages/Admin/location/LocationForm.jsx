import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LocationForm({ initialData = null, onSubmit, onCancel, isLoading = false }) {
  const [data, setData] = useState({
    city: '',
    region: '',
    country: '',
    address: '',
    latitude: '',
    longitude: '',
    validated: false,
  });

  useEffect(() => {
    if (initialData) {
      setData({
        city: initialData.city || '',
        region: initialData.region || '',
        country: initialData.country || '',
        address: initialData.address || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        validated: Boolean(initialData.validated),
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1 text-sm">
          <label className="font-semibold">Ville</label>
          <input
            name="city"
            value={data.city}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="font-semibold">Région</label>
          <input
            name="region"
            value={data.region}
            onChange={handleChange}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1 text-sm">
          <label className="font-semibold">Pays</label>
          <input
            name="country"
            value={data.country}
            onChange={handleChange}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="font-semibold">Adresse</label>
          <input
            name="address"
            value={data.address}
            onChange={handleChange}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <label className="font-semibold">Latitude</label>
          <input
            name="latitude"
            value={data.latitude}
            onChange={handleChange}
            className="w-full rounded-xl border border-border px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="font-semibold">Longitude</label>
          <input
            name="longitude"
            value={data.longitude}
            onChange={handleChange}
            className="w-full rounded-xl border border-border px-3 py-2"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          name="validated"
          checked={data.validated}
          onChange={handleChange}
          className="h-4 w-4 rounded border border-border text-primary focus:ring-primary"
        />
        <label>Marquer comme validée</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="px-5">
          Annuler
        </Button>
        <Button type="submit" className="px-6" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
