import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGlobalUI } from '../../common';
import { configAPI } from '../../../services/api/api';
import { 
  Globe, 
  Languages, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Save,
  RefreshCw,
  FileText,
  Settings
} from 'lucide-react';

const ElectionLanguageSupport = ({ electionId, election }) => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader, showToast } = useGlobalUI ? useGlobalUI() : { showLoader: () => {}, hideLoader: () => {}, showToast: () => {} };
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [newLanguage, setNewLanguage] = useState({
    code: '',
    name: '',
    nativeName: '',
    isRTL: false,
    enabled: true
  });

  // Mock language data
  const mockLanguages = [
    {
      id: 1,
      code: 'en',
      name: 'English',
      nativeName: 'English',
      isRTL: false,
      enabled: true,
      translations: {
        title: 'Student Union Election',
        description: 'Annual election for Student Union leadership positions',
        positions: {
          president: 'President',
          vicePresident: 'Vice President',
          secretary: 'Secretary',
          treasurer: 'Treasurer'
        },
        buttons: {
          vote: 'Vote',
          viewResults: 'View Results',
          manage: 'Manage'
        },
        messages: {
          votingOpen: 'Voting is now open',
          votingClosed: 'Voting has closed',
          resultsAvailable: 'Results are available'
        }
      },
      completion: 100,
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      isRTL: false,
      enabled: true,
      translations: {
        title: 'Elección del Sindicato de Estudiantes',
        description: 'Elección anual para los puestos de liderazgo del Sindicato de Estudiantes',
        positions: {
          president: 'Presidente',
          vicePresident: 'Vicepresidente',
          secretary: 'Secretario',
          treasurer: 'Tesorero'
        },
        buttons: {
          vote: 'Votar',
          viewResults: 'Ver Resultados',
          manage: 'Gestionar'
        },
        messages: {
          votingOpen: 'La votación está abierta',
          votingClosed: 'La votación ha cerrado',
          resultsAvailable: 'Los resultados están disponibles'
        }
      },
      completion: 95,
      lastUpdated: '2024-01-14T15:30:00Z'
    },
    {
      id: 3,
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      isRTL: false,
      enabled: true,
      translations: {
        title: 'Élection du Syndicat Étudiant',
        description: 'Élection annuelle pour les postes de direction du Syndicat Étudiant',
        positions: {
          president: 'Président',
          vicePresident: 'Vice-président',
          secretary: 'Secrétaire',
          treasurer: 'Trésorier'
        },
        buttons: {
          vote: 'Voter',
          viewResults: 'Voir les Résultats',
          manage: 'Gérer'
        },
        messages: {
          votingOpen: 'Le vote est maintenant ouvert',
          votingClosed: 'Le vote est fermé',
          resultsAvailable: 'Les résultats sont disponibles'
        }
      },
      completion: 90,
      lastUpdated: '2024-01-13T09:15:00Z'
    },
    {
      id: 4,
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      isRTL: true,
      enabled: false,
      translations: {
        title: 'انتخابات اتحاد الطلاب',
        description: 'انتخابات سنوية لمناصب قيادة اتحاد الطلاب',
        positions: {
          president: 'الرئيس',
          vicePresident: 'نائب الرئيس',
          secretary: 'الأمين',
          treasurer: 'الأمين المالي'
        },
        buttons: {
          vote: 'تصويت',
          viewResults: 'عرض النتائج',
          manage: 'إدارة'
        },
        messages: {
          votingOpen: 'التصويت مفتوح الآن',
          votingClosed: 'تم إغلاق التصويت',
          resultsAvailable: 'النتائج متاحة'
        }
      },
      completion: 75,
      lastUpdated: '2024-01-12T14:20:00Z'
    }
  ];

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
  ];

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoading(true);
      try {
        // Try to fetch election-specific settings which may include localization
        if (electionId) {
          const data = await configAPI.getElectionSettings(electionId);
          const loc = data?.election?.localization || data?.localization || null;
          if (loc && Array.isArray(loc.languages)) {
            setLanguages(loc.languages);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('No localization found on server or failed to fetch:', err?.message || err);
      }

      // fallback to mock
      setLanguages(mockLanguages);
      setLoading(false);
    };

    fetchLanguages();
  }, [electionId]);

  const handleAddLanguage = () => {
    const language = {
      id: Date.now(),
      ...newLanguage,
      translations: {
        title: election?.title || '',
        description: election?.description || '',
        positions: {},
        buttons: {},
        messages: {}
      },
      completion: 0,
      lastUpdated: new Date().toISOString()
    };

  setLanguages(prev => [...prev, language]);
    setShowAddModal(false);
    setNewLanguage({
      code: '',
      name: '',
      nativeName: '',
      isRTL: false,
      enabled: true
    });
  };

  const handleSaveLocalization = async () => {
    try {
      showLoader('Saving localization...');
      const payload = { electionId, languages };
      await configAPI.setLocalization(payload);
      showToast('Localization saved', 'success');
    } catch (err) {
      console.error('Failed to save localization:', err);
      showToast('Failed to save localization', 'error');
    } finally {
      hideLoader();
    }
  };

  const handleEditLanguage = (language) => {
    setEditingLanguage(language);
    setShowEditModal(true);
  };

  const handleSaveLanguage = () => {
    setLanguages(prev => prev.map(lang => 
      lang.id === editingLanguage.id 
        ? { ...lang, ...editingLanguage, lastUpdated: new Date().toISOString() }
        : lang
    ));
    setShowEditModal(false);
    setEditingLanguage(null);
  };

  const handleDeleteLanguage = (languageId) => {
    setLanguages(prev => prev.filter(lang => lang.id !== languageId));
  };

  const handleToggleLanguage = (languageId) => {
    setLanguages(prev => prev.map(lang => 
      lang.id === languageId 
        ? { ...lang, enabled: !lang.enabled }
        : lang
    ));
  };

  const handleExportTranslations = (language) => {
    // In real implementation, this would export the translations
    console.log('Exporting translations for:', language.name);
  };

  const handleImportTranslations = (language) => {
    // In real implementation, this would import translations
    console.log('Importing translations for:', language.name);
  };

  const getCompletionColor = (completion) => {
    if (completion >= 90) return 'text-green-400';
    if (completion >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCompletionBg = (completion) => {
    if (completion >= 90) return 'bg-green-400';
    if (completion >= 70) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Multi-Language Support</h2>
          <p className="text-gray-400">Manage translations and language settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveLocalization}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Language
          </button>
        </div>
      </div>

      {/* Language Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Languages</p>
              <p className="text-2xl font-bold text-white">{languages.length}</p>
            </div>
            <Globe className="w-8 h-8 text-sky-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Languages</p>
              <p className="text-2xl font-bold text-white">
                {languages.filter(lang => lang.enabled).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Complete Translations</p>
              <p className="text-2xl font-bold text-white">
                {languages.filter(lang => lang.completion >= 90).length}
              </p>
            </div>
            <Languages className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">RTL Languages</p>
              <p className="text-2xl font-bold text-white">
                {languages.filter(lang => lang.isRTL).length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Languages List */}
      <div className="space-y-4">
        {languages.map((language) => (
          <motion.div
            key={language.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-sky-900/20">
                  <Globe className="w-5 h-5 text-sky-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {language.name} ({language.nativeName})
                    </h3>
                    <span className="text-sm text-gray-400">({language.code})</span>
                    {language.enabled ? (
                      <span className="px-2 py-1 text-xs rounded-full text-green-400 bg-green-900/20">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full text-gray-400 bg-gray-900/20">
                        Inactive
                      </span>
                    )}
                    {language.isRTL && (
                      <span className="px-2 py-1 text-xs rounded-full text-purple-400 bg-purple-900/20">
                        RTL
                      </span>
                    )}
                  </div>
                  
                  {/* Translation Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Translation Progress</span>
                      <span className={`text-sm font-medium ${getCompletionColor(language.completion)}`}>
                        {language.completion}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCompletionBg(language.completion)}`}
                        style={{ width: `${language.completion}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Translation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Last Updated:</span>
                      <p className="text-gray-300">
                        {new Date(language.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className={`${
                        language.completion >= 90 ? 'text-green-400' :
                        language.completion >= 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {language.completion >= 90 ? 'Complete' :
                         language.completion >= 70 ? 'In Progress' : 'Needs Work'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Direction:</span>
                      <p className="text-gray-300">
                        {language.isRTL ? 'Right-to-Left' : 'Left-to-Right'}
                      </p>
                    </div>
                  </div>

                  {/* Sample Translations */}
                  <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Sample Translations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Title:</span>
                        <span className="text-white">{language.translations.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vote Button:</span>
                        <span className="text-white">{language.translations.buttons?.vote}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">President:</span>
                        <span className="text-white">{language.translations.positions?.president}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleLanguage(language.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    language.enabled 
                      ? 'bg-green-600 hover:bg-green-500 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                  title={language.enabled ? 'Disable' : 'Enable'}
                >
                  {language.enabled ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEditLanguage(language)}
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  title="Edit Translations"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExportTranslations(language)}
                  className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleImportTranslations(language)}
                  className="p-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors"
                  title="Import"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteLanguage(language.id)}
                  className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Language Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showAddModal ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
          showAddModal ? 'block' : 'hidden'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Add Language</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language *
              </label>
              <select
                value={newLanguage.code}
                onChange={(e) => {
                  const selected = availableLanguages.find(lang => lang.code === e.target.value);
                  setNewLanguage(prev => ({
                    ...prev,
                    code: e.target.value,
                    name: selected?.name || '',
                    nativeName: selected?.nativeName || ''  
                  }));
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
              >
                <option value="">Select a language...</option>
                {availableLanguages
                  .filter(lang => !languages.some(l => l.code === lang.code))
                  .map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RTL (Right-to-Left)
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newLanguage.isRTL}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, isRTL: e.target.checked }))}
                  className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                />
                <span className="text-gray-300">Enable right-to-left text direction</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enable Language
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newLanguage.enabled}
                  onChange={(e) => setNewLanguage(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                />
                <span className="text-gray-300">Make this language available to users</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLanguage}
                disabled={!newLanguage.code}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Add Language
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Edit Language Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showEditModal ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
          showEditModal ? 'block' : 'hidden'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Edit Translations - {editingLanguage?.name}
            </h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {editingLanguage && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingLanguage?.translations?.title || ''}
                    onChange={(e) => setEditingLanguage(prev => ({
                      ...prev,
                      translations: {
                        ...prev.translations,
                        title: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                    placeholder="Election title in this language"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingLanguage?.translations?.description || ''}
                    onChange={(e) => setEditingLanguage(prev => ({
                      ...prev,
                      translations: {
                        ...prev.translations,
                        description: e.target.value
                      }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                    placeholder="Election description in this language"
                  />
                </div>
              </div>

              {/* Position Translations */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Position Names</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(editingLanguage.translations.positions || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setEditingLanguage(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            positions: {
                              ...prev.translations.positions,
                              [key]: e.target.value
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                        placeholder={`${key} in ${editingLanguage.name}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Translations */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Button Labels</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(editingLanguage.translations.buttons || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setEditingLanguage(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            buttons: {
                              ...prev.translations.buttons,
                              [key]: e.target.value
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                        placeholder={`${key} in ${editingLanguage.name}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Translations */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">System Messages</h4>
                <div className="space-y-4">
                  {Object.entries(editingLanguage.translations.messages || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setEditingLanguage(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            messages: {
                              ...prev.translations.messages,
                              [key]: e.target.value
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                        placeholder={`${key} in ${editingLanguage.name}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Settings */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Language Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      RTL (Right-to-Left)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingLanguage.isRTL}
                        onChange={(e) => setEditingLanguage(prev => ({
                          ...prev,
                          isRTL: e.target.checked
                        }))}
                        className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                      />
                      <span className="text-gray-300">Enable right-to-left text direction</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enable Language
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingLanguage.enabled}
                        onChange={(e) => setEditingLanguage(prev => ({
                          ...prev,
                          enabled: e.target.checked
                        }))}
                        className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                      />
                      <span className="text-gray-300">Make this language available to users</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLanguage}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ElectionLanguageSupport;