
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import TransitionWrapper from './TransitionWrapper';
import { Check, CheckCheck, Clock, XCircle } from 'lucide-react';

interface MessageStatus {
  sent: boolean;
  delivered: boolean;
  read: boolean;
  failed: boolean;
  timestamp: Date | null;
}

interface MessagePreviewProps {
  type: string;
  id: string;
  caption?: string;
}

interface MessageBubbleProps {
  message: string;
  sender: 'me' | 'them' | 'user' | 'bot';
  timestamp: Date | string;
  status?: string;
  read?: boolean;
  type?: string;
  mediaUrl?: string;
  filename?: string;
  caption?: string;
}

const StatusIndicator: React.FC<{ status: MessageStatus }> = ({ status }) => {
  if (status.failed) {
    return <XCircle className="w-3.5 h-3.5 text-destructive" />;
  }
  if (status.read) {
    return <CheckCheck className="w-3.5 h-3.5 text-whatsapp" />;
  }
  if (status.delivered) {
    return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
  }
  if (status.sent) {
    return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
  }
  return <Clock className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />;
};

const PreviewContent: React.FC<{ preview: MessagePreviewProps }> = ({ preview }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-40 bg-accent/50 animate-pulse rounded-lg backdrop-blur-sm"></div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden">
        {preview.type.includes('image') ? (
          <div className="bg-accent/50 backdrop-blur-sm rounded-lg w-full h-40 flex items-center justify-center shadow-inner">
            <div className="text-sm text-foreground/80 glass-morphism px-3 py-1 rounded-full">Image Preview</div>
          </div>
        ) : preview.type.includes('video') ? (
          <div className="bg-accent/50 backdrop-blur-sm rounded-lg w-full h-40 flex items-center justify-center shadow-inner">
            <div className="text-sm text-foreground/80 glass-morphism px-3 py-1 rounded-full">Video Preview</div>
          </div>
        ) : (
          <div className="bg-accent/50 backdrop-blur-sm rounded-lg w-full py-6 flex items-center justify-center shadow-inner">
            <div className="text-sm text-foreground/80 glass-morphism px-3 py-1 rounded-full">File: {preview.id}</div>
          </div>
        )}
      </div>
      {preview.caption && <p className="text-sm">{preview.caption}</p>}
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  timestamp,
  status,
  read,
  type,
  mediaUrl,
  filename,
  caption
}) => {
  // Normaliser le type d'expéditeur pour être compatible avec les types existants
  const normalizedSender = sender === 'me' || sender === 'user' ? 'user' : 'bot';
  
  // Déterminer si le message est envoyé par l'utilisateur
  const isSent = normalizedSender === 'user';
  
  const preview = type ? {
    type,
    id: filename || mediaUrl || 'unknown',
    caption
  } : null;
  
  const timeObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Configuration du statut pour l'indicateur
  const messageStatus: MessageStatus = {
    sent: status === 'sent' || status === 'delivered' || status === 'read',
    delivered: status === 'delivered' || status === 'read',
    read: status === 'read' || !!read,
    failed: status === 'failed',
    timestamp: timeObj
  };
  
  return (
    <TransitionWrapper
      animation={isSent ? 'slide-left' : 'slide-right'}
      className={cn(
        "max-w-[70%] rounded-2xl p-3 mb-2",
        isSent 
          ? "ml-auto bg-whatsapp-glass backdrop-blur-sm border border-whatsapp/10 shadow-sm" 
          : "mr-auto bg-secondary/60 backdrop-blur-sm border border-white/5 shadow-sm"
      )}
    >
      {preview ? (
        <PreviewContent preview={preview} />
      ) : (
        <div className="message-content">
          <p className="text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap">{message}</p>
        </div>
      )}
      
      <div className="flex items-center justify-end mt-1 space-x-1">
        <span className="text-[10px] opacity-70">
          {timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isSent && (
          <StatusIndicator status={messageStatus} />
        )}
      </div>
    </TransitionWrapper>
  );
};

export default MessageBubble;
