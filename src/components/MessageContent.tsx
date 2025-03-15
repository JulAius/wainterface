
import React from 'react';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // Fonction pour détecter et éviter les répétitions de contenu
  const removeDuplicateLines = (text: string) => {
    if (!text) return '';
    
    // Diviser le texte en lignes
    const lines = text.split('\n');
    const uniqueLines: string[] = [];
    const seenLines = new Set<string>();
    
    // Filtrer les lignes pour éliminer les doublons
    lines.forEach(line => {
      // Ignorer les lignes vides ou trop courtes
      if (line.trim().length < 5) {
        uniqueLines.push(line);
        return;
      }
      
      // Normaliser la ligne pour la comparaison (enlever les espaces multiples)
      const normalizedLine = line.trim().replace(/\s+/g, ' ');
      
      // Si la ligne n'a pas déjà été vue, l'ajouter
      if (!seenLines.has(normalizedLine)) {
        seenLines.add(normalizedLine);
        uniqueLines.push(line);
      }
    });
    
    return uniqueLines.join('\n');
  };

  // Fonction pour traiter le contenu du message avec formatage avancé
  const processContent = (text: string) => {
    if (!text) return null;
    
    // Supprimer les répétitions
    const cleanedText = removeDuplicateLines(text);
    
    // Traiter les différentes sections
    const lines = cleanedText.split('\n');
    const result: React.ReactNode[] = [];
    let currentSection = null;
    let currentList: { items: React.ReactNode[], key: string } | null = null;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Traiter les titres de section
      if (trimmedLine.startsWith('Itinéraires populaires') || 
          trimmedLine.startsWith('Types de cabines') ||
          trimmedLine.startsWith('Installations et activités') ||
          trimmedLine.startsWith('Tarifs et promotions')) {
        
        if (currentList) {
          result.push(
            <div key={currentList.key} className="ml-2 my-1">
              {currentList.items}
            </div>
          );
          currentList = null;
        }
        
        currentSection = (
          <div key={`section-${index}`} className="font-semibold text-base my-2">
            {processText(trimmedLine)}
          </div>
        );
        result.push(currentSection);
      }
      // Traiter les éléments de liste
      else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        if (!currentList) {
          currentList = {
            items: [],
            key: `list-${index}`
          };
        }
        
        currentList.items.push(
          <div key={`item-${index}`} className="flex items-start">
            <span className="mr-2 min-w-[15px]">•</span>
            <span>{processText(trimmedLine.substring(1).trim())}</span>
          </div>
        );
      }
      // Traiter les lignes normales
      else if (trimmedLine.length > 0) {
        if (currentList) {
          result.push(
            <div key={currentList.key} className="ml-2 my-1">
              {currentList.items}
            </div>
          );
          currentList = null;
        }
        
        // Traiter les lignes spéciales
        if (trimmedLine.includes('---')) {
          result.push(<hr key={`hr-${index}`} className="my-2 border-gray-500/30" />);
        } else if (trimmedLine.startsWith('📞')) {
          result.push(
            <div key={`contact-${index}`} className="my-2 font-medium">
              {processText(trimmedLine)}
            </div>
          );
        } else if (trimmedLine.includes('rendez-vous est prévu')) {
          result.push(
            <div key={`appointment-${index}`} className="my-2 font-medium">
              {processText(trimmedLine)}
            </div>
          );
        } else {
          result.push(
            <div key={`text-${index}`} className="my-1">
              {processText(trimmedLine)}
            </div>
          );
        }
      }
    });
    
    // Ajouter la dernière liste si elle existe
    if (currentList) {
      result.push(
        <div key={currentList.key} className="ml-2 my-1">
          {currentList.items}
        </div>
      );
    }
    
    return result;
  };
  
  // Fonction pour traiter le texte et appliquer le formatage gras
  const processText = (text: string) => {
    if (!text) return text;
    
    const parts: { type: 'text' | 'bold', content: string }[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    // Traiter les parties en gras
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      parts.push({
        type: 'bold',
        content: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Ajouter le reste du texte
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    // Si aucune partie formatée n'a été trouvée, retourner le texte tel quel
    if (parts.length === 0) {
      return text;
    }
    
    // Renvoyer les parties formatées
    return parts.map((part, i) => {
      if (part.type === 'bold') {
        return <strong key={i} className="font-bold">{part.content}</strong>;
      }
      return <span key={i}>{part.content}</span>;
    });
  };
  
  return (
    <div className="message-content break-words">
      {processContent(content)}
    </div>
  );
};

export default MessageContent;
