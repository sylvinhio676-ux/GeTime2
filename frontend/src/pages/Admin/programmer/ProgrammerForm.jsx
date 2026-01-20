import React, { useState } from 'react';

export default function ProgrammerForm({ initialData = null, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      registration_number: '',
      user_id: '',
      etablishment_id: '',
    }
  );

  const [errors, setErrors] = useState({});

  // Gestion des changements des inputs
  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Gestion de la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);

      // Reset si création
      if (!initialData) {
        setFormData({
          registration_number: '',
          user_id: '',
          etablishment_id: '',
        });
      }
    } catch (err) {
      // Si erreur API structurée
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'Une erreur est survenue' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded shadow">
      {errors.general && (
        <p className="text-red-500 text-sm">{errors.general}</p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Registration Number</label>
        <input
          type="text"
          name="registration_number"
          value={formData.registration_number}
          onChange={handleChange}
          className={`w-full border px-3 py-2 rounded ${
            errors.registration_number ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.registration_number && (
          <p className="text-red-500 text-sm">{errors.registration_number[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">User ID</label>
        <input
          type="number"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          className={`w-full border px-3 py-2 rounded ${
            errors.user_id ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.user_id && (
          <p className="text-red-500 text-sm">{errors.user_id[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Etablissement ID</label>
        <input
          type="number"
          name="etablishment_id"
          value={formData.etablishment_id}
          onChange={handleChange}
          className={`w-full border px-3 py-2 rounded ${
            errors.etablishment_id ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.etablishment_id && (
          <p className="text-red-500 text-sm">{errors.etablishment_id[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Programmer' : 'Create Programmer'}
      </button>
    </form>
  );
}
