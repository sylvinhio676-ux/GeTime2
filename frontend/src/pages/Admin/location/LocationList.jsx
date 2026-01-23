import React, { useEffect, useMemo, useRef, useState } from 'react';
import { locationService } from '@/services/locationService';
import LocationForm from './LocationForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, DownloadCloud, Check, X } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { campusService } from '@/services/campusService';
import { MapContainer, Marker, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const toRad = (degrees) => (degrees * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((value) => value === null || value === undefined || value === '')) {
    return null;
  }
  const _lat1 = Number(lat1);
  const _lon1 = Number(lon1);
  const _lat2 = Number(lat2);
  const _lon2 = Number(lon2);
  if ([_lat1, _lon1, _lat2, _lon2].some((value) => Number.isNaN(value))) {
    return null;
  }
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(_lat2 - _lat1);
  const dLon = toRad(_lon2 - _lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(_lat1)) * Math.cos(toRad(_lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

const parseNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export default function LocationList() {
  const [locations, setLocations] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ region: '', country: '', onlyCoords: false, campusId: '', maxDistance: '', status: 'all' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerLocation, setDrawerLocation] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await locationService.getAll();
      setLocations(data);
    } catch (error) {
      setNotification({ show: true, type: 'error', message: 'Impossible de récupérer les locations' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const data = await campusService.getAll();
      setCampuses(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchCampuses();
  }, []);

  const selectedCampus = useMemo(() => {
    if (!filters.campusId) return null;
    return campuses.find((campus) => String(campus.id) === filters.campusId) || null;
  }, [filters.campusId, campuses]);

  const regionOptions = useMemo(() => {
    const regions = new Set(locations.filter((loc) => loc.region).map((loc) => loc.region));
    return Array.from(regions);
  }, [locations]);

  const countryOptions = useMemo(() => {
    const countries = new Set(locations.filter((loc) => loc.country).map((loc) => loc.country));
    return Array.from(countries);
  }, [locations]);

  const filteredLocations = useMemo(() => {
    let result = locations.map((loc) => ({ ...loc }));

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (loc) =>
          (loc.city || '').toLowerCase().includes(term) ||
          (loc.address || '').toLowerCase().includes(term) ||
          (loc.region || '').toLowerCase().includes(term)
      );
    }

    if (filters.region) {
      result = result.filter((loc) => loc.region === filters.region);
    }

    if (filters.country) {
      result = result.filter((loc) => loc.country === filters.country);
    }

    if (filters.onlyCoords) {
      result = result.filter((loc) => loc.latitude !== null && loc.longitude !== null);
    }

    if (filters.status !== 'all') {
      const wantsValidated = filters.status === 'validated';
      result = result.filter((loc) => Boolean(loc.validated) === wantsValidated);
    }

    if (
      selectedCampus &&
      selectedCampus.latitude != null &&
      selectedCampus.longitude != null
    ) {
      result = result.map((loc) => ({
        ...loc,
        distanceToCampus: haversineDistance(loc.latitude, loc.longitude, selectedCampus.latitude, selectedCampus.longitude),
      }));
      if (filters.maxDistance) {
        const max = parseNumber(filters.maxDistance);
        if (max !== null) {
          result = result.filter((loc) => loc.distanceToCampus !== null && loc.distanceToCampus <= max);
        }
      }
    } else {
      result = result.map((loc) => ({ ...loc, distanceToCampus: null }));
    }

    return result;
  }, [locations, searchTerm, filters, selectedCampus]);

  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / PAGE_SIZE));
  const pagedLocations = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLocations.slice(start, start + PAGE_SIZE);
  }, [filteredLocations, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters.region, filters.country, filters.onlyCoords, filters.campusId, filters.maxDistance, filters.status, locations.length]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const allSelected = pagedLocations.length > 0 && pagedLocations.every((loc) => selectedIds.includes(loc.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pagedLocations.some((loc) => loc.id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const addable = pagedLocations.filter((loc) => !prev.includes(loc.id)).map((loc) => loc.id);
      return [...prev, ...addable];
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} location(s) ?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => locationService.delete(id)));
      setNotification({ show: true, type: 'success', message: 'Locations supprimées' });
      setSelectedIds([]);
      fetchLocations();
    } catch (error) {
      setNotification({ show: true, type: 'error', message: 'Suppression partielle ou impossible' });
    }
  };

  const handleValidateToggle = async (location, value) => {
    try {
      await locationService.update(location.id, { validated: value ? 1 : 0 });
      setTimeout(() => {
        setNotification({ show: true, type: 'success', message: `Location ${value ? 'validée' : 'remise en attente'}` });
      }, 3000);
      fetchLocations();
    } catch (error) {
      console.error('Échec validation location', error);
      setTimeout(() => {
        setNotification({
          show: true,
          type: 'error',
          message: error?.response?.data?.message || error?.message || 'Impossible de changer le statut',
        });
      }, 3000);
    }
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await locationService.update(editing.id, payload);
        setNotification({ show: true, type: 'success', message: 'Location modifiée' });
      } else {
        await locationService.create(payload);
        setNotification({ show: true, type: 'success', message: 'Location créée' });
      }
      setShowForm(false);
      setEditing(null);
      fetchLocations();
    } catch (error) {
      setNotification({ show: true, type: 'error', message: 'Impossible de sauvegarder' });
    }
  };

  const handleDelete = async (location) => {
    if (!window.confirm(`Supprimer ${location.city} ?`)) return;
    try {
      await locationService.delete(location.id);
      setNotification({ show: true, type: 'success', message: 'Location supprimée' });
      fetchLocations();
    } catch (error) {
      setNotification({ show: true, type: 'error', message: 'Suppression impossible' });
    }
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result || '';
        const lines = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length);
        if (!lines.length) {
          setNotification({ show: true, type: 'error', message: 'Fichier vide' });
          return;
        }
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0]
          .split(delimiter)
          .map((header) => header.trim().toLowerCase());
        const rows = lines.slice(1).map((line) => line.split(delimiter).map((cell) => cell.trim()));
        const creations = rows.map((values) => {
          const record = {};
          headers.forEach((header, index) => {
            record[header] = values[index] ?? '';
          });
          return {
            city: record.city || record.ville,
            region: record.region,
            country: record.country,
            address: record.address,
            latitude: record.latitude ? parseNumber(record.latitude) : null,
            longitude: record.longitude ? parseNumber(record.longitude) : null,
          };
        });
        const results = await Promise.allSettled(
          creations.map((payload) => locationService.create(payload))
        );
        const successCount = results.filter((result) => result.status === 'fulfilled').length;
        const failureCount = results.length - successCount;
        setNotification({
          show: true,
          type: failureCount ? 'error' : 'success',
          message: `${successCount} location(s) importée(s), ${failureCount} erreur(s)`,
        });
        fetchLocations();
      } catch (error) {
        setNotification({ show: true, type: 'error', message: 'Erreur pendant l’import' });
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setImporting(false);
      setNotification({ show: true, type: 'error', message: 'Impossible de lire le fichier' });
    };
    reader.readAsText(file, 'utf-8');
  };

  const openDrawer = (location) => {
    setDrawerLocation(location);
  };

  const closeDrawer = () => setDrawerLocation(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-[2rem] border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Locations</p>
            <h1 className="text-2xl font-black text-foreground">Gestion des adresses</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
              }}
              className="bg-primary shadow-lg shadow-primary/20 text-primary-foreground rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" /> Ajouter une location
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="rounded-xl gap-2"
            >
              <DownloadCloud className="w-4 h-4" /> Import CSV
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Rechercher ville, adresse ou région"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
          />
          <select
            value={filters.region}
            onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}
            className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
          >
            <option value="">Toutes les régions</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <select
            value={filters.country}
            onChange={(event) => setFilters((prev) => ({ ...prev, country: event.target.value }))}
            className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
          >
            <option value="">Tous les pays</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              id="only-coords"
              type="checkbox"
              checked={filters.onlyCoords}
              onChange={(event) => setFilters((prev) => ({ ...prev, onlyCoords: event.target.checked }))}
              className="h-4 w-4 rounded border border-border text-primary focus:ring-primary"
            />
            <label htmlFor="only-coords" className="text-sm text-muted-foreground">
              Seulement avec coordonnées
            </label>
          </div>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
          >
            <option value="all">Tous les statuts</option>
            <option value="validated">Validées</option>
            <option value="pending">En attente</option>
          </select>
          <select
            value={filters.campusId}
            onChange={(event) => setFilters((prev) => ({ ...prev, campusId: event.target.value }))}
            className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
          >
            <option value="">Distance à un campus</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.campus_name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            placeholder="Distance max (km)"
            value={filters.maxDistance}
            onChange={(event) => setFilters((prev) => ({ ...prev, maxDistance: event.target.value }))}
            className="rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground"
          />
        </div>
      </header>

      {notification.show && (
        <div
          className={`p-3 rounded-2xl border ${
            notification.type === 'error'
              ? 'border-delta-negative/40 bg-delta-negative/10 text-delta-negative'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {notification.message}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-[2rem] border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">{selectedIds.length} sélectionnée(s)</p>
          <Button variant="outline" className="rounded-xl" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4" /> Supprimer la sélection
          </Button>
        </div>
      )}

      <div className="rounded-[2rem] border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/60 text-muted-foreground text-[11px] uppercase tracking-[0.3em]">
              <tr>
                <th className="px-5 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="px-5 py-3">Ville</th>
                <th className="px-5 py-3">Adresse</th>
                <th className="px-5 py-3">Coordonnées</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Distance</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedLocations.map((location) => (
                <tr
                  key={location.id}
                  onClick={() => openDrawer(location)}
                  className="border-b border-border/40 hover:bg-muted/40 cursor-pointer"
                >
                  <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(location.id)}
                      onChange={() => toggleSelect(location.id)}
                    />
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground">
                    {location.city}
                    <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                      {location.region || 'Région inconnue'}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {location.address || 'Sans adresse'}
                    <p className="text-xs text-muted-foreground">{location.country || 'Pays non défini'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {location.latitude ?? '--'}, {location.longitude ?? '--'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      className={`text-[11px] font-black uppercase tracking-[0.3em] border px-3 py-1 ${
                        location.validated ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {location.validated ? 'Validée' : 'En attente de validation'}
                    </Badge>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleValidateToggle(location, !location.validated);
                      }}
                      className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary"
                    >
                      <Check className="w-3 h-3" />
                      {location.validated ? 'Marquer en attente' : 'Valider'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {location.distanceToCampus !== null ? `${location.distanceToCampus} km` : '--'}
                  </td>
                  <td
                    className="px-5 py-4 text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(location);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(location)}
                        className="p-2 rounded-lg bg-delta-negative/10 text-delta-negative hover:bg-delta-negative/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg rounded-[2rem] border border-border bg-card p-6">
            <h3 className="text-lg font-black text-foreground mb-4">
              {editing ? 'Modifier la location' : 'Nouvelle location'}
            </h3>
            <LocationForm
              initialData={editing}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              isLoading={loading}
            />
          </div>
        </div>
      )}

      {drawerLocation && (
        <div className="fixed inset-0 z-[90] flex bg-black/40">
          <div className="ml-auto h-full w-full max-w-md overflow-y-auto rounded-l-[2rem] border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Coordonnées</p>
                <h2 className="text-xl font-black text-foreground">{drawerLocation.city}</h2>
              </div>
              <button onClick={closeDrawer} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <MapContainer
                center={[drawerLocation.latitude || 0, drawerLocation.longitude || 0]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-64 w-full rounded-2xl"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {drawerLocation.latitude && drawerLocation.longitude && (
                  <Marker position={[drawerLocation.latitude, drawerLocation.longitude]} />
                )}
                {selectedCampus &&
                  drawerLocation.latitude != null &&
                  drawerLocation.longitude != null &&
                  selectedCampus.latitude != null &&
                  selectedCampus.longitude != null && (
                  <Polyline
                    positions={[
                      [drawerLocation.latitude, drawerLocation.longitude],
                      [selectedCampus.latitude, selectedCampus.longitude],
                    ]}
                    pathOptions={{ color: '#3b82f6' }}
                  />
                )}
              </MapContainer>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Adresse : <span className="text-foreground">{drawerLocation.address || 'Non définie'}</span>
                </p>
                <p>
                  Région : <span className="text-foreground">{drawerLocation.region || 'Non définie'}</span>
                </p>
                <p>
                  Pays : <span className="text-foreground">{drawerLocation.country || 'Non défini'}</span>
                </p>
                <p>
                  Coordonnées : <span className="text-foreground">{drawerLocation.latitude ?? '--'} / {drawerLocation.longitude ?? '--'}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={closeDrawer} />
        </div>
      )}
    </div>
  );
}
