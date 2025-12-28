import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';

export default function DisponibilityForm({ initialData = null, subjects = [], onSubmit, onCancel, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      day: '',
      hour_star: '',
      hour_end: '',
      subject_id: '',
    }
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        day: initialData.day || '',
        hour_star: initialData.hour_star || '',
        hour_end: initialData.hour_end || '',
        subject_id: initialData.subject_id || '',
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
          day: '',
          hour_star: '',
          hour_end: '',
          subject_id: '',
        });
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className='absolute bg-[rgba(0 0 0 0.1)] left-0 top-0 right-0 bottom-0 flex justify-center w-full'>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Day *</label>
          <select 
            name="day" 
            value={formData.day}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          >
            <option value="">--Select a Day--</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.day && (
            <p className="text-danger text-sm mt-1">{errors.day[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">Start Hour *</label>
          <input
            type="time"
            name="hour_star"
            value={formData.hour_star}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
              errors.hour_star ? 'border-danger' : 'border-gray-300'
            }`}
            required
          />
          {errors.hour_star && (
            <p className="text-danger text-sm mt-1">{errors.hour_star[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">End Hour *</label>
          <input
            type="time"
            name="hour_end"
            value={formData.hour_end}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
              errors.hour_end ? 'border-danger' : 'border-gray-300'
            }`}
            required
          />
          {errors.hour_end && (
            <p className="text-danger text-sm mt-1">{errors.hour_end[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">Subject *</label>
          <select 
            name="subject_id" 
            value={formData.subject_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          >
            <option value="">--Select a Subject--</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
          {errors.subject_id && (
            <p className="text-danger text-sm mt-1">{errors.subject_id[0]}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type='submit'
            className="flex-1 bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Disponibility' : 'Create Disponibility'}
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
