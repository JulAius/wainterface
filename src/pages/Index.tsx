
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../services/api';
import Conversation from '../components/Conversation';
import ChatInterface from '../components/ChatInterface';
import SidebarHeader from '../components/SidebarHeader';
import TransitionWrapper from '../components/TransitionWrapper';
import Dashboard from '../components/Dashboard';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import NewConversation from '../components/NewConversation';
import MediaSender from '../components/MediaSender';
import TemplateSender from '../components/TemplateSender';

// Filter out this specific phone number
const FILTERED_PHONE_NUMBER = "605370542649440";

const Index = () => {
  // State
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [showTemplateSender, setShowTemplateSender] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showDistributionList, setShowDistributionList] = useState(false);
  const [showMediaSender, setShowMediaSender] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAppointmentsCalendar, setShowAppointmentsCalendar] = useState(false);

  // Fetch conversations
  const { data: conversations = [], refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 5000,
    select: (data) => data
      .filter((conv: any) => conv.id !== FILTERED_PHONE_NUMBER && conv.phoneNumber !== FILTERED_PHONE_NUMBER)
      .map((conv: any) => ({
        ...conv,
        lastActive: new Date(conv.lastActive),
        messageCount: Number(conv.messageCount) || 0,
        displayName: conv.phoneNumber || `+${conv.id}`,
        lastMessage: conv.lastMessage || 'No messages'
      }))
  });

  // Mock modal components that we'd implement in a real app
  const ModalPlaceholder = ({ title, onClose }: { title: string, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-medium mb-4">{title}</h2>
        <p className="text-muted-foreground mb-6">This is a placeholder for the {title} component.</p>
        <div className="flex justify-end">
          <button className="primary-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  // Display Dashboard or Calendar when selected
  if (showDashboard) {
    return <Dashboard onClose={() => setShowDashboard(false)} />;
  }

  if (showAppointmentsCalendar) {
    return <AppointmentsCalendar onClose={() => setShowAppointmentsCalendar(false)} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <TransitionWrapper animation="slide-right" className="w-80 h-full flex flex-col border-r border-border bg-card">
        <SidebarHeader 
          onNewConversation={() => setShowNewConversation(true)}
          onShowDistributionList={() => setShowDistributionList(true)}
          onShowDashboard={() => setShowDashboard(true)}
          onShowCalendar={() => setShowAppointmentsCalendar(true)}
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
              onClick={() => setSelectedChat(conv)}
            />
          ))}
        </div>
      </TransitionWrapper>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <ChatInterface
          selectedChat={selectedChat}
          onShowTemplateSender={() => setShowTemplateSender(true)}
          onShowMediaSender={() => setShowMediaSender(true)}
          onShowDashboard={() => setShowDashboard(true)}
          onShowCalendar={() => setShowAppointmentsCalendar(true)}
        />
      </div>

      {/* Modals */}
      {showTemplateSender && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <TemplateSender 
            selectedChat={selectedChat}
            onClose={() => setShowTemplateSender(false)} 
          />
        </div>
      )}

      {showNewConversation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <NewConversation 
            onClose={() => setShowNewConversation(false)}
            onSuccess={() => {
              setShowNewConversation(false);
              refetch();
            }}
          />
        </div>
      )}

      {showMediaSender && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <MediaSender 
            selectedChat={selectedChat}
            onClose={() => setShowMediaSender(false)} 
          />
        </div>
      )}
      
      {showDistributionList && (
        <ModalPlaceholder 
          title="Distribution Lists" 
          onClose={() => setShowDistributionList(false)} 
        />
      )}
    </div>
  );
};

export default Index;
