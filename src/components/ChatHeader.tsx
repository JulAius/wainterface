
import React from 'react';
import { BarChart2, Calendar, Trash2, Search, MoreVertical, LucideIcon } from 'lucide-react';
import IconButton from './IconButton';
import TransitionWrapper from './TransitionWrapper';

interface ChatHeaderButton {
  icon: LucideIcon;
  tooltip: string;
  onClick?: () => void;
}

interface ChatHeaderProps {
  chatId?: string;
  phone?: string;
  isOnline?: boolean;
  onShowDashboard?: () => void;
  onShowCalendar?: () => void;
  onDeleteHistory?: () => void; 
  isDeleting?: boolean;
  onOpenMediaModal?: () => void;
  onOpenTemplateModal?: () => void;
  buttons?: ChatHeaderButton[];
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatId,
  phone,
  isOnline = false,
  onShowDashboard,
  onShowCalendar,
  onDeleteHistory,
  isDeleting = false,
  onOpenMediaModal,
  onOpenTemplateModal,
  buttons = []
}) => {
  // Use phone or chatId for display
  const displayId = phone || chatId || '';
  
  return (
    <TransitionWrapper animation="slide-bottom">
      <div className="p-4 bg-card/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/50 flex items-center justify-center text-muted-foreground mr-3 border border-white/5 shadow-md">
            <span className="text-foreground font-medium">{displayId.substring(0, 2)}</span>
          </div>
          <div>
            <h2 className="font-medium text-foreground">
              {displayId.startsWith('+') ? displayId : `+${displayId}`}
            </h2>
            <span className={`text-xs font-medium ${
              isOnline ? 'text-whatsapp animate-pulse' : 'text-muted-foreground'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onOpenTemplateModal && (
            <IconButton onClick={onOpenTemplateModal} title="Templates">
              <BarChart2 className="w-4 h-4" />
            </IconButton>
          )}
          {onOpenMediaModal && (
            <IconButton onClick={onOpenMediaModal} title="Media">
              <BarChart2 className="w-4 h-4" />
            </IconButton>
          )}
          {onShowCalendar && (
            <IconButton onClick={onShowCalendar} title="Calendar">
              <Calendar className="w-4 h-4" />
            </IconButton>
          )}
          {onShowDashboard && (
            <IconButton onClick={onShowDashboard} title="Dashboard">
              <BarChart2 className="w-4 h-4" />
            </IconButton>
          )}
          {onDeleteHistory && (
            <IconButton 
              onClick={onDeleteHistory} 
              disabled={isDeleting}
              variant="danger"
              title="Delete History"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </IconButton>
          )}
          {buttons.map((button, index) => (
            <IconButton 
              key={index} 
              onClick={button.onClick} 
              title={button.tooltip}
            >
              <button.icon className="w-4 h-4" />
            </IconButton>
          ))}
          <IconButton title="Search Messages">
            <Search className="w-4 h-4" />
          </IconButton>
          <IconButton title="More Options">
            <MoreVertical className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default ChatHeader;
