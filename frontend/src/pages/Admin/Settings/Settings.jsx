import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Palette,
  Database,
  ChevronRight,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import SettingMenu from './components/SettingMenu';
import ProfileSettings from './components/ProfileSettings';
import SecuritySettings from './components/SecuritySettings';
import NotificationSettings from './components/NotificationSettings';
import AppearanceSettings from './components/AppearanceSettings';
import DataSettings from './components/DataSettings';
import SystemSettings from './components/SystemSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simuler une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setIsDirty(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'data', label: 'Données', icon: Database },
    { id: 'system', label: 'Système', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings onDataChange={() => setIsDirty(true)} />;
      case 'security':
        return <SecuritySettings onDataChange={() => setIsDirty(true)} />;
      case 'notifications':
        return <NotificationSettings onDataChange={() => setIsDirty(true)} />;
      case 'appearance':
        return <AppearanceSettings onDataChange={() => setIsDirty(true)} />;
      case 'data':
        return <DataSettings />;
      case 'system':
        return <SystemSettings onDataChange={() => setIsDirty(true)} />;
      default:
        return <ProfileSettings onDataChange={() => setIsDirty(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            </div>

            {/* Save Status */}
            {isDirty && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            )}

            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                Enregistré!
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-danger bg-danger/10 px-4 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Erreur
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className="md:col-span-1">
            <SettingMenu
              items={menuItems}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
