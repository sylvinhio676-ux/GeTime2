import React, { useEffect, useState, useMemo } from 'react';
import { roomService } from '../../../services/roomService';
import { campusService } from '../../../services/campusService';
import RoomForm from './RoomForm';
import { 
  DoorOpen, Plus, Search, Users, MapPin, Pencil, 
  Trash2, X, AlertCircle, CheckCircle2, Check, Ban 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const PAGE_SIZE = 10;

  useEffect(() => { fetchInitialData(); }, []);

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
    } finally { setLoading(false); }
  };

  // --- LOGIQUE : OCCUPÉE SI UNE PROGRAMMATION EXISTE ---
  const checkIsOccupied = (room) => {
    // 1. On regarde si is_available est à 0 (B102 et E105 dans ton SQL)
    if (Number(room.is_available) === 0) return true;
    
    // 2. On regarde si la liste des programmations n'est pas vide
    // IMPORTANT : regarde bien le nom du champ envoyé par ton API (souvent 'programmations')
    const hasPlans = room.programmations && room.programmations.length > 0;
    
    return hasPlans; // Si Vrai, la salle affichera "Occupée"
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesSearch = 
        r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.campus?.campus_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isOccupied = checkIsOccupied(r);

      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && !isOccupied) ||
        (availabilityFilter === 'occupied' && isOccupied);
        
      return matchesSearch && matchesAvailability;
    });
  }, [rooms, searchTerm, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const pagedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        fetchInitialData();
      } catch (error) {
        showNotify('Erreur de suppression', 'error');
      }
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <DoorOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Salles de classe</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Occupation basée sur les programmations</p>
          </div>
        </div>
        <Button onClick={() => { setEditingData(null); setShowForm(true); }} className="rounded-xl px-6 py-6 h-auto font-bold gap-2 shadow-md">
          <Plus className="w-5 h-5" /> Nouvelle Salle
        </Button>
      </div>

      {/* FILTRES */}
      <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" placeholder="Rechercher salle ou campus..."
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <select
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-card outline-none font-bold text-foreground"
              value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">Toutes les salles</option>
              <option value="available">Salles Libres (Sans cours)</option>
              <option value="occupied">Salles Occupées (Programmées)</option>
            </select>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Code Salle</th>
                <th className="px-6 py-4">Capacité</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Localisation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {pagedRooms.map((room) => {
                const isOccupied = checkIsOccupied(room);

                return (
                  <tr key={room.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm tracking-tight text-foreground">{room.code}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm font-bold">
                      <Users className="inline w-3.5 h-3.5 mr-2" /> {room.capacity} places
                    </td>
                    <td className="px-6 py-4">
                      {isOccupied ? (
                        <Badge className="bg-red-100 text-red-600 border-red-200 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit shadow-sm">
                          <Ban className="w-3 h-3" /> Occupée
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-600 border-emerald-200 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit shadow-sm">
                          <Check className="w-3 h-3" /> Disponible
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                      <MapPin className="inline w-3.5 h-3.5 mr-1" /> {room.campus?.campus_name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingData(room); setShowForm(true); }} className="p-2 hover:bg-muted rounded-lg text-foreground/70"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(room.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* FORMULAIRE MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl overflow-hidden p-8 border border-border">
            <RoomForm 
              initialData={editingData} campuses={campuses} 
              onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}