
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import TransitionWrapper from './TransitionWrapper';
import { Check, CheckCheck, Clock, XCircle, Image, File, Video } from 'lucide-react';

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
      <div className="w-full h-40 bg-accent/50 animate-pulse rounded-lg"></div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden">
        {preview.type.includes('image') ? (
          <div className="bg-accent/30 rounded-lg w-full h-40 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">
              <Image className="w-4 h-4" />
              <span className="text-sm">Image</span>
            </div>
          </div>
        ) : preview.type.includes('video') ? (
          <div className="bg-accent/30 rounded-lg w-full h-40 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">
              <Video className="w-4 h-4" />
              <span className="text-sm">Video</span>
            </div>
          </div>
        ) : (
          <div className="bg-accent/30 rounded-lg w-full py-6 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">
              <File className="w-4 h-4" />
              <span className="text-sm">{preview.id}</span>
            </div>
          </div>
        )}
      </div>
      {preview.caption && <p className="text-sm whitespace-pre-wrap break-words">{preview.caption}</p>}
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
  // Normalize sender type
  const normalizedSender = sender === 'me' || sender === 'user' ? 'user' : 'bot';
  
  // Determine if message is from user or bot
  const isFromUser = normalizedSender === 'user';
  
  const preview = type ? {
    type,
    id: filename || mediaUrl || 'unknown',
    caption
  } : null;
  
  const timeObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  // Configure message status
  const messageStatus: MessageStatus = {
    sent: status === 'sent' || status === 'delivered' || status === 'read',
    delivered: status === 'delivered' || status === 'read',
    read: status === 'read' || !!read,
    failed: status === 'failed',
    timestamp: timeObj
  };
  
  return (
    <TransitionWrapper
      animation={isFromUser ? 'slide-left' : 'slide-right'}
      className={cn(
        "relative max-w-[75%] mb-3 group",
        isFromUser ? "ml-auto" : "mr-auto"
      )}
    >
      <div 
        className={cn(
          "px-3 py-2 rounded-xl shadow-sm",
          isFromUser 
            ? "bg-whatsapp/90 text-background border border-whatsapp/30 rounded-br-none" 
            : "bg-card/90 text-foreground border border-white/10 rounded-bl-none"
        )}
      >
        {preview ? (
          <PreviewContent preview={preview} />
        ) : (
          <div className="message-content">
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message}</p>
          </div>
        )}
        
        <div className="flex items-center justify-end mt-1 space-x-1 opacity-80">
          <span className="text-[10px]">
            {timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isFromUser && (
            <StatusIndicator status={messageStatus} />
          )}
        </div>
      </div>
      
      {/* Bubble tail */}
      <div 
        className={cn(
          "absolute bottom-0 w-3 h-4 overflow-hidden",
          isFromUser ? "-right-2" : "-left-2"
        )}
      >
        <div 
          className={cn(
            "absolute w-4 h-4 transform rotate-45 top-0",
            isFromUser 
              ? "bg-whatsapp/90 border-b border-r border-whatsapp/30 -translate-x-1/2" 
              : "bg-card/90 border-b border-l border-white/10 translate-x-1/2"
          )}
        />
      </div>
    </TransitionWrapper>
  );
};

export default MessageBubble;
