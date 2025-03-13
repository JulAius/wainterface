
import React, { useState, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { getTemplates, sendTemplateMessage } from '../services/api';

interface TemplateSenderProps {
  selectedChat: any;
  onClose: () => void;
}

interface TemplateVariable {
  name: string;
  label: string;
  type: string;
}

interface Template {
  name: string;
  displayName: string;
  variables: TemplateVariable[];
}

const TemplateSender: React.FC<TemplateSenderProps> = ({ selectedChat, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const templatesData = await getTemplates();
        setTemplates(templatesData);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Erreur lors du chargement des templates');
        // Set default templates as fallback
        setTemplates([
          {
            name: "informationcroisieres",
            displayName: "Information Croisières",
            variables: [
              { name: "name", label: "Nom du client", type: "text" },
              { name: "ship", label: "Nom du bateau", type: "text" },
              { name: "date", label: "Date de départ", type: "text" }
            ]
          },
          {
            name: "welcome",
            displayName: "Message de bienvenue",
            variables: [
              { name: "customerName", label: "Nom du client", type: "text" }
            ]
          },
          {
            name: "nouveau_prix",
            displayName: "Changement de Prix",
            variables: [
              { name: "clientName", label: "Nom du client", type: "text" },
              { name: "quoteDate", label: "Date du premier devis", type: "text" },
              { name: "portDepart", label: "Port de départ", type: "text" },
              { name: "shipName", label: "Nom du bateau", type: "text" },
              { name: "prixInitial", label: "Prix initial", type: "text" },
              { name: "nouveauPrix", label: "Nouveau prix", type: "text" },
              { name: "pourcentageReduction", label: "Pourcentage de réduction", type: "text" },
              { name: "liencroisiere", label: "lien vers la croisiere", type: "text" }
            ]
          }
        ]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);
    const templateVars: Record<string, string> = {};
    const template = templates.find(t => t.name === templateName);
    template?.variables.forEach(v => {
      templateVars[v.name] = "";
    });
    setVariables(templateVars);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedChat || !selectedTemplate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await sendTemplateMessage(selectedTemplate, selectedChat.id, variables);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi du template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E2D34] border border-gray-700/30 rounded-lg shadow-xl w-full max-w-lg">
      <div className="p-6 border-b border-gray-700/20">
        <h2 className="text-xl font-bold text-gray-100">Envoyer un template</h2>
        <p className="text-gray-400 text-sm mt-1">
          Sélectionnez un template et remplissez les variables
        </p>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          {loadingTemplates ? (
            <div className="w-full p-3 bg-[#2a3942] border border-gray-700/30 rounded-lg flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-white border-opacity-20 border-t-white rounded-full mr-2"></div>
              <span className="text-gray-400">Chargement des templates...</span>
            </div>
          ) : (
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full p-3 bg-[#2a3942] text-white border border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Choisir un template</option>
              {templates.map(template => (
                <option key={template.name} value={template.name}>
                  {template.displayName}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedTemplate && templates.find(t => t.name === selectedTemplate)?.variables.map(variable => (
          <div key={variable.name} className="space-y-2">
            <label className="text-sm text-gray-300">
              {variable.label}
            </label>
            <input
              type={variable.type}
              value={variables[variable.name] || ""}
              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
              className="w-full p-3 bg-[#2a3942] text-white border border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={`Entrez ${variable.label.toLowerCase()}`}
            />
          </div>
        ))}

        {error && (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-700/20 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700/30"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedTemplate}
          className={`px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center ${
            loading || !selectedTemplate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
              Envoi...
            </span>
          ) : (
            <span className="flex items-center">
              <Send className="mr-2 h-4 w-4" />
              Envoyer
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateSender;
