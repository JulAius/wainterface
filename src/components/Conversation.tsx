
import React from 'react';
import { cn } from "@/lib/utils";

interface ConversationProps {
  id: string;
  lastActive: Date;
  messageCount: number;
  isOnline?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

const Conversation: React.FC<ConversationProps> = ({
  id,
  lastActive,
  messageCount,
  isOnline = false,
  isSelected = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "px-4 py-3 cursor-pointer transition-all duration-200 border-b border-border",
        isSelected
          ? "bg-accent"
          : "hover:bg-secondary/60"
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
            <span>{id.substring(0, 2)}</span>
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp rounded-full border-2 border-background"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-foreground text-fade-truncate">+{id}</h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {lastActive.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {`${messageCount} messages`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
