
import React from 'react';
import { FileText, Download, ExternalLink, Music, Video } from 'lucide-react';

interface PreviewProps {
  type: string;
  id: string;
  mediaId?: string;
  caption?: string;
  mime_type?: string;
  filename?: string;
}

const MessagePreview: React.FC<{ preview: PreviewProps | null }> = ({ preview }) => {
  if (!preview) return null;

  const mediaId = preview.id || preview.mediaId; // Gère les deux formats possibles

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/media/${id}/download`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${preview.type}.${preview.mime_type?.split('/')[1] || 'jpg'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      alert('Erreur lors du téléchargement du média');
    }
  };

  // Si c'est une image
  if (preview.type === 'image') {
    return (
      <div className="w-full max-w-md">
        <img
          src={`/api/media/${mediaId}/download`}
          alt={preview.caption || ""}
          className="w-full rounded-lg mb-2"
          style={{ maxHeight: '200px', objectFit: 'contain' }}
          onError={(e) => {
            console.error('Erreur chargement image:', e);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => window.open(`/api/media/${mediaId}/download`, '_blank')}
            className="p-1 hover:bg-emerald-600 rounded"
            title="Ouvrir"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={() => handleDownload(mediaId)}
            className="p-1 hover:bg-emerald-600 rounded"
            title="Télécharger"
          >
            <Download className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
        {preview.caption && (
          <p className="text-sm text-gray-400 mt-1">{preview.caption}</p>
        )}
      </div>
    );
  }

  // Pour les autres types de médias
  // Fix the TypeScript error by properly defining the icon mapping
  const iconMap = {
    audio: Music,
    video: Video,
    document: FileText
  };
  
  // Use the type as a key to access the icon, with FileText as fallback
  const Icon = iconMap[preview.type as keyof typeof iconMap] || FileText;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 p-2 bg-[#2a3942] rounded-lg">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-300">
          {preview.caption || preview.filename || `${preview.type} Media`}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => window.open(`/api/media/${mediaId}/download`, '_blank')}
          className="p-1 hover:bg-emerald-600 rounded"
          title="Ouvrir"
        >
          <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
        <button
          onClick={() => handleDownload(mediaId)}
          className="p-1 hover:bg-emerald-600 rounded"
          title="Télécharger"
        >
          <Download className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default MessagePreview;
