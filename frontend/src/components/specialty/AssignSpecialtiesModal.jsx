import React, { useMemo, useState } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';

export default function AssignSpecialtiesModal({
  user,
  specialties,
  open,
  loading,
  onClose,
  onSave,
}) {
  const [selectedIds, setSelectedIds] = useState(() =>
    user?.specialties?.map((spec) => spec.id) ?? []
  );

  const options = useMemo(
    () =>
      specialties.map((spec) => ({
        value: spec.id,
        label: `${spec.specialty_name} (${spec.school?.school_name ?? '—'})`,
      })),
    [specialties]
  );

  const defaultValues = useMemo(
    () => options.filter((opt) => selectedIds.includes(opt.value)),
    [options, selectedIds]
  );

  if (!open) return null;

  const handleChange = (items) => {
    setSelectedIds(items?.map((item) => item.value) ?? []);
  };

  const handleSave = () => onSave(selectedIds);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-card rounded-2xl w-full max-w-lg border border-border shadow-2xl space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black">Spécialités assignées à {user?.name}</h3>
            <p className="text-sm text-muted-foreground">Choisissez les spécialités gérées par ce programmeur.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            Fermer
          </button>
        </div>
        <Select
          options={options}
          value={defaultValues}
          isMulti
          placeholder="Sélectionner les spécialités"
          onChange={handleChange}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '48px',
              borderRadius: '1rem',
            }),
          }}
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button disabled={loading} onClick={handleSave}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
