import React, { useEffect, useState } from 'react';
import { disponibilityService } from '../../../services/disponibilityService';
import { subjectService } from '../../../services/subjectService';
import { campusService } from '../../../services/campusService';
import DisponibilityForm from './DisponibilityForm';
import Button from '../../../components/Button';
import { Progress } from '@/components/ui/progress';
import { DeleteIcon, EditIcon } from 'lucide-react';

export default function DisponibilityList() {
  const [disponibilities, setDisponibilities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchCampuses();
    fetchDisponibilities();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data || []);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  const fetchCampuses = async () => {
    try {
      const data = await campusService.getAll();
      setCampuses(data || []);
    } catch (error) {
      console.error('Failed to fetch campuses', error);
    }
  };

  const fetchDisponibilities = async () => {
    try {
      setLoading(true);
      const data = await disponibilityService.getAll();
      setDisponibilities(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch disponibilities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    await disponibilityService.create(formData);
    setSuccessMessage('Disponibility created successfully!');
    setShowForm(false);
    fetchDisponibilities();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdate = async (formData) => {
    await disponibilityService.update(editingId, formData);
    setSuccessMessage('Disponibility updated successfully!');
    setEditingId(null);
    setEditingData(null);
    fetchDisponibilities();
    setTimeout(() => setSuccessMessage(''), 3000);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this disponibility?')) {
      try {
        await disponibilityService.delete(id);
        setSuccessMessage('Disponibility deleted successfully!');
        fetchDisponibilities();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error(error);
        setError('Failed to delete disponibility');
      }
    }
  };

  const startEdit = (disponibility) => {
    setEditingId(disponibility.id);
    setEditingData(disponibility);
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
        <h1 className="text-3xl font-bold text-primary mb-4">Disponibility Management</h1>

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
          {showForm ? 'Cancel' : 'Add New Disponibility'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <DisponibilityForm
            initialData={editingData}
            subjects={subjects}
            campuses={campuses}
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

      {disponibilities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No disponibilities found. Create your first one!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-primary">
                <th className="px-6 py-3 text-left font-semibold text-white">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Day</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Start Hour</th>
                <th className="px-6 py-3 text-left font-semibold text-white">End Hour</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Subject</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Campus</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Room</th>
                <th className="px-6 py-3 text-center font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {disponibilities.map((disp) => (
                <tr
                  key={disp.id}
                  className="border-b border-gray-200 hover:bg-primary/5 transition"
                >
                  <td className="px-6 py-3 text-gray-700">{disp.id}</td>
                  <td className="px-6 py-3 text-gray-700">{disp.day}</td>
                  <td className="px-6 py-3 text-gray-700">{disp.hour_star}</td>
                  <td className="px-6 py-3 text-gray-700">{disp.hour_end}</td>
                  <td className="px-6 py-3 text-gray-700">{disp.subject?.subject_name}</td>
                  <td className="px-6 py-3 text-gray-700">{disp.campus?.campus_name || '-'}</td>
                  <td className="px-6 py-3 text-gray-700">{disp.room?.code || '-'}</td>
                  <td className="flex justify-center items-center px-6 py-3 text-center space-x-2">
                    <button
                      onClick={() => startEdit(disp)}
                      className="bg-secondary/20 text-secondary px-3 py-1 rounded text-sm font-medium hover:bg-accent hover:text-white transition"
                    >
                      <EditIcon className='w-5 h-5'/>
                    </button>
                    <button
                      onClick={() => handleDelete(disp.id)}
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
