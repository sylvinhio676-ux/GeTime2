import React, { useState, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print'; // Importation
import TimetableGrid from './TimetableGrid';
import { Printer, FileDown, GraduationCap, User, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TimetableDashboard({ programmations, levels, teachers, rooms }) {
  const [selectedLevel, setSelectedLevel] = useState('');
  // ... tes autres états de filtres

  // 1. Création de la référence pour le composant à imprimer
  const componentRef = useRef();

  // 2. Logique d'impression
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Emploi_du_temps_${selectedLevel || 'General'}`,
    pageStyle: `
      @page { size: landscape; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none; }
      }
    `,
  });

  return (
    <div className="space-y-6">
      {/* --- BARRE D'ACTIONS --- */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900">Vue Calendrier</h2>
          <p className="text-slate-500 text-xs font-medium">Visualisez et exportez les plannings</p>
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

      {/* --- FILTRES (Tes sélecteurs ici) --- */}
      {/* ... code des filtres ... */}

      {/* --- ZONE IMPRIMABLE --- */}
      <div ref={componentRef} className="p-4 bg-white rounded-[2.5rem]">
        {/* En-tête visible uniquement sur le PDF/Impression */}
        <div className="hidden print:flex items-center justify-between mb-8 border-b-2 border-indigo-500 pb-4">
          <div>
            <h1 className="text-2xl font-black text-indigo-600 uppercase">Emploi du Temps Universitaire</h1>
            <p className="text-slate-500 font-bold">
              {selectedLevel ? `Niveau : ${levels.find(l => l.id == selectedLevel)?.level_name}` : 'Planning Général'}
            </p>
          </div>
          <div className="text-right text-[10px] font-bold text-slate-400">
            Généré le {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Ta Grille Complète */}
        <TimetableGrid programmations={filteredData} />
        
        {/* Pied de page PDF */}
        <div className="hidden print:block mt-6 text-center text-[9px] text-slate-400 font-medium">
          Document officiel généré par l'application de gestion académique.
        </div>
      </div>
    </div>
  );
}