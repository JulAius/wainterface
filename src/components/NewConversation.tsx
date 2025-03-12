
import React, { useState } from 'react';
import { Send, AlertCircle, Phone } from 'lucide-react';

interface NewConversationProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const NewConversation: React.FC<NewConversationProps> = ({ onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const templates = [
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
      displayName: "nouveau_prix",
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
  ];

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);
    // Initialise un objet avec une clé pour chaque variable du template sélectionné.
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

  const formatPhoneNumber = (number: string) => {
    // Supprime tous les caractères non numériques
    let cleaned = number.replace(/\D/g, '');
    
    // S'assure que le numéro commence par 33
    if (!cleaned.startsWith('33')) {
      if (cleaned.startsWith('0')) {
        cleaned = '33' + cleaned.slice(1);
      } else {
        cleaned = '33' + cleaned;
      }
    }
    
    return cleaned;
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !selectedTemplate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      
      const response = await fetch('/api/templates/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Le payload envoie le nom du template sélectionné, le numéro formaté et un objet regroupant toutes les variables.
        body: JSON.stringify({
          templateName: selectedTemplate,
          recipient: formattedNumber,
          variables: variables
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de l'envoi du template");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E2D34] border border-gray-700/30 rounded-lg shadow-xl w-full max-w-lg">
      <div className="p-6 border-b border-gray-700/20">
        <h2 className="text-xl font-bold text-gray-100">Nouvelle conversation</h2>
        <p className="text-gray-400 text-sm mt-1">
          Créer une nouvelle conversation avec un template
        </p>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Champ numéro de téléphone */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">
            Numéro de téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex: 06XXXXXXXX ou +33XXXXXXXXX"
              className="w-full p-3 pl-12 bg-[#2a3942] text-white border border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Sélection du template */}
        <div>
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
        </div>

        {/* Affichage dynamique des champs de variables */}
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
          disabled={loading || !selectedTemplate || !phoneNumber}
          className={`px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center ${
            loading || !selectedTemplate || !phoneNumber ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'
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

export default NewConversation;
