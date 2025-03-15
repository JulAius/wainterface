
import React, { useState } from 'react';
import { Smile, Paperclip, FileText, Mic, Send } from 'lucide-react';
import IconButton from './IconButton';
import TransitionWrapper from './TransitionWrapper';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onShowTemplates: () => void;
  onShowMediaSender: () => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onShowTemplates,
  onShowMediaSender,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <TransitionWrapper animation="slide-bottom">
      <div className="p-4 bg-card border-t border-border flex items-center space-x-3">
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
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            className="w-full py-2.5 px-4 bg-secondary text-foreground placeholder-muted-foreground rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        {message ? (
          <IconButton 
            onClick={handleSend}
            disabled={isLoading}
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
          <IconButton title="Voice Message">
            <Mic className="w-5 h-5" />
          </IconButton>
        )}
      </div>
    </TransitionWrapper>
  );
};

export default MessageInput;
