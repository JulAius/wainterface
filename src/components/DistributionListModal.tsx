
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Trash2, 
  Send, 
  Loader,
  Users,
  Search,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { getTemplates, sendTemplateMessage } from '../services/api';

interface DistributionListModalProps {
  onClose: () => void;
}

interface DistributionList {
  id: number;
  name: string;
  numbers: string[];
  createdAt: string;
}

interface Template {
  name: string;
  displayName: string;
  variables: {
    name: string;
    label: string;
    type: string;
  }[];
}

interface SendingProgress {
  isActive: boolean;
  current: number;
  total: number;
  success: number;
  failed: number;
  failedNumbers: string[];
}

const DistributionListModal: React.FC<DistributionListModalProps> = ({ onClose }) => {
  // États pour les listes et la recherche
  const [lists, setLists] = useState<DistributionList[]>([]);
  const [selectedList, setSelectedList] = useState<DistributionList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // États pour les templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  
  // État pour le suivi des envois
  const [sendingProgress, setSendingProgress] = useState<SendingProgress>({
    isActive: false,
    current: 0,
    total: 0,
    success: 0,
    failed: 0,
    failedNumbers: []
  });

  // Charger les templates disponibles
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Erreur chargement templates:', error);
      }
    };
    
    fetchTemplates();
    loadLists(); // Charger les listes sauvegardées
  }, []);

  // Charger les listes depuis le localStorage
  const loadLists = () => {
    const savedLists = localStorage.getItem('distributionLists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }
  };

  // Sauvegarder les listes dans le localStorage
  const saveLists = (updatedLists: DistributionList[]) => {
    localStorage.setItem('distributionLists', JSON.stringify(updatedLists));
    setLists(updatedLists);
  };

  // Création d'une nouvelle liste
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    
    const newList: DistributionList = {
      id: Date.now(),
      name: newListName,
      numbers: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedLists = [...lists, newList];
    saveLists(updatedLists);
    setSelectedList(newList);
    setNewListName('');
  };

  // Ajout d'un numéro à la liste
  const handleAddNumber = () => {
    if (!selectedList || !newNumber.trim()) return;
    
    // Validation du numéro
    const cleanNumber = newNumber.trim().replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      alert('Le numéro doit contenir au moins 10 chiffres');
      return;
    }

    // Vérifier les doublons
    if (selectedList.numbers.includes(cleanNumber)) {
      alert('Ce numéro existe déjà dans la liste');
      return;
    }
    
    const updatedLists = lists.map(list => {
      if (list.id === selectedList.id) {
        return {
          ...list,
          numbers: [...list.numbers, cleanNumber]
        };
      }
      return list;
    });

    saveLists(updatedLists);
    setSelectedList({
      ...selectedList,
      numbers: [...selectedList.numbers, cleanNumber]
    });
    setNewNumber('');
  };

  // Import CSV
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedList) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      const numbers = text.split(/\r?\n/)
        .map(number => number.trim().replace(/\D/g, ''))
        .filter(number => number.length >= 10);

      if (numbers.length === 0) {
        alert('Aucun numéro valide trouvé dans le fichier');
        setIsUploading(false);
        return;
      }

      // Filtrer les doublons
      const uniqueNumbers = [...new Set([...selectedList.numbers, ...numbers])];
      
      const updatedLists = lists.map(list => {
        if (list.id === selectedList.id) {
          return {
            ...list,
            numbers: uniqueNumbers
          };
        }
        return list;
      });

      saveLists(updatedLists);
      setSelectedList({
        ...selectedList,
        numbers: uniqueNumbers
      });
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  // Envoi de template en masse
  const handleBulkSend = async () => {
    if (!selectedList || !selectedTemplate || sendingProgress.isActive) return;

    // Vérifier les variables requises
    const missingVariables = selectedTemplate.variables.filter(
      v => !templateVariables[v.name]
    );

    if (missingVariables.length > 0) {
      alert('Veuillez remplir toutes les variables du template');
      return;
    }

    setSendingProgress({
      isActive: true,
      current: 0,
      total: selectedList.numbers.length,
      success: 0,
      failed: 0,
      failedNumbers: []
    });

    for (let i = 0; i < selectedList.numbers.length; i++) {
      const number = selectedList.numbers[i];
      
      try {
        await sendTemplateMessage(selectedTemplate.name, number, templateVariables);
        
        setSendingProgress(prev => ({
          ...prev,
          current: i + 1,
          success: prev.success + 1
        }));
      } catch (error) {
        console.error(`Erreur d'envoi à ${number}:`, error);
        setSendingProgress(prev => ({
          ...prev,
          current: i + 1,
          failed: prev.failed + 1,
          failedNumbers: [...prev.failedNumbers, number]
        }));
      }

      // Délai entre les envois
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Réinitialiser après 2 secondes
    setTimeout(() => {
      setSendingProgress({
        isActive: false,
        current: 0,
        total: 0,
        success: 0,
        failed: 0,
        failedNumbers: []
      });
      setTemplateVariables({});
    }, 2000);
  };

  // Suppression d'une liste
  const handleDeleteList = (listId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) return;
    
    const updatedLists = lists.filter(list => list.id !== listId);
    saveLists(updatedLists);
    if (selectedList?.id === listId) {
      setSelectedList(null);
    }
  };

  // Suppression d'un numéro
  const handleRemoveNumber = (numberToRemove: string) => {
    if (!selectedList) return;
    
    const updatedLists = lists.map(list => {
      if (list.id === selectedList.id) {
        return {
          ...list,
          numbers: list.numbers.filter(num => num !== numberToRemove)
        };
      }
      return list;
    });

    saveLists(updatedLists);
    setSelectedList({
      ...selectedList,
      numbers: selectedList.numbers.filter(num => num !== numberToRemove)
    });
  };

  // Filtrer les listes
  const filteredLists = lists.filter(list => 
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#1E2D34] rounded-lg shadow-xl w-full max-w-4xl">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/20">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-bold text-gray-100">Listes de distribution</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex h-[600px]">
        {/* Panel gauche - Listes */}
        <div className="w-1/3 border-r border-gray-700/20 p-4 flex flex-col">
          {/* Création de liste */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nouvelle liste..."
                className="flex-1 p-2 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Recherche */}
          <div className="mb-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une liste..."
              className="w-full p-2 pl-10 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Liste des groupes */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredLists.map((list) => (
              <div
                key={list.id}
                onClick={() => setSelectedList(list)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  selectedList?.id === list.id ? 'bg-[#2a3942]' : 'hover:bg-[#2a3942]/50'
                }`}
              >
                <div>
                  <h3 className="font-medium text-gray-200">{list.name}</h3>
                  <p className="text-sm text-gray-400">{list.numbers.length} contacts</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {filteredLists.length === 0 && (
              <div className="text-center text-gray-400 mt-4">
                <p>Aucune liste trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel droit - Templates et numéros */}
        <div className="flex-1 p-4 flex flex-col">
          {selectedList ? (
            <>
              {/* Section template */}
              <div className="mb-4 p-4 bg-[#2a3942] rounded-lg">
                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Envoi de template
                </h3>

                {/* Sélection template */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Sélectionner un template
                  </label>
                  <select
                    value={selectedTemplate?.name || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t.name === e.target.value) || null;
                      setSelectedTemplate(template);
                      setTemplateVariables({});
                    }}
                    className="w-full p-2 bg-[#1E2D34] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Choisir un template...</option>
                    {templates.map(template => (
                      <option key={template.name} value={template.name}>
                        {template.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variables du template */}
                {selectedTemplate && (
                  <div className="space-y-3 mb-4">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.name}>
                        <label className="block text-sm text-gray-400 mb-1">
                          {variable.label}
                        </label>
                        <input
                          type="text"
                          value={templateVariables[variable.name] || ''}
                          onChange={(e) => setTemplateVariables(prev => ({
                            ...prev,
                            [variable.name]: e.target.value
                          }))}
                          className="w-full p-2 bg-[#1E2D34] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder={`Entrez ${variable.label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Progression d'envoi */}
                {sendingProgress.isActive ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin text-emerald-500" />
                      <span className="text-gray-200">
                        Envoi en cours... ({sendingProgress.current}/{sendingProgress.total})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1E2D34] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Réussis: {sendingProgress.success}
                      </span>
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Échecs: {sendingProgress.failed}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleBulkSend}
                    disabled={!selectedTemplate || selectedList.numbers.length === 0}
                    className="w-full p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Envoyer le template à {selectedList.numbers.length} contacts
                  </button>
                )}
              </div>

              {/* Section gestion des numéros */}
              <div className="mb-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="Ajouter un numéro..."
                    className="flex-1 p-2 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleAddNumber}
                    disabled={!newNumber.trim()}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a3942] text-white rounded-lg cursor-pointer hover:bg-[#2a3942]/80"
                  >
                    <Upload className="w-5 h-5" />
                    Importer CSV
                  </label>
                  {isUploading && (
                    <span className="text-gray-400 flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Import en cours...
                    </span>
                  )}
                </div>
              </div>

              {/* Liste des numéros */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {selectedList.numbers.map((number, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#2a3942] rounded-lg group"
                    >
                      <span className="text-gray-200">+{number}</span>
                      <button
                        onClick={() => handleRemoveNumber(number)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {selectedList.numbers.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <p>Aucun numéro dans cette liste</p>
                      <p className="text-sm">Ajoutez des numéros manuellement ou importez un fichier CSV</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-xl mb-2">Aucune liste sélectionnée</h3>
              <p>Sélectionnez une liste pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributionListModal;
