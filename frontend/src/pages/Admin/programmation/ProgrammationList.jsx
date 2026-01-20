import React, { useEffect, useState, useMemo } from 'react';
import { programmationService } from '../../../services/programmationService';
import { subjectService } from '../../../services/subjectService';
import { levelService } from '../../../services/levelService'; // Ajouté
import { campusService } from '../../../services/campusService';
import { roomService } from '../../../services/roomService';
import ProgrammationForm from './ProgrammationForm';
import { 
  CalendarRange, 
  Plus, 
  Search, 
  Clock, 
  BookOpen, 
  CalendarDays,
  Pencil, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  GraduationCap // Ajouté
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Pagination from '@/components/Pagination';

export default function ProgrammationList() {
  const [programmations, setProgrammations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]); // Ajouté
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  useEffect(() => {
    fetchInitialData();
  }, [statusFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Récupération de toutes les dépendances en parallèle
      const [progData, subData, levelData, campusData, roomData] = await Promise.all([
        programmationService.getAll(statusFilter ? { status: statusFilter } : {}),
        subjectService.getAll(),
        levelService.getAll(), // Ajouté
        campusService.getAll(),
        roomService.getAll(),
      ]);
      setProgrammations(progData || []);
      setSubjects(subData || []);
      setLevels(levelData || []); // Ajouté
      setCampuses(campusData || []);
      setRooms(roomData || []);
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de chargement des données'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingData) {
        await programmationService.update(editingData.id, formData);
        showNotify('Programmation mise à jour');
      } else {
        await programmationService.create(formData);
        showNotify('Nouvelle planification ajoutée');
      }
      setShowForm(false);
      setEditingData(null);
      fetchInitialData();
    } catch (error) {
      showNotify(getErrorMessage(error, "Erreur lors de l'enregistrement"), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous supprimer ce créneau ?')) {
      try {
        await programmationService.delete(id);
        showNotify('Créneau supprimé');
        setProgrammations(programmations.filter(p => p.id !== id));
      } catch (error) {
        showNotify(getErrorMessage(error, 'Erreur de suppression'), 'error');
      }
    }
  }

  const filteredProgrammations = useMemo(() => {
    return programmations.filter(p => 
      p.subject?.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject?.specialty?.level?.name_level?.toLowerCase().includes(searchTerm.toLowerCase()) || // Recherche par niveau
      p.day?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [programmations, searchTerm]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, programmations.length, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredProgrammations.length / PAGE_SIZE));
  const pagedProgrammations = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProgrammations.slice(start, start + PAGE_SIZE);
  }, [filteredProgrammations, page]);

  if (loading && programmations.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={45} className="h-1" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Planning & Programmation</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion universitaire par filière et salle</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Programmer un cours
        </Button>
        <Button
          onClick={async () => {
            try {
              const result = await programmationService.publishValidated();
              showNotify(`${result?.count ?? 0} créneaux publiés`, 'success');
              fetchInitialData();
            } catch (error) {
              showNotify(getErrorMessage(error, "Erreur lors de la publication"), 'error');
            }
          }}
          className="bg-delta-positive hover:bg-delta-positive/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          Publier les validés
        </Button>
      </div>

      {/* --- FILTRES --- */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher matière, groupe ou jour..."
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2.5 border border-border rounded-xl text-sm text-foreground/80 bg-card"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="validated">Validé</option>
            <option value="published">Publié</option>
          </select>
          <Badge variant="outline" className="border-border text-muted-foreground font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredProgrammations.length} Sessions programmées
          </Badge>
        </div>

        {/* --- TABLEAU --- */}
        <div className="overflow-x-auto">
          {filteredProgrammations.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/60">
              <CalendarRange className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-muted-foreground/80 text-sm">Aucune programmation trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Jour & Horaire</th>
                  <th className="px-6 py-4">Matière / Groupe</th>
                  <th className="px-6 py-4">Année / Campus</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedProgrammations.map((prog) => (
                  <tr key={prog.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Badge className="w-fit bg-muted text-foreground/80 border-none shadow-none font-black text-[10px] px-3 py-1 rounded-lg uppercase">
                          {prog.day}
                        </Badge>
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-muted-foreground italic">
                          <Clock className="w-3 h-3 text-muted-foreground/80" />
                          {prog.hour_star} — {prog.hour_end}
                        </div>
                        <Badge
                          className={`w-fit text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                            prog.status === 'published'
                              ? 'bg-delta-positive/10 text-delta-positive'
                              : prog.status === 'validated'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {prog.status === 'published' ? 'Publié' : prog.status === 'validated' ? 'Validé' : 'Brouillon'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted text-muted-foreground/80 flex items-center justify-center group-hover:bg-muted/80 group-hover:text-foreground transition-all shadow-sm">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm tracking-tight">{prog.subject?.subject_name}</p>
                          <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px] uppercase mt-0.5">
                            <GraduationCap className="w-3 h-3" />
                            {prog.subject?.specialty?.level?.name_level || 'Groupe non défini'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                             <CalendarDays className="w-3.5 h-3.5 text-muted-foreground/60" />
                             {prog.year?.date_star}
                           </div>
                           <div className="text-[11px] text-muted-foreground font-semibold">
                             {prog.room?.campus?.campus_name || 'Campus non défini'}
                           </div>
                           <div className="text-[11px] text-muted-foreground/80 font-semibold">
                             {prog.room?.code ? `Salle ${prog.room.code}` : 'Salle auto'}
                           </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {setEditingData(prog); setShowForm(true);}} className="p-2 text-muted-foreground hover:bg-muted rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(prog.id)} className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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

      {/* --- MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-card rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground tracking-tight flex items-center gap-3 text-lg text-muted-foreground">
                 {editingData ? 'Modifier la séance' : 'Nouvelle programmation'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground/80 hover:text-muted-foreground p-2"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <ProgrammationForm
                initialData={editingData}
                subjects={subjects}
                levels={levels} // Passage des niveaux au formulaire
                campuses={campuses}
                rooms={rooms}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS IDEM ... */}
    </div>
  );
}
