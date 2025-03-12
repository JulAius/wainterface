
import React from 'react';
import { BarChart2, Calendar, PlusCircle, Users, Search } from 'lucide-react';
import IconButton from './IconButton';
import TransitionWrapper from './TransitionWrapper';

interface SidebarHeaderProps {
  onNewConversation: () => void;
  onShowDistributionList: () => void;
  onShowDashboard: () => void;
  onShowCalendar: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  onNewConversation,
  onShowDistributionList,
  onShowDashboard,
  onShowCalendar
}) => {
  return (
    <TransitionWrapper animation="slide-bottom">
      <div className="p-4 bg-card border-b border-border">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-xl font-medium text-foreground">Messages</h1>
          <div className="flex items-center space-x-2">
            <IconButton onClick={onShowDashboard} title="Dashboard">
              <BarChart2 className="w-4 h-4" />
            </IconButton>
            <IconButton onClick={onShowCalendar} title="Calendar">
              <Calendar className="w-4 h-4" />
            </IconButton>
            <IconButton onClick={onNewConversation} variant="primary" title="New Conversation">
              <PlusCircle className="w-4 h-4" />
            </IconButton>
            <IconButton onClick={onShowDistributionList} title="Distribution Lists">
              <Users className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
        
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full py-2 pl-10 pr-4 bg-secondary text-foreground placeholder-muted-foreground rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default SidebarHeader;
