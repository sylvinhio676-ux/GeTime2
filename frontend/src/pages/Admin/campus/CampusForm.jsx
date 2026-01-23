import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  MapPin, 
  Building2, 
  School, 
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import MapPicker from '@/components/maps/MapPicker';
import { locationService } from '@/services/locationService';

export default function CampusForm({ 
  initialData = null, 
  etablishments = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    campus_name: '',
    city: '',
    address: '',
    etablishment_id: '',
    latitude: '',
    longitude: '',
    location_id: '',
  });

  const [errors, setErrors] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);
  const lastGeocodedRef = useRef('');
  const [geoError, setGeoError] = useState('');
  const [locations, setLocations] = useState([]);
  // Synchronisation avec les données initiales (édition)
  useEffect(() => {
    if (initialData) {
      setFormData({
        campus_name: initialData.campus_name || '',
        city: initialData.city || '',
        address: initialData.address || '',
        etablishment_id: initialData.etablishment_id || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        location_id: initialData.location_id || initialData.location?.id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleCitySelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      city: value,
      address: '',
      location_id: '',
    }));
    if (errors.city) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.city;
        return updated;
      });
    }
  };

  const handleLocationSelect = (value) => {
    if (!value) {
      setFormData((prev) => ({
        ...prev,
        address: '',
        location_id: '',
        latitude: '',
        longitude: '',
      }));
      return;
    }

    const location = locations.find((loc) => String(loc.id) === value);
    if (!location) return;

    setFormData((prev) => ({
      ...prev,
      city: location.city,
      address: location.address || '',
      latitude: location.latitude ?? prev.latitude,
      longitude: location.longitude ?? prev.longitude,
      location_id: location.id,
    }));
  };

  const handleUseCurrentPosition = () => {
    if (!navigator.geolocation) {
      setGeoError('Géolocalisation non supportée par ce navigateur.');
      return;
    }
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lon.toFixed(6),
          location_id: '',
        }));
        reverseGeocode(lat, lon);
      },
      () => {
        setGeoError("Impossible de récupérer la position actuelle.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: { Accept: 'application/json' },
        }
      );
      const data = await response.json();
        if (data?.address) {
          setFormData((prev) => ({
            ...prev,
            city: data.address.city || data.address.town || data.address.village || prev.city,
            address: data.display_name || prev.address,
            location_id: '',
          }));
      }
    } catch (err) {
      console.error('Reverse geocoding failed', err);
    }
  };

  const isCoordinateValid = () => {
    const lat = Number(formData.latitude);
    const lon = Number(formData.longitude);
    return (
      !Number.isNaN(lat) &&
      !Number.isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  };

  useEffect(() => {
    locationService.getAll().then(setLocations).catch(() => {});
  }, []);

  const cities = useMemo(() => {
    const unique = Array.from(new Set(locations.map((loc) => loc.city).filter(Boolean)));
    return unique.sort();
  }, [locations]);

  const addressesForCity = useMemo(() => {
    if (!formData.city) return [];
    return locations.filter((loc) => loc.city === formData.city);
  }, [locations, formData.city]);

  const address = (formData.address || '').trim();
  useEffect(() => {
    if (!address || address.length < 5 || address === lastGeocodedRef.current) {
      return;
    }
    const controller = new AbortController();
    setIsGeocoding(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
          { signal: controller.signal, headers: { Accept: 'application/json' } }
        );
        const results = await response.json();
        if (Array.isArray(results) && results.length > 0) {
          const [first] = results;
          lastGeocodedRef.current = address;
          setFormData((prev) => ({
            ...prev,
            latitude: first.lat,
            longitude: first.lon,
            location_id: '',
          }));
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Geocoding error', err);
        }
      } finally {
        setIsGeocoding(false);
      }
    }, 800);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [address]);

  useEffect(() => {
    const address = (formData.address || '').trim();
    if (!address || address.length < 5 || address === lastGeocodedRef.current) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
          { signal: controller.signal, headers: { 'Accept': 'application/json' } }
        );
        const results = await response.json();
        if (Array.isArray(results) && results.length > 0) {
          const [first] = results;
          lastGeocodedRef.current = address;
          setFormData((prev) => ({
            ...prev,
            latitude: first.lat,
            longitude: first.lon,
          }));
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Geocoding failed', err);
        }
      } finally {
        setIsGeocoding(false);
      }
    }, 800);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [formData.address]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 overflow-auto max-h-[70vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted/40 pr-2"
    >
      
      {/* --- ERREUR GÉNÉRALE --- */}
      {errors.general && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-delta-negative/10 border border-delta-negative/20 text-delta-negative text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold">{errors.general}</p>
        </div>
      )}

      {/* --- NOM DU CAMPUS --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          Dénomination du Campus *
        </label>
        <input
          type="text"
          name="campus_name"
          value={formData.campus_name}
          onChange={handleChange}
          placeholder="Ex: Campus de l'Innovation"
          className={`w-full px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 ${
            errors.campus_name 
              ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative' 
              : 'border-border focus:ring-muted/60 focus:border-border/80'
          }`}
          required
        />
        {errors.campus_name && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.campus_name[0]}</p>
        )}
      </div>

      {/* --- CITY --- */}
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Ville / city *
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={(event) => handleCitySelect(event.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 ${
              errors.city
                ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative'
                : 'border-border focus:ring-muted/60 focus:border-border/80'
            }`}
            required
          >
            <option value="">Sélectionner une ville</option>
            {cities.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.city[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Adresse
          </label>
          <select
            name="location_id"
            value={formData.location_id || ''}
            onChange={(event) => handleLocationSelect(event.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 ${
              errors.address
                ? 'border-delta-negative/40 focus:ring-delta-negative/20 text-delta-negative'
                : 'border-border focus:ring-muted/60 focus:border-border/80'
            }`}
            required
          >
            <option value="">Choisir une adresse</option>
            {addressesForCity.map((location) => (
              <option key={location.id} value={location.id}>
                {location.address || `${location.latitude}, ${location.longitude}`}
              </option>
            ))}
          </select>
          {errors.address && (
            <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.address[0]}</p>
          )}
        </div>
      </div>

      {/* --- ÉTABLISSEMENT PARENT (SELECT CUSTOM) --- */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
          <School className="w-3.5 h-3.5 text-muted-foreground" />
          Rattachement à l'établissement *
        </label>
        <div className="relative">
          <select 
            name="etablishment_id" 
            value={formData.etablishment_id}
            onChange={handleChange}
            className={`w-full appearance-none px-4 py-3.5 rounded-2xl border bg-muted/50 text-sm transition-all focus:bg-card focus:outline-none focus:ring-4 cursor-pointer ${
              errors.etablishment_id 
                ? 'border-delta-negative/40 focus:ring-delta-negative/20' 
                : 'border-border focus:ring-muted/60 focus:border-border/80'
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
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
        </div>
        {errors.etablishment_id && (
          <p className="text-delta-negative text-[11px] font-bold ml-1">{errors.etablishment_id[0]}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div>
            <label className="text-sm font-semibold text-muted-foreground">Latitude</label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="0.000001"
              className="mt-2 w-full rounded-xl border border-input bg-input-background px-4 py-3 outline-none text-sm"
              placeholder="4.051100"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground">Longitude</label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="0.000001"
              className="mt-2 w-full rounded-xl border border-input bg-input-background px-4 py-3 outline-none text-sm"
              placeholder="9.767900"
            />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">Valider sur la carte</p>
          <MapPicker
            value={{
              latitude: formData.latitude,
              longitude: formData.longitude,
            }}
            onChange={(coords) => setFormData((prev) => ({ ...prev, ...coords }))}
            height="280px"
            markerLabel="Emplacement du campus"
          />
          {isGeocoding && (
            <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Recherche automatique des coordonnées
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUseCurrentPosition}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-[0.3em] transition hover:bg-primary/90"
            >
              Utiliser ma position actuelle
            </button>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border ${
                isCoordinateValid()
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isCoordinateValid() ? 'Coordonnées valides' : 'Hors limites'}
            </span>
          </div>
          {geoError && (
            <p className="mt-1 text-[11px] text-rose-600">{geoError}</p>
          )}
        </div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-2 h-auto shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
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
          className="flex-1 border-border text-muted-foreground hover:bg-muted rounded-2xl py-2 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
