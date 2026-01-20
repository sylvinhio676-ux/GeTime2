import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import TimetableGrid from './TimetableGrid';
import { Printer, Users, GraduationCap, User, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { programmationService } from '@/services/programmationService';
import { specialtyService } from '@/services/specialtyService';
import { subjectService } from '@/services/subjectService';
import { teacherService } from '@/services/teacherService';
import { levelService } from '@/services/levelService';
import { yearService } from '@/services/yearService';
import { campusService } from '@/services/campusService';
import { roomService } from '@/services/roomService';
import ProgrammationForm from './ProgrammationForm';

export default function TimetableDashboard({ readOnly = false }) {
  const [programmations, setProgrammations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [years, setYears] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('specialty');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formSeed, setFormSeed] = useState(null);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    contentRef: componentRef,
    documentTitle: `Emploi_du_temps_${selectedSpecialty || selectedTeacher || 'General'}`,
    pageStyle: `
      @page { size: landscape; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none; }
      }
    `,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [specData, subjectData, teacherData, levelData, yearData, campusData, roomData] = await Promise.all([
          specialtyService.getAll(),
          subjectService.getAll(),
          teacherService.getAll(),
          levelService.getAll(),
          yearService.getAll(),
          campusService.getAll(),
          roomService.getAll(),
        ]);
        setSpecialties(specData || []);
        setSubjects(subjectData || []);
        setTeachers(teacherData || []);
        setLevels(levelData || []);
        setYears(yearData || []);
        setCampuses(campusData || []);
        setRooms(roomData || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (viewMode === 'specialty' && !selectedSpecialty) {
      setProgrammations([]);
      return;
    }
    if (viewMode === 'teacher' && !selectedTeacher) {
      setProgrammations([]);
      return;
    }

    const params = {};
    if (viewMode === 'specialty') params.specialty_id = selectedSpecialty;
    if (viewMode === 'teacher') params.teacher_id = selectedTeacher;
    if (selectedLevel) params.level_id = selectedLevel;
    if (selectedYear) params.year_id = selectedYear;

    programmationService
      .getAll(params)
      .then(setProgrammations)
      .catch(() => setProgrammations([]));
  }, [viewMode, selectedSpecialty, selectedTeacher, selectedLevel, selectedYear]);

  const selectedSpecialtyObj = useMemo(
    () => specialties.find((s) => String(s.id) === String(selectedSpecialty)),
    [specialties, selectedSpecialty]
  );

  const headerInfo = useMemo(() => {
    const first = programmations[0];
    const teacherName = viewMode === 'teacher'
      ? teachers.find((t) => String(t.id) === String(selectedTeacher))?.user?.name
      : first?.subject?.teacher?.user?.name;
    return {
      schoolResponsible: selectedSpecialtyObj?.sector?.school?.responsible?.name || '---',
      programmer: selectedSpecialtyObj?.programmer?.user?.name || selectedSpecialtyObj?.programmer?.registration_number || '---',
      etablishment: first?.room?.campus?.etablishment?.etablishment_name || '---',
      campus: first?.room?.campus?.campus_name || '---',
      specialtyLabel: selectedSpecialtyObj ? `${selectedSpecialtyObj.specialty_name} (${selectedSpecialtyObj.code || '-'})` : '---',
      teacherLabel: teacherName || '---',
    };
  }, [programmations, selectedSpecialtyObj, teachers, selectedTeacher, viewMode]);

  const handleCreate = (seed) => {
    if (readOnly) return;
    setFormError('');
    setFormSeed({ ...seed, year_id: selectedYear || '' });
    setEditingData(null);
    setShowForm(true);
  };

  const handleEdit = (prog) => {
    if (readOnly) return;
    setFormError('');
    setFormSeed(null);
    setEditingData(prog);
    setShowForm(true);
  };

  const handleDelete = async (prog) => {
    if (readOnly) return;
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      await programmationService.delete(prog.id);
      const params = {};
      if (viewMode === 'specialty' && selectedSpecialty) params.specialty_id = selectedSpecialty;
      if (viewMode === 'teacher' && selectedTeacher) params.teacher_id = selectedTeacher;
      if (selectedLevel) params.level_id = selectedLevel;
      if (selectedYear) params.year_id = selectedYear;
      const data = await programmationService.getAll(params);
      setProgrammations(data || []);
      showNotify('Créneau supprimé', 'success');
    } catch (error) {
      showNotify(getErrorMessage(error, 'Erreur de suppression'), 'error');
    }
  };

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || error.error || fallback;
  };

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingData) {
        await programmationService.update(editingData.id, data);
        showNotify('Programmation mise à jour', 'success');
      } else {
        await programmationService.create(data);
        showNotify('Programmation créée', 'success');
      }
      setShowForm(false);
      setEditingData(null);
      setFormSeed(null);
      setFormError('');
      const params = {};
      if (viewMode === 'specialty' && selectedSpecialty) params.specialty_id = selectedSpecialty;
      if (viewMode === 'teacher' && selectedTeacher) params.teacher_id = selectedTeacher;
      if (selectedLevel) params.level_id = selectedLevel;
      if (selectedYear) params.year_id = selectedYear;
      const fresh = await programmationService.getAll(params);
      setProgrammations(fresh || []);
    } catch (error) {
      const message = getErrorMessage(error, "Conflit détecté sur ce créneau.");
      setFormError(message);
      showNotify(message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          <span className="text-sm font-bold">{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '', type: '' })} className="ml-4 opacity-50">
            ✕
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            {readOnly ? 'Emploi du Temps' : 'Planning'}
          </h2>
          <p className="text-muted-foreground text-xs font-medium">
            {readOnly ? 'Vue des séances déjà programmées' : 'Tableau gris interactif par spécialité ou enseignant'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"
          >
            <Printer className="w-4 h-4" />
            Imprimer / PDF
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] border border-border p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode('specialty')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
              viewMode === 'specialty' ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground border-border'
            }`}
          >
            Par spécialité
          </button>
          <button
            type="button"
            onClick={() => setViewMode('teacher')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
              viewMode === 'teacher' ? 'bg-blue-700 text-white border-blue-700' : 'text-slate-500 border-slate-200'
            }`}
          >
            Par enseignant
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Spécialité
            <select
              className="w-full px-3 py-2 border-border rounded-xl text-sm text-foreground bg-input"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              disabled={viewMode !== 'specialty'}
            >
              <option value="">-- Choisir --</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.specialty_name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </label>

            <label className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Enseignant
            <select
              className="w-full px-3 py-2 border-border rounded-xl text-sm text-foreground bg-input"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              disabled={viewMode !== 'teacher'}
            >
              <option value="">-- Choisir --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.name || `Prof. ${t.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Niveau
            <select
              className="w-full px-3 py-2 border-border rounded-xl text-sm text-foreground bg-input"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">-- Tous --</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name_level}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Année
            <select
              className="w-full px-3 py-2 border-border rounded-xl text-sm text-foreground bg-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">-- Toutes --</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.date_star} - {y.date_end}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div ref={componentRef} className="p-4 bg-card rounded-[2.5rem] border border-border">
        <div className="mb-6 border-b-2 border-border pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold uppercase text-muted-foreground tracking-widest">
            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Responsable école: {headerInfo.schoolResponsible}</div>
            <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Responsable niveau: {headerInfo.programmer}</div>
            <div className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" /> Spécialité: {headerInfo.specialtyLabel}</div>
            <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> Établissement: {headerInfo.etablishment}</div>
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Campus: {headerInfo.campus}</div>
            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Enseignant: {headerInfo.teacherLabel}</div>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground/80 p-6">Chargement...</div>
        ) : (
          <TimetableGrid
            programmations={programmations}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            readOnly={readOnly}
          />
        )}

        <div className="hidden print:block mt-6 text-center text-[9px] text-slate-400 font-medium">
          Document officiel généré par l'application de gestion académique.
        </div>
      </div>

      {showForm && !readOnly && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight text-lg">
                {editingData ? 'Modifier la séance' : 'Nouvelle programmation'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2">×</button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <ProgrammationForm
                initialData={editingData || formSeed}
                subjects={subjects}
                campuses={campuses}
                rooms={rooms}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={false}
                formError={formError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
