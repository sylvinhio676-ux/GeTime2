import React, { useEffect, useState, useMemo } from 'react';
import { programmersService } from '@/services/programmerService';
import { Button } from '@/components/ui/button';
import ProgrammerForm from './ProgrammerForm';
import { DeleteIcon, Edit3Icon, CircleUser, Search, AlertCircle, CheckCircle2, X, Mail, Phone, PhoneIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/context/useAuth';

export default function ProgrammerList() {
  const [programmers, setProgrammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const { hasRole } = useAuth();
  const isAdmin = hasRole("super_admin") || hasRole("admin");

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
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, programmers.length]);
  const totalPages = Math.max(1, Math.ceil(filteredProgrammers.length / PAGE_SIZE));
  const pagedProgrammers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProgrammers.slice(start, start + PAGE_SIZE);
  }, [filteredProgrammers, page]);

  if (loading && programmers.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={35} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <CircleUser className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Programmeurs</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion des planificateurs</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setShowForm(true);
              cancelEdit();
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
          >
            Ajouter un programmeur
          </Button>
        )}
      </div>

      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative' : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input
              type="text"
              placeholder="Rechercher un programmeur..."
              className="w-full pl-12 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="bg-muted text-foreground/80 border-none font-bold px-4 py-1">
            {filteredProgrammers.length} Programmeurs
          </Badge>
        </div>

        {showForm && isAdmin && (
          <div className="p-6 border-b border-border/60 bg-card">
            <ProgrammerForm
              initialData={editFormData}
              onSubmit={editingId ? handleUpdate : handleCreate}
              isLoading={loading}
            />
            <div className="mt-4">
              <Button
                onClick={cancelEdit}
                variant="ghost"
                className="text-muted-foreground"
              >
                Fermer
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredProgrammers.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/80">
              <CircleUser className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-bold">Aucun programmeur trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[850px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-8 py-5">Matricule</th>
                  <th className="px-8 py-5">Utilisateur</th>
                  <th className="px-8 py-5">Établissement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedProgrammers.map((p) => (
                  <tr key={p.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-8 py-5">
                      <Badge variant="outline" className="font-mono text-muted-foreground border-border/60 bg-muted/30">
                        {p.registration_number}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-foreground font-bold">{p.user?.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{p.user?.email || '—'}</div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground font-medium">
                      {p.etablishment?.etablishment_name || '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(p)}
                            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <Edit3Icon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                    {/* button pour appeler un programmeur ou l'envoier un mail */}
                    <div className='flex justify-center gap-2 transition-opacity'>
                      <a href={`mailto${programmers.user?.email}`} className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                      {programmers.user?.phone && (
                        <a href={`tel:${programmers.user?.phone}`} className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                          <PhoneIcon className="w-4 h-4" />
                        </a>
                      ) }
                    </div>
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
