import React, { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export default function ProfileSettings({ onDataChange }) {
  const [profile, setProfile] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    position: 'Administrateur',
    department: 'Informatique',
    bio: 'Bienvenue sur ma page profil',
    location: 'Paris, France',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
    onDataChange();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onDataChange();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Profil Personnel</h2>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 pb-6 border-b border-border">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-full flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-lg">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition cursor-pointer font-bold">
            <Camera className="w-4 h-4" />
            Changer la photo
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
          <p className="text-sm text-muted-foreground mt-2">JPG, PNG ou GIF. Max 5MB</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Prénom
          </label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Nom
          </label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Téléphone
          </label>
          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Poste
          </label>
          <input
            type="text"
            name="position"
            value={profile.position}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Département
          </label>
          <input
            type="text"
            name="department"
            value={profile.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localisation
          </label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Biographie
        </label>
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition resize-none"
          placeholder="Parlez-nous un peu de vous..."
        />
      </div>

      {/* Info Box */}
      <div className="bg-muted border border-border/60 rounded-2xl p-4">
        <p className="text-sm text-foreground">
          💡 Vos informations de profil sont visibles par les autres utilisateurs du système.
        </p>
      </div>
    </div>
  );
}
