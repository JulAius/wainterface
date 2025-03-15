
import React from 'react';
import Conversation from './Conversation';
import SidebarHeader from './SidebarHeader';
import TransitionWrapper from './TransitionWrapper';

interface ConversationListProps {
  conversations: any[];
  selectedChat: any | null;
  onSelectChat: (chat: any) => void;
  onNewConversation: () => void;
  onShowDistributionList: () => void;
  onShowDashboard: () => void;
  onShowCalendar: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedChat,
  onSelectChat,
  onNewConversation,
  onShowDistributionList,
  onShowDashboard,
  onShowCalendar
}) => {
  return (
    <TransitionWrapper animation="slide-right" className="w-80 h-full flex flex-col border-r border-border bg-card">
      <SidebarHeader 
        onNewConversation={onNewConversation}
        onShowDistributionList={onShowDistributionList}
        onShowDashboard={onShowDashboard}
        onShowCalendar={onShowCalendar}
      />
      
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {conversations.map((conv: any) => (
          <Conversation
            key={conv.id}
            id={conv.id}
            lastActive={conv.lastActive}
            messageCount={conv.messageCount}
            isOnline={conv.isOnline}
            isSelected={selectedChat?.id === conv.id}
            onClick={() => onSelectChat(conv)}
          />
        ))}
      </div>
    </TransitionWrapper>
  );
};

export default ConversationList;
