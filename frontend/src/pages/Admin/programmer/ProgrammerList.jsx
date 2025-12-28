import React, { useEffect, useState } from 'react';
import { programmersService } from '@/services/programmerService';
import { Button } from '@/components/ui/button';
import ProgrammerForm from './ProgrammerForm';
import {  DeleteIcon, Edit3Icon } from 'lucide-react';

export default function ProgrammerList() {
  const [programmers, setProgrammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all programmers
  useEffect(() => {
    fetchProgrammers();
  }, []);

  const fetchProgrammers = async () => {
    try {
      setLoading(true);
      const data = await programmersService.getAll();
      setProgrammers(data);
      setError(null);
    } catch (err) {
      setError("Erreur de récupération");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create
  const handleCreate = async (formData) => {
    try {
      await programmersService.create(formData);
      setSuccessMessage('Programmeur créé avec succès');
      setShowForm(false);
      fetchProgrammers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la création');
    }
  };

  // Update
  const handleUpdate = async (formData) => {
    try {
      await programmersService.update(editingId, formData);
      setSuccessMessage(`Programmeur ${editingId} modifié avec succès`);
      setEditingId(null);
      setEditFormData(null);
      setShowForm(false);
      fetchProgrammers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la modification');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce programmeur ?")) return;

    try {
      await programmersService.delete(id);
      setSuccessMessage(`Programmeur ${id} supprimé avec succès`);
      fetchProgrammers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
    }
  };

  const startEdit = (programmer) => {
    setEditingId(programmer.id);
    setEditFormData(programmer);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
    setShowForm(false);
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (error) return <p className="text-center py-8 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Programmeurs
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="
            bg-[#8BC34A]/20
            text-[#0B1F4B]
            p-4 rounded-md mb-4
            border border-[#8BC34A]
          ">
            {successMessage}
          </div>
        )}

        {/* Add / Cancel Button */}
        <Button
          onClick={() => {
            setShowForm(!showForm);
            cancelEdit();
          }}
          className={`
            mb-4
            ${showForm
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"}
            text-white
          `}
        >
          {!showForm ? "Ajouter un programmeur" : "Annuler"}
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="
          mb-6 bg-white p-6
          rounded-lg shadow-md
          border border-gray-200
        ">
          <ProgrammerForm
            initialData={editFormData}
            onSubmit={editingId ? handleUpdate : handleCreate}
            isLoading={loading}
          />
        </div>
      )}

      {/* Liste des programmeurs */}
      {programmers.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          Aucun programmeur trouvé.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="
            w-full border-collapse
            rounded-lg overflow-hidden
            border border-gray-200
          ">
            <thead>
              <tr className="bg-primary">
                <th className="px-6 py-3 text-left font-semibold text-white">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Registration</th>
                <th className="px-6 py-3 text-left font-semibold text-white">User</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Etablissement</th>
                <th className="px-6 py-3 text-center font-semibold text-white">Actions</th>
              </tr>
            </thead>

            <tbody>
              {programmers.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-[#8BC34A]/10 transition"
                >
                  <td className="px-6 py-3 text-gray-700">{p.id}</td>
                  <td className="px-6 py-3 text-gray-700">{p.registration_number}</td>
                  <td className="px-6 py-3 text-gray-700">
                    <div>
                      <p className="font-medium">{p.user?.name}</p>
                      <p className="text-sm text-gray-500">{p.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {p.etablishment?.etablishment_name}
                  </td>

                  <td className="flex justify-center items-center px-6 py-3 text-center space-x-2">
                    <Button
                      onClick={() => startEdit(p)}
                      className="
                        bg-secondary/20 text-secondary
                        px-3 py-1 rounded text-sm font-medium
                        hover:bg-accent hover:text-white
                        transition
                      "
                    >
                      <Edit3Icon className='w-5 h-5'/>
                    </Button>

                    <Button
                      onClick={() => handleDelete(p.id)}
                      className="
                        bg-danger text-white
                        px-3 py-1 rounded text-sm font-medium
                        hover:bg-danger/90
                        transition
                      "
                    >
                      <DeleteIcon className='w-5 h-5'/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

  );
}
