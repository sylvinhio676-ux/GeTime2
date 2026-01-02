import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Palette,
  Database,
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
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Paramètres</h1>
              <p className="text-slate-500 text-xs md:text-sm font-medium">Personnalisez votre espace et vos préférences</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-bold shadow-md shadow-indigo-100"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            )}

            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl font-bold">
                <CheckCircle className="w-4 h-4" />
                Enregistré!
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl font-bold">
                <AlertCircle className="w-4 h-4" />
                Erreur
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <SettingMenu items={menuItems} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
