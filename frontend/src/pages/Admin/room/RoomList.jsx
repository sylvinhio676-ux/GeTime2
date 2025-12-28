import React, { useEffect, useState, useMemo } from 'react';
import { roomService } from '../../../services/roomService';
import { campusService } from '../../../services/campusService';
import RoomForm from './RoomForm';
import { 
  DoorOpen, 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  Pencil, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Check,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [roomsData, campusesData] = await Promise.all([
        roomService.getAll(),
        campusService.getAll()
      ]);
      setRooms(roomsData || []);
      setCampuses(campusesData || []);
    } catch (err) {
      showNotify('Erreur de chargement', 'error');
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
        await roomService.update(editingData.id, formData);
        showNotify('Salle mise à jour');
      } else {
        await roomService.create(formData);
        showNotify('Salle créée avec succès');
      }
      setShowForm(false);
      setEditingData(null);
      fetchInitialData();
    } catch (error) {
      showNotify("Erreur d'enregistrement", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette salle ?')) {
      try {
        await roomService.delete(id);
        showNotify('Salle supprimée');
        setRooms(rooms.filter(r => r.id !== id));
      } catch (error) {
        showNotify('Erreur de suppression', 'error');
      }
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => 
      r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.campus?.campus_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  if (loading && rooms.length === 0) {
    return <div className="p-6 max-w-6xl mx-auto"><Progress value={40} className="h-1 w-full" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER (Style Campus) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Salles de classe</h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">Gestion des locaux et capacités</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nouvelle Salle
        </Button>
      </div>

      {/* --- FILTRES --- */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher une salle ou un campus..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredRooms.length} Salles répertoriées
          </Badge>
        </div>

        {/* --- TABLEAU --- */}
        <div className="overflow-x-auto">
          {filteredRooms.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-300">
              <DoorOpen className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-slate-400 text-sm">Aucune salle trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Code Salle</th>
                  <th className="px-6 py-4">Capacité</th>
                  <th className="px-6 py-4">Disponibilité</th>
                  <th className="px-6 py-4">Localisation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] group-hover:bg-gradient-to-tr group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all shadow-sm">
                          {room.code?.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="font-bold text-slate-900 text-sm tracking-tight">{room.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {room.capacity} places
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {room.is_available ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> Disponible
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-600 border-none shadow-none font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Occupée
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {room.campus?.campus_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingData(room); setShowForm(true); }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(room.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                   <Plus className="w-4 h-4" />
                 </div>
                 {editingData ? 'Modifier la salle' : 'Nouvelle salle'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <RoomForm
                initialData={editingData}
                campuses={campuses}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATIONS POPUP --- */}
      {notification.show && (
        <div className={`fixed bottom-8 right-8 z-[110] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}
    </div>
  );
}