import React, { useEffect, useState, useMemo } from 'react';
import { disponibilityService } from '../../../services/disponibilityService';
import { subjectService } from '../../../services/subjectService';
import { etablishmentService } from '../../../services/etablishmentService';
import DisponibilityForm from './DisponibilityForm';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DeleteIcon, EditIcon, CalendarClock, Search, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';

export default function DisponibilityList() {
  const [disponibilities, setDisponibilities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [etablishments, setEtablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
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
    fetchSubjects();
    fetchEtablishments();
    fetchDisponibilities();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data || []);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  const fetchEtablishments = async () => {
    try {
      const data = await etablishmentService.getAll();
      setEtablishments(data || []);
    } catch (error) {
      console.error('Failed to fetch etablishments', error);
    }
  };

  const fetchDisponibilities = async () => {
    try {
      setLoading(true);
      const data = await disponibilityService.getAll();
      setDisponibilities(data);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de chargement des disponibilités'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await disponibilityService.create(formData);
      showNotify('Disponibilité créée avec succès');
      setShowForm(false);
      fetchDisponibilities();
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la création'), 'error');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await disponibilityService.update(editingId, formData);
      showNotify('Disponibilité mise à jour');
      setEditingId(null);
      setEditingData(null);
      fetchDisponibilities();
      setShowForm(false);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur lors de la modification'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this disponibility?')) {
      try {
        await disponibilityService.delete(id);
        showNotify('Disponibilité supprimée');
        fetchDisponibilities();
      } catch (error) {
        showNotify(getErrorMessage(error, 'Erreur de suppression'), 'error');
      }
    }
  };

  const startEdit = (disponibility) => {
    setEditingId(disponibility.id);
    setEditingData(disponibility);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(false);
  };

  const filteredDisponibilities = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return disponibilities.filter((d) =>
      d.day?.toLowerCase().includes(term) ||
      d.subject?.subject_name?.toLowerCase().includes(term) ||
      d.etablishment?.etablishment_name?.toLowerCase().includes(term)
    );
  }, [disponibilities, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, disponibilities.length]);
  const totalPages = Math.max(1, Math.ceil(filteredDisponibilities.length / PAGE_SIZE));
  const pagedDisponibilities = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDisponibilities.slice(start, start + PAGE_SIZE);
  }, [filteredDisponibilities, page]);

  if (loading && disponibilities.length === 0) {
    return <div className="p-6 max-w-6xl mx-auto"><Progress value={25} className="h-1" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Disponibilités</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des créneaux enseignants</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setEditingData(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          Ajouter une disponibilité
        </Button>
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
              placeholder="Rechercher une disponibilité..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold px-4 py-1">
            {filteredDisponibilities.length} Disponibilités
          </Badge>
        </div>

        {showForm && (
          <div className="p-6 border-b border-slate-100 bg-white">
            <DisponibilityForm
              initialData={editingData}
              subjects={subjects}
              etablishments={etablishments}
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
          {filteredDisponibilities.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <CalendarClock className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucune disponibilité trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Jour</th>
                  <th className="px-8 py-5">Heure</th>
                  <th className="px-8 py-5">Matière</th>
                  <th className="px-8 py-5">Établissement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedDisponibilities.map((disp) => (
                  <tr key={disp.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-900">{disp.day}</td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {disp.hour_star} - {disp.hour_end}
                    </td>
                    <td className="px-8 py-5 text-slate-900 font-bold">
                      {disp.subject?.subject_name || '—'}
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {disp.etablishment?.etablishment_name || '—'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(disp)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(disp.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
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
