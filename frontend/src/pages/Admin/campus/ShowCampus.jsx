import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { campusService } from "@/services/campusService";
import CampusMap from "@/components/maps/CampusMaps";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";

export default function ShowCampus() {
  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const selected = useMemo(() => {
    if (!campus?.latitude || !campus?.longitude) return null;
    return { latitude: campus.latitude, longitude: campus.longitude };
  }, [campus]);

  useEffect(() => {
    if (!id) return;
    let isActive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await campusService.getById(id);
        if (isActive) {
          setCampus(data);
        }
      } catch (error) {
        if (isActive) {
          setCampus(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-border/60 bg-card text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  if (!campus) {
    return (
      <div className="p-6 rounded-2xl border border-border/60 bg-card text-sm text-delta-negative">
        Campus introuvable
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Campus
          </p>
          <h1 className="text-3xl font-black text-foreground">{campus.campus_name}</h1>
          <p className="text-sm text-muted-foreground">Tous les détails sur la localisation, le statut et les salles.</p>
        </div>
        <Button variant="outline" className="text-xs uppercase tracking-[0.4em]" onClick={() => navigate("/dashboard/campuses")}>Retour</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <CampusMap campuses={[campus]} selected={selected} height="420px" zoom={15} />
          <div className="mt-3 space-y-1 rounded-2xl border border-border/60 bg-card px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">Ville :</span>
              <span>{campus.location?.city || campus.city || "Ville non définie"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">Adresse :</span>
              <span>{campus.location?.address || campus.address || "Adresse inconnue"}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{campus.location?.latitude ?? campus.latitude ?? "--"}, {campus.location?.longitude ?? campus.longitude ?? "--"}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Établissement</p>
            <p className="text-lg font-black text-foreground">{campus.etablishment?.etablishment_name || "Non défini"}</p>
            <p className="text-xs text-muted-foreground">ID {campus.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={`text-[11px] font-black uppercase tracking-[0.3em] border px-3 py-1 ${
              (campus.available_rooms_count ?? 0) > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}>
              {(campus.available_rooms_count ?? 0) > 0 ? "Actif" : "En maintenance"}
            </Badge>
            <Badge className="text-[11px] font-black uppercase tracking-[0.3em] border border-border bg-card text-muted-foreground px-3 py-1">
              Capacité totale : {Math.max(0, campus.rooms_sum_capacity ?? 0)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Salles : {campus.rooms_count ?? 0}</p>
            <p>Disponibles : {campus.available_rooms_count ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-border/60 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Salles
          </p>
          <Badge className="text-xs font-black uppercase tracking-[0.3em] border border-border bg-card text-muted-foreground px-3 py-1">
            {(campus.rooms || []).length} totales
          </Badge>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {(campus.rooms || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune salle renseignée pour ce campus.</p>
          ) : (
            (campus.rooms || []).map((room) => (
              <div key={room.id} className="flex items-center justify-between rounded-[1.25rem] border border-border/40 bg-muted/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{room.code || "Salle sans code"}</p>
                  <p className="text-[11px] text-muted-foreground">Capacité {room.capacity ?? 0}</p>
                </div>
                <Badge className={`text-[11px] font-black uppercase tracking-[0.3em] border px-3 py-1 ${
                  room.is_available ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
                }`}>
                  {room.is_available ? "Disponible" : "Occupée"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
