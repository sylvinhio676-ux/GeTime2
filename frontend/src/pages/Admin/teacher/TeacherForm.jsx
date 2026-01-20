import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function TeacherForm({ initialData = null, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState(
    initialData || {
      registration_number: '',
      user_id: '',
    }
  );
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
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
          registration_number: '',
          user_id: '',
        });
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Registration Number *
        </label>
        <input
          type="text"
          name="registration_number"
          value={formData.registration_number}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            errors.registration_number ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.registration_number && (
          <p className="text-red-500 text-sm mt-1">{errors.registration_number[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User *
        </label>
        {loadingUsers ? (
          <p className="text-gray-500">Loading users...</p>
        ) : (
          <select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              errors.user_id ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        )}
        {errors.user_id && (
          <p className="text-red-500 text-sm mt-1">{errors.user_id[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || loadingUsers}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:bg-gray-400 font-medium"
      >
        {isLoading ? 'Saving...' : initialData ? 'Update Teacher' : 'Create Teacher'}
      </button>
    </form>
  );
}
