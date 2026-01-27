import React, { useEffect, useState } from 'react';
import { roomService } from '@/services/roomService';
import { Progress } from '@/components/ui/progress';
import { DoorOpen, AlertCircle } from 'lucide-react';

export default function TeacherRoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const data = await roomService.getTeacherRooms();
        setRooms(data);
      } catch (err) {
        setError(err?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  if (loading) {
    return <div className="p-8 max-w-[800px] mx-auto"><Progress value={40} className="h-1 w-full" /></div>;
  }

  if (error) {
    return (
      <div className="p-8 max-w-[800px] mx-auto text-center text-muted-foreground">
        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div className="p-8 max-w-[800px] mx-auto text-center text-muted-foreground space-y-2">
        <DoorOpen className="w-10 h-10 mx-auto opacity-40" />
        <p className="font-bold">Aucune salle n'est encore affectée à vos matières.</p>
        <p className="text-sm">Programmez une matière dans une salle pour la voir apparaître ici.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto p-4 md:p-8 space-y-4">
      <div className="bg-card rounded-[2rem] border border-border shadow-sm p-6">
        <h1 className="text-xl font-black text-foreground mb-2">Salles liées à vos matières</h1>
        <p className="text-sm text-muted-foreground">Cette liste montre les salles où vous avez des programmations validées ou publiées.</p>
      </div>
      <div className="space-y-4">
        {rooms.map((room) => (
          <article key={room.id} className="bg-card border border-border rounded-[2rem] p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-lg text-foreground">{room.code}</p>
              <p className="text-sm text-muted-foreground">{room.campus?.campus_name || 'Campus non défini'}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{room.capacity} places</span>
          </article>
        ))}
      </div>
    </div>
  );
}
