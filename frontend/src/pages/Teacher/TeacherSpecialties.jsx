import React, { useEffect, useState } from "react";
import { sectorService } from "@/services/sectorService";
import { Badge } from "@/components/ui/badge";
import { Building, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TeacherSpecialties() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await sectorService.getTeacherSectors();
        if (mounted) {
          setSectors(data || []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Impossible de récupérer vos filières");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-8 text-center text-muted-foreground">
        Chargement des spécialités...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto p-8 text-center text-foreground">
        <p className="text-lg font-bold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
      <header className="bg-card rounded-[2rem] border border-border shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-primary" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Vos filières</p>
            <h1 className="text-2xl font-black text-foreground">Filières & spécialités enseignées</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          La liste ne contient que les filières / spécialités pour lesquelles vous avez une matière assignée.
        </p>
      </header>

      <section className="grid gap-4">
        {sectors.length === 0 && (
          <div className="bg-card p-6 rounded-[2rem] border border-delta-warning/60 text-center text-muted-foreground">
            <p className="font-semibold">Aucune filière liée</p>
            <p className="text-xs">Demandez à un admin d’affecter vos matières si besoin.</p>
          </div>
        )}
        {sectors.map((sector) => (
          <article
            key={sector.id}
            className="bg-card rounded-[2rem] border border-border shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                  Secteur
                </p>
                <h2 className="text-xl font-black text-foreground">
                  {sector.sector_name}
                </h2>
                <p className="text-sm text-muted-foreground">{sector.school?.school_name}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] font-black uppercase">
                {sector.specialities?.length || 0} spécialité(s)
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {sector.specialities?.map((specialty) => (
                <div
                  key={specialty.id}
                  className="bg-muted/40 rounded-2xl p-4 border border-border flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black">{specialty.specialty_name}</h3>
                    <Badge className="text-[10px] uppercase tracking-[0.4em]">
                      {specialty.level?.name_level || "Niveau non défini"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>{specialty.description || "Description manquante"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specialty?.programmer && (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        Programmer {specialty.programmer.registration_number}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => navigate("/dashboard/subjects")}>
          <BookOpen className="w-4 h-4 mr-2" /> Voir mes matières
        </Button>
      </div>
    </div>
  );
}
