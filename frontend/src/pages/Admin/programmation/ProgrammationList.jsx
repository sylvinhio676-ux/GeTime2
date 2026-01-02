import React, { useEffect, useState, useMemo } from 'react';
import { programmationService } from '../../../services/programmationService';
import { subjectService } from '../../../services/subjectService';
import { programmersService } from '../../../services/programmerService';
import { yearService } from '../../../services/yearService';
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
  const [programmers, setProgrammers] = useState([]);
  const [years, setYears] = useState([]);
  const [levels, setLevels] = useState([]); // Ajouté
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Récupération de toutes les dépendances en parallèle
      const [progData, subData, profData, yearData, levelData, campusData, roomData] = await Promise.all([
        programmationService.getAll(),
        subjectService.getAll(),
        programmersService.getAll(),
        yearService.getAll(),
        levelService.getAll(), // Ajouté
        campusService.getAll(),
        roomService.getAll(),
      ]);
      setProgrammations(progData || []);
      setSubjects(subData || []);
      setProgrammers(profData || []);
      setYears(yearData || []);
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
  }, [searchTerm, programmations.length]);
  const totalPages = Math.max(1, Math.ceil(filteredProgrammations.length / PAGE_SIZE));
  const pagedProgrammations = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProgrammations.slice(start, start + PAGE_SIZE);
  }, [filteredProgrammations, page]);

  if (loading && programmations.length === 0) {
    return <div className="p-6 max-w-6xl mx-auto"><Progress value={45} className="h-1" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Planning & Programmation</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion universitaire par filière et salle</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Programmer un cours
        </Button>
      </div>

      {/* --- FILTRES --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher matière, groupe ou jour..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredProgrammations.length} Sessions programmées
          </Badge>
        </div>

        {/* --- TABLEAU --- */}
        <div className="overflow-x-auto">
          {filteredProgrammations.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-300">
              <CalendarRange className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-slate-400 text-sm">Aucune programmation trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Jour & Horaire</th>
                  <th className="px-6 py-4">Matière / Groupe</th>
                  <th className="px-6 py-4">Année / Campus</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedProgrammations.map((prog) => (
                  <tr key={prog.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Badge className="w-fit bg-indigo-50 text-indigo-700 border-none shadow-none font-black text-[10px] px-3 py-1 rounded-lg uppercase">
                          {prog.day}
                        </Badge>
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-500 italic">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          {prog.hour_star} — {prog.hour_end}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm tracking-tight">{prog.subject?.subject_name}</p>
                          <div className="flex items-center gap-1.5 text-indigo-500 font-bold text-[10px] uppercase mt-0.5">
                            <GraduationCap className="w-3 h-3" />
                            {prog.subject?.specialty?.level?.name_level || 'Groupe non défini'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                             <CalendarDays className="w-3.5 h-3.5 text-slate-300" />
                             {prog.year?.date_star}
                           </div>
                           <div className="text-[11px] text-slate-500 font-semibold">
                             {prog.room?.campus?.campus_name || 'Campus non défini'}
                           </div>
                           <div className="text-[11px] text-slate-400 font-semibold">
                             {prog.room?.code ? `Salle ${prog.room.code}` : 'Salle auto'}
                           </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {setEditingData(prog); setShowForm(true);}} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(prog.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-3 text-lg text-indigo-600">
                 {editingData ? 'Modifier la séance' : 'Nouvelle programmation'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <ProgrammationForm
                initialData={editingData}
                subjects={subjects}
                programmers={programmers}
                years={years}
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
