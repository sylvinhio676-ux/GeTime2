import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecuritySettings({ onDataChange }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [twoFactor, setTwoFactor] = useState(true);
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Chrome sur Windows 10',
      lastActive: 'À l\'instant',
      ip: '192.168.1.1',
      current: true,
    },
    {
      id: 2,
      device: 'Safari sur iPhone',
      lastActive: 'Il y a 2 heures',
      ip: '192.168.1.50',
      current: false,
    },
    {
      id: 3,
      device: 'Firefox sur Linux',
      lastActive: 'Il y a 3 jours',
      ip: '192.168.1.100',
      current: false,
    },
  ]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    onDataChange();
  };

  const handleToggleVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    // API call here
    alert('Mot de passe mis à jour avec succès');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleToggle2FA = () => {
    setTwoFactor(!twoFactor);
    onDataChange();
  };

  const handleLogoutSession = (id) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sécurité du Compte</h2>
        <p className="text-slate-500">Gérez votre sécurité et vos sessions actives</p>
      </div>

      {/* Change Password */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Changer le mot de passe
        </h3>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition pr-10"
              />
              <button
                onClick={() => handleToggleVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition pr-10"
              />
              <button
                onClick={() => handleToggleVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    passwordForm.newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                <span>Minimum 8 caractères</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    /[A-Z]/.test(passwordForm.newPassword) ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                <span>Contient une majuscule</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    /[0-9]/.test(passwordForm.newPassword) ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                <span>Contient un chiffre</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 transition pr-10"
              />
              <button
                onClick={() => handleToggleVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            onClick={handleUpdatePassword}
            className="bg-blue-700 text-white hover:bg-blue-800 transition rounded-xl"
          >
            Mettre à jour le mot de passe
          </Button>
        </div>
      </div>

      {/* Two Factor Authentication */}
      <div className="border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Authentification à deux facteurs
            </h3>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={handleToggle2FA}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm font-medium text-slate-600">
              {twoFactor ? 'Activée' : 'Désactivée'}
            </span>
          </label>
        </div>
        <p className="text-slate-500 text-sm">
          L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
        </p>
      </div>

      {/* Active Sessions */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Sessions Actives</h3>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900">{session.device}</p>
                  {session.current && (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                      Session actuelle
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500">
                  <p>Dernière activité: {session.lastActive}</p>
                  <p>IP: {session.ip}</p>
                </div>
              </div>

              {!session.current && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="text-rose-600 hover:text-rose-700 font-bold text-sm transition"
                >
                  Déconnecter
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">Sécurité importante</p>
          <p className="text-sm text-amber-800 mt-1">
            Ne partagez jamais votre mot de passe avec quiconque. Notre équipe ne vous le demandera jamais.
          </p>
        </div>
      </div>
    </div>
  );
}
