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
import { programmersService } from '@/services/programmerService';
import { campusService } from '@/services/campusService';
import { roomService } from '@/services/roomService';
import ProgrammationForm from './ProgrammationForm';

export default function TimetableDashboard() {
  const [programmations, setProgrammations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [years, setYears] = useState([]);
  const [programmers, setProgrammers] = useState([]);
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

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
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
        const [specData, subjectData, teacherData, levelData, yearData, programmerData, campusData, roomData] = await Promise.all([
          specialtyService.getAll(),
          subjectService.getAll(),
          teacherService.getAll(),
          levelService.getAll(),
          yearService.getAll(),
          programmersService.getAll(),
          campusService.getAll(),
          roomService.getAll(),
        ]);
        setSpecialties(specData || []);
        setSubjects(subjectData || []);
        setTeachers(teacherData || []);
        setLevels(levelData || []);
        setYears(yearData || []);
        setProgrammers(programmerData || []);
        setCampuses(campusData || []);
        setRooms(roomData || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const params = {};
    if (viewMode === 'specialty' && selectedSpecialty) params.specialty_id = selectedSpecialty;
    if (viewMode === 'teacher' && selectedTeacher) params.teacher_id = selectedTeacher;
    if (selectedLevel) params.level_id = selectedLevel;
    if (selectedYear) params.year_id = selectedYear;

    programmationService.getAll(params).then(setProgrammations).catch(() => setProgrammations([]));
  }, [viewMode, selectedSpecialty, selectedTeacher, selectedLevel, selectedYear]);

  const selectedSpecialtyObj = useMemo(
    () => specialties.find((s) => String(s.id) === String(selectedSpecialty)),
    [specialties, selectedSpecialty]
  );

  const headerInfo = useMemo(() => {
    const first = programmations[0];
    return {
      schoolResponsible: selectedSpecialtyObj?.sector?.school?.responsible?.name || '---',
      programmer: selectedSpecialtyObj?.programmer?.user?.name || selectedSpecialtyObj?.programmer?.registration_number || '---',
      etablishment: first?.room?.campus?.etablishment?.etablishment_name || '---',
      campus: first?.room?.campus?.campus_name || '---',
      specialtyLabel: selectedSpecialtyObj ? `${selectedSpecialtyObj.specialty_name} (${selectedSpecialtyObj.code || '-'})` : '---',
      teacherLabel: teachers.find((t) => String(t.id) === String(selectedTeacher))?.user?.name || '---',
    };
  }, [programmations, selectedSpecialtyObj, teachers, selectedTeacher]);

  const handleCreate = (seed) => {
    setFormSeed({ ...seed, year_id: selectedYear || '' });
    setEditingData(null);
    setShowForm(true);
  };

  const handleEdit = (prog) => {
    setFormSeed(null);
    setEditingData(prog);
    setShowForm(true);
  };

  const handleDelete = async (prog) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    await programmationService.delete(prog.id);
    const params = {};
    if (viewMode === 'specialty' && selectedSpecialty) params.specialty_id = selectedSpecialty;
    if (viewMode === 'teacher' && selectedTeacher) params.teacher_id = selectedTeacher;
    if (selectedLevel) params.level_id = selectedLevel;
    if (selectedYear) params.year_id = selectedYear;
    const data = await programmationService.getAll(params);
    setProgrammations(data || []);
  };

  const handleSubmit = async (data) => {
    if (editingData) {
      await programmationService.update(editingData.id, data);
    } else {
      await programmationService.create(data);
    }
    setShowForm(false);
    setEditingData(null);
    setFormSeed(null);
    const params = {};
    if (viewMode === 'specialty' && selectedSpecialty) params.specialty_id = selectedSpecialty;
    if (viewMode === 'teacher' && selectedTeacher) params.teacher_id = selectedTeacher;
    if (selectedLevel) params.level_id = selectedLevel;
    if (selectedYear) params.year_id = selectedYear;
    const fresh = await programmationService.getAll(params);
    setProgrammations(fresh || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900">Vue Calendrier</h2>
          <p className="text-slate-500 text-xs font-medium">Tableau gris interactif par spécialité ou enseignant</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold shadow-lg shadow-indigo-100"
          >
            <Printer className="w-4 h-4" />
            Imprimer / PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode('specialty')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
              viewMode === 'specialty' ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-slate-200'
            }`}
          >
            Par spécialité
          </button>
          <button
            type="button"
            onClick={() => setViewMode('teacher')}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
              viewMode === 'teacher' ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-slate-200'
            }`}
          >
            Par enseignant
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="space-y-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Spécialité
            <select
              className="w-full px-3 py-2 border rounded-xl text-sm text-slate-700"
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

          <label className="space-y-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Enseignant
            <select
              className="w-full px-3 py-2 border rounded-xl text-sm text-slate-700"
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

          <label className="space-y-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Niveau
            <select
              className="w-full px-3 py-2 border rounded-xl text-sm text-slate-700"
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

          <label className="space-y-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Année
            <select
              className="w-full px-3 py-2 border rounded-xl text-sm text-slate-700"
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

      <div ref={componentRef} className="p-4 bg-white rounded-[2.5rem]">
        <div className="mb-6 border-b-2 border-slate-200 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold uppercase text-slate-500 tracking-widest">
            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Responsable école: {headerInfo.schoolResponsible}</div>
            <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Responsable niveau: {headerInfo.programmer}</div>
            <div className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" /> Spécialité: {headerInfo.specialtyLabel}</div>
            <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> Établissement: {headerInfo.etablishment}</div>
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Campus: {headerInfo.campus}</div>
            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Enseignant: {headerInfo.teacherLabel}</div>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-400 p-6">Chargement...</div>
        ) : (
          <TimetableGrid
            programmations={programmations}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <div className="hidden print:block mt-6 text-center text-[9px] text-slate-400 font-medium">
          Document officiel généré par l'application de gestion académique.
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight text-lg text-indigo-600">
                {editingData ? 'Modifier la séance' : 'Nouvelle programmation'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2">×</button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <ProgrammationForm
                initialData={editingData || formSeed}
                subjects={subjects}
                programmers={programmers}
                years={years}
                campuses={campuses}
                rooms={rooms}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
