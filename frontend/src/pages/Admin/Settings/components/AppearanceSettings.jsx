import React, { useState } from 'react';
import { Palette, Sun, Moon, Globe } from 'lucide-react';

export default function AppearanceSettings({ onDataChange }) {
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'fr',
    fontSize: 'medium',
    sidebarCollapsed: false,
  });

  const handleThemeChange = (theme) => {
    setAppearance((prev) => ({
      ...prev,
      theme,
    }));
    onDataChange();
  };

  const handleLanguageChange = (language) => {
    setAppearance((prev) => ({
      ...prev,
      language,
    }));
    onDataChange();
  };

  const handleFontSizeChange = (size) => {
    setAppearance((prev) => ({
      ...prev,
      fontSize: size,
    }));
    onDataChange();
  };

  const handleSidebarToggle = () => {
    setAppearance((prev) => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
    onDataChange();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Apparence</h2>
        <p className="text-muted-foreground">Personnalisez votre expérience de l'interface</p>
      </div>

      {/* Theme Selection */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Thème
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Light Theme */}
          <label
            className={`p-6 border-2 rounded-2xl cursor-pointer transition ${
              appearance.theme === 'light'
                ? 'border-border/400 bg-muted'
                : 'border-border hover:border-border/80'
            }`}
          >
            <input
              type="radio"
              name="theme"
              value="light"
              checked={appearance.theme === 'light'}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="hidden"
            />
            <div className="flex items-center gap-3 mb-3">
              <Sun className="w-6 h-6 text-accent" />
              <span className="font-semibold text-foreground">Clair</span>
            </div>
            <p className="text-sm text-muted-foreground">Fond blanc, texte sombre</p>
          </label>

          {/* Dark Theme */}
          <label
            className={`p-6 border-2 rounded-2xl cursor-pointer transition ${
              appearance.theme === 'dark'
                ? 'border-border/400 bg-muted'
                : 'border-border hover:border-border/80'
            }`}
          >
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={appearance.theme === 'dark'}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="hidden"
            />
            <div className="flex items-center gap-3 mb-3">
              <Moon className="w-6 h-6 text-primary/80" />
              <span className="font-semibold text-foreground">Sombre</span>
            </div>
            <p className="text-sm text-muted-foreground">Fond sombre, texte clair</p>
          </label>

          {/* Auto Theme */}
          <label
            className={`p-6 border-2 rounded-2xl cursor-pointer transition ${
              appearance.theme === 'auto'
                ? 'border-border/400 bg-muted'
                : 'border-border hover:border-border/80'
            }`}
          >
            <input
              type="radio"
              name="theme"
              value="auto"
              checked={appearance.theme === 'auto'}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="hidden"
            />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-gradient-to-r from-accent to-primary rounded" />
              <span className="font-semibold text-foreground">Auto</span>
            </div>
            <p className="text-sm text-muted-foreground">Adapté au système</p>
          </label>
        </div>
      </div>

      {/* Language Selection */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Langue
        </h3>

        <div className="space-y-3">
          {[
            { code: 'fr', name: 'Français' },
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'de', name: 'Deutsch' },
          ].map((lang) => (
            <label key={lang.code} className="flex items-center p-3 border border-border rounded-2xl cursor-pointer hover:bg-muted transition">
              <input
                type="radio"
                name="language"
                value={lang.code}
                checked={appearance.language === lang.code}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium text-foreground">{lang.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Taille de police</h3>

        <div className="space-y-3">
          {[
            { size: 'small', label: 'Petit', example: 'text-sm' },
            { size: 'medium', label: 'Moyen', example: 'text-base' },
            { size: 'large', label: 'Grand', example: 'text-lg' },
          ].map((option) => (
            <label key={option.size} className="flex items-center p-3 border border-border rounded-2xl cursor-pointer hover:bg-muted transition">
              <input
                type="radio"
                name="fontSize"
                value={option.size}
                checked={appearance.fontSize === option.size}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium text-foreground">{option.label}</span>
              <span className={`ml-auto ${option.example} text-muted-foreground`}>Exemple</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sidebar Option */}
      <div className="border-t border-border pt-8">
        <label className="flex items-center p-4 border border-border rounded-2xl hover:bg-muted transition cursor-pointer">
          <input
            type="checkbox"
            checked={appearance.sidebarCollapsed}
            onChange={handleSidebarToggle}
            className="w-5 h-5"
          />
          <div className="ml-3 flex-1">
            <p className="font-semibold text-foreground">Barre latérale réduite</p>
            <p className="text-sm text-muted-foreground">Réduisez la barre latérale par défaut</p>
          </div>
        </label>
      </div>
    </div>
  );
}
