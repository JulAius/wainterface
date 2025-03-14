
import React from 'react';
import { BarChart2, Calendar, Trash2, Search, MoreVertical } from 'lucide-react';
import IconButton from './IconButton';
import TransitionWrapper from './TransitionWrapper';

interface ChatHeaderProps {
  chatId: string;
  isOnline?: boolean;
  onShowDashboard: () => void;
  onShowCalendar: () => void;
  onDeleteHistory: () => void;
  isDeleting: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatId,
  isOnline = false,
  onShowDashboard,
  onShowCalendar,
  onDeleteHistory,
  isDeleting
}) => {
  return (
    <TransitionWrapper animation="slide-bottom">
      <div className="p-4 bg-card/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/50 flex items-center justify-center text-muted-foreground mr-3 border border-white/5 shadow-md">
            <span className="text-foreground font-medium">{chatId.substring(0, 2)}</span>
          </div>
          <div>
            <h2 className="font-medium text-foreground">
              +{chatId}
            </h2>
            <span className={`text-xs font-medium ${
              isOnline ? 'text-whatsapp animate-pulse' : 'text-muted-foreground'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <IconButton onClick={onShowCalendar} title="Calendar">
            <Calendar className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={onShowDashboard} title="Dashboard">
            <BarChart2 className="w-4 h-4" />
          </IconButton>
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
