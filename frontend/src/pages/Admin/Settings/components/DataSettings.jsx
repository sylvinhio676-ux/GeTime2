import React, { useState } from 'react';
import { Database, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../../../../components/Button';

export default function DataSettings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleExportData = () => {
    alert('Export des données en cours...');
    // Simulate export
    const data = {
      profile: { name: 'Jean Dupont', email: 'jean@example.com' },
      exportDate: new Date().toISOString(),
    };
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', 'data-export.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImportData = () => {
    alert('Importation des données - Sélectionnez un fichier JSON');
  };

  const handleDeleteData = () => {
    alert('Données supprimées');
    setShowDeleteModal(false);
  };

  const DataCard = ({ icon: Icon, title, description, action, actionLabel, variant = 'primary' }) => (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          <Button
            onClick={action}
            className={`text-sm ${
              variant === 'danger'
                ? 'bg-danger text-white hover:bg-danger/90'
                : 'bg-primary text-white hover:bg-primary/90'
            } transition`}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Données</h2>
        <p className="text-gray-600">Exportez, importez ou supprimez vos données</p>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <DataCard
          icon={Download}
          title="Exporter vos données"
          description="Téléchargez une copie de vos données au format JSON"
          action={handleExportData}
          actionLabel="Exporter"
        />

        <DataCard
          icon={Upload}
          title="Importer des données"
          description="Restaurez vos données à partir d'un fichier JSON précédent"
          action={handleImportData}
          actionLabel="Importer"
        />

        <DataCard
          icon={Trash2}
          title="Supprimer toutes les données"
          description="Supprimez définitivement toutes vos données du compte"
          action={() => setShowDeleteModal(true)}
          actionLabel="Supprimer"
          variant="danger"
        />
      </div>

      {/* Storage Usage */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Utilisation du Stockage
        </h3>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Utilisé</span>
                <span className="text-sm font-semibold text-gray-900">2.4 GB / 10 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-600">Fichiers</p>
                <p className="text-2xl font-bold text-gray-900">1.2 GB</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bases de données</p>
                <p className="text-2xl font-bold text-gray-900">800 MB</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Autres</p>
                <p className="text-2xl font-bold text-gray-900">400 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-danger/10 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Supprimer toutes les données?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Cette action est irréversible. Assurez-vous d'avoir exporté vos données avant de continuer.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteData}
                className="flex-1 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
