
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import TransitionWrapper from './TransitionWrapper';
import MessageContent from './MessageContent';
import MessagePreview from './MessagePreview';

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
  mime_type?: string;
  filename?: string;
}

interface MessageBubbleProps {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: MessageStatus;
  preview?: MessagePreviewProps | null;
}

const StatusIndicator: React.FC<{ status: MessageStatus }> = ({ status }) => {
  if (status.failed) {
    return <span className="text-destructive ml-1 text-sm">•</span>;
  }
  if (status.read) {
    return <span className="text-whatsapp ml-1 text-sm">••</span>;
  }
  if (status.delivered) {
    return <span className="text-muted-foreground ml-1 text-sm">••</span>;
  }
  if (status.sent) {
    return <span className="text-muted-foreground ml-1 text-sm">•</span>;
  }
  return null;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  status,
  preview
}) => {
  const isSent = sender === 'bot';
  
  return (
    <TransitionWrapper
      animation={isSent ? 'slide-left' : 'slide-right'}
      className={cn(
        "max-w-[70%] p-3 mb-2",
        isSent ? "ml-auto message-bubble-sent" : "mr-auto message-bubble-received"
      )}
    >
      {preview ? (
        <MessagePreview preview={preview} />
      ) : (
        <MessageContent content={content} />
      )}
      
      <div className="flex items-center justify-end mt-1 space-x-1">
        <span className="text-xs text-muted-foreground">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isSent && status && <StatusIndicator status={status} />}
      </div>
    </TransitionWrapper>
  );
};

export default MessageBubble;
