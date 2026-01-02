import React, { useEffect, useState, useMemo } from 'react';
import { programmersService } from '@/services/programmerService';
import { Button } from '@/components/ui/button';
import ProgrammerForm from './ProgrammerForm';
import { DeleteIcon, Edit3Icon, CircleUser, Search, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';

export default function ProgrammerList() {
  const [programmers, setProgrammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
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

  // Fetch all programmers
  useEffect(() => {
    fetchProgrammers();
  }, []);

  const fetchProgrammers = async () => {
    try {
      setLoading(true);
      const data = await programmersService.getAll();
      setProgrammers(data);
    } catch (err) {
      showNotify(getErrorMessage(err, 'Erreur de récupération'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create
  const handleCreate = async (formData) => {
    try {
      await programmersService.create(formData);
      showNotify('Programmeur créé avec succès');
      setShowForm(false);
      fetchProgrammers();
    } catch (err) {
      showNotify(getErrorMessage(err, 'Erreur lors de la création'), 'error');
    }
  };

  // Update
  const handleUpdate = async (formData) => {
    try {
      await programmersService.update(editingId, formData);
      showNotify('Programmeur modifié avec succès');
      setEditingId(null);
      setEditFormData(null);
      setShowForm(false);
      fetchProgrammers();
    } catch (err) {
      showNotify(getErrorMessage(err, 'Erreur lors de la modification'), 'error');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce programmeur ?")) return;

    try {
      await programmersService.delete(id);
      showNotify('Programmeur supprimé avec succès');
      fetchProgrammers();
    } catch (err) {
      showNotify(getErrorMessage(err, 'Erreur lors de la suppression'), 'error');
    }
  };

  const startEdit = (programmer) => {
    setEditingId(programmer.id);
    setEditFormData(programmer);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
    setShowForm(false);
  };

  const filteredProgrammers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return programmers.filter((p) =>
      p.registration_number?.toLowerCase().includes(term) ||
      p.user?.name?.toLowerCase().includes(term) ||
      p.user?.email?.toLowerCase().includes(term) ||
      p.etablishment?.etablishment_name?.toLowerCase().includes(term)
    );
  }, [programmers, searchTerm]);
  const PAGE_SIZE = 5;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, programmers.length]);
  const totalPages = Math.max(1, Math.ceil(filteredProgrammers.length / PAGE_SIZE));
  const pagedProgrammers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProgrammers.slice(start, start + PAGE_SIZE);
  }, [filteredProgrammers, page]);

  if (loading && programmers.length === 0) {
    return <div className="p-6 max-w-6xl mx-auto"><Progress value={35} className="h-1" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <CircleUser className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Programmeurs</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des planificateurs</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            cancelEdit();
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          Ajouter un programmeur
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
              placeholder="Rechercher un programmeur..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold px-4 py-1">
            {filteredProgrammers.length} Programmeurs
          </Badge>
        </div>

        {showForm && (
          <div className="p-6 border-b border-slate-100 bg-white">
            <ProgrammerForm
              initialData={editFormData}
              onSubmit={editingId ? handleUpdate : handleCreate}
              isLoading={loading}
            />
            <div className="mt-4">
              <Button
                onClick={cancelEdit}
                variant="ghost"
                className="text-slate-500"
              >
                Fermer
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredProgrammers.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-400">
              <CircleUser className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucun programmeur trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[850px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Matricule</th>
                  <th className="px-8 py-5">Utilisateur</th>
                  <th className="px-8 py-5">Établissement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedProgrammers.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <Badge variant="outline" className="font-mono text-indigo-600 border-indigo-100 bg-indigo-50/30">
                        {p.registration_number}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-slate-900 font-bold">{p.user?.name || '—'}</div>
                      <div className="text-xs text-slate-500">{p.user?.email || '—'}</div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">
                      {p.etablishment?.etablishment_name || '—'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit3Icon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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
