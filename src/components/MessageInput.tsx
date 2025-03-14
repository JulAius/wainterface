
import React, { useState } from 'react';
import { Smile, Paperclip, FileText, Mic, Send } from 'lucide-react';
import IconButton from './IconButton';
import TransitionWrapper from './TransitionWrapper';

interface MessageInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend?: () => void;
  onSendMessage?: (message: string) => void;
  onShowTemplates?: () => void;
  onShowMediaSender?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value = '',
  onChange,
  onSend,
  onSendMessage,
  onShowTemplates,
  onShowMediaSender,
  isLoading = false,
  placeholder = 'Message',
  disabled = false,
}) => {
  const [localMessage, setLocalMessage] = useState('');
  
  // Use either the controlled message or the local state
  const message = onChange ? value : localMessage;
  
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMessage(e.target.value);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    if (onSendMessage) {
      onSendMessage(message);
    } else if (onSend) {
      onSend();
    }
    
    if (!onChange) {
      setLocalMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <TransitionWrapper animation="slide-bottom">
      <div className="p-4 bg-card/90 backdrop-blur-md border-t border-white/5 flex items-center space-x-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <IconButton title="Emoji">
            <Smile className="w-5 h-5" />
          </IconButton>
          <IconButton title="Attach Media" onClick={onShowMediaSender}>
            <Paperclip className="w-5 h-5" />
          </IconButton>
          <IconButton title="Templates" onClick={onShowTemplates}>
            <FileText className="w-5 h-5" />
          </IconButton>
        </div>
        
        <div className="flex-1">
          <input
            type="text"
            value={message}
            onChange={onChange || handleLocalChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full py-2.5 px-4 bg-secondary/50 backdrop-blur-sm text-foreground placeholder-muted-foreground/70 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp/30 transition-all border border-white/5"
          />
        </div>
        
        {message ? (
          <IconButton 
            onClick={handleSend}
            disabled={isLoading || disabled}
            variant="primary"
            title="Send Message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </IconButton>
        ) : (
          <IconButton title="Voice Message" disabled={disabled}>
            <Mic className="w-5 h-5" />
          </IconButton>
        )}
      </div>
    </TransitionWrapper>
  );
};

export default MessageInput;
