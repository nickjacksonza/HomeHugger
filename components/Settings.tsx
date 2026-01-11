
import React, { useState } from 'react';
import { UserPreferences, CURRENCIES } from '../types';
import { Save, RefreshCw, Trash2, Download, Upload } from 'lucide-react';

interface SettingsProps {
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  preferences, 
  onSavePreferences, 
  onExportData, 
  onImportData,
  onClearData 
}) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = () => {
    onSavePreferences(localPrefs);
    setSavedMessage('Preferences saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-slate-600" />
        Settings
      </h2>

      <div className="space-y-6">
        {/* Preferences Section */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">User Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <select
                value={localPrefs.currency}
                onChange={(e) => {
                  setLocalPrefs({ ...localPrefs, currency: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Used for item value estimations and reports.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Measurement Units</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="units"
                    value="imperial"
                    checked={localPrefs.units === 'imperial'}
                    onChange={() => setLocalPrefs({ ...localPrefs, units: 'imperial' })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">Imperial (ft, in)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="units"
                    value="metric"
                    checked={localPrefs.units === 'metric'}
                    onChange={() => setLocalPrefs({ ...localPrefs, units: 'metric' })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">Metric (m, cm)</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">Preferred unit system for new room dimensions.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
            {savedMessage && <span className="text-sm text-emerald-600 font-medium animate-fadeIn">{savedMessage}</span>}
          </div>
        </section>

        {/* Data Management Section */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Data Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-900">Backup & Restore</h4>
              <p className="text-sm text-slate-500">Export all your inventory data to a JSON file for safekeeping or transfer.</p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onExportData}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  <Download className="w-4 h-4" />
                  Backup to File
                </button>
                
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Restore from File
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={onImportData}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-medium text-red-700">Danger Zone</h4>
               <p className="text-sm text-slate-500">Permanently delete all rooms, items, and projects.</p>
               <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
                      onClearData();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset Application
                </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const SettingsIcon = (props: any) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
