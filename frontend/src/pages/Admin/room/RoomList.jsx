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
import Pagination from '@/components/Pagination';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);

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
    return rooms.filter((r) => {
      const matchesSearch =
        r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.campus?.campus_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && r.is_available) ||
        (availabilityFilter === 'occupied' && !r.is_available);
      return matchesSearch && matchesAvailability;
    });
  }, [rooms, searchTerm, availabilityFilter]);
  const PAGE_SIZE = 10;
  useEffect(() => {
    setPage(1);
  }, [searchTerm, rooms.length]);
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const pagedRooms = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRooms.slice(start, start + PAGE_SIZE);
  }, [filteredRooms, page]);

  if (loading && rooms.length === 0) {
    return <div className="p-4 md:p-8 max-w-[1600px] mx-auto"><Progress value={40} className="h-1 w-full" /></div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER (Style Campus) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Salles de classe</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Gestion des locaux et capacités</p>
          </div>
        </div>
        <Button 
          onClick={() => { setEditingData(null); setShowForm(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nouvelle Salle
        </Button>
      </div>

      {/* --- FILTRES --- */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
            <input 
              type="text"
              placeholder="Rechercher une salle ou un campus..."
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <select
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-foreground/80 bg-card focus:ring-4 focus:ring-muted/40 outline-none transition-all"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">Toutes les salles</option>
              <option value="available">Salles disponibles</option>
              <option value="occupied">Salles occupées</option>
            </select>
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            {filteredRooms.length} Salles répertoriées
          </Badge>
        </div>

        {/* --- TABLEAU --- */}
        <div className="overflow-x-auto">
          {filteredRooms.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-muted-foreground/60">
              <DoorOpen className="w-12 h-12 mb-3 opacity-10" />
              <p className="font-bold text-muted-foreground/80 text-sm">Aucune salle trouvée</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Code Salle</th>
                  <th className="px-6 py-4">Capacité</th>
                  <th className="px-6 py-4">Disponibilité</th>
                  <th className="px-6 py-4">Localisation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pagedRooms.map((room) => (
                  <tr key={room.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-[10px] group-hover:bg-gradient-to-tr group-hover:from-primary/90 group-hover:to-secondary group-hover:text-primary-foreground transition-all shadow-sm">
                          {room.code?.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="font-bold text-foreground text-sm tracking-tight">{room.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                        <Users className="w-3.5 h-3.5 text-muted-foreground/80" />
                        {room.capacity} places
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {room.is_available ? (
                        <Badge className="bg-delta-positive/10 text-delta-positive border-none shadow-none font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> Disponible
                        </Badge>
                      ) : (
                        <Badge className="bg-delta-negative/10 text-delta-negative border-none shadow-none font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Occupée
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/80" />
                        {room.campus?.campus_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingData(room); setShowForm(true); }}
                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(room.id)}
                          className="p-2 text-delta-negative hover:bg-delta-negative/10 rounded-lg transition-colors"
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
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* --- MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-border/60 flex justify-between items-center bg-muted/50">
              <h3 className="font-black text-foreground tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/90 to-secondary flex items-center justify-center text-primary-foreground">
                   <Plus className="w-4 h-4" />
                 </div>
                 {editingData ? 'Modifier la salle' : 'Nouvelle salle'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground/80 hover:text-muted-foreground transition-colors p-2"><X className="w-5 h-5" /></button>
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
          notification.type === 'error' ? 'bg-delta-negative/10 border-delta-negative/20 text-delta-negative' : 'bg-delta-positive/10 border-delta-positive/20 text-delta-positive'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
