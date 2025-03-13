
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
        "px-4 py-3 cursor-pointer transition-all duration-300 border-b border-white/5",
        isSelected
          ? "bg-accent/70 backdrop-blur-sm"
          : "hover:bg-secondary/60 hover:backdrop-blur-sm"
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground shadow-md transition-all duration-300",
            isSelected ? "bg-whatsapp/20 text-foreground" : "bg-accent/50"
          )}>
            <span>{id.substring(0, 2)}</span>
          </div>
          {isOnline && (
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 bg-whatsapp rounded-full border-2 shadow-neon",
              isSelected ? "border-accent" : "border-card"
            )}></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className={cn(
              "font-medium text-fade-truncate",
              isSelected ? "text-foreground" : "text-foreground/90"
            )}>+{id}</h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {lastActive.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className={cn(
            "text-xs truncate",
            isSelected ? "text-foreground/70" : "text-muted-foreground"
          )}>
            {`${messageCount} messages`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
