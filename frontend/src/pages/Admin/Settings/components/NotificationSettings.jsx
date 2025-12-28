import React, { useState } from 'react';
import { Bell, Mail, AlertCircle } from 'lucide-react';

export default function NotificationSettings({ onDataChange }) {
  const [notifications, setNotifications] = useState({
    // Email Notifications
    emailUpdates: true,
    emailMarketing: false,
    emailSecurity: true,
    emailWeeklyDigest: true,

    // In-App Notifications
    inAppMessages: true,
    inAppUpdates: true,
    inAppAlerts: true,

    // Notification Frequency
    frequency: 'instant',
  });

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    onDataChange();
  };

  const handleFrequencyChange = (value) => {
    setNotifications((prev) => ({
      ...prev,
      frequency: value,
    }));
    onDataChange();
  };

  const NotificationToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <label className="flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
          className="w-5 h-5"
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Préférences de Notifications</h2>
        <p className="text-gray-600">Contrôlez comment et quand vous recevez les notifications</p>
      </div>

      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Notifications par Email
        </h3>

        <div className="space-y-3">
          <NotificationToggle
            label="Mises à jour produit"
            description="Recevez les dernières informations sur les nouvelles fonctionnalités"
            value={notifications.emailUpdates}
            onChange={() => handleToggle('emailUpdates')}
          />

          <NotificationToggle
            label="Actualités marketing"
            description="Offres spéciales et promotions"
            value={notifications.emailMarketing}
            onChange={() => handleToggle('emailMarketing')}
          />

          <NotificationToggle
            label="Alertes de sécurité"
            description="Notifications importantes concernant votre compte"
            value={notifications.emailSecurity}
            onChange={() => handleToggle('emailSecurity')}
          />

          <NotificationToggle
            label="Résumé hebdomadaire"
            description="Résumé des activités de la semaine"
            value={notifications.emailWeeklyDigest}
            onChange={() => handleToggle('emailWeeklyDigest')}
          />
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications dans l'application
        </h3>

        <div className="space-y-3">
          <NotificationToggle
            label="Messages"
            description="Notifications des nouveaux messages"
            value={notifications.inAppMessages}
            onChange={() => handleToggle('inAppMessages')}
          />

          <NotificationToggle
            label="Mises à jour"
            description="Notifications sur les mises à jour du système"
            value={notifications.inAppUpdates}
            onChange={() => handleToggle('inAppUpdates')}
          />

          <NotificationToggle
            label="Alertes"
            description="Notifications sur les actions importantes"
            value={notifications.inAppAlerts}
            onChange={() => handleToggle('inAppAlerts')}
          />
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fréquence des Notifications</h3>

        <div className="space-y-3">
          {[
            { value: 'instant', label: 'Instantané', description: 'Recevez les notifications dès qu\'elles se produisent' },
            { value: 'hourly', label: 'Toutes les heures', description: 'Recevez un résumé toutes les heures' },
            { value: 'daily', label: 'Quotidien', description: 'Recevez un résumé une fois par jour' },
            { value: 'weekly', label: 'Hebdomadaire', description: 'Recevez un résumé une fois par semaine' },
          ].map((option) => (
            <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={notifications.frequency === option.value}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-4 h-4 mt-1"
              />
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Note importante</p>
          <p className="text-sm text-blue-800 mt-1">
            Les notifications de sécurité sont toujours activées pour votre protection.
          </p>
        </div>
      </div>
    </div>
  );
}
