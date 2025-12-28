import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';

export default function SpecialtyForm({ initialData = null, sectors = [], programmers = [], onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      specialty_name: '',
      description: '',
      number_student: '',
      sector_id: '',
      programmer_id: '',
    }
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        specialty_name: initialData.specialty_name || '',
        description: initialData.description || '',
        number_student: initialData.number_student || '',
        sector_id: initialData.sector_id || '',
        programmer_id: initialData.programmer_id || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      if (!initialData) {
        setFormData({
          specialty_name: '',
          description: '',
          number_student: '',
          sector_id: '',
          programmer_id: '',
        });
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };

  return (
    <div className='absolute bg-[rgba(0 0 0 0.1)] left-0 top-0 right-0 bottom-0 flex justify-center w-full'>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Specialty Name *</label>
          <input
            type="text"
            name="specialty_name"
            value={formData.specialty_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
              errors.specialty_name ? 'border-danger' : 'border-gray-300'
            }`}
            required
          />
          {errors.specialty_name && (
            <p className="text-danger text-sm mt-1">{errors.specialty_name[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
              errors.description ? 'border-danger' : 'border-gray-300'
            }`}
            rows="3"
          />
          {errors.description && (
            <p className="text-danger text-sm mt-1">{errors.description[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">Number of Students *</label>
          <input
            type="number"
            name="number_student"
            value={formData.number_student}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
              errors.number_student ? 'border-danger' : 'border-gray-300'
            }`}
            required
          />
          {errors.number_student && (
            <p className="text-danger text-sm mt-1">{errors.number_student[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">Sector *</label>
          <select 
            name="sector_id" 
            value={formData.sector_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          >
            <option value="">--Select a Sector--</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.sector_name}
              </option>
            ))}
          </select>
          {errors.sector_id && (
            <p className="text-danger text-sm mt-1">{errors.sector_id[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">Programmer</label>
          <select 
            name="programmer_id" 
            value={formData.programmer_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">--Select a Programmer--</option>
            {programmers.map((programmer) => (
              <option key={programmer.id} value={programmer.id}>
                {programmer.registration_number}
              </option>
            ))}
          </select>
          {errors.programmer_id && (
            <p className="text-danger text-sm mt-1">{errors.programmer_id[0]}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type='submit'
            className="flex-1 bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Specialty' : 'Create Specialty'}
          </Button>
          <Button
            type='button'
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
