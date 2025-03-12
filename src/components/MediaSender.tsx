
import React, { useState, useCallback } from 'react';
import { Upload, X, Send, Image, FileText, Music } from 'lucide-react';

interface MediaSenderProps {
  selectedChat: any;
  onClose: () => void;
}

const MediaSender: React.FC<MediaSenderProps> = ({ selectedChat, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaTypes = [
    { id: 'image', icon: Image, label: 'Image', accept: 'image/jpeg,image/png', maxSize: 5 },
    { id: 'audio', icon: Music, label: 'Audio', accept: 'audio/mp4,audio/aac,audio/mpeg,audio/amr,audio/ogg', maxSize: 16 },
    { id: 'document', icon: FileText, label: 'Document', accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt', maxSize: 100 }
  ];

  const validateFile = useCallback((file: File, mediaType: string) => {
    const mediaTypeConfig = mediaTypes.find(type => type.id === mediaType);
    if (!mediaTypeConfig) return;
    
    const maxSize = mediaTypeConfig.maxSize * 1024 * 1024;

    if (!file.type.match(mediaTypeConfig.accept.split(',').join('|'))) {
      throw new Error(`Format de fichier non supporté. Formats acceptés: ${mediaTypeConfig.accept}`);
    }

    if (file.size > maxSize) {
      throw new Error(`Le fichier est trop volumineux. Maximum ${mediaTypeConfig.maxSize}MB`);
    }
  }, [mediaTypes]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) return;

    try {
      validateFile(selectedFile, mediaType);
      setFile(selectedFile);
    } catch (err: any) {
      setError(err.message);
      e.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedChat) return;
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', mediaType);

      const uploadResponse = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(await uploadResponse.text() || "Échec de l'upload");
      }

      const { mediaId } = await uploadResponse.json();

      const sendResponse = await fetch('/api/media/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedChat.id,
          mediaType,
          mediaId,
          caption,
          filename: file.name
        })
      });

      if (!sendResponse.ok) {
        throw new Error("Échec de l'envoi");
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E2D34] border border-gray-700/30 rounded-lg shadow-xl w-full max-w-lg">
      <div className="p-6 border-b border-gray-700/20">
        <h2 className="text-xl font-bold text-gray-100">Envoyer un média</h2>
        <p className="text-gray-400 text-sm mt-1">
          Sélectionnez le type de média à envoyer
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-around p-2 bg-[#2a3942] rounded-lg">
          {mediaTypes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setMediaType(id);
                setFile(null);
                setError(null);
              }}
              className={`p-3 rounded-lg flex flex-col items-center ${
                mediaType === id ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <input
            type="file"
            accept={mediaTypes.find(type => type.id === mediaType)?.accept}
            onChange={handleFileChange}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className={`flex items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              error ? 'border-red-500' : 'border-gray-700 hover:border-emerald-500'
            }`}
          >
            {file ? (
              <div className="flex items-center gap-2">
                <Upload className="w-6 h-6 text-emerald-500" />
                <span className="text-gray-300">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload className="w-8 h-8" />
                <span>Cliquez pour sélectionner un fichier</span>
                <span className="text-sm">
                  Maximum {mediaTypes.find(type => type.id === mediaType)?.maxSize}MB
                </span>
              </div>
            )}
          </label>
        </div>

        {mediaType !== 'audio' && (
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ajouter une légende..."
            className="w-full p-3 bg-[#2a3942] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {loading && uploadProgress > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
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
          onClick={handleUpload}
          disabled={loading || !file}
          className={`px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center ${
            loading || !file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
              Upload...
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

export default MediaSender;
