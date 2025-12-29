import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  UserCheck, 
  CalendarDays, 
  ChevronDown, 
  Loader2, 
  CheckCircle2,
  GraduationCap,
  DoorOpen
} from 'lucide-react';

export default function ProgrammationForm({ 
  initialData = null, 
  subjects = [], 
  programmers = [], 
  years = [], 
  campuses = [],
  rooms = [],
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    day: '',
    hour_star: '',
    hour_end: '',
    subject_id: '',
    programmer_id: '',
    year_id: '',
    campus_id: '',
    room_id: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const campusId = initialData.campus_id || initialData.room?.campus_id || '';
      setFormData({
        day: initialData.day || '',
        hour_star: initialData.hour_star || '',
        hour_end: initialData.hour_end || '',
        subject_id: initialData.subject_id || '',
        programmer_id: initialData.programmer_id || '',
        year_id: initialData.year_id || '',
        campus_id: campusId,
        room_id: initialData.room_id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.errors) setErrors(error.errors);
    }
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const filteredRooms = useMemo(() => {
    if (!formData.campus_id) return rooms;
    return rooms.filter((room) => String(room.campus_id) === String(formData.campus_id));
  }, [rooms, formData.campus_id]);

  const inputClasses = (name) => `
    w-full px-4 py-3 border bg-slate-50/50 rounded-2xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-4
    ${errors[name] ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-400'}
  `;

  const labelClasses = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- JOUR ET MATIÈRE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Jour de la semaine *</label>
          <select 
            name="day" 
            value={formData.day}
            onChange={handleChange}
            className={`${inputClasses('day')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Choisir un jour --</option>
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          {errors.day && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.day[0]}</p>}
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}><BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Matière *</label>
          <select 
            name="subject_id" 
            value={formData.subject_id}
            onChange={handleChange}
            className={`${inputClasses('subject_id')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Sélectionner --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.subject_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* --- CRÉNEAU HORAIRE --- */}
      <div className="bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100">
        <label className={labelClasses}><Clock className="w-3.5 h-3.5 text-indigo-500" /> Plage Horaire</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <input
              type="time"
              name="hour_star"
              value={formData.hour_star}
              onChange={handleChange}
              className={inputClasses('hour_star')}
              required
            />
          </div>
          <div className="space-y-1">
            <input
              type="time"
              name="hour_end"
              value={formData.hour_end}
              onChange={handleChange}
              className={inputClasses('hour_end')}
              required
            />
          </div>
        </div>
      </div>

      {/* --- PROGRAMMATEUR ET ANNÉE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Responsable</label>
          <select 
            name="programmer_id" 
            value={formData.programmer_id}
            onChange={handleChange}
            className={`${inputClasses('programmer_id')} appearance-none cursor-pointer`}
          >
            <option value="">-- Optionnel --</option>
            {programmers.map((p) => (
              <option key={p.id} value={p.id}>{p.registration_number}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}><CalendarDays className="w-3.5 h-3.5 text-indigo-500" /> Année Académique *</label>
          <select 
            name="year_id" 
            value={formData.year_id}
            onChange={handleChange}
            className={`${inputClasses('year_id')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Sélectionner --</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.date_star} - {y.date_end}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* --- CAMPUS & SALLE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 relative group">
          <label className={labelClasses}><GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Campus *</label>
          <select 
            name="campus_id" 
            value={formData.campus_id}
            onChange={handleChange}
            className={`${inputClasses('campus_id')} appearance-none cursor-pointer`}
            required
          >
            <option value="">-- Sélectionner --</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>{campus.campus_name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="space-y-1 relative group">
          <label className={labelClasses}><DoorOpen className="w-3.5 h-3.5 text-indigo-500" /> Salle (auto si vide)</label>
          <select 
            name="room_id" 
            value={formData.room_id}
            onChange={handleChange}
            className={`${inputClasses('room_id')} appearance-none cursor-pointer`}
          >
            <option value="">-- Auto assignation --</option>
            {filteredRooms.map((room) => (
              <option key={room.id} value={room.id}>{room.code} • {room.capacity} places</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-[2] bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-2xl py-7 h-auto shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold tracking-tight text-base">
                {initialData ? 'Mettre à jour le planning' : 'Confirmer la programmation'}
              </span>
            </div>
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-2xl py-7 h-auto font-bold transition-all"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
