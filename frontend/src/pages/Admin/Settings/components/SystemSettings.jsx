import React, { useState } from 'react';
import { Settings, Server, Clock, Package } from 'lucide-react';

export default function SystemSettings({ onDataChange }) {
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    maintenanceMode: false,
    enableAnalytics: true,
    cacheEnabled: true,
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  });

  const handleToggle = (key) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    onDataChange();
  };

  const handleSelectChange = (key, value) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    onDataChange();
  };

  const SettingToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-start justify-between p-4 border border-border rounded-2xl hover:bg-muted transition">
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
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

  const systemInfo = [
    { label: 'Version', value: '1.0.0' },
    { label: 'Dernière mise à jour', value: '25 Décembre 2025' },
    { label: 'Statut du serveur', value: 'En ligne ✓' },
    { label: 'Base de données', value: 'Connectée ✓' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Paramètres Système</h2>
        <p className="text-muted-foreground">Configuration générale du système</p>
      </div>

      {/* System Information */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Informations Système
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemInfo.map((item, idx) => (
            <div key={idx} className="bg-muted rounded-2xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
              <p className="font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Settings */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Sauvegarde
        </h3>

        <div className="space-y-3">
          <SettingToggle
            label="Sauvegarde automatique"
            description="Effectuez une sauvegarde automatique chaque jour"
            value={systemSettings.autoBackup}
            onChange={() => handleToggle('autoBackup')}
          />

          <SettingToggle
            label="Mode maintenance"
            description="Le système sera inaccessible pendant les travaux"
            value={systemSettings.maintenanceMode}
            onChange={() => handleToggle('maintenanceMode')}
          />
        </div>

        <div className="mt-4 bg-muted border border-border/60 rounded-2xl p-4">
          <p className="text-sm text-foreground">
            📦 Dernière sauvegarde: <strong>25 Décembre 2025 à 02:00 AM</strong>
          </p>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Performance
        </h3>

        <div className="space-y-3">
          <SettingToggle
            label="Activation du cache"
            description="Améliorez les performances en mettant en cache les données"
            value={systemSettings.cacheEnabled}
            onChange={() => handleToggle('cacheEnabled')}
          />

          <SettingToggle
            label="Analytique"
            description="Collectez les données d'utilisation pour améliorer le service"
            value={systemSettings.enableAnalytics}
            onChange={() => handleToggle('enableAnalytics')}
          />
        </div>
      </div>

      {/* Regional Settings */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Paramètres Régionaux
        </h3>

        <div className="space-y-4">
          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Fuseau horaire
            </label>
            <select
              value={systemSettings.timezone}
              onChange={(e) => handleSelectChange('timezone', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
            >
              <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Format de date
            </label>
            <select
              value={systemSettings.dateFormat}
              onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-muted/60 transition"
            >
              <option value="DD/MM/YYYY">Jour/Mois/Année (DD/MM/YYYY)</option>
              <option value="MM/DD/YYYY">Mois/Jour/Année (MM/DD/YYYY)</option>
              <option value="YYYY-MM-DD">Année-Mois-Jour (YYYY-MM-DD)</option>
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Format heure
            </label>
            <div className="space-y-2">
              {['24h', '12h'].map((format) => (
                <label key={format} className="flex items-center p-3 border border-border rounded-2xl cursor-pointer hover:bg-muted">
                  <input
                    type="radio"
                    name="timeFormat"
                    value={format}
                    checked={systemSettings.timeFormat === format}
                    onChange={(e) => handleSelectChange('timeFormat', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium text-foreground">
                    {format === '24h' ? 'Format 24 heures (14:30)' : 'Format 12 heures (02:30 PM)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Information */}
      <div className="border-t border-border pt-8 bg-muted rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Informations API</h3>
        <div className="space-y-2 font-mono text-sm text-foreground/80">
          <p>Base URL: <code className="bg-muted/80 px-2 py-1 rounded">http://127.0.0.1:8000/api</code></p>
          <p>Version API: <code className="bg-muted/80 px-2 py-1 rounded">v1</code></p>
          <p>Environnement: <code className="bg-muted/80 px-2 py-1 rounded">Développement</code></p>
        </div>
      </div>
    </div>
  );
}
