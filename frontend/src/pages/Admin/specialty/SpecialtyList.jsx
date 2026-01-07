import React, { useEffect, useState, useMemo } from 'react';
import { specialtyService } from '../../../services/specialtyService';
import { sectorService } from '../../../services/sectorService';
import { programmersService } from '../../../services/programmerService';
import { levelService } from '../../../services/levelService';
import SpecialtyForm from './SpecialtyForm';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DeleteIcon, EditIcon, GraduationCap, Search, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import Pagination from '@/components/Pagination';

export default function SpecialtyList() {
  const [specialties, setSpecialties] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [programmers, setProgrammers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('super_admin');
  const [page, setPage] = useState(1);

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchSectors();
    fetchProgrammers();
    fetchLevels();
    fetchSpecialties();
  }, []);

  const fetchSectors = async () => {
    try {
      const data = await sectorService.getAll();
      setSectors(data || []);
    } catch (error) {
      console.error('Failed to fetch sectors', error);
    }
  };

  const fetchProgrammers = async () => {
    try {
      const data = await programmersService.getAll();
      setProgrammers(data || []);
    } catch (error) {
      console.error('Failed to fetch programmers', error);
    }
  };

  const fetchLevels = async () => {
    try {
      const data = await levelService.getAll();
      setLevels(data || []);
    } catch (error) {
      console.error('Failed to fetch levels', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const data = await specialtyService.getAll();
      setSpecialties(data);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de chargement des spécialités'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await specialtyService.create(formData);
      showNotify('Spécialité créée avec succès');
      setShowForm(false);
      fetchSpecialties();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la création'), 'error');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await specialtyService.update(editingId, formData);
      showNotify('Spécialité mise à jour');
      setEditingId(null);
      setEditingData(null);
      fetchSpecialties();
      setShowForm(false);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la modification'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this specialty?')) {
      try {
        await specialtyService.delete(id);
        showNotify('Spécialité supprimée');
        fetchSpecialties();
      } catch (error) {
        showNotify(getErrorMessage(error, 'Erreur de suppression'), 'error');
      }
    }
  };

  const startEdit = (specialty) => {
    setEditingId(specialty.id);
    setEditingData(specialty);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(false);
  };

  const filteredSpecialties = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return specialties.filter((s) =>
      s.specialty_name?.toLowerCase().includes(term) ||
      s.code?.toLowerCase().includes(term) ||
      s.sector?.sector_name?.toLowerCase().includes(term) ||
      s.programmer?.registration_number?.toLowerCase().includes(term)
    );
  }, [specialties, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, specialties.length]);
  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / PAGE_SIZE));
  const pagedSpecialties = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSpecialties.slice(start, start + PAGE_SIZE);
  }, [filteredSpecialties, page]);

  if (loading && specialties.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={30} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Spécialités</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des filières spécialisées</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingId(null);
              setEditingData(null);
              setShowForm(true);
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
          >
            Ajouter une spécialité
          </Button>
        )}
      </div>

      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une spécialité..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-slate-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-none font-bold px-4 py-1">
            {filteredSpecialties.length} Spécialités
          </Badge>
        </div>

        {showForm && isAdmin && (
          <div className="p-6 border-b border-slate-100 bg-white">
            <SpecialtyForm
              initialData={editingData}
              sectors={sectors}
              programmers={programmers}
              levels={levels}
              onSubmit={editingId ? handleUpdate : handleCreate}
              onCancel={cancelEdit}
              isLoading={loading}
            />
            <div className="mt-4">
              <Button variant="ghost" className="text-slate-500" onClick={cancelEdit}>
                Fermer
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredSpecialties.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <GraduationCap className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucune spécialité trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Spécialité</th>
                  <th className="px-8 py-5">Code</th>
                  <th className="px-8 py-5">Étudiants</th>
                  <th className="px-8 py-5">Secteur</th>
                  <th className="px-8 py-5">Programmeur</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedSpecialties.map((specialty) => (
                  <tr key={specialty.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900">{specialty.specialty_name}</div>
                      <div className="text-xs text-slate-500">{specialty.description || ''}</div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="outline" className="font-mono text-slate-600 border-slate-100 bg-slate-50/30">
                        {specialty.code || '—'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{specialty.number_student}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium">{specialty.sector?.sector_name || '—'}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {specialty.programmer.user?.name  || '—'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(specialty)}
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(specialty.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
