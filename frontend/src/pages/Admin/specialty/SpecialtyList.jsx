import React, { useEffect, useState } from 'react';
import { specialtyService } from '../../../services/specialtyService';
import { sectorService } from '../../../services/sectorService';
import { programmersService } from '../../../services/programmerService';
import SpecialtyForm from './SpecialtyForm';
import Button from '../../../components/Button';
import { Progress } from '@/components/ui/progress';
import { DeleteIcon, EditIcon } from 'lucide-react';

export default function SpecialtyList() {
  const [specialties, setSpecialties] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [programmers, setProgrammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSectors();
    fetchProgrammers();
    fetchSpecialties();
  }, []);

  const fetchSectors = async () => {
    try {
      const data = await sectorService.getAll();
      setSectors(data || []);
    } catch (error) {
      console.error('Failed to fetch sectors', error);
    }
  };

  const fetchProgrammers = async () => {
    try {
      const data = await programmersService.getAll();
      setProgrammers(data || []);
    } catch (error) {
      console.error('Failed to fetch programmers', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const data = await specialtyService.getAll();
      setSpecialties(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch specialties');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    await specialtyService.create(formData);
    setSuccessMessage('Specialty created successfully!');
    setShowForm(false);
    fetchSpecialties();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdate = async (formData) => {
    await specialtyService.update(editingId, formData);
    setSuccessMessage('Specialty updated successfully!');
    setEditingId(null);
    setEditingData(null);
    fetchSpecialties();
    setTimeout(() => setSuccessMessage(''), 3000);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this specialty?')) {
      try {
        await specialtyService.delete(id);
        setSuccessMessage('Specialty deleted successfully!');
        fetchSpecialties();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error(error);
        setError('Failed to delete specialty');
      }
    }
  };

  const startEdit = (specialty) => {
    setEditingId(specialty.id);
    setEditingData(specialty);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(false);
  };

  if (loading) {
    return <Progress value={10} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Specialty Management</h1>

        {successMessage && (
          <div className="bg-success/15 text-success p-4 rounded-md mb-4 border border-success">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-danger/15 text-danger p-4 rounded-md mb-4 border border-danger">
            {error}
          </div>
        )}

        <Button
          className="bg-primary text-white hover:bg-primary/90 transition"
          onClick={() => {
            if (showForm) {
              cancelEdit();
            } else {
              setEditingId(null);
              setEditingData(null);
              setShowForm(true);
            }
          }}
        >
          {showForm ? 'Cancel' : 'Add New Specialty'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <SpecialtyForm
            initialData={editingData}
            sectors={sectors}
            programmers={programmers}
            onSubmit={editingId ? handleUpdate : handleCreate}
            onCancel={cancelEdit}
            isLoading={loading}
          />
          {editingId && (
            <button
              onClick={cancelEdit}
              className="mt-2 text-gray-400 hover:text-primary text-sm transition"
            >
              Cancel Editing
            </button>
          )}
        </div>
      )}

      {specialties.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No specialties found. Create your first one!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-primary">
                <th className="px-6 py-3 text-left font-semibold text-white">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Students</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Sector</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Programmer</th>
                <th className="px-6 py-3 text-center font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialties.map((specialty) => (
                <tr
                  key={specialty.id}
                  className="border-b border-gray-200 hover:bg-primary/5 transition"
                >
                  <td className="px-6 py-3 text-gray-700">{specialty.id}</td>
                  <td className="px-6 py-3 text-gray-700">{specialty.specialty_name}</td>
                  <td className="px-6 py-3 text-gray-700">{specialty.number_student}</td>
                  <td className="px-6 py-3 text-gray-700">{specialty.sector?.sector_name}</td>
                  <td className="px-6 py-3 text-gray-700">{specialty.programmer?.registration_number || '-'}</td>
                  <td className="flex justify-center items-center px-6 py-3 text-center space-x-2">
                    <button
                      onClick={() => startEdit(specialty)}
                      className="bg-secondary/20 text-secondary px-3 py-1 rounded text-sm font-medium hover:bg-accent hover:text-white transition"
                    >
                      <EditIcon className='w-5 h-5'/>
                    </button>
                    <button
                      onClick={() => handleDelete(specialty.id)}
                      className="bg-danger text-white px-3 py-1 rounded text-sm font-medium hover:bg-danger/90 transition"
                    >
                      <DeleteIcon className='w-5 h-5'/>
                    </button>
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
